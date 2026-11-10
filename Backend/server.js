const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const connectDB = require("./config/db");

const orderRoutes = require("./routes/orderRoutes");
const messageRoutes = require("./routes/messageRoutes");

const Message = require("./models/Message");

connectDB();


const app = express();

// Create HTTP Server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {

    cors: {

        origin: [

            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "https://luxelingeriebyella.vercel.app"

        ],

        methods: ["GET", "POST"]

    }

});

// Middlewares
app.use(cors({

    origin: [

        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://luxelingeriebyella.vercel.app"

    ],

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

    credentials: true

}));

app.use(express.json());

// Routes
app.use("/api/orders", orderRoutes);

app.use("/api/messages", messageRoutes);

// Home Route
app.get("/", (req, res) => {

    res.send("luxelingeriebyella Backend Running...");

});


// Socket.IO
io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);


    socket.on("admin_load", async () => {

    try {

        const history = await Message.find().sort({
            createdAt: 1
        });

        socket.emit("admin_history", history);

    } catch (err) {

        console.error(err);

    }

});

    // Customer joins their own room
    socket.on("join_room", async (visitorId) => {

        socket.join(visitorId);

        console.log(`${socket.id} joined room ${visitorId}`);

        try {

            // Load ONLY this visitor's messages
            const history = await Message.find({
                visitorId: visitorId
            }).sort({
                createdAt: 1
            });

            socket.emit("load_messages", history);

        } catch (err) {

            console.error(err);

        }

    });

    // Send Message
    socket.on("send_message", async (data) => {

        console.log(data);

        try {

            const savedMessage = await Message.create({

                visitorId: data.visitorId,

                sender: data.sender,

                message: data.message,

                room: data.visitorId

            });

            // Send message to the customer
io.to(data.visitorId).emit(
    "receive_message",
    savedMessage
);

// Notify the admin dashboard
io.emit(
    "admin_new_message",
    savedMessage
);

        } catch (err) {

            console.error(err);

        }

    });

    socket.on("disconnect", () => {

        console.log("User Disconnected:", socket.id);

    });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});