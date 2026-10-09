/**
 * ====================================================================
 * 🔐 OTP UNLOCK CONTROLLER
 * ====================================================================
 * ตรวจสอบรหัส 10-10-2549 ขยับช่องอัตโนมัติ สั่นเมื่อผิด และระเบิดแสงเมื่อถูกต้อง
 * พร้อมระบบแป้นตัวเลขบนหน้าจอ (Virtual Pink Numpad) สำหรับ iPad / Mobile
 */

class OTPController {
    constructor() {
        this.inputs = [];
        this.cardElement = null;
        this.lockIcon = null;
        this.burstLight = null;
        this.hintElement = null;
        this.isUnlocked = false;
        this.activeIndex = 0;
    }

    init() {
        this.inputs = Array.from(document.querySelectorAll('.otp-input'));
        this.cardElement = document.getElementById('otp-card');
        this.lockIcon = document.getElementById('lock-icon-symbol');
        this.burstLight = document.getElementById('lock-burst');
        this.hintElement = document.getElementById('otp-hint');

        if (this.inputs.length === 0) return;

        this.activeIndex = 0;
        this.updateActiveHighlight();
        this.setupInputListeners();
        this.setupVirtualKeypad();
        this.setupPhysicalKeyboard();
    }

    updateActiveHighlight() {
        this.inputs.forEach((input, idx) => {
            if (idx === this.activeIndex) {
                input.classList.add('active-input');
            } else {
                input.classList.remove('active-input');
            }
        });
    }

    setupInputListeners() {
        this.inputs.forEach((input, index) => {
            // เมื่อแตะช่องกรอกใดๆ ให้โฟกัสที่ช่องนั้น
            input.addEventListener('click', () => {
                this.activeIndex = index;
                this.updateActiveHighlight();
                this.triggerMusicStart();
            });

            input.addEventListener('focus', () => {
                this.activeIndex = index;
                this.updateActiveHighlight();
                this.triggerMusicStart();
            });
        });

        if (this.cardElement) {
            this.cardElement.addEventListener('click', () => {
                this.triggerMusicStart();
            });
        }
    }

    setupVirtualKeypad() {
        const numpad = document.getElementById('otp-virtual-numpad');
        if (!numpad) return;

        numpad.querySelectorAll('.numpad-key').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isUnlocked) return;

                this.triggerMusicStart();
                const val = btn.dataset.val;

                if (val === 'clear') {
                    this.inputs.forEach(inp => inp.value = '');
                    this.activeIndex = 0;
                    this.updateActiveHighlight();
                    window.soundManager.playPop(420);
                    return;
                }

                if (val === 'backspace') {
                    if (this.inputs[this.activeIndex] && this.inputs[this.activeIndex].value) {
                        this.inputs[this.activeIndex].value = '';
                    } else if (this.activeIndex > 0) {
                        this.activeIndex--;
                        this.inputs[this.activeIndex].value = '';
                    }
                    this.updateActiveHighlight();
                    window.soundManager.playPop(450);
                    return;
                }

                // กรอกตัวเลข 0-9
                if (this.activeIndex < this.inputs.length) {
                    this.inputs[this.activeIndex].value = val;
                    window.soundManager.playPop(520 + this.activeIndex * 35);

                    if (this.activeIndex < this.inputs.length - 1) {
                        this.activeIndex++;
                    }
                    this.updateActiveHighlight();
                    this.checkIfComplete();
                }
            });
        });
    }

    setupPhysicalKeyboard() {
        window.addEventListener('keydown', (e) => {
            const otpScene = document.getElementById('scene-otp');
            if (!otpScene || !otpScene.classList.contains('active') || this.isUnlocked) return;

            this.triggerMusicStart();

            // กดตัวเลข 0-9
            if (/^[0-9]$/.test(e.key)) {
                e.preventDefault();
                if (this.activeIndex < this.inputs.length) {
                    this.inputs[this.activeIndex].value = e.key;
                    window.soundManager.playPop(520 + this.activeIndex * 35);

                    if (this.activeIndex < this.inputs.length - 1) {
                        this.activeIndex++;
                    }
                    this.updateActiveHighlight();
                    this.checkIfComplete();
                }
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                if (this.inputs[this.activeIndex] && this.inputs[this.activeIndex].value) {
                    this.inputs[this.activeIndex].value = '';
                } else if (this.activeIndex > 0) {
                    this.activeIndex--;
                    this.inputs[this.activeIndex].value = '';
                }
                this.updateActiveHighlight();
                window.soundManager.playPop(450);
            }
        });
    }

    triggerMusicStart() {
        if (window.soundManager) window.soundManager.init();
        if (window.musicController && !window.musicController.isPlaying && !window.musicController.isUserMuted) {
            window.musicController.playTrack('main');
        }
    }

    getCurrentCode() {
        const d1 = this.inputs[0]?.value || '';
        const d2 = this.inputs[1]?.value || '';
        const m1 = this.inputs[2]?.value || '';
        const m2 = this.inputs[3]?.value || '';
        const y1 = this.inputs[4]?.value || '';
        const y2 = this.inputs[5]?.value || '';
        const y3 = this.inputs[6]?.value || '';
        const y4 = this.inputs[7]?.value || '';

        return {
            day: `${d1}${d2}`,
            month: `${m1}${m2}`,
            year: `${y1}${y2}${y3}${y4}`
        };
    }

    checkIfComplete() {
        const isAllFilled = this.inputs.every(input => input.value.length === 1);
        if (!isAllFilled || this.isUnlocked) return;

        const code = this.getCurrentCode();
        const correct = window.HBD_CONFIG.secretPasscode;

        if (code.day === correct.day && code.month === correct.month && code.year === correct.year) {
            this.handleSuccess();
        } else {
            this.handleFailure();
        }
    }

    handleFailure() {
        window.soundManager.playBuzzer();

        // ใส่คลาสสั่น
        this.cardElement.classList.add('shake-animation');
        if (this.hintElement) {
            this.hintElement.textContent = window.HBD_CONFIG.wrongPasscodeHint;
            this.hintElement.style.color = '#e04868';
        }

        setTimeout(() => {
            this.cardElement.classList.remove('shake-animation');
            // เคลียร์ค่าในช่องและรีเซ็ตตำแหน่งเริ่มต้น
            this.inputs.forEach(input => input.value = '');
            this.activeIndex = 0;
            this.updateActiveHighlight();
        }, 800);
    }

    handleSuccess() {
        this.isUnlocked = true;
        this.inputs.forEach(input => input.disabled = true);

        // เสียงชัยชนะ + ปปลดล็อกกุญแจ
        window.soundManager.playVictory();

        if (this.lockIcon) {
            this.lockIcon.textContent = '🔓';
            this.lockIcon.parentElement.classList.remove('lock-wiggling');
        }

        if (this.burstLight) {
            this.burstLight.classList.add('animate-burst');
        }

        if (this.hintElement) {
            this.hintElement.textContent = '🎉 ปลดล็อกสำเร็จแล้ว ยินดีต้อนรับนะคนโปรด! 💖';
            this.hintElement.style.color = '#2e7d32';
        }

        // ยิง Confetti เล็กๆ ฉลองปลดล็อก
        if (window.confetti) {
            window.confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        // แจ้งเตือนแอปเพื่อเลื่อนเข้าสู่ขั้นตอนถัดไป
        if (window.onOTPUnlockSuccess) {
            window.onOTPUnlockSuccess();
        }
    }
}

window.otpController = new OTPController();
