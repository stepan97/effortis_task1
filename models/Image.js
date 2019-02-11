const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const imageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    url: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    whoCanView: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
        required: true    
    }]
});

function validate(image){
    const schema = {
        title: Joi.string().required(),
        location: Joi.string().required(),
        date: Joi.date(), // set by server (POST)
        url: Joi.string().required(), // set by server (POST)
        owner: Joi.objectId().required(),
        whoCanView: Joi.array().items(Joi.objectId())
    }

    return Joi.validate(image, schema);
}

module.exports.Image = mongoose.model("Image", imageSchema);
module.exports.validate = validate;
// module.exports.validateShare = validateShare;