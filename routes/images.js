const router = require("express").Router();
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const {Image, validate} = require("../models/Image");
const Joi = require("joi");
const removeFile = require("fs").unlink; // for deleting an image

// returns all images shared with current user
router.get("/sharedWithMe", auth, async (req, res, next) => {
    const images = await Image.find({
        whoCanView: {$in: [req.user._id]}
    })
    .populate("owner", "_id username")
    .select("-whoCanView -__v");

    res.send({
        error: null,
        data: images
    });
});

// returns an image (if it's shared with current user)
router.get("/sharedWithMe/:id", auth, validateObjectId, async (req, res, next) => {
    const image = await Image.findOne({
        whocanView: {$in: [req.user._id]}
    })
    .populate("owner", "_id username");

    if(!image){
        const err = new Error("Image not found.");
        err.status = 400;
        return next(err);
    }

    res.send({
        error: null,
        data: image
    });
});

// return images that the user shared with others
router.get("/myShares", auth, async (req, res, next) => {
    const images = await Image.find({
        owner: req.user._id,
        whoCanView: {$gt: []}
    })
    .select("-__v")
    .populate("whoCanView", "_id username")
    .populate("owner", "_id username");

    res.send({
        error: null,
        data: images
    });
});

router.get("/", auth, async (req, res, next) => {
    const images = await Image.find({owner: req.user._id})
        .select("-__v")
        .populate("owner", "username")
        .populate("whoCanView", "username");
        // .populate("owner", "-__v -password");

    res.send({
        error: null,
        data: images
    });
});

// get image from db (only images that were uploaded by current user are returned)
router.get("/:id", auth, validateObjectId, async (req, res, next) => {
    const image = await Image.findOne({
        _id: req.params.id,
        owner: req.user._id
    })
    .select("-__v -owner");

    if(!image){
        const err = new Error("Cannot get this image / Access denied.");
        err.status = 400;
        return next(err);
    }

    res.send({
        error: null,
        data: image
    });
});

// upload and save image file to server
router.post("/", auth, async (req, res, next) => {
    // uploaded image
    const imageFile = req.files.image;

    // create unique path for uploaded image
    const date = Date.now();
    const path = `/static/Client_${req.user._id}/${date}_${imageFile.name}`;

    // move file to the path
    imageFile.mv(`.${path}`, async (err) => {
        if(err){
            const error = new Error("Internal server error. Could not upload image.");
            error.status = 500;
            return next(err);
        }

        const obj = {
            title: "No title",
            location: "No location",
            date: Date.now(),
            url: path,
            owner: req.user._id,
            whoCanView: []
        };

        const {error} = validate(obj);
        if(error) {
            const err = new Error(error.details[0].message);
            err.status = 400;
            return next(err);
        }

        // saving to db
        const image = new Image(obj);
        await image.save();

        // respond the image id
        res.send({
            error: null,
            data: image._id
        });
    });
});

// update an image document in db
router.put("/:id", auth, validateObjectId, async (req, res, next) => {
    
    // validate request body for valid json data
    const {error} = validateImageUpdate(req.body);
    if(error) {
        const err = new Error(error.details[0].message);
        err.status = 400;
        return next(err);
    }
    
    // update image in database
    const image = await Image.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            location: req.body.location,
            // owner: req.user._id,
            whoCanView: req.body.whoCanView
        }
    }, 
    {
        where:{ owner: req.user._id },
        new: true,
    })
        .select("-__v")
        .populate("owner", "_id username")
        .populate("whoCanView", "_id username");

    // if no image was found matching query
    if(!image) {
        const err = new Error("Image was not found.");
        err.status = 400;
        return next(err);
    }

    res.send({
        error: null,
        data: image
    });
});

// delete image document from db and image file from file system
router.delete("/:id", auth, validateObjectId, async (req, res, next) => {
    // delete image by id
    // const image = await Image.findById(req.body.id);
    const image = await Image.findByIdAndDelete(req.params.id, {
        where: { owner: req.user._id }
    });
    if(!image) {
        const err = new Error("Image with given id was not found.");
        err.status = 400;
        return next(err);
    }

    removeFile(`.${image.url}`, err => {
        if(err) {
            const error = new Error("Could not delete file.");
            err.status = 500;
            return next(err);
        }

        res.send({
            error: null,
            data: image
        });
    });
});

function validateImageUpdate(image){
    const schema = {
        title: Joi.string().required(),
        location: Joi.string().required(),
        whoCanView: Joi.array().items(Joi.objectId()).required()
    }

    return Joi.validate(image, schema);
}

// check if someone has access to file
async function hasAccessToImage(req, res, next){
    const image = await Image.findOne({
        url: req.originalUrl,
        $or: [
            { owner : { $in : [req.user._id] } },
            { whoCanView : { $in : [req.user._id] } }
        ]
    });

    if(!image){ 
        const err = new Error("Image not found / access denied.");
        err.status = 400;
        return next(err);
    }

    next();
}

module.exports.imagesRouter = router;
module.exports.hasAccessToImage = hasAccessToImage;