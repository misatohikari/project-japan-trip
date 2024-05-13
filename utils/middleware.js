const ExpressError = require("../utils/expressError");
const {japanLandmarkSchema} = require("../models/schema");
const {reviewSchema} = require("../models/schema");
const JapanLandmark = require("../models/JapanLandmark");
const Review = require("../models/review");

module.exports.validateJapanLandmark = (req, res, next) =>{
    const {error} = japanLandmarkSchema.validate(req.body); // this validate is from joi
    if(error){
        const msg = error.details.map(e => e.message).join(","); 
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
} 

module.exports.validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body); // this validate is from joi
    if(error){
        const msg = error.details.map(e => e.message).join(","); 
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
} 

module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){ // this .isAuthenticated methods comes to req automatically by using passport-local.
        req.session.returnTo = req.originalUrl
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

module.exports.isAuthor = async (req, res, next) =>{
    const {id} = req.params;
    const japanLandmark = await JapanLandmark.findById(id);
    if(!japanLandmark.author.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that.");
        return res.redirect(`/japanLandmark/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) =>{
    const {id, reviewId} = req.params; //specify both id and reviewId - campgrounds/id/reviews/:reviewId 
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that.");
        return res.redirect(`/japanLandmark/${id}`);
    }
    next();
}