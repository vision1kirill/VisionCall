const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");

const app    = express();
const server = http.createServer(app);

/* ════════════════════════════════════════════
   TURN ДИАГНОСТИКА — печатается один раз при старте
════════════════════════════════════════════ */
(function logTurnConfig() {
    const meteredKey    = process.env.METERED_API_KEY;
    const meteredDomain = process.env.METERED_DOMAIN;
    const turnUrl       = process.env.TURN_URL;
    const turnUser      = process.env.TURN_USERNAME;
    const turnCred      = process.env.TURN_CREDENTIAL;

    const hasMeter  = !!(meteredKey && meteredDomain);
    const hasStatic = !!(turnUrl && turnUser && turnCred);

    if (hasMeter) {
        /* Маскируем ключ: первые 4 + последние 4 символа */
        const masked = meteredKey.length > 8
            ? meteredKey.slice(0, 4) + "..." + meteredKey.slice(-4)
            : "****";
        console.log(`[TURN] Provider: metered, domain: ${meteredDomain}, api_key: ${masked}`);
    } else {
        console.warn("┌─────────────────────────────────────────────────────┐");
        console.warn("│  [TURN] NOT CONFIGURED — running on STUN only       │");
        console.warn("│  Connections behind symmetric NAT will FAIL silently │");
        console.warn("│  Set METERED_API_KEY + METERED_DOMAIN in Railway Env │");
        console.warn("└─────────────────────────────────────────────────────┘");
    }

    if (hasStatic) {
        console.log(`[TURN] Static TURN also configured: ${turnUrl}`);
    }

    if (!hasMeter && !hasStatic) {
        console.warn("[TURN] No TURN provider at all — STUN-only mode.");
    }
})();

/* ── CORS — в проде задайте ALLOWED_ORIGIN в Railway Variables ── */
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGIN || "*",
        methods: ["GET", "POST"]
    },
    /* Сокращаем таймауты: мёртвые сокеты обнаруживаются за ~10 сек
       вместо дефолтных ~25 сек. Уменьшает время жизни "призраков". */
    pingInterval: 8000,
    pingTimeout:  4000
});

app.use(express.urlencoded({ extended: false })); /* для sendBeacon POST-тела */

/* ════════════════════════════════════════════
   SECURITY HEADERS — базовая защита от XSS, clickjacking, MIME-sniffing
════════════════════════════════════════════ */
app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    /* Разрешаем камеру и микрофон для самой страницы (нужно для WebRTC!).
       camera=() / microphone=() блокировали бы getUserMedia — НЕ добавляем их.
       Блокируем только геолокацию (не нужна для созвонов). */
    res.setHeader("Permissions-Policy", "geolocation=()");
    /* CSP: разрешаем только свои ресурсы + socket.io inline-скрипты */
    res.setHeader("Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "connect-src 'self' wss: ws:; " +
        "media-src 'self' blob: mediastream:; " +
        "frame-ancestors 'none';"
    );
    next();
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

/* ════════════════════════════════════════════
   /api/leave — HTTP endpoint для navigator.sendBeacon.
   Браузер гарантирует доставку даже при закрытии страницы,
   поэтому это надёжнее чем socket.emit("leave-room") в beforeunload.
════════════════════════════════════════════ */
app.post("/api/leave", (req, res) => {
    const room      = sanitizeRoom(req.body?.room || "");
    const sessionId = String(req.body?.session || "").replace(/[^\w]/g, "").slice(0, 64);
    if (room && sessionId) {
        const sessions = roomSessions.get(room);
        if (sessions) {
            const socketId = sessions.get(sessionId);
            if (socketId) {
                const sock    = io.sockets.sockets.get(socketId);
                const members = rooms.get(room);
                if (members && members.has(socketId)) {
                    members.delete(socketId);
                    io.to(room).emit("user-disconnected", { id: socketId });
                    if (sock) { sock.data.room = null; sock.leave(room); }
                    if (members.size === 0) {
                        rooms.delete(room);
                        roomSessions.delete(room);
                    } else if (members._creator === socketId) {
                        const newCreatorId = members.keys().next().value;
                        members._creator = newCreatorId;
                        io.to(room).emit("new-creator", { id: newCreatorId });
                    }
                }
                sessions.delete(sessionId);
            }
        }
        console.log(`[beacon-leave] room=${room} session=${sessionId}`);
    }
    res.status(204).end();
});

