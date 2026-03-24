const params   = new URLSearchParams(window.location.search);
const room     = params.get("room");
const name     = params.get("name");
const avatar   = params.get("avatar") || "ironman";
const initMic  = params.get("mic") === "1";
const initCam  = params.get("cam") === "1";
const initGain = Math.max(0, Math.min(2, parseInt(params.get("micGain") || "100") / 100));

/* Без имени → на главную */
if (!name || name === "null") {
    window.location.replace(room ? `/?room=${encodeURIComponent(room)}` : "/");
    throw new Error("redirect");
}

/* ════════════════════════════════════════════
   TOAST — заменяет все alert()
════════════════════════════════════════════ */
function showToast(msg, type = "error", duration = 5000) {
    /* Убираем предыдущий тост того же типа */
    document.querySelectorAll(".vc-toast").forEach(t => t.remove());
    const t = document.createElement("div");
    t.className = "vc-toast vc-toast-" + type;
    t.setAttribute("role", "alert");
    t.setAttribute("aria-live", "assertive");
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("vc-toast-show"));
    setTimeout(() => {
        t.classList.remove("vc-toast-show");
        setTimeout(() => t.remove(), 300);
    }, duration);
}

/* ════════════════════════════════════════════
   SVG ИКОНКИ (aria-hidden на всех)
════════════════════════════════════════════ */
const ICONS = {
    micOn:  `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`,
    micOff: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
    camOn:  `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
    camOff: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06A4 4 0 1 1 7.72 7.72"/></svg>`,
    screenOn:  `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polyline points="8 10 12 6 16 10"/></svg>`,
    screenOff: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    copyLink: `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
    copied:    `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    labelMicOn:  `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
    labelMicOff: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2"/></svg>`,
    labelCamOn:  `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
    labelCamOff: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/></svg>`,
};

const socket = io();

document.getElementById("roomTitle").textContent = room;

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

/* ID создателя комнаты (первый вошедший) — для значка короны */
let roomCreatorId = null;

/* ── Состояние ── */
let micEnabled    = initMic;
let camEnabled    = initCam;
let screenEnabled = false;
let facingMode    = "user";
let cameraStarting = false;

/* ── ICE-кандидаты, пришедшие до remoteDescription ── */
const pendingCandidates = {};

/* ── <audio> для участников без камеры ── */
const peerAudioEls = {};

/* ── Отмена speakingMonitor ── */
const speakingCancels = {};

/* ── Таймеры speaking-гало (отдельный Map — не засоряем DOM) ── */
const speakTimers = {};

/* ── Таймеры ICE-рестарта при состоянии "disconnected" ── */
const reconnectTimers = {};

/* ── Флаг первого подключения (для разграничения connect / reconnect) ── */
let _joined = false;
/* ── Флаг активного переподключения (для тоста «восстановлено») ── */
let _reconnecting = false;

/* ── AudioContext ── */
let audioCtx    = null;
let micGainNode = null;

function getAudioCtx() {
    if (!audioCtx || audioCtx.state === "closed") {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    /* Браузер мог приостановить контекст (фоновая вкладка, долгое молчание) */
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
}

/* Возобновляем AudioContext, если браузер его приостановил.
   Вызывается при возврате вкладки на передний план и периодически. */
function ensureAudioCtxRunning() {
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
    }
}
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") ensureAudioCtxRunning();
});
/* Проверяем каждые 30 сек — на случай, если вкладка оставалась видимой,
   но браузер всё равно заморозил контекст (Chrome, Safari). */
setInterval(ensureAudioCtxRunning, 30_000);

