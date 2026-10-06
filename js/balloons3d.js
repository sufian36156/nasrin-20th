/**
 * ====================================================================
 * 🎈 20 FLOATING 3D BALLOONS CONTROLLER (ลูกโป่ง 3D กลางคืน ไร้บั๊ก)
 * ====================================================================
 */

class Balloons3DController {
    constructor() {
        this.stage = null;
        this.starsCanvas = null;
        this.starsCtx = null;
        this.stars = [];
        this.starsAnimFrame = null;
        this.counterEl = null;
        this.activeBalloons = [];
        this.totalLaunched = 0;
        this.totalTarget = 20;
        this.waveSize = 3; // ปล่อยทีละ 3 ลูกตามที่ขอ
        this.waveTimer = null;
        this.animFrame = null;
        this.isFinished = false;
        this.activeDragBalloon = null;
        this.dragOffset = { x: 0, y: 0 };
        this.dragStartTime = 0;
        this.hasMoved = false;
    }

    init() {
        this.stage = document.getElementById('balloons-stage');
        this.counterEl = document.getElementById('balloons-counter-text');
        this.starsCanvas = document.getElementById('balloons-stars-canvas');

        if (this.starsCanvas) {
            this.initStars();
        }

        this.setupPointerEvents();
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
                    r: Math.random() * 1.5 + 0.5,
                    alpha: Math.random() * 0.8 + 0.2,
                    speed: Math.random() * 0.02 + 0.01
                });
            }
        };
        resize();
        window.addEventListener('resize', resize);
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

    start() {
        this.stage = document.getElementById('balloons-stage');
        this.counterEl = document.getElementById('balloons-counter-text');
        this.starsCanvas = document.getElementById('balloons-stars-canvas');
        if (!this.stage) return;

        this.stage.innerHTML = '';
        this.activeBalloons = [];
        this.totalLaunched = 0;
        this.isFinished = false;
        this.activeDragBalloon = null;

        if (this.waveTimer) clearTimeout(this.waveTimer);
        if (this.starsAnimFrame) cancelAnimationFrame(this.starsAnimFrame);
        this.loopStars();

        this.updateHUD();
        this.launchNextWave();

        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.loop();
    }

    updateHUD() {
        if (this.counterEl) {
            this.counterEl.textContent = `ลูกโป่งความทรงจำ: ${this.totalLaunched} / ${this.totalTarget}`;
        }
    }

    launchNextWave() {
        if (this.totalLaunched >= this.totalTarget || this.isFinished) return;

        const photos = window.HBD_CONFIG.balloonPhotos || [];
        const startIdx = this.totalLaunched;
        const endIdx = Math.min(startIdx + this.waveSize, this.totalTarget);

        for (let i = startIdx; i < endIdx; i++) {
            const photoSrc = photos[i] || `assets/images/balloons/balloon_${(i % 20) + 1}.jpg`;
            // รอพรีโหลดรูปให้เสร็จก่อนปล่อยลูกโป่ง
            this.preloadAndCreateBalloon(i, photoSrc, (i - startIdx) * 650);
        }

        this.totalLaunched = endIdx;
        this.updateHUD();

        if (this.totalLaunched < this.totalTarget) {
            this.waveTimer = setTimeout(() => {
                this.launchNextWave();
            }, 5500);
        }
        // ไม่ใช้จับเวลาตัดฉากเด็ดขาด! รอให้ลูกโป่งทุกลูกถูกจิ้มแตกหรือลอยลับพ้นจอไปทั้งหมดจริงๆ
    }

    preloadAndCreateBalloon(index, imgSrc, delay) {
        setTimeout(() => {
            if (this.isFinished || !this.stage) return;

            const img = new Image();
            img.onload = () => {
                this.spawnBalloonElement(index, imgSrc);
            };
            img.onerror = () => {
                this.spawnBalloonElement(index, 'assets/images/polaroids/1.jpeg');
            };
            img.src = imgSrc;
        }, delay);
    }

    spawnBalloonElement(index, imgSrc) {
        if (!this.stage || this.isFinished) return;
        const stageW = window.innerWidth;
        const stageH = window.innerHeight;

        const balloon = document.createElement('div');
        balloon.className = 'balloon-item';

        // วางพิกัดเริ่มต้นอยู่นอกจอใต้ขอบล่าง 160px ชัดเจน เพื่อไม่ให้เห็นลูกโป่งวาป
        const startX = 20 + Math.random() * (stageW - 130);
        const startY = stageH + 160;

        balloon.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;

        balloon.innerHTML = `
            <div class="balloon-body">
                <img src="${imgSrc}" alt="Balloon Photo ${index + 1}" onerror="this.onerror=null; this.src='assets/images/polaroids/1.jpeg';">
                <div class="balloon-highlight"></div>
            </div>
            <div class="balloon-knot"></div>
            <div class="balloon-string"></div>
        `;

        const balloonData = {
            el: balloon,
            x: startX,
            y: startY,
            speedY: 0.65 + Math.random() * 0.45, // ลอยช้าๆ นุ่มนวล ละมุนสายตา
            wobbleSpeed: 0.025 + Math.random() * 0.015,
            wobbleAmp: 12 + Math.random() * 8,
            angle: Math.random() * Math.PI * 2,
            isHeld: false,
            isPopped: false
        };

        balloon.setAttribute('data-balloon-id', index);
        balloon._balloonData = balloonData;

        // รับประกันการแตะ/คลิกให้แตกได้ 100% ทั้งบนมือถือและคอมพิวเตอร์
        balloon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.popBalloon(balloonData);
        });

        this.stage.appendChild(balloon);
        this.activeBalloons.push(balloonData);
    }

    setupPointerEvents() {
        // ใช้ระบบจับการแตะลากแบบ Centralized
        window.addEventListener('pointerdown', (e) => {
            const item = e.target.closest('.balloon-item');
            if (item && item._balloonData && !item._balloonData.isPopped) {
                const b = item._balloonData;
                this.activeDragBalloon = b;
                b.isHeld = true;
                item.classList.add('held');
                this.dragStartTime = Date.now();
                this.hasMoved = false;

                const rect = item.getBoundingClientRect();
                this.dragOffset.x = e.clientX - rect.left;
                this.dragOffset.y = e.clientY - rect.top;
            }
        });

        window.addEventListener('pointermove', (e) => {
            if (this.activeDragBalloon && this.activeDragBalloon.isHeld) {
                const dist = Math.hypot(
                    e.clientX - (this.activeDragBalloon.x + this.dragOffset.x),
                    e.clientY - (this.activeDragBalloon.y + this.dragOffset.y)
                );
                if (dist > 8) {
                    this.hasMoved = true;
                }
                this.activeDragBalloon.x = e.clientX - this.dragOffset.x;
                this.activeDragBalloon.y = e.clientY - this.dragOffset.y;
            }
        });

        const handleRelease = (e) => {
            if (this.activeDragBalloon) {
                const b = this.activeDragBalloon;
                b.isHeld = false;
                if (b.el) b.el.classList.remove('held');

                const tapDuration = Date.now() - this.dragStartTime;
                if (!this.hasMoved || tapDuration < 250) {
                    // แตะเพื่อทำให้แตก (Pop!) ทันที
                    this.popBalloon(b);
                }
                this.activeDragBalloon = null;
            }
        };

        window.addEventListener('pointerup', handleRelease);
        window.addEventListener('pointercancel', handleRelease);
    }

    popBalloon(b) {
        if (b.isPopped) return;
        b.isPopped = true;

        window.soundManager.playPop(750 + Math.random() * 150);

        if (window.confetti) {
            const rect = b.el.getBoundingClientRect();
            window.confetti({
                particleCount: 30,
                spread: 50,
                origin: { x: (rect.left + 42) / window.innerWidth, y: (rect.top + 45) / window.innerHeight }
            });
        }

        b.el.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease';
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
                b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) scale(1.12)`;
            }

            // หากลอยพ้นขอบบนจอ
            if (b.y < -160) {
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

        if (this.waveTimer) clearTimeout(this.waveTimer);
        if (this.counterEl) {
            this.counterEl.textContent = '✨ ลูกโป่ง 20 ปีลอยลับขอบฟ้า... จดหมายรักกำลังคลี่ออก 💌';
        }

        // ค่อยๆ เฟดลูกโป่งที่เหลือ
        this.activeBalloons.forEach(b => {
            if (b.el) {
                b.el.style.transition = 'opacity 1s ease';
                b.el.style.opacity = '0';
            }
        });

        setTimeout(() => {
            if (this.starsAnimFrame) cancelAnimationFrame(this.starsAnimFrame);
            if (window.app) window.app.goToCeremonyScene('scene-letter');
            if (window.cinematicLetter) window.cinematicLetter.start();
        }, 1800);
    }
}

window.balloons3D = new Balloons3DController();
