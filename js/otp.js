/**
 * ====================================================================
 * 🔐 OTP UNLOCK CONTROLLER
 * ====================================================================
 * ตรวจสอบรหัส 10-10-2549 ขยับช่องอัตโนมัติ สั่นเมื่อผิด และระเบิดแสงเมื่อถูกต้อง
 */

class OTPController {
    constructor() {
        this.inputs = [];
        this.cardElement = null;
        this.lockIcon = null;
        this.burstLight = null;
        this.hintElement = null;
        this.isUnlocked = false;
    }

    init() {
        this.inputs = Array.from(document.querySelectorAll('.otp-input'));
        this.cardElement = document.getElementById('otp-card');
        this.lockIcon = document.getElementById('lock-icon-symbol');
        this.burstLight = document.getElementById('lock-burst');
        this.hintElement = document.getElementById('otp-hint');

        if (this.inputs.length === 0) return;

        this.setupInputListeners();
    }

    setupInputListeners() {
        this.inputs.forEach((input, index) => {
            // อนุญาตเฉพาะตัวเลข
            input.addEventListener('input', (e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = val;

                if (val.length >= 1) {
                    window.soundManager.playPop(520 + index * 40);
                    // ข้ามไปยังช่องถัดไปถ้ามี
                    if (index < this.inputs.length - 1) {
                        this.inputs[index + 1].focus();
                    }
                }

                // เช็คว่ากรอกครบทุกช่องหรือยัง
                this.checkIfComplete();
            });

            // รองรับการกด Backspace ถอยหลัง
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    this.inputs[index - 1].focus();
                }
            });

            // เมื่อแตะช่องแรก
            input.addEventListener('focus', () => {
                window.soundManager.init();
            });
        });
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
            // เคลียร์ค่าในช่องและโฟกัสช่องแรกใหม่
            this.inputs.forEach(input => input.value = '');
            if (this.inputs[0]) this.inputs[0].focus();
        }, 800);
    }

    handleSuccess() {
        this.isUnlocked = true;
        this.inputs.forEach(input => input.disabled = true);

        // เสียงชัยชนะ + ปลดล็อกกุญแจ
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
