const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.methods.generateAuthToken = function(){
        const token = jwt.sign({
            _id: this._id,
            username: this.username
        }, config.get("jwtPrivateKey"));

        return token;
}

function validate(user){
    const schema = {
        username: Joi.string().required(),
        password: Joi.string().required()
    };

    return Joi.validate(user, schema);
}

console.log("User database modeled.");

module.exports.User = mongoose.model("User", userSchema);
module.exports.validate = validate;