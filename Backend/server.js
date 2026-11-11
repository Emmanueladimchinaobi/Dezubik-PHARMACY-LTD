
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const MongoStore = require("connect-mongo");

dotenv.config();

const connectDB = require("./config/db");

const orderRoutes = require("./routes/orderRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");

const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://dezubikpharmacy.vercel.app"
];

// CORS
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

app.use(express.json());

app.set("trust proxy", 1);

// Session configuration
if (!process.env.SESSION_SECRET ||
    !process.env.MONGODB_URI ||
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD_HASH) {
    throw new Error("Missing required authentication environment variables.");
}

const sessionMiddleware = session({

    name: "dezubik_admin",

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "adminSessions"
    }),

    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 8 * 60 * 60 * 1000,
        path: "/"
    }

});

app.use(sessionMiddleware);

// Socket.IO
const io = new Server(server, {

    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }

});

// Share Express sessions with Socket.IO
io.engine.use(sessionMiddleware);

// Routes
app.use("/api/admin", adminRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/messages", messageRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Dezubik Pharmacy Backend Running...");
});

// Socket.IO events
io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    // ADMIN: Load message history
    socket.on("admin_load", async () => {

        if (socket.request.session?.isAdmin !== true) {

            socket.emit("admin_auth_error", {
                message: "Admin authentication required."
            });

            return;
        }

        socket.join("admins");

        try {

            const history = await Message.find().sort({
                createdAt: 1
            });

            socket.emit("admin_history", history);

        } catch (error) {

            console.error("Admin history error:", error);

        }

    });

    // CUSTOMER: Join their chat room
    socket.on("join_room", async (visitorId) => {

        if (typeof visitorId !== "string" || !visitorId.trim()) {
            return;
        }

        socket.join(visitorId);

        console.log(`${socket.id} joined room ${visitorId}`);

        try {

            const history = await Message.find({
                visitorId: visitorId
            }).sort({
                createdAt: 1
            });

            socket.emit("load_messages", history);

        } catch (error) {

            console.error("Customer history error:", error);

        }

    });

    // Send messages
    socket.on("send_message", async (data) => {

        try {

            if (
                !data ||
                typeof data.visitorId !== "string" ||
                typeof data.message !== "string" ||
                !data.message.trim()
            ) {
                return;
            }

            const isAdmin =
                socket.request.session?.isAdmin === true;

            // Customers must join their room before sending.
            if (!isAdmin && !socket.rooms.has(data.visitorId)) {
                return;
            }

            const savedMessage = await Message.create({

                visitorId: data.visitorId,

                // Never trust the sender supplied by the browser.
                sender: isAdmin ? "Admin" : "Customer",

                message: data.message.trim(),

                room: data.visitorId

            });

            // Deliver to the customer
            io.to(data.visitorId).emit(
                "receive_message",
                savedMessage
            );

            // Notify authenticated admin dashboards only
            io.to("admins").emit(
                "admin_new_message",
                savedMessage
            );

        } catch (error) {

            console.error("Message sending error:", error);

        }

    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });

});

// Start server only after MongoDB connects
const startServer = async () => {

    try {

        await connectDB();

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {

        console.error("Server startup failed:", error);
        process.exit(1);

    }

};

startServer();
