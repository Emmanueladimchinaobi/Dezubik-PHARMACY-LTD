
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const sendOrderEmail = require("../utils/sendOrderEmail");
const requireAdmin = require("../middleware/requireAdmin");

// ==========================================
// CREATE CUSTOMER ORDER
// ==========================================

router.post("/", async (req, res) => {
    try {
        console.log("POST /api/orders hit");

        const order = new Order(req.body);

        const savedOrder = await order.save();

        console.log("Order saved:", savedOrder._id);

        // Email failure should not undo a saved order.
        try {
            await sendOrderEmail(savedOrder);
        } catch (emailError) {
            console.error("Order email failed:", emailError);
        }

        return res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order: savedOrder
        });

    } catch (error) {
        console.error("Order creation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to place order."
        });
    }
});

// ==========================================
// GET ALL ORDERS (ADMIN ONLY)
// ==========================================

router.get("/", requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 });

        return res.json(orders);

    } catch (error) {
        console.error("Fetch orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders."
        });
    }
});

// ==========================================
// DELETE ORDER (ADMIN ONLY)
// ==========================================

router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const deletedOrder =
            await Order.findByIdAndDelete(req.params.id);

        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.json({
            success: true,
            message: "Order deleted successfully."
        });

    } catch (error) {
        console.error("Delete order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete order."
        });
    }
});

module.exports = router;
