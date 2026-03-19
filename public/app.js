const params   = new URLSearchParams(window.location.search);
const room     = params.get("room");
const name     = params.get("name");
const avatar   = params.get("avatar") || "🙂";
const initMic  = params.get("mic") === "1";
const initCam  = params.get("cam") === "1";
const initGain = Math.max(0, Math.min(2, parseInt(params.get("micGain") || "100") / 100));

/* Без имени → на главную */
if (!name || name === "null") {
    window.location.replace(room ? `/?room=${encodeURIComponent(room)}` : "/");
    throw new Error("redirect");
}

/* ════════════════════════════════════════════
   SVG ИКОНКИ
════════════════════════════════════════════ */
const ICONS = {
    micOn:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`,
    micOff: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
    camOn:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
    camOff: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06A4 4 0 1 1 7.72 7.72"/></svg>`,
    screenOn:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polyline points="8 10 12 6 16 10"/></svg>`,
    screenOff: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    copyLink: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    copied:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    labelMicOn:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
    labelMicOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2"/></svg>`,
    labelCamOn:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
    labelCamOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/></svg>`,
};

const socket = io();

document.getElementById("roomTitle").innerText = room;

const videoGrid       = document.getElementById("videoGrid");
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
const peerMeta        = {};
const makingOffer     = {};

/* ── Состояние ── */
let micEnabled    = initMic;
let camEnabled    = initCam;
let screenEnabled = false;
let facingMode    = "user";
let cameraStarting = false; /* guard против двойного getUserMedia */

/* ── ICE-кандидаты, пришедшие до remoteDescription ── */
const pendingCandidates = {};

/* ── <audio> для участников без камеры ── */
const peerAudioEls = {};

/* ── Отмена speakingMonitor ── */
const speakingCancels = {};

/* ── AudioContext ── */
let audioCtx    = null;
let micGainNode = null;

function getAudioCtx() {
    if (!audioCtx || audioCtx.state === "closed") {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

/* Применяем усиление микрофона из лобби.
   Создаёт обработанный поток через GainNode → MediaStreamAudioDestinationNode. */
function buildGainedStream(rawStream, gain) {
    try {
        const ctx  = getAudioCtx();
        const src  = ctx.createMediaStreamSource(rawStream);
        const gn   = ctx.createGain();
        gn.gain.value = gain;
        micGainNode   = gn;
        const dest    = ctx.createMediaStreamDestination();
        src.connect(gn);
        gn.connect(dest);
        const out = new MediaStream();
        rawStream.getVideoTracks().forEach(t => out.addTrack(t));
        dest.stream.getAudioTracks().forEach(t => out.addTrack(t));
        return out;
    } catch (e) {
        micGainNode = null;
        return rawStream;
    }
}

/* ── ICE СЕРВЕРЫ ── */
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
    document.getElementById("participant-" + id)?.remove();
}

/* ════════════════════════════════════════════
   ВИДЕО-БЛОКИ
════════════════════════════════════════════ */
function makeLabelHTML(username, micOn, camOn) {
    const mic = micOn ? `<span class="icon mic-on">${ICONS.labelMicOn}</span>`
                      : `<span class="icon mic-off">${ICONS.labelMicOff}</span>`;
    const cam = camOn ? `<span class="icon cam-on">${ICONS.labelCamOn}</span>`
                      : `<span class="icon cam-off">${ICONS.labelCamOff}</span>`;
    return `<span class="label-name">${escapeHtml(username)}</span>${mic}${cam}`;
}

function escapeHtml(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

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
    label.innerHTML = makeLabelHTML(username, false, false);
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

/* Аудио для участника без камеры */
function ensureRemoteAudio(id, stream) {
    if (peerAudioEls[id]) {
        peerAudioEls[id].srcObject = stream;
        return;
    }
    const audio = document.createElement("audio");
    audio.autoplay  = true;
    audio.srcObject = stream;
    document.body.appendChild(audio);
    peerAudioEls[id] = audio;
}

function removeVideoBox(id) {
    /* Останавливаем speaking monitor */
    if (speakingCancels[id]) { speakingCancels[id](); delete speakingCancels[id]; }
    /* Убираем audio-only элемент */
    if (peerAudioEls[id]) {
        peerAudioEls[id].srcObject = null;
        peerAudioEls[id].remove();
        delete peerAudioEls[id];
    }
    /* Убираем screen audio */
    removeRemoteScreenAudio(id);
    /* Убираем видео-блок */
    document.getElementById("box-" + id)?.remove();
    removeParticipant(id);
    peerConnections[id]?.close();
    delete peerConnections[id];
    delete makingOffer[id];
    delete peerMeta[id];
    delete pendingCandidates[id];
    updateGridLayout();
}

/* ── Динамическая сетка ── */
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
   С автоматической очисткой — не создаём дублей
════════════════════════════════════════════ */
function monitorSpeaking(id, stream) {
    /* Отменяем предыдущий монитор для этого id */
    if (speakingCancels[id]) { speakingCancels[id](); }

    try {
        const ctx      = getAudioCtx();
        const source   = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        let rafId;
        let cancelled = false;

        speakingCancels[id] = () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            try { source.disconnect(); } catch (e) {}
        };

        function check() {
            if (cancelled) return;
            if (!document.getElementById("box-" + id)) {
                speakingCancels[id]?.();
                return;
            }
            analyser.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            const box = document.getElementById("box-" + id);
            if (box) {
                if (sum / data.length > 12) {
                    box.classList.add("speaking");
                    clearTimeout(box._speakTimer);
                    box._speakTimer = setTimeout(() => box.classList.remove("speaking"), 600);
                }
            }
            rafId = requestAnimationFrame(check);
        }
        rafId = requestAnimationFrame(check);
    } catch (e) { /* AudioContext недоступен */ }
}

/* ════════════════════════════════════════════
   КЛИК ДЛЯ РАЗВОРАЧИВАНИЯ ВИДЕО
════════════════════════════════════════════ */
const backdrop = document.createElement("div");
backdrop.id = "videoBackdrop";
document.body.appendChild(backdrop);

function expandBox(box) {
    document.querySelectorAll(".video-box.expanded").forEach(b => b.classList.remove("expanded"));
    box.classList.add("expanded");
    backdrop.classList.add("active");
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
    box.classList.contains("expanded") ? collapseAll() : expandBox(box);
});

/* ════════════════════════════════════════════
   КОПИРОВАНИЕ ССЫЛКИ
════════════════════════════════════════════ */
if (copyBtn) {
    copyBtn.onclick = e => {
        e.stopPropagation();
        const url = `${location.origin}/room.html?room=${encodeURIComponent(room)}`;
        const restore = () => setTimeout(() => { copyBtn.innerHTML = ICONS.copyLink; }, 2000);
        navigator.clipboard.writeText(url).then(() => {
            copyBtn.innerHTML = ICONS.copied;
            restore();
        }).catch(() => {
            const inp = document.createElement("input");
            inp.value = url; document.body.appendChild(inp); inp.select();
            document.execCommand("copy"); inp.remove();
            copyBtn.innerHTML = ICONS.copied;
            restore();
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
        chatBtn.classList.toggle("btn-active", sidebar.classList.contains("mobile-open"));
    };
}

/* ════════════════════════════════════════════
   ДОСТУП К КАМЕРЕ / МИКРОФОНУ
════════════════════════════════════════════ */
async function startCamera(facing) {
    if (cameraStarting) return; /* Защита от двойного вызова */
    cameraStarting = true;
    const mode = facing || facingMode;
    let rawStream;
    try {
        rawStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode }, audio: true
        });
    } catch (_) {
        try {
            rawStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (e) {
            alert("Нет доступа к камере/микрофону: " + e.message);
            cameraStarting = false;
            return;
        }
    }
    localStream = (initGain !== 1) ? buildGainedStream(rawStream, initGain) : rawStream;
    localStream.getAudioTracks().forEach(t => t.enabled = micEnabled);
    localStream.getVideoTracks().forEach(t => t.enabled = camEnabled);
    cameraStarting = false;
}

/* ── Переключение фронтальной / задней камеры ── */
async function switchCamera() {
    /* Не переключать во время демонстрации экрана */
    if (!camEnabled || screenEnabled) return;
    facingMode = (facingMode === "user") ? "environment" : "user";
    try {
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode }, audio: false
        });
        const newTrack = newStream.getVideoTracks()[0];
        newTrack.enabled = true;
        const oldTrack = localStream?.getVideoTracks()[0];
        if (oldTrack) { oldTrack.stop(); localStream.removeTrack(oldTrack); }
        localStream.addTrack(newTrack);
        for (const [, pc] of Object.entries(peerConnections)) {
            const s = pc.getSenders().find(s => s.track?.kind === "video");
            if (s) s.replaceTrack(newTrack).catch(() => {});
        }
        showVideoInBox("local", localStream, true, false);
    } catch (e) {
        alert("Не удалось переключить камеру: " + e.message);
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
            pc.addTrack(track, stream);
        }
    }
}

/* ════════════════════════════════════════════
   SCREEN SHARE AUDIO (для тех кто смотрит)
════════════════════════════════════════════ */
const remoteScreenAudioEls = {};

function showRemoteScreenAudio(id, stream) {
    removeRemoteScreenAudio(id);
    const audio = document.createElement("audio");
    audio.autoplay  = true;
    audio.srcObject = stream;
    document.body.appendChild(audio);

    const box = document.getElementById("box-" + id);
    if (box) {
        const panel = document.createElement("div");
        panel.className = "screen-audio-panel remote-screen-audio-panel";
        panel.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span class="screen-audio-label">Звук экрана</span>
            <input type="range" class="rsa-slider" min="0" max="200" value="100" step="5">
            <span class="screen-audio-value">100%</span>`;
        box.appendChild(panel);
        const slider = panel.querySelector(".rsa-slider");
        const valEl  = panel.querySelector(".screen-audio-value");
        slider.oninput = function () {
            const pct = parseInt(this.value);
            valEl.textContent = pct + "%";
            /* Позволяем усилить до 200% — нет ограничения в 100% */
            audio.volume = Math.min(1, pct / 100); /* HTMLAudioElement.volume макс 1.0 */
        };
        remoteScreenAudioEls[id] = { audio, panel };
    } else {
        remoteScreenAudioEls[id] = { audio, panel: null };
    }
}

