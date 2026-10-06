/**
 * ====================================================================
 * 📸 FACE KYC CONTROLLER (สแกนหน้ายืนยันตัวตนคนสวย & CHILDHOOD MORPH)
 * ====================================================================
 */

class FaceKYCController {
    constructor() {
        this.currentStepIndex = 0;
        this.stream = null;
        this.videoEl = null;
        this.mockImgEl = null;
        this.childhoodImgEl = null;
        this.stepPillEl = null;
        this.progressFillEl = null;
        this.stampEl = null;
        this.actionBtn = null;
        this.proceedBtn = null;
        this.hintTextEl = null;
        this.isCompleted = false;
    }

    init() {
        this.videoEl = document.getElementById('kyc-video-feed');
        this.mockImgEl = document.getElementById('kyc-mock-feed');
        this.childhoodImgEl = document.getElementById('kyc-childhood-img');
        this.stepPillEl = document.getElementById('kyc-step-pill');
        this.progressFillEl = document.getElementById('kyc-progress-fill');
        this.stampEl = document.getElementById('kyc-stamp-overlay');
        this.actionBtn = document.getElementById('kyc-action-btn');
        this.proceedBtn = document.getElementById('kyc-proceed-btn');
        this.hintTextEl = document.getElementById('kyc-hint-text');

        if (!this.stepPillEl) return;

        // เชื่อมปุ่มกดเพื่อทำท่าตามสเต็ป
        if (this.actionBtn) {
            this.actionBtn.addEventListener('click', () => {
                this.advanceStep();
            });
        }

        // เชื่อมปุ่มวาร์ปไปฉากต่อไป
        if (this.proceedBtn) {
            this.proceedBtn.addEventListener('click', () => {
                this.stopCamera();
                window.soundManager.playVictory();
                if (window.app) window.app.goToCeremonyScene('scene-warp');
                if (window.warpController) window.warpController.start();
            });
        }
    }

    start() {
        this.currentStepIndex = 0;
        this.isCompleted = false;
        if (this.stampEl) this.stampEl.classList.remove('active');
        if (this.childhoodImgEl) {
            this.childhoodImgEl.style.opacity = '0';
            this.childhoodImgEl.style.transform = 'scale(0.95)';
        }
        if (this.actionBtn) {
            this.actionBtn.style.display = 'inline-flex';
            this.actionBtn.textContent = '📸 บันทึกท่านี้ ✨';
        }
        if (this.proceedBtn) this.proceedBtn.style.display = 'none';

        this.updateStepUI();
        this.startCamera();
    }

    async startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.useMockCamera();
            return;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            if (this.videoEl) {
                this.videoEl.srcObject = this.stream;
                this.videoEl.style.display = 'block';
                if (this.mockImgEl) this.mockImgEl.style.display = 'none';
            }
        } catch (err) {
            console.log("Webcam not available or permission denied, fallback to mock camera:", err);
            this.useMockCamera();
        }
    }

    useMockCamera() {
        if (this.videoEl) this.videoEl.style.display = 'none';
        if (this.mockImgEl) {
            this.mockImgEl.style.display = 'block';
            const kycCfg = window.HBD_CONFIG.kyc || {};
            this.mockImgEl.src = kycCfg.currentPhoto || 'assets/images/polaroids/1.jpeg';
            this.mockImgEl.onerror = () => {
                this.mockImgEl.src = 'assets/images/polaroids/1.jpeg';
            };
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    updateStepUI() {
        const steps = (window.HBD_CONFIG.kyc && window.HBD_CONFIG.kyc.steps) || [];
        if (this.currentStepIndex < steps.length) {
            const step = steps[this.currentStepIndex];
            if (this.stepPillEl) {
                this.stepPillEl.innerHTML = `<span>${step.icon}</span> <span>ท่าที่ ${this.currentStepIndex + 1}/7: ${step.text}</span>`;
            }
            if (this.progressFillEl) {
                const percent = Math.round(((this.currentStepIndex + 1) / steps.length) * 100);
                this.progressFillEl.style.width = `${percent}%`;
            }
            if (this.hintTextEl) {
                this.hintTextEl.textContent = `คำสั่ง: ${step.actionName} แล้วกดปุ่มบันทึก หรือรอระบบตรวจจับอัตโนมัติ`;
            }
        }
    }

    advanceStep() {
        if (this.isCompleted) return;

        window.soundManager.playPop(500 + this.currentStepIndex * 70);
        const steps = (window.HBD_CONFIG.kyc && window.HBD_CONFIG.kyc.steps) || [];

        this.currentStepIndex++;

        if (this.currentStepIndex < steps.length) {
            this.updateStepUI();
        } else {
            this.onAllStepsCompleted();
        }
    }

    onAllStepsCompleted() {
        this.isCompleted = true;
        window.soundManager.playVictory();
        window.soundManager.playChime();

        if (this.actionBtn) this.actionBtn.style.display = 'none';
        if (this.stepPillEl) {
            this.stepPillEl.innerHTML = `<span>🎉</span> <span>สแกนหน้าครบทั้ง 7 ท่าเรียบร้อย!</span>`;
        }
        if (this.progressFillEl) this.progressFillEl.style.width = '100%';

        // ประทับตรา "สำเนาถูกต้อง"
        if (this.stampEl) {
            this.stampEl.classList.remove('fade-out');
            this.stampEl.classList.add('active');
        }

        if (window.confetti) {
            window.confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        }

        // ค้างตราประทับไว้แค่ 2 วินาทีพอดี แล้วค่อยๆ จางหายไป เพื่อไม่ให้บังรูปตอนเด็ก
        setTimeout(() => {
            if (this.stampEl) {
                this.stampEl.classList.add('fade-out');
                setTimeout(() => {
                    this.stampEl.classList.remove('active');
                    this.stampEl.classList.remove('fade-out');
                }, 600);
            }
            // Morphing สู่รูปตอนเด็กอย่างโปร่งใสชัดเจน
            this.performChildhoodMorph();
        }, 2000);
    }

    performChildhoodMorph() {
        window.soundManager.playChime();

        // Cross-fade สู่รูปตอนเด็ก
        if (this.childhoodImgEl) {
            const kycCfg = window.HBD_CONFIG.kyc || {};
            this.childhoodImgEl.src = kycCfg.childhoodPhoto || 'assets/images/kyc/childhood.jpg';
            this.childhoodImgEl.style.opacity = '1';
            this.childhoodImgEl.style.transform = 'scale(1)';
        }

        if (this.hintTextEl) {
            this.hintTextEl.innerHTML = `
                <div style="color:#d90429; font-weight:700; font-size:1.08rem; margin-top:8px;">
                    🌸 จากเด็กน้อยแก้มกลมในวันนั้น... สู่คนเก่งวัย 20 ในวันนี้ ✨
                </div>
                <div style="color:#666; font-size:0.88rem; margin-top:4px;">
                    (ยืนยันแล้ว: ความน่ารักคงเดิมไม่เคยเปลี่ยน 🤍)
                </div>
            `;
        }

        if (window.confetti) {
            window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } });
        }

        // ค้างรูปตอนเด็กไว้ 2.5 - 3 วินาที แล้วแสดงปุ่มวาร์ป
        setTimeout(() => {
            if (this.proceedBtn) {
                this.proceedBtn.style.display = 'inline-flex';
                this.proceedBtn.classList.add('pulse-anim');
            }
        }, 2500);
    }
}

window.faceKYC = new FaceKYCController();
