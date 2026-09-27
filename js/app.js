/**
 * ====================================================================
 * 🌟 MAIN APP CONTROLLER — LIVE CLOCK & MAGICAL PORTAL
 * ====================================================================
 */

class BirthdayApp {
    constructor() {
        this.currentCeremonyStep = 'scene-otp';
        this.currentHubTab = 'home';
        this.currentReasonIndex = 0;
        this.currentTimelineAge = 1;
        this.timelineInterval = null;
        this.clockInterval = null;
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
        this.setupTimelineJourney();
        this.startLiveTickingClock();

        if (window.otpController) window.otpController.init();
        if (window.cakeController) window.cakeController.init();
        if (window.scratchController) window.scratchController.init();
        if (window.balloonController) window.balloonController.init();
        if (window.arcadeController) window.arcadeController.init();
        if (window.musicController) window.musicController.init();
        if (window.videoVault) window.videoVault.init();
    }

    populateStaticTexts() {
        document.querySelectorAll('.target-name').forEach(el => el.textContent = window.HBD_CONFIG.fullName);
        document.querySelectorAll('.target-shortname').forEach(el => el.textContent = window.HBD_CONFIG.nickname);
        document.querySelectorAll('.target-engname').forEach(el => el.textContent = window.HBD_CONFIG.englishName);
        document.querySelectorAll('.target-age').forEach(el => el.textContent = window.HBD_CONFIG.age);
    }

