// var mysql = require('mysql');

// var connection = mysql.createConnection({
// 	host: 'localhost',
// 	user: 'root',
// 	pass: '',
// 	database: 'my_portfolio'

// });

// connection.connect((err) => {
// 	if (err) throw err;
// 	console.log("Database connected");
// });
var ObjectID = require("mongodb").ObjectID;

var MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
    "mongodb://sunil:sunil123@cluster0-shard-00-00-usnej.mongodb.net:27017/my_portfolio?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true",
    (err, database) => {
        if (err) throw err;
        dob = database.db("my_portfolio");
        console.log("connected with mongodb");
    }
);

module.exports.registerUser = function(data, callback) {
    // connection.query("INSERT INTO user_register SET ?", data, callback);

    dob.collection("user_register").insertOne(data, callback);
};

module.exports.userActive = function(data, callback) {
    // connection.query("UPDATE user_register SET user_active = '" + data.user_active + "' WHERE user_token = '" + data.user_token + "'", callback);
    var myquery = { user_token: data.user_token };
    var newvalues = { $set: { user_active: data.user_active } };
    dob.collection("user_register").updateOne(myquery, newvalues, callback);
};



module.exports.isRegisterUser = function(data, callback) {
    if (data.isadmin) {
        var myquery = { user_email: data.user_email };
        dob
            .collection("user_register")
            .find(myquery)
            .toArray(callback);
    } else {
        var myquery = { user_email: data.user_email };
        dob
            .collection("rooms")
            .find(myquery)
            .toArray(callback);
    }
};
// is user is admin 
module.exports.isUserAdmin = function(data, callback) {

    var myquery = { user_email: data.user_email, user_password: data.user_password };

    dob.collection("user_register")
        .find(myquery)
        .toArray(callback);

};

module.exports.Useraccess = function(data, callback) {
    //	connection.query("SELECT * FROM user_register WHERE ?", data, callback);
    // connection.query(`SELECT * FROM user_register WHERE
    // user_register.user_name = '${data.user_name}' && user_register.user_password = '${data.user_password}'
    // && user_register.user_active = '${data.user_active}'`, callback);

    if (data.isadmin) {
        var myquery = {
            user_email: data.user_email,
            user_password: data.user_password,
            user_active: data.user_active,
            isadmin: data.isadmin
        };
        dob
            .collection("user_register")
            .find(myquery)
            .toArray(callback);
    } else {
        var myquery = {
            user_email: data.user_email,
            user_password: data.user_password,
            isadmin: data.isadmin
        };
        dob
            .collection("rooms")
            .find(myquery)
            .toArray(callback);
    }
};

module.exports.addRoom = function(data, callback) {
    // if(data.total_amount != undefined){
    // 	return connection.query("INSERT INTO room_info SET ?", data, callback);
    // }
    // else{
    // connection.query("INSERT INTO rooms SET ?", data, callback);
    dob.collection("rooms").insertOne(data, callback);
    // }
};
module.exports.addRoomDetails = function(data, callback) {
    // return connection.query("INSERT INTO room_info SET ?", data, callback);
    dob.collection("room_info").insertOne(data, callback);
};
module.exports.roomUpdate = function(data, callback) {
    if (data.total_amount != undefined) {
        // return connection.query("UPDATE room_info SET month_name = '" + data.month_name + "', meter_reading_date = '" + data.meter_reading_date + "',meter_reading = '" + data.meter_reading + "',per_unit = '" + data.per_unit + "',bill_amount = '" + data.bill_amount + "',room_rent_date = '" + data.room_rent_date + "',room_rent = '" + data.room_rent + "',total_amount = '" + data.total_amount + "',advance_payment = '" + data.advance_payment + "',due_amount = '" + data.due_amount + "',status = '" + data.status + "' WHERE room_id = '" + data.room_id + "' && login_user_id = '" + data.login_user_id + "' && month_id = '" + data.month_id + "'", callback);
        // var myquery = { room_id:data._id,login_user_id:data.login_user_id,month_id:data.month_id};
        if (data.month_id == undefined) {
            var myquery = {
                _id: ObjectID(data._id),
                login_user_id: data.login_user_id,
                room_id: data.room_id
            };
            var newvalues = {
                $set: {
                    month_name: data.month_name,
                    pre_balance: data.pre_balance,
                    meter_reading_date: data.meter_reading_date,
                    meter_reading: data.meter_reading,
                    per_unit: data.per_unit,
                    bill_amount: data.bill_amount,
                    room_rent_date: data.room_rent_date,
                    room_rent: data.room_rent,
                    total_amount: data.total_amount,
                    pay_amount: data.pay_amount,
                    advance_amount: data.advance_amount,
                    due_amount: data.due_amount
                        // status: data.status
                }
            };
            dob.collection("room_info").updateOne(myquery, newvalues, callback);
        } else {
            var myquery = {
                _id: ObjectID(data.month_id),
                login_user_id: data.login_user_id,
                room_id: data.room_id
            };
            var newvalues = {
                $set: {
                    month_name: data.month_name,
                    pre_balance: data.pre_balance,
                    meter_reading_date: data.meter_reading_date,
                    meter_reading: data.meter_reading,
                    per_unit: data.per_unit,
                    bill_amount: data.bill_amount,
                    room_rent_date: data.room_rent_date,
                    room_rent: data.room_rent,
                    total_amount: data.total_amount,
                    pay_amount: data.pay_amount,
                    advance_amount: data.advance_amount,
                    due_amount: data.due_amount,
                    // status: data.status,
                    total_units: data.total_units
                }
            };
            dob.collection("room_info").updateOne(myquery, newvalues, callback);
        }
    } else {
        // connection.query("UPDATE rooms SET full_name = '" + data.full_name + "', room_patner = '" + data.room_patner + "',room_number = '" + data.room_number + "',room_metter_reading = '" + data.room_metter_reading + "',room_user_in_date = '" + data.room_user_in_date + "',user_desicrption = '" + data.user_desicrption + "',room_user_id_proof = '" + data.room_user_id_proof + "' WHERE room_id = '" + data.room_id + "'", callback);
        var myquery = { _id: ObjectID(data._id) };
        // dob.collection('rooms').find({"_id":ObjectID(data._id)}).toArray(callback);
        var newvalues = {
            $set: {
                full_name: data.full_name,
                room_patner: data.room_patner,
                room_number: data.room_number,
                room_metter_reading: data.room_metter_reading,
                room_user_in_date: data.room_user_in_date,
                user_desicrption: data.user_desicrption,
                user_email: data.user_email,
                advancedPaid: data.advancedPaid,
                user_password: data.user_password,
                room_user_id_proof: data.room_user_id_proof
            }
        };
        dob.collection("rooms").updateOne(myquery, newvalues, callback);
    }
};

