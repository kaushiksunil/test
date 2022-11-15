var express = require("express");
var hat = require("hat");
var encript = require("md5");
var path = require("path");
const multer = require("multer");
var app = express();
var fs = require("fs");
var nodemailer = require("nodemailer");
var bodyParser = require("body-parser");
var user = require("../models/user_modeldata");

var tempfile = require('tempfile');
var xlsx = require("xlsx");
var excel = require('exceljs');




app.use(bodyParser.json({
    limit: "10mb"
}));
app.use(bodyParser.urlencoded({
    limit: "10mb",
    extended: true
}));

// enable gmail account to send email from nodemailer use blow url to send email
// https://accounts.google.com/DisplayUnlockCaptcha

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var smtpConfig = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
        user: "rk8378173@gmail.com",
        pass: "Ravi#123456"
    }
    //tls: {
       // // do not fail on invalid certs
       // rejectUnauthorized: false
   // }
};
var smtpTransport = nodemailer.createTransport(smtpConfig);
var utoken, mailOptions, host, link;

app.post("/registerUser", function(req, res) {
    var expendData = req.body;
    var data = expendData.UserInfo;
    var userToken = hat();
    var haspass = encript(data.password);
    const isadmin = 1;
    data = {
        first_name: data.fname,
        user_token: userToken,
        user_email: data.email,
        user_name: data.username,
        user_password: haspass,
        user_active: 0,
        isadmin: 1
    };

    // console.log(mailOptions);

    user.isRegisterUser(data, (err, results) => {
        if (err) throw err;
        var registerUser = [];
        registerUser = results;

        registerUser.forEach((val, index) => {
            console.log(val);
            if (val.user_email == data.user_email) {
                res.json("email exists");
            }
        });

        if (registerUser == "") {
            utoken = data.user_token;
            host = req.get("host");
            link = "http://" + req.get("host") + "/verify?user_token=" + utoken;

            mailOptions = {
                to: data.user_email,
                subject: "Please confirm your Email account",
                html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
                    link +
                    ">Click here to verify</a>"
            };
            smtpTransport.sendMail(mailOptions, function(error, response) {
                if (error) {
                    console.log(error);
                    res.end("error");
                } else {
                    // console.log("Message sent: " + response.user_email);
                    // res.end("sent");
                    user.registerUser(data, function(err, info) {
                        if (err) throw err;
                        res.json(data);
                    });
                }
            });
        }
    });
});

// email verification

