/**
 * ====================================================================
 * 🎵 ROMANTIC BGM CONTROLLER (ระบบเล่นเพลง MP3 จริง 100% ประจำแต่ละหน้า)
 * ====================================================================
 * - เล่นไฟล์เพลง MP3 จริงตามแต่ละฉาก ไม่ใช้ดนตรีสังเคราะห์
 * - ใช้ Persistent HTMLAudioElement ตัวเดิมเพื่อข้ามข้อจำกัด Autoplay ของ iPad / iOS Safari
 * - ปลดล็อกเสียงทันทีที่ผู้ใช้แตะหน้าจอครั้งแรก (หน้า OTP)
 * - มีระบบจำเพลงและเล่นต่อจากท่อนเดิมเมื่อกดปิด/เปิดใหม่
 * - รองรับการหรี่เสียงเพลงอัตโนมัติ (Duck volume) ขณะสแกนหน้า และพิมพ์จดหมาย
 */

class MusicController {
    constructor() {
        this.isPlaying = false;
        this.isUserMuted = false;
        this.currentMode = null;
        this.audio = null; // Persistent audio instance
        this.volumeMultiplier = 1.0;
        this.baseVolume = 0.5;

        // คลังเพลง MP3 จริงแยกแต่ละหน้า
        this.trackMap = {
            main: {
                file: 'assets/music/bgm.mp3',
                fallbackFile: 'assets/music/bgm_main.mp3',
                title: '🌸 Nostalgic Journey (เพลงการเดินทาง) 🎵',
                volume: 0.45
            },
            fireworks: {
                file: 'assets/music/bgm_fireworks.mp3',
                title: '🎆 Fireworks Grand Night (เพลงพลุราตรีตระการตา) 🎵',
                volume: 0.55
            },
            heart3d: {
                file: 'assets/music/bgm_heart3d.mp3',
                title: '💎 Memory Waltz 3D (เพลงวอลซ์แห่งความทรงจำ) 🎵',
                volume: 0.48
            },
            balloons: {
                file: 'assets/music/bgm_balloons.mp3',
                title: '🎈 Balloons In The Sky (เพลงปล่อยลูกโป่ง 20 ปี) 🎵',
                volume: 0.48
            },
            letter: {
                file: 'assets/music/bgm_letter.mp3',
                title: '💌 Letter From The Heart (บทเพลงจดหมายจากใจ) 🎵',
                volume: 0.42
            },
            wonderland: {
                file: 'assets/music/bgm_wonderland.mp3',
                title: '🎡 Wonderland Celebration (เพลงเฉลิมฉลอง) 🎵',
                volume: 0.55
            }
        };
    }

    init() {
        // สร้าง Persistent Audio Element ตั้งแต่ต้น
        if (!this.audio) {
            this.audio = new Audio();
            this.audio.loop = true;
            this.audio.preload = 'auto';
        }

        const musicBar = document.getElementById('mini-music-bar');
        if (musicBar) {
            musicBar.addEventListener('click', () => {
                this.toggle();
            });
        }

        // ปลดล็อกระบบเสียงทันทีที่ผู้ใช้แตะหน้าจอครั้งแรก (หน้า OTP)
        const startOnFirstGesture = () => {
            if (window.soundManager) window.soundManager.init();

            if (!this.isPlaying && !this.isUserMuted) {
                const activeScene = this.getCurrentActiveSceneId();
                const mode = this.getSceneMode(activeScene);
                this.playTrack(mode);
            }

            document.removeEventListener('click', startOnFirstGesture);
            document.removeEventListener('touchstart', startOnFirstGesture);
            document.removeEventListener('keydown', startOnFirstGesture);
        };

        document.addEventListener('click', startOnFirstGesture, { passive: true });
        document.addEventListener('touchstart', startOnFirstGesture, { passive: true });
        document.addEventListener('keydown', startOnFirstGesture, { passive: true });
    }

    // แปลง Scene ID เป็น Mode เพลงประจำหน้านั้นๆ
    getSceneMode(sceneId) {
        if (!sceneId) return 'main';
        switch (sceneId) {
            case 'scene-otp':
            case 'scene-milestone':
            case 'scene-scan':
            case 'scene-warp':
                return 'main';
            case 'scene-fireworks':
                return 'fireworks';
            case 'scene-heart3d':
                return 'heart3d';
            case 'scene-balloons':
                return 'balloons';
            case 'scene-letter':
                return 'letter';
            case 'scene-cake':
            case 'wonderland-hub':
                return 'wonderland';
            default:
                return 'main';
        }
    }

    // ตรวจสอบว่าขณะนี้ผู้ใช้อยู่ที่หน้าไหน
    getCurrentActiveSceneId() {
        const hub = document.getElementById('wonderland-hub');
        if (hub && hub.classList.contains('active')) {
            return 'wonderland-hub';
        }
        const activeCeremony = document.querySelector('.ceremony-scene.active');
        if (activeCeremony) {
            return activeCeremony.id;
        }
        if (window.app && window.app.currentCeremonyStep) {
            return window.app.currentCeremonyStep;
        }
        return 'scene-otp';
    }

    // จัดการเปลี่ยนเพลงอัตโนมัติเมื่อย้ายหน้า
    onSceneTransition(sceneId) {
        const targetMode = this.getSceneMode(sceneId);

        // แสดงแถบเพลงเสมอเพื่อให้ผู้ใช้เห็นและควบคุมได้
        const bar = document.getElementById('mini-music-bar');
        if (bar) bar.style.display = 'flex';

        // หากผู้ใช้เคยกดปิดเพลงไว้ ไม่เล่นเอง แต่จำไว้ว่าหน้านี้คือเพลงอะไร
        if (this.isUserMuted) {
            this.currentMode = targetMode;
            if (this.audio) {
                try { this.audio.pause(); } catch(e) {}
            }
            return;
        }

        // ถ้าเล่นเพลงของโหมดนี้อยู่แล้ว ไม่ต้องรีสตาร์ท ปล่อยให้เล่นต่อเนื่อง
        if (this.currentMode === targetMode && this.isPlaying && this.audio && !this.audio.paused) {
            return;
        }

        // เปลี่ยนเพลงเป็นเพลง MP3 ประจำฉากใหม่
        this.playTrack(targetMode);
    }

