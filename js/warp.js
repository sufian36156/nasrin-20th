/**
 * ====================================================================
 * 🌀 WARP & GIANT HEART CONTROLLER (วาร์ปมิติ & หัวใจยักษ์เติมพลังรัก)
 * ====================================================================
 */

class WarpHeartController {
    constructor() {
        this.heartWrapper = null;
        this.progressRing = null;
        this.holdTimer = null;
        this.startTime = null;
        this.animFrame = null;
        this.holdDuration = 3000; // 3 วินาที
        this.isCompleted = false;
        this.hintTextEl = null;
    }

    init() {
        this.heartWrapper = document.getElementById('giant-heart-wrapper');
        this.progressRing = document.getElementById('charge-ring-fill');
        this.hintTextEl = document.getElementById('warp-heart-hint');

        if (!this.heartWrapper) return;

        // รองรับทั้ง Touch บน iPad / มือถือ และ Mouse บนคอมพิวเตอร์
        const startHold = (e) => {
            e.preventDefault();
            this.onHoldStart();
        };

        const stopHold = (e) => {
            e.preventDefault();
            this.onHoldEnd();
        };

        this.heartWrapper.addEventListener('pointerdown', startHold);
        window.addEventListener('pointerup', stopHold);
        window.addEventListener('pointercancel', stopHold);
    }

    start() {
        this.isCompleted = false;
        this.resetProgress();
        if (this.hintTextEl) {
            this.hintTextEl.textContent = 'แตะหัวใจค้างไว้ 3 วินาที เพื่อปลดล็อกพลังแห่งความรัก 💖';
        }
    }

    onHoldStart() {
        if (this.isCompleted) return;

        this.heartWrapper.classList.add('holding');
        this.startTime = performance.now();
        window.soundManager.playPop(400);

        const trackHold = (now) => {
            if (!this.startTime) return;
            const elapsed = now - this.startTime;
            const progress = Math.min(elapsed / this.holdDuration, 1.0);

            this.updateRingProgress(progress);

            if (progress >= 1.0) {
                this.onHoldSuccess();
            } else {
                this.animFrame = requestAnimationFrame(trackHold);
            }
        };

        this.animFrame = requestAnimationFrame(trackHold);
    }

    onHoldEnd() {
        if (this.isCompleted) return;
        this.heartWrapper.classList.remove('holding');
        this.startTime = null;
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.resetProgress();
        if (this.hintTextEl) {
            this.hintTextEl.textContent = 'กดค้างให้ครบ 3 วินาทีนะคนเก่ง ใกล้จะสำเร็จแล้ว! 😉';
        }
    }

    updateRingProgress(percent) {
        if (!this.progressRing) return;
        const totalLength = 440; // 2 * PI * r (approx)
        const offset = totalLength - (totalLength * percent);
        this.progressRing.style.strokeDashoffset = offset;

        const secsRemaining = Math.max(0, (3 - percent * 3)).toFixed(1);
        if (this.hintTextEl) {
            this.hintTextEl.textContent = `กำลังชาร์จพลังความรัก... อีก ${secsRemaining} วินาที ✨`;
        }
    }

    resetProgress() {
        if (this.progressRing) {
            this.progressRing.style.strokeDashoffset = '440';
        }
    }

    onHoldSuccess() {
        this.isCompleted = true;
        this.heartWrapper.classList.remove('holding');
        this.startTime = null;
        if (this.animFrame) cancelAnimationFrame(this.animFrame);

        window.soundManager.playVictory();
        window.soundManager.playChime();

        if (this.hintTextEl) {
            this.hintTextEl.innerHTML = `<span style="color:#ffccd5; font-weight:700; font-size:1.1rem;">💥 ชาร์จพลังเต็ม 100%! กำลังส่งสัญญาณสู่ท้องฟ้า... 🎆</span>`;
        }

        if (window.confetti) {
            window.confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        }

        // วาร์ปไปยังฉากพลุไฟ
        setTimeout(() => {
            if (window.app) window.app.goToCeremonyScene('scene-fireworks');
            if (window.fireworksShow) window.fireworksShow.start();
        }, 1200);
    }
}

window.warpController = new WarpHeartController();
