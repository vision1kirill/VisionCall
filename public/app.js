const params   = new URLSearchParams(window.location.search);
const room     = params.get("room");
const name     = params.get("name");
const avatar   = "default"; /* единый силуэт для всех */
const initMic  = params.get("mic") === "1";
const initCam  = params.get("cam") === "1";
/* #40 — NaN guard: parseInt("abc") = NaN → NaN/100 = NaN → Math.max/min пропускают NaN.
   Добавляем || 100 чтобы получить безопасное значение по умолчанию. */
const initGain = Math.max(0, Math.min(2, (parseInt(params.get("micGain") || "100") || 100) / 100));

/* #39 — Без комнаты → на главную (name проверяется ниже) */
if (!room) {
    window.location.replace("/");
    throw new Error("redirect");
}
/* Без имени → на главную */
if (!name || name === "null") {
    window.location.replace(room ? `/?room=${encodeURIComponent(room)}` : "/");
    throw new Error("redirect");
}

/* ════════════════════════════════════════════
   TOAST — заменяет все alert()
════════════════════════════════════════════ */
function showToast(msg, type = "error", duration = 5000) {
    /* Убираем предыдущий тост ТОГО ЖЕ типа (не все сразу) */
    document.querySelectorAll(`.vc-toast.vc-toast-${type}`).forEach(t => t.remove());
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

/* Постоянный ID сессии — позволяет серверу выгнать старый "призрак"
   при обновлении страницы или переподключении того же пользователя */
const VC_SESSION_KEY = "vc_session_id";
let vcSessionId;
try { vcSessionId = localStorage.getItem(VC_SESSION_KEY); } catch (_) {}
if (!vcSessionId) {
    vcSessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    try { localStorage.setItem(VC_SESSION_KEY, vcSessionId); } catch (_) {}
}

const socket = io();

/* Задаём код комнаты в топбаре */
const roomTitleEl = document.getElementById("roomTitle");
if (roomTitleEl) {
    roomTitleEl.textContent = room;
    roomTitleEl.title = "Нажмите, чтобы скопировать ссылку приглашения";
    /* Клик на код комнаты = копирование ссылки */
    roomTitleEl.onclick = () => {
        const url = `${location.origin}/?room=${encodeURIComponent(room)}`;
        navigator.clipboard?.writeText(url)
            .then(() => showToast("Ссылка скопирована!", "success", 2500))
            .catch(() => {
                try {
                    const inp = document.createElement("input");
                    inp.value = url; document.body.appendChild(inp); inp.select();
                    document.execCommand("copy"); inp.remove();
                    showToast("Ссылка скопирована!", "success", 2500);
                } catch (_) {}
            });
    };
}
/* Обновляем <title> страницы: "Комната ABC123 — VisionCall" */
document.title = `Комната ${room} — VisionCall`;

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

/* ── Входящие видео-потоки по ID собеседника ──────────────────────
   Хранит e.streams[0] из ontrack для видео-трека.
   Нужно чтобы показать видео ПОСЛЕ получения media-state(cam:true),
   если ontrack пришёл раньше (что типично). ──────────────────────*/
const peerVideoStreams = {};

/* ID создателя комнаты (первый вошедший) — для значка короны */
let roomCreatorId = null;

/* ── Состояние ── */
let micEnabled    = initMic;
let camEnabled    = initCam;

/* ── Готовность медиапотока ──────────────────────────────────────
   join-room откладывается до тех пор пока getUserMedia не вернётся.
   Это устраняет гонку: собеседник не успевает подключиться до
   того как localStream создан, и треки не теряются.
──────────────────────────────────────────────────────────────── */
let _streamReady    = false;
let _joinPending    = false; /* join-room ждёт готовности потока */
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

/* ── Отслеживаем кто из удалённых участников сейчас шарит экран ── */
const screenSharingPeers = new Set();

/* ── Чёрный canvas-трек (заглушка для видео-сендера при выключенной камере).
   Держим аппаратный индикатор (зелёный огонёк) выключенным: macOS/Win
   зажигают его только когда трек getUserMedia живёт (readyState="live"). ── */
let _blackCanvas = null;
let _blackTrack  = null;
function getBlackVideoTrack() {
    if (_blackTrack && _blackTrack.readyState === "live") return _blackTrack;
    if (!_blackCanvas) {
        _blackCanvas = Object.assign(document.createElement("canvas"), { width: 2, height: 2 });
        _blackCanvas.getContext("2d").fillRect(0, 0, 2, 2);
    }
    _blackTrack = _blackCanvas.captureStream(1).getVideoTracks()[0];
    return _blackTrack;
}

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
    /* #50 — Если нет аудио-треков — нет смысла строить граф */
    if (!rawStream || rawStream.getAudioTracks().length === 0) return rawStream;
    try {
        const ctx  = getAudioCtx();
        const src  = ctx.createMediaStreamSource(rawStream);
        const gn   = ctx.createGain();
        gn.gain.value = gain;
        micGainNode   = gn;
        const dest    = ctx.createMediaStreamDestination();
        src.connect(gn);
        gn.connect(dest);
        /* #51 — Проверяем что dest.stream содержит трек перед созданием выходного потока */
        const destTracks = dest.stream.getAudioTracks();
        if (destTracks.length === 0) { micGainNode = null; return rawStream; }
        const out = new MediaStream();
        rawStream.getVideoTracks().forEach(t => out.addTrack(t));
        destTracks.forEach(t => out.addTrack(t));
        return out;
    } catch (e) {
        micGainNode = null;
        return rawStream;
    }
}

