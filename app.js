express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
// these two passport are for authentication.
const passport = require("passport");
const LocalPassport = require("passport-local");
require('dotenv').config();

const User = require("./models/user");
const ExpressError = require("./utils/expressError");
const seedDB = require("./dataset/index");

const japanLandmarkRoutes = require("./routes/japanLandmark");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");

const HTTP_PORT = process.env.PORT || 8080;

const dbMongo = process.env.MONGODB;
mongoose.connect(dbMongo);

const db = mongoose.connection;

// Handle database connection events
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
    // Call the seedDB function after the database connection is established
    seedDB(db).then(() => {
        console.log("Seeding completed");

        app.listen(HTTP_PORT, () => {
            console.log(`Server listening on: ${HTTP_PORT}`);
        });
    }).catch(err => {
        console.error("Seeding failed:", err);
    });
});

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

const sessionConfig = {
    secret: "P@ssw0rd!SecretStr1ng",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash()); 
app.use(passport.initialize());
app.use(passport.session()); //passport.session() must comes after app.use(session(sessionConfig));
// this session() keep the session in certain time so that user don't need to login every time.
passport.use(new LocalPassport(User.authenticate())); // we use passport locally for User schema to authenticate.
passport.serializeUser(User.serializeUser()); // this let the passport how to serialize (store data in the session) user
passport.deserializeUser(User.deserializeUser()); // also have to deserialize. 

app.use((req, res, next) =>{
    console.log(req.session)
    // if(!["/login", "/"].includes(req.originalUrl)){ // this checks if users are not coming from either login or home page by checking url.
    //     req.session.returnTo = req.originalUrl; // if user coming from other router, we can return user to the page after user login.
    // }
    res.locals.currentUser = req.user; // when user signed in, automatically req.user is set from the session. 
                                        // assign this status to currentUser so that in other part, we know whether user in undefined or not. 
    res.locals.success = req.flash("success"); // this will trigger the message of flash "success" keyword.
    res.locals.error = req.flash("error");
    next();
})

// for the router, set up to the middleware for the default path. 
app.use("/", userRoutes);
app.use("/japanLandmark", japanLandmarkRoutes);
app.use("/japanLandmark/:id/reviews", reviewRoutes)

app.get("/", (req, res) =>{
    res.render("Home");
});

// any other routes didn't match with the given cases. 
app.all("*", (req, res, next) =>{
    next(new ExpressError("Page Not Found", 404));
});

// error handling middleware for all cases. 
app.use((err, req, res, next) =>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = "something went wrong";
    res.status(statusCode).render("error", {err}); 
});