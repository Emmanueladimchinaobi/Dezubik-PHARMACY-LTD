
const express = require("express");

const router = express.Router();

const Message = require("../models/Message");

const requireAdmin = require("../middleware/requireAdmin");

// Get all customer messages - ADMIN ONLY
router.get("/", requireAdmin, async (req, res) => {

    try {

        const messages = await Message.find().sort({
            createdAt: 1
        });

        res.json(messages);

    } catch (err) {

        console.error("Message retrieval error:", err);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve messages."
        });

    }

});

module.exports = router;
