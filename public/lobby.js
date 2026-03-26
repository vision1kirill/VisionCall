/* ═══════════════════════════════════════
   LOBBY — предпросмотр камеры/микрофона
═══════════════════════════════════════ */

const params = new URLSearchParams(window.location.search);
const room   = params.get("room");
const name   = params.get("name");
const avatar = "default"; /* единый силуэт для всех */

if (!room || !name || name === "null") {
    window.location.replace("/");
    throw new Error("redirect");
}

/* ── DOM refs ── */
const lobbyNameEl      = document.getElementById("lobbyName");
const lobbyAvatarEl    = document.getElementById("lobbyAvatar");
const previewAvatarEl  = document.getElementById("previewAvatar");
const previewDiv       = document.getElementById("lobbyPreview");
const previewOff       = document.getElementById("previewOff");
const micBtn           = document.getElementById("lobbyMicBtn");
const camBtn           = document.getElementById("lobbyCamBtn");
const statusEl         = document.getElementById("lobbyStatus");
const joinBtn          = document.getElementById("lobbyJoinBtn");
const micMeterSection  = document.getElementById("micMeterSection");
const micMeterFill     = document.getElementById("micMeterFill");
const micGainSlider    = document.getElementById("micGainSlider");
const gainValueEl      = document.getElementById("gainValue");
const earphoneHint     = document.getElementById("earphoneHint");

if (lobbyNameEl) lobbyNameEl.textContent = name;

/* ── Отображаем SVG-аватар (или эмодзи для обратной совместимости) ── */
function setAvatarEl(el, key) {
    if (!el) return;   /* #20 — null guard: элемент может отсутствовать */
    if (window.AVATARS && window.AVATARS[key]) {
        el.innerHTML = window.AVATARS[key];
    } else {
        el.textContent = key;
    }
}
setAvatarEl(lobbyAvatarEl,   avatar);
setAvatarEl(previewAvatarEl, avatar);

/* ── SVG иконки ── */
const SVG = {
    micOn:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`,
    micOff: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
    camOn:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
    camOff: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06A4 4 0 1 1 7.72 7.72"/></svg>`,
};

/* ── Состояние ── */
let micEnabled  = false;
let camEnabled  = false;
let localStream = null;
let videoEl     = null;

/* AudioContext для шкалы и прослушки */
let audioCtx     = null;
let analyserNode = null;
let gainNode     = null;
let meterAnimId  = null;

/* ── Обновление иконок кнопок ── */
function updateMicBtn() {
    if (!micBtn) return;   /* #22 — null guard */
    micBtn.innerHTML = micEnabled ? SVG.micOn : SVG.micOff;
    micBtn.className = "lobby-ctrl-btn " + (micEnabled ? "active" : "inactive");
    micBtn.title = micEnabled ? "Выключить микрофон" : "Включить микрофон";
    micBtn.setAttribute("aria-pressed", micEnabled ? "true" : "false");
}
function updateCamBtn() {
    if (!camBtn) return;   /* #23 — null guard */
    camBtn.innerHTML = camEnabled ? SVG.camOn : SVG.camOff;
    camBtn.className = "lobby-ctrl-btn " + (camEnabled ? "active" : "inactive");
    camBtn.title = camEnabled ? "Выключить камеру" : "Включить камеру";
    camBtn.setAttribute("aria-pressed", camEnabled ? "true" : "false");
}

/* ── Шкала громкости + прослушка своего голоса ── */
function startMeter(stream) {
    try {
        if (meterAnimId) { cancelAnimationFrame(meterAnimId); meterAnimId = null; }
        if (audioCtx) { try { audioCtx.close(); } catch (_) {} }
        audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(stream);
        gainNode  = audioCtx.createGain();
        gainNode.gain.value = (parseInt(micGainSlider?.value) || 100) / 100;
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.55;

        src.connect(gainNode);
        gainNode.connect(analyserNode);

        /* ───────────────────────────────────────────────────
           Подключаем к динамикам — пользователь слышит себя.
           Используется ТОЛЬКО на этой странице.
           В комнате этого нет (audioCtx закрывается при входе).
        ─────────────────────────────────────────────────── */
        gainNode.connect(audioCtx.destination);

        const data = new Uint8Array(analyserNode.frequencyBinCount);
        function tick() {
            meterAnimId = requestAnimationFrame(tick);
            if (!micMeterFill) return;
            analyserNode.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            const pct = Math.min(100, (sum / data.length / 60) * 100);
            micMeterFill.style.width = pct + "%";
            if (pct < 60)      micMeterFill.style.background = "#22c55e";
            else if (pct < 85) micMeterFill.style.background = "#f59e0b";
            else               micMeterFill.style.background = "#ef4444";
        }
        tick();
        micMeterSection?.classList.add("visible");   /* #21 — optional chaining */
        if (earphoneHint) earphoneHint.style.display = "flex";
    } catch (e) {
        console.warn("AudioContext недоступен:", e);
    }
}

