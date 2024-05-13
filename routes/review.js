express = require("express");
const router = express.Router({ mergeParams:true }); 
// {mergeParams: true} this is needed to access to the :id in the app.js path. 
// since :id path data is not carried out router normally and shows undefined to access any passed params data such as :id
const JapanLandmark = require("../models/JapanLandmark");
const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../utils/middleware");


router.post("/", validateReview, isLoggedIn, catchAsync(async(req, res) =>{
    try{
        const japanLandmark = await JapanLandmark.findById(req.params.id); // get the obj itself not only id this case
        const review = new Review(req.body.review); // retrieve the data for review
        review.author = req.user._id;
        japanLandmark.reviews.push(review); // push the review data to the found obj of japanLandmark.
        await review.save(); // save for both
        await japanLandmark.save();
        console.log(`Review saved on japanLandmark!!! ${japanLandmark}`);
        req.flash("success", "Created new review!"); // we use flash to pop use customized message.
        res.redirect(`/japanLandmark/${japanLandmark._id}`);
    } catch(err){
        console.error("Error creating new review:", error);
        req.flash("error", "Failed to create new review");
        res.redirect(`/japanLandmark/${japanLandmark._id}`); // Redirect to a suitable location
    }
}))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(async(req, res) =>{
    const {id, reviewId} = req.params;
    await JapanLandmark.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review!");
    res.redirect(`/japanLandmark/${id}`);
}))

module.exports = router;