/* Применяем усиление микрофона из лобби. */
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
function addParticipant(id, username, userAvatar, isCreator) {
    /* Если уже есть — только корону добавить если нужно */
    const existing = document.getElementById("participant-" + id);
    if (existing) {
        if (isCreator && !existing.querySelector(".participant-crown")) {
            const crown = document.createElement("span");
            crown.className = "participant-crown";
            crown.title = "Создатель комнаты";
            crown.textContent = "👑";
            existing.appendChild(crown);
        }
        return;
    }
    const div = document.createElement("div");
    div.className = "participant";
    div.id = "participant-" + id;

    /* Маленький аватар */
    const av = document.createElement("div");
    av.className = "participant-avatar";
    if (window.AVATARS && window.AVATARS[userAvatar]) {
        av.innerHTML = window.AVATARS[userAvatar];
    } else {
        av.textContent = userAvatar || "?";
    }
    div.appendChild(av);

    /* Имя */
    const nameSpan = document.createElement("span");
    nameSpan.className = "participant-name";
    nameSpan.textContent = username;
    div.appendChild(nameSpan);

    /* Корона создателя */
    if (isCreator) {
        const crown = document.createElement("span");
        crown.className = "participant-crown";
        crown.title = "Создатель комнаты";
        crown.textContent = "👑";
        div.appendChild(crown);
    }

    participantsDiv.appendChild(div);
}

