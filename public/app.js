const params = new URLSearchParams(window.location.search);
const room   = params.get("room");
const name   = params.get("name");
const avatar = params.get("avatar") || "🙂";

// Если зашли по голой ссылке без никнейма — отправляем на главную,
// где код комнаты уже будет вставлен в поле "Войти в существующую"
if (!name || name === "null") {
    const redirect = room
        ? `/?room=${encodeURIComponent(room)}`
        : "/";
    window.location.replace(redirect);
    throw new Error("redirect"); // останавливаем выполнение скрипта
}

const socket = io();

document.getElementById("roomTitle").innerText = "Комната: " + room;

const videoGrid = document.getElementById("videoGrid");
const participantsDiv = document.getElementById("participants");

const micBtn    = document.getElementById("micBtn");
const camBtn    = document.getElementById("camBtn");
const flipBtn   = document.getElementById("flipBtn");
const screenBtn = document.getElementById("screenBtn");
const leaveBtn  = document.getElementById("leaveBtn");
const chatBtn   = document.getElementById("chatBtn");
const copyBtn   = document.getElementById("copyBtn");

let localStream  = null;
let screenStream = null;
const peerConnections = {};
const peerMeta    = {};
const makingOffer = {};   // предотвращает двойные offer'ы

let micEnabled    = false;
let camEnabled    = false;
let screenEnabled = false;
let facingMode    = "user"; // "user" = фронтальная, "environment" = основная

// AudioContext для определения говорящего
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

/* ── ICE SERVERS ── */
const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject", credential: "openrelayproject" },
        { urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject", credential: "openrelayproject" },
        { urls: "turns:openrelay.metered.ca:443",
          username: "openrelayproject", credential: "openrelayproject" }
    ]
};

/* ════════════════════════════════════════════
   УЧАСТНИКИ
════════════════════════════════════════════ */
function addParticipant(id, username) {
    if (document.getElementById("participant-" + id)) return;
    const div = document.createElement("div");
    div.className = "participant";
    div.id = "participant-" + id;
    div.innerText = username;
    participantsDiv.appendChild(div);
}
function removeParticipant(id) {
    const el = document.getElementById("participant-" + id);
    if (el) el.remove();
}

/* ════════════════════════════════════════════
   ВИДЕО-БЛОКИ
════════════════════════════════════════════ */
function createVideoBox(id, username, userAvatar) {
    if (document.getElementById("box-" + id)) return;
    const box = document.createElement("div");
    box.className = "video-box";
    box.id = "box-" + id;

    const av = document.createElement("div");
    av.className = "avatar";
    av.innerText = userAvatar;
    box.appendChild(av);

    const label = document.createElement("div");
    label.className = "name-label";
    label.id = "label-" + id;
    label.innerHTML = `${username} <span class="icon mic">🔇</span><span class="icon cam">🚫</span>`;
    box.appendChild(label);

    videoGrid.appendChild(box);
    updateGridLayout();
}

function showVideoInBox(id, stream, muted, isScreen) {
    const box = document.getElementById("box-" + id);
    if (!box) return;
    box.querySelector("video")?.remove();
    box.querySelector(".avatar")?.remove();

    const video = document.createElement("video");
    video.autoplay    = true;
    video.muted       = muted;
    video.srcObject   = stream;
    video.playsInline = true;
    if (isScreen) {
        video.classList.add("screen-video");
    } else if (id === "local" && facingMode === "user") {
        // Фронтальная камера: зеркалим локальный превью (как в FaceTime/Zoom).
        // На iOS Safari она уже зеркалится браузером, поэтому flip отменяет это.
        video.classList.add("flip-h");
    }
    box.insertBefore(video, document.getElementById("label-" + id));
}

function showAvatarInBox(id, userAvatar) {
    const box = document.getElementById("box-" + id);
    if (!box) return;
    box.querySelector("video")?.remove();
    if (!box.querySelector(".avatar")) {
        const av = document.createElement("div");
        av.className = "avatar";
        av.innerText = userAvatar;
        box.insertBefore(av, document.getElementById("label-" + id));
    }
}

