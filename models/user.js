const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
// use this library to handle authentication-related functionalities, including hashing
// this automatically add username and password field to the userSchema, also handle hash and salt.

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose);
// we use passport-local-mongoose plugin for UserSchema, so connect here with .plugin

module.exports = mongoose.model("User", UserSchema);