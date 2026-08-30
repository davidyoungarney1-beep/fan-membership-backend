const express = require("express");
const crypto = require("crypto");

const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();


/*
==================================================
MEMBERSHIP PLANS
==================================================
*/

const PLANS = {
    "Fan Member": 29,
    "Royal Supporter": 59,
    "Elite Supporter": 99
};


/*
==================================================
CREATE ORDER
POST /api/orders
==================================================

Requires:
Authorization: Bearer YOUR_TOKEN

Body:
{
    "plan": "Fan Member"
}
==================================================
*/

router.post("/", auth, async (req, res) => {

    try {

        const { plan } = req.body;


        /*
        CHECK PLAN
        */

        if (!plan || !PLANS[plan]) {

            return res.status(400).json({
                success: false,
                message: "Please select a valid membership plan."
            });

        }


        /*
        GET PRICE FROM SERVER

        Never trust the price sent by the browser.
        */

        const price = PLANS[plan];


        /*
        GENERATE UNIQUE ORDER ID
        */

        const orderId =
            "LEO-" +
            Date.now() +
            "-" +
            crypto
                .randomBytes(4)
                .toString("hex")
                .toUpperCase();


        /*
        CREATE ORDER
        */

        const order = await Order.create({

            user: req.user.userId,

            orderId,

            plan,

            price,

            currency: "USD",

            paymentNetwork: "BEP20",

            paymentStatus: "pending",

            membershipStatus: "pending"

        });


        /*
        RESPONSE
        */

        return res.status(201).json({

            success: true,

            message:
                "Membership order created successfully.",

            order: {

                id:
                    order._id,

                orderId:
                    order.orderId,

                plan:
                    order.plan,

                price:
                    order.price,

                currency:
                    order.currency,

                paymentNetwork:
                    order.paymentNetwork,

                paymentStatus:
                    order.paymentStatus,

                membershipStatus:
                    order.membershipStatus,

                createdAt:
                    order.createdAt

            }

        });


    } catch (error) {

        console.error(
            "Create order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error. Please try again later."

        });

    }

});


/*
==================================================
GET MY ORDERS
GET /api/orders/my-orders
==================================================

Returns orders belonging to the logged-in member.
==================================================
*/

router.get("/my-orders", auth, async (req, res) => {

    try {

        const orders =
            await Order.find({
                user: req.user.userId
            })
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            orders

        });


    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error. Please try again later."

        });

    }

});


/*
==================================================
GET SINGLE ORDER
GET /api/orders/:orderId
==================================================

Only the owner of the order can access it.
==================================================
*/

router.get("/:orderId", auth, async (req, res) => {

    try {

        const order =
            await Order.findOne({

                orderId:
                    req.params.orderId,

                user:
                    req.user.userId

            });


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found."

            });

        }


        return res.status(200).json({

            success: true,

            order

        });


    } catch (error) {

        console.error(
            "Get single order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error. Please try again later."

        });

    }

});


/*
==================================================
SUBMIT TRANSACTION ID
PATCH /api/orders/:orderId/payment
==================================================

Body:

{
    "transactionId": "YOUR_TRANSACTION_ID"
}

This only submits the transaction for review.
It does NOT activate the membership.
==================================================
*/

router.patch(
    "/:orderId/payment",
    auth,
    async (req, res) => {

        try {

            const {
                transactionId
            } = req.body;


            /*
            VALIDATE TRANSACTION ID
            */

            if (
                !transactionId ||
                typeof transactionId !== "string"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide a valid transaction ID."

                });

            }


            const cleanTransactionId =
                transactionId.trim();


            if (
                cleanTransactionId.length < 6 ||
                cleanTransactionId.length > 200
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid transaction ID."

                });

            }


            /*
            FIND USER'S ORDER
            */

            const order =
                await Order.findOne({

                    orderId:
                        req.params.orderId,

                    user:
                        req.user.userId

                });


            if (!order) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found."

                });

            }


            /*
            DON'T ALLOW PAYMENT
            TO BE SUBMITTED AGAIN
            AFTER CONFIRMATION
            */

            if (
                order.paymentStatus ===
                "confirmed"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This order has already been confirmed."

                });

            }


            /*
            SAVE TRANSACTION ID
            */

            order.transactionId =
                cleanTransactionId;

            order.paymentStatus =
                "submitted";

            order.membershipStatus =
                "pending";


            await order.save();


            return res.status(200).json({

                success: true,

                message:
                    "Transaction submitted for review.",

                order: {

                    orderId:
                        order.orderId,

                    plan:
                        order.plan,

                    price:
                        order.price,

                    currency:
                        order.currency,

                    paymentNetwork:
                        order.paymentNetwork,

                    transactionId:
                        order.transactionId,

                    paymentStatus:
                        order.paymentStatus,

                    membershipStatus:
                        order.membershipStatus

                }

            });


        } catch (error) {

            console.error(
                "Payment submission error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error. Please try again later."

            });

        }

    }
);


/*
==================================================
EXPORT ROUTER
==================================================
*/

module.exports = router;
