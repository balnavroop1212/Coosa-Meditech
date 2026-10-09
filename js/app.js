/**
 * COOSA TECHNOLOGIES — APPLICATION LOGIC & INTERACTION CONTROLLER
 * Pure Vanilla JavaScript (ES6+) — Zero Frameworks / Zero Dependencies
 */

(function () {
  "use strict";

  /* ==========================================================================
     1. ZERO-FLICKER NAVIGATION CONTROLLER
     ========================================================================== */
  class NavigationController {
    constructor() {
      this.header = document.getElementById("siteHeader");
      this.navLinks = Array.from(document.querySelectorAll(".nav-link"));
      this.sections = Array.from(document.querySelectorAll("section[data-section]"));
      this.isProgrammaticScroll = false;
      this.scrollTimeout = null;
      this.activeSectionId = "hero";

      this.init();
    }

    init() {
      if (!this.header || this.navLinks.length === 0 || this.sections.length === 0) return;
      this.bindClickHandlers();
      this.initScrollSpy();
      this.bindHistoryHandlers();
    }

    bindClickHandlers() {
      this.navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          const targetId = link.getAttribute("data-target");
          const targetSection = document.getElementById(targetId);
          if (!targetSection) return;

          this.isProgrammaticScroll = true;
          this.setActiveTab(targetId);

          const headerHeight = this.header.offsetHeight || 72;
          const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
          });

          if (window.location.hash !== `#${targetId}`) {
            history.pushState(null, "", `#${targetId}`);
          }

          clearTimeout(this.scrollTimeout);
          this.scrollTimeout = setTimeout(() => {
            this.isProgrammaticScroll = false;
          }, 800);
        });
      });
    }

    initScrollSpy() {
      const headerHeight = this.header.offsetHeight || 72;
      const observerOptions = {
        root: null,
        rootMargin: `-${headerHeight}px 0px -50% 0px`,
        threshold: 0
      };

      const observer = new IntersectionObserver((entries) => {
        if (this.isProgrammaticScroll) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute("data-section");
            if (currentId && currentId !== this.activeSectionId) {
              this.activeSectionId = currentId;
              this.setActiveTab(currentId);

              if (window.location.hash !== `#${currentId}`) {
                history.replaceState(null, "", `#${currentId}`);
              }
            }
          }
        });
      }, observerOptions);

      this.sections.forEach((section) => observer.observe(section));
    }

    setActiveTab(targetId) {
      this.navLinks.forEach((link) => {
        const matches = link.getAttribute("data-target") === targetId;
        link.classList.toggle("active", matches);
        if (matches) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    bindHistoryHandlers() {
      window.addEventListener("popstate", () => {
        const hashTarget = window.location.hash.replace("#", "") || "hero";
        const sectionEl = document.getElementById(hashTarget);
        if (sectionEl) {
          const headerHeight = this.header.offsetHeight || 72;
          const targetPos = sectionEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPos,
            behavior: "smooth"
          });
          this.setActiveTab(hashTarget);
        }
      });
    }
  }

  class ScrollMotionController {
    constructor() {
      document.documentElement.classList.add("page-ready");
      this.revealTargets = Array.from(document.querySelectorAll(
        ".section-header, .about-story-grid, .about-platforms, .about-trust-panel, " +
        ".about-leadership, .partner-strap, .achievement-highlight, .achievement-pillars, " +
        ".achievement-ribbon, .rnd-value-grid, .products-grid, .workflow-stepper-nav, " +
        ".workflow-stage-display, .news-grid, .pipeline-grid, " +
        ".contact-layout, .site-footer"
      ));
      this.revealElements = [];
      this.init();
    }

    init() {
      if (this.revealTargets.length === 0 || !("IntersectionObserver" in window)) return;

      this.revealTargets.forEach((element) => {
        element.classList.add("scroll-reveal");
        this.revealElements.push(element);
        if (element.children.length > 1) {
          element.classList.add("scroll-reveal-group");
          Array.from(element.children).forEach((child) => {
            child.classList.add("scroll-reveal");
            this.revealElements.push(child);
          });
        }
      });

      const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      }, {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.08
      });

      this.revealElements.forEach((element) => observer.observe(element));
    }
  }

  /* ==========================================================================
     2. CLINICAL WORKFLOW STEPPER CONTROLLER
     ========================================================================== */
  class WorkflowStepper {
    constructor() {
      this.stepBtns = Array.from(document.querySelectorAll(".step-nav-btn"));
      this.stageTag = document.getElementById("workflowStageTag");
      this.stageHeading = document.getElementById("workflowStageHeading");
      this.stageText = document.getElementById("workflowStageText");
      this.stagePills = document.getElementById("workflowStagePills");
      this.hudValue = document.getElementById("workflowHudValue");
      this.hudSub = document.getElementById("workflowHudSub");
      this.stageDisplay = document.getElementById("workflowStageDisplay");

      this.workflowData = {
        1: {
          tag: "STAGE 01 • PRE-OPERATIVE RADIOLOGY",
          heading: "Ultrasound-Guided Tissue Stratification (BDS)",
          text: "Under direct ultrasound guidance, the BIRADx fine-needle probe is advanced into ambiguous BI-RADS 3 or BI-RADS 4 fibroglandular breast lesions. Real-time bio-impedance profiling stratifies lesions prior to surgical intervention, preventing unnecessary core needle biopsies in low-risk patients.",
          pills: [
            "Modality: BDS Probe",
            "Imaging: Ultrasound Tracking",
            "Accuracy: 90.0% (n=138)"
          ],
          hudVal: "IMPEDANCE: 42.8 kΩ",
          hudSub: "BI-RADS 3 CONCORDANCE VERIFIED"
        },
        2: {
          tag: "STAGE 02 • ONCOPLASTIC SURGERY",
          heading: "Targeted Lumpectomy Tumor Excision",
          text: "The surgical team carries out lumpectomy resection following standard oncologic protocols. The excised specimen and surgical margins remain untouched by destructive dyes or cryo-freezing, ensuring pristine structural integrity.",
          pills: [
            "Procedure: Lumpectomy",
            "Technique: Oncoplastic Resection",
            "Specimen Status: Untouched"
          ],
          hudVal: "CAVITY EXPOSURE: READY",
          hudSub: "PREPARING BCD IN-VIVO PROBE"
        },
        3: {
          tag: "STAGE 03 • INTRAOPERATIVE INTERROGATION",
          heading: "Real-Time Cavity Margin & Lymph Node Scan (BCD)",
          text: "The surgeon directly sweeps the Breast Cancer Detector (BCD) probe along internal cavity surfaces and axillary lymph nodes. The catalytic micro-sensor array detects metabolic ROS excretion within 15 seconds, identifying positive margins before wound closure.",
          pills: [
            "Sensitivity: 97.0%",
            "Selectivity: 94.0%",
            "Latency: < 15 Seconds"
          ],
          hudVal: "ROS RELEASE: 0.14 µM (CLEAR)",
          hudSub: "SURGICAL MARGIN NEGATIVE (PASS)"
        },
        4: {
          tag: "STAGE 04 • PATHOLOGY CORRELATION",
          heading: "Definitive Formalin-Fixed Paraffin-Embedded (FFPE) Pathology",
          text: "Because Coosa's bio-electronic sensing causes zero tissue damage, the entire excised tumor specimen is preserved intact for gold-standard FFPE histology, eliminating frozen-section artifacts.",
          pills: [
            "Preservation: 100% Non-Destructive",
            "Standard: FFPE Histology",
            "Re-Excision Drop: ~30%"
          ],
          hudVal: "PATHOLOGY CORRELATION: 100%",
          hudSub: "MARGIN CONCURRENCE ESTABLISHED"
        }
      };

      this.init();
    }

    init() {
      if (this.stepBtns.length === 0) return;

      this.stepBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const step = btn.getAttribute("data-step");
          this.setStep(step);
        });
      });
    }

    setStep(stepNum) {
      const data = this.workflowData[stepNum];
      if (!data) return;

      this.stepBtns.forEach((b) => {
        const isActive = b.getAttribute("data-step") === String(stepNum);
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (this.stageDisplay) {
        this.stageDisplay.setAttribute("data-step", String(stepNum));
      }

      if (this.stageTag) this.stageTag.textContent = data.tag;
      if (this.stageHeading) this.stageHeading.textContent = data.heading;
      if (this.stageText) this.stageText.textContent = data.text;
      if (this.hudValue) this.hudValue.textContent = data.hudVal;
      if (this.hudSub) this.hudSub.textContent = data.hudSub;

      if (this.stagePills) {
        this.stagePills.innerHTML = data.pills
          .map((pill, idx) => `<span class="meta-pill ${idx === 2 ? "highlight" : ""}">${pill}</span>`)
          .join("");
      }
    }
  }

  /* ==========================================================================
     3. CLINICAL TECHNICAL SPECIFICATIONS MODAL CONTROLLER
     ========================================================================== */
  class ModalController {
    constructor() {
      this.modalBackdrop = document.getElementById("clinicalModal");
      this.modalCloseBtn = document.getElementById("modalCloseBtn");
      this.modalBadge = document.getElementById("modalBadge");
      this.modalTitle = document.getElementById("modalTitle");
      this.modalBody = document.getElementById("modalBody");
      this.inspectBtns = Array.from(document.querySelectorAll(".btn-inspect"));

      this.specSheets = {
        bds: {
          badge: "PRE-OPERATIVE STRATIFICATION ARCHITECTURE",
          title: "BIRADx System (BDS) Engineering Data Sheet",
          content: `
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
              The BIRADx platform differentiates suspicious BI-RADS 3 and 4 lesions by measuring high-frequency bio-electronic impedance variations across breast tissue microstructures.
            </p>
            <div class="modal-grid">
              <div class="modal-data-point">
                <span class="modal-data-label">Clinical Accuracy</span>
                <span class="modal-data-val">90.0% (n=138 Masses)</span>
              </div>
              <div class="modal-data-point">
                <span class="modal-data-label">Sensitivity in Dense Tissue</span>
                <span class="modal-data-val">95.0%</span>
              </div>
              <div class="modal-data-point">
                <span class="modal-data-label">Guidance Frequency</span>
                <span class="modal-data-val">12 - 18 MHz Ultrasound</span>
              </div>
              <div class="modal-data-point">
                <span class="modal-data-label">Sensor Penetration Depth</span>
                <span class="modal-data-val">Adjustable Needle Guide</span>
              </div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
              Regulatory clearance pathway: ISO 13485 compliant. Tissue preservation rate: 100% non-destructive.
            </p>
          `
        },
        bcd: {
          badge: "INTRAOPERATIVE SURGICAL METABOLIC PROBE",
          title: "Breast Cancer Detector (BCD) Catalytic Array Schematics",
          content: `
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
              The BCD probe quantifies real-time metabolic Reactive Oxygen Species (ROS) and hydrogen peroxide (H₂O₂) excretion along cavity borders during lumpectomy.
            </p>
            <div class="modal-grid">
              <div class="modal-data-point">
                <span class="modal-data-label">Cavity Margin Sensitivity</span>
                <span class="modal-data-val">97.0%</span>
              </div>
              <div class="modal-data-point">
                <span class="modal-data-label">Cavity Margin Selectivity</span>
                <span class="modal-data-val">94.0%</span>
              </div>
              <div class="modal-data-point">
                <span class="modal-data-label">Axillary Nodal Sensitivity</span>
                <span class="modal-data-val">91.0%</span>
              </div>
              <div class="modal-data-point">
                <span class="modal-data-label">Sampling Depth</span>
                <span class="modal-data-val">2.1 mm Calibrated</span>
              </div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
              Reduces positive post-surgical cavity margins by ~30%. Sampling cycle finishes in under 15 seconds. Protected by granted US Patents.
            </p>
          `
        }
      };

      this.init();
    }

    init() {
      if (!this.modalBackdrop) return;

      this.inspectBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const type = btn.getAttribute("data-modal");
          this.openModal(type);
        });
      });

      if (this.modalCloseBtn) {
        this.modalCloseBtn.addEventListener("click", () => this.closeModal());
      }

      this.modalBackdrop.addEventListener("click", (e) => {
        if (e.target === this.modalBackdrop) {
          this.closeModal();
        }
      });

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.modalBackdrop.classList.contains("open")) {
          this.closeModal();
        }
      });
    }

    openModal(type) {
      const data = this.specSheets[type];
      if (!data) return;

      if (this.modalBadge) this.modalBadge.textContent = data.badge;
      if (this.modalTitle) this.modalTitle.textContent = data.title;
      if (this.modalBody) this.modalBody.innerHTML = data.content;

      this.modalBackdrop.classList.add("open");
      this.modalBackdrop.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    closeModal() {
      this.modalBackdrop.classList.remove("open");
      this.modalBackdrop.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  /* ==========================================================================
     4. CLINICAL LEAD CAPTURE & DEMO SCHEDULER CONTROLLER
     ========================================================================== */
  class LeadCaptureController {
    constructor(formId) {
      this.form = document.getElementById(formId);
      if (!this.form) return;

      this.storageKey = "coosa_lead_draft";
      this.currentStep = 1;
      this.successBanner = document.getElementById("formSuccessMessage");
      this.progressLine = document.querySelector(".progress-line span");

      this.init();
    }

    init() {
      this.bindEvents();
      this.hydrateFromStorage();
    }

    bindEvents() {
      // Next Step Buttons
      const nextButtons = this.form.querySelectorAll(".next-step");
      nextButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const nextStepNum = parseInt(btn.getAttribute("data-next"), 10);
          if (this.validateStep(this.currentStep)) {
            this.goToStep(nextStepNum);
            this.saveToStorage();
          }
        });
      });

      // Previous Step Buttons
      const prevButtons = this.form.querySelectorAll(".prev-step");
      prevButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const prevStepNum = parseInt(btn.getAttribute("data-prev"), 10);
          this.goToStep(prevStepNum);
        });
      });

      // Real-time input persistence and error clearing
      this.form.addEventListener("input", (e) => {
        if (e.target.classList.contains("input-error")) {
          e.target.classList.remove("input-error");
          const errorSpan = e.target.parentElement.querySelector(".input-error-msg");
          if (errorSpan) errorSpan.classList.remove("visible");
        }
        this.saveToStorage();
      });

      // Final Submission Handler
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    /**
     * Validate current step requirements before moving forward
     */
    validateStep(stepNumber) {
      let isValid = true;

      if (stepNumber === 2) {
        const instInput = document.getElementById("institutionName");
        const instError = document.getElementById("instError");
        if (!instInput.value.trim()) {
          instInput.classList.add("input-error");
          if (instError) instError.classList.add("visible");
          isValid = false;
        }
      }

      if (stepNumber === 3) {
        const nameInput = document.getElementById("fullName");
        const nameError = document.getElementById("nameError");
        if (!nameInput.value.trim()) {
          nameInput.classList.add("input-error");
          if (nameError) nameError.classList.add("visible");
          isValid = false;
        }

        const emailInput = document.getElementById("workEmail");
        const emailError = document.getElementById("emailError");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
          emailInput.classList.add("input-error");
          if (emailError) emailError.classList.add("visible");
          isValid = false;
        }
      }

      return isValid;
    }

    goToStep(stepNumber) {
      this.currentStep = stepNumber;

      // Switch Step Panes
      const panes = this.form.querySelectorAll(".form-step-pane");
      panes.forEach((pane) => {
        pane.classList.remove("active");
      });
      const activePane = document.getElementById(`step${stepNumber}`);
      if (activePane) activePane.classList.add("active");

      // Update Step Progress Indicators
      const progressSteps = document.querySelectorAll(".progress-step");
      progressSteps.forEach((marker) => {
        const markerStep = parseInt(marker.getAttribute("data-step"), 10);
        marker.classList.toggle("active", markerStep === stepNumber);
        marker.classList.toggle("completed", markerStep < stepNumber);
      });

      if (this.progressLine) {
        this.progressLine.style.width = `${((stepNumber - 1) / 2) * 100}%`;
      }
    }

    saveToStorage() {
      const formData = new FormData(this.form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (e) {
        // Safe failover for private browsing modes
      }
    }

    hydrateFromStorage() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) return;
        const data = JSON.parse(stored);

        Object.keys(data).forEach((key) => {
          const field = this.form.querySelector(`[name="${key}"]`);
          if (!field) return;

          if (field.type === "radio") {
            const radioOption = this.form.querySelector(`[name="${key}"][value="${data[key]}"]`);
            if (radioOption) radioOption.checked = true;
          } else {
            field.value = data[key];
          }
        });
      } catch (e) {
        localStorage.removeItem(this.storageKey);
      }
    }

    handleSubmit() {
      if (!this.validateStep(3)) return;

      const formData = new FormData(this.form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Format institutional clinical payload
      const subject = encodeURIComponent(
        `Clinical Demonstration Request: ${data.institution || "Medical Institution"}`
      );
      const bodyContent = `
COOSA TECHNOLOGIES CLINICAL DEMONSTRATION REQUEST
--------------------------------------------------
Clinical Specialization: ${data.clinicalRole || "Not Specified"}
Medical Institution:     ${data.institution || "Not Specified"}
Annual Lumpectomy Volume:${data.annualVolume || "Not Specified"}
Lead Clinician:          ${data.fullName || "Not Specified"}
Institutional Email:     ${data.email || "Not Specified"}
Submission Timestamp:    ${new Date().toISOString()}

Distribution Routing: Aadvik Hospicare Institutional Desk
--------------------------------------------------
`.trim();

      const mailtoLink = `mailto:contact@coosa.in?subject=${subject}&body=${encodeURIComponent(bodyContent)}`;

      // Clear cached draft
      try {
        localStorage.removeItem(this.storageKey);
      } catch (e) {}

      // Open email client
      window.location.href = mailtoLink;

      // Show success confirmation
      this.form.style.display = "none";
      if (this.successBanner) {
        this.successBanner.style.display = "block";
      }
    }
  }

  class RndScrollyCanvas {
    constructor() {
      this.section = document.getElementById("bio-energetics-scrolly");
      this.canvas = document.getElementById("scrolly-canvas");
      if (!this.section || !this.canvas) return;
      this.ctx = this.canvas.getContext("2d");
      this.steps = Array.from(this.section.querySelectorAll(".story-step"));
      this.progressBar = this.section.querySelector(".scrolly-progress span");
      this.backgroundImage = new Image();
      this.backgroundImage.src = "assets/frames/BG_frame.webp";
      this.images = ["assets/frames/frame1.webp", "assets/frames/frame2.webp", "assets/frames/frame3.webp"].map((src) => {
        const image = new Image();
        image.src = src;
        return image;
      });
      this.progress = 0;
      this.targetProgress = 0;
      this.resize();
      this.bindEvents();
      this.backgroundImage.addEventListener("load", () => this.draw());
      this.images.forEach((image) => image.addEventListener("load", () => this.draw()));
      this.draw();
    }

    bindEvents() {
      window.addEventListener("scroll", () => {
        if (!this.scrollFrame) {
          this.scrollFrame = requestAnimationFrame(() => {
            this.updateProgress();
            this.draw();
            this.scrollFrame = null;
          });
        }
      }, { passive: true });
      window.addEventListener("resize", () => {
        this.resize();
        this.draw();
      });
      this.updateProgress();
      this.animate();
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = this.canvas.clientWidth || window.innerWidth;
      this.height = this.canvas.clientHeight || window.innerHeight;
      this.canvas.width = Math.floor(this.width * dpr);
      this.canvas.height = Math.floor(this.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    updateProgress() {
      const trackStart = this.section.offsetTop;
      const trackDistance = Math.max(this.section.offsetHeight - window.innerHeight, 1);
      this.targetProgress = Math.min(Math.max((window.scrollY - trackStart) / trackDistance, 0), 1);
    }

    updateStory() {
      const activeIndex = Math.min(Math.floor(this.progress * this.steps.length), this.steps.length - 1);
      this.steps.forEach((step, index) => step.classList.toggle("active", index === activeIndex));
      if (this.progressBar) this.progressBar.style.height = `${this.progress * 100}%`;
    }

    drawImageToCover(image, scale, driftX, alpha) {
      if (!image || !image.complete || !image.naturalWidth) return;
      const imageRatio = image.naturalWidth / image.naturalHeight;
      const screenRatio = this.width / this.height;
      let drawWidth;
      let drawHeight;

      if (screenRatio > imageRatio) {
        drawWidth = this.width * scale;
        drawHeight = (this.width / imageRatio) * scale;
      } else {
        drawWidth = (this.height * imageRatio) * scale;
        drawHeight = this.height * scale;
      }

      this.ctx.globalAlpha = alpha;
      this.ctx.drawImage(
        image,
        (this.width - drawWidth) / 2 + driftX,
        (this.height - drawHeight) / 2,
        drawWidth,
        drawHeight
      );
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      const segment = this.progress < 0.5 ? this.progress / 0.5 : (this.progress - 0.5) / 0.5;
      const firstIndex = this.progress < 0.5 ? 0 : 1;
      const secondIndex = firstIndex + 1;
      const drift = Math.sin(this.progress * Math.PI) * 15;
      this.drawImageToCover(this.backgroundImage, 1.02 + this.progress * 0.02, -drift * 0.35, 1);
      this.drawImageToCover(this.images[firstIndex], 1 + this.progress * 0.05, drift, 1 - segment);
      this.drawImageToCover(this.images[secondIndex], 1.05 - (1 - this.progress) * 0.05, -drift, segment);
      ctx.globalAlpha = 1;
    }

    animate() {
      this.progress += (this.targetProgress - this.progress) * 0.085;
      if (Math.abs(this.targetProgress - this.progress) < 0.0005) {
        this.progress = this.targetProgress;
      }
      this.updateStory();
      this.draw();
      requestAnimationFrame(() => this.animate());
    }
  }

  /* ==========================================================================
     INITIALIZATION ON DOM READY
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    new ScrollMotionController();
    new NavigationController();
    new RndScrollyCanvas();
    new WorkflowStepper();
    new ModalController();
    new LeadCaptureController("clinicalLeadForm");
  });
})();