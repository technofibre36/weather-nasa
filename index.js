const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true
}));

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/myappDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
    res.redirect("/login");
});

// Signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Signup action
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.send("User already exists! Please login.");
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.send("Error signing up.");
    }
});

// Login page
app.get("/login", (req, res) => {
    res.render("login");
});

// Login action
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });
        if (user) {
            req.session.user = user;
            res.redirect("/dashboard");
        } else {
            res.send("Invalid email or password.");
        }
    } catch (err) {
        console.error(err);
        res.send("Error logging in.");
    }
});

// Dashboard
app.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.render("dashboard", { name: req.session.user.name });
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
