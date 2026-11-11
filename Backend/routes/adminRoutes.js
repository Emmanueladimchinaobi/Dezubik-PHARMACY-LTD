const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        if (
            username !== process.env.ADMIN_USERNAME ||
            !(await bcrypt.compare(
                password,
                process.env.ADMIN_PASSWORD_HASH
            ))
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        req.session.regenerate((error) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Could not create admin session."
                });
            }

            req.session.isAdmin = true;

            req.session.save((error) => {

                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Could not save admin session."
                    });
                }

                res.json({
                    success: true,
                    message: "Admin login successful."
                });

            });

        });

    } catch (error) {

        console.error("Admin login error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed."
        });

    }

});

router.get("/me", (req, res) => {

    if (req.session?.isAdmin === true) {
        return res.json({
            authenticated: true
        });
    }

    res.status(401).json({
        authenticated: false
    });

});

router.post("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            return res.status(500).json({
                success: false,
                message: "Logout failed."
            });
        }

        res.clearCookie("dezubik_admin", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        });

        res.json({
            success: true,
            message: "Logged out successfully."
        });

    });

});

module.exports = router;