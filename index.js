var express = require('express');
var path    = require("path");
var bodyParseer = require('body-parser');
var app = express();

var port = process.env.PORT || 3000;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(bodyParseer.json());
app.use(bodyParseer.urlencoded({extended:false}));


 


var port = process.env.PORT || 3000;


app.use(express.static(__dirname + '/view'));

app.use(require('./api/user_api'));
 
 

app.get('/', function (req, res) {
  //res.send('Hello World!');
  res.redirect('home');
//  res.render('/view/home.html');
  //res.sendFile(path.join(__dirname+'/view/index.html'));

  
});

app.get('/home',(req, res)=>{
//   res.sendFile(path.join(__dirname+'/view/home.html'));
     res.sendFile(path.join(__dirname+'/view/index.html'));
//   res.redirect('home');
  
});

app.listen(port);