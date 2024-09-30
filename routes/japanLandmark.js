express = require("express");
const router = express.Router(); // use Router for short cutting the path.
const JapanLandmark = require("../models/JapanLandmark");
const catchAsync = require("../utils/catchAsync");
const {validateJapanLandmark, isLoggedIn, isAuthor} = require("../utils/middleware");
const seedHelpers = require("../dataset/seedHelpers");
const multer = require("multer");// this is added as a middleware to parse the multipart data. 
// in the new.ejs of class, this is added enctype="multipart/form-data"
// now to retrieve the data from the multipart, we have to use multer to parse. 
const { storage, cloudinary } = require('../cloudinary'); // this is the destination we wanna store as storage for multipart, uploaded files. 
// we can use the service cloudinary, or aws for storing the image since mongo can't store image which is too big. 
const upload = multer({ storage });
require('dotenv').config();

// use geocoding for setting and accessing the map - npm install @mapbox/mapbox-sdk
// https://github.com/mapbox/mapbox-sdk-js/blob/main/docs/services.md#forwardgeocode
//https://github.com/mapbox/mapbox-sdk-js
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); // mapbox provides multi services and we use geocoding one. 
const mapBoxToken = process.env.MAPBOX_TOKEN; // pass token here, retrieve. 
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // initialize with the token. 

// now here instead of app.get(), change to the router.get() to access to the router path. 
router.get("/", catchAsync(async(req, res) =>{
    const japanLandmark = await JapanLandmark.find({});
    res.render("japanLandmark/show", {japanLandmark});
}));

router.get("/new", isLoggedIn, (req, res) =>{
    res.render("japanLandmark/new", {descriptors: seedHelpers.descriptors });
});

router.post("/", isLoggedIn, upload.array('images'), validateJapanLandmark, catchAsync(async(req, res, next) =>{
    // check this for geocoder method https://github.com/mapbox/mapbox-sdk-js/blob/main/docs/services.md#forwardgeocode
    const geoData = await geocoder.forwardGeocode({
        query: req.body.JapanLandmark.location,
        limit: 1
    }).send()
    // using upload. will parse the data from the body. also, this ("image") is the field we are looking for. 
    // in the new.js we provided name="image"  
    // so now we have to specify the same name to access to the same things and parse the data and add in the body. 
    // there are upload.single() and upload.array() single expect only 1 image, but array can have multiple. like multiple is also specified in the ejs, 
    // if we want to upload many, then include multiple, and do upload.array();
    const japanLandmark = new JapanLandmark(req.body.japanLandmark);
    japanLandmark.geometry = geoData.body.features[0].geometry; 
    // geoData returns many property so access like this. it's array so []

    japanLandmark.images = req.files.map(f => ({url:f.path, filename: f.filename}));
    // when uploading files, path and filename is returned. so assign them to the correct key. 
    // by setting up this, images:[ _id: , url:, filename: ] is set properly in the mongo. 
    japanLandmark.author = req.user._id; // assign the user who create a new landmark to author so that later we can check currentUser = japanLandmark.author.username 
    await japanLandmark.save();
    req.flash("success", "Successfully made a new landmark!")
    res.redirect(`/japanLandmark/${japanLandmark._id}`);
}));

router.get("/:id", catchAsync(async(req, res) =>{
try {
    const japanLandmark = await JapanLandmark.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("author")
        .populate("images");

    if (!japanLandmark) {
        req.flash("error", "Cannot find that landmark!");
        return res.redirect("/japanLandmark");
    }
    console.log("JapanLandmark:", japanLandmark);
    console.log("Reviews:", japanLandmark.reviews);
    res.render("japanLandmark/details", { japanLandmark });
} catch (err) {
    console.error("Error:", err);
    req.flash("error", "An error occurred while fetching landmark details");
    res.redirect("/japanLandmark");
}
}));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async(req, res) =>{
    const japanLandmark = await JapanLandmark.findById(req.params.id);
    if(!japanLandmark){
        req.flash("error", "Cannot find that landmark!");
        return res.redirect("/japanLandmark");
    }
    const descriptors = seedHelpers.descriptors
    res.render("japanLandmark/edit", {japanLandmark, descriptors});
}));

router.put("/:id", isLoggedIn, isAuthor, upload.array('images'), validateJapanLandmark, catchAsync(async(req, res) =>{
    const {id} = req.params;
    const japanLandmark = await JapanLandmark.findByIdAndUpdate(id, {...req.body.japanLandmark});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    japanLandmark.images.push(...imgs);
    await japanLandmark.save();
    // in the case of delete, we have to delete from cloudinary and japanLandmark obj as well. 
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await japanLandmark.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash("success", "Successfully updated the landmark!")
    res.redirect(`/japanLandmark/${japanLandmark._id}`);
}));

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async(req, res) =>{
    const {id} = req.params;
    await JapanLandmark.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the landmark!")
    res.redirect("/japanLandmark");
}));

module.exports = router;