/**
 * ====================================================================
 * 🎈 20 FLOATING 3D BALLOONS CONTROLLER (ลูกโป่ง 3D ลอยฟ้า 20 รูป)
 * ====================================================================
 */

class Balloons3DController {
    constructor() {
        this.stage = null;
        this.counterEl = null;
        this.activeBalloons = [];
        this.totalLaunched = 0;
        this.totalTarget = 20;
        this.waveSize = 5;
        this.waveTimer = null;
        this.animFrame = null;
        this.isFinished = false;
    }

    init() {
        this.stage = document.getElementById('balloons-stage');
        this.counterEl = document.getElementById('balloons-counter-text');
    }

    start() {
        this.stage = document.getElementById('balloons-stage');
        this.counterEl = document.getElementById('balloons-counter-text');
        if (!this.stage) return;

        this.stage.innerHTML = '';
        this.activeBalloons = [];
        this.totalLaunched = 0;
        this.isFinished = false;
        if (this.waveTimer) clearInterval(this.waveTimer);

        this.updateHUD();
        this.launchNextWave();

        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.loop();
    }

    updateHUD() {
        if (this.counterEl) {
            this.counterEl.textContent = `ลูกโป่งความทรงจำ: ${this.totalLaunched} / ${this.totalTarget} (จิ้มให้แตก หรือลากตรึงไว้ดูได้ ✨)`;
        }
    }

    launchNextWave() {
        if (this.totalLaunched >= this.totalTarget) return;

        const photos = window.HBD_CONFIG.balloonPhotos || [];
        const startIdx = this.totalLaunched;
        const endIdx = Math.min(startIdx + this.waveSize, this.totalTarget);

        for (let i = startIdx; i < endIdx; i++) {
            setTimeout(() => {
                this.createBalloon(i, photos[i]);
            }, (i - startIdx) * 600);
        }

        this.totalLaunched = endIdx;
        this.updateHUD();

        // ระลอกถัดไปปล่อยหลังจากนี้ 6.5 วินาที
        if (this.totalLaunched < this.totalTarget) {
            this.waveTimer = setTimeout(() => {
                this.launchNextWave();
            }, 6500);
        } else {
            // เมื่อปล่อยครบ 20 ลูกแล้ว รอให้ลอยพ้นจอ แล้วเปลี่ยนฉาก
            setTimeout(() => {
                this.finishAndProceed();
            }, 9000);
        }
    }

    createBalloon(index, imgSrc) {
        if (!this.stage) return;
        const stageW = this.stage.clientWidth || 360;

        const balloon = document.createElement('div');
        balloon.className = 'balloon-item';

        const safeImg = imgSrc || `assets/images/balloons/balloon_${(index % 20) + 1}.jpg`;

        balloon.innerHTML = `
            <div class="balloon-body">
                <img src="${safeImg}" alt="Balloon Photo ${index + 1}" onerror="this.onerror=null; this.src='assets/images/polaroids/1.jpeg';">
                <div class="balloon-highlight"></div>
            </div>
            <div class="balloon-knot"></div>
            <div class="balloon-string"></div>
        `;

        const startX = 20 + Math.random() * (stageW - 120);
        const startY = (this.stage.clientHeight || 500) + 20;

        const balloonData = {
            el: balloon,
            x: startX,
            y: startY,
            speedY: 1.1 + Math.random() * 0.7,
            wobbleSpeed: 0.03 + Math.random() * 0.02,
            wobbleAmp: 12 + Math.random() * 10,
            angle: Math.random() * Math.PI * 2,
            isHeld: false,
            isPopped: false
        };

        // การควบคุม: แตะลาก (Drag & Hold) และ จิ้มแตก (Tap to pop)
        let tapStartTime = 0;
        let didMove = false;

        const onPointerDown = (e) => {
            e.stopPropagation();
            balloonData.isHeld = true;
            tapStartTime = Date.now();
            didMove = false;
        };

        const onPointerMove = (e) => {
            if (!balloonData.isHeld) return;
            didMove = true;
            const rect = this.stage.getBoundingClientRect();
            balloonData.x = (e.clientX - rect.left) - 40;
            balloonData.y = (e.clientY - rect.top) - 50;
        };

        const onPointerUp = (e) => {
            if (!balloonData.isHeld) return;
            balloonData.isHeld = false;

            const tapDuration = Date.now() - tapStartTime;
            if (!didMove && tapDuration < 300) {
                // จิ้มให้แตก (Pop!)
                this.popBalloon(balloonData);
            }
        };

        balloon.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        this.stage.appendChild(balloon);
        this.activeBalloons.push(balloonData);
    }

    popBalloon(b) {
        if (b.isPopped) return;
        b.isPopped = true;

        window.soundManager.playPop(750 + Math.random() * 150);

        if (window.confetti) {
            const rect = b.el.getBoundingClientRect();
            window.confetti({
                particleCount: 25,
                spread: 45,
                origin: { x: (rect.left + 40) / window.innerWidth, y: (rect.top + 45) / window.innerHeight }
            });
        }

        b.el.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        b.el.style.transform = 'scale(1.4)';
        b.el.style.opacity = '0';

        setTimeout(() => {
            if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
            const idx = this.activeBalloons.indexOf(b);
            if (idx !== -1) this.activeBalloons.splice(idx, 1);
            this.checkIfAllCleared();
        }, 220);
    }

    loop() {
        if (this.isFinished) return;

        for (let i = this.activeBalloons.length - 1; i >= 0; i--) {
            const b = this.activeBalloons[i];
            if (b.isPopped) continue;

            if (!b.isHeld) {
                b.y -= b.speedY;
                b.angle += b.wobbleSpeed;
                const offsetX = Math.sin(b.angle) * b.wobbleAmp;

                b.el.style.transform = `translate3d(${b.x + offsetX}px, ${b.y}px, 0)`;
            } else {
                b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) scale(1.08)`;
            }

            // หากลอยพ้นขอบบน
            if (b.y < -140) {
                if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
                this.activeBalloons.splice(i, 1);
                this.checkIfAllCleared();
            }
        }

        this.animFrame = requestAnimationFrame(() => this.loop());
    }

    checkIfAllCleared() {
        if (this.totalLaunched >= this.totalTarget && this.activeBalloons.length === 0) {
            this.finishAndProceed();
        }
    }

    finishAndProceed() {
        if (this.isFinished) return;
        this.isFinished = true;

        if (this.counterEl) {
            this.counterEl.textContent = '✨ ลูกโป่ง 20 ปีลอยลับขอบฟ้า... มีจดหมายลับกำลังเปิดออก 💌';
        }

        // เคลียร์ลูกโป่งที่เหลืออย่างนุ่มนวล
        this.activeBalloons.forEach(b => {
            if (b.el) {
                b.el.style.transition = 'opacity 1s ease';
                b.el.style.opacity = '0';
            }
        });

        setTimeout(() => {
            if (window.app) window.app.goToCeremonyScene('scene-letter');
            if (window.cinematicLetter) window.cinematicLetter.start();
        }, 1800);
    }
}

window.balloons3D = new Balloons3DController();
