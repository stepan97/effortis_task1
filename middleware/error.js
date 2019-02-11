const logger = require("../startup/logger");

module.exports = function(err, req, res, next){
    const error = {
        error: err.message || "Internal server error. Something failed.",
        status: err.status || 500,
        data: null
    }

    if(error.status >= 500){
        logger.error(error.message, error);
        res.status(error.status).send(error.message);
        process.exit(1);
        return;
    }

    logger.info(error.message, error);
    res.status(err.status).send(error);
};