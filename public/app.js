const socket = io();

const params = new URLSearchParams(window.location.search);
const room = params.get("room");
const name = params.get("name");
const avatar = params.get("avatar") || "🙂";

document.getElementById("roomTitle").innerText = "Комната: " + room;

const videoGrid = document.getElementById("videoGrid");
const participantsDiv = document.getElementById("participants");

const micBtn = document.getElementById("micBtn");
const camBtn = document.getElementById("camBtn");
const screenBtn = document.getElementById("screenBtn");
const leaveBtn = document.getElementById("leaveBtn");
const chatBtn = document.getElementById("chatBtn");
const copyBtn = document.getElementById("copyBtn");

let localStream = null;
let screenStream = null;
const peerConnections = {};
const peerMeta = {};

// Флаги для обнаружения коллизий offer/answer (perfect negotiation)
const makingOffer = {};

let micEnabled = false;
let camEnabled = false;
let screenEnabled = false;

// ICE: STUN + TURN серверы для работы через NAT/фаерволы
const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
        },
        {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject"
        },
        {
            urls: "turns:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject"
        }
    ]
};

/* ── PARTICIPANTS LIST ── */

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

/* ── VIDEO BOX ── */

function createVideoBox(id, username, userAvatar) {
    if (document.getElementById("box-" + id)) return;
    const box = document.createElement("div");
    box.className = "video-box";
    box.id = "box-" + id;

    const avatarDiv = document.createElement("div");
    avatarDiv.className = "avatar";
    avatarDiv.innerText = userAvatar;
    box.appendChild(avatarDiv);

    const label = document.createElement("div");
    label.className = "name-label";
    label.id = "label-" + id;
    label.innerHTML = `${username} <span class="icon mic">🔇</span><span class="icon cam">🚫</span>`;
    box.appendChild(label);

    videoGrid.appendChild(box);
}

function showVideoInBox(id, stream, muted, isScreen) {
    const box = document.getElementById("box-" + id);
    if (!box) return;

    const existingVideo = box.querySelector("video");
    if (existingVideo) existingVideo.remove();

    const existingAvatar = box.querySelector(".avatar");
    if (existingAvatar) existingAvatar.remove();

    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = muted;
    video.srcObject = stream;
    video.playsInline = true;
    if (isScreen) video.classList.add("screen-video");

    const label = document.getElementById("label-" + id);
    box.insertBefore(video, label);
}

function showAvatarInBox(id, userAvatar) {
    const box = document.getElementById("box-" + id);
    if (!box) return;

    const existingVideo = box.querySelector("video");
    if (existingVideo) existingVideo.remove();

    if (!box.querySelector(".avatar")) {
        const avatarDiv = document.createElement("div");
        avatarDiv.className = "avatar";
        avatarDiv.innerText = userAvatar;
        const label = document.getElementById("label-" + id);
        box.insertBefore(avatarDiv, label);
    }
}

function removeVideoBox(id) {
    const box = document.getElementById("box-" + id);
    if (box) box.remove();
    removeParticipant(id);
    if (peerConnections[id]) {
        peerConnections[id].close();
        delete peerConnections[id];
    }
    delete makingOffer[id];
    delete peerMeta[id];
}

/* ── LOCAL BOX ── */

createVideoBox("local", name, avatar);
addParticipant("local", name);

/* ── COPY LINK ── */

if (copyBtn) {
    copyBtn.onclick = () => {
        const url = `${window.location.origin}/room.html?room=${encodeURIComponent(room)}`;
        navigator.clipboard.writeText(url).then(() => {
            copyBtn.innerText = "✅";
            setTimeout(() => copyBtn.innerText = "🔗", 2000);
        }).catch(() => {
            const input = document.createElement("input");
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            copyBtn.innerText = "✅";
            setTimeout(() => copyBtn.innerText = "🔗", 2000);
        });
    };
}

/* ── MOBILE CHAT TOGGLE ── */

const sidebar = document.querySelector(".sidebar");
if (chatBtn && sidebar) {
    chatBtn.onclick = () => {
        sidebar.classList.toggle("mobile-open");
        chatBtn.style.background = sidebar.classList.contains("mobile-open") ? "#3b82f6" : "";
    };
}

/* ── CAMERA / MIC ACCESS ── */

async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.getAudioTracks().forEach(t => t.enabled = micEnabled);
        localStream.getVideoTracks().forEach(t => t.enabled = camEnabled);
    } catch (e) {
        alert("Не удалось получить доступ к камере/микрофону: " + e.message);
    }
}

/* ── ДОБАВИТЬ ТРЕК ВО ВСЕ СОЕДИНЕНИЯ ──
   Заменяем если трек такого типа уже есть, иначе добавляем новый.
   При добавлении нового трека onnegotiationneeded срабатывает автоматически. */

