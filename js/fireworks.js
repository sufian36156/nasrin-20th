/**
 * ====================================================================
 * 🎆 NIGHT SKY FIREWORKS CONTROLLER (พลุไฟคำอวยพรกลางฟ้าราตรี 3 นัด)
 * ====================================================================
 */

class FireworksShowController {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.rockets = [];
        this.stars = [];
        this.animFrame = null;
        this.statusBadgeEl = null;
        this.currentRound = 0;
        this.rounds = [
            { text: "Happy birthday", sub: "นัดที่ 1: สุขสันต์วันเกิด ✨", color: "#ff758f" },
            { text: "20th year", sub: "นัดที่ 2: ก้าวสู่วัย 20 ปีบริบูรณ์ 🎂", color: "#ffd166" },
            { text: "Nasrin Masa", sub: "นัดที่ 3: แด่คนพิเศษ ณัสริญ มะสะ 💖", color: "#06d6a0" }
        ];
        this.activeTextParticles = [];
    }

    init() {
        this.canvas = document.getElementById('fireworks-canvas');
        this.statusBadgeEl = document.getElementById('fireworks-status-badge');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.generateStars();
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width || window.innerWidth;
        this.canvas.height = rect.height || 480;
    }

    generateStars() {
        this.stars = [];
        const count = 70;
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * (this.canvas ? this.canvas.width : 500),
                y: Math.random() * (this.canvas ? this.canvas.height : 500),
                r: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.03 + 0.01
            });
        }
    }

    start() {
        this.resize();
        this.generateStars();
        this.currentRound = 0;
        this.particles = [];
        this.rockets = [];
        this.activeTextParticles = [];

        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.loop();

        this.launchNextRound();
    }

    launchNextRound() {
        if (this.currentRound >= this.rounds.length) {
            // ยิงครบทั้ง 3 นัดแล้ว -> ไปต่อที่หัวใจ 3D
            setTimeout(() => {
                if (this.statusBadgeEl) {
                    this.statusBadgeEl.textContent = '✨ พลุอวยพรส่งความรักครบแล้ว... กำลังรวมความทรงจำ 🤍';
                }
                setTimeout(() => {
                    if (window.app) window.app.goToCeremonyScene('scene-heart3d');
                    if (window.heart3D) window.heart3D.start();
                }, 1500);
            }, 2500);
            return;
        }

        const roundData = this.rounds[this.currentRound];
        if (this.statusBadgeEl) {
            this.statusBadgeEl.textContent = roundData.sub;
        }

        // ยิงจรวดพลุพุ่งขึ้น
        window.soundManager.playSwoosh();
        const startX = this.canvas.width * (0.35 + Math.random() * 0.3);
        const targetY = this.canvas.height * 0.32;

        this.rockets.push({
            x: startX,
            y: this.canvas.height,
            targetY: targetY,
            speed: 9,
            color: roundData.color,
            textData: roundData
        });

        this.currentRound++;
    }

    explodeRocket(rocket) {
        window.soundManager.playPop(300);
        window.soundManager.playChime();

        // สะเก็ดดาวกระจายรอบทิศ
        const sparkCount = 80;
        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.particles.push({
                x: rocket.x,
                y: rocket.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: rocket.color,
                alpha: 1,
                decay: Math.random() * 0.015 + 0.01,
                size: Math.random() * 3 + 2
            });
        }

        // สร้างตัวอักษรประกายแสงกลางอากาศ
        this.createTextExplosion(rocket.x, rocket.y, rocket.textData.text, rocket.color);

        // รอ 2.8 วินาทีแล้วยิงนัดถัดไป
        setTimeout(() => {
            this.launchNextRound();
        }, 2800);
    }

    createTextExplosion(centerX, centerY, text, color) {
        // สร้าง Canvas ชั่วคราวเพื่ออ่านพิกัดพิกเซลของตัวหนังสือ
        const offscreen = document.createElement('canvas');
        const offCtx = offscreen.getContext('2d');
        offscreen.width = 400;
        offscreen.height = 100;

        offCtx.fillStyle = '#ffffff';
        offCtx.font = "bold 32px 'Prompt', sans-serif";
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText(text, 200, 50);

        const imgData = offCtx.getImageData(0, 0, 400, 100);
        const step = 4; // ความละเอียดพิกเซล

        for (let y = 0; y < 100; y += step) {
            for (let x = 0; x < 400; x += step) {
                const index = (y * 400 + x) * 4;
                if (imgData.data[index + 3] > 128) {
                    const targetX = centerX + (x - 200);
                    const targetY = centerY + (y - 50);

                    this.activeTextParticles.push({
                        x: centerX,
                        y: centerY,
                        tx: targetX,
                        ty: targetY,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        color: color,
                        alpha: 1,
                        life: 140, // อยู่ได้ราวๆ 2.5 วินาที
                        size: 2.5
                    });
                }
            }
        }
    }

    loop() {
        if (!this.ctx) return;
        this.ctx.fillStyle = 'rgba(10, 4, 18, 0.25)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // วาดดาวระยิบระยับ
        this.stars.forEach(star => {
            star.alpha += star.twinkleSpeed;
            if (star.alpha > 0.9 || star.alpha < 0.2) star.twinkleSpeed = -star.twinkleSpeed;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            this.ctx.fill();
        });

        // อัปเดตจรวด
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const r = this.rockets[i];
            r.y -= r.speed;

            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fill();

            // หางควันจรวด
            this.particles.push({
                x: r.x + (Math.random() - 0.5) * 2,
                y: r.y + 4,
                vx: (Math.random() - 0.5) * 0.5,
                vy: 2,
                color: r.color,
                alpha: 0.6,
                decay: 0.05,
                size: 2
            });

            if (r.y <= r.targetY) {
                this.explodeRocket(r);
                this.rockets.splice(i, 1);
            }
        }

        // อัปเดตสะเก็ดไฟ
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08; // แรงโน้มถ่วง
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }

        // อัปเดตตัวอักษรประกายไฟ
        for (let i = this.activeTextParticles.length - 1; i >= 0; i--) {
            const tp = this.activeTextParticles[i];
            // ค่อยๆ บินไปหาตำแหน่งเป้าหมาย
            tp.x += (tp.tx - tp.x) * 0.12;
            tp.y += (tp.ty - tp.y) * 0.12;
            tp.life--;

            if (tp.life < 30) {
                tp.alpha = tp.life / 30;
                tp.y += 0.5; // ค่อยๆ ร่วง
            }

            if (tp.life <= 0) {
                this.activeTextParticles.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(tp.x, tp.y, tp.size, 0, Math.PI * 2);
            this.ctx.fillStyle = tp.color;
            this.ctx.globalAlpha = tp.alpha;
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }

        this.animFrame = requestAnimationFrame(() => this.loop());
    }
}

window.fireworksShow = new FireworksShowController();
