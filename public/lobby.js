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
const noiseBtn         = document.getElementById("lobbyNoiseBtn");
const statusEl         = document.getElementById("lobbyStatus");
const joinBtn          = document.getElementById("lobbyJoinBtn");
const micMeterSection  = document.getElementById("micMeterSection");
const micGainSlider    = document.getElementById("micGainSlider");
const gainValueEl      = document.getElementById("gainValue");
const micWaveformCanvas= document.getElementById("micWaveform");
const micQualityDot    = document.getElementById("micQualityDot");
const micQualityText   = document.getElementById("micQualityText");
const speakerTestBtn   = document.getElementById("speakerTestBtn");
const speakerTestHint  = document.getElementById("speakerTestHint");

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
let micEnabled   = false;
let camEnabled   = false;
let noiseEnabled = true;   /* шумоподавление включено по умолчанию */
let localStream  = null;
let videoEl      = null;

/* AudioContext для визуализации (НЕ для воспроизведения — эха нет) */
let audioCtx     = null;
let analyserNode = null;
let gainNode     = null;
let meterAnimId  = null;

/* Скользящее среднее для оценки качества микрофона */
let _qualityAvg = 0;

/* ── SVG шумоподавления ── */
const SVG_NOISE_ON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9v6"/><path d="M12 5v14"/><path d="M15 9v6"/><path d="M3 12h3"/><path d="M18 12h3"/></svg>`;
const SVG_NOISE_OFF = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9v6"/><path d="M12 5v14"/><path d="M15 9v6"/><path d="M3 12h3"/><path d="M18 12h3"/><line x1="3" y1="3" x2="21" y2="21"/></svg>`;

/* ── Обновление иконок кнопок ── */
function updateMicBtn() {
    if (!micBtn) return;
    micBtn.innerHTML = micEnabled ? SVG.micOn : SVG.micOff;
    micBtn.className = "lobby-ctrl-btn " + (micEnabled ? "active" : "inactive");
    micBtn.title = micEnabled ? "Выключить микрофон" : "Включить микрофон";
    micBtn.setAttribute("aria-pressed", micEnabled ? "true" : "false");
}
function updateCamBtn() {
    if (!camBtn) return;
    camBtn.innerHTML = camEnabled ? SVG.camOn : SVG.camOff;
    camBtn.className = "lobby-ctrl-btn " + (camEnabled ? "active" : "inactive");
    camBtn.title = camEnabled ? "Выключить камеру" : "Включить камеру";
    camBtn.setAttribute("aria-pressed", camEnabled ? "true" : "false");
}
function updateNoiseBtn() {
    if (!noiseBtn) return;
    noiseBtn.innerHTML = noiseEnabled ? SVG_NOISE_ON : SVG_NOISE_OFF;
    noiseBtn.className = "lobby-ctrl-btn " + (noiseEnabled ? "active" : "inactive");
    noiseBtn.title = noiseEnabled ? "Шумоподавление включено — нажмите, чтобы выключить" : "Шумоподавление выключено — нажмите, чтобы включить";
    noiseBtn.setAttribute("aria-pressed", noiseEnabled ? "true" : "false");
}

/* ── Визуализация звука (осциллограмма) + оценка качества ── */
function _setQuality(level) {
    /* level: "idle" | "quiet" | "good" | "loud" */
    if (!micQualityDot || !micQualityText) return;
    const map = {
        idle:  { color: "rgba(148,163,184,0.5)", text: "Говорите что-нибудь…" },
        quiet: { color: "#f59e0b",               text: "Вас плохо слышно — говорите громче" },
        good:  { color: "#22c55e",               text: "Вас слышно хорошо ✓" },
        loud:  { color: "#ef4444",               text: "Слишком громко — отодвиньтесь от микрофона" },
    };
    const q = map[level] || map.idle;
    micQualityDot.style.background = q.color;
    micQualityText.textContent = q.text;
    micQualityText.style.color = q.color;
}

/* ── Самопрослушивание: запись 5 секунд → воспроизведение ── */
let selfMonitorTimer = null;
let _smRecording = false;
const selfMonitorBtn  = document.getElementById("selfMonitorBtn");
const selfMonitorHint = document.getElementById("selfMonitorHint");

