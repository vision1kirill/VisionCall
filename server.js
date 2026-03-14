const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// Хранит участников каждой комнаты: { roomId: { socketId: { name, avatar } } }
const rooms = {};

io.on("connection", socket => {

    socket.on("join-room", data => {

        const room = data.room;
        const name = data.name;
        const avatar = data.avatar || "🙂";

        socket.join(room);
        socket.data.name = name;
        socket.data.room = room;
        socket.data.avatar = avatar;

        // Инициализируем комнату если её нет
        if (!rooms[room]) rooms[room] = {};

        // Отправляем новому участнику список уже присутствующих
        const existingUsers = Object.entries(rooms[room]).map(([id, u]) => ({
            id,
            name: u.name,
            avatar: u.avatar
        }));
        socket.emit("room-users", existingUsers);

        // Добавляем нового участника в карту комнаты
        rooms[room][socket.id] = { name, avatar };

        // Уведомляем остальных о новом участнике
        socket.to(room).emit("user-connected", {
            id: socket.id,
            name,
            avatar
        });

        socket.on("disconnect", () => {
            socket.to(room).emit("user-disconnected", { id: socket.id });
            if (rooms[room]) {
                delete rooms[room][socket.id];
                if (Object.keys(rooms[room]).length === 0) delete rooms[room];
            }
        });

        // Передаём offer с именем и аватаром отправителя
        socket.on("offer", data => {
            io.to(data.to).emit("offer", {
                offer: data.offer,
                from: socket.id,
                name,
                avatar
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

        socket.on("chat-message", data => {
            socket.to(room).emit("chat-message", {
                name: data.name,
                text: data.text
            });
        });

        socket.on("media-state", data => {
            socket.to(room).emit("media-state", {
                from: socket.id,
                mic: data.mic,
                cam: data.cam
            });
        });

        // Уведомление о демонстрации экрана (чтобы получатель знал, что нужно contain)
        socket.on("screen-share-state", data => {
            socket.to(room).emit("screen-share-state", {
                from: socket.id,
                sharing: data.sharing
            });
        });

    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`VisionCall running on port ${PORT}`);
});
