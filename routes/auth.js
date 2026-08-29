const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const router = express.Router();

/*
   REGISTER
   POST /api/auth/register
*/

router.post("/register", async (req, res) => {
    try {
        const { fullName, email, country, password } = req.body;

        if (!fullName || !email || !country || !password) {
            return res.status(400).json({
                success: false,
                message: "Please complete all required fields."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            fullName,
            email: email.toLowerCase(),
            country,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                country: user.country,
                membershipStatus: user.membershipStatus
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Server error. Please try again later."
        });
    }
});

module.exports = router;