function removeVideoBox(id) {
    document.getElementById("box-" + id)?.remove();
    removeParticipant(id);
    peerConnections[id]?.close();
    delete peerConnections[id];
    delete makingOffer[id];
    delete peerMeta[id];
    updateGridLayout();
}

/* ── Динамический размер сетки ── */
function updateGridLayout() {
    const count = videoGrid.querySelectorAll(".video-box").length;
    if (count <= 1) {
        videoGrid.style.gridTemplateColumns = "1fr";
        videoGrid.style.gridAutoRows = "minmax(200px, 1fr)";
        videoGrid.style.alignContent = "stretch";
    } else if (count <= 4) {
        videoGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
        videoGrid.style.gridAutoRows = "minmax(180px, 1fr)";
        videoGrid.style.alignContent = "stretch";
    } else {
        videoGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(240px, 1fr))";
        videoGrid.style.gridAutoRows = "220px";
        videoGrid.style.alignContent = "start";
    }
}

/* ════════════════════════════════════════════
   ИНДИКАТОР ГОВОРЯЩЕГО
════════════════════════════════════════════ */
const speakingTimers = {};

function monitorSpeaking(id, stream) {
    try {
        const ctx      = getAudioCtx();
        const source   = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        function check() {
            if (!document.getElementById("box-" + id)) return; // пир ушёл
            analyser.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            const avg = sum / data.length;
            const box = document.getElementById("box-" + id);
            if (!box) return;
            if (avg > 12) {
                box.classList.add("speaking");
                clearTimeout(speakingTimers[id]);
                speakingTimers[id] = setTimeout(() => box.classList.remove("speaking"), 600);
            }
            requestAnimationFrame(check);
        }
        requestAnimationFrame(check);
    } catch (e) {
        // AudioContext недоступен — пропускаем
    }
}

/* ════════════════════════════════════════════
   ФОКУС: КЛИК НА ВИДЕО → РАЗВОРАЧИВАЕТСЯ
════════════════════════════════════════════ */
const backdrop = document.createElement("div");
backdrop.id = "videoBackdrop";
document.body.appendChild(backdrop);

function expandBox(box) {
    document.querySelectorAll(".video-box.expanded").forEach(b => b.classList.remove("expanded"));
    box.classList.add("expanded");
    backdrop.classList.add("active");
    // contain для любого видео в раскрытом боксе
    const vid = box.querySelector("video");
    if (vid) vid.style.objectFit = "contain";
}

function collapseAll() {
    document.querySelectorAll(".video-box.expanded").forEach(box => {
        box.classList.remove("expanded");
        const vid = box.querySelector("video");
        if (vid) vid.style.objectFit = "";
    });
    backdrop.classList.remove("active");
}

backdrop.addEventListener("click", collapseAll);
document.addEventListener("keydown", e => { if (e.key === "Escape") collapseAll(); });

videoGrid.addEventListener("click", e => {
    const box = e.target.closest(".video-box");
    if (!box) return;
    if (box.classList.contains("expanded")) {
        collapseAll();
    } else {
        expandBox(box);
    }
});

/* ════════════════════════════════════════════
   COPY LINK
════════════════════════════════════════════ */
if (copyBtn) {
    copyBtn.onclick = e => {
        e.stopPropagation();
        const url = `${location.origin}/room.html?room=${encodeURIComponent(room)}`;
        navigator.clipboard.writeText(url).then(() => {
            copyBtn.innerText = "✅";
            setTimeout(() => copyBtn.innerText = "🔗", 2000);
        }).catch(() => {
            const inp = document.createElement("input");
            inp.value = url;
            document.body.appendChild(inp);
            inp.select();
            document.execCommand("copy");
            inp.remove();
            copyBtn.innerText = "✅";
            setTimeout(() => copyBtn.innerText = "🔗", 2000);
        });
    };
}

