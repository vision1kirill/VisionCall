const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server);

app.use(express.static("public"));

/* Участники комнат: { roomId: { socketId: { name, avatar } } } */
const rooms = {};

io.on("connection", socket => {

    /* ── Вход в комнату ── */
    socket.on("join-room", data => {
        const room   = data.room;
        const name   = (data.name   || "Участник").slice(0, 64);
        const avatar = (data.avatar || "🙂").slice(0, 8);

        socket.join(room);
        socket.data.name   = name;
        socket.data.room   = room;
        socket.data.avatar = avatar;

        if (!rooms[room]) rooms[room] = {};

        /* Список уже присутствующих — новому участнику */
        const existingUsers = Object.entries(rooms[room]).map(([id, u]) => ({
            id, name: u.name, avatar: u.avatar
        }));
        socket.emit("room-users", existingUsers);

        rooms[room][socket.id] = { name, avatar };

        /* Уведомляем остальных */
        socket.to(room).emit("user-connected", { id: socket.id, name, avatar });
    });

    /* ── Signaling ── */
    socket.on("offer", data => {
        if (!data.to) return;
        io.to(data.to).emit("offer", {
            offer: data.offer,
            from:  socket.id,
            name:  socket.data.name   || "Участник",
            avatar: socket.data.avatar || "🙂"
        });
    });

    socket.on("answer", data => {
        if (!data.to) return;
        io.to(data.to).emit("answer", { answer: data.answer, from: socket.id });
    });

    socket.on("ice-candidate", data => {
        if (!data.to) return;
        io.to(data.to).emit("ice-candidate", { candidate: data.candidate, from: socket.id });
    });

    /* ── Чат ── */
    socket.on("chat-message", data => {
        const room = socket.data.room;
        if (!room) return;
        /* Рассылаем только остальным (отправитель добавляет сообщение сам) */
        socket.to(room).emit("chat-message", {
            name: socket.data.name || "Участник",
            text: String(data.text || "").slice(0, 2000) /* ограничение длины */
        });
    });

    /* ── Состояние медиа ── */
    socket.on("media-state", data => {
        const room = socket.data.room;
        if (!room) return;
        socket.to(room).emit("media-state", {
            from: socket.id,
            mic:  !!data.mic,
            cam:  !!data.cam
        });
    });

    /* ── Демонстрация экрана ── */
    socket.on("screen-share-state", data => {
        const room = socket.data.room;
        if (!room) return;
        socket.to(room).emit("screen-share-state", {
            from:    socket.id,
            sharing: !!data.sharing
        });
    });

    /* ── Отключение ── */
    /* Обработчик СНАРУЖИ join-room — предотвращаем дублирование при повторном вызове */
    socket.on("disconnect", () => {
        const room = socket.data.room;
        if (!room) return;
        socket.to(room).emit("user-disconnected", { id: socket.id });
        if (rooms[room]) {
            delete rooms[room][socket.id];
            if (Object.keys(rooms[room]).length === 0) delete rooms[room];
        }
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`VisionCall running on port ${PORT}`));
