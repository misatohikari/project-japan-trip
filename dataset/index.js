const mongoose = require("mongoose");
const seeds = require("./seed");
const seedHelpers = require("./seedHelpers");
const JapanLandmark = require("../models/JapanLandmark");
//  require('dotenv').config();

// const dbMongo = process.env.MONGODB;
// mongoose.connect(dbMongo);
// const db = mongoose.connection;

// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

const seedDB = async () =>{
    await JapanLandmark.deleteMany({});
    //const existingData = await JapanLandmark.find({});

    // Combine existing data with static seed data
    //const combinedData = [...existingData, ...seeds];
    for(const seed  of seeds){
        const descriptor = seedHelpers.descriptors.find(descriptor => descriptor.id === seed.descriptor_id);
            if (!descriptor) {
                throw new Error(`Descriptor with id ${seed.descriptor_id} not found`);
            }

        const region = seedHelpers.regions.find(region => region.id === seed.region_id);
            if (!region) {
                throw new Error(`Descriptor with id ${seed.descriptor_id} not found`);
            }

        // const images = seed.images.map(image => ({
        //     url: image.url,
        //     filename: image.filename
        // }));

        const landmarks = new JapanLandmark({
            author: "663ba888cf5432d67431c97b", //default set as mine
            title: seed.name,
            price: seed.price,
            description: seed.description,
            location: `${seed.city}, ${seed.prefecture}`,
            descriptor: descriptor.name,
            region: region.name,
            url: seed.googleURL,
            // images: images
            geometry: {
                type: "Point",
                coordinates:[
                    seed.longitude,
                    seed.latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dgrunp6ja/image/upload/v1715291911/JapanTrip/w2mkb4wk1rwxhezeuon4.jpg',
                    filename: 'JapanTrip/w2mkb4wk1rwxhezeuon4'
                },
                {
                    url: 'https://res.cloudinary.com/dgrunp6ja/image/upload/v1715286846/JapanTrip/nzyc3nxszqjt2ns0nhxk.jpg',
                    filename: 'JapanTrip/nzyc3nxszqjt2ns0nhxk'
                },
                {
                    url: 'https://res.cloudinary.com/dgrunp6ja/image/upload/v1715283408/JapanTrip/ozncnt5paxi5tqovtkh4.jpg',
                    filename: 'JapanTrip/ozncnt5paxi5tqovtkh4'
                }
            ]
        })
        await landmarks.save();
    }
}

module.exports = seedDB;