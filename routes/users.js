const router = require("express").Router();
const {User, validate} = require("../models/User");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const folderCreator = require("../middleware/folderCreator");
const validateObjectId = require("../middleware/validateObjectId");
const rimraf = require("rimraf"); // for deleting user folder with all it's content

// current user profile
router.get("/me", auth, validateObjectId, async (req, res, next) => {
    const user = await User.findById({_id: req.user._id}).select("-password -__v");
    res.send(user);
});

// Sign up
router.post("/signup", async (req, res, next) => {
    const {error} = validate(req.body);
    if(error){
        const err = new Error(error.details[0].message);
        err.status = 400;
        return next(err);
    }

    let user = await User.findOne({username: req.body.username});
    if(user){
        const err = new Error("User already registered.");
        err.status = 400;
        return next(err);
    }

    user = new User(_.pick(req.body, ["_id", "username", "password"]));

    // create directory for the user
    const folderCreationError = await folderCreator(user._id);
    if(folderCreationError){
        const err = new Error(folderCreationError);
        err.status = 500;
        return next(err);
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = user.generateAuthToken();

    res.send({
        error: null,
        data: token
    });
});

// Sign in
router.post("/signin", async (req, res, next) => {
    const {error} = validate(req.body);
    if(error) {
        const err = new Error(error.details[0].message);
        err.status = 400;
        return next(err);
    } 

    // check if user is registered or not
    let user = await User.findOne({username: req.body.username});
    if(!user){
        const err = new Error("Invalid username or password");
        err.status = 400;
        return next(err);
    }

    // check password
    const isValid = await bcrypt.compare(req.body.password, user.password);
    if(!isValid) {
        const err = new Error("Invalid username or password");
        err.status = 400;
        return next(err);
    }

    const token = user.generateAuthToken();

    res.send(token);
});

// Delete Account
router.delete("/", auth, async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.user._id)
        .select("-password -__v");
    if(!user) {
        const err = new Error("Could not delete user.");
        err.status = 400;
        return next(err);
    }


    rimraf(`./static/Client_${user._id}`, error => {
        if(error){
            const err = new Error(error);
            err.status = 500;
            return next(error);
        }

        res.send({
            error: null,
            data: user
        });
    });
});

module.exports = router;