app.get("/verify", function(req, res) {
    // console.log(req.protocol + ":/" + req.get('host'));
    if (req.protocol + "://" + req.get("host") == "http://" + host) {
        // console.log("Domain is matched. Information is from Authentic email");
        if (req.query.user_token == utoken) {
            console.log("email is verified");
            // res.end(`<h1>Email ${mailOptions.to} is been Successfully verified</h1>`);
            var data = {
                user_token: utoken,
                user_active: 1
            };
            //    console.log(data);
            user.userActive(data, (err, results) => {
                if (err) throw err;
                var resultsBool = results.affectedRows > 0 ? true : false;
                // user.sendResponse(true, res);
                res.end(
                    `<h1>Your Email ${
            mailOptions.to
          } has been Successfully verified</h1><p>Click to login <a href="https://sunilkaushik.herokuapp.com">Loing</a></p>`
                );
            });
        } else {
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    } else {
        res.end("<h1>Request is from unknown source");
    }
});

// email verification End

// app.post('/userActive', (req, res) => {
//     var registerUserInfo = req.body.user_token;
//     //    console.log(registerUserInfo);
//     var data = {
//             user_token: registerUserInfo,
//             user_active: 1
//         }
//         //    console.log(data);
//     user.userActive(data, (err, results) => {
//         if (err) throw err;
//         var resultsBool = (results.affectedRows > 0) ? true : false;
//         user.sendResponse(true, res);
//     });
// });

// app.post('/fetchUpdatedPfo', (req, res) => {
//     data = req.body.reciveUserId;
//     user.FetchUpdatedUsers(data, (err, result) => {
//         if (err) throw err;
//         res.json(result);
//     });

// });

app.post("/LoginUser", (req, res) => {
    var userLoginInfo = req.body;
    var data = userLoginInfo.loginuser;
    data = { user_email: data.user_email, user_password: encript(data.user_password) };
    var useractive = 1;
    var is_admin = 0;
    user.isUserAdmin(data, (err, results) => {
        var isterAdminUser = [];
        isterAdminUser = results;

        isterAdminUser.forEach((val, index) => {
            if (val.user_email == data.user_email) {
                // res.json("email exists");
                is_admin = parseInt(val.isadmin);
            }
        });


        // var is_admin = parseInt(data.isadmin);
        if (is_admin) {
            var userpass = data.user_password;
            var useractive = 1;
            data = {
                user_email: data.user_email,
                user_password: userpass,
                user_active: useractive,
                isadmin: is_admin
            };
            //        console.log(data);
            user.Useraccess(data, (err, results) => {
                if (err) throw err;
                results = results.map(itm => {
                    // delete itm.user_token;
                    delete itm.user_password;
                    return itm;
                })
                res.json(results);
            });
        } else {
            var userpass = data.user_password;
            // var userpass = encript(parseInt(data.user_password));
            var useractive = 1;
            data = {
                user_email: data.user_email,
                user_password: userpass,
                user_active: useractive,
                isadmin: is_admin
            };
            //        console.log(data);
            user.Useraccess(data, (err, results) => {
                if (err) throw err;
                // results = results.map(itm => {
                //     // delete itm.user_token;
                //     // itm.user_password = data.user_password;
                //     return itm;
                // })
                res.json(results);
            });
        }
    });
});

const handleError = (err, res) => {
    res
        .status(500)
        .contentType("text/plain")
        .end("Oops! Something went wrong!");
};
// const upload = multer({
//     dest: "./view/upload_profile"
// });
// user added room
app.post("/userAddRoom", (req, res) => {
    // app.post('/userAddRoom', upload.single("file"), (req, res) => {
    var userRoom = req.body;
    // const tempPath = req.file.path;
    // var fileName = req.file.filename +'.'+ req.file.originalname.split('.')[1];

    // function to encode file data to base64 encoded string
    // function base64_encode(tempPath) {
    //     // read binary data
    //     var bitmap = fs.readFileSync(tempPath);
    //     // convert binary data to base64 encoded string
    //     return new Buffer(bitmap).toString('base64');
    // }
    // var bash64_img =base64_encode(tempPath);

    // var imageSize = 300000;
    // const targetFullPath = path.join(__dirname, "./../view/upload_profile/" + fileName);
    // if ((path.extname(req.file.originalname).toLowerCase() === ".png"||".jpg") && (req.file.size <= imageSize)) {
    //     fs.rename(tempPath, targetFullPath, err => {
    //         if (err) throw err;
    //         console.log("image uploaded");

    //     });
    // }
    // else if (!(req.file.size <= imageSize)) {
    //     fs.unlink(tempPath, err => {
    //         if (err) return handleError(err, res);
    //        res.json("file size is greater the 207.854 kb!");
    //    });
    // }

    // else {
    //     fs.unlink(tempPath, err => {
    //         if (err) return handleError(err, res);

    //         res
    //             .status(403)
    //             .contentType("text/plain")
    //             .end("Only .png files are allowed!");
    //     });
    // }
    const isadmin = 0;
    userRoom["room_user_id_proof"] = userRoom.room_user_id_proof;
    let randomPass = Math.floor(Math.random() * 1000000 + 1);
    userRoom["user_passwordDecripted"] = randomPass;
    userRoom["user_password"] = encript(`${randomPass}`);

    userRoom["isadmin"] = isadmin;
    data = userRoom;

    if (data.user_email == undefined) {
        user.addRoom(data, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } else {
        user.isRegisterUser(data, (err, results) => {
            if (err) throw err;
            var registerUser = [];
            registerUser = results;

            registerUser.forEach((val, index) => {
                console.log(val);
                if (val.user_email == data.user_email) {
                    res.json("email exists");
                }
            });

            if (registerUser == "") {
                // utoken = data.user_token;
                host = req.get("host");
                // link = "http://" + req.get('host') + "/verify?user_token=" + uvar userpass = encript(parseInt(data.password));token;

                mailOptions = {
                    to: data.user_email,
                    subject: "Your Login Password",
                    html: `Hello ${data.full_name}, <a href="https://sunilkaushik.herokuapp.com">Click here to login to see your monthly pay details</a> <br>Your Login Password is: <h3> ${
                        data.user_passwordDecripted
          }  </h3>`
                };
                smtpTransport.sendMail(mailOptions, function(error, response) {
                    if (error) {
                        console.log(error);
                        res.end("error");
                    } else {
                        // console.log("Message sent: " + response.user_email);
                        // res.end("sent");
                        user.addRoom(data, (err, results) => {
                            if (err) throw err;
                            res.json(results);
                        });
                    }
                });
            }
        });
    }

    // user.addRoom(data, (err, results) => {
    //     if (err) throw err;
    //     res.json(results);
    // });
});

app.post("/addMonthDetail", (req, res) => {
    var userRoom = req.body;
    data = userRoom;
    user.addRoomDetails(data, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post("/fetchAllRoom", (req, res) => {
    var loginUser = req.body;
    data = loginUser;
    user.FetchAllRoom(data, (err, result) => {
        if (err) throw err;
        // console.log('all rooms', result);

        // var newWB = xlsx.utils.book_new();
        // var newWS = xlsx.utils.json_to_sheet(result);
        // xlsx.utils.book_append_sheet(newWB, newWS, "New Data")

        // xlsx.writeFile(newWB, "New Data file.xlsx");

        result = result.map(itm => {
            // delete itm.user_token;
            delete itm.user_password;
            return itm;
        });




        res.json(result);

        //        data ={'user':'sunil kaushik'};
        //        res.send(data);
    });
});

app.post("/fetchRoomDetail", (req, res) => {
    var roomDetails = req.body;
    data = roomDetails;
    user.FetchRoomDetail(data, (err, result) => {
        if (err) throw err;
        result = result.map(itm => {
            delete itm.user_password;
            delete itm.user_passwordDecripted;
            return itm;
        })
        res.json(result);
    });
});

app.post("/fetchMonthDetails", (req, res) => {
    var roomDetails = req.body;
    data = roomDetails;
    user.FetchMonthDetail(data, (err, result) => {
        if (err) throw err;

        var oneObj = result;
        res.json(result);
    });
});

app.post("/exportByUserData", (req, res) => {
    var roomDetails = req.body;
    data = roomDetails;
    user.FetchMonthDetail(data, (err, result) => {
        if (err) throw err;

        var oneObj = result;



        for (i = 0; i < oneObj.length; i++) {
            delete oneObj[i].login_user_id;
            delete oneObj[i].room_id;
            delete oneObj[i]._id;
            delete oneObj[i].status;

        }

        // if (oneObj.length > 0) {
        //     oneObj[0]['user_message'] = data.user_desicrption;
        //     var newWB = xlsx.utils.book_new();
        //     var newWS = xlsx.utils.json_to_sheet(oneObj);
        //     xlsx.utils.book_append_sheet(newWB, newWS, `${data.full_name} room ${data.room_user_in_date}`);
        //     xlsx.writeFile(newWB, `${data.full_name}Room${data.room_number}.xlsx`);

        //     res.json({
        //         status: 'Success',
        //         obj: `${data.full_name}Room${data.room_number}.xlsx`
        //     });
        // } else {
        //     res.json({
        //         status: 'Success',
        //         obj: `${data.full_name}Room${data.room_number}.xlsx`
        //     });
        // }


        if (oneObj.length > 0) {
            oneObj[0]['user_message'] = data.user_desicrption;
            var newWB = xlsx.utils.book_new();
            var newWS = xlsx.utils.json_to_sheet(oneObj);
            // xlsx.utils.book_append_sheet(newWB, newWS, `${data.full_name} room ${data.room_user_in_date}`);
            xlsx.utils.book_append_sheet(newWB, newWS, `${data.full_name} room ${data.room_user_in_date.split('/').join('-')}}`);

            var tempFilePath = tempfile(`${data.full_name}Room${data.room_number}.xlsx`);
            console.log("tempFilePath : ", tempFilePath);
            xlsx.writeFile(newWB, tempFilePath);
            res.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": "attachment; filename=" + data.full_name
            });
            fs.createReadStream(tempFilePath).pipe(res);

        } else {

            res.json({
                status: 'no record',
            });
        }

    });
});


app.post("/updateRoom", (req, res) => {
    var updatedRoomInfo = req.body;
    let randomPass = Math.floor(Math.random() * 1000000 + 1);
    updatedRoomInfo["user_passwordDecripted"] = randomPass;
    updatedRoomInfo["user_password"] = encript(`${randomPass}`);
    data = updatedRoomInfo;

    if (!(data.month_id === undefined)) {
        user.roomUpdate(data, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } else if (data.user_email === undefined || data.user_email === "" || data.user_email === null) {
        user.roomUpdate(data, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } else {
        host = req.get("host");
        // link = "http://" + req.get('host') + "/verify?user_token=" + utoken;
        mailOptions = {
            to: data.user_email,
            subject: "Your Login Password",
            html: `Hello, <a href="https://sunilkaushik.herokuapp.com">Click here to login</a> <br>Your Login Password is: <h3> ${
        data.user_passwordDecripted
      }  </h3>`
        };
        smtpTransport.sendMail(mailOptions, function(error, response) {
            if (error) {
                console.log(error);
                res.end("error");
            } else {
                // console.log("Message sent: " + response.user_email);
                // res.end("sent");
                user.roomUpdate(data, (err, results) => {
                    if (err) throw err;
                    res.json(results);
                });
            }
        });
    }

    // user.roomUpdate(data, (err, results) => {
    //     if (err) throw err;
    //     res.json(results);
    // })
});


app.post("/updateActiveStatus", (req, res) => {
    var data = req.body;
    user.userActive(data, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
})


app.post("/deleteRoom", (req, res) => {
    var deletedRommInfo = req.body;
    data = deletedRommInfo;
    user
        .deleteRoom(data, (err, results) => {
            if (err) throw err;
            res.json("Room is deleted");
        })
        .catch(err => {
            console.log(err);
        });
});
app.post("/deleteUser", (req, res) => {
    var deletedRommInfo = req.body;
    data = deletedRommInfo;
    user.deleteUserInfo(data, (err, results) => {
            if (err) throw err;
            res.json("Room is deleted");
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/fetchAminUsersDetails", (req, res) => {
    // var roomDetails = req.body;
    // data = roomDetails;
    user.FetchAdminUsersDetail('', (err, result) => {
        if (err) throw err;
        result = result.map(itm => {
            // delete itm.systemAdmin;
            delete itm.user_password;
            return itm;
        });
        res.json(result);
    });
});

module.exports = app;