/* ════════════════════════════════════════════
   МОБИЛЬНЫЙ ЧАТ
════════════════════════════════════════════ */
const sidebar = document.querySelector(".sidebar");
if (chatBtn && sidebar) {
    chatBtn.onclick = () => {
        sidebar.classList.toggle("mobile-open");
        chatBtn.style.background = sidebar.classList.contains("mobile-open") ? "#3b82f6" : "";
    };
}

/* ════════════════════════════════════════════
   ДОСТУП К КАМЕРЕ / МИКРОФОНУ
════════════════════════════════════════════ */
async function startCamera(facing) {
    const mode = facing || facingMode;
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: true
        });
    } catch (_) {
        // Если конкретная камера недоступна — пробуем без ограничений
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (e) {
            alert("Нет доступа к камере/микрофону: " + e.message);
            return;
        }
    }
    localStream.getAudioTracks().forEach(t => t.enabled = micEnabled);
    localStream.getVideoTracks().forEach(t => t.enabled = camEnabled);
}

/* ── Переключить между фронтальной и основной камерой ── */
async function switchCamera() {
    if (!camEnabled) return;

    facingMode = (facingMode === "user") ? "environment" : "user";

    try {
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: false
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        newVideoTrack.enabled = true;

        // Заменяем видео-трек в localStream
        const oldTrack = localStream?.getVideoTracks()[0];
        if (oldTrack) { oldTrack.stop(); localStream.removeTrack(oldTrack); }
        localStream.addTrack(newVideoTrack);

        // Заменяем трек во всех peer-соединениях
        for (const [, pc] of Object.entries(peerConnections)) {
            const sender = pc.getSenders().find(s => s.track?.kind === "video");
            if (sender) sender.replaceTrack(newVideoTrack).catch(() => {});
        }

        showVideoInBox("local", localStream, true, false);
    } catch (e) {
        alert("Не удалось переключить камеру: " + e.message);
        // Откатываем
        facingMode = (facingMode === "user") ? "environment" : "user";
    }
}

/* ── Добавить/заменить трек во всех соединениях ── */
function addTrackToPeers(track, stream) {
    for (const [, pc] of Object.entries(peerConnections)) {
        const existing = pc.getSenders().find(s => s.track && s.track.kind === track.kind);
        if (existing) {
            existing.replaceTrack(track).catch(() => {});
        } else {
            pc.addTrack(track, stream); // автоматически вызовет onnegotiationneeded
        }
    }
}

/* ════════════════════════════════════════════
   PEER CONNECTION (с perfect negotiation)
════════════════════════════════════════════ */
function createPeer(id) {
    if (peerConnections[id]) return peerConnections[id];

    const pc = new RTCPeerConnection(servers);
    makingOffer[id] = false;

    // Автоматическая перестройка при добавлении треков ПОСЛЕ соединения
    pc.onnegotiationneeded = async () => {
        if (makingOffer[id]) return; // уже создаём offer — пропускаем
        try {
            makingOffer[id] = true;
            const offer = await pc.createOffer();
            if (pc.signalingState !== "stable") return;
            await pc.setLocalDescription(offer);
            socket.emit("offer", { offer: pc.localDescription, to: id });
        } catch (e) {
            console.error("onnegotiationneeded:", e);
        } finally {
            makingOffer[id] = false;
        }
    };

    pc.ontrack = e => {
        const meta = peerMeta[id] || { name: "Участник", avatar: "🙂" };
        if (!document.getElementById("box-" + id)) createVideoBox(id, meta.name, meta.avatar);
        showVideoInBox(id, e.streams[0], false, false);
        // Запускаем детектор речи для входящего аудио
        monitorSpeaking(id, e.streams[0]);
    };

    pc.onicecandidate = e => {
        if (e.candidate) socket.emit("ice-candidate", { candidate: e.candidate, to: id });
    };

    pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") pc.restartIce();
        if (pc.connectionState === "closed") removeVideoBox(id);
    };

    peerConnections[id] = pc;
    return pc;
}

