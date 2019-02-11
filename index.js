const express = require('express');
const app = express();
const Joi = require("joi");
Joi.objectId = require("joi-objectid");
// const morgan = require("morgan");
// app.use(morgan("tiny"));
const winston = require("./startup/logger");

process.on("uncaughtException", ex => {
    console.log("uncaugntException:", ex);
    // log the exception
    process.exit(1);
});

process.on("unhandledRejection", ex => {
    console.log("unhandledRejection: ", ex);
    // log the promise rejection
    process.exit(1);
});


require("./startup/db")();
require('./startup/routes')(app);
require("./startup/config")();
require("./startup/prod")(app);
require("./startup/createStaticFolder")();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
// () => winston.info(`Listening on port ${port}...`)