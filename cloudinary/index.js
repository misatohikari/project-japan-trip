//https://gist.github.com/ManishPoduval/672ef8aebd060702f1aea8f79463e37f
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

//setting up the instaces of cloudinary storage. 
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'JapanTrip',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}