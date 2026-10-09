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
        this.initPhotobooth();
        this.setupCeremonyNavigation();
        this.setupHubNavigation();
        this.setupLoveReasonsSlider();
        this.setupTimelineJourney();
        this.startLiveTickingClock();

        if (window.otpController) window.otpController.init();
        if (window.faceKYC) window.faceKYC.init();
        if (window.warpController) window.warpController.init();
        if (window.fireworksShow) window.fireworksShow.init();
        if (window.heart3D) window.heart3D.init();
        if (window.balloons3D) window.balloons3D.init();
        if (window.cinematicLetter) window.cinematicLetter.init();
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

    goToCeremonyScene(sceneId, useWarpEffect = false, warpTitle = null, warpSubtitle = null, onArrived = null) {
        if (useWarpEffect) {
            this.triggerSceneWarpTransition(sceneId, warpTitle, warpSubtitle, onArrived);
            return;
        }

        // รีเซ็ต inline style display ที่อาจติดมาจาก wonderland hub
        document.querySelectorAll('.ceremony-scene').forEach(sc => {
            sc.style.display = '';
            sc.classList.remove('active');
        });

        // หากกำลังไปที่ฉากพิธี ให้ซ่อน wonderland-hub และแถบนำทางด้านล่าง
        const hub = document.getElementById('wonderland-hub');
        const bottomNav = document.getElementById('bottom-nav-bar');
        if (hub) hub.classList.remove('active');
        if (bottomNav) bottomNav.style.display = 'none';

        const target = document.getElementById(sceneId);
        if (target) {
            target.classList.add('active');
            this.currentCeremonyStep = sceneId;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (sceneId === 'scene-cake' && window.cakeController) {
            window.cakeController.resetAndStart();
        }

        if (window.musicController) {
            if (sceneId !== 'scene-scan') {
                window.musicController.restoreVolume();
            }
            window.musicController.onSceneTransition(sceneId);
        }

        if (onArrived) onArrived();
    }

    triggerSceneWarpTransition(targetSceneId, warpTitle = null, warpSubtitle = null, onArrived = null, warpTypeOverride = null) {
        const portalOverlay = document.getElementById('portal-warp-overlay');
        const titleEl = document.getElementById('portal-warp-title');
        const subEl = document.getElementById('portal-warp-subtitle');

        const themeConfig = {
            'scene-milestone': { type: 'chrono', sound: () => window.soundManager && window.soundManager.playChime() },
            'scene-scan': { type: 'biometric', sound: () => window.soundManager && window.soundManager.playChime() },
            'scene-warp': { type: 'hyperspace', sound: () => window.soundManager && window.soundManager.playSwoosh() },
            'scene-fireworks': { type: 'supernova', sound: () => window.soundManager && window.soundManager.playFireworkWhistle ? window.soundManager.playFireworkWhistle() : window.soundManager.playSwoosh() },
            'scene-heart3d': { type: 'crystal', sound: () => window.soundManager && window.soundManager.playChime() },
            'scene-balloons': { type: 'aurora', sound: () => window.soundManager && window.soundManager.playChime() },
            'scene-letter': { type: 'parchment', sound: () => window.soundManager && window.soundManager.playChime() },
            'scene-cake': { type: 'parchment', sound: () => window.soundManager && window.soundManager.playChime() },
            'wonderland-hub': { type: 'wonderland', sound: () => window.soundManager && window.soundManager.playVictory() }
        };

        const config = themeConfig[targetSceneId] || {
            type: warpTypeOverride || 'hyperspace',
            sound: () => window.soundManager && window.soundManager.playChime()
        };

        const warpType = warpTypeOverride || config.type;

        try {
            config.sound();
        } catch (e) {}

        if (titleEl && warpTitle) titleEl.innerHTML = warpTitle;
        if (subEl && warpSubtitle) subEl.innerHTML = warpSubtitle;

        const badgeEl = document.getElementById('portal-warp-badge');
        const badgeMap = {
            'chrono': '⏳ CHRONO WARP • บันทึกกาลเวลา',
            'biometric': '🔍 BIOMETRIC SCAN • ยืนยันความน่ารัก',
            'hyperspace': '🚀 HYPERSPACE • มิติความรัก',
            'supernova': '💥 SUPERNOVA • ประกายพลุราตรี',
            'crystal': '💎 CRYSTAL PRISM • ผลึกความทรงจำ 3D',
            'aurora': '🎈 AURORA WISH • สายลมลูกโป่ง 20 ขวบ',
            'parchment': '💌 ROYAL WAX SEAL • จดหมายลับจากใจ',
            'wonderland': '🎡 WONDERLAND • สวนสนุกแห่งความสุข'
        };
        if (badgeEl) {
            badgeEl.textContent = badgeMap[warpType] || '✨ WARP TRANSITION ✨';
        }

        if (portalOverlay) {
            portalOverlay.className = `portal-warp-overlay warp-${warpType} active`;
            const fillBar = portalOverlay.querySelector('.warp-progress-fill');
            if (fillBar) {
                fillBar.style.animation = 'none';
                void fillBar.offsetWidth;
                fillBar.style.animation = '';
            }
        }

        // จังหวะเปลี่ยนฉากมิติภาพยนตร์ (Multi-Theme Cinematic Transition)
        setTimeout(() => {
            document.querySelectorAll('.ceremony-scene').forEach(sc => {
                sc.style.display = '';
                sc.classList.remove('active');
            });

            const hub = document.getElementById('wonderland-hub');
            const bottomNav = document.getElementById('bottom-nav-bar');
            if (targetSceneId !== 'wonderland-hub') {
                if (hub) hub.classList.remove('active');
                if (bottomNav) bottomNav.style.display = 'none';
            }

            const target = document.getElementById(targetSceneId);
            if (target) {
                target.classList.add('active');
                this.currentCeremonyStep = targetSceneId;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            if (targetSceneId === 'scene-cake' && window.cakeController) {
                window.cakeController.resetAndStart();
            }

            if (window.musicController) {
                if (targetSceneId !== 'scene-scan') {
                    window.musicController.restoreVolume();
                }
                window.musicController.onSceneTransition(targetSceneId);
            }

            if (onArrived) onArrived();

            // ค่อยๆ จาง Overlay ออกอย่างนุ่มนวล
            setTimeout(() => {
                if (portalOverlay) {
                    portalOverlay.classList.remove('active');
                }
            }, 550);

            if (window.confetti && (warpType === 'wonderland' || warpType === 'supernova')) {
                window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
            }
        }, 650);
    }

    setupCeremonyNavigation() {
        // จาก OTP ผ่านแล้ว ให้ไปที่ Milestone Counter (1-20 ขวบ)
        window.onOTPUnlockSuccess = () => {
            if (window.musicController) {
                window.musicController.onSceneTransition('scene-milestone');
            }
            setTimeout(() => {
                this.goToCeremonyScene('scene-milestone', true, '✨ กาลเวลาพาเราเดินทาง...', 'เข้าสู่บันทึกเส้นทางการเติบโต 🌸');
                this.startTimelineAutoPlay();
            }, 1000);
        };

        // จาก Milestone ไปที่ สแกนหน้ายืนยันตัวตน
        const toScanBtn = document.getElementById('milestone-to-scan-btn');
        if (toScanBtn) {
            toScanBtn.addEventListener('click', () => {
                window.soundManager.playSwoosh();
                this.goToCeremonyScene('scene-scan', true, '📸 ยืนยันตัวตนเจ้าของวันเกิด...', 'ระบบสแกนความน่ารัก 100% ✨', () => {
                    if (window.faceKYC) window.faceKYC.start();
                });
            });
        }
    }

    // ==========================================
    // 🌌 ประตูมิติเวทมนตร์สู่ Wonderland (WARP PORTAL)
    // ==========================================
    triggerMagicalPortalWarp() {
        this.triggerSceneWarpTransition('wonderland-hub', '✨ กำลังเปิดประตูมิติสู่โลกแห่งความสุข...', "Nasrin Masa's Wonderland 🎡", () => {
            try {
                this.enterWonderlandHub();
            } catch (err) {
                console.error("Error entering wonderland hub:", err);
            }
        }, 'wonderland');
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
        const toScanBtn = document.getElementById('milestone-to-scan-btn');
        if (toScanBtn) toScanBtn.style.display = 'none';

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
                if (toScanBtn) {
                    toScanBtn.style.display = 'inline-flex';
                }
            }
        };

        this.timelineAnimFrame = requestAnimationFrame(step);

        // ให้ปุ่มแสดงชัวร์ๆ เผื่อไม่อยากรอ
        setTimeout(() => {
            if (toScanBtn) toScanBtn.style.display = 'inline-flex';
        }, 3500);
    }

    updateTimelineDisplay(age) {
        const ageEl = document.getElementById('timeline-current-age');
        const daysEl = document.getElementById('counter-days');
        const hoursEl = document.getElementById('counter-hours');
        const storyBox = document.getElementById('timeline-story-box');
        const toScanBtn = document.getElementById('milestone-to-scan-btn');

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

        if (age >= 19.9 && toScanBtn) {
            toScanBtn.style.display = 'inline-flex';
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

        if (window.musicController) {
            window.musicController.onSceneTransition('wonderland-hub');
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

        if (tabName === 'home') {
            this.initPhotobooth();
        }
        if (tabName === 'gallery') {
            if (window.polaroidGallery) window.polaroidGallery.init();
            if (window.videoVault) window.videoVault.init();
        }
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

    initPhotobooth() {
        const frame = document.getElementById('photobooth-4cuts-frame');
        if (!frame) return;
        const slots = frame.querySelectorAll('.four-cuts-slot img');
        const photos = window.HBD_CONFIG.photoboothPhotos || [
            "assets/images/photobooth/1.jpg",
            "assets/images/photobooth/2.jpg",
            "assets/images/photobooth/3.jpg",
            "assets/images/photobooth/4.jpg"
        ];

        slots.forEach((img, idx) => {
            const desiredSrc = photos[idx] || `assets/images/photobooth/${idx + 1}.jpg`;
            const baseWithoutExt = desiredSrc.replace(/\.[^/.]+$/, "");
            const candidates = [
                desiredSrc,
                baseWithoutExt + '.jpg',
                baseWithoutExt + '.jpeg',
                baseWithoutExt + '.png',
                `assets/images/photobooth/${idx + 1}.jpg`,
                `assets/images/photobooth/${idx + 1}.jpeg`,
                `assets/images/polaroids/${idx + 1}.jpg`,
                `assets/images/polaroids/${idx + 1}.jpeg`,
                `assets/images/balloons/balloon_${idx + 1}.jpg`,
                'assets/images/polaroids/placeholder.jpg'
            ];

            img.onerror = function() {
                let currentIdx = parseInt(this.getAttribute('data-tried') || '0', 10);
                if (currentIdx < candidates.length) {
                    this.setAttribute('data-tried', currentIdx + 1);
                    this.src = candidates[currentIdx];
                } else {
                    this.onerror = null;
                    this.src = 'assets/images/polaroids/placeholder.jpg';
                }
            };
            img.src = candidates[0];
        });
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

        // โหลดรูปแฟนที่ร่วงลงมา (จากโฟลเดอร์ assets/images/falling/)
        const fallingPhotoPaths = [
            'assets/images/falling/fan_1.jpg',
            'assets/images/falling/fan_2.jpg',
            'assets/images/falling/fan_3.jpg',
            'assets/images/falling/fan_4.jpg',
            'assets/images/falling/fan_5.jpg',
            'assets/images/falling/fan_6.jpg'
        ];
        this.loadedFallingImages = [];
        fallingPhotoPaths.forEach(path => {
            const img = new Image();
            img.src = path;
            img.onload = () => {
                this.loadedFallingImages.push(img);
            };
        });

        const count = window.innerWidth > 768 ? 34 : 22;
        const emojis = ['🌸', '✨', '💖', '🤍', '🌷', '🎂', '⭐', '🎀'];

        this.particles = [];
        for (let i = 0; i < count; i++) {
            // สัดส่วน: ประมาณ 35% เป็นรูปแฟน และ 65% เป็นอิโมจิ
            const isPhoto = (i % 3 === 0);
            this.particles.push({
                isPhoto: isPhoto,
                photoIdx: Math.floor(Math.random() * fallingPhotoPaths.length),
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: isPhoto ? (17 + Math.random() * 8) : (14 + Math.random() * 12),
                speedX: -0.4 + Math.random() * 0.8,
                speedY: isPhoto ? (0.35 + Math.random() * 0.6) : (0.4 + Math.random() * 0.9),
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                opacity: isPhoto ? (0.7 + Math.random() * 0.25) : (0.25 + Math.random() * 0.45),
                angle: Math.random() * 360,
                spinSpeed: -0.8 + Math.random() * 1.6
            });
        }

        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.angle += p.spinSpeed;

                const limit = p.isPhoto ? (p.size * 2 + 10) : 30;
                if (p.y > this.canvas.height + limit) {
                    p.y = -limit;
                    p.x = Math.random() * this.canvas.width;
                    if (p.isPhoto) {
                        p.photoIdx = Math.floor(Math.random() * 10);
                    }
                }
                if (p.x > this.canvas.width + limit) p.x = -limit;
                if (p.x < -limit) p.x = this.canvas.width + limit;

                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.angle * Math.PI) / 180);
                this.ctx.globalAlpha = p.opacity;

                if (p.isPhoto && this.loadedFallingImages.length > 0) {
                    const img = this.loadedFallingImages[p.photoIdx % this.loadedFallingImages.length];
                    const r = p.size;
                    
                    // กรอบเรืองแสงสีขาว-ชมพูหวาน
                    this.ctx.shadowColor = 'rgba(255, 105, 180, 0.45)';
                    this.ctx.shadowBlur = 8;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, r + 2.5, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;

                    // คลิปเป็นวงกลมตัดขอบรูปแฟน
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
                    this.ctx.clip();
                    this.ctx.drawImage(img, -r, -r, r * 2, r * 2);
                } else {
                    // วาดอิโมจิปกติ
                    this.ctx.font = `${p.size}px serif`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(p.emoji, 0, 0);
                }
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