function addTrackToPeers(track, stream) {
    for (const [id, pc] of Object.entries(peerConnections)) {
        const existingSender = pc.getSenders().find(s => s.track && s.track.kind === track.kind);
        if (existingSender) {
            existingSender.replaceTrack(track).catch(e => console.error("replaceTrack:", e));
        } else {
            pc.addTrack(track, stream);
            // onnegotiationneeded запустится автоматически
        }
    }
}

function removeTrackFromPeers(kind) {
    for (const [id, pc] of Object.entries(peerConnections)) {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === kind);
        if (sender) {
            pc.removeTrack(sender);
            // onnegotiationneeded запустится автоматически
        }
    }
}

/* ── PEER CONNECTION ── */

function createPeer(id) {
    if (peerConnections[id]) return peerConnections[id];

    const pc = new RTCPeerConnection(servers);
    makingOffer[id] = false;

    // Автоматическая перестройка соединения при добавлении новых треков
    pc.onnegotiationneeded = async () => {
        try {
            makingOffer[id] = true;
            const offer = await pc.createOffer();
            // Убеждаемся что состояние не изменилось пока мы await-или
            if (pc.signalingState !== "stable") return;
            await pc.setLocalDescription(offer);
            socket.emit("offer", { offer: pc.localDescription, to: id });
        } catch (e) {
            console.error("onnegotiationneeded error:", e);
        } finally {
            makingOffer[id] = false;
        }
    };

    pc.ontrack = e => {
        const meta = peerMeta[id] || { name: "Участник", avatar: "🙂" };
        if (!document.getElementById("box-" + id)) {
            createVideoBox(id, meta.name, meta.avatar);
        }
        showVideoInBox(id, e.streams[0], false, false);
    };

    pc.onicecandidate = e => {
        if (e.candidate) {
            socket.emit("ice-candidate", { candidate: e.candidate, to: id });
        }
    };

    pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "failed") {
            // Попытка перезапуска ICE при сбое
            pc.restartIce();
        }
        if (state === "closed") {
            removeVideoBox(id);
        }
    };

    peerConnections[id] = pc;
    return pc;
}

/* ── SOCKET EVENTS ── */

socket.emit("join-room", { room, name, avatar });

// Получили список тех, кто УЖЕ в комнате.
// Мы — новый участник, они создадут offer'ы нам через user-connected на своей стороне.
// Нам нужно только подготовить peer-соединения и показать их в UI.
socket.on("room-users", existingUsers => {
    for (const user of existingUsers) {
        peerMeta[user.id] = { name: user.name, avatar: user.avatar };
        addParticipant(user.id, user.name);
        createVideoBox(user.id, user.name, user.avatar);
        createPeer(user.id); // готовим соединение, offer придёт от них
    }
});

// Кто-то новый зашёл в комнату — МЫ (уже существующий участник) создаём offer
socket.on("user-connected", async data => {
    peerMeta[data.id] = { name: data.name, avatar: data.avatar || "🙂" };
    addParticipant(data.id, data.name);
    createVideoBox(data.id, data.name, data.avatar || "🙂");

    const pc = createPeer(data.id);

    // Добавляем текущие треки — это автоматически запустит onnegotiationneeded
    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (!pc.getSenders().find(s => s.track === track)) {
                pc.addTrack(track, localStream);
            }
        });
    }

    // Если треков нет — всё равно нужно создать соединение с offer
    if (!localStream || pc.getSenders().length === 0) {
        try {
            makingOffer[data.id] = true;
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", { offer: pc.localDescription, to: data.id });
        } catch (e) {
            console.error("Initial offer error:", e);
        } finally {
            makingOffer[data.id] = false;
        }
    }
    // Если треки добавлены — onnegotiationneeded сам создаст offer
});

// Получили offer — обрабатываем с защитой от коллизий (perfect negotiation)
socket.on("offer", async data => {
    if (data.name) {
        peerMeta[data.from] = { name: data.name, avatar: data.avatar || "🙂" };
        if (!document.getElementById("box-" + data.from)) {
            createVideoBox(data.from, data.name, data.avatar || "🙂");
            addParticipant(data.from, data.name);
        } else {
            const label = document.getElementById("label-" + data.from);
            if (label) {
                label.innerHTML = `${data.name} <span class="icon mic">🔇</span><span class="icon cam">🚫</span>`;
            }
        }
    }

    const pc = createPeer(data.from);

    // Обнаружение коллизии: мы тоже пытаемся создать offer к этому же пиру
    const collision = makingOffer[data.from] || pc.signalingState !== "stable";

    if (collision) {
        // Полите-пир (с большим socket.id) уступает: откатывает свой offer
        // Имполите-пир (с меньшим socket.id) игнорирует чужой offer
        const polite = socket.id > data.from;
        if (!polite) {
            console.log("Collision: ignoring offer from", data.from);
            return;
        }
        // Мы — полите, откатываем наш offer
        try {
            await pc.setLocalDescription({ type: "rollback" });
        } catch (e) {
            // Rollback не поддерживается в старых браузерах
            console.warn("Rollback not supported, ignoring offer:", e);
            return;
        }
    }

    // Добавляем свои треки в это соединение
    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (!pc.getSenders().find(s => s.track === track)) {
                pc.addTrack(track, localStream);
            }
        });
    }

    await pc.setRemoteDescription(data.offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", { answer: pc.localDescription, to: data.from });
});

