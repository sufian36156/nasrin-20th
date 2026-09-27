/**
 * ====================================================================
 * 🌟 MAIN APP CONTROLLER & TWO-PHASE EXPERIENCE
 * ====================================================================
 */

class BirthdayApp {
    constructor() {
        this.currentCeremonyStep = 'scene-otp';
        this.currentHubTab = 'home';
        this.currentReasonIndex = 0;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
    }

    init() {
        this.initBackgroundParticles();
        this.populateStaticTexts();
        this.setupCeremonyNavigation();
        this.setupHubNavigation();
        this.setupLoveReasonsSlider();

        // เริ่มต้นโมดูลต่างๆ
        if (window.otpController) window.otpController.init();
        if (window.cakeController) window.cakeController.init();
        if (window.scratchController) window.scratchController.init();
        if (window.balloonController) window.balloonController.init();
        if (window.arcadeController) window.arcadeController.init();
        if (window.musicController) window.musicController.init();
        if (window.videoVault) window.videoVault.init();
    }

    populateStaticTexts() {
        const nameEls = document.querySelectorAll('.target-name');
        nameEls.forEach(el => el.textContent = window.HBD_CONFIG.nickname);

        const ageEls = document.querySelectorAll('.target-age');
        ageEls.forEach(el => el.textContent = window.HBD_CONFIG.age);
    }

