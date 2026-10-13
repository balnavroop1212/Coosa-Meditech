/**
 * COOSA MEDITECH - CINEMATIC SCROLL PHYSICS
 * Pure vanilla ES6 scroll tracking for the R&D narrative stage.
 */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("technology") || document.getElementById("research-development");
    const progressFill = document.getElementById("storyProgressFill");
    const chapters = Array.from(document.querySelectorAll(".story-chapter"));
    const hud = {
      panel: document.getElementById("storyHud"),
      beacon: document.getElementById("hudBeacon"),
      phaseFlag: document.getElementById("hudPhaseFlag"),
      depthVal: document.getElementById("hudDepthVal"),
      depthGauge: document.getElementById("hudDepthGauge"),
      dynamicLabel: document.getElementById("hudDynamicLabel"),
      dynamicVal: document.getElementById("hudDynamicVal"),
      dynamicUnit: document.getElementById("hudDynamicUnit"),
      dynamicDelta: document.getElementById("hudDynamicDelta"),
      statusBadge: document.getElementById("hudStatusBadge"),
      statusText: document.getElementById("hudStatusText"),
      footnote: document.getElementById("hudFootnote")
    };

    if (!track || chapters.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isSectionVisible = false;
    let rafPending = false;
    let activeChapterIndex = -1;
    let resizeTimeout = null;
    window.isStorySectionVisible = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isSectionVisible = entry.isIntersecting;
          window.isStorySectionVisible = isSectionVisible;
          if (isSectionVisible) {
            if (typeof window.startStoryOscilloscope === "function") {
              window.startStoryOscilloscope();
            }
            scheduleUpdate();
          } else {
            if (typeof window.stopStoryOscilloscope === "function") {
              window.stopStoryOscilloscope();
            }
          }
        });
      },
      { rootMargin: "120px 0px 120px 0px" }
    );

    observer.observe(track);

    function calculateProgress() {
      const rect = track.getBoundingClientRect();
      const totalScrollableDistance = rect.height - window.innerHeight;
      if (totalScrollableDistance <= 0) return 0;
      return Math.max(0, Math.min(1, -rect.top / totalScrollableDistance));
    }

    function updateChapters(progress) {
      const newIndex = Math.min(Math.floor(progress * chapters.length), chapters.length - 1);

      if (newIndex !== activeChapterIndex) {
        activeChapterIndex = newIndex;
        chapters.forEach((chapter, index) => {
          chapter.classList.toggle("active", index === activeChapterIndex);
        });

        // Assistive Screen Reader Landmark Broadcast
        const a11yLive = document.getElementById("scrollyA11yLive");
        if (a11yLive) {
          const chapterAnnouncements = [
            "Phase 01: Cavity Margins & Zero-Compression Interrogation Active",
            "Phase 02: Micro ROS Catalytic Oxidation Active",
            "Phase 03: Nano-Catalytic Redox Waveform & Rapid Telemetry Active",
            "Phase 04: Gold-Standard Histologic Concordance Target Active"
          ];
          a11yLive.textContent = chapterAnnouncements[newIndex] || `Phase 0${newIndex + 1} Active`;
        }
      }

      if (progressFill) {
        progressFill.style.height = `${(progress * 100).toFixed(1)}%`;
      }

      if (typeof window.renderStoryVisuals === "function") {
        window.renderStoryVisuals(progress);
      }
    }

    function updateTelemetryHud(progress) {
      if (!hud.panel) return;

      let depth;
      if (progress < 0.25) {
        depth = (progress / 0.25) * 2.1;
      } else if (progress < 0.75) {
        depth = 2.1;
      } else {
        depth = 2.1 * (1 - (progress - 0.75) / 0.25);
      }

      const clampedDepth = Math.max(0, Math.min(2.1, depth));
      hud.depthVal.textContent = clampedDepth.toFixed(2);
      hud.depthGauge.style.width = `${(clampedDepth / 2.1) * 100}%`;

      if (progress < 0.25) {
        const local = progress / 0.25;
        hud.phaseFlag.textContent = "PHASE 01 · CONTACT";
        hud.dynamicLabel.textContent = "SURFACE IMPEDANCE";
        hud.dynamicVal.textContent = (42.8 - local * 1.6).toFixed(1);
        hud.dynamicUnit.textContent = "kΩ";
        hud.dynamicDelta.textContent = `Δ -${(local * 3.7).toFixed(1)}% · CONTACT FORMING`;
        setHudState("status-contact", "SURFACE ALIGNED", "CALIBRATED 2.1mm COLLAR", "#00f2fe");
      } else if (progress < 0.5) {
        const local = (progress - 0.25) / 0.25;
        hud.phaseFlag.textContent = "PHASE 02 · MICRO-ROS";
        hud.dynamicLabel.textContent = "EXTRACELLULAR ROS";
        hud.dynamicVal.textContent = (0.4 + local * 8.3).toFixed(1);
        hud.dynamicUnit.textContent = "µM";
        hud.dynamicDelta.textContent = "FAO METABOLIC SURGE";
        setHudState("status-metabolic", "RADICAL SHED DETECTED", "H₂O₂ PERITUMORAL GRADIENT", "#ffaa00");
      } else if (progress < 0.75) {
        const local = (progress - 0.5) / 0.25;
        hud.phaseFlag.textContent = "PHASE 03 · MWCNT REDOX";
        hud.dynamicLabel.textContent = "CATALYTIC NANO-CURRENT";
        hud.dynamicVal.textContent = (118.2 + Math.sin(local * Math.PI * 4) * 14.5 + local * 18).toFixed(1);
        hud.dynamicUnit.textContent = "nA";
        hud.dynamicDelta.textContent = "TELEMETRY RESPONSE < 15s";
        setHudState("status-redox", "CATALYSIS ACTIVE", "MWCNT ARRAY CONVERSION", "#00f2fe");
      } else {
        const local = (progress - 0.75) / 0.25;
        hud.phaseFlag.textContent = "PHASE 04 · VERIFIED";
        hud.dynamicLabel.textContent = "IN-VITRO CONCORDANCE";
        hud.dynamicVal.textContent = (94.2 + local * 3.4).toFixed(1);
        hud.dynamicUnit.textContent = "%";
        hud.dynamicDelta.textContent = "TARGET: NON-DESTRUCTIVE EVALUATION";
        setHudState("status-clear", "MARGIN EVALUATED", "CELLULAR CONCORDANCE TARGET", "#00ffaa");
      }
    }

    function setHudState(statusClass, statusText, footnote, beaconColor) {
      hud.statusBadge.className = `hud-status-badge ${statusClass}`;
      hud.statusText.textContent = statusText;
      hud.footnote.textContent = footnote;
      hud.beacon.style.background = beaconColor;
      hud.beacon.style.boxShadow = `0 0 8px ${beaconColor}`;
    }

    function update() {
      rafPending = false;
      if (!isSectionVisible && !prefersReducedMotion) return;
      const progress = calculateProgress();
      updateChapters(progress);
      updateTelemetryHud(progress);
    }

    function scheduleUpdate() {
      if (rafPending) return;
      rafPending = true;
      if (prefersReducedMotion) {
        update();
        return;
      }
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(scheduleUpdate, 66);
    }, { passive: true });
    scheduleUpdate();
  });
})();
