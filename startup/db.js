const mongoose = require("mongoose");
const config = require("config");

module.exports = function(){
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);

    mongoose.connect(config.get("dbConStr"), {useNewUrlParser: true})
        .then(() => console.log("Connected to db..."))
        .catch(err => console.log("Could not connect to db: "));
        // .catch(err => console.log("Could not connect to db: ", err));
}