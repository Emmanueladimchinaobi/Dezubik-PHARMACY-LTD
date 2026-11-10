const Message = require("./models/Message");

module.exports = (io) => {

    io.on("connection", async (socket) => {

        console.log("New User Connected");

        const history = await Message.find().sort({
            createdAt: 1
        });

        socket.emit("load messages", history);

        socket.on("chat message", async (data) => {

            const saved = await Message.create({

                sender: data.sender,

                message: data.message,

                room: "general"

            });

            io.emit("chat message", saved);

        });

        socket.on("disconnect", () => {

            console.log("User Left");

        });

    });

};