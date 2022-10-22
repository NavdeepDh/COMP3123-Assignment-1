var express = require("express");
var authRouter = require("./auth");
var employeeRouter = require("./employee");

var app = express();

app.use("/user/", authRouter);
app.use("/emp/", employeeRouter);

module.exports = app;