/* ── Health-check для Railway / любого балансировщика ── */
app.get("/health", (_req, res) => {
    res.json({ status: "ok", rooms: rooms.size, uptime: process.uptime() });
});

/* ── Счётчик онлайна для главной страницы ── */
app.get("/api/online", (_req, res) => {
    res.json({ online: io.sockets.sockets.size });
});

/* ════════════════════════════════════════════
   ICE SERVERS — TURN кредыциалы никогда не
   попадают в клиентский JS, только через этот
   эндпоинт.

   Приоритет источников TURN:
   1. Metered.ca (если METERED_API_KEY + METERED_DOMAIN заданы и API отвечает 200)
   2. OpenRelay — бесплатный публичный TURN без регистрации (автоматический fallback)
   3. Статичный TURN (TURN_URL + TURN_USERNAME + TURN_CREDENTIAL) — опционально поверх

   STUN от Google добавляется всегда.
════════════════════════════════════════════ */

/* OpenRelay — публичный TURN от Metered.ca без ключа.
   Используется как fallback если приватный Metered недоступен.
   Лимиты: 500 MB/мес бесплатно, без гарантий uptime.
   Подходит для разработки и небольшой нагрузки. */
const OPENRELAY_ICE_SERVERS = [
    { urls: "stun:stun.relay.metered.ca:80" },
    { urls: "turn:global.relay.metered.ca:80",
      username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:global.relay.metered.ca:443",
      username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "openrelayproject", credential: "openrelayproject" },
];

let   _iceCache    = null;
let   _iceCacheAt  = 0;
const ICE_CACHE_MS = 50 * 60 * 1000; /* 50 минут — кредыциалы живут 1 час */

