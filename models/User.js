const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        country: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        membershipStatus: {
            type: String,
            enum: ["inactive", "active"],
            default: "inactive"
        },

        membershipPlan: {
            type: String,
            default: null
        },

        membershipExpiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
