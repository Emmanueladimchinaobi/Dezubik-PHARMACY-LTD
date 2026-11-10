const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const sendOrderEmail = require("../utils/sendOrderEmail");

// Create a new order
router.post("/", async (req, res) => {
    console.log("POST /api/orders hit");
    console.log(req.body);

    try {
        const order = new Order(req.body);

        const savedOrder = await order.save();

        console.log("Order saved");

        await sendOrderEmail(savedOrder);

        console.log("Email function finished");

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order: savedOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to place order."
        });
    }
});

// Get all orders
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        res.json(orders);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders."
        });
    }
});


// Delete an order
router.delete("/:id", async (req, res) => {

    try {

        const deletedOrder = await Order.findByIdAndDelete(req.params.id);

        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        res.json({
            success: true,
            message: "Order deleted successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete order."
        });

    }

});
module.exports = router;