/* Заглушка для обратной совместимости (stopMeter вызывает disableSelfMonitor) */
function disableSelfMonitor() {
    if (selfMonitorTimer) { clearInterval(selfMonitorTimer); selfMonitorTimer = null; }
    _smRecording = false;
    if (selfMonitorBtn) selfMonitorBtn.classList.remove("active");
    if (selfMonitorHint) selfMonitorHint.textContent = "";
}

async function startSelfMonitorRecording(seconds = 5) {
    if (_smRecording) return;           /* защита от двойного нажатия */
    if (!localStream) {
        if (selfMonitorHint) selfMonitorHint.textContent = "Сначала включите микрофон";
        setTimeout(() => { if (selfMonitorHint) selfMonitorHint.textContent = ""; }, 2500);
        return;
    }
    const audioTracks = localStream.getAudioTracks();
    if (!audioTracks.length || !audioTracks[0].enabled) {
        if (selfMonitorHint) selfMonitorHint.textContent = "Сначала включите микрофон";
        setTimeout(() => { if (selfMonitorHint) selfMonitorHint.textContent = ""; }, 2500);
        return;
    }

    /* Пробуем подходящий MIME-тип */
    const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg", ""]
        .find(m => m === "" || MediaRecorder.isTypeSupported(m)) || "";

    let recorder;
    try {
        const recStream = new MediaStream(audioTracks);
        recorder = new MediaRecorder(recStream, mimeType ? { mimeType } : {});
    } catch (e) {
        console.warn("[selfMonitor] MediaRecorder init failed:", e);
        if (selfMonitorHint) selfMonitorHint.textContent = "Запись недоступна в этом браузере";
        return;
    }

    _smRecording = true;
    if (selfMonitorBtn) selfMonitorBtn.classList.add("active");

    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };

    recorder.onstop = () => {
        _smRecording = false;
        if (selfMonitorBtn) selfMonitorBtn.classList.remove("active");
        if (selfMonitorHint) selfMonitorHint.textContent = "▶ Воспроизводим…";

        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const url  = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => {
            URL.revokeObjectURL(url);
            if (selfMonitorHint) selfMonitorHint.textContent = "";
        };
        audio.onerror = () => {
            URL.revokeObjectURL(url);
            if (selfMonitorHint) selfMonitorHint.textContent = "Не удалось воспроизвести";
            setTimeout(() => { if (selfMonitorHint) selfMonitorHint.textContent = ""; }, 2500);
        };
        audio.play().catch(err => {
            console.warn("[selfMonitor] play failed:", err);
            if (selfMonitorHint) selfMonitorHint.textContent = "Не удалось воспроизвести";
            setTimeout(() => { if (selfMonitorHint) selfMonitorHint.textContent = ""; }, 2500);
        });
    };

    recorder.start();

    /* Обратный отсчёт */
    let left = seconds;
    if (selfMonitorHint) selfMonitorHint.textContent = `🎤 Говорите — ${left} с`;
    selfMonitorTimer = setInterval(() => {
        left--;
        if (left <= 0) {
            clearInterval(selfMonitorTimer); selfMonitorTimer = null;
            if (selfMonitorHint) selfMonitorHint.textContent = "⏳ Обработка…";
            try { recorder.stop(); } catch (_) {}
        } else {
            if (selfMonitorHint) selfMonitorHint.textContent = `🎤 Говорите — ${left} с`;
        }
    }, 1000);
}