socket.on("answer", async data => {
    const pc = peerConnections[data.from];
    if (!pc) return;
    // Принимаем answer только если ждём его
    if (pc.signalingState === "have-local-offer") {
        try {
            await pc.setRemoteDescription(data.answer);
        } catch (e) {
            console.error("setRemoteDescription answer error:", e);
        }
    }
});

socket.on("ice-candidate", async data => {
    const pc = peerConnections[data.from];
    if (!pc) return;
    try {
        await pc.addIceCandidate(data.candidate);
    } catch (e) {
        // Игнорируем если пир уже закрыт
    }
});

socket.on("user-disconnected", data => {
    removeVideoBox(data.id);
});

// Демонстрация экрана у другого участника: переключаем object-fit
socket.on("screen-share-state", data => {
    const box = document.getElementById("box-" + data.from);
    if (!box) return;
    const video = box.querySelector("video");
    if (!video) return;
    if (data.sharing) {
        video.classList.add("screen-video");
    } else {
        video.classList.remove("screen-video");
    }
});

/* ── ICON HELPERS ── */

function updateLabelIcons(id, micOn, camOn) {
    const label = document.getElementById("label-" + id);
    if (!label) return;
    const micIcon = label.querySelector(".mic");
    const camIcon = label.querySelector(".cam");
    if (micIcon) micIcon.innerText = micOn ? "🎤" : "🔇";
    if (camIcon) camIcon.innerText = camOn ? "📷" : "🚫";
}

function emitMediaState() {
    socket.emit("media-state", { mic: micEnabled, cam: camEnabled });
}

socket.on("media-state", data => {
    updateLabelIcons(data.from, data.mic, data.cam);
});

/* ── MIC BUTTON ── */

micBtn.onclick = async () => {
    if (!localStream) await startCamera();
    if (!localStream) return;

    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(t => {
        t.enabled = micEnabled;
        // Добавляем трек в соединения если ещё не добавлен
        addTrackToPeers(t, localStream);
    });

    micBtn.innerText = micEnabled ? "🎤" : "🔇";
    micBtn.style.background = micEnabled ? "#22c55e" : "";
    updateLabelIcons("local", micEnabled, camEnabled);
    emitMediaState();
};

/* ── CAM BUTTON ── */

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

    if (camEnabled) {
        showVideoInBox("local", localStream, true, false);
    } else {
        showAvatarInBox("local", avatar);
    }
};

/* ── SCREEN SHARE BUTTON ── */

screenBtn.onclick = async () => {

    if (screenEnabled) {
        if (screenStream) {
            screenStream.getTracks().forEach(t => t.stop());
            screenStream = null;
        }
        screenEnabled = false;
        screenBtn.style.background = "";

        socket.emit("screen-share-state", { sharing: false });

        // Возвращаем камеру вместо экрана
        if (localStream) {
            const camTrack = localStream.getVideoTracks()[0];
            if (camTrack) {
                for (const [id, pc] of Object.entries(peerConnections)) {
                    const sender = pc.getSenders().find(s => s.track && s.track.kind === "video");
                    if (sender) sender.replaceTrack(camTrack).catch(() => {});
                }
            }
        }

        if (camEnabled && localStream) {
            showVideoInBox("local", localStream, true, false);
        } else {
            showAvatarInBox("local", avatar);
        }
        return;
    }

    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenEnabled = true;
        screenBtn.style.background = "#22c55e";

        socket.emit("screen-share-state", { sharing: true });

        const screenTrack = screenStream.getVideoTracks()[0];

        for (const [id, pc] of Object.entries(peerConnections)) {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === "video");
            if (sender) {
                sender.replaceTrack(screenTrack).catch(() => {});
            } else {
                pc.addTrack(screenTrack, screenStream);
                // onnegotiationneeded сработает автоматически
            }
        }

        showVideoInBox("local", screenStream, true, true);

        screenTrack.onended = () => {
            if (screenEnabled) screenBtn.click();
        };

    } catch (e) {
        if (e.name !== "NotAllowedError") {
            alert("Не удалось начать демонстрацию экрана: " + e.message);
        }
    }
};

/* ── LEAVE BUTTON ── */

leaveBtn.onclick = () => {
    Object.values(peerConnections).forEach(pc => pc.close());
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    window.location = "/";
};