function removeRemoteScreenAudio(id) {
    const e = remoteScreenAudioEls[id];
    if (!e) return;
    e.audio?.remove();
    e.panel?.remove();
    delete remoteScreenAudioEls[id];
}

/* ════════════════════════════════════════════
   PEER CONNECTION (perfect negotiation)
════════════════════════════════════════════ */
function createPeer(id) {
    if (peerConnections[id]) return peerConnections[id];
    const pc = new RTCPeerConnection(servers);
    makingOffer[id] = false;

    pc.onnegotiationneeded = async () => {
        if (makingOffer[id]) return;
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

        if (e.track.kind === "video") {
            /* Видео-трек → показываем в блоке (поток содержит и аудио) */
            showVideoInBox(id, e.streams[0], false, false);
            monitorSpeaking(id, e.streams[0]);
        } else if (e.track.kind === "audio") {
            const box          = document.getElementById("box-" + id);
            const existingVideo = box?.querySelector("video");
            if (!existingVideo) {
                /* Участник без камеры — создаём скрытый <audio> */
                ensureRemoteAudio(id, e.streams[0]);
                monitorSpeaking(id, e.streams[0]);
            } else if (existingVideo.srcObject !== e.streams[0]) {
                /* Звук демонстрации экрана (другой поток) */
                showRemoteScreenAudio(id, e.streams[0]);
            }
        }
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

/* Сброс очереди ICE-кандидатов после установки remoteDescription */
async function flushCandidates(id) {
    const pc    = peerConnections[id];
    const queue = pendingCandidates[id];
    if (!pc || !queue) return;
    delete pendingCandidates[id];
    for (const c of queue) {
        try { await pc.addIceCandidate(c); } catch (e) {}
    }
}

/* ════════════════════════════════════════════
   SOCKET СОБЫТИЯ
════════════════════════════════════════════ */
socket.emit("join-room", { room, name, avatar });

socket.on("room-users", existingUsers => {
    for (const user of existingUsers) {
        peerMeta[user.id] = { name: user.name, avatar: user.avatar };
        addParticipant(user.id, user.name);
        createVideoBox(user.id, user.name, user.avatar);
        createPeer(user.id);
    }
});

socket.on("user-connected", async data => {
    peerMeta[data.id] = { name: data.name, avatar: data.avatar || "🙂" };
    addParticipant(data.id, data.name);
    createVideoBox(data.id, data.name, data.avatar || "🙂");

    const pc = createPeer(data.id);

    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (!pc.getSenders().find(s => s.track === track)) pc.addTrack(track, localStream);
        });
    }
    if (screenEnabled && screenStream) {
        const st = screenStream.getVideoTracks()[0];
        if (st && !pc.getSenders().find(s => s.track === st)) pc.addTrack(st, screenStream);
        /* Также добавляем аудио демонстрации */
        screenStream.getAudioTracks().forEach(at => {
            if (!pc.getSenders().find(s => s.track === at)) pc.addTrack(at, screenStream);
        });
    }

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

    /* Отправляем наше текущее состояние микрофона/камеры новому участнику */
    emitMediaState();
});