function stopMeter() {
    if (meterAnimId) { cancelAnimationFrame(meterAnimId); meterAnimId = null; }
    if (micMeterFill) micMeterFill.style.width = "0%";
    if (!micEnabled) {
        micMeterSection?.classList.remove("visible");
        if (earphoneHint) earphoneHint.style.display = "none";
    }
    /* Закрываем AudioContext → прослушка полностью останавливается */
    if (audioCtx) { try { audioCtx.close(); } catch (_) {} audioCtx = null; gainNode = null; analyserNode = null; }
}

/* ── Слайдер громкости ── */
if (micGainSlider) micGainSlider.oninput = () => {
    const pct = micGainSlider.value;
    if (gainValueEl) gainValueEl.textContent = pct + "%";   /* #24 — null guard */
    if (gainNode) gainNode.gain.value = (parseInt(pct) || 0) / 100;  /* #25 — NaN guard */
};

/* ── Запрос потока ── */
async function ensureStream() {
    if (!localStream) {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (e) {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            } catch (e2) {
                if (statusEl) statusEl.textContent = "⚠️ Браузер заблокировал доступ к камере и микрофону. Нажмите на значок 🔒 в адресной строке браузера, разрешите доступ и перезагрузите страницу.";
                return false;
            }
        }
        localStream.getTracks().forEach(t => t.enabled = false);
    }
    return true;
}

function showVideoPreview() {
    if (!previewDiv) return;   /* #26 — null guard */
    if (!videoEl) {
        videoEl = document.createElement("video");
        videoEl.autoplay    = true;
        videoEl.muted       = true;
        videoEl.playsInline = true;
        videoEl.srcObject   = localStream;
        /* #27 — null guard: вставляем перед previewOff если он есть, иначе append */
        if (previewOff) previewDiv.insertBefore(videoEl, previewOff);
        else            previewDiv.appendChild(videoEl);
    }
    if (previewOff) previewOff.style.display = "none";
    videoEl.style.display = "";
}
function hideVideoPreview() {
    if (videoEl) videoEl.style.display = "none";
    if (previewOff) previewOff.style.display = "";
}

function updateStatus() {
    if (!statusEl) return;   /* null guard: statusEl может отсутствовать */
    if (micEnabled && camEnabled) statusEl.textContent = "✅ Всё готово! Камера и микрофон работают. Можете входить в конференцию.";
    else if (micEnabled)          statusEl.textContent = "✅ Микрофон включён — вас слышат. Камера выключена.";
    else if (camEnabled)          statusEl.textContent = "✅ Камера включена — вас видят. Микрофон выключен.";
    else                          statusEl.textContent = "Проверьте камеру и микрофон перед входом. Когда будете готовы — нажмите кнопку ниже.";
}

/* ── Кнопка микрофона ── */
if (micBtn) micBtn.onclick = async () => {   /* null guard */
    const ok = await ensureStream();
    if (!ok) return;
    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(t => t.enabled = micEnabled);
    if (micEnabled) startMeter(localStream);
    else            stopMeter();
    updateMicBtn();
    updateStatus();
};

/* ── Кнопка камеры ── */
if (camBtn) camBtn.onclick = async () => {   /* null guard */
    const ok = await ensureStream();
    if (!ok) return;
    camEnabled = !camEnabled;

    if (!camEnabled) {
        /* #30 — Останавливаем треки целиком → аппаратный индикатор камеры гаснет.
           Просто t.enabled = false не гасит зелёный огонёк на macOS/Windows. */
        localStream.getVideoTracks().forEach(t => { t.stop(); localStream.removeTrack(t); });
        hideVideoPreview();
    } else {
        /* Камера снова включается — запрашиваем новый трек */
        try {
            const vs = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            vs.getVideoTracks().forEach(t => { t.enabled = true; localStream.addTrack(t); });
            showVideoPreview();
        } catch (e) {
            camEnabled = false;
            if (statusEl) statusEl.textContent = "⚠️ Не удалось включить камеру: " + e.message;
        }
    }

    updateCamBtn();
    updateStatus();
};

/* ── Войти в комнату ── */
if (joinBtn) joinBtn.onclick = () => {   /* null guard */
    /* Защита от двойного нажатия */
    if (joinBtn.disabled) return;
    joinBtn.disabled = true;

    if (localStream) localStream.getTracks().forEach(t => t.stop());
    /* Закрываем AudioContext — прослушка остановлена, в комнате её нет */
    if (audioCtx) { try { audioCtx.close(); } catch (_) {} audioCtx = null; }  /* #29 — safe close */
    const gain = micGainSlider?.value ?? 100;  /* #28 — null-safe value */
    window.location.href = `/room.html?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name.slice(0, 64))}&avatar=${encodeURIComponent(avatar)}&mic=${micEnabled ? 1 : 0}&cam=${camEnabled ? 1 : 0}&micGain=${gain}`;
};

/* ── Инициализация ── */
updateMicBtn();
updateCamBtn();
updateStatus();
