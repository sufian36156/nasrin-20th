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
        this.timelineAnimFrame = null;
        this.clockInterval = null;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
    }

    init() {
        this.preventIPadPinchZoom();
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
        if (window.polaroidGallery) window.polaroidGallery.init();
        if (window.videoVault) window.videoVault.init();
        if (window.vipCardController) window.vipCardController.init();
        if (window.doodleController) window.doodleController.init();
        if (window.capsuleController) window.capsuleController.init();
        if (window.realGiftController) window.realGiftController.init();
    }

    preventIPadPinchZoom() {
        // บล็อก Gesture Zoom บน iPad Safari
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());

        // บล็อกการซูมแบบ 2 นิ้ว
        document.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // บล็อกดับเบิลแท็บซูม
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    populateStaticTexts() {
        document.querySelectorAll('.target-name').forEach(el => el.textContent = window.HBD_CONFIG.fullName);
        document.querySelectorAll('.target-shortname').forEach(el => el.textContent = window.HBD_CONFIG.nickname);
        document.querySelectorAll('.target-engname').forEach(el => el.textContent = window.HBD_CONFIG.englishName);
        document.querySelectorAll('.target-age').forEach(el => el.textContent = window.HBD_CONFIG.age);

        // Easter Egg: แตะโลโก้ด้านบนเพื่อโปรยหัวใจและเสียงกรุ๊งกริ๊ง
        const badge = document.querySelector('.brand-badge');
        if (badge) {
            badge.style.cursor = 'pointer';
            badge.addEventListener('click', () => {
                window.soundManager.playChime();
                if (window.confetti) {
                    window.confetti({ particleCount: 30, spread: 60, origin: { y: 0.1 } });
                }
            });
        }
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

            const sYears = String(years).padStart(2, '0');
            const sMonths = String(months).padStart(2, '0');
            const sDays = String(days).padStart(2, '0');
            const sHours = String(hours).padStart(2, '0');
            const sMins = String(minutes).padStart(2, '0');
            const sSecs = String(seconds).padStart(2, '0');

            if (yEl) yEl.textContent = sYears;
            if (mEl) mEl.textContent = sMonths;
            if (dEl) dEl.textContent = sDays;
            if (hEl) hEl.textContent = sHours;
            if (minEl) minEl.textContent = sMins;
            if (sEl) sEl.textContent = sSecs;

            // อัปเดตนาฬิกาหัวข้อในหน้า Wonderland Hub ด้วย
            const hubY = document.getElementById('hub-clock-years');
            const hubM = document.getElementById('hub-clock-months');
            const hubD = document.getElementById('hub-clock-days');
            const hubH = document.getElementById('hub-clock-hours');
            const hubMin = document.getElementById('hub-clock-minutes');
            const hubS = document.getElementById('hub-clock-seconds');

            if (hubY) hubY.textContent = sYears;
            if (hubM) hubM.textContent = sMonths;
            if (hubD) hubD.textContent = sDays;
            if (hubH) hubH.textContent = sHours;
            if (hubMin) hubMin.textContent = sMins;
            if (hubS) hubS.textContent = sSecs;
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

        setTimeout(() => {
            try {
                this.enterWonderlandHub();
            } catch (err) {
                console.error("Error entering wonderland hub:", err);
            } finally {
                if (portalOverlay) {
                    portalOverlay.classList.remove('active');
                }
            }
            if (window.confetti) {
                window.confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
            }
        }, 1500);
    }

    setupTimelineJourney() {
        const slider = document.getElementById('timeline-age-slider');
        const replayBtn = document.getElementById('timeline-replay-btn');

        if (slider) {
            slider.setAttribute('step', '0.1');
            slider.addEventListener('input', (e) => {
                if (this.timelineAnimFrame) cancelAnimationFrame(this.timelineAnimFrame);
                const age = parseFloat(e.target.value);
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
        if (this.timelineAnimFrame) cancelAnimationFrame(this.timelineAnimFrame);

        const slider = document.getElementById('timeline-age-slider');
        const toCakeBtn = document.getElementById('milestone-to-cake-btn');
        if (toCakeBtn) toCakeBtn.style.display = 'none';

        const startAge = 1.0;
        const targetAge = 20.0;
        const duration = 4800; // 4.8 วินาที วิ่งเนียนๆ สมูทไม่กระตุก
        const startTime = performance.now();
        let lastPlayedIntAge = 1;

        this.updateTimelineDisplay(startAge);

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1.0);

            // Easing curve (ease-out cubic)
            const ease = 1 - Math.pow(1 - progress, 2.5);
            const currentAge = startAge + (targetAge - startAge) * ease;

            if (slider) slider.value = currentAge.toFixed(1);
            this.updateTimelineDisplay(currentAge);

            // ส่งเสียงน่ารักๆ เมื่อข้ามแต่ละช่วงวัย
            const currentIntAge = Math.floor(currentAge);
            if (currentIntAge > lastPlayedIntAge) {
                lastPlayedIntAge = currentIntAge;
                window.soundManager.playPop(350 + currentIntAge * 20);
            }

            if (progress < 1.0) {
                this.timelineAnimFrame = requestAnimationFrame(step);
            } else {
                this.updateTimelineDisplay(20.0);
                if (slider) slider.value = 20;
                window.soundManager.playVictory();
                if (window.confetti) {
                    window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
                }
                if (toCakeBtn) {
                    toCakeBtn.style.display = 'inline-flex';
                }
            }
        };

        this.timelineAnimFrame = requestAnimationFrame(step);

        // ให้ปุ่มแสดงชัวร์ๆ เผื่อไม่อยากรอ
        setTimeout(() => {
            if (toCakeBtn) toCakeBtn.style.display = 'inline-flex';
        }, 3500);
    }

    updateTimelineDisplay(age) {
        const ageEl = document.getElementById('timeline-current-age');
        const daysEl = document.getElementById('counter-days');
        const hoursEl = document.getElementById('counter-hours');
        const storyBox = document.getElementById('timeline-story-box');
        const toCakeBtn = document.getElementById('milestone-to-cake-btn');

        const days = Math.round(age * 365.25);
        const hours = days * 24;

        if (ageEl) {
            if (age >= 19.95) {
                ageEl.textContent = `อายุ 20 ขวบ บริบูรณ์ 👑🎂`;
            } else {
                const wholeYears = Math.floor(age);
                const extraMonths = Math.floor((age % 1) * 12);
                if (extraMonths > 0) {
                    ageEl.textContent = `อายุ ${wholeYears} ขวบ ${extraMonths} เดือน 🌸`;
                } else {
                    ageEl.textContent = `อายุ ${wholeYears} ขวบ 🌸`;
                }
            }
        }

        if (daysEl) daysEl.textContent = days.toLocaleString();
        if (hoursEl) hoursEl.textContent = hours.toLocaleString();

        if (age >= 19.9 && toCakeBtn) {
            toCakeBtn.style.display = 'inline-flex';
        }

        if (storyBox) {
            const intAge = Math.floor(age);
            let story = "เด็กหญิงณัสริญ กำลังเติบโตอย่างน่ารักในทุกๆ วัน ✨";
            if (intAge <= 1) story = "🍼 เด็กหญิงตัวน้อย 'ณัสริญ มะสะ' ลืมตาดูโลก มอบรอยยิ้มแรกให้ทุกคนในครอบครัว";
            else if (intAge <= 4) story = "🎀 วัยเตาะแตะ เริ่มหัดพูด แก้มกลมๆ น่ารักน่าเอ็นดูที่สุด";
            else if (intAge <= 7) story = "🎒 เริ่มเข้าโรงเรียน มีเพื่อนๆ และรอยยิ้มสดใสในทุกเช้า";
            else if (intAge <= 12) story = "📚 วัยประถมที่เปี่ยมด้วยจินตนาการและการเรียนรู้สิ่งใหม่ๆ";
            else if (intAge <= 15) story = "🌸 ก้าวสู่วัยรุ่น เปล่งประกาย อ่อนหวาน และน่ารักขึ้นทุกวัน";
            else if (intAge <= 18) story = "✨ เริ่มเติบโตสู่วัยผู้ใหญ่ เข้มแข็งและมีเส้นทางที่งดงามของตัวเอง";
            else if (intAge === 19) story = "💖 ปีสุดท้ายของวัยทีน สะสมความทรงจำและพร้อมก้าวสู่เลข 2 อย่างมั่นใจ";
            else if (intAge >= 20) story = "👑 วันนี้... ณัสริญ มะสะ ครบรอบ 20 ปีบริบูรณ์ คนโปรดที่มีค่าที่สุดของเค้า!";

            if (storyBox.textContent !== story) {
                storyBox.textContent = story;
            }
        }
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

        if (tabName === 'coupons') {
            if (window.scratchController) window.scratchController.init();
            if (window.doodleController) window.doodleController.resize();
        }
        if (tabName === 'arcade' && window.arcadeController) {
            window.arcadeController.resizeBobaCanvas();
        }
        if (tabName === 'gift' && window.balloonController) {
            window.balloonController.init();
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
