const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");

const app    = express();
const server = http.createServer(app);

/* ── CORS — в проде задайте ALLOWED_ORIGIN в Railway Variables ── */
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static("public", {
    maxAge: "1h",
    setHeaders(res, path) {
        /* HTML — не кэшировать, чтобы деплой сразу подхватывался */
        if (path.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache");
        }
    }
}));

/* ── Health-check для Railway / любого балансировщика ── */
app.get("/health", (_req, res) => {
    res.json({ status: "ok", rooms: rooms.size, uptime: process.uptime() });
});

/* ── Счётчик онлайна для главной страницы ── */
app.get("/api/online", (_req, res) => {
    res.json({ online: io.sockets.sockets.size });
});

/* ════════════════════════════════════════════
   ХРАНИЛИЩЕ КОМНАТ
   Map вместо plain-object → нет prototype-pollution
════════════════════════════════════════════ */
const MAX_ROOM_SIZE = 8; /* максимум участников в одной комнате */

/*
 * rooms: Map<roomId, Map<socketId, { name, avatar }>>
 */
const rooms = new Map();

/* ── Rate-limit helper ── */
const rateLimits = new Map(); /* socketId → Map<event, { count, resetAt }> */

function rateLimit(socketId, event, max, windowMs) {
    if (!rateLimits.has(socketId)) rateLimits.set(socketId, new Map());
    const byEvent = rateLimits.get(socketId);
    const now     = Date.now();
    const prev    = byEvent.get(event) || { count: 0, resetAt: now + windowMs };
    if (now > prev.resetAt) {
        byEvent.set(event, { count: 1, resetAt: now + windowMs });
        return true;
    }
    prev.count++;
    byEvent.set(event, prev);
    return prev.count <= max;
}

/* ── Валидация кода комнаты ── */
function sanitizeRoom(raw) {
    /* Разрешаем только буквы, цифры, дефис, подчёркивание, длина 1–32 */
    return String(raw || "").replace(/[^\w-]/g, "").slice(0, 32);
}

/* ── Проверка, что два сокета в одной комнате ── */
function sameRoom(socketA, socketIdB) {
    const roomA = socketA.data.room;
    if (!roomA) return false;
    const targetSocket = io.sockets.sockets.get(socketIdB);
    return !!(targetSocket && targetSocket.data.room === roomA);
}

/* ════════════════════════════════════════════
   SOCKET.IO СОБЫТИЯ
════════════════════════════════════════════ */
io.on("connection", socket => {

    /* ── Вход в комнату ── */
    socket.on("join-room", data => {
        const room   = sanitizeRoom(data.room);
        const name   = String(data.name   || "Участник").slice(0, 64);
        const avatar = String(data.avatar || "po").slice(0, 16);

        if (!room) { socket.emit("room-error", "Неверный код комнаты"); return; }

        /* Ограничение числа участников */
        const roomMap = rooms.get(room);
        if (roomMap && roomMap.size >= MAX_ROOM_SIZE) {
            socket.emit("room-full");
            return;
        }

        socket.join(room);
        socket.data.name   = name;
        socket.data.room   = room;
        socket.data.avatar = avatar;

        if (!rooms.has(room)) rooms.set(room, new Map());
        const members = rooms.get(room);

        /* Список уже присутствующих — новому участнику */
        const existingUsers = [...members.entries()].map(([id, u]) => ({
            id, name: u.name, avatar: u.avatar
        }));
        socket.emit("room-users", existingUsers);

        members.set(socket.id, { name, avatar });

        /* Уведомляем остальных */
        socket.to(room).emit("user-connected", { id: socket.id, name, avatar });

        console.log(`[join] ${name} → room=${room} (${members.size} participants)`);
    });

    /* ── Signaling — все три события проверяют членство в одной комнате ── */
    socket.on("offer", data => {
        if (!data.to || !sameRoom(socket, data.to)) return;
        io.to(data.to).emit("offer", {
            offer:  data.offer,
            from:   socket.id,
            name:   socket.data.name   || "Участник",
            avatar: socket.data.avatar || "🙂"
        });
    });

    socket.on("answer", data => {
        if (!data.to || !sameRoom(socket, data.to)) return;
        io.to(data.to).emit("answer", { answer: data.answer, from: socket.id });
    });

    socket.on("ice-candidate", data => {
        if (!data.to || !sameRoom(socket, data.to)) return;
        io.to(data.to).emit("ice-candidate", { candidate: data.candidate, from: socket.id });
    });

    /* ── Чат ── */
    socket.on("chat-message", data => {
        const room = socket.data.room;
        if (!room) return;
        /* Rate-limit: 20 сообщений за 10 сек */
        if (!rateLimit(socket.id, "chat", 20, 10_000)) return;
        const text = String(data.text || "").slice(0, 2000);
        if (!text.trim()) return;
        socket.to(room).emit("chat-message", {
            name: socket.data.name || "Участник",
            text
        });
    });

    /* ── Состояние медиа ── */
    socket.on("media-state", data => {
        const room = socket.data.room;
        if (!room) return;
        /* Rate-limit: 60 событий за 10 сек */
        if (!rateLimit(socket.id, "media", 60, 10_000)) return;
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
        if (room) {
            socket.to(room).emit("user-disconnected", { id: socket.id });
            const members = rooms.get(room);
            if (members) {
                members.delete(socket.id);
                if (members.size === 0) rooms.delete(room);
            }
            console.log(`[leave] ${socket.data.name || socket.id} ← room=${room}`);
        }
        /* Чистим rate-limit таблицу */
        rateLimits.delete(socket.id);
    });

});

/* ════════════════════════════════════════════
   ОБРАБОТКА НЕОБРАБОТАННЫХ ОШИБОК
════════════════════════════════════════════ */
process.on("uncaughtException", err => {
    console.error("[uncaughtException]", err);
    /* Не падаем — logируем и продолжаем */
});
process.on("unhandledRejection", reason => {
    console.error("[unhandledRejection]", reason);
});

/* ════════════════════════════════════════════
   GRACEFUL SHUTDOWN (Railway отправляет SIGTERM)
════════════════════════════════════════════ */
function gracefulShutdown(signal) {
    console.log(`[${signal}] Graceful shutdown initiated...`);
    /* Уведомляем всех участников */
    io.emit("server-shutdown");
    server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
    /* Если не закрылся за 10 сек — форс-выход */
    setTimeout(() => { console.error("Force exit after timeout"); process.exit(1); }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT",  () => gracefulShutdown("SIGINT"));

/* ════════════════════════════════════════════
   ЗАПУСК
════════════════════════════════════════════ */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`VisionCall running on port ${PORT}`));
