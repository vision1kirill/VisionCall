const socket = io();

const params = new URLSearchParams(window.location.search);

const room = params.get("room");
const name = params.get("name");
const avatar = params.get("avatar");

document.getElementById("roomTitle").innerText = room;

const videoGrid = document.getElementById("videoGrid");
const participantsDiv = document.getElementById("participants");

const micBtn = document.getElementById("micBtn");
const camBtn = document.getElementById("camBtn");
const screenBtn = document.getElementById("screenBtn");
const leaveBtn = document.getElementById("leaveBtn");

let localStream = null;
let screenStream = null;
let peerConnections = {};

// BUG FIX: mic and cam start disabled — state now matches the UI icons
let micEnabled = false;
let camEnabled = false;
let screenEnabled = false;

const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
    ]
};

/* ── PARTICIPANTS LIST ── */

function addParticipant(id, username) {
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
    const box = document.createElement("div");
    box.className = "video-box";
    box.id = "box-" + id;

    const avatarDiv = document.createElement("div");
    avatarDiv.className = "avatar";
    avatarDiv.innerText = userAvatar;
    box.appendChild(avatarDiv);

    // BUG FIX: name label is now preserved separately and not destroyed with innerHTML=""
    const label = document.createElement("div");
    label.className = "name-label";
    label.id = "label-" + id;
    label.innerHTML = `${username} <span class="icon mic">🔇</span><span class="icon cam">🚫</span>`;
    box.appendChild(label);

    videoGrid.appendChild(box);
}

// BUG FIX: Adds video element without destroying the name-label
function showVideoInBox(id, stream, muted) {
    const box = document.getElementById("box-" + id);
    if (!box) return;

    // Remove existing video
    const existingVideo = box.querySelector("video");
    if (existingVideo) existingVideo.remove();

    // Remove avatar (keep label)
    const existingAvatar = box.querySelector(".avatar");
    if (existingAvatar) existingAvatar.remove();

    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = muted;
    video.srcObject = stream;

    // Insert before the label so label stays on top
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
}

/* ── LOCAL BOX ── */

createVideoBox("local", name, avatar);
addParticipant("local", name);

/* ── CAMERA / MIC ACCESS ── */

async function startCamera() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // BUG FIX: Mute tracks to match current UI state (both start disabled)
        localStream.getAudioTracks().forEach(t => t.enabled = micEnabled);
        localStream.getVideoTracks().forEach(t => t.enabled = camEnabled);

        // Add tracks to any peer connections that already exist
        Object.values(peerConnections).forEach(pc => {
            localStream.getTracks().forEach(track => {
                const alreadyAdded = pc.getSenders().find(s => s.track && s.track.kind === track.kind);
                if (!alreadyAdded) pc.addTrack(track, localStream);
            });
        });

    } catch (e) {
        alert("Не удалось получить доступ к камере/микрофону: " + e.message);
    }
}

/* ── PEER CONNECTION ── */

function createPeer(id) {
    const pc = new RTCPeerConnection(servers);

    pc.ontrack = e => {
        if (!document.getElementById("box-" + id)) {
            createVideoBox(id, "Участник", "🙂");
        }
        showVideoInBox(id, e.streams[0], false);
    };

    pc.onicecandidate = e => {
        if (e.candidate) {
            socket.emit("ice-candidate", { candidate: e.candidate, to: id });
        }
    };

    pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "disconnected" || state === "failed" || state === "closed") {
            removeVideoBox(id);
        }
    };

    peerConnections[id] = pc;
    return pc;
}

/* ── SOCKET EVENTS ── */

socket.emit("join-room", { room, name, avatar });

socket.on("user-connected", async data => {
    addParticipant(data.id, data.name);
    createVideoBox(data.id, data.name, data.avatar || "🙂");

    const pc = createPeer(data.id);

    if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { offer, to: data.id });
});

socket.on("offer", async data => {
    // BUG FIX: data.from is now correctly set by server
    const pc = createPeer(data.from);

    // BUG FIX: Add local tracks before creating answer (was missing)
    if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    await pc.setRemoteDescription(data.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", { answer, to: data.from });
});

socket.on("answer", async data => {
    // BUG FIX: data.from is now correctly set by server
    const pc = peerConnections[data.from];
    if (pc) {
        await pc.setRemoteDescription(data.answer);
    }
});

socket.on("ice-candidate", async data => {
    // BUG FIX: data.from is now correctly set by server
    const pc = peerConnections[data.from];
    if (pc) {
        try {
            await pc.addIceCandidate(data.candidate);
        } catch (e) {
            console.error("ICE candidate error:", e);
        }
    }
});

// BUG FIX: Missing handler — disconnected user's box was never removed
socket.on("user-disconnected", data => {
    removeVideoBox(data.id);
});

/* ── ICON HELPERS ── */

// Updates the mic/cam icons inside the name-label of any participant box
function updateLabelIcons(id, micOn, camOn) {
    const label = document.getElementById("label-" + id);
    if (!label) return;
    const micIcon = label.querySelector(".mic");
    const camIcon = label.querySelector(".cam");
    if (micIcon) micIcon.innerText = micOn ? "🎤" : "🔇";
    if (camIcon) camIcon.innerText = camOn ? "📷" : "🚫";
}

// Broadcasts our current mic/cam state to everyone in the room
function emitMediaState() {
    socket.emit("media-state", { mic: micEnabled, cam: camEnabled });
}

// Receive state updates from remote participants
socket.on("media-state", data => {
    updateLabelIcons(data.from, data.mic, data.cam);
});

/* ── MIC BUTTON ── */

micBtn.onclick = async () => {
    if (!localStream) await startCamera();
    if (!localStream) return;

    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(t => t.enabled = micEnabled);
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
    localStream.getVideoTracks().forEach(t => t.enabled = camEnabled);
    camBtn.innerText = camEnabled ? "📷" : "🚫";
    camBtn.style.background = camEnabled ? "#22c55e" : "";
    updateLabelIcons("local", micEnabled, camEnabled);
    emitMediaState();

    if (camEnabled) {
        showVideoInBox("local", localStream, true);
    } else {
        showAvatarInBox("local", avatar);
    }
};

/* ── SCREEN SHARE BUTTON ── */

screenBtn.onclick = async () => {

    // Toggle off
    if (screenEnabled) {
        if (screenStream) {
            screenStream.getTracks().forEach(t => t.stop());
            screenStream = null;
        }
        screenEnabled = false;
        screenBtn.style.background = "";

        // Restore camera or avatar in local box
        if (camEnabled && localStream) {
            showVideoInBox("local", localStream, true);
        } else {
            showAvatarInBox("local", avatar);
        }

        // BUG FIX: Restore camera track in peer connections
        if (localStream) {
            const camTrack = localStream.getVideoTracks()[0];
            if (camTrack) {
                Object.values(peerConnections).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track && s.track.kind === "video");
                    if (sender) sender.replaceTrack(camTrack);
                });
            }
        }
        return;
    }

    // Toggle on
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenEnabled = true;
        screenBtn.style.background = "#22c55e";

        const screenTrack = screenStream.getVideoTracks()[0];

        // BUG FIX: Replace video track in peer connections (was never done before)
        Object.values(peerConnections).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === "video");
            if (sender) {
                sender.replaceTrack(screenTrack);
            } else {
                pc.addTrack(screenTrack, screenStream);
            }
        });

        showVideoInBox("local", screenStream, true);

        // Handle user stopping screen share via browser UI
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