/* ════════════════════════════════════════════
   SOCKET СОБЫТИЯ
════════════════════════════════════════════ */
socket.emit("join-room", { room, name, avatar });

// Уже существующие в комнате — готовим peer'ы, OFFER придёт от них через user-connected
socket.on("room-users", existingUsers => {
    for (const user of existingUsers) {
        peerMeta[user.id] = { name: user.name, avatar: user.avatar };
        addParticipant(user.id, user.name);
        createVideoBox(user.id, user.name, user.avatar);
        createPeer(user.id);
    }
});

// Новый участник зашёл — МЫ создаём offer (мы старожилы)
socket.on("user-connected", async data => {
    peerMeta[data.id] = { name: data.name, avatar: data.avatar || "🙂" };
    addParticipant(data.id, data.name);
    createVideoBox(data.id, data.name, data.avatar || "🙂");

    const pc = createPeer(data.id);

    // Добавляем ВСЕ текущие треки: и камеру/микрофон, и демонстрацию
    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (!pc.getSenders().find(s => s.track === track)) pc.addTrack(track, localStream);
        });
    }
    if (screenEnabled && screenStream) {
        const st = screenStream.getVideoTracks()[0];
        if (st && !pc.getSenders().find(s => s.track === st)) pc.addTrack(st, screenStream);
    }

    // ВСЕГДА явно создаём offer — не полагаемся только на onnegotiationneeded,
    // чтобы новый участник гарантированно получил все треки
    try {
        makingOffer[data.id] = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { offer: pc.localDescription, to: data.id });
    } catch (e) {
        console.error("user-connected offer:", e);
    } finally {
        makingOffer[data.id] = false;
    }
});

// Получили offer — perfect negotiation с rollback при коллизии
socket.on("offer", async data => {
    if (data.name) {
        peerMeta[data.from] = { name: data.name, avatar: data.avatar || "🙂" };
        if (!document.getElementById("box-" + data.from)) {
            createVideoBox(data.from, data.name, data.avatar || "🙂");
            addParticipant(data.from, data.name);
        } else {
            const label = document.getElementById("label-" + data.from);
            if (label) label.innerHTML = `${data.name} <span class="icon mic">🔇</span><span class="icon cam">🚫</span>`;
        }
    }

    const pc = createPeer(data.from);

    const collision = makingOffer[data.from] || pc.signalingState !== "stable";
    if (collision) {
        const polite = socket.id > data.from;
        if (!polite) return; // мы важнее — игнорируем их offer
        try {
            await pc.setLocalDescription({ type: "rollback" });
        } catch (e) {
            console.warn("rollback failed:", e);
            return;
        }
    }

    // Добавляем свои треки
    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (!pc.getSenders().find(s => s.track === track)) pc.addTrack(track, localStream);
        });
    }

    await pc.setRemoteDescription(data.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", { answer: pc.localDescription, to: data.from });
});

socket.on("answer", async data => {
    const pc = peerConnections[data.from];
    if (pc && pc.signalingState === "have-local-offer") {
        try { await pc.setRemoteDescription(data.answer); } catch (e) {}
    }
});

socket.on("ice-candidate", async data => {
    const pc = peerConnections[data.from];
    if (pc) try { await pc.addIceCandidate(data.candidate); } catch (e) {}
});

socket.on("user-disconnected", data => removeVideoBox(data.id));

socket.on("screen-share-state", data => {
    const box = document.getElementById("box-" + data.from);
    if (!box) return;
    const vid = box.querySelector("video");
    if (vid) vid.classList.toggle("screen-video", data.sharing);
});

/* ════════════════════════════════════════════
   ИКОНКИ / СОСТОЯНИЕ МЕДИА
════════════════════════════════════════════ */
function updateLabelIcons(id, micOn, camOn) {
    const label = document.getElementById("label-" + id);
    if (!label) return;
    label.querySelector(".mic").innerText = micOn ? "🎤" : "🔇";
    label.querySelector(".cam").innerText = camOn ? "📷" : "🚫";
}
function emitMediaState() {
    socket.emit("media-state", { mic: micEnabled, cam: camEnabled });
}
socket.on("media-state", data => updateLabelIcons(data.from, data.mic, data.cam));