/* ── ICE СЕРВЕРЫ ── */
/* Кредыциалы TURN хранятся на сервере в env-переменных — никогда
   не попадают в клиентский JS. Здесь только STUN как fallback. */
let servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302"  },
        { urls: "stun:stun1.l.google.com:19302" },
    ]
};

/* Загружаем полный список ICE/TURN с сервера. Запрос быстрый
   (тот же хост), завершится до того как понадобится PeerConnection. */
fetch("/api/ice-servers")
    .then(r => r.json())
    .then(data => {
        if (Array.isArray(data.iceServers) && data.iceServers.length > 0) {
            servers = { iceServers: data.iceServers };
            console.log("[ice] loaded:", data.iceServers.length, "servers");
        }
    })
    .catch(e => console.warn("[ice] fetch failed, using STUN only:", e));

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

    /* Индикатор качества соединения (только для remote участников) */
    if (id !== "local") {
        const qi = document.createElement("div");
        qi.className = "quality-indicator quality-unknown";
        qi.id = "quality-" + id;
        qi.title = "Измеряется...";
        qi.innerHTML =
            '<span class="qbar qbar1"></span>' +
            '<span class="qbar qbar2"></span>' +
            '<span class="qbar qbar3"></span>';
        box.appendChild(qi);
    }

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
    screenSharingPeers.delete(id);
    /* Останавливаем speaking monitor */
    if (speakingCancels[id]) { speakingCancels[id](); delete speakingCancels[id]; }
    /* Убираем speaking-таймер */
    if (speakTimers[id]) { clearTimeout(speakTimers[id]); delete speakTimers[id]; }
    /* Отменяем отложенный ICE-рестарт */
    if (reconnectTimers[id]) { clearTimeout(reconnectTimers[id]); delete reconnectTimers[id]; }
    /* Останавливаем индикатор качества */
    stopQualityMonitor(id);
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
    delete peerVideoStreams[id];
    updateGridLayout();
}

/* ── Баннер «Ждём участников» — показывается пока вы один в комнате ── */
function updateWaitingBanner() {
    if (!videoGrid) return;
    const count = videoGrid.querySelectorAll(".video-box").length;
    let banner = document.getElementById("vc-waiting-banner");
    if (count <= 1) {
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "vc-waiting-banner";
            banner.innerHTML = `
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;opacity:0.6">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <div>
                    <div style="font-weight:600;margin-bottom:4px">Вы пока одни</div>
                    <div style="opacity:0.7;font-size:13px">Поделитесь ссылкой, чтобы пригласить участников</div>
                </div>
                <button id="vc-waiting-copy" title="Скопировать ссылку" style="
                    margin-left:auto;padding:8px 16px;background:rgba(99,102,241,0.2);
                    border:1px solid rgba(99,102,241,0.5);border-radius:8px;cursor:pointer;
                    color:#a5b4fc;font-size:13px;white-space:nowrap;flex-shrink:0;
                    transition:background 0.15s;
                ">Скопировать ссылку</button>
            `;
            banner.style.cssText = `
                position:absolute;bottom:0;left:0;right:0;
                display:flex;align-items:center;gap:14px;
                padding:14px 20px;
                background:rgba(10,12,22,0.85);
                border-top:1px solid rgba(255,255,255,0.07);
                backdrop-filter:blur(8px);
                color:var(--text2,#94a3b8);
                font-size:14px;z-index:10;
                animation:fadeInUp 0.3s ease;
            `;
            /* Добавляем анимацию fadeInUp если нет */
            if (!document.getElementById("vc-waiting-anim")) {
                const s = document.createElement("style");
                s.id = "vc-waiting-anim";
                s.textContent = "@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}";
                document.head.appendChild(s);
            }
            videoGrid.style.position = "relative";
            videoGrid.appendChild(banner);
            const copyWaiting = document.getElementById("vc-waiting-copy");
            if (copyWaiting) {
                copyWaiting.onmouseenter = () => copyWaiting.style.background = "rgba(99,102,241,0.35)";
                copyWaiting.onmouseleave = () => copyWaiting.style.background = "rgba(99,102,241,0.2)";
                copyWaiting.onclick = () => {
                    const link = `${location.origin}/?room=${encodeURIComponent(room)}`;
                    navigator.clipboard?.writeText(link)
                        .then(() => showToast("Ссылка скопирована!", "success", 2500))
                        .catch(() => showToast("Не удалось скопировать", "error", 3000));
                };
            }
        }
    } else if (banner) {
        banner.remove();
    }
}