function startMeter(stream) {
    try {
        if (meterAnimId) { cancelAnimationFrame(meterAnimId); meterAnimId = null; }
        if (audioCtx) { try { audioCtx.close(); } catch (_) {} }

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(stream);
        gainNode  = audioCtx.createGain();
        gainNode.gain.value = (parseInt(micGainSlider?.value) || 100) / 100;
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 1024;
        analyserNode.smoothingTimeConstant = 0.75;

        /* ⚠️ По умолчанию НЕ подключаем к destination — пользователь не слышит себя.
           Кнопка «Послушать себя» использует MediaRecorder (запись → воспроизведение). */
        src.connect(gainNode);
        gainNode.connect(analyserNode);

        const timeData = new Uint8Array(analyserNode.fftSize);
        const freqData = new Uint8Array(analyserNode.frequencyBinCount);
        const ctx2d    = micWaveformCanvas?.getContext("2d");
        _qualityAvg    = 0;
        let _qualityFrames = 0;

        function tick() {
            meterAnimId = requestAnimationFrame(tick);

            /* ── Осциллограмма ── */
            if (ctx2d && micWaveformCanvas) {
                /* Синхронизируем размер canvas с реальными CSS-пикселями каждый кадр.
                   Без этого canvas.width != clientWidth → рисунок не совпадает с контейнером. */
                const dpr = window.devicePixelRatio || 1;
                const cW  = micWaveformCanvas.clientWidth  || 300;
                const cH  = micWaveformCanvas.clientHeight || 56;
                if (micWaveformCanvas.width  !== Math.round(cW * dpr) ||
                    micWaveformCanvas.height !== Math.round(cH * dpr)) {
                    micWaveformCanvas.width  = Math.round(cW * dpr);
                    micWaveformCanvas.height = Math.round(cH * dpr);
                    ctx2d.scale(dpr, dpr);
                }
                const W = cW;
                const H = cH;
                const pad = 5; /* отступ сверху/снизу — волна не вылезает за рамку */

                analyserNode.getByteTimeDomainData(timeData);
                ctx2d.clearRect(0, 0, W * dpr, H * dpr);

                /* Центральная линия-ориентир */
                ctx2d.beginPath();
                ctx2d.strokeStyle = "rgba(99,102,241,0.20)";
                ctx2d.lineWidth = 1;
                ctx2d.moveTo(0, H / 2);
                ctx2d.lineTo(W, H / 2);
                ctx2d.stroke();

                /* Осциллограмма.
                   ПРАВИЛЬНАЯ формула: timeData[i]=128 → молчание → y=H/2.
                   v ∈ [-1, +1], y = center ± amplitude (с padding). */
                const drawWave = (lw, alpha) => {
                    ctx2d.beginPath();
                    ctx2d.lineWidth = lw;
                    ctx2d.strokeStyle = `rgba(99,102,241,${alpha})`;
                    ctx2d.lineJoin = "round";
                    const sliceW = W / (timeData.length - 1);
                    for (let i = 0; i < timeData.length; i++) {
                        const v = (timeData[i] - 128) / 128;          /* -1…+1 */
                        const y = H / 2 + v * (H / 2 - pad);          /* pad от краёв */
                        const x = i * sliceW;
                        if (i === 0) ctx2d.moveTo(x, y);
                        else         ctx2d.lineTo(x, y);
                    }
                    ctx2d.stroke();
                };
                drawWave(5, 0.10);  /* свечение */
                drawWave(2, 0.90);  /* основная линия */
            }

            /* ── Оценка качества (скользящее среднее) ── */
            analyserNode.getByteFrequencyData(freqData);
            let sum = 0;
            for (let i = 0; i < freqData.length; i++) sum += freqData[i];
            const lvl = sum / freqData.length;
            _qualityAvg = _qualityAvg * 0.985 + lvl * 0.015;
            _qualityFrames++;
            if (_qualityFrames > 60) {
                if      (_qualityAvg < 3)  _setQuality("idle");
                else if (_qualityAvg < 12) _setQuality("quiet");
                else if (_qualityAvg < 70) _setQuality("good");
                else                       _setQuality("loud");
            }
        }
        tick();
        micMeterSection?.classList.add("visible");
        _setQuality("idle");
    } catch (e) {
        console.warn("AudioContext недоступен:", e);
    }
}

function stopMeter() {
    if (meterAnimId) { cancelAnimationFrame(meterAnimId); meterAnimId = null; }
    disableSelfMonitor();
    const ctx2d = micWaveformCanvas?.getContext("2d");
    if (ctx2d && micWaveformCanvas) ctx2d.clearRect(0, 0, micWaveformCanvas.width, micWaveformCanvas.height);
    _setQuality("idle");
    if (!micEnabled) micMeterSection?.classList.remove("visible");
    if (audioCtx) { try { audioCtx.close(); } catch (_) {} audioCtx = null; gainNode = null; analyserNode = null; }
}

