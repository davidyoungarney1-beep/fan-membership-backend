const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        orderId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        plan: {
            type: String,
            required: true,
            enum: [
                "Fan Member",
                "Royal Supporter",
                "Elite Supporter"
            ]
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "USD",
            uppercase: true,
            trim: true
        },

        paymentNetwork: {
            type: String,
            default: "BEP20",
            uppercase: true,
            trim: true
        },

        paymentAddress: {
            type: String,
            default: "",
            trim: true
        },

        transactionId: {
            type: String,
            default: "",
            trim: true
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "submitted",
                "confirmed",
                "rejected",
                "cancelled"
            ],
            default: "pending",
            index: true
        },

        membershipStatus: {
            type: String,
            enum: [
                "pending",
                "active",
                "inactive"
            ],
            default: "pending"
        },

        notes: {
            type: String,
            default: "",
            trim: true,
            maxlength: 1000
        }
    },

    {
        timestamps: true
    }
);


/*
==================================================
INDEXES
==================================================
*/

OrderSchema.index({
    user: 1,
    createdAt: -1
});

OrderSchema.index({
    paymentStatus: 1,
    createdAt: -1
});


/*
==================================================
MODEL
==================================================
*/

module.exports =
    mongoose.model(
        "Order",
        OrderSchema
    );
