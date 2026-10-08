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
            // เริ่มต้นด้วยการนับเคาต์ดาวน์ 1 2 3
            { text: "1", sub: "✨ หนึ่ง... เตรียมตัวนะคนเก่ง 🌟", color: "#ff9e00", isCountdown: true },
            { text: "2", sub: "💫 สอง... หายใจเข้าลึกๆ 💖", color: "#ff4d6d", isCountdown: true },
            { text: "3", sub: "🎆 สาม... ขอให้มีความสุขที่สุด! 🎉", color: "#c77dff", isCountdown: true },
            // พลุข้อความคำอวยพรฉลอง 20 ปี
            { text: "Happy birthday", sub: "สุขสันต์วันเกิดครบรอบ 20 ปี ✨", color: "#ff758f", isCountdown: false },
            { text: "20th year", sub: "ก้าวสู่วัย 20 ปีบริบูรณ์อย่างงดงาม 🎂", color: "#ffd166", isCountdown: false },
            { text: "Nasrin Masa", sub: "แด่คนพิเศษที่สุดในใจ ณัสริญ มะสะ 💖", color: "#06d6a0", isCountdown: false }
        ];
        this.activeTextParticles = [];
        this.roundTimeout = null;
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
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
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
        if (this.roundTimeout) {
            clearTimeout(this.roundTimeout);
            this.roundTimeout = null;
        }

        this.resize();
        this.generateStars();
        this.currentRound = 0;
        this.particles = [];
        this.rockets = [];
        this.activeTextParticles = [];

        // 🎵 สลับเพลงเฉพาะสำหรับหน้าพลุราตรีตระการตา!
        if (window.musicController) {
            window.musicController.startFireworks(0.4);
        }

        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.loop();

        this.launchNextRound();
    }

    launchNextRound() {
        if (this.currentRound >= this.rounds.length) {
            // ยิงครบทุกนัดแล้ว -> ค่อยๆ ปล่อยตัวอักษรจาง และไปต่อที่หัวใจ 3D
            this.roundTimeout = setTimeout(() => {
                if (this.statusBadgeEl) {
                    this.statusBadgeEl.textContent = '✨ พลุอวยพรส่งความรักครบแล้ว... กำลังหลอมรวมความทรงจำ 🤍';
                }
                this.roundTimeout = setTimeout(() => {
                    if (window.app) {
                        window.app.goToCeremonyScene('scene-heart3d', true, '💎 หลอมรวมความทรงจำ 3D...', 'หัวใจแห่งความรัก 360 องศา 💖', () => {
                            if (window.heart3D) window.heart3D.start();
                        });
                    } else {
                        if (window.heart3D) window.heart3D.start();
                    }
                }, 1200);
            }, 2200);
            return;
        }

        const roundData = this.rounds[this.currentRound];
        if (this.statusBadgeEl) {
            this.statusBadgeEl.textContent = roundData.sub;
        }

        // เมื่อเริ่มยิงลูกใหม่ ให้ตัวอักษรของนัดก่อนหน้าค่อยๆ ลอยจางหายไปอย่างนุ่มนวล (ป้องกันการชนกันล่วงหน้า)
        if (this.activeTextParticles.length > 0) {
            this.activeTextParticles.forEach(p => {
                p.life = Math.min(p.life, 18);
                p.vy -= 0.6;
            });
        }

        // ยิงจรวดพลุพุ่งขึ้นพร้อมเสียงหวีดหวิวสมจริง
        if (window.soundManager && window.soundManager.playFireworkWhistle) {
            window.soundManager.playFireworkWhistle();
        } else if (window.soundManager) {
            window.soundManager.playSwoosh();
        }

        const startX = this.canvas.width * (0.4 + Math.random() * 0.2);
        const targetY = this.canvas.height * 0.30;

        this.rockets.push({
            x: startX,
            y: this.canvas.height,
            targetY: targetY,
            speed: 10.5,
            color: roundData.color,
            textData: roundData
        });

        this.currentRound++;
    }

    explodeRocket(rocket) {
        // เล่นเสียงระเบิดกระหึ่มตูมมมม! (Sub-bass + Lowpass burst) และเสียงสะเก็ดไฟเปรี๊ยะๆ
        if (window.soundManager && window.soundManager.playFireworkBoom) {
            window.soundManager.playFireworkBoom();
        } else if (window.soundManager) {
            window.soundManager.playPop(200);
        }

        setTimeout(() => {
            if (window.soundManager && window.soundManager.playFireworkCrackle) {
                window.soundManager.playFireworkCrackle();
            }
        }, 120);

        // สะเก็ดดาวกระจายรอบทิศ
        const sparkCount = 90;
        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 7 + 2;
            this.particles.push({
                x: rocket.x,
                y: rocket.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: rocket.color,
                alpha: 1,
                decay: Math.random() * 0.018 + 0.012,
                size: Math.random() * 3.5 + 2
            });
        }

        // 🌟 แก้ไขบั๊กข้อความทับซ้อน 100%:
        // ล้างตัวอักษรเก่าออกทั้งหมดทันทีก่อนสร้างตัวอักษรของนัดใหม่เด็ดขาด!
        this.activeTextParticles = [];

        // สร้างตัวอักษรประกายแสงขนาดใหญ่พิเศษกลางอากาศ
        const isCountdown = Boolean(rocket.textData.isCountdown);
        this.createTextExplosion(rocket.x, rocket.y, rocket.textData.text, rocket.color, isCountdown);

        // เวลารอสำหรับนัดถัดไป (เคาต์ดาวน์ 1 2 3 ให้ฉับไว 1.8s, ข้อความยาวให้อยู่นานขึ้น 3.2s)
        const delayBeforeNext = isCountdown ? 1800 : 3200;
        this.roundTimeout = setTimeout(() => {
            this.launchNextRound();
        }, delayBeforeNext);
    }

    createTextExplosion(centerX, centerY, text, color, isCountdown = false) {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        // ฟิกเกอร์พิกัดศูนย์กลางแนวนอนให้อยู่กึ่งกลางหน้าจอเสมอ
        const safeCenterX = screenW / 2;
        const safeCenterY = Math.max(130, Math.min(screenH * 0.32, centerY));

        // ความกว้าง Canvas เสมือนสำหรับเรนเดอร์ตัวอักษร
        const cW = Math.min(780, Math.max(310, Math.floor(screenW * 0.94)));
        const cH = 170;

        const offscreen = document.createElement('canvas');
        const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
        offscreen.width = cW;
        offscreen.height = cH;

        offCtx.clearRect(0, 0, cW, cH);
        offCtx.fillStyle = '#ffffff';

        // คำนวณขนาด Font ให้พอดี เหมาะกับมือถือและไอแพดโดยอัตโนมัติ
        let fontSize;
        if (isCountdown) {
            fontSize = screenW < 600 ? 92 : 130;
        } else if (text.length > 12) {
            fontSize = screenW < 600 ? 32 : 54;
        } else {
            fontSize = screenW < 600 ? 38 : 60;
        }

        offCtx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Prompt', 'Kanit', sans-serif`;
        // ย่อขนาดฟอนต์ถ้าความกว้างข้อความเกินพื้นที่แสดงผล ป้องกันตัวหนังสือล้น/ทับซ้อน
        const maxAllowedWidth = cW * 0.88;
        while (offCtx.measureText(text).width > maxAllowedWidth && fontSize > 18) {
            fontSize -= 2;
            offCtx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Prompt', 'Kanit', sans-serif`;
        }

        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillText(text, cW / 2, cH / 2);

        const imgData = offCtx.getImageData(0, 0, cW, cH);
        const data = imgData.data;

        // Step พิกเซล (มือถือ 3-4 เพื่อให้ตัวอักษรแน่น คมชัด ไม่แหว่ง และลื่นไหล)
        const step = screenW < 600 ? 3 : 4;
        const particleLife = isCountdown ? 90 : 155;

        for (let y = 0; y < cH; y += step) {
            for (let x = 0; x < cW; x += step) {
                const index = (y * cW + x) * 4;
                if (data[index + 3] > 110) {
                    const targetX = safeCenterX + (x - cW / 2);
                    const targetY = safeCenterY + (y - cH / 2);

                    this.activeTextParticles.push({
                        x: centerX,
                        y: centerY,
                        tx: targetX,
                        ty: targetY,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        color: color,
                        alpha: 1,
                        life: particleLife,
                        size: screenW < 600 ? 2.5 : 3.2
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
