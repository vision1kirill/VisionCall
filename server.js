const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", socket => {

    socket.on("join-room", data => {

        const room = data.room;
        const name = data.name;

        socket.join(room);

        socket.data.name = name;
        socket.data.room = room;

        socket.to(room).emit("user-connected", {
            id: socket.id,
            name: name,
            avatar: data.avatar || "🙂"
        });

        socket.on("disconnect", () => {
            socket.to(room).emit("user-disconnected", {
                id: socket.id
            });
        });

        // BUG FIX: Route to specific peer (was broadcasting to whole room)
        // BUG FIX: Add 'from' field so client knows who sent it
        socket.on("offer", data => {
            io.to(data.to).emit("offer", {
                offer: data.offer,
                from: socket.id
            });
        });

        socket.on("answer", data => {
            io.to(data.to).emit("answer", {
                answer: data.answer,
                from: socket.id
            });
        });

        socket.on("ice-candidate", data => {
            io.to(data.to).emit("ice-candidate", {
                candidate: data.candidate,
                from: socket.id
            });
        });

        // BUG FIX: Missing chat-message handler — chat never worked
        socket.on("chat-message", data => {
            socket.to(room).emit("chat-message", {
                name: data.name,
                text: data.text
            });
        });

        // Relay mic/cam state so remote participants can update label icons
        socket.on("media-state", data => {
            socket.to(room).emit("media-state", {
                from: socket.id,
                mic: data.mic,
                cam: data.cam
            });
        });

    });

});

server.listen(3000, () => {
    console.log("VisionCall running on http://localhost:3000");
});
