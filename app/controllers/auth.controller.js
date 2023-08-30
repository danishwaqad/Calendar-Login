const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
        });

        await user.save();

        res.status(201).send({ message: "User was registered successfully!" });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error occurred while registering user." });
    }
};

exports.signin = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.body.username,
        });

        if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).send({ message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: user.id }, config.secret, {
            algorithm: "HS256",
            expiresIn: 86400, // 24 hours
        });

        req.session.token = token;

        res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error occurred while signing in." });
    }
};

exports.signout = async (req, res) => {
    try {
        req.session = null;
        res.status(200).send({ message: "You've been signed out!" });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error occurred while signing out." });
    }
};