    // ==========================================
    // ⏱️ นาฬิกาเวลาชีวิตเดินสด (ปี:เดือน:วัน:ชม:นาที:วินาที)
    // ==========================================
    startLiveTickingClock() {
        const updateClock = () => {
            const birthDate = new Date(window.HBD_CONFIG.birthDateTime);
            const now = new Date();

            let diffMs = now - birthDate;
            if (diffMs < 0) diffMs = 0;

            const totalSecs = Math.floor(diffMs / 1000);
            const totalMins = Math.floor(totalSecs / 60);
            const totalHours = Math.floor(totalMins / 60);
            const totalDays = Math.floor(totalHours / 24);

            let years = now.getFullYear() - birthDate.getFullYear();
            let months = now.getMonth() - birthDate.getMonth();
            let days = now.getDate() - birthDate.getDate();

            if (days < 0) {
                months--;
                const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
                days += prevMonthDays;
            }
            if (months < 0) {
                years--;
                months += 12;
            }

            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            const yEl = document.getElementById('clock-years');
            const mEl = document.getElementById('clock-months');
            const dEl = document.getElementById('clock-days');
            const hEl = document.getElementById('clock-hours');
            const minEl = document.getElementById('clock-minutes');
            const sEl = document.getElementById('clock-seconds');

            if (yEl) yEl.textContent = String(years).padStart(2, '0');
            if (mEl) mEl.textContent = String(months).padStart(2, '0');
            if (dEl) dEl.textContent = String(days).padStart(2, '0');
            if (hEl) hEl.textContent = String(hours).padStart(2, '0');
            if (minEl) minEl.textContent = String(minutes).padStart(2, '0');
            if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
        };

        updateClock();
        this.clockInterval = setInterval(updateClock, 1000);
    }

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
        // จาก OTP ผ่านแล้ว ให้ไปที่ Milestone Counter (1-20 ขวบ)
        window.onOTPUnlockSuccess = () => {
            setTimeout(() => {
                this.goToCeremonyScene('scene-milestone');
                this.startTimelineAutoPlay();
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
        const ticketBox = document.getElementById('golden-ticket-box');

        if (waxSeal) {
            waxSeal.addEventListener('click', () => {
                window.soundManager.playPop(800);
                window.soundManager.playVictory();
                waxSeal.classList.add('broken');

                setTimeout(() => {
                    waxSeal.parentElement.style.display = 'none';
                    if (letterCard) letterCard.style.display = 'block';
                    if (ticketBox) ticketBox.style.display = 'block';
                    if (window.confetti) window.confetti({ particleCount: 60, spread: 70 });
                }, 500);
            });
        }

        // แตะบัตรทองคำวิเศษเพื่อเปิดประตูมิติสู่ Wonderland
        const goldenTicket = document.getElementById('golden-ticket-card');
        if (goldenTicket) {
            goldenTicket.addEventListener('click', () => {
                this.triggerMagicalPortalWarp();
            });
        }
    }

    // ==========================================
    // 🌌 ประตูมิติเวทมนตร์สู่ Wonderland (WARP PORTAL)
    // ==========================================
    triggerMagicalPortalWarp() {
        window.soundManager.playVictory();
        window.soundManager.playChime();

        const portalOverlay = document.getElementById('portal-warp-overlay');
        if (portalOverlay) {
            portalOverlay.classList.add('active');
        }

        // เสียงกระดิ่งเวทมนตร์และวาร์ป 1.8 วินาที
        setTimeout(() => {
            this.enterWonderlandHub();
            setTimeout(() => {
                if (portalOverlay) portalOverlay.classList.remove('active');
                if (window.confetti) {
                    window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
                }
            }, 600);
        }, 1800);
    }

    setupTimelineJourney() {
        const slider = document.getElementById('timeline-age-slider');
        const replayBtn = document.getElementById('timeline-replay-btn');

        if (slider) {
            slider.addEventListener('input', (e) => {
                if (this.timelineInterval) clearInterval(this.timelineInterval);
                const age = parseInt(e.target.value, 10);
                this.updateTimelineDisplay(age);
            });
        }

        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                this.startTimelineAutoPlay();
            });
        }
    }

    startTimelineAutoPlay() {
        if (this.timelineInterval) clearInterval(this.timelineInterval);
        this.currentTimelineAge = 1;
        const slider = document.getElementById('timeline-age-slider');
        const toCakeBtn = document.getElementById('milestone-to-cake-btn');
        if (toCakeBtn) toCakeBtn.style.display = 'none';

        this.updateTimelineDisplay(1);

        this.timelineInterval = setInterval(() => {
            this.currentTimelineAge++;
            if (slider) slider.value = this.currentTimelineAge;
            this.updateTimelineDisplay(this.currentTimelineAge);

            if (this.currentTimelineAge >= 20) {
                clearInterval(this.timelineInterval);
                window.soundManager.playVictory();
                if (window.confetti) {
                    window.confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
                }
                if (toCakeBtn) {
                    toCakeBtn.style.display = 'inline-flex';
                }
            }
        }, 300);
    }

    updateTimelineDisplay(age) {
        const ageEl = document.getElementById('timeline-current-age');
        const daysEl = document.getElementById('counter-days');
        const hoursEl = document.getElementById('counter-hours');
        const storyBox = document.getElementById('timeline-story-box');

        const days = Math.round(age * 365.25);
        const hours = days * 24;

        if (ageEl) ageEl.textContent = `อายุ ${age} ขวบ ${age === 20 ? '👑🎂' : '🌸'}`;
        if (daysEl) daysEl.textContent = days.toLocaleString();
        if (hoursEl) hoursEl.textContent = hours.toLocaleString();

        if (storyBox) {
            let story = "เด็กหญิงณัสริญ กำลังเติบโตอย่างน่ารักในทุกๆ วัน ✨";
            if (age === 1) story = "🍼 เด็กหญิงตัวน้อย 'ณัสริญ มะสะ' ลืมตาดูโลก มอบรอยยิ้มแรกให้ทุกคน";
            else if (age <= 4) story = "🎀 วัยเตาะแตะ เริ่มหัดพูด แก้มกลมๆ น่ารักน่าเอ็นดูที่สุด";
            else if (age <= 7) story = "🎒 เริ่มเข้าโรงเรียน มีเพื่อนๆ และรอยยิ้มสดใสในทุกเช้า";
            else if (age <= 12) story = "📚 วัยประถมที่เปี่ยมด้วยจินตนาการและการเรียนรู้สิ่งใหม่ๆ";
            else if (age <= 15) story = "🌸 ก้าวสู่วัยรุ่น เปล่งประกาย อ่อนหวาน และน่ารักขึ้นทุกวัน";
            else if (age <= 18) story = "✨ เริ่มเติบโตสู่วัยผู้ใหญ่ เข้มแข็งและมีเส้นทางของตัวเอง";
            else if (age === 19) story = "💖 ปีสุดท้ายของวัยทีน สะสมความทรงจำและพร้อมก้าวสู่เลข 2";
            else if (age === 20) story = "👑 วันนี้... ณัสริญ มะสะ ครบรอบ 20 ปีบริบูรณ์ คนโปรดที่มีค่าที่สุดของเค้า!";

            storyBox.textContent = story;
        }

        window.soundManager.playPop(350 + age * 25);
    }

    enterWonderlandHub() {
        document.querySelectorAll('.ceremony-scene').forEach(sc => sc.style.display = 'none');

        const hub = document.getElementById('wonderland-hub');
        const bottomNav = document.getElementById('bottom-nav-bar');
        const musicBar = document.getElementById('mini-music-bar');

        if (hub) hub.classList.add('active');
        if (bottomNav) bottomNav.style.display = 'flex';
        if (musicBar) musicBar.style.display = 'flex';

        this.switchHubTab('home');

        if (window.musicController && !window.musicController.isPlaying) {
            window.musicController.start();
        }
    }

    setupHubNavigation() {
        const tabBtns = document.querySelectorAll('.nav-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchHubTab(btn.dataset.tab);
            });
        });
    }

    switchHubTab(tabName) {
        this.currentHubTab = tabName;

        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.hub-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `hub-content-${tabName}`);
        });

        window.soundManager.playPop(520);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (tabName === 'coupons' && window.scratchController) {
            window.scratchController.init();
        }
        if (tabName === 'arcade' && window.arcadeController) {
            window.arcadeController.resizeBobaCanvas();
        }
    }

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
        const emojis = ['🌸', '✨', '💖', '🤍', '🌷', '🎂', '⭐'];

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
