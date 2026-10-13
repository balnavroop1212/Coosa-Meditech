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
      this.activeSectionId = "home";

      this.init();
    }

    init() {
      if (!this.header || this.navLinks.length === 0 || this.sections.length === 0) return;
      this.syncHeaderHeight();
      this.bindClickHandlers();
      this.initScrollSpy();
      this.bindHistoryHandlers();
    }

    syncHeaderHeight() {
      const update = () => {
        const headerHeight = this.header.offsetHeight;
        document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);
        const hero = document.getElementById("home");
        if (hero) hero.style.paddingTop = `${headerHeight + 40}px`;
      };
      update();
      if ("ResizeObserver" in window) {
        this.headerObserver = new ResizeObserver(update);
        this.headerObserver.observe(this.header);
      } else {
        window.addEventListener("resize", update, { passive: true });
      }
    }

    bindClickHandlers() {
      const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
      anchorLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          const targetId = link.getAttribute("data-target") || link.getAttribute("href").slice(1);
          const targetSection = document.getElementById(targetId);
          if (!targetSection) return;

          event.preventDefault();
          this.isProgrammaticScroll = true;
          if (this.sections.some((section) => section.id === targetId)) this.setActiveTab(targetId);
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });

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
      const observerOptions = {
        root: null,
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0
      };

      let historyThrottleTimer = null;

      const observer = new IntersectionObserver((entries) => {
        if (this.isProgrammaticScroll) return;

        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const currentId = visibleSections[0]?.target.getAttribute("data-section");
        if (!currentId || currentId === this.activeSectionId) return;
        this.activeSectionId = currentId;
        this.setActiveTab(currentId);

        if (window.location.hash !== `#${currentId}`) {
          if (historyThrottleTimer) clearTimeout(historyThrottleTimer);
          historyThrottleTimer = setTimeout(() => {
            history.replaceState(null, "", `#${currentId}`);
          }, 320);
        }
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
        const hashTarget = window.location.hash.replace("#", "") || "home";
        const sectionEl = document.getElementById(hashTarget);
        if (sectionEl) {
          sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
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
            "Clinical evaluation: active"
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
            "Signal: Catalytic ROS",
            "Target: Cavity & Nodes",
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
            "Preservation: Non-Destructive",
            "Standard: FFPE Histology",
            "Correlation: Pathology Ready"
          ],
          hudVal: "PATHOLOGY CORRELATION: READY",
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
      this.dossierModal = document.getElementById("clinicalDossierModal");
      this.inspectBtns = Array.from(document.querySelectorAll(".btn-inspect"));
      this.lastActiveElement = null;
      this.handleKeyDown = this.handleKeyDown.bind(this);

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
                <span class="modal-data-label">Clinical status</span>
                <span class="modal-data-val">Active evaluation</span>
              </div>
              <div class="modal-data-point">
                <span class="modal-data-label">Core capability</span>
                <span class="modal-data-val">Impedance profiling</span>
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
              Regulatory clearance pathway: ISO 13485 quality-system alignment. Tissue architecture is preserved for standard pathology.
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
                <span class="modal-data-label">Cavity signal</span>
                <span class="modal-data-val">Catalytic ROS telemetry</span>
              </div>
              <div class="modal-data-point">
                <span class="modal-data-label">Operating mode</span>
                <span class="modal-data-val">Real-time interrogation</span>
              </div>
              <div class="modal-data-point">
                <span class="modal-data-label">Clinical target</span>
                <span class="modal-data-val">Cavity and axillary nodes</span>
              </div>
              <div class="modal-data-point">
                <span class="modal-data-label">Sampling Depth</span>
                <span class="modal-data-val">2.1 mm Calibrated</span>
              </div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
              Sampling cycle finishes in under 15 seconds. The sterile probe architecture supports tissue-preserving workflow integration and is protected by granted US patents.
            </p>
          `
        }
      };

      this.init();
    }

    init() {
      if (!this.modalBackdrop && !this.dossierModal) return;

      this.inspectBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const type = btn.getAttribute("data-modal");
          this.openModal(type, btn);
        });
      });

      if (this.modalCloseBtn) {
        this.modalCloseBtn.addEventListener("click", () => this.closeModal());
      }

      if (this.modalBackdrop) {
        this.modalBackdrop.addEventListener("click", (e) => {
          if (e.target === this.modalBackdrop) {
            this.closeModal();
          }
        });
      }

      if (this.dossierModal) {
        const dossierClose = this.dossierModal.querySelector(".modal-close-btn, [data-close]");
        if (dossierClose) {
          dossierClose.addEventListener("click", () => this.closeModal(this.dossierModal));
        }
        this.dossierModal.addEventListener("click", (e) => {
          if (e.target === this.dossierModal) {
            this.closeModal(this.dossierModal);
          }
        });
      }

      window.addEventListener("keydown", this.handleKeyDown);
    }

    getActiveModal() {
      if (this.modalBackdrop && this.modalBackdrop.classList.contains("open")) {
        return this.modalBackdrop;
      }
      if (this.dossierModal && this.dossierModal.classList.contains("open")) {
        return this.dossierModal;
      }
      return null;
    }

    handleKeyDown(e) {
      const activeModal = this.getActiveModal();
      if (!activeModal) return;

      if (e.key === "Escape") {
        e.preventDefault();
        this.closeModal(activeModal);
        return;
      }

      if (e.key === "Tab") {
        const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusables = Array.from(activeModal.querySelectorAll(focusableSelectors))
          .filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === activeModal) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    openModal(type, triggerElement) {
      this.lastActiveElement = triggerElement || document.activeElement;
      const data = this.specSheets[type];
      if (!data || !this.modalBackdrop) return;

      if (this.modalBadge) this.modalBadge.textContent = data.badge;
      if (this.modalTitle) this.modalTitle.textContent = data.title;
      if (this.modalBody) this.modalBody.innerHTML = data.content;

      this.modalBackdrop.classList.add("open");
      this.modalBackdrop.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      // Shift focus to the modal's primary close button
      if (this.modalCloseBtn) {
        setTimeout(() => {
          this.modalCloseBtn.focus();
        }, 50);
      }
    }

    closeModal(modalEl) {
      const target = modalEl || this.modalBackdrop;
      if (target) {
        target.classList.remove("open");
        target.setAttribute("aria-hidden", "true");
      }
      document.body.style.overflow = "";

      // Restore focus to cached trigger element
      if (this.lastActiveElement && typeof this.lastActiveElement.focus === "function") {
        this.lastActiveElement.focus();
        this.lastActiveElement = null;
      }
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
      const sanitize = (str) => String(str || "").replace(/[<>"'&]/g, "").trim().slice(0, 120);
      const formData = new FormData(this.form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = sanitize(value);
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
          const field = this.form.elements[key];
          if (!field) return;

          if (field instanceof RadioNodeList || (field.length && field[0]?.type === "radio")) {
            field.value = String(data[key] || "");
          } else if (field.type === "radio") {
            field.checked = (field.value === data[key]);
          } else {
            field.value = String(data[key] || "");
          }
        });
      } catch (e) {
        localStorage.removeItem(this.storageKey);
      }
    }

    async handleSubmit() {
      if (!this.validateStep(3)) return;

      const sanitize = (str) => String(str || "").replace(/[<>"'&]/g, "").trim().slice(0, 120);

      const formData = new FormData(this.form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = sanitize(value);
      });

      const timestamp = new Date().toISOString();
      const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      const dossierText = [
        "==================================================",
        "COOSA TECHNOLOGIES — INSTITUTIONAL CLINICAL DOSSIER",
        "Confidential Evaluation & Pre-Market Briefing Request",
        "==================================================",
        `CLINICAL SPECIALTY:       ${data.clinicalRole || "Not Specified"}`,
        `MEDICAL INSTITUTION:     ${data.institution || "Not Specified"}`,
        `ANNUAL PROCEDURE VOLUME: ${data.annualVolume || "Not Specified"}`,
        `LEAD CLINICIAN:          ${data.fullName || "Not Specified"}`,
        `INSTITUTIONAL EMAIL:     ${data.email || "Not Specified"}`,
        `SUBMISSION TIMESTAMP:    ${timestamp}`,
        `REGULATORY STATUS:       Investigational Device (ISO 13485 Track)`,
        `DISTRIBUTION PARTNER:    Aadvik Hospicare Institutional Desk`,
        "==================================================",
        "Requested Follow-Up: On-site operating-suite clinical demonstration",
        "and technical safety dossier package."
      ].join("\n");

      // Non-blocking asynchronous dispatch
      try {
        if (typeof fetch === "function") {
          fetch("/api/evaluation-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, timestamp, dossier: dossierText })
          }).catch(() => {
            // Graceful fallback for static prototypes / offline development
          });
        }
      } catch (e) {}

      // Clear draft storage
      try {
        localStorage.removeItem(this.storageKey);
      } catch (e) {}

      // Display Institutional Clinical Briefing Dossier
      this.form.style.display = "none";
      if (this.successBanner) {
        this.successBanner.style.display = "block";
        const dossierPre = document.getElementById("dossierContent");
        const dossierTime = document.getElementById("dossierTimestamp");
        const copyBtn = document.getElementById("btnCopyDossier");
        const copyLabel = document.getElementById("copyDossierLabel");
        const manualMail = document.getElementById("manualMailtoLink");

        if (dossierPre) dossierPre.textContent = dossierText;
        if (dossierTime) dossierTime.textContent = formattedDate;

        if (manualMail) {
          const subject = encodeURIComponent(
            `Clinical Demonstration Request: ${data.institution || "Medical Institution"}`
          );
          manualMail.href = `mailto:contact@coosa.in?subject=${subject}&body=${encodeURIComponent(dossierText)}`;
        }

        if (copyBtn && copyLabel) {
          copyBtn.onclick = async () => {
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(dossierText);
                copyLabel.textContent = "Copied to Clipboard ✓";
                copyBtn.classList.add("btn-copied");
                setTimeout(() => {
                  copyLabel.textContent = "Copy Dossier to Clipboard";
                  copyBtn.classList.remove("btn-copied");
                }, 3000);
              } else {
                const ta = document.createElement("textarea");
                ta.value = dossierText;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                copyLabel.textContent = "Copied to Clipboard ✓";
                setTimeout(() => {
                  copyLabel.textContent = "Copy Dossier to Clipboard";
                }, 3000);
              }
            } catch (err) {
              copyLabel.textContent = "Select & Copy Dossier";
            }
          };
        }

        this.successBanner.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }


  /* ==========================================================================
     HEADER COMPACTION ENGINE (Step 2) — Zero-Overhead IntersectionObserver
     Replaces continuous scroll listeners with a single sentinel observation.
     ========================================================================== */
  function initHeaderCompaction() {
    const header = document.getElementById("siteHeader");
    const sentinel = document.getElementById("headerScrollSentinel");
    const compliancePill = document.getElementById("navCompliancePillItem");

    if (!header || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isScrolled = !entry.isIntersecting;
        header.classList.toggle("is-scrolled", isScrolled);

        // Sync A11y: expose pill to screen readers only when visible
        if (compliancePill) {
          compliancePill.setAttribute("aria-hidden", String(!isScrolled));
        }

        // Sync scroll-padding-top so anchors land below compacted header
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerHeight}px`
        );
        document.documentElement.style.scrollPaddingTop = `${headerHeight}px`;
      },
      {
        root: null,
        // Fire as soon as the sentinel (at y=0) exits the viewport
        threshold: 0,
        rootMargin: "0px"
      }
    );

    observer.observe(sentinel);
  }

  /* ==========================================================================
     INITIALIZATION ON DOM READY
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    new ScrollMotionController();
    new NavigationController();
    new WorkflowStepper();
    new ModalController();
    new LeadCaptureController("clinicalLeadForm");
    initHeaderCompaction();
  });
})();