    // สลับเปิด / ปิดเพลง
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.resume();
        }
    }

    // หยุดเพลงชั่วคราว (Pause) โดยจำเพลงเดิมและท่อนเดิมไว้
    pause() {
        this.isPlaying = false;
        this.isUserMuted = true;

        if (this.audio) {
            try { this.audio.pause(); } catch (e) {}
        }

        const bar = document.getElementById('mini-music-bar');
        const text = document.getElementById('music-title-text');
        if (bar) bar.classList.remove('playing');
        if (text) text.textContent = "เปิดเพลงคลอ 🎵";
    }

    // เปิดเพลงต่อ (Resume) เล่นต่อจากเพลงของหน้าที่กำลังเปิดอยู่เสมอ
    resume() {
        this.isUserMuted = false;
        const activeSceneId = this.getCurrentActiveSceneId();
        const expectedMode = this.getSceneMode(activeSceneId);

        // ถ้ามีเพลงเดิมที่ตรงกับหน้านี้ค้างอยู่ ให้เล่นต่อจากตำแหน่งเดิมทันที
        if (this.audio && this.currentMode === expectedMode) {
            this.isPlaying = true;
            this.updateBarUI(expectedMode);
            this.audio.play().catch(() => {
                this.playTrack(expectedMode);
            });
        } else {
            // หากไม่มีหรือข้ามหน้ามา ให้เปิดเพลงประจำหน้านี้
            this.playTrack(expectedMode);
        }
    }

    // เริ่มเล่นเพลง MP3 จริงในโหมดที่ระบุ (ไม่ใช้ดนตรีสังเคราะห์ใดๆ)
    playTrack(mode, overrideVolume = null) {
        if (window.soundManager) window.soundManager.init();

        const trackInfo = this.trackMap[mode] || this.trackMap['main'];
        const volume = overrideVolume !== null ? overrideVolume : (trackInfo.volume || 0.5);
        this.baseVolume = volume;

        // หากกำลังเล่นเพลงเดียวกันอยู่แล้ว
        if (this.currentMode === mode && this.isPlaying && this.audio && !this.audio.paused) {
            return;
        }

        if (!this.audio) {
            this.audio = new Audio();
            this.audio.loop = true;
        }

        this.isPlaying = true;
        this.currentMode = mode;
        this.updateBarUI(mode);

        const targetSrc = trackInfo.file;
        const calculatedVolume = Math.min(1.0, Math.max(0.01, volume * (this.volumeMultiplier || 1.0)));

        // ตั้งค่าเสียงและเล่นไฟล์ MP3 จริง
        try {
            this.audio.volume = calculatedVolume;
            this.audio.src = targetSrc;
            this.audio.currentTime = 0;

            this.audio.onerror = () => {
                // หากไฟล์หลักโหลดไม่ติด ลองใช้ไฟล์สำรอง (ถ้ามี)
                if (trackInfo.fallbackFile && this.audio.src !== trackInfo.fallbackFile) {
                    console.log(`Trying fallback track: ${trackInfo.fallbackFile}`);
                    this.audio.src = trackInfo.fallbackFile;
                    this.audio.play().catch(e => console.warn("Fallback play error:", e));
                }
            };

            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn(`Autoplay prevented for ${targetSrc}:`, err);
                });
            }
        } catch (err) {
            console.error("Audio playback error:", err);
        }
    }

    // อัปเดต UI แถบเพลงด้านบน
    updateBarUI(mode) {
        const bar = document.getElementById('mini-music-bar');
        const text = document.getElementById('music-title-text');
        const trackInfo = this.trackMap[mode] || this.trackMap['main'];
        if (bar) {
            bar.style.display = 'flex';
            bar.classList.add('playing');
        }
        if (text && trackInfo) {
            text.textContent = trackInfo.title;
        }
    }

    // Helper functions สำหรับเรียกใช้
    startCosmic(volume = 0.45) {
        this.playTrack('main', volume);
    }

    startFireworks(volume = 0.55) {
        this.playTrack('fireworks', volume);
    }

    startHeart3D(volume = 0.48) {
        this.playTrack('heart3d', volume);
    }

    startBalloons(volume = 0.48) {
        this.playTrack('balloons', volume);
    }

    startLetterMusic(volume = 0.42) {
        this.playTrack('letter', volume);
    }

    startWonderland(volume = 0.55) {
        this.playTrack('wonderland', volume);
    }

    startSoft(volume = 0.45) {
        this.resume();
    }

    start(volume = 0.5) {
        this.resume();
    }

    stop() {
        this.pause();
    }

    // เบาเสียงดนตรีลงเหลือแผ่วๆ ขณะสแกนหน้า หรือพิมพ์จดหมาย
    duckVolume(duckLevel = 0.18) {
        this.volumeMultiplier = duckLevel;
        if (this.audio) {
            try {
                this.audio.volume = Math.max(0.03, this.baseVolume * duckLevel);
            } catch(e) {}
        }
    }

    // คืนระดับเสียงดนตรีกลับมาเป็นปกติ
    restoreVolume() {
        this.volumeMultiplier = 1.0;
        if (this.audio) {
            try {
                this.audio.volume = this.baseVolume;
            } catch(e) {}
        }
    }
}

window.musicController = new MusicController();