socket.on("offer", async data => {
    if (data.name) {
        peerMeta[data.from] = { name: data.name, avatar: data.avatar || "🙂" };
        if (!document.getElementById("box-" + data.from)) {
            createVideoBox(data.from, data.name, data.avatar || "🙂");
            addParticipant(data.from, data.name);
        } else {
            const label = document.getElementById("label-" + data.from);
            if (label) label.innerHTML = makeLabelHTML(data.name, false, false);
        }
    }

    const pc = createPeer(data.from);
    const collision = makingOffer[data.from] || pc.signalingState !== "stable";
    if (collision) {
        const polite = socket.id > data.from;
        if (!polite) return;
        try { await pc.setLocalDescription({ type: "rollback" }); }
        catch (e) { console.warn("rollback failed:", e); return; }
    }

    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (!pc.getSenders().find(s => s.track === track)) pc.addTrack(track, localStream);
        });
    }

    try {
        await pc.setRemoteDescription(data.offer);
        await flushCandidates(data.from);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { answer: pc.localDescription, to: data.from });
    } catch (e) {
        console.error("offer handler:", e);
    }
});

socket.on("answer", async data => {
    const pc = peerConnections[data.from];
    if (pc && pc.signalingState === "have-local-offer") {
        try {
            await pc.setRemoteDescription(data.answer);
            await flushCandidates(data.from);
        } catch (e) { console.error("answer:", e); }
    }
});

