const express = require("express");
const users = require("../routes/users");
const {imagesRouter, hasAccessToImage} = require("../routes/images");
const fileUpload = require('express-fileupload');
const error = require("../middleware/error");
const auth = require("../middleware/auth");
const logger = require("./logger");
require("express-async-errors");

module.exports = function(app){
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    // allow cors
    app.use(function (req, res, next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use("/static", auth, hasAccessToImage, express.static("static"));
    app.use("/api/users", users);
    app.use(fileUpload());
    app.use("/api/images", imagesRouter);

    app.use("*", (req, res, next) => {
        res.status(404).send({
            data: null,
            error: "Not found."
        });
    });

    app.use(error);
}