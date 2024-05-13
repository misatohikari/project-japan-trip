const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

//after /upload, want to add w-200 so that all images will be shown with the given size. 
// using virtual, we don't need to store this new url to other places. 
// this case with virtual, thumbnail is called and replace the url with the width data. 
// it happens virtually so that the original url is not affected. 
ImageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload", "/upload/w_200");
});

// this is needed to add the virtual data in the japanLandmark json when it's used. 
// this opts is passed in the line 49 as well. 
const opts = { toJSON: { virtuals: true } };

const JapanLandmarkSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: { // add this part for mapping
        type: {
            type: String,
            enum: ['Point'], // here have to be Point. 
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    descriptor: String,
    region: String, 
    url: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);

// set virtual to use cluster map which expect to have property 
// properties.popUpMarkup- we need properties which store popUpmarkup data. 
// so not in the system model itself but in virtual set this when it's needed and when accessing the popUpmarkup, then 
// print the message we want to 
JapanLandmarkSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/japanLandmark/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

// this is the delete pattern. when the landmark itself is deleted, then
// the review related to the spot should be deleted. for that, this is used. 
JapanLandmarkSchema.post("findOneAndDelete", async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model("JapanLandmark", JapanLandmarkSchema);