/* ICE-кандидаты: ставим в очередь если remoteDescription ещё не установлен */
socket.on("ice-candidate", async data => {
    const pc = peerConnections[data.from];
    if (!pc) return;
    if (pc.remoteDescription && pc.remoteDescription.type) {
        try { await pc.addIceCandidate(data.candidate); } catch (e) {}
    } else {
        if (!pendingCandidates[data.from]) pendingCandidates[data.from] = [];
        pendingCandidates[data.from].push(data.candidate);
    }
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
    const n = id === "local" ? name : (peerMeta[id]?.name || "Участник");
    label.innerHTML = makeLabelHTML(n, micOn, camOn);
}
function emitMediaState() {
    socket.emit("media-state", { mic: micEnabled, cam: camEnabled });
}
socket.on("media-state", data => updateLabelIcons(data.from, data.mic, data.cam));

/* ════════════════════════════════════════════
   КНОПКА МИКРОФОН
════════════════════════════════════════════ */
function setMicIcon() {
    micBtn.innerHTML = micEnabled ? ICONS.micOn : ICONS.micOff;
    micBtn.className = micEnabled ? "btn-active" : "btn-inactive";
    micBtn.title     = micEnabled ? "Выключить микрофон" : "Включить микрофон";
}
micBtn.onclick = async () => {
    if (!localStream) { await startCamera(); if (!localStream) return; }
    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(t => {
        t.enabled = micEnabled;
        addTrackToPeers(t, localStream);
    });
    setMicIcon();
    updateLabelIcons("local", micEnabled, camEnabled);
    emitMediaState();
    if (micEnabled) monitorSpeaking("local", localStream);
};

/* ════════════════════════════════════════════
   КНОПКА КАМЕРА
════════════════════════════════════════════ */
function setCamIcon() {
    camBtn.innerHTML = camEnabled ? ICONS.camOn : ICONS.camOff;
    camBtn.className = camEnabled ? "btn-active" : "btn-inactive";
    camBtn.title     = camEnabled ? "Выключить камеру" : "Включить камеру";
}
camBtn.onclick = async () => {
    if (!localStream) { await startCamera(); if (!localStream) return; }
    camEnabled = !camEnabled;
    localStream.getVideoTracks().forEach(t => {
        t.enabled = camEnabled;
        addTrackToPeers(t, localStream);
    });
    setCamIcon();
    updateLabelIcons("local", micEnabled, camEnabled);
    emitMediaState();
    if (flipBtn) flipBtn.style.display = camEnabled ? "" : "none";
    if (camEnabled) showVideoInBox("local", localStream, true, false);
    else            showAvatarInBox("local", avatar);
};

if (flipBtn) { flipBtn.onclick = () => switchCamera(); }

/* ════════════════════════════════════════════
   ДЕМОНСТРАЦИЯ ЭКРАНА
════════════════════════════════════════════ */
function setScreenIcon() {
    screenBtn.innerHTML = screenEnabled ? ICONS.screenOn : ICONS.screenOff;
    screenBtn.className = screenEnabled ? "btn-screen-active" : "";
    screenBtn.title     = screenEnabled ? "Остановить демонстрацию" : "Демонстрация экрана";
}

let screenAudioEl = null;

function showScreenAudioPanel(stream) {
    let panel = document.getElementById("screenAudioPanel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "screenAudioPanel";
        panel.className = "screen-audio-panel";
        panel.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span class="screen-audio-label">Звук экрана</span>
            <input type="range" id="screenAudioSlider" min="0" max="200" value="100" step="5">
            <span class="screen-audio-value" id="screenAudioValue">100%</span>`;
        document.querySelector(".controls").prepend(panel);
        document.getElementById("screenAudioSlider").oninput = function () {
            const pct = parseInt(this.value);
            document.getElementById("screenAudioValue").textContent = pct + "%";
            if (screenAudioEl) screenAudioEl.volume = Math.min(1, pct / 100);
        };
    }
    panel.style.display = "flex";
    if (!screenAudioEl) {
        screenAudioEl = document.createElement("audio");
        screenAudioEl.autoplay = true;
        document.body.appendChild(screenAudioEl);
    }
    screenAudioEl.srcObject = stream;
}

function hideScreenAudioPanel() {
    const panel = document.getElementById("screenAudioPanel");
    if (panel) panel.style.display = "none";
    if (screenAudioEl) { screenAudioEl.srcObject = null; screenAudioEl.remove(); screenAudioEl = null; }
}

screenBtn.onclick = async () => {
    if (screenEnabled) {
        /* Сохраняем список аудио-треков ДО остановки потока */
        const audioTracksToRemove = screenStream?.getAudioTracks() ?? [];

        screenStream?.getTracks().forEach(t => t.stop());
        screenStream  = null;
        screenEnabled = false;
        setScreenIcon();
        socket.emit("screen-share-state", { sharing: false });
        hideScreenAudioPanel();

        /* Удаляем screen-audio senders из всех peer-соединений */
        for (const [, pc] of Object.entries(peerConnections)) {
            audioTracksToRemove.forEach(at => {
                const sender = pc.getSenders().find(s => s.track === at);
                if (sender) try { pc.removeTrack(sender); } catch (e) {}
            });
        }

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
        setScreenIcon();
        socket.emit("screen-share-state", { sharing: true });

        const screenTrack      = screenStream.getVideoTracks()[0];
        const screenAudioTracks = screenStream.getAudioTracks();

        for (const [, pc] of Object.entries(peerConnections)) {
            const sVideo = pc.getSenders().find(s => s.track?.kind === "video");
            if (sVideo) sVideo.replaceTrack(screenTrack).catch(() => {});
            else        pc.addTrack(screenTrack, screenStream);
            screenAudioTracks.forEach(at => {
                if (!pc.getSenders().find(s => s.track === at)) pc.addTrack(at, screenStream);
            });
        }
        showVideoInBox("local", screenStream, true, true);
        if (screenAudioTracks.length > 0) showScreenAudioPanel(screenStream);
        screenTrack.onended = () => { if (screenEnabled) screenBtn.click(); };
    } catch (e) {
        if (e.name !== "NotAllowedError") alert("Не удалось начать демонстрацию: " + e.message);
    }
};

/* ════════════════════════════════════════════
   ВЫХОД
════════════════════════════════════════════ */
leaveBtn.onclick = () => {
    /* Останавливаем все speaking-мониторы */
    Object.keys(speakingCancels).forEach(id => { speakingCancels[id]?.(); });
    Object.values(peerConnections).forEach(pc => pc.close());
    localStream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    socket.disconnect();
    window.location = "/";
};

/* ════════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
════════════════════════════════════════════ */
createVideoBox("local", name, avatar);
addParticipant("local", name);
updateGridLayout();
setMicIcon();
setCamIcon();
setScreenIcon();
if (copyBtn) copyBtn.innerHTML = ICONS.copyLink;

/* Если лобби включило камеру/микрофон — стартуем поток сразу */
if (initMic || initCam) {
    startCamera().then(() => {
        if (!localStream) return;
        if (initMic) monitorSpeaking("local", localStream);
        if (initCam) {
            showVideoInBox("local", localStream, true, false);
            if (flipBtn) flipBtn.style.display = "";
        }
        updateLabelIcons("local", micEnabled, camEnabled);
        emitMediaState();
    });
}
