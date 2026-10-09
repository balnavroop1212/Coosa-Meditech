/**
 * COOSA TECHNOLOGIES — HARDWARE MOTION GRAPHICS ENGINE
 * Direct Hardware Asset 3D Projection & 60 FPS Orbit Renderer
 */

(function () {
  "use strict";

  class HardwareVisualizer {
    constructor(canvasId, sliderId, imgId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext("2d");
      this.slider = document.getElementById(sliderId);
      this.hardwareImg = document.getElementById(imgId);
      this.statusDisplay = document.getElementById("scrubberAngleDisplay");
      this.hotspotSensor = document.getElementById("hotspotSensor");
      this.hotspotTip = document.getElementById("hotspotTip");

      this.rotationDeg = 0;
      this.targetDeg = 0;
      this.isDragging = false;
      this.isInteracting = false;
      this.lastMouseX = 0;
      this.idleTimer = null;
      this.animFrameId = null;

      this.init();
    }

    init() {
      this.handleHiDPI();
      this.bindEvents();
      this.startRenderLoop();
    }

    handleHiDPI() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = this.canvas.getBoundingClientRect();
      const displayWidth = rect.width || 960;
      const displayHeight = rect.height || 540;

      this.canvas.width = Math.floor(displayWidth * dpr);
      this.canvas.height = Math.floor(displayHeight * dpr);

      this.ctx.resetTransform?.();
      this.ctx.scale(dpr, dpr);
      this.width = displayWidth;
      this.height = displayHeight;
    }

    bindEvents() {
      this.canvas.addEventListener("mousedown", (event) => {
        this.isDragging = true;
        this.isInteracting = true;
        this.lastMouseX = event.clientX;
      });

      window.addEventListener("mousemove", (event) => {
        if (!this.isDragging) return;
        const deltaX = event.clientX - this.lastMouseX;
        this.lastMouseX = event.clientX;
        this.targetDeg += deltaX * 0.75;
        this.syncSlider();
      });

      window.addEventListener("mouseup", () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.resetIdleTimer();
        }
      });

      this.canvas.addEventListener("touchstart", (event) => {
        if (event.touches.length === 1) {
          this.isDragging = true;
          this.isInteracting = true;
          this.lastMouseX = event.touches[0].clientX;
        }
      }, { passive: true });

      window.addEventListener("touchmove", (event) => {
        if (!this.isDragging || event.touches.length !== 1) return;
        const deltaX = event.touches[0].clientX - this.lastMouseX;
        this.lastMouseX = event.touches[0].clientX;
        this.targetDeg += deltaX * 0.75;
        this.syncSlider();
      }, { passive: true });

      window.addEventListener("touchend", () => {
        this.isDragging = false;
        this.resetIdleTimer();
      });

      if (this.slider) {
        this.slider.addEventListener("input", (event) => {
          this.isInteracting = true;
          const frameIndex = parseInt(event.target.value, 10);
          this.targetDeg = (frameIndex / 48) * 360;
          this.resetIdleTimer();
        });
      }

      window.addEventListener("resize", () => this.handleHiDPI());
    }

    resetIdleTimer() {
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        this.isInteracting = false;
      }, 3000);
    }

    syncSlider() {
      if (!this.slider) return;
      const normalized = ((Math.round(this.targetDeg) % 360) + 360) % 360;
      const frameVal = Math.round((normalized / 360) * 48) % 48;
      this.slider.value = frameVal;
    }

    startRenderLoop() {
      const render = () => {
        if (!this.isInteracting) {
          this.targetDeg += 0.25;
          this.syncSlider();
        }

        this.rotationDeg += (this.targetDeg - this.rotationDeg) * 0.1;
        const normalizedAngle = ((Math.round(this.rotationDeg) % 360) + 360) % 360;

        if (this.hardwareImg) {
          const rad = (normalizedAngle * Math.PI) / 180;
          const skewY = Math.sin(rad) * 4;
          const translateY = Math.sin(rad * 2) * 8;
          this.hardwareImg.style.transform =
            `perspective(1000px) rotateY(${normalizedAngle}deg) translateY(${translateY}px) skewY(${skewY}deg)`;
        }

        this.drawOpticalRings(normalizedAngle);

        if (this.statusDisplay) {
          this.statusDisplay.textContent =
            `ANGLE: ${normalizedAngle}° (${this.getOrientationLabel(normalizedAngle)})`;
        }

        this.updateHotspots(normalizedAngle);
        this.animFrameId = requestAnimationFrame(render);
      };

      this.animFrameId = requestAnimationFrame(render);
    }

    getOrientationLabel(angle) {
      if (angle >= 315 || angle < 45) return "LATERAL VIEW";
      if (angle >= 45 && angle < 135) return "PROBE TIP FOCUS";
      if (angle >= 135 && angle < 225) return "POSTERIOR VIEW";
      return "CATALYTIC ARRAY FOCUS";
    }

    drawOpticalRings(angleDeg) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      const rad = (angleDeg * Math.PI) / 180;
      const centerX = this.width / 2;
      const centerY = this.height * 0.8;

      // Draw Orbit Rings using Bright Teal Blue (#0077b6) and Turquoise Surf (#00b4d8)
      [140, 220, 300].forEach((radius, idx) => {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius, radius * 0.28, 0, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 ? "rgba(0, 119, 182, 0.65)" : "rgba(0, 180, 216, 0.45)";
        ctx.lineWidth = idx === 1 ? 2.5 : 1.5;
        ctx.stroke();
      });

      // Orbital Tracking Node with glowing turquoise aura
      const orbitX = centerX + Math.cos(rad) * 220;
      const orbitY = centerY + Math.sin(rad) * (220 * 0.28);

      ctx.beginPath();
      ctx.arc(orbitX, orbitY, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#0077b6"; // Bright Teal Blue
      ctx.shadowColor = "#00b4d8"; // Turquoise Surf
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    updateHotspots(angleDeg) {
      const rad = (angleDeg * Math.PI) / 180;
      const cosA = Math.cos(rad);
      const opacityVal = cosA > -0.2 ? "1" : "0.2";

      if (this.hotspotSensor) {
        this.hotspotSensor.style.opacity = opacityVal;
        this.hotspotSensor.style.left = `${70 + cosA * 8}%`;
      }

      if (this.hotspotTip) {
        this.hotspotTip.style.opacity = opacityVal;
        this.hotspotTip.style.left = `${30 - cosA * 6}%`;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    new HardwareVisualizer("hardwareCanvas", "hardwareScrubberSlider", "interactiveHardwareImg");
  });
})();
