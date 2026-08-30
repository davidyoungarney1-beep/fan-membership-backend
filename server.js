require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");

const app = express();


/*
==================================================
MIDDLEWARE
==================================================
*/

app.use(cors());

app.use(express.json());


/*
==================================================
HEALTH CHECK
==================================================
*/

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Fan Membership API is running"
    });

});


/*
==================================================
API ROUTES
==================================================
*/

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);


/*
==================================================
PORT
==================================================
*/

const PORT =
    process.env.PORT || 5000;


/*
==================================================
MONGODB CONNECTION
==================================================
*/

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log(
            "MongoDB connected"
        );


        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running on port ${PORT}`
                );

            }
        );

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

    });