/* ── Динамическая сетка ── */
function updateGridLayout() {
    if (!videoGrid) return;   /* #77 — null guard */
    const count = videoGrid.querySelectorAll(".video-box").length;
    updateWaitingBanner();
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
    /* #78 — Без аудио-треков анализатор бесполезен и может вызвать ошибку в Safari */
    if (!stream || stream.getAudioTracks().length === 0) return;

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
        if (camEnabled) {
            /* Нужно видео + аудио */
            try {
                rawStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: mode }, audio: true
                });
            } catch (_) {
                try {
                    rawStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                } catch (_2) {
                    /* Камера недоступна — пробуем только аудио */
                    try {
                        rawStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        camEnabled = false;
                        setCamIcon();
                        showToast("Камера недоступна — подключено только аудио.", "info", 5000);
                    } catch (e) {
                        showToast("Браузер заблокировал доступ к камере и микрофону. Нажмите на значок 🔒 в адресной строке и разрешите доступ, затем обновите страницу.", "error", 8000);
                        return;
                    }
                }
            }
        } else {
            /* Камера выключена — запрашиваем ТОЛЬКО аудио (не дёргаем камеру!) */
            try {
                rawStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (e) {
                showToast("Браузер заблокировал доступ к микрофону. Нажмите на значок 🔒 в адресной строке и разрешите доступ, затем обновите страницу.", "error", 8000);
                return;
            }
        }
        localStream = (initGain !== 1) ? buildGainedStream(rawStream, initGain) : rawStream;
        localStream.getAudioTracks().forEach(t => t.enabled = micEnabled);
        if (!camEnabled) {
            /* Камера выключена — останавливаем видео-треки (если вдруг есть),
               чтобы не горел аппаратный индикатор камеры. */
            localStream.getVideoTracks().forEach(t => { t.stop(); localStream.removeTrack(t); });
        } else {
            localStream.getVideoTracks().forEach(t => t.enabled = true);
        }
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
            /* #41 — Логируем ошибку replaceTrack вместо молчаливого проглатывания */
            existing.replaceTrack(track).catch(e => console.warn("replaceTrack failed:", e));
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
            const pct = parseInt(this.value) || 0;  /* #44 — NaN guard */
            valEl.textContent = pct + "%";
            audio.volume = Math.max(0, Math.min(1, pct / 100));  /* #44b — clamp volume */
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
   ИНДИКАТОР КАЧЕСТВА СОЕДИНЕНИЯ
   Опрашивает RTCStatsReport каждые 4 сек.
   Показывает RTT и потери аудио-пакетов.
════════════════════════════════════════════ */
const qualityTimers = {};

function startQualityMonitor(id, pc) {
    stopQualityMonitor(id);
    updateQualityIndicator(id, pc);
    qualityTimers[id] = setInterval(() => updateQualityIndicator(id, pc), 4000);
}

function stopQualityMonitor(id) {
    if (qualityTimers[id]) { clearInterval(qualityTimers[id]); delete qualityTimers[id]; }
    const el = document.getElementById("quality-" + id);
    if (el) { el.className = "quality-indicator quality-unknown"; el.title = ""; }
}

async function updateQualityIndicator(id, pc) {
    const el = document.getElementById("quality-" + id);
    if (!el || pc.connectionState === "closed") { stopQualityMonitor(id); return; }
    try {
        const stats = await pc.getStats();
        let rtt = null, lost = 0, total = 0;

        stats.forEach(r => {
            /* RTT из активной (nominated) ICE-пары */
            if (r.type === "candidate-pair" && r.nominated && r.currentRoundTripTime != null) {
                rtt = r.currentRoundTripTime * 1000; /* секунды → мс */
            }
            /* Потери аудио-пакетов */
            if (r.type === "inbound-rtp" && r.kind === "audio") {
                lost  += r.packetsLost     || 0;
                total += (r.packetsReceived || 0) + (r.packetsLost || 0);
            }
        });

        const loss = total > 0 ? lost / total : 0;

        let level, label;
        if (rtt === null) {
            level = "unknown"; label = "Измеряется...";
        } else if (rtt < 150 && loss < 0.03) {
            level = "good";  label = `Хорошее · ${Math.round(rtt)} мс`;
        } else if (rtt < 300 && loss < 0.10) {
            level = "fair";  label = `Среднее · ${Math.round(rtt)} мс`;
        } else {
            level = "poor";  label = `Плохое · ${Math.round(rtt)} мс`;
        }

        el.className = "quality-indicator quality-" + level;
        el.title = label;
    } catch (_) { /* PC закрыт — не страшно */ }
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
        /* #75 — Не начинаем negotiation если PC уже закрыт */
        if (pc.signalingState === "closed") return;
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
        const meta = peerMeta[id] || { name: "Участник", avatar: "cap" };
        if (!document.getElementById("box-" + id)) {
            createVideoBox(id, meta.name, meta.avatar);
            addParticipant(id, meta.name, meta.avatar, id === roomCreatorId);
        }

        if (e.track.kind === "video") {
            /* Сохраняем поток — нужен если media-state(cam:true) придёт позже */
            peerVideoStreams[id] = e.streams[0];

            /* Не доверяем e.track.label для определения «заглушки»:
               на принимающей стороне браузер генерирует label сам,
               и он может отличаться от пустой строки отправителя.
               Вместо этого используем media-state: если cam:false → аватар,
               если cam:true → видео. media-state приходит чуть позже чем
               ontrack, поэтому изначально показываем аватар и ждём.
               Исключение: если peer уже делится экраном (screen-share-state
               пришёл раньше ontrack) — показываем поток как screen share. */
            if (screenSharingPeers.has(id)) {
                /* Демонстрация экрана: ontrack пришёл после screen-share-state */
                showVideoInBox(id, e.streams[0], false, true);
                monitorSpeaking(id, e.streams[0]);
                if (peerAudioEls[id]) {
                    peerAudioEls[id].srcObject = null;
                    peerAudioEls[id].remove();
                    delete peerAudioEls[id];
                }
            } else if (peerMeta[id]?.cam) {
                showVideoInBox(id, e.streams[0], false, false);
                monitorSpeaking(id, e.streams[0]);
                /* Убираем audio-only элемент: теперь аудио воспроизводит <video> */
                if (peerAudioEls[id]) {
                    peerAudioEls[id].srcObject = null;
                    peerAudioEls[id].remove();
                    delete peerAudioEls[id];
                }
            } else {
                /* cam ещё не подтверждена — показываем аватар */
                showAvatarInBox(id, meta.avatar);
            }
        } else if (e.track.kind === "audio") {
            const box           = document.getElementById("box-" + id);
            const existingVideo = box?.querySelector("video");
            if (!existingVideo) {
                /* Камера выключена (или видео ещё не пришло) — нужен отдельный <audio> */
                ensureRemoteAudio(id, e.streams[0]);
                monitorSpeaking(id, e.streams[0]);
            } else if (existingVideo.srcObject !== e.streams[0]) {
                /* Аудио в ДРУГОМ потоке нежели видео (например, видео-сендер был добавлен
                   с пустым MediaStream, а аудио добавлено позже с localStream).
                   Без явного <audio> звук бы потерялся — создаём его. */
                if (screenSharingPeers.has(id)) {
                    showRemoteScreenAudio(id, e.streams[0]);
                } else {
                    ensureRemoteAudio(id, e.streams[0]);
                    monitorSpeaking(id, e.streams[0]);
                }
            }
            /* Если streamId совпадает — аудио уже воспроизводит <video srcObject=stream> */
        }
    };

    pc.onicecandidate = e => {
        if (e.candidate) socket.emit("ice-candidate", { candidate: e.candidate, to: id });
    };

    pc.onconnectionstatechange = () => {
        const state = pc.connectionState;

        /* Запускаем/останавливаем индикатор качества */
        if (state === "connected" || state === "completed") {
            startQualityMonitor(id, pc);
        } else if (state === "disconnected" || state === "failed" || state === "closed") {
            stopQualityMonitor(id);
        }

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

        /* #76 — Проверяем что PC не закрыт перед restartIce (иначе DOMException) */
    if (state === "failed" && pc.signalingState !== "closed") pc.restartIce();
        /* Проверяем что этот PC всё ещё «текущий» для данного peer-а,
           чтобы stale-ивент закрытого старого соединения не убрал новый бокс. */
        if (state === "closed" && peerConnections[id] === pc) removeVideoBox(id);
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
        /* #42 — Логируем ошибки addIceCandidate (помогает при отладке ICE) */
        try { await pc.addIceCandidate(c); } catch (e) { console.warn("flushCandidates addIceCandidate:", e); }
    }
}