/* ── Кнопка самопрослушивания: запись 5 секунд → воспроизведение ── */
if (selfMonitorBtn) selfMonitorBtn.onclick = () => {
    if (_smRecording) return;   /* игнорируем повторное нажатие во время записи */
    startSelfMonitorRecording(5);
};

/* ── Проверка динамика: звук колокольчиков ── */
function playSpeakerTest() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        /* Три тона колокольчика: C5, E5, G5 с экспоненциальным затуханием */
        const notes = [[523.25, 0.0], [659.25, 0.18], [783.99, 0.36]];
        notes.forEach(([freq, delay]) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            const now  = ctx.currentTime + delay;

            osc.type = "sine";
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.35, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

            osc.start(now);
            osc.stop(now + 1.5);

            /* Лёгкий призвук (обертон) для натуральности колокольчика */
            const osc2  = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.value = freq * 2.76;
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            gain2.gain.setValueAtTime(0, now);
            gain2.gain.linearRampToValueAtTime(0.09, now + 0.01);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc2.start(now);
            osc2.stop(now + 0.65);
        });
        /* Автозакрываем AudioContext после последнего тона */
        setTimeout(() => { try { ctx.close(); } catch (_) {} }, 2500);
    } catch (e) {
        console.warn("playSpeakerTest failed:", e);
    }
}

/* ── Перезапуск микрофона с новыми настройками шума ── */
async function restartMicWithNoise() {
    if (!localStream || !micEnabled) return;
    /* Останавливаем старые аудио-треки */
    localStream.getAudioTracks().forEach(t => { t.stop(); localStream.removeTrack(t); });
    stopMeter();
    try {
        const constraints = {
            audio: {
                noiseSuppression: noiseEnabled,
                echoCancellation: noiseEnabled,
                autoGainControl:  noiseEnabled,
            }
        };
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        newStream.getAudioTracks().forEach(t => {
            t.enabled = true;
            localStream.addTrack(t);
        });
        startMeter(localStream);
    } catch (e) {
        console.warn("restartMicWithNoise failed:", e);
    }
}

/* ── Слайдер громкости ── */
if (micGainSlider) micGainSlider.oninput = () => {
    const pct = micGainSlider.value;
    if (gainValueEl) gainValueEl.textContent = pct + "%";   /* #24 — null guard */
    if (gainNode) gainNode.gain.value = (parseInt(pct) || 0) / 100;  /* #25 — NaN guard */
};

/* ── Запрос потока ──
   withVideo=false: запрашиваем только микрофон (кнопка "Микрофон").
   withVideo=true:  запрашиваем камеру + микрофон (кнопка "Камера").
   Настройки шума берутся из текущего состояния noiseEnabled. */
async function ensureStream(withVideo = true) {
    if (!localStream) {
        const audioConstraints = {
            noiseSuppression: noiseEnabled,
            echoCancellation: noiseEnabled,
            autoGainControl:  noiseEnabled,
        };
        try {
            localStream = await navigator.mediaDevices.getUserMedia(
                withVideo
                    ? { video: true, audio: audioConstraints }
                    : { video: false, audio: audioConstraints }
            );
        } catch (e) {
            if (withVideo) {
                try {
                    localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: audioConstraints });
                } catch (e2) {
                    if (statusEl) statusEl.textContent = "⚠️ Браузер заблокировал доступ к камере и микрофону. Нажмите на значок 🔒 в адресной строке браузера, разрешите доступ и перезагрузите страницу.";
                    return false;
                }
            } else {
                if (statusEl) statusEl.textContent = "⚠️ Браузер заблокировал доступ к микрофону. Нажмите на значок 🔒 в адресной строке браузера, разрешите доступ и перезагрузите страницу.";
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
        /* #27 — null guard: вставляем перед previewOff если он есть, иначе append */
        if (previewOff) previewDiv.insertBefore(videoEl, previewOff);
        else            previewDiv.appendChild(videoEl);
    }
    /* Всегда обновляем srcObject — stream мог измениться (добавили видео-трек) */
    videoEl.srcObject = localStream;
    if (previewOff) previewOff.style.display = "none";
    videoEl.style.display = "";
}
function hideVideoPreview() {
    if (videoEl) videoEl.style.display = "none";
    if (previewOff) previewOff.style.display = "";
}

