/**
 * ====================================================================
 * 🌀 WARP & GIANT SVG HEART CONTROLLER (วาร์ปมิติ & หัวใจ SVG ค่อยๆ เติมสี)
 * ====================================================================
 */

class WarpHeartController {
    constructor() {
        this.heartWrapper = null;
        this.clipRect = null;
        this.fillLine = null;
        this.progressRing = null;
        this.heartSvg = null;
        this.starsCanvas = null;
        this.starsCtx = null;
        this.stars = [];
        this.starsAnimFrame = null;
        this.holdDuration = 3000; // 3 วินาที
        this.startTime = null;
        this.animFrame = null;
        this.isCompleted = false;
        this.hintTextEl = null;
        this.heartbeatTimer = null;
    }

    init() {
        this.heartWrapper = document.getElementById('giant-heart-wrapper');
        this.clipRect = document.getElementById('heart-clip-rect');
        this.fillLine = document.getElementById('heart-fill-line');
        this.progressRing = document.getElementById('charge-ring-fill');
        this.heartSvg = document.getElementById('giant-heart-svg');
        this.hintTextEl = document.getElementById('warp-heart-hint');
        this.starsCanvas = document.getElementById('warp-stars-canvas');

        // ป้องกัน Context Menu ของเบราว์เซอร์เด้งเวลาแตะค้าง
        this.heartWrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Interaction: Pointer Events
        const startHold = (e) => {
            e.preventDefault();
            this.onHoldStart();
        };

        const stopHold = (e) => {
            if (e) e.preventDefault();
            this.onHoldEnd();
        };

        this.heartWrapper.addEventListener('pointerdown', startHold);
        window.addEventListener('pointerup', stopHold);
        window.addEventListener('pointercancel', stopHold);
        window.addEventListener('contextmenu', (e) => {
            if (this.heartWrapper && this.heartWrapper.contains(e.target)) {
                e.preventDefault();
            }
        });

        this.initStars();
    }

    initStars() {
        if (!this.starsCanvas) return;
        this.starsCtx = this.starsCanvas.getContext('2d');
        const resize = () => {
            if (!this.starsCanvas) return;
            this.starsCanvas.width = window.innerWidth;
            this.starsCanvas.height = window.innerHeight;
            this.stars = [];
            for (let i = 0; i < 90; i++) {
                this.stars.push({
                    x: Math.random() * this.starsCanvas.width,
                    y: Math.random() * this.starsCanvas.height,
                    r: Math.random() * 1.6 + 0.5,
                    alpha: Math.random() * 0.8 + 0.2,
                    speed: Math.random() * 0.02 + 0.01
                });
            }
        };
        resize();
        window.addEventListener('resize', resize);
    }

    start() {
        this.isCompleted = false;
        this.resetProgress();

        // 🎵 เริ่มเปิดดนตรีเบาๆ กลมกลืนตั้งแต่หน้านี้เป็นต้นไปจนถึงจดหมาย
        if (window.musicController) {
            window.musicController.startSoft(0.35);
        }

        if (this.hintTextEl) {
            this.hintTextEl.textContent = 'แตะหัวใจค้างไว้ 3 วินาที เพื่อเติมเต็มพลังรัก 💖';
        }
        this.loopStars();
    }

    loopStars() {
        if (!this.starsCtx || !this.starsCanvas) return;
        this.starsCtx.clearRect(0, 0, this.starsCanvas.width, this.starsCanvas.height);

        this.stars.forEach(s => {
            s.alpha += s.speed;
            if (s.alpha > 0.95 || s.alpha < 0.2) s.speed = -s.speed;
            this.starsCtx.beginPath();
            this.starsCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            this.starsCtx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            this.starsCtx.fill();
        });

        this.starsAnimFrame = requestAnimationFrame(() => this.loopStars());
    }

    onHoldStart() {
        if (this.isCompleted) return;

        // Make sure audio context is active
        if (window.soundManager) window.soundManager.init();
        if (window.musicController && !window.musicController.isPlaying) {
            window.musicController.startSoft(0.35);
        }

        this.heartWrapper.classList.add('holding');
        this.startTime = performance.now();
        window.soundManager.playPop(420);

        const trackHold = (now) => {
            if (!this.startTime) return;
            const elapsed = now - this.startTime;
            const progress = Math.min(elapsed / this.holdDuration, 1.0);

            this.updateFillProgress(progress);

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

    updateFillProgress(percent) {
        // อัปเดตการเติมสีของหัวใจ SVG (จากด้านล่าง y=120 สู่ด้านบน y=0)
        const yPos = 120 - (120 * percent);
        if (this.clipRect) this.clipRect.setAttribute('y', yPos);
        if (this.fillLine) {
            this.fillLine.setAttribute('y1', yPos);
            this.fillLine.setAttribute('y2', yPos);
        }

        // อัปเดต Progress Ring วงกลมรอบนอก
        const totalLength = 552;
        const ringOffset = totalLength - (totalLength * percent);
        if (this.progressRing) {
            this.progressRing.style.strokeDashoffset = ringOffset;
        }

        const secsRemaining = Math.max(0, (3 - percent * 3)).toFixed(1);
        if (this.hintTextEl) {
            this.hintTextEl.textContent = `กำลังเติมพลังรัก... ${Math.round(percent * 100)}% (อีก ${secsRemaining} วิ) ✨`;
        }

        // จังหวะหัวใจเต้นเร็วขึ้นตามเปอร์เซ็นต์
        if (this.heartSvg) {
            const pulseScale = 1.0 + Math.sin(performance.now() * (0.008 + percent * 0.015)) * (0.05 + percent * 0.08);
            this.heartSvg.style.transform = `scale(${pulseScale})`;
        }
    }

    resetProgress() {
        if (this.clipRect) this.clipRect.setAttribute('y', '120');
        if (this.fillLine) {
            this.fillLine.setAttribute('y1', '120');
            this.fillLine.setAttribute('y2', '120');
        }
        if (this.progressRing) {
            this.progressRing.style.strokeDashoffset = '552';
        }
        if (this.heartSvg) {
            this.heartSvg.style.transform = 'scale(1)';
        }
    }

    onHoldSuccess() {
        this.isCompleted = true;
        this.heartWrapper.classList.remove('holding');
        this.startTime = null;
        if (this.animFrame) cancelAnimationFrame(this.animFrame);

        // แสงสว่างจ้าหัวใจเติมเต็ม 100%
        if (this.clipRect) this.clipRect.setAttribute('y', '0');
        if (this.heartSvg) {
            this.heartSvg.style.transform = 'scale(1.25)';
            this.heartSvg.style.filter = 'drop-shadow(0 0 35px #ff0844)';
        }

        window.soundManager.playVictory();
        window.soundManager.playChime();

        if (this.hintTextEl) {
            this.hintTextEl.innerHTML = `<span style="color:#ffd1dc; font-weight:700; font-size:1.1rem;">💥 หัวใจเต็มเปี่ยม 100%! จุดประกายพลุราตรี... 🎆</span>`;
        }

        if (window.confetti) {
            window.confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
        }

        setTimeout(() => {
            if (this.starsAnimFrame) cancelAnimationFrame(this.starsAnimFrame);
            if (window.app) {
                window.app.goToCeremonyScene('scene-fireworks', true, '🎆 จุดประกายฟ้าราตรี...', 'เตรียมชมพลุอวยพรฉลอง 20 ปี ✨', () => {
                    if (window.fireworksShow) window.fireworksShow.start();
                });
            } else {
                if (window.fireworksShow) window.fireworksShow.start();
            }
        }, 1000);
    }
}

window.warpController = new WarpHeartController();
