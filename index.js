const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

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

app.get("/signup", (req, res) => {
    res.render("signup");
});

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

app.get("/login", (req, res) => {
    res.render("login");
});

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

app.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.render("dashboard", { name: req.session.user.name });
});

// GET /predict — Form page
app.get("/predict", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("predict");
});

// POST /predict — Send input to Flask and return result
app.post("/predict", async (req, res) => {
    const inputData = {
        ALLSKY_SFC_SW_DWN: parseFloat(req.body.ALLSKY_SFC_SW_DWN),
        T2M: parseFloat(req.body.T2M),
        T2M_MAX: parseFloat(req.body.T2M_MAX),
        T2M_MIN: parseFloat(req.body.T2M_MIN),
        RH2M: parseFloat(req.body.RH2M),
        WS2M: parseFloat(req.body.WS2M)
    };

    try {
        const response = await axios.post("http://localhost:5000/predict", inputData);
        const result = response.data;

        res.render("predict", {
            prediction: result.prediction,
            probability: result.probability,
            input: inputData
        });
    } catch (err) {
        console.error(err);
        res.send("Error making prediction. Ensure Flask server is running.");
    }
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// Start server
app.listen(3000, () => {
    console.log("Node.js server running at http://localhost:3000");
});