app.get("/api/ice-servers", async (_req, res) => {
    /* Отдаём кэш если свежий */
    if (_iceCache && Date.now() - _iceCacheAt < ICE_CACHE_MS) {
        return res.json({ iceServers: _iceCache });
    }

    /* STUN всегда в списке */
    const iceServers = [
        { urls: "stun:stun.l.google.com:19302"  },
        { urls: "stun:stun1.l.google.com:19302" },
    ];

    /* ── Режим A: Metered.ca — time-limited credentials ── */
    const meteredKey    = process.env.METERED_API_KEY;
    const meteredDomain = process.env.METERED_DOMAIN;
    let   meteredOk     = false;  /* флаг: Metered отдал живые TURN-сервера */
    let   meteredFail   = "";     /* причина отказа для лога */

    if (meteredKey && meteredDomain) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const url = `https://${meteredDomain}/api/v1/turn/credentials?apiKey=${meteredKey}`;
        console.log(`[TURN] Fetching credentials from: https://${meteredDomain}/api/v1/turn/credentials?apiKey=****`);
        try {
            const resp     = await fetch(url, { signal: controller.signal });
            const bodyText = await resp.text();
            if (resp.ok) {
                let list;
                try { list = JSON.parse(bodyText); } catch (_) {
                    console.error(`[TURN] Metered response is not valid JSON: ${bodyText.slice(0, 200)}`);
                    meteredFail = "invalid JSON response";
                }
                if (Array.isArray(list) && list.length > 0) {
                    iceServers.push(...list);
                    const types = list.map(s => (Array.isArray(s.urls) ? s.urls[0] : s.urls)?.split(":")[0]).join(", ");
                    console.log(`[TURN] Metered OK: got ${list.length} servers (${types})`);
                    meteredOk = true;
                } else if (Array.isArray(list)) {
                    meteredFail = "empty array returned";
                    console.warn(`[TURN] Metered returned empty array — will use OpenRelay fallback`);
                } else if (!meteredFail) {
                    meteredFail = `unexpected format: ${bodyText.slice(0, 100)}`;
                    console.warn(`[TURN] Metered unexpected format, will use OpenRelay fallback`);
                }
            } else {
                meteredFail = `HTTP ${resp.status}: ${bodyText.slice(0, 200)}`;
                console.error(`[TURN] Metered HTTP ${resp.status} — body: ${bodyText.slice(0, 500)}`);
            }
        } catch (e) {
            if (e.name === "AbortError") {
                meteredFail = "request timed out after 5s";
                console.error(`[TURN] Metered request timed out after 5s — domain: ${meteredDomain}`);
            } else {
                meteredFail = e.message;
                console.error(`[TURN] Metered fetch failed: ${e.message}`);
            }
        } finally {
            clearTimeout(timer);
        }
    }

    /* ── Fallback: OpenRelay если Metered не сработал или не настроен ── */
    if (!meteredOk) {
        iceServers.push(...OPENRELAY_ICE_SERVERS);
        if (meteredKey && meteredDomain) {
            console.log(`[TURN] Mode: openrelay (fallback, metered failed: ${meteredFail})`);
        } else {
            console.log(`[TURN] Mode: openrelay (no metered config)`);
        }
    } else {
        console.log(`[TURN] Mode: metered (api ok)`);
    }

    /* ── Режим B: статичный TURN (любой провайдер) — опционально поверх ── */
    const turnUrl  = process.env.TURN_URL;
    const turnUser = process.env.TURN_USERNAME;
    const turnCred = process.env.TURN_CREDENTIAL;
    if (turnUrl && turnUser && turnCred) {
        const urls = turnUrl.split(",").map(u => u.trim()).filter(Boolean);
        iceServers.push({ urls, username: turnUser, credential: turnCred });
        console.log(`[TURN] Static TURN also added: ${urls.join(", ")}`);
    }

    _iceCache   = iceServers;
    _iceCacheAt = Date.now();

    console.log(`[TURN] Returning ${iceServers.length} ICE servers total`);
    res.json({ iceServers });
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

/* sessionId → socketId для каждой комнаты.
   Позволяет выгнать старый "призрак" когда тот же пользователь
   переподключается (обновил страницу, потерял связь и вернулся). */
const roomSessions = new Map(); /* room → Map<sessionId, socketId> */

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
    const room = String(raw || "").replace(/[^\w-]/g, "").slice(0, 32);
    return room.length > 0 ? room : null;
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
        /* #68 — Защита от prototype pollution: data должен быть объектом */
        if (!data || typeof data !== "object") return;
        const room      = sanitizeRoom(data.room);
        /* #68b — Фильтруем управляющие символы из имени и аватара */
        const name      = String(data.name || "Участник").replace(/[\x00-\x1f\x7f]/g, "").slice(0, 64) || "Участник";
        const avatar    = "default"; /* единый силуэт, выбор аватара отключён */
        const sessionId = String(data.sessionId || "").replace(/[^\w]/g, "").slice(0, 64);

        if (!room) { socket.emit("room-error", "Неверный код комнаты"); return; }

        /* ── Выгоняем старый "призрак" того же пользователя ──
           Если sessionId уже есть в комнате (другой socketId) — это
           обновление страницы или повторное подключение. Удаляем старый
           сокет чтобы не плодить дубли. */
        if (sessionId) {
            if (!roomSessions.has(room)) roomSessions.set(room, new Map());
            const sessions = roomSessions.get(room);
            const oldSocketId = sessions.get(sessionId);
            if (oldSocketId && oldSocketId !== socket.id) {
                const oldSocket = io.sockets.sockets.get(oldSocketId);
                const members   = rooms.get(room);
                if (members && members.has(oldSocketId)) {
                    members.delete(oldSocketId);
                    /* ghost: true — подавляет тост "покинул" на клиенте,
                       т.к. пользователь фактически переподключился */
                    socket.to(room).emit("user-disconnected", { id: oldSocketId, ghost: true });
                    console.log(`[ghost] evicted old socket ${oldSocketId} for session ${sessionId}`);
                }
                if (oldSocket) { oldSocket.data.room = null; oldSocket.leave(room); }
            }
            sessions.set(sessionId, socket.id);
        }
        socket.data.sessionId = sessionId;

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

        if (!rooms.has(room)) {
            const m = new Map();
            m._creator = socket.id;   /* первый вошедший = создатель комнаты */
            rooms.set(room, m);
        }
        const members = rooms.get(room);

        /* Список уже присутствующих — новому участнику */
        const existingUsers = [...members.entries()].map(([id, u]) => ({
            id, name: u.name, avatar: u.avatar
        }));
        socket.emit("room-users", {
            users:     existingUsers,
            creatorId: members._creator || null
        });

        members.set(socket.id, { name, avatar });

        /* Уведомляем остальных */
        socket.to(room).emit("user-connected", { id: socket.id, name, avatar });

        console.log(`[join] ${name} → room=${room} (${members.size} participants)`);
    });

    /* ── Signaling — все три события проверяют членство в одной комнате ── */
    socket.on("offer", data => {
        if (!data.to || !sameRoom(socket, data.to)) return;
        /* Rate-limit: до 60 offer за 10 сек.
           Повышено с 30 → при 5 участниках все одновременно шлют offer новому,
           плюс возможны повторные offer при iceRestart — 30 было мало. */
        if (!rateLimit(socket.id, "offer", 60, 10_000)) {
            console.warn(`[RATE LIMIT] socket=${socket.id} event=offer dropped at ${new Date().toISOString()}`);
            return;
        }
        /* #66 — Проверяем что offer является объектом с типом SDP */
        if (!data.offer || typeof data.offer !== "object" || data.offer.type !== "offer") return;
        io.to(data.to).emit("offer", {
            offer:  data.offer,
            from:   socket.id,
            name:   socket.data.name   || "Участник",
            avatar: "default"
        });
    });

    socket.on("answer", data => {
        if (!data.to || !sameRoom(socket, data.to)) return;
        /* Rate-limit: до 30 answer за 10 сек */
        if (!rateLimit(socket.id, "answer", 30, 10_000)) return;
        /* #67 — Проверяем что answer является объектом с типом SDP */
        if (!data.answer || typeof data.answer !== "object" || data.answer.type !== "answer") return;
        io.to(data.to).emit("answer", { answer: data.answer, from: socket.id });
    });

    socket.on("ice-candidate", data => {
        if (!data.candidate) return;
        if (!data.to || !sameRoom(socket, data.to)) return;
        /* #62 — Rate-limit: ICE может генерировать много кандидатов, допускаем 300/10сек */
        if (!rateLimit(socket.id, "ice", 300, 10_000)) return;
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
        /* #63 — Rate-limit: 20 переключений за 10 сек */
        if (!rateLimit(socket.id, "screen", 20, 10_000)) return;
        /* #65 — Проверяем тип data.sharing */
        socket.to(room).emit("screen-share-state", {
            from:    socket.id,
            sharing: !!data.sharing
        });
    });

    /* ── Явный выход (beforeunload на клиенте) ──
       Срабатывает ДО того как браузер закроет WebSocket.
       Позволяет мгновенно убрать призрака без ожидания ping timeout. */
    socket.on("leave-room", () => {
        const room = socket.data.room;
        if (!room) return;
        socket.to(room).emit("user-disconnected", { id: socket.id });
        const members = rooms.get(room);
        if (members) {
            members.delete(socket.id);
            if (members.size === 0) {
                rooms.delete(room);
                roomSessions.delete(room);
            } else if (members._creator === socket.id) {
                const newCreatorId = members.keys().next().value;
                members._creator = newCreatorId;
                socket.to(room).emit("new-creator", { id: newCreatorId });
            }
        }
        const sid = socket.data.sessionId;
        if (sid) {
            const sessions = roomSessions.get(room);
            if (sessions && sessions.get(sid) === socket.id) sessions.delete(sid);
        }
        socket.data.room = null;
        socket.leave(room);
        console.log(`[leave-room] ${socket.data.name || socket.id} explicit leave from room=${room}`);
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
                /* Чистим sessionId только если этот сокет всё ещё актуальный */
                const sid = socket.data.sessionId;
                if (sid) {
                    const sessions = roomSessions.get(room);
                    if (sessions && sessions.get(sid) === socket.id) sessions.delete(sid);
                }
                if (members.size === 0) {
                    rooms.delete(room);
                    roomSessions.delete(room);
                } else if (members._creator === socket.id) {
                    /* #64 — Продвижение создателя: если создатель ушёл — назначаем
                       первого оставшегося участника новым создателем комнаты. */
                    const newCreatorId = members.keys().next().value;
                    members._creator = newCreatorId;
                    socket.to(room).emit("new-creator", { id: newCreatorId });
                    console.log(`[creator] ${newCreatorId} is now creator of room=${room}`);
                }
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
    /* Закрываем все сокет-соединения, чтобы server.close() завершился быстрее */
    io.disconnectSockets(true);
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