module.exports.deleteRoom = async function(data, callback) {
    if (data.total_amount != undefined) {
        // return connection.query("DELETE FROM room_info WHERE month_id = '" + data.month_id + "'", callback);
        await dob
            .collection("room_info")
            .deleteOne({ _id: ObjectID(data._id) }, callback);
    } else {
        // connection.query("DELETE FROM rooms WHERE room_id = '" + data.room_id + "'", callback);
        await dob
            .collection("rooms")
            .deleteOne({ _id: ObjectID(data._id) }, callback);
    }

    // console.log("DELETE FROM rooms WHERE id = '"+data.id+"'");
};
module.exports.deleteUserInfo = async function(data, callback) {

    // return connection.query("DELETE FROM room_info WHERE month_id = '" + data.month_id + "'", callback);
    await dob
        .collection("user_register")
        .deleteOne({ _id: ObjectID(data._id) }, callback);

    // console.log("DELETE FROM rooms WHERE id = '"+data.id+"'");
};

module.exports.FetchAllRoom = function(data, callback) {
    // connection.query(`SELECT * FROM rooms INNER JOIN user_register ON user_register.id = rooms.login_user_id
    // WHERE user_register.user_token = '${data.user_token}'`, callback);
    var myquery = { login_user_id: data._id };
    dob
        .collection("rooms")
        .find(myquery)
        .toArray(callback);
};

module.exports.FetchRoomDetail = function(data, callback) {
    // connection.query(`SELECT * FROM rooms INNER JOIN user_register ON user_register.id = rooms.login_user_id
    // WHERE rooms.room_id = '${data.room_id}' && user_register.id = '${data.id}'`, callback);
    // login_user_id:data._id,
    if (data.isadmin) {
        var myquery = { _id: ObjectID(data.room_id), login_user_id: data._id };
        dob
            .collection("rooms")
            .find(myquery)
            .toArray(callback);
    } else {
        var myquery = {
            _id: ObjectID(data.room_id),
            login_user_id: data.login_user_id,
            user_password: data.user_password
        };
        dob
            .collection("rooms")
            .find(myquery)
            .toArray(callback);
    }
};

module.exports.FetchMonthDetail = function(data, callback) {
    // 	connection.query(`SELECT * FROM room_info INNER JOIN user_register ON user_register.id = room_info.login_user_id
    //  WHERE room_info.room_id = '${data.room_id}'`, callback);
    var myquery = { room_id: data._id, login_user_id: data.login_user_id };
    dob
        .collection("room_info")
        .find(myquery)
        .toArray(callback);
};

module.exports.FetchAdminUsersDetail = function(data, callback) {
    // connection.query(`SELECT * FROM rooms INNER JOIN user_register ON user_register.id = rooms.login_user_id
    // WHERE user_register.user_token = '${data.user_token}'`, callback);
    // var myquery = { login_user_id: data._id };
    dob
        .collection("user_register")
        .find()
        .toArray(callback);
};

module.exports.sendResponse = function(success, res) {
    if (success) {
        res.send({ success: "true" });
    } else {
        res.send({ success: "false" });
    }
};