'use strict';

// Configure Express
const express = require('express');
const bodyParser = require('body-parser');
var path = require("path");
var favicon = require("serve-favicon");


var logger = require("morgan");
var fs = require("fs");
// var log = require('../shared-modules/logs-helper/logging');
// var logDirectory = path.join(__dirname, 'logs')
// var rfs = require('rotating-file-stream') //file rotating module
// fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// // create a rotating write stream
// var accessLogStream = rfs('access.log', {
//   interval: '1d', // rotate daily
//   path: logDirectory
// })

global.__base = __dirname + "/";
var compression = require("compression");
var helmet = require("helmet");

//log.info('Starting')
var app = express();
app.use(helmet());


// view engine setuppm2
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, "web", "css/images/favicon.ico")));

// app.use(logger('tiny', {
//   stream: accessLogStream
// }));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST,PUT"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  if (req.method === "OPTIONS") {
    res.status(200).send("Allow");
  } else {
    next();
  }
});


app.get("/", function (req, res) {
  res.sendFile("index.html", { root: path.join(__dirname, "web") });
});

app.use(express.static(path.join(__dirname, "web")));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send (err.message);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send (err.message);
});

// Start the servers
app.listen(5015);
console.log('Dashboard service started on port 5015');
