/**
 * COOSA MEDITECH - CANVAS CAMERA DIVE & SURGICAL OSCILLOSCOPE ENGINE
 * 60 FPS High-DPI Camera Dive, Zero-Allocation Typed Array Particle Pipeline,
 * Pre-Rendered Offscreen Glow Sprite Cache, and Real-Time Bio-Impedance Sparkline.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("story-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Chronological Narrative Image Sequencing (Phase 01 -> Phase 02 -> Phase 03)
  const assetPaths = [
    "assets/frames/frame1.webp",
    "assets/frames/frame2.webp",
    "assets/frames/frame3.webp"
  ];

  let lastProgress = 0;
  const images = assetPaths.map((src) => {
    const image = new Image();
    image.src = src;
    image.addEventListener("load", () => renderFrame(lastProgress));
    return image;
  });

  // 2. Pre-Rendered 64x64 Offscreen Sprite Cache (Eliminates CPU/GPU shadowBlur Choke)
  const cyanSprite = document.createElement("canvas");
  cyanSprite.width = 64;
  cyanSprite.height = 64;
  const cCtx = cyanSprite.getContext("2d");
  const cyanGrad = cCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  cyanGrad.addColorStop(0, "rgba(0, 242, 254, 1)");
  cyanGrad.addColorStop(0.28, "rgba(0, 242, 254, 0.55)");
  cyanGrad.addColorStop(0.65, "rgba(0, 180, 216, 0.18)");
  cyanGrad.addColorStop(1, "rgba(0, 242, 254, 0)");
  cCtx.fillStyle = cyanGrad;
  cCtx.fillRect(0, 0, 64, 64);

  const amberSprite = document.createElement("canvas");
  amberSprite.width = 64;
  amberSprite.height = 64;
  const aCtx = amberSprite.getContext("2d");
  const amberGrad = aCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  amberGrad.addColorStop(0, "rgba(255, 170, 0, 1)");
  amberGrad.addColorStop(0.28, "rgba(255, 170, 0, 0.55)");
  amberGrad.addColorStop(0.65, "rgba(217, 119, 6, 0.18)");
  amberGrad.addColorStop(1, "rgba(255, 170, 0, 0)");
  aCtx.fillStyle = amberGrad;
  aCtx.fillRect(0, 0, 64, 64);

  // 3. Pre-Allocated Typed Arrays (Zero Garbage-Collection Thrashing in Render Loop)
  const PARTICLE_COUNT = 45;
  const pX = new Float32Array(PARTICLE_COUNT);
  const pY = new Float32Array(PARTICLE_COUNT);
  const pZ = new Float32Array(PARTICLE_COUNT);
  const pSize = new Float32Array(PARTICLE_COUNT);
  const pHue = new Uint8Array(PARTICLE_COUNT); // 0 = cyan, 1 = amber

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pX[i] = Math.random() * 2 - 1;
    pY[i] = Math.random() * 2 - 1;
    pZ[i] = Math.random();
    pSize[i] = 1.8 + Math.random() * 3.6;
    pHue[i] = Math.random() > 0.45 ? 1 : 0;
  }

  // 4. Surgical Telemetry Bio-Impedance Sparkline Oscilloscope Engine
  const scopeCanvas = document.getElementById("hudOscilloscopeCanvas");
  let scopeCtx = null;
  const SCOPE_SAMPLES = 48;
  const scopeBuffer = new Float32Array(SCOPE_SAMPLES);
  let scopeStep = 0;
  let scopeAnimId = null;

  if (scopeCanvas) {
    scopeCtx = scopeCanvas.getContext("2d");
    for (let i = 0; i < SCOPE_SAMPLES; i++) {
      scopeBuffer[i] = 21.0;
    }
  }

  function updateOscilloscope(progress) {
    if (!scopeCtx || !scopeCanvas) return;
    const w = scopeCanvas.width;
    const h = scopeCanvas.height;
    const midY = h * 0.5;

    // Shift samples
    for (let i = 0; i < SCOPE_SAMPLES - 1; i++) {
      scopeBuffer[i] = scopeBuffer[i + 1];
    }

    scopeStep++;
    let signal = 0;
    const noise = (Math.random() - 0.5) * 2.8;

    if (progress < 0.25) {
      // Phase 01: Macro Surface Contact (steady high impedance baseline)
      signal = Math.sin(scopeStep * 0.22) * 3.5 + noise;
    } else if (progress < 0.5) {
      // Phase 02: Micro ROS Excretion (active metabolic transients)
      const burst = Math.random() > 0.65 ? (Math.random() * 11.0 - 5.5) : 0;
      signal = Math.sin(scopeStep * 0.38) * 7.5 + burst + noise;
    } else if (progress < 0.75) {
      // Phase 03: Nano MWCNT Redox Catalysis (high frequency nano-current oscillations)
      signal = Math.sin(scopeStep * 0.65) * 11.5 + Math.cos(scopeStep * 1.3) * 4.5 + noise;
    } else {
      // Phase 04: Return / Margin Concordance (stabilized clean flatline trace)
      signal = Math.sin(scopeStep * 0.14) * 2.2 + (noise * 0.4);
    }

    scopeBuffer[SCOPE_SAMPLES - 1] = Math.max(3, Math.min(h - 3, midY - signal));

    // Draw Oscilloscope Frame
    scopeCtx.clearRect(0, 0, w, h);

    // Subtle Grid Baseline & Subdivision Lines
    scopeCtx.strokeStyle = "rgba(0, 242, 254, 0.12)";
    scopeCtx.lineWidth = 1;
    scopeCtx.beginPath();
    scopeCtx.moveTo(0, midY);
    scopeCtx.lineTo(w, midY);
    scopeCtx.moveTo(w * 0.33, 0);
    scopeCtx.lineTo(w * 0.33, h);
    scopeCtx.moveTo(w * 0.66, 0);
    scopeCtx.lineTo(w * 0.66, h);
    scopeCtx.stroke();

    // Bio-impedance Oscilloscope Sparkline Trace
    const isAmberPhase = progress > 0.22 && progress < 0.55;
    const traceColor = isAmberPhase ? "#ffaa00" : "#00f2fe";

    scopeCtx.strokeStyle = traceColor;
    scopeCtx.lineWidth = 1.75;
    scopeCtx.lineJoin = "round";
    scopeCtx.beginPath();

    for (let i = 0; i < SCOPE_SAMPLES; i++) {
      const x = (i / (SCOPE_SAMPLES - 1)) * w;
      const y = scopeBuffer[i];
      if (i === 0) scopeCtx.moveTo(x, y);
      else scopeCtx.lineTo(x, y);
    }
    scopeCtx.stroke();

    // Real-Time Sweep Head Node
    const headY = scopeBuffer[SCOPE_SAMPLES - 1];
    scopeCtx.fillStyle = traceColor;
    scopeCtx.beginPath();
    scopeCtx.arc(w - 3, headY, 2.5, 0, Math.PI * 2);
    scopeCtx.fill();
  }

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (scopeCanvas) {
      const scopeRect = scopeCanvas.getBoundingClientRect();
      const sW = scopeRect.width || 280;
      const sH = scopeRect.height || 42;
      scopeCanvas.width = Math.floor(sW * dpr);
      scopeCanvas.height = Math.floor(sH * dpr);
      if (scopeCtx) {
        scopeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    renderFrame(lastProgress);
  }

  function drawCoverImage(image, scale, panY, alpha) {
    if (!image.complete || !image.naturalWidth) return;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const viewportRatio = width / height;
    const renderWidth = viewportRatio > imageRatio ? width * scale : height * imageRatio * scale;
    const renderHeight = viewportRatio > imageRatio ? (width / imageRatio) * scale : height * scale;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.drawImage(
      image,
      (width - renderWidth) * 0.5,
      (height - renderHeight) * 0.5 + panY,
      renderWidth,
      renderHeight
    );
    ctx.restore();
  }

  function renderParticles(progress) {
    const halfW = width * 0.5;
    const halfH = height * 0.5;
    const isAmberPhase = progress > 0.22 && progress < 0.55;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const currentZ = (pZ[i] + progress * 2.0) % 1.0;
      const perspective = 1.0 / (1.25 - currentZ);
      const x = halfW + pX[i] * halfW * 0.85 * perspective;
      const y = halfH + pY[i] * halfH * 0.85 * perspective;

      if (x < -32 || x > width + 32 || y < -32 || y > height + 32) continue;

      const size = pSize[i] * perspective * 2.3;
      const alpha = Math.sin(currentZ * Math.PI) * (0.35 + 0.45 * perspective);
      const sprite = (isAmberPhase && pHue[i] === 1) ? amberSprite : cyanSprite;

      ctx.globalAlpha = Math.min(1.0, Math.max(0.0, alpha));
      ctx.drawImage(sprite, x - size * 0.5, y - size * 0.5, size, size);
    }
    ctx.globalAlpha = 1.0;
  }

  function renderFrame(progress) {
    if (window.isStorySectionVisible === false) return;
    lastProgress = Math.max(0, Math.min(1, progress));

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#060b13";
    ctx.fillRect(0, 0, width, height);

    const transitionCount = images.length - 1;
    const scaledProgress = lastProgress * transitionCount;
    const baseIndex = Math.min(Math.floor(scaledProgress), transitionCount - 1);
    const localProgress = scaledProgress - baseIndex;
    const smoothFactor = 0.5 - 0.5 * Math.cos(localProgress * Math.PI);
    const drift = Math.sin(lastProgress * Math.PI) * 22;

    drawCoverImage(images[baseIndex], 1.0 + localProgress * 0.28, -drift, 1.0 - smoothFactor);
    drawCoverImage(images[baseIndex + 1], 1.04 + localProgress * 0.24, drift, smoothFactor);

    renderParticles(lastProgress);
    updateOscilloscope(lastProgress);
  }

  // Dormant RAF Lifecycle for Surgical Oscilloscope (0% Off-Screen CPU Drain)
  let isOscilloscopeActive = false;

  function runOscilloscopeLoop() {
    if (!isOscilloscopeActive || window.isStorySectionVisible === false) {
      isOscilloscopeActive = false;
      scopeAnimId = null;
      return;
    }
    updateOscilloscope(lastProgress);
    scopeAnimId = requestAnimationFrame(runOscilloscopeLoop);
  }

  function startOscilloscope() {
    if (isOscilloscopeActive) return;
    isOscilloscopeActive = true;
    runOscilloscopeLoop();
  }

  function stopOscilloscope() {
    isOscilloscopeActive = false;
    if (scopeAnimId !== null) {
      cancelAnimationFrame(scopeAnimId);
      scopeAnimId = null;
    }
  }

  window.startStoryOscilloscope = startOscilloscope;
  window.stopStoryOscilloscope = stopOscilloscope;

  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();
  window.renderStoryVisuals = renderFrame;
})();