/* ════════════════════════════════════════════
   КНОПКА МИКРОФОН
════════════════════════════════════════════ */
micBtn.onclick = async () => {
    if (!localStream) await startCamera();
    if (!localStream) return;

    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(t => {
        t.enabled = micEnabled;
        addTrackToPeers(t, localStream);
    });

    micBtn.innerText = micEnabled ? "🎤" : "🔇";
    micBtn.style.background = micEnabled ? "#22c55e" : "";
    updateLabelIcons("local", micEnabled, camEnabled);
    emitMediaState();

    // Запускаем индикатор речи для себя когда включаем микрофон
    if (micEnabled) monitorSpeaking("local", localStream);
};

/* ════════════════════════════════════════════
   КНОПКА КАМЕРА
════════════════════════════════════════════ */
camBtn.onclick = async () => {
    if (!localStream) await startCamera();
    if (!localStream) return;

    camEnabled = !camEnabled;
    localStream.getVideoTracks().forEach(t => {
        t.enabled = camEnabled;
        addTrackToPeers(t, localStream);
    });

    camBtn.innerText = camEnabled ? "📷" : "🚫";
    camBtn.style.background = camEnabled ? "#22c55e" : "";
    updateLabelIcons("local", micEnabled, camEnabled);
    emitMediaState();

    // Кнопка переключения камеры — только когда камера включена
    if (flipBtn) flipBtn.style.display = camEnabled ? "" : "none";

    if (camEnabled) showVideoInBox("local", localStream, true, false);
    else            showAvatarInBox("local", avatar);
};

/* ── КНОПКА ПЕРЕКЛЮЧЕНИЯ КАМЕРЫ ── */
if (flipBtn) {
    flipBtn.style.display = "none"; // скрыта пока камера выключена
    flipBtn.onclick = () => switchCamera();
}

/* ════════════════════════════════════════════
   ДЕМОНСТРАЦИЯ ЭКРАНА
════════════════════════════════════════════ */
screenBtn.onclick = async () => {
    if (screenEnabled) {
        screenStream?.getTracks().forEach(t => t.stop());
        screenStream    = null;
        screenEnabled   = false;
        screenBtn.style.background = "";
        socket.emit("screen-share-state", { sharing: false });

        if (localStream) {
            const camTrack = localStream.getVideoTracks()[0];
            if (camTrack) {
                for (const [, pc] of Object.entries(peerConnections)) {
                    const s = pc.getSenders().find(s => s.track?.kind === "video");
                    if (s) s.replaceTrack(camTrack).catch(() => {});
                }
            }
        }
        if (camEnabled && localStream) showVideoInBox("local", localStream, true, false);
        else showAvatarInBox("local", avatar);
        return;
    }

    try {
        screenStream  = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenEnabled = true;
        screenBtn.style.background = "#22c55e";
        socket.emit("screen-share-state", { sharing: true });

        const screenTrack = screenStream.getVideoTracks()[0];
        for (const [, pc] of Object.entries(peerConnections)) {
            const s = pc.getSenders().find(s => s.track?.kind === "video");
            if (s) s.replaceTrack(screenTrack).catch(() => {});
            else   pc.addTrack(screenTrack, screenStream);
        }
        showVideoInBox("local", screenStream, true, true);

        screenTrack.onended = () => { if (screenEnabled) screenBtn.click(); };
    } catch (e) {
        if (e.name !== "NotAllowedError") alert("Не удалось начать демонстрацию: " + e.message);
    }
};

/* ════════════════════════════════════════════
   ВЫХОД
════════════════════════════════════════════ */
leaveBtn.onclick = () => {
    Object.values(peerConnections).forEach(pc => pc.close());
    localStream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    window.location = "/";
};

/* ── Начальный рендер ── */
createVideoBox("local", name, avatar);
addParticipant("local", name);
updateGridLayout();