    // Phase 1: การเปลี่ยนฉากในพิธีเซอร์ไพรส์
    goToCeremonyScene(sceneId) {
        document.querySelectorAll('.ceremony-scene').forEach(sc => sc.classList.remove('active'));
        const target = document.getElementById(sceneId);
        if (target) {
            target.classList.add('active');
            this.currentCeremonyStep = sceneId;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    setupCeremonyNavigation() {
        // จาก OTP ผ่านแล้ว ให้ไปที่ Milestone Counter (7,305 วัน)
        window.onOTPUnlockSuccess = () => {
            setTimeout(() => {
                this.goToCeremonyScene('scene-milestone');
            }, 1200);
        };

        // จาก Milestone ไปที่ เค้กวันเกิด
        const toCakeBtn = document.getElementById('milestone-to-cake-btn');
        if (toCakeBtn) {
            toCakeBtn.addEventListener('click', () => {
                window.soundManager.playSwoosh();
                this.goToCeremonyScene('scene-cake');
                if (window.cakeController) window.cakeController.requestMicrophone();
            });
        }

        // จาก เค้ก ไปที่ จดหมาย Wax Seal
        const toLetterBtn = document.getElementById('cake-to-letter-btn');
        if (toLetterBtn) {
            toLetterBtn.addEventListener('click', () => {
                window.soundManager.playSwoosh();
                this.goToCeremonyScene('scene-letter');
            });
        }

        // แตะตราครั่งเพื่อเปิดจดหมาย
        const waxSeal = document.getElementById('wax-seal-stamp');
        const letterCard = document.getElementById('unfolded-letter');
        const toHubBtn = document.getElementById('letter-to-hub-btn');

        if (waxSeal) {
            waxSeal.addEventListener('click', () => {
                window.soundManager.playPop(800);
                window.soundManager.playVictory();
                waxSeal.classList.add('broken');

                setTimeout(() => {
                    waxSeal.parentElement.style.display = 'none';
                    if (letterCard) letterCard.style.display = 'block';
                    if (toHubBtn) toHubBtn.style.display = 'inline-flex';
                    if (window.confetti) window.confetti({ particleCount: 60, spread: 70 });
                }, 500);
            });
        }

        // เข้าสู่ Wonderland Hub เต็มตัว!
        if (toHubBtn) {
            toHubBtn.addEventListener('click', () => {
                window.soundManager.playVictory();
                if (window.confetti) {
                    window.confetti({ particleCount: 120, spread: 90 });
                }
                this.enterWonderlandHub();
            });
        }
    }

    // ปลดล็อกเข้าสู่ Wonderland Hub
    enterWonderlandHub() {
        // ซ่อน Ceremony ทั้งหมด
        document.querySelectorAll('.ceremony-scene').forEach(sc => sc.style.display = 'none');

        // แสดง Hub และ Bottom Navigation Bar
        const hub = document.getElementById('wonderland-hub');
        const bottomNav = document.getElementById('bottom-nav-bar');
        const musicBar = document.getElementById('mini-music-bar');

        if (hub) hub.classList.add('active');
        if (bottomNav) bottomNav.style.display = 'flex';
        if (musicBar) musicBar.style.display = 'flex';

        this.switchHubTab('home');

        // เริ่มเล่นดนตรีเบาๆ อัตโนมัติ
        if (window.musicController && !window.musicController.isPlaying) {
            window.musicController.start();
        }
    }

    // Phase 2: เปลี่ยนแท็บใน Wonderland Hub
    setupHubNavigation() {
        const tabBtns = document.querySelectorAll('.nav-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                this.switchHubTab(targetTab);
            });
        });
    }

    switchHubTab(tabName) {
        this.currentHubTab = tabName;

        // อัปเดตปุ่มแท็บ
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // แสดงเนื้อหาแท็บ
        document.querySelectorAll('.hub-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `hub-content-${tabName}`);
        });

        window.soundManager.playPop(520);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // หากเข้าแท็บคูปอง ให้คำนวณ canvas ใหม่ถ้าเพิ่งแสดง
        if (tabName === 'coupons' && window.scratchController) {
            window.scratchController.init();
        }
    }

    // สไลเดอร์ 20 เหตุผลที่รักเธอ
    setupLoveReasonsSlider() {
        const cardBox = document.getElementById('love-reason-card');
        const prevBtn = document.getElementById('reason-prev-btn');
        const nextBtn = document.getElementById('reason-next-btn');
        const counter = document.getElementById('reason-counter');
        const reasons = window.HBD_CONFIG.loveReasons;

        const updateCard = () => {
            const item = reasons[this.currentReasonIndex];
            if (!item || !cardBox) return;

            cardBox.innerHTML = `
                <div class="reason-badge">เหตุผลข้อที่ ${item.no} / 20 💖</div>
                <div class="reason-title">${item.title}</div>
                <div class="reason-desc">${item.desc}</div>
                <div style="font-size:1.8rem;">🌸</div>
            `;

            if (counter) counter.textContent = `${this.currentReasonIndex + 1} / ${reasons.length}`;
        };

        updateCard();

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentReasonIndex > 0) {
                    this.currentReasonIndex--;
                    window.soundManager.playPop(480);
                    updateCard();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentReasonIndex < reasons.length - 1) {
                    this.currentReasonIndex++;
                    window.soundManager.playPop(520);
                    updateCard();
                    if (this.currentReasonIndex === 19 && window.confetti) {
                        window.confetti({ particleCount: 50, spread: 60 });
                    }
                }
            });
        }
    }

    // ละอองลอยฉากหลัง (ซากุระ & หัวใจ)
    initBackgroundParticles() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const count = window.innerWidth > 768 ? 32 : 20;
        const emojis = ['🌸', '✨', '💖', '🤍', '🌷'];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 14 + Math.random() * 12,
                speedX: -0.5 + Math.random() * 1,
                speedY: 0.4 + Math.random() * 0.9,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                opacity: 0.25 + Math.random() * 0.45,
                angle: Math.random() * 360,
                spinSpeed: -1 + Math.random() * 2
            });
        }

        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.angle += p.spinSpeed;

                if (p.y > this.canvas.height + 25) {
                    p.y = -25;
                    p.x = Math.random() * this.canvas.width;
                }
                if (p.x > this.canvas.width + 25) p.x = -25;
                if (p.x < -25) p.x = this.canvas.width + 25;

                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.angle * Math.PI) / 180);
                this.ctx.globalAlpha = p.opacity;
                this.ctx.font = `${p.size}px serif`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(p.emoji, 0, 0);
                this.ctx.restore();
            });

            requestAnimationFrame(animate);
        };

        animate();
    }
}

window.app = new BirthdayApp();

document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
});
