/* ══════════════════════════════════════════════════
   VisionCall — Camera Visual Effects
   Canvas pipeline: video → ctx.filter → captureStream
   Loaded after app.js. Requires: localStream, peerConns, replaceTrack
══════════════════════════════════════════════════ */

(function () {

  /* ── Effect definitions ── */
  const FX_LIST = [
    { id: "none",    label: "Выкл.",     icon: "🎥", filter: "none" },
    { id: "blur",    label: "Боке",      icon: "💫", filter: "blur(10px) brightness(1.05)" },
    { id: "noir",    label: "Нуар",      icon: "◑",  filter: "grayscale(1) contrast(1.15) brightness(0.95)" },
    { id: "warm",    label: "Тепло",     icon: "🌅", filter: "sepia(0.45) saturate(1.4) brightness(1.06)" },
    { id: "cool",    label: "Холод",     icon: "❄️", filter: "hue-rotate(195deg) saturate(1.25) brightness(1.02)" },
    { id: "vivid",   label: "Яркость",   icon: "✨", filter: "saturate(1.8) contrast(1.1)" },
  ];

  let currentFxId    = "none";
  let fxCanvas       = null;
  let fxCtx          = null;
  let fxAnimFrame    = null;
  let fxStream       = null;   /* canvas.captureStream output */
  let fxActive       = false;  /* true when canvas pipeline is running */

  /* ── Build the FX button + panel and inject into #controls ── */
  function buildUI() {
    /* Find the controls bar */
    const controls = document.querySelector(".controls");
    if (!controls) return;

    /* Wrapper div (button + floating panel anchored to it) */
    const wrap = document.createElement("div");
    wrap.id = "fxBtnWrap";

    /* FX toggle button */
    const btn = document.createElement("button");
    btn.id = "fxBtn";
    btn.setAttribute("aria-label", "Визуальные эффекты камеры");
    btn.setAttribute("aria-pressed", "false");
    btn.title = "Эффекты камеры";
    btn.innerHTML = fxIconSVG();
    wrap.appendChild(btn);

    /* Floating panel */
    const panel = document.createElement("div");
    panel.id = "fxPanel";
    panel.innerHTML = buildPanelHTML();
    wrap.appendChild(panel);

    /* Insert before leaveBtn */
    const leaveBtn = document.getElementById("leaveBtn");
    if (leaveBtn) {
      controls.insertBefore(wrap, leaveBtn);
    } else {
      controls.appendChild(wrap);
    }

    /* Wire up toggle */
    btn.addEventListener("click", () => togglePanel(panel, btn));

    /* Wire up effect options */
    panel.querySelectorAll(".fx-option").forEach(opt => {
      opt.addEventListener("click", () => {
        applyFx(opt.dataset.fx, panel);
      });
    });

    /* Close panel when clicking outside */
    document.addEventListener("click", e => {
      if (!wrap.contains(e.target)) closePanel(panel, btn);
    });
  }

  function buildPanelHTML() {
    const title = `<div class="fx-panel-title">Эффект камеры</div>`;
    const opts = FX_LIST.map(fx => `
      <div class="fx-option${fx.id === "none" ? " active" : ""}" data-fx="${fx.id}" role="button" tabindex="0" aria-label="${fx.label}">
        <div class="fx-option-icon">${fx.icon}</div>
        <div class="fx-option-label">${fx.label}</div>
      </div>
    `).join("");
    return `${title}<div class="fx-options">${opts}</div>`;
  }

  function togglePanel(panel, btn) {
    const isOpen = panel.classList.contains("open");
    if (isOpen) {
      closePanel(panel, btn);
    } else {
      panel.classList.add("open");
      btn.classList.add("btn-screen-active");
    }
  }

  function closePanel(panel, btn) {
    panel.classList.remove("open");
    /* Keep accent color if an effect is active */
    if (currentFxId === "none") btn.classList.remove("btn-screen-active");
  }

  /* ── Apply a chosen effect ── */
  function applyFx(fxId, panel) {
    const fx = FX_LIST.find(f => f.id === fxId);
    if (!fx) return;

    /* Update active state in panel */
    panel.querySelectorAll(".fx-option").forEach(opt => {
      opt.classList.toggle("active", opt.dataset.fx === fxId);
    });

    currentFxId = fxId;

    const btn = document.getElementById("fxBtn");
    if (fxId === "none") {
      stopFxPipeline();
      if (btn) { btn.classList.remove("btn-screen-active"); btn.setAttribute("aria-pressed","false"); }
    } else {
      startFxPipeline(fx.filter);
      if (btn) { btn.classList.add("btn-screen-active"); btn.setAttribute("aria-pressed","true"); }
    }

    /* Show toast */
    if (typeof showToast === "function") {
      showToast(fxId === "none" ? "Эффект убран" : `Эффект: ${fx.label}`, "info", 2000);
    }
  }

  /* ── Canvas pipeline: start ── */
  function startFxPipeline(filter) {
    /* We need a live video track in localStream */
    const videoTrack = getLocalVideoTrack();
    if (!videoTrack) {
      if (typeof showToast === "function")
        showToast("Включите камеру для применения эффекта", "error", 2500);
      currentFxId = "none";
      const panel = document.getElementById("fxPanel");
      if (panel) panel.querySelectorAll(".fx-option").forEach(o => o.classList.toggle("active", o.dataset.fx === "none"));
      return;
    }

    /* Stop old pipeline first */
    stopFxPipeline(false /* don't replace track yet */);

    /* Create / reuse hidden canvas */
    if (!fxCanvas) {
      fxCanvas = document.createElement("canvas");
      fxCanvas.style.display = "none";
      document.body.appendChild(fxCanvas);
    }

    /* Create hidden video element to read frames from */
    const vidEl = document.createElement("video");
    vidEl.srcObject = new MediaStream([videoTrack]);
    vidEl.muted = true;
    vidEl.playsInline = true;
    vidEl.style.display = "none";
    document.body.appendChild(vidEl);
    fxCanvas._srcVideo = vidEl;  /* keep ref for cleanup */

    vidEl.play().then(() => {
      fxCanvas.width  = videoTrack.getSettings().width  || 640;
      fxCanvas.height = videoTrack.getSettings().height || 480;
      fxCtx = fxCanvas.getContext("2d");

      /* Capture canvas as stream (25fps) */
      fxStream = fxCanvas.captureStream(25);
      fxActive = true;

      /* Start render loop */
      const render = () => {
        if (!fxActive) return;
        fxCtx.filter = filter;
        fxCtx.drawImage(vidEl, 0, 0, fxCanvas.width, fxCanvas.height);
        fxAnimFrame = requestAnimationFrame(render);
      };
      render();

      /* Replace video track in peer connections */
      replaceVideoTrack(fxStream.getVideoTracks()[0]);
    }).catch(err => {
      console.warn("fx-effects: video play failed", err);
    });
  }

  /* ── Canvas pipeline: stop ── */
  function stopFxPipeline(doReplace = true) {
    fxActive = false;
    if (fxAnimFrame) { cancelAnimationFrame(fxAnimFrame); fxAnimFrame = null; }

    /* Remove hidden video element */
    if (fxCanvas?._srcVideo) {
      fxCanvas._srcVideo.srcObject = null;
      fxCanvas._srcVideo.remove();
      fxCanvas._srcVideo = null;
    }

    /* Stop canvas stream tracks */
    if (fxStream) {
      fxStream.getTracks().forEach(t => t.stop());
      fxStream = null;
    }

    /* Restore original track in peer connections */
    if (doReplace) {
      const originalTrack = getLocalVideoTrack();
      if (originalTrack) replaceVideoTrack(originalTrack);
    }
  }

  /* ── Helpers ── */
  function getLocalVideoTrack() {
    /* localStream is the global from app.js */
    if (typeof localStream === "undefined" || !localStream) return null;
    const tracks = localStream.getVideoTracks();
    return tracks.length ? tracks[0] : null;
  }

  function replaceVideoTrack(newTrack) {
    if (!newTrack) return;
    /* peerConnections is the global object {socketId: RTCPeerConnection} from app.js */
    if (typeof peerConnections === "undefined") return;
    Object.values(peerConnections).forEach(pc => {
      pc.getSenders().forEach(sender => {
        if (sender.track && sender.track.kind === "video") {
          sender.replaceTrack(newTrack).catch(err =>
            console.warn("fx-effects: replaceTrack failed", err)
          );
        }
      });
    });
  }

  /* ── SVG icon ── */
  function fxIconSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>`;
  }

  /* ── Re-apply effect when camera track changes (mic/cam toggle events) ── */
  function handleTrackChange() {
    if (currentFxId !== "none" && fxActive) {
      const fx = FX_LIST.find(f => f.id === currentFxId);
      if (fx) {
        /* Small delay to let app.js finish track replacement */
        setTimeout(() => startFxPipeline(fx.filter), 200);
      }
    }
  }

  /* ── Init on DOM ready ── */
  function init() {
    buildUI();

    /* Listen for custom events that app.js fires when camera restarts */
    document.addEventListener("vc:camera-restart", handleTrackChange);
    document.addEventListener("vc:camera-changed", handleTrackChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ── Expose globally (so app.js can notify us about track changes) ── */
  window.vcFx = {
    handleTrackChange,
    stop: stopFxPipeline,
    isActive: () => fxActive,
  };

})();
