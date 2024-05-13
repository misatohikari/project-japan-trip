const joi = require("joi");

const japanLandmarkSchema = joi.object({ //this is not mongoose schema, but for joi to validate.
    japanLandmark: joi.object({
        title: joi.string().required(),
        price: joi.number().required().min(0),
        description: joi.string().required(),
        location: joi.string().required(),
        descriptor: joi.string().required(),
        region: joi.string(),
        url: joi.string(),
        // images: joi.array().items(
        //     joi.object({
        //         url: joi.string().required(),
        //         filename: joi.string().required()
        //     })
        // )
    }).required(),
    deleteImages: joi.array() // this is added for deleting images. 
});

const reviewSchema = joi.object({ //this is not mongoose schema, but for joi to validate.
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        body: joi.string().required()
    }).required()
});

module.exports = {japanLandmarkSchema, reviewSchema};