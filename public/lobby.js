/* ═══════════════════════════════════════
   LOBBY — camera/mic preview before joining
═══════════════════════════════════════ */

const params = new URLSearchParams(window.location.search);
const room   = params.get("room");
const name   = params.get("name");
const avatar = params.get("avatar") || "😀";

/* Redirect to home if no name or room */
if (!room || !name || name === "null") {
    window.location.replace("/");
    throw new Error("redirect");
}

/* ── DOM refs ── */
const lobbyNameEl    = document.getElementById("lobbyName");
const lobbyAvatarEl  = document.getElementById("lobbyAvatar");
const previewAvatarEl = document.getElementById("previewAvatar");
const previewDiv     = document.getElementById("lobbyPreview");
const previewOff     = document.getElementById("previewOff");
const micBtn         = document.getElementById("lobbyMicBtn");
const camBtn         = document.getElementById("lobbyCamBtn");
const statusEl       = document.getElementById("lobbyStatus");
const joinBtn        = document.getElementById("lobbyJoinBtn");

lobbyNameEl.textContent  = name;
lobbyAvatarEl.textContent = avatar;
previewAvatarEl.textContent = avatar;

/* ── SVG icons ── */
const SVG = {
    micOn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`,
    micOff: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
    camOn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
    camOff: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06A4 4 0 1 1 7.72 7.72"/></svg>`,
};

/* ── State ── */
let micEnabled = false;
let camEnabled = false;
let localStream = null;
let videoEl = null;

/* ── Update button visuals ── */
function updateMicBtn() {
    micBtn.innerHTML = micEnabled ? SVG.micOn : SVG.micOff;
    micBtn.className = "lobby-ctrl-btn " + (micEnabled ? "active" : "inactive");
    micBtn.title = micEnabled ? "Mute microphone" : "Unmute microphone";
}
function updateCamBtn() {
    camBtn.innerHTML = camEnabled ? SVG.camOn : SVG.camOff;
    camBtn.className = "lobby-ctrl-btn " + (camEnabled ? "active" : "inactive");
    camBtn.title = camEnabled ? "Turn off camera" : "Turn on camera";
}

/* ── Stream management ── */
async function ensureStream() {
    if (!localStream) {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
        } catch (e) {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: false,
                    audio: true
                });
            } catch (e2) {
                statusEl.textContent = "Could not access camera/microphone.";
                return false;
            }
        }
        /* Start with both tracks disabled */
        localStream.getTracks().forEach(t => t.enabled = false);
    }
    return true;
}

function showVideoPreview() {
    if (!videoEl) {
        videoEl = document.createElement("video");
        videoEl.autoplay = true;
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.srcObject = localStream;
        previewDiv.insertBefore(videoEl, previewOff);
    }
    previewOff.style.display = "none";
    videoEl.style.display = "";
}

function hideVideoPreview() {
    if (videoEl) videoEl.style.display = "none";
    previewOff.style.display = "";
}

function updateStatus() {
    if (micEnabled && camEnabled) {
        statusEl.textContent = "Camera and microphone are ready.";
    } else if (micEnabled) {
        statusEl.textContent = "Microphone is on. Camera is off.";
    } else if (camEnabled) {
        statusEl.textContent = "Camera is on. Microphone is muted.";
    } else {
        statusEl.textContent = "Camera and microphone are off. You can enable them now.";
    }
}

/* ── Mic toggle ── */
micBtn.onclick = async () => {
    const ok = await ensureStream();
    if (!ok) return;
    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(t => t.enabled = micEnabled);
    updateMicBtn();
    updateStatus();
};

/* ── Cam toggle ── */
camBtn.onclick = async () => {
    const ok = await ensureStream();
    if (!ok) return;
    camEnabled = !camEnabled;
    localStream.getVideoTracks().forEach(t => t.enabled = camEnabled);
    if (camEnabled) {
        showVideoPreview();
    } else {
        hideVideoPreview();
    }
    updateCamBtn();
    updateStatus();
};

/* ── Join button ── */
joinBtn.onclick = () => {
    /* Stop lobby stream tracks — room.js will request them fresh */
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    window.location = `/room.html?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}&mic=${micEnabled ? 1 : 0}&cam=${camEnabled ? 1 : 0}`;
};

/* ── Init ── */
updateMicBtn();
updateCamBtn();
updateStatus();
