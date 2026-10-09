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
                if (window.app) {
                    window.app.goToCeremonyScene('scene-warp', true, '🌌 ข้ามผ่านมิติเวลา...', 'สู่จุดศูนย์กลางแห่งความรัก 🤍', () => {
                        if (window.warpController) window.warpController.start();
                    });
                } else {
                    if (window.warpController) window.warpController.start();
                }
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
        // 🔉 หรี่เสียงเพลงลงแผ่วๆ ขณะสแกนหน้า ให้ได้ยินเสียงชัตเตอร์ชัดเจน
        if (window.musicController) {
            window.musicController.duckVolume(0.18);
        }

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
        if (window.musicController) {
            window.musicController.restoreVolume();
        }
    }

    updateStepUI() {
        const steps = (window.HBD_CONFIG.kyc && window.HBD_CONFIG.kyc.steps) || [];
        if (this.currentStepIndex < steps.length) {
            const step = steps[this.currentStepIndex];
            if (this.stepPillEl) {
                this.stepPillEl.innerHTML = `<span>${step.icon}</span> <span>ท่าที่ ${this.currentStepIndex + 1}/${steps.length}: ${step.text}</span>`;
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

        // 1. เล่นเสียงชัตเตอร์สมจริง (Mechanical snap & click)
        if (window.soundManager.playCameraShutter) {
            window.soundManager.playCameraShutter();
        } else {
            window.soundManager.playPop(600);
        }

        // 2. แฟลชกล้องถ่ายรูปสว่างวาบ
        const flashEl = document.getElementById('kyc-shutter-flash');
        if (flashEl) {
            flashEl.classList.add('flash-active');
            setTimeout(() => flashEl.classList.remove('flash-active'), 120);
        }

        // 3. กล้องดีดสะเทือน Recoil นุ่มนวล
        const frameEl = document.querySelector('.kyc-scanner-frame');
        if (frameEl) {
            frameEl.classList.remove('snap-recoil');
            void frameEl.offsetWidth; // trigger reflow
            frameEl.classList.add('snap-recoil');
            setTimeout(() => frameEl.classList.remove('snap-recoil'), 450);
        }

        // 4. แสดงป้าย Snap badge คำชมหวานๆ
        const badgeEl = document.getElementById('kyc-snap-badge');
        if (badgeEl) {
            const compliments = [
                '📸 แชะ! รอยยิ้มน่ารักที่สุดในโลก ✨',
                '✌️ แชะ! สดใส น่ารัก 100% เต็ม 💕',
                '💖 แชะ! มินิฮาร์ทละลายใจคนมอง 🌸'
            ];
            badgeEl.textContent = compliments[this.currentStepIndex] || '📸 แชะ! สวยน่ารักระดับสิบ ✨';
            badgeEl.classList.add('show');
            setTimeout(() => badgeEl.classList.remove('show'), 800);
        }

        // 5. ปล่อยละอองหัวใจวิบวับรอบกล้อง
        this.spawnSnapParticles();

        const steps = (window.HBD_CONFIG.kyc && window.HBD_CONFIG.kyc.steps) || [];
        this.currentStepIndex++;

        // รอ Effect แชะเสร็จสักครู่แล้วอัปเดตสเต็ปถัดไป
        setTimeout(() => {
            if (this.currentStepIndex < steps.length) {
                this.updateStepUI();
            } else {
                this.onAllStepsCompleted();
            }
        }, 450);
    }

    spawnSnapParticles() {
        const frame = document.querySelector('.kyc-scanner-frame');
        if (!frame) return;
        const icons = ['✨', '💖', '🌸', '💫', '📸', '🥰', '💕'];
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.className = 'kyc-snap-particle';
            p.textContent = icons[Math.floor(Math.random() * icons.length)];
            const angle = (Math.PI * 2 * i) / 8 + (Math.random() * 0.3 - 0.15);
            const dist = 65 + Math.random() * 60;
            const tx = Math.cos(angle) * dist + 'px';
            const ty = Math.sin(angle) * dist + 'px';
            const rot = (Math.random() * 50 - 25) + 'deg';
            p.style.setProperty('--tx', tx);
            p.style.setProperty('--ty', ty);
            p.style.setProperty('--rot', rot);
            p.style.left = '50%';
            p.style.top = '50%';
            frame.appendChild(p);
            setTimeout(() => p.remove(), 850);
        }
    }

    onAllStepsCompleted() {
        this.isCompleted = true;
        window.soundManager.playVictory();
        window.soundManager.playChime();

        const steps = (window.HBD_CONFIG.kyc && window.HBD_CONFIG.kyc.steps) || [];

        if (this.actionBtn) this.actionBtn.style.display = 'none';
        if (this.stepPillEl) {
            this.stepPillEl.innerHTML = `<span>🎉</span> <span>สแกนหน้าครบทั้ง ${steps.length} ท่าเรียบร้อย!</span>`;
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