/* ════════════════════════════════════════════
   SOCKET СОБЫТИЯ
════════════════════════════════════════════ */

/* connect срабатывает как при первом подключении, так и при переподключении.
   При переподключении socket.id меняется — нужно заново войти в комнату
   и пересобрать все peer connections. */
/* Внутренняя функция: отправить join-room если сокет подключён И поток готов */
function _doJoinRoom() {
    if (socket.connected && _streamReady) {
        _joinPending = false;
        socket.emit("join-room", { room, name, avatar, sessionId: vcSessionId });
    } else {
        _joinPending = true; /* выполним когда оба условия выполнятся */
    }
}

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
            /* Останавливаем все таймеры и мониторы до удаления DOM */
            stopQualityMonitor(id);                                          /* #bug12 — качество */
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
        Object.keys(peerVideoStreams).forEach(id => delete peerVideoStreams[id]);
        screenSharingPeers.clear();
        roomCreatorId = null;
        updateGridLayout();

        /* Возобновляем AudioContext — браузер мог заморозить его во время разрыва */
        ensureAudioCtxRunning();

        /* При переподключении поток уже готов — сразу входим в комнату */
        _joined = true;
        socket.emit("join-room", { room, name, avatar, sessionId: vcSessionId });
        /* Состояние медиа отправляем быстро (не ждём 2 сек) */
        setTimeout(() => { emitMediaState(); updateLabelIcons("local", micEnabled, camEnabled); }, 500);
        return;
    }

    /* ── Первое подключение: ждём готовности медиапотока ── */
    _joined = true;
    _doJoinRoom(); /* если поток уже готов — входим сразу, иначе _joinPending = true */
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

    /* Отправляем наше состояние медиа существующим участникам после вхождения в комнату.
       Без этого они не знают включена ли у нас камера/микрофон до следующего действия
       (нажатия кнопки). Задержка 200 мс нужна чтобы сигнальный сервер успел
       обработать join-room до рассылки media-state. */
    setTimeout(() => emitMediaState(), 200);
});

