const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


/*
==================================================
REGISTER
POST /api/auth/register
==================================================
*/

router.post("/register", async (req, res) => {

    try {

        const {
            fullName,
            email,
            country,
            password
        } = req.body;


        if (
            !fullName ||
            !email ||
            !country ||
            !password
        ) {

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


        const normalizedEmail =
            email.trim().toLowerCase();


        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 12);


        const user =
            await User.create({

                fullName:
                    fullName.trim(),

                email:
                    normalizedEmail,

                country,

                password:
                    hashedPassword

            });


        res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            user: {

                id:
                    user._id,

                fullName:
                    user.fullName,

                email:
                    user.email,

                country:
                    user.country,

                membershipStatus:
                    user.membershipStatus

            }

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error. Please try again later."

        });

    }

});



/*
==================================================
LOGIN
POST /api/auth/login
==================================================
*/

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        /* VALIDATION */

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email and password."

            });

        }


        /* FIND USER */

        const normalizedEmail =
            email.trim().toLowerCase();


        const user =
            await User.findOne({
                email: normalizedEmail
            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        /* CHECK PASSWORD */

        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordCorrect) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        /* CHECK JWT SECRET */

        if (!process.env.JWT_SECRET) {

            console.error(
                "JWT_SECRET is not configured."
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server configuration error."

            });

        }


        /* CREATE JWT */

        const token =
            jwt.sign(

                {
                    userId:
                        user._id.toString(),

                    email:
                        user.email

                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "7d"
                }

            );


        /* SUCCESS */

        res.status(200).json({

            success: true,

            message:
                "Login successful.",

            token,

            user: {

                id:
                    user._id,

                fullName:
                    user.fullName,

                email:
                    user.email,

                country:
                    user.country,

                membershipStatus:
                    user.membershipStatus

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error. Please try again later."

        });

    }

});


module.exports = router;
