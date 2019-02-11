const config = require("config");

module.exports = function(){
    if(!config.get("jwtPrivateKey")) throw new Error("FATAL ERROR: jwtPriateKey is not defined.");
    if(!config.get("dbConStr")) throw new Error("FATAL ERROR. DB connection string is not defined.");
};