socket.on("user-connected", async data => {
    /* #59 — Null check: data.id обязателен для создания peer connection */
    if (!data.id) return;
    showToast(`👋 ${data.name || "Участник"} присоединился к конференции`, "info", 4000);
    peerMeta[data.id] = { name: data.name, avatar: data.avatar || "default", mic: false, cam: false };
    addParticipant(data.id, data.name, data.avatar || "default", data.id === roomCreatorId);
    createVideoBox(data.id, data.name, data.avatar || "default");

    const pc = createPeer(data.id);

    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (!pc.getSenders().find(s => s.track === track)) pc.addTrack(track, localStream);
        });
    }
    /* Если камера выключена, добавляем чёрный трек чтобы видео-сендер существовал
       и у собеседника был корректный видео-слот (включим камеру — просто replaceTrack) */
    if (!camEnabled && !screenEnabled && !pc.getSenders().some(s => s.track?.kind === "video")) {
        pc.addTrack(getBlackVideoTrack(), localStream || new MediaStream());
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
    /* #60 — Null check: data.offer обязателен для setRemoteDescription */
    if (!data.from || !data.offer) return;
    if (data.name) {
        peerMeta[data.from] = { name: data.name, avatar: data.avatar || "cap" };
        if (!document.getElementById("box-" + data.from)) {
            createVideoBox(data.from, data.name, data.avatar || "cap");
            addParticipant(data.from, data.name, data.avatar || "cap", data.from === roomCreatorId);
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
    /* Если камера выключена, добавляем чёрный трек чтобы видео-сендер существовал */
    if (!camEnabled && !screenEnabled && !pc.getSenders().some(s => s.track?.kind === "video")) {
        pc.addTrack(getBlackVideoTrack(), localStream || new MediaStream());
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
    /* #61 — Null check: data.answer обязателен для setRemoteDescription */
    if (!data.from || !data.answer) return;
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
        /* #43 — Логируем ошибку addIceCandidate (silent fail скрывал ICE-проблемы) */
        try { await pc.addIceCandidate(data.candidate); } catch (e) { console.warn("addIceCandidate:", e); }
    } else {
        if (!pendingCandidates[data.from]) pendingCandidates[data.from] = [];
        /* Cap: не храним больше 50 кандидатов (защита от флуда) */
        if (pendingCandidates[data.from].length < 50) {
            pendingCandidates[data.from].push(data.candidate);
        }
        /* Защита от утечки памяти: чистим очередь если remoteDescription
           так и не установился в течение 10 сек (например, peer отключился). */
        if (pendingCandidates[data.from].length === 1) {
            setTimeout(() => {
                if (pendingCandidates[data.from]) {
                    console.warn("pendingCandidates cleanup for", data.from);
                    delete pendingCandidates[data.from];
                }
            }, 10_000);
        }
    }
});

socket.on("user-disconnected", data => {
    /* ghost: true — это было принудительное выселение дубля при переподключении;
       не показываем тост «покинул» (пользователь фактически остаётся в комнате). */
    if (!data.ghost) {
        const leaveName = peerMeta[data.id]?.name || "Участник";
        showToast(`${leaveName} покинул конференцию`, "info", 4000);
    }
    removeVideoBox(data.id);
});

/* #64 — Обновляем корону при смене создателя комнаты */
socket.on("new-creator", data => {
    if (!data.id) return;
    roomCreatorId = data.id;
    /* Убираем корону у всех участников */
    document.querySelectorAll(".participant-crown").forEach(c => c.remove());
    /* Ставим корону новому создателю */
    setCreatorCrown(data.id === socket.id ? "local" : data.id);
});

socket.on("screen-share-state", data => {
    const box = document.getElementById("box-" + data.from);
    if (!box) return;

    if (data.sharing) {
        screenSharingPeers.add(data.from);

        const vid = box.querySelector("video");
        if (!vid) {
            /* Камера собеседника была выключена — нет video-элемента.
               Создаём его из кэшированного потока чтобы показать экран. */
            if (peerVideoStreams[data.from]) {
                showVideoInBox(data.from, peerVideoStreams[data.from], false, true);
                monitorSpeaking(data.from, peerVideoStreams[data.from]);
                if (peerAudioEls[data.from]) {
                    peerAudioEls[data.from].srcObject = null;
                    peerAudioEls[data.from].remove();
                    delete peerAudioEls[data.from];
                }
            }
            /* Если пока нет потока — ontrack придёт позже и увидит screenSharingPeers */
        } else {
            vid.classList.add("screen-video");
        }

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
                const pct = parseInt(this.value) || 0;  /* #45 — NaN guard */
                valEl.textContent = pct + "%";
                const vol = Math.max(0, Math.min(1, pct / 100));  /* #45b — clamp volume */
                /* Управляем громкостью: video-элемент или скрытый audio */
                const v = box.querySelector("video");
                if (v) v.volume = vol;
                if (peerAudioEls[data.from]) peerAudioEls[data.from].volume = vol;
            };
        }
    } else {
        screenSharingPeers.delete(data.from);
        /* Убираем слайдер громкости и любые устаревшие элементы screen audio */
        box.querySelector(".rsa-viewer-panel")?.remove();
        removeRemoteScreenAudio(data.from);
        /* Восстанавливаем отображение: камера включена → убираем screen-video класс,
           камера выключена → скрываем video и показываем аватар */
        const currentVid = box.querySelector("video");
        if (peerMeta[data.from]?.cam) {
            if (currentVid) currentVid.classList.remove("screen-video");
        } else {
            /* Камера была выключена до и во время демонстрации экрана —
               убираем video-элемент и возвращаем аватар */
            showAvatarInBox(data.from, peerMeta[data.from]?.avatar || "default");
        }
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
socket.on("media-state", data => {
    const prevCam = peerMeta[data.from]?.cam;

    /* Сохраняем состояние в peerMeta */
    if (peerMeta[data.from]) {
        peerMeta[data.from].mic = data.mic;
        peerMeta[data.from].cam = data.cam;
    }
    updateLabelIcons(data.from, data.mic, data.cam);

    /* Переключаем аватар ↔ видео если состояние камеры изменилось */
    if (prevCam !== data.cam) {
        if (data.cam && peerVideoStreams[data.from]) {
            /* Камера включилась — показываем видео */
            showVideoInBox(data.from, peerVideoStreams[data.from], false, false);
            monitorSpeaking(data.from, peerVideoStreams[data.from]);
            if (peerAudioEls[data.from]) {
                peerAudioEls[data.from].srcObject = null;
                peerAudioEls[data.from].remove();
                delete peerAudioEls[data.from];
            }
        } else if (!data.cam) {
            /* Камера выключилась — показываем аватар */
            showAvatarInBox(data.from, peerMeta[data.from]?.avatar || "default");
        }
    }
});

/* ════════════════════════════════════════════
   КНОПКА МИКРОФОН
════════════════════════════════════════════ */
function setMicIcon() {
    if (!micBtn) return;   /* #54 — null guard */
    micBtn.innerHTML = micEnabled ? ICONS.micOn : ICONS.micOff;
    micBtn.className = micEnabled ? "btn-active" : "btn-inactive";
    micBtn.setAttribute("aria-label", micEnabled ? "Выключить микрофон" : "Включить микрофон");
    micBtn.setAttribute("aria-pressed", micEnabled ? "true" : "false");
}
if (micBtn) micBtn.onclick = async () => {   /* #56 — null guard */
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
    if (!camBtn) return;   /* #55 — null guard */
    camBtn.innerHTML = camEnabled ? ICONS.camOn : ICONS.camOff;
    camBtn.className = camEnabled ? "btn-active" : "btn-inactive";
    camBtn.setAttribute("aria-label", camEnabled ? "Выключить камеру" : "Включить камеру");
    camBtn.setAttribute("aria-pressed", camEnabled ? "true" : "false");
}
if (camBtn) camBtn.onclick = async () => {   /* #57 — null guard */
    if (!localStream) { await startCamera(); if (!localStream) return; }
    camEnabled = !camEnabled;

    if (!camEnabled) {
        /* ── Выключаем камеру: останавливаем трек, гасим аппаратный индикатор ── */
        localStream.getVideoTracks().forEach(t => { t.stop(); localStream.removeTrack(t); });
        if (!screenEnabled) {
            /* Заменяем на чёрный canvas-трек — сендер остаётся живым без renegotiation */
            const blackTrack = getBlackVideoTrack();
            for (const [, pc] of Object.entries(peerConnections)) {
                const s = pc.getSenders().find(s => s.track?.kind === "video");
                if (s) s.replaceTrack(blackTrack).catch(() => {});
            }
        }
    } else {
        /* ── Включаем камеру: запрашиваем новый трек через getUserMedia ── */
        try {
            const ns = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
            const newTrack = ns.getVideoTracks()[0];
            if (newTrack) {
                newTrack.enabled = true;
                localStream.addTrack(newTrack);
                if (!screenEnabled) {
                    for (const [, pc] of Object.entries(peerConnections)) {
                        const s = pc.getSenders().find(s => s.track?.kind === "video");
                        if (s) s.replaceTrack(newTrack).catch(() => {});
                        else   pc.addTrack(newTrack, localStream);
                    }
                }
            }
        } catch (e) {
            camEnabled = false;
            showToast("Не удалось включить камеру: " + e.message, "error");
        }
    }

    setCamIcon();
    updateLabelIcons("local", micEnabled, camEnabled);
    emitMediaState();
    if (flipBtn) flipBtn.style.display = (camEnabled && !screenEnabled) ? "" : "none";
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
    if (!screenBtn) return;   /* #52 — null guard */
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
        /* #74 — null guard: .controls может отсутствовать */
        const controlsEl = document.querySelector(".controls");
        if (!controlsEl) { panel.style.display = "none"; return; }
        controlsEl.prepend(panel);
        document.getElementById("screenAudioSlider").oninput = function () {
            const pct = parseInt(this.value) || 0;  /* #46 — NaN guard */
            document.getElementById("screenAudioValue").textContent = pct + "%";
            /* Управляем уровнем звука экрана в WebAudio-миксе для собеседников */
            if (screenAudioMix?.screenGain) {
                screenAudioMix.screenGain.gain.value = Math.max(0, pct / 100);  /* #46b — non-negative */
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

if (screenBtn) screenBtn.onclick = async () => {   /* #58 — null guard */
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

        /* Возвращаем видео-трек камеры (или чёрный трек если камера выключена) */
        if (localStream) {
            const camTrack = localStream.getVideoTracks()[0];
            if (camTrack) {
                for (const [, pc] of Object.entries(peerConnections)) {
                    const s = pc.getSenders().find(s => s.track?.kind === "video");
                    if (s) s.replaceTrack(camTrack).catch(() => {});
                }
            } else if (!camEnabled) {
                /* Камера выключена — ставим обратно чёрный трек чтобы сендер остался */
                const blackTrack = getBlackVideoTrack();
                for (const [, pc] of Object.entries(peerConnections)) {
                    const s = pc.getSenders().find(s => s.track?.kind === "video");
                    if (s) s.replaceTrack(blackTrack).catch(() => {});
                }
            }
        }
        if (camEnabled && localStream) showVideoInBox("local", localStream, true, false);
        else showAvatarInBox("local", avatar);
        return;
    }

    try {
        /* Ограничиваем fps демонстрации экрана — 15 fps вместо 30.
           Слайды и документы выглядят одинаково хорошо при 15 fps,
           а трафик и нагрузка на CPU снижаются примерно вдвое. */
        screenStream  = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: { ideal: 15, max: 15 } },
            audio: true
        });
        screenEnabled = true;
        setScreenIcon();
        socket.emit("screen-share-state", { sharing: true });
        const screenAudioTracks = screenStream.getAudioTracks();
        const audioMsg = screenAudioTracks.length > 0
            ? " Аудио системы тоже передаётся."
            : "";
        showToast(`Демонстрация экрана началась — участники видят ваш экран.${audioMsg}`, "success", 5000);

        const screenTrack = screenStream.getVideoTracks()[0];
        /* screenAudioTracks уже объявлен выше для сообщения тоста */

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
        /* #47 — Optional chaining: screenBtn может не существовать */
        screenTrack.onended = () => { if (screenEnabled) screenBtn?.click(); };
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
if (leaveBtn) leaveBtn.onclick = () => {  /* #53 — null guard */
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
   ЯВНЫЙ ВЫХОД ПРИ ОБНОВЛЕНИИ / ЗАКРЫТИИ
   Отправляем leave-room ДО того как браузер
   закроет WebSocket — сервер мгновенно убирает
   нас из комнаты без ожидания ping timeout.
════════════════════════════════════════════ */
function emitLeave() {
    /* Попытка 1: WebSocket (быстро, но браузер может закрыть сокет раньше) */
    try { if (socket.connected) socket.emit("leave-room"); } catch (e) {}
    /* Попытка 2: sendBeacon — HTTP запрос, который браузер ГАРАНТИРУЕТ отправить
       даже после закрытия страницы. Это надёжный fallback против "призраков". */
    try {
        if (typeof navigator.sendBeacon === "function") {
            const body = new URLSearchParams({ room, session: vcSessionId });
            navigator.sendBeacon("/api/leave", body);
        }
    } catch (e) {}
}
window.addEventListener("beforeunload", emitLeave);
window.addEventListener("pagehide",     emitLeave);

/* ── Android: кнопка "Назад" — предотвращаем случайный выход из звонка ── */
history.pushState(null, "", location.href);
window.addEventListener("popstate", () => {
    history.pushState(null, "", location.href);
    if (confirm("Покинуть конференцию?")) {
        emitLeave();
        window.location.replace("/");
    }
});

/* ════════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
════════════════════════════════════════════ */
createVideoBox("local", name, avatar);
addParticipant("local", name, avatar, false); /* корона выставляется после получения room-users */
updateGridLayout();
setMicIcon();
setCamIcon();
setScreenIcon();
/* Сразу обновляем иконки в лейбле — createVideoBox всегда ставит (false,false),
   а пользователь мог включить mic/cam ещё в лобби */
updateLabelIcons("local", micEnabled, camEnabled);
if (copyBtn) {
    copyBtn.innerHTML = ICONS.copyLink;
    copyBtn.setAttribute("aria-label", "Поделиться ссылкой");
}

/* Стартуем медиапоток и только после этого входим в комнату.
   Это устраняет гонку: join-room не отправляется пока localStream не готов,
   поэтому у собеседников всегда будут треки при подключении. */
function _onStreamReady() {
    _streamReady = true;
    if (_joinPending) _doJoinRoom(); /* сокет уже подключён — можно войти */
}

if (initMic || initCam) {
    startCamera().then(() => {
        if (!localStream) { _onStreamReady(); return; }
        if (initMic) monitorSpeaking("local", localStream);
        if (initCam) {
            showVideoInBox("local", localStream, true, false);
            if (flipBtn) flipBtn.style.display = "";
        }
        updateLabelIcons("local", micEnabled, camEnabled);
        emitMediaState();
        _onStreamReady();
    }).catch(() => _onStreamReady()); /* ошибка — всё равно входим (без аудио) */
} else {
    /* Камера и микро выключены — поток не нужен, входим сразу */
    _onStreamReady();
}