/* Добавить корону к уже существующему участнику */
function setCreatorCrown(id) {
    const div = document.getElementById("participant-" + id);
    if (!div || div.querySelector(".participant-crown")) return;
    const crown = document.createElement("span");
    crown.className = "participant-crown";
    crown.title = "Создатель комнаты";
    crown.textContent = "👑";
    div.appendChild(crown);
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
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function createVideoBox(id, username, userAvatar) {
    if (document.getElementById("box-" + id)) return;
    const box = document.createElement("div");
    box.className = "video-box";
    box.id = "box-" + id;

    const av = document.createElement("div");
    av.className = "avatar";
    if (window.AVATARS && window.AVATARS[userAvatar]) {
        av.innerHTML = window.AVATARS[userAvatar];
    } else {
        av.textContent = userAvatar;
    }
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

    /* Явно останавливаем старый видеоэлемент перед удалением */
    const oldVideo = box.querySelector("video");
    if (oldVideo) {
        oldVideo.pause();
        oldVideo.srcObject = null;
        oldVideo.remove();
    }
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
    const oldVideo = box.querySelector("video");
    if (oldVideo) {
        oldVideo.pause();
        oldVideo.srcObject = null;
        oldVideo.remove();
    }
    if (!box.querySelector(".avatar")) {
        const av = document.createElement("div");
        av.className = "avatar";
        if (window.AVATARS && window.AVATARS[userAvatar]) {
            av.innerHTML = window.AVATARS[userAvatar];
        } else {
            av.textContent = userAvatar;
        }
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
    /* Убираем speaking-таймер */
    if (speakTimers[id]) { clearTimeout(speakTimers[id]); delete speakTimers[id]; }
    /* Отменяем отложенный ICE-рестарт */
    if (reconnectTimers[id]) { clearTimeout(reconnectTimers[id]); delete reconnectTimers[id]; }
    /* Убираем audio-only элемент */
    if (peerAudioEls[id]) {
        peerAudioEls[id].srcObject = null;
        peerAudioEls[id].remove();
        delete peerAudioEls[id];
    }
    /* Убираем screen audio */
    removeRemoteScreenAudio(id);
    /* Явно останавливаем видео в боксе */
    const box = document.getElementById("box-" + id);
    if (box) {
        const vid = box.querySelector("video");
        if (vid) { vid.pause(); vid.srcObject = null; }
    }
    box?.remove();
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
   speakTimers — отдельный Map, не засоряем DOM-элементы
════════════════════════════════════════════ */
function monitorSpeaking(id, stream) {
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
            try { source.disconnect(); }   catch (e) {}
            try { analyser.disconnect(); } catch (e) {}
        };

        function check() {
            if (cancelled) return;
            const box = document.getElementById("box-" + id);
            if (!box) { speakingCancels[id]?.(); return; }
            analyser.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            if (sum / data.length > 12) {
                box.classList.add("speaking");
                /* Используем отдельный Map, не DOM-свойство */
                if (speakTimers[id]) clearTimeout(speakTimers[id]);
                speakTimers[id] = setTimeout(() => {
                    box.classList.remove("speaking");
                    delete speakTimers[id];
                }, 600);
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
    /* Не разворачиваем если клик пришёл из панели звука экрана */
    if (e.target.closest(".screen-audio-panel")) return;
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
        const url = `${location.origin}/?room=${encodeURIComponent(room)}`;
        const restore = () => setTimeout(() => {
            copyBtn.innerHTML = ICONS.copyLink;
            copyBtn.setAttribute("aria-label", "Поделиться ссылкой");
            copyBtn.classList.remove("copy-success");
        }, 2000);
        navigator.clipboard.writeText(url).then(() => {
            copyBtn.innerHTML = ICONS.copied;
            copyBtn.setAttribute("aria-label", "Ссылка скопирована");
            copyBtn.classList.add("copy-success");
            showToast("Ссылка скопирована! Отправьте её участникам — они смогут войти в конференцию по этой ссылке.", "success", 6000);
            restore();
        }).catch(() => {
            try {
                const inp = document.createElement("input");
                inp.value = url; document.body.appendChild(inp); inp.select();
                document.execCommand("copy"); inp.remove();
                copyBtn.innerHTML = ICONS.copied;
                copyBtn.classList.add("copy-success");
                showToast("Ссылка скопирована! Отправьте её участникам — они смогут войти в конференцию по этой ссылке.", "success", 6000);
                restore();
            } catch (_) {
                showToast("Не удалось скопировать ссылку автоматически. Скопируйте адрес из строки браузера вручную.", "error");
            }
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
        const isOpen = sidebar.classList.contains("mobile-open");
        chatBtn.classList.toggle("btn-active", isOpen);
        chatBtn.setAttribute("aria-pressed", isOpen ? "true" : "false");
        chatBtn.setAttribute("aria-label", isOpen ? "Закрыть чат" : "Открыть чат");
    };
}

/* ════════════════════════════════════════════
   ДОСТУП К КАМЕРЕ / МИКРОФОНУ
════════════════════════════════════════════ */
async function startCamera(facing) {
    if (cameraStarting) return;
    cameraStarting = true;
    const mode = facing || facingMode;
    let rawStream;
    try {
        try {
            rawStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode }, audio: true
            });
        } catch (_) {
            try {
                rawStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (e) {
                showToast("Браузер заблокировал доступ к камере или микрофону. Нажмите на значок 🔒 в адресной строке и разрешите доступ, затем обновите страницу.", "error", 8000);
                return;
            }
        }
        localStream = (initGain !== 1) ? buildGainedStream(rawStream, initGain) : rawStream;
        localStream.getAudioTracks().forEach(t => t.enabled = micEnabled);
        localStream.getVideoTracks().forEach(t => t.enabled = camEnabled);
    } finally {
        cameraStarting = false;
    }
}

/* ── Переключение фронтальной / задней камеры ── */
async function switchCamera() {
    if (!camEnabled || screenEnabled) return;
    facingMode = (facingMode === "user") ? "environment" : "user";
    try {
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode }, audio: false
        });
        const newTrack = newStream.getVideoTracks()[0];
        newTrack.enabled = true;
        const oldTrack = localStream?.getVideoTracks()?.[0];
        if (oldTrack) { oldTrack.stop(); localStream.removeTrack(oldTrack); }
        localStream.addTrack(newTrack);
        for (const [, pc] of Object.entries(peerConnections)) {
            const s = pc.getSenders().find(s => s.track?.kind === "video");
            if (s) s.replaceTrack(newTrack).catch(() => {});
        }
        showVideoInBox("local", localStream, true, false);
    } catch (e) {
        showToast("Не удалось переключить камеру: " + e.message, "error");
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
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span class="screen-audio-label">Звук экрана</span>
            <label class="sr-only" for="rsa-${id}">Громкость звука экрана</label>
            <input id="rsa-${id}" type="range" class="rsa-slider" min="0" max="100" value="100" step="5">
            <span class="screen-audio-value">100%</span>`;
        box.appendChild(panel);
        const slider = panel.querySelector(".rsa-slider");
        const valEl  = panel.querySelector(".screen-audio-value");
        slider.oninput = function () {
            const pct = parseInt(this.value);
            valEl.textContent = pct + "%";
            audio.volume = pct / 100;
        };
        remoteScreenAudioEls[id] = { audio, panel };
    } else {
        remoteScreenAudioEls[id] = { audio, panel: null };
    }
}

function removeRemoteScreenAudio(id) {
    const e = remoteScreenAudioEls[id];
    if (!e) return;
    if (e.audio) { e.audio.srcObject = null; e.audio.remove(); }
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
        const meta = peerMeta[id] || { name: "Участник", avatar: "ironman" };
        if (!document.getElementById("box-" + id)) {
            createVideoBox(id, meta.name, meta.avatar);
            addParticipant(id, meta.name, meta.avatar, id === roomCreatorId);
        }

        if (e.track.kind === "video") {
            showVideoInBox(id, e.streams[0], false, false);
            monitorSpeaking(id, e.streams[0]);
        } else if (e.track.kind === "audio") {
            const box          = document.getElementById("box-" + id);
            const existingVideo = box?.querySelector("video");
            if (!existingVideo) {
                ensureRemoteAudio(id, e.streams[0]);
                monitorSpeaking(id, e.streams[0]);
            } else if (existingVideo.srcObject !== e.streams[0]) {
                showRemoteScreenAudio(id, e.streams[0]);
            }
        }
    };

    pc.onicecandidate = e => {
        if (e.candidate) socket.emit("ice-candidate", { candidate: e.candidate, to: id });
    };

    pc.onconnectionstatechange = () => {
        const state = pc.connectionState;

        if (state === "disconnected") {
            /* По умолчанию браузер ждёт до 30 сек перед переходом в "failed".
               Мы не ждём — пробуем рестарт ICE через 5 сек. */
            if (!reconnectTimers[id]) {
                reconnectTimers[id] = setTimeout(() => {
                    delete reconnectTimers[id];
                    if (peerConnections[id]?.connectionState === "disconnected") {
                        peerConnections[id].restartIce();
                    }
                }, 5_000);
            }
        } else {
            /* Состояние улучшилось — отменяем отложенный рестарт */
            if (reconnectTimers[id]) {
                clearTimeout(reconnectTimers[id]);
                delete reconnectTimers[id];
            }
        }

        if (state === "failed") pc.restartIce();
        if (state === "closed") removeVideoBox(id);
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

/* connect срабатывает как при первом подключении, так и при переподключении.
   При переподключении socket.id меняется — нужно заново войти в комнату
   и пересобрать все peer connections. */
socket.on("connect", () => {
    if (_joined) {
        /* ── Переподключение после разрыва ── */
        _reconnecting = true;
        showToast("Соединение прервано. Выполняется переподключение к конференции…", "error", 10000);

        /* Останавливаем демонстрацию экрана (getDisplayMedia нельзя продолжить) */
        if (screenEnabled) {
            screenStream?.getTracks().forEach(t => t.stop());
            screenStream  = null;
            screenEnabled = false;
            setScreenIcon();
            hideScreenAudioPanel();
            if (screenAudioMix) {
                try { screenAudioMix.micSrc?.disconnect(); }   catch (e) {}
                try { screenAudioMix.screenSrc?.disconnect(); } catch (e) {}
                try { screenAudioMix.screenGain?.disconnect(); } catch (e) {}
                screenAudioMix = null;
            }
        }

        /* Закрываем все существующие peer connections */
        Object.values(peerConnections).forEach(pc => { try { pc.close(); } catch (e) {} });

        /* Убираем все чужие видео-боксы и панели */
        [...document.querySelectorAll(".video-box")].forEach(box => {
            const id = box.id.replace("box-", "");
            if (id === "local") return;
            if (speakingCancels[id]) { speakingCancels[id](); delete speakingCancels[id]; }
            if (speakTimers[id])     { clearTimeout(speakTimers[id]); delete speakTimers[id]; }
            if (reconnectTimers[id]) { clearTimeout(reconnectTimers[id]); delete reconnectTimers[id]; }
            if (peerAudioEls[id])    { peerAudioEls[id].srcObject = null; peerAudioEls[id].remove(); delete peerAudioEls[id]; }
            removeRemoteScreenAudio(id);
            box.querySelector(".rsa-viewer-panel")?.remove();
            box.remove();
        });
        /* Убираем чужих участников из сайдбара */
        [...document.querySelectorAll(".participant")].forEach(p => {
            if (p.id !== "participant-local") p.remove();
        });

        /* Сбрасываем всё состояние соединений */
        Object.keys(peerConnections).forEach(id => delete peerConnections[id]);
        Object.keys(peerMeta).forEach(id => delete peerMeta[id]);
        Object.keys(makingOffer).forEach(id => delete makingOffer[id]);
        Object.keys(pendingCandidates).forEach(id => delete pendingCandidates[id]);
        roomCreatorId = null;
        updateGridLayout();

        /* Возобновляем AudioContext — браузер мог заморозить его во время разрыва */
        ensureAudioCtxRunning();

        /* Повторно отправляем своё состояние микро/камеры через 2 сек
           (peer connections ещё устанавливаются) */
        setTimeout(() => emitMediaState(), 2_000);
    }

    _joined = true;
    socket.emit("join-room", { room, name, avatar });
});

/* Уведомляем пользователя о потере соединения */
socket.on("disconnect", reason => {
    if (reason !== "io client disconnect") {
        /* io client disconnect = пользователь сам нажал «Выйти», не показываем тост */
        showToast("Соединение прервано. Переподключение…", "error", 10000);
    }
});

/* Комната заполнена */
socket.on("room-full", () => {
    showToast("Комната заполнена — максимум 8 участников", "error");
    setTimeout(() => window.location.replace("/"), 3000);
});

/* Ошибка комнаты */
socket.on("room-error", msg => {
    showToast(msg || "Ошибка подключения к комнате", "error");
    setTimeout(() => window.location.replace("/"), 3000);
});

/* Сервер перезапускается */
socket.on("server-shutdown", () => {
    showToast("Сервер перезапускается…", "info");
});

socket.on("room-users", data => {
    /* Если это переподключение — сообщаем об успехе */
    if (_reconnecting) {
        showToast("✅ Подключение восстановлено! Вы снова в конференции.", "success", 4000);
        _reconnecting = false;
    }

    /* Поддержка старого формата (массив) и нового ({ users, creatorId }) */
    const users     = Array.isArray(data) ? data : (data.users || []);
    const creatorId = Array.isArray(data) ? null : (data.creatorId || null);

    /* Определяем создателя */
    if (users.length === 0) {
        /* Я первый в комнате — значит я создатель */
        roomCreatorId = socket.id;
    } else if (creatorId) {
        roomCreatorId = creatorId;
    }

    /* Обновляем корону локального участника если он создатель */
    if (roomCreatorId === socket.id) {
        setCreatorCrown("local");
    }

    for (const user of users) {
        peerMeta[user.id] = { name: user.name, avatar: user.avatar };
        addParticipant(user.id, user.name, user.avatar, user.id === roomCreatorId);
        createVideoBox(user.id, user.name, user.avatar);
        createPeer(user.id);
    }
});

socket.on("user-connected", async data => {
    showToast(`👋 ${data.name || "Участник"} присоединился к конференции`, "info", 4000);
    peerMeta[data.id] = { name: data.name, avatar: data.avatar || "ironman" };
    addParticipant(data.id, data.name, data.avatar || "ironman", data.id === roomCreatorId);
    createVideoBox(data.id, data.name, data.avatar || "ironman");

    const pc = createPeer(data.id);

    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (!pc.getSenders().find(s => s.track === track)) pc.addTrack(track, localStream);
        });
    }
    if (screenEnabled && screenStream) {
        /* Видео экрана: заменяем видео-сендер (replaceTrack, без renegotiation) */
        const screenTrack = screenStream.getVideoTracks()[0];
        if (screenTrack) {
            const vSender = pc.getSenders().find(s => s.track?.kind === "video");
            if (vSender) {
                vSender.replaceTrack(screenTrack).catch(() => {});
            } else {
                pc.addTrack(screenTrack, screenStream);
            }
        }
        /* Аудио экрана: если WebAudio-микс активен — заменяем аудио-сендер
           смешанным треком. addTrack для аудио экрана вызывает renegotiation
           и ломает звук на iOS. */
        if (screenAudioMix) {
            const mixedTrack = screenAudioMix.dest.stream.getAudioTracks()[0];
            if (mixedTrack) {
                const aSender = pc.getSenders().find(s => s.track?.kind === "audio");
                if (aSender) aSender.replaceTrack(mixedTrack).catch(() => {});
            }
        }
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

    emitMediaState();
});

socket.on("offer", async data => {
    if (data.name) {
        peerMeta[data.from] = { name: data.name, avatar: data.avatar || "ironman" };
        if (!document.getElementById("box-" + data.from)) {
            createVideoBox(data.from, data.name, data.avatar || "ironman");
            addParticipant(data.from, data.name, data.avatar || "ironman", data.from === roomCreatorId);
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

socket.on("user-disconnected", data => {
    const leaveName = peerMeta[data.id]?.name || "Участник";
    showToast(`${leaveName} покинул конференцию`, "info", 4000);
    removeVideoBox(data.id);
});

socket.on("screen-share-state", data => {
    const box = document.getElementById("box-" + data.from);
    if (!box) return;
    const vid = box.querySelector("video");
    if (vid) vid.classList.toggle("screen-video", data.sharing);

    if (data.sharing) {
        const sharerName = peerMeta[data.from]?.name || "Участник";
        showToast(`🖥 ${sharerName} начал демонстрацию экрана`, "info", 4000);
        /* Показываем слайдер громкости звука экрана для зрителей.
           Аудио доставляется через тот же аудио-сендер (replaceTrack/WebAudio-микс),
           поэтому управляем громкостью через volume на video / audio элементе. */
        if (!box.querySelector(".rsa-viewer-panel")) {
            const panel = document.createElement("div");
            panel.className = "screen-audio-panel remote-screen-audio-panel rsa-viewer-panel";
            panel.innerHTML = `
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <span class="screen-audio-label">Звук экрана</span>
                <label class="sr-only" for="rsa-v-${data.from}">Громкость звука экрана</label>
                <input id="rsa-v-${data.from}" type="range" class="rsa-slider" min="0" max="100" value="100" step="5">
                <span class="screen-audio-value">100%</span>`;
            box.appendChild(panel);
            const slider = panel.querySelector(".rsa-slider");
            const valEl  = panel.querySelector(".screen-audio-value");
            slider.oninput = function () {
                const pct = parseInt(this.value);
                valEl.textContent = pct + "%";
                const vol = pct / 100;
                /* Управляем громкостью: video-элемент или скрытый audio */
                const v = box.querySelector("video");
                if (v) v.volume = vol;
                if (peerAudioEls[data.from]) peerAudioEls[data.from].volume = vol;
            };
        }
    } else {
        /* Убираем слайдер громкости и любые устаревшие элементы screen audio */
        box.querySelector(".rsa-viewer-panel")?.remove();
        removeRemoteScreenAudio(data.from);
    }
});

/* ════════════════════════════════════════════
   ИКОНКИ / СОСТОЯНИЕ МЕДИА + ARIA
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
    micBtn.setAttribute("aria-label", micEnabled ? "Выключить микрофон" : "Включить микрофон");
    micBtn.setAttribute("aria-pressed", micEnabled ? "true" : "false");
}
micBtn.onclick = async () => {
    if (!localStream) { await startCamera(); if (!localStream) return; }
    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(t => {
        t.enabled = micEnabled;
        /* Не заменяем аудио-сендер если активен WebAudio-микс screen share:
           WebAudio-граф читает из того же трека и сам передаёт тишину/звук. */
        if (!screenAudioMix) addTrackToPeers(t, localStream);
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
    camBtn.setAttribute("aria-label", camEnabled ? "Выключить камеру" : "Включить камеру");
    camBtn.setAttribute("aria-pressed", camEnabled ? "true" : "false");
}
camBtn.onclick = async () => {
    if (!localStream) { await startCamera(); if (!localStream) return; }
    camEnabled = !camEnabled;
    localStream.getVideoTracks().forEach(t => {
        t.enabled = camEnabled;
        /* Не заменяем видео-сендер если демонстрация экрана активна —
           иначе собеседники потеряют экран и увидят камеру. */
        if (!screenEnabled) addTrackToPeers(t, localStream);
    });
    setCamIcon();
    updateLabelIcons("local", micEnabled, camEnabled);
    emitMediaState();
    /* Кнопка перевёртки камеры видна только если камера включена и нет screen share */
    if (flipBtn) flipBtn.style.display = (camEnabled && !screenEnabled) ? "" : "none";
    /* Обновляем локальный бокс только если screen share не активен */
    if (!screenEnabled) {
        if (camEnabled) showVideoInBox("local", localStream, true, false);
        else            showAvatarInBox("local", avatar);
    }
};

if (flipBtn) { flipBtn.onclick = () => switchCamera(); }

/* ════════════════════════════════════════════
   ДЕМОНСТРАЦИЯ ЭКРАНА
════════════════════════════════════════════ */
function setScreenIcon() {
    screenBtn.innerHTML = screenEnabled ? ICONS.screenOn : ICONS.screenOff;
    screenBtn.className = screenEnabled ? "btn-screen-active" : "";
    screenBtn.setAttribute("aria-label", screenEnabled ? "Остановить демонстрацию экрана" : "Начать демонстрацию экрана");
    screenBtn.setAttribute("aria-pressed", screenEnabled ? "true" : "false");
}

let screenAudioMix = null; /* { micSrc, screenSrc, screenGain, dest } for WebAudio mix */

/* ── Панель звука экрана (только для того, кто делится экраном).
   Локально звук НЕ воспроизводится — пользователь уже слышит его через ОС.
   Слайдер управляет уровнем звука экрана в WebAudio-миксе, который
   отправляется собеседникам. ── */
function showScreenAudioPanel() {
    let panel = document.getElementById("screenAudioPanel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "screenAudioPanel";
        panel.className = "screen-audio-panel";
        panel.innerHTML = `
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span class="screen-audio-label">Звук экрана → участникам</span>
            <label class="sr-only" for="screenAudioSlider">Уровень звука экрана для участников</label>
            <input id="screenAudioSlider" type="range" min="0" max="100" value="100" step="5">
            <span class="screen-audio-value" id="screenAudioValue">100%</span>`;
        document.querySelector(".controls").prepend(panel);
        document.getElementById("screenAudioSlider").oninput = function () {
            const pct = parseInt(this.value);
            document.getElementById("screenAudioValue").textContent = pct + "%";
            /* Управляем уровнем звука экрана в WebAudio-миксе для собеседников */
            if (screenAudioMix?.screenGain) {
                screenAudioMix.screenGain.gain.value = pct / 100;
            }
        };
    }
    panel.style.display = "flex";
    /* Намеренно не создаём <audio> элемент:
       пользователь уже слышит звук экрана через ОС — воспроизведение
       через <audio> вызвало бы дублирование звука. */
}

function hideScreenAudioPanel() {
    const panel = document.getElementById("screenAudioPanel");
    if (panel) panel.style.display = "none";
}

screenBtn.onclick = async () => {
    if (screenEnabled) {
        /* ── Остановка демонстрации ── */
        screenStream?.getTracks().forEach(t => t.stop());
        screenStream  = null;
        screenEnabled = false;
        setScreenIcon();
        socket.emit("screen-share-state", { sharing: false });
        hideScreenAudioPanel();
        showToast("Демонстрация экрана остановлена.", "info", 3000);

        /* Убираем WebAudio-микс: возвращаем исходный мик-трек */
        if (screenAudioMix) {
            try { screenAudioMix.micSrc?.disconnect(); } catch (e) {}
            try { screenAudioMix.screenSrc?.disconnect(); } catch (e) {}
            try { screenAudioMix.screenGain?.disconnect(); } catch (e) {}
            screenAudioMix = null;
            /* replaceTrack обратно на исходный микрофон — без рenegotiации */
            const micTrack = localStream?.getAudioTracks()[0];
            if (micTrack) {
                for (const [, pc] of Object.entries(peerConnections)) {
                    const s = pc.getSenders().find(s => s.track?.kind === "audio");
                    if (s) s.replaceTrack(micTrack).catch(() => {});
                }
            }
        }

        /* Возвращаем видео-трек камеры */
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
        showToast("Демонстрация экрана началась — участники видят ваш экран.", "success", 4000);

        const screenTrack       = screenStream.getVideoTracks()[0];
        const screenAudioTracks = screenStream.getAudioTracks();

        /* ── Видео: replaceTrack не вызывает renegotiation ── */
        for (const [, pc] of Object.entries(peerConnections)) {
            const sVideo = pc.getSenders().find(s => s.track?.kind === "video");
            if (sVideo) sVideo.replaceTrack(screenTrack).catch(() => {});
            else        pc.addTrack(screenTrack, screenStream);
        }

        /* ── Аудио экрана: WebAudio-микс вместо addTrack → нет renegotiation
              Это исправляет баг на iOS: добавление второго аудио-трека
              вызывало renegotiation, во время которой Safari терял аудио.
              Теперь мик + аудио экрана смешиваются через AudioContext и
              передаются через уже существующий аудио-сендер (replaceTrack).
        ── */
        if (screenAudioTracks.length > 0) {
            try {
                const ctx  = getAudioCtx();
                const dest = ctx.createMediaStreamDestination();

                /* Микрофон */
                let micSrc = null;
                if (localStream) {
                    const micTracks = localStream.getAudioTracks();
                    if (micTracks.length > 0) {
                        const micStream = new MediaStream(micTracks);
                        micSrc = ctx.createMediaStreamSource(micStream);
                        micSrc.connect(dest);
                    }
                }

                /* Аудио экрана через gain-ноду — позволяет управлять уровнем
                   звука экрана в миксе, отправляемом собеседникам */
                const screenGain = ctx.createGain();
                screenGain.gain.value = 1.0;
                const screenAudioStream = new MediaStream(screenAudioTracks);
                const screenSrc = ctx.createMediaStreamSource(screenAudioStream);
                screenSrc.connect(screenGain);
                screenGain.connect(dest);

                const mixedTrack = dest.stream.getAudioTracks()[0];
                screenAudioMix = { micSrc, screenSrc, screenGain, dest };

                /* replaceTrack — никакой renegotiation */
                for (const [, pc] of Object.entries(peerConnections)) {
                    const sAudio = pc.getSenders().find(s => s.track?.kind === "audio");
                    if (sAudio) {
                        sAudio.replaceTrack(mixedTrack).catch(() => {});
                    } else {
                        pc.addTrack(mixedTrack, dest.stream);
                    }
                }
            } catch (e) {
                console.warn("Screen audio mix failed:", e);
                showToast("Не удалось подмешать аудио экрана — звук демонстрации недоступен собеседникам.", "error", 6000);
                /* Fallback: просто не передаём аудио экрана — зато не ломаем соединение */
            }

            showScreenAudioPanel();
        }

        showVideoInBox("local", screenStream, true, true);
        screenTrack.onended = () => { if (screenEnabled) screenBtn.click(); };
    } catch (e) {
        if (e.name === "NotAllowedError") {
            showToast("Демонстрация экрана отменена.", "info", 3000);
        } else {
            showToast("Не удалось начать демонстрацию экрана. Попробуйте ещё раз или перезагрузите страницу.", "error");
        }
    }
};

/* ════════════════════════════════════════════
   ВЫХОД — с подтверждением
════════════════════════════════════════════ */
leaveBtn.onclick = () => {
    if (!confirm("Вы уверены, что хотите покинуть конференцию?\n\nВы выйдете из звонка и вернётесь на главную страницу.")) return;
    /* Останавливаем все speaking-мониторы */
    Object.keys(speakingCancels).forEach(id => { speakingCancels[id]?.(); });
    /* Чистим speakTimers */
    Object.keys(speakTimers).forEach(id => { clearTimeout(speakTimers[id]); });
    /* Чистим WebAudio-микс экрана */
    if (screenAudioMix) {
        try { screenAudioMix.micSrc?.disconnect(); } catch (e) {}
        try { screenAudioMix.screenSrc?.disconnect(); } catch (e) {}
        try { screenAudioMix.screenGain?.disconnect(); } catch (e) {}
        screenAudioMix = null;
    }
    Object.values(peerConnections).forEach(pc => pc.close());
    localStream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    socket.disconnect();
    window.location.href = "/";
};

/* ════════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
════════════════════════════════════════════ */
createVideoBox("local", name, avatar);
addParticipant("local", name, avatar, false); /* корона выставляется после получения room-users */
updateGridLayout();
setMicIcon();
setCamIcon();
setScreenIcon();
if (copyBtn) {
    copyBtn.innerHTML = ICONS.copyLink;
    copyBtn.setAttribute("aria-label", "Поделиться ссылкой");
}

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
