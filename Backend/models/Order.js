const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
    customerName: {
        type: String,
        required: true
    },

    

    phone: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },
    
    state: {
        type: String,
        required: true
    },

    items: [
        {
            id: String,
            name: String,
            image: String,
            price: Number,
            quantity: Number,
            size: String,
        colour: String
        }
    ],

    total: {
        type: Number,
        required: true
    },

    paymentMethod: {
        type: String,
        default: "Bank Transfer"
    },

    status: {
        type: String,
        default: "Pending"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);