function updateStatus() {
    if (!statusEl) return;
    if (micEnabled && camEnabled) statusEl.textContent = "✅ Всё готово! Камера и микрофон работают. Можете входить в конференцию.";
    else if (micEnabled)          statusEl.textContent = "✅ Микрофон включён — вас слышат. Камера выключена.";
    else if (camEnabled)          statusEl.textContent = "✅ Камера включена — вас видят. Микрофон выключен.";
    else                          statusEl.textContent = "Проверьте камеру и микрофон перед входом. Когда будете готовы — нажмите кнопку ниже.";
}

/* ── Кнопка шумоподавления ── */
if (noiseBtn) noiseBtn.onclick = async () => {
    noiseEnabled = !noiseEnabled;
    updateNoiseBtn();
    await restartMicWithNoise();
};

/* ── Кнопка проверки динамика ── */
if (speakerTestBtn) speakerTestBtn.onclick = () => {
    playSpeakerTest();
    if (speakerTestHint) {
        speakerTestHint.textContent = "🔔 Вы слышите колокольчики?";
        speakerTestHint.style.color = "#a5b4fc";
        clearTimeout(speakerTestBtn._hintTimer);
        speakerTestBtn._hintTimer = setTimeout(() => {
            if (speakerTestHint) speakerTestHint.textContent = "";
        }, 3500);
    }
};

/* ── Кнопка микрофона ── */
if (micBtn) micBtn.onclick = async () => {   /* null guard */
    /* withVideo=false: не запрашиваем камеру при включении микрофона */
    const ok = await ensureStream(false);
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
    /* withVideo=true: для камеры нам нужен поток (создастся если нет) */
    const ok = await ensureStream(true);
    if (!ok) return;
    camEnabled = !camEnabled;

    if (!camEnabled) {
        /* #30 — Останавливаем треки целиком → аппаратный индикатор камеры гаснет.
           Просто t.enabled = false не гасит зелёный огонёк на macOS/Windows. */
        localStream.getVideoTracks().forEach(t => { t.stop(); localStream.removeTrack(t); });
        hideVideoPreview();
    } else {
        /* Камера снова включается.
           Если stream создавался audio-only (пользователь сначала включил mic),
           запрашиваем новый video-трек и добавляем в существующий поток. */
        const hasVideo = localStream.getVideoTracks().length > 0 &&
                         localStream.getVideoTracks()[0].readyState === "live";
        if (hasVideo) {
            localStream.getVideoTracks().forEach(t => t.enabled = true);
            showVideoPreview();
        } else {
            try {
                const vs = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                vs.getVideoTracks().forEach(t => { t.enabled = true; localStream.addTrack(t); });
                showVideoPreview();
            } catch (e) {
                camEnabled = false;
                if (statusEl) statusEl.textContent = "⚠️ Не удалось включить камеру: " + e.message;
            }
        }
    }

    updateCamBtn();
    updateStatus();
};

/* ── Войти в комнату ── */
if (joinBtn) joinBtn.onclick = () => {   /* null guard */
    if (joinBtn.disabled) return;
    joinBtn.disabled = true;

    disableSelfMonitor();
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (audioCtx) { try { audioCtx.close(); } catch (_) {} audioCtx = null; }
    const gain = micGainSlider?.value ?? 100;  /* #28 — null-safe value */
    window.location.href = `/room.html?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name.slice(0, 64))}&avatar=${encodeURIComponent(avatar)}&mic=${micEnabled ? 1 : 0}&cam=${camEnabled ? 1 : 0}&micGain=${gain}&noise=${noiseEnabled ? 1 : 0}`;
};

/* ── Инициализация ── */
updateMicBtn();
updateCamBtn();
updateNoiseBtn();
updateStatus();
