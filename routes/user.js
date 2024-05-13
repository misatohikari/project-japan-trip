const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

router.get("/register", (req, res) =>{
    res.render("users/register");
})

router.post("/register", catchAsync(async(req, res) =>{
    try{
        const {username, password, email} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        // .register is one of passport library method which create salt and hash password by itself.
        // so here, have to do 2 steps of registration. one is user info, and the other is for password hashing.

        req.login(registeredUser, err =>{  // this automatically let the user who register as logged in.
           //.login() requires err callback, so pass that to handle the error. 
            if(err) return next(err);
            req.flash("success", "Welcome to Japan Tourist Landmarks!");
            res.redirect("/japanLandmark");
        })
    } catch (err){
        req.flash("error", err.message);
        res.redirect("register");
    }
}))

router.get("/login", (req,res) =>{
    res.render("users/login");
})

// to validate user login, use passport.authenticate() with local. 
// failureFlash & failureRedirect mean show flash message when failed. and also redirect to "/login" page
router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), (req, res) =>{
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.returnTo || "/japanLandmark";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get("/logout", (req, res) =>{
    req.logout(function (err) { // the req.logout() method requires callback function.
        if(err) {
            return next(err);
        }
        req.session.user = null;
        req.flash("success", "Goodbye!");
        res.redirect("/japanLandmark");
    });
});

module.exports = router;
