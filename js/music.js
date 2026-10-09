/**
 * ====================================================================
 * 🎵 ROMANTIC BGM CONTROLLER (ระบบควบคุมเสียงดนตรีประกอบทุกหน้า)
 * ====================================================================
 * รองรับไฟล์เพลง MP3 จริงแยกแต่ละฉาก และมีระบบดนตรีสังเคราะห์สำรองอัตโนมัติ
 * พร้อมระบบจำเพลงตามหน้าที่กำลังเปิดอยู่ หากกดปิดแล้วเปิดใหม่จะเล่นเพลงเดิมของหน้านั้นเสมอ
 */

class MusicController {
    constructor() {
        this.isPlaying = false;
        this.isUserMuted = false;
        this.currentMode = null;
        this.currentAudio = null;
        this.volumeMultiplier = 1.0;
        this.baseVolume = 0.5;
        this.timer = null;
        this.step = 0;

        // คลังเพลงแยกตามแต่ละหน้า
        this.trackMap = {
            main: {
                file: 'assets/music/bgm_main.mp3',
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
            cake: {
                file: 'assets/music/bgm.mp3',
                title: '🎂 Birthday Candle Wishes (เพลงวันเกิดเค้กแสนหวาน) 🎵',
                volume: 0.50
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
        const musicBar = document.getElementById('mini-music-bar');
        if (musicBar) {
            musicBar.addEventListener('click', () => {
                this.toggle();
            });
        }

        // ปลดล็อกระบบเสียงเมื่อผู้ใช้สัมผัสหน้าจอครั้งแรก (Browser Gesture Unlock)
        const unlockAudio = () => {
            if (window.soundManager) window.soundManager.init();
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
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
            case 'scene-cake':
                return 'cake';
            case 'scene-letter':
                return 'letter';
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

        // ให้แถบเพลงแสดงเสมอเพื่อให้ผู้ใช้เห็นและควบคุมได้
        const bar = document.getElementById('mini-music-bar');
        if (bar) bar.style.display = 'flex';

        // หากผู้ใช้เคยกดปิดเพลงไว้ ไม่เล่นเอง แต่จำไว้ว่าหน้านี้คือเพลงอะไร
        if (this.isUserMuted) {
            this.currentMode = targetMode;
            if (this.currentAudio) {
                try {
                    this.currentAudio.pause();
                } catch(e) {}
                this.currentAudio = null;
            }
            return;
        }

        // ถ้าเล่นเพลงของโหมดนี้อยู่แล้ว ไม่ต้องรีสตาร์ท ปล่อยให้เล่นต่อเนื่อง
        if (this.currentMode === targetMode && this.isPlaying && this.currentAudio && !this.currentAudio.paused) {
            return;
        }

        // เปลี่ยนเพลงเป็นเพลงประจำฉากใหม่
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

    // หยุดเพลงชั่วคราว (Pause) โดยไม่ทำลายตำแหน่งและจำเพลงเดิมไว้
    pause() {
        this.isPlaying = false;
        this.isUserMuted = true;
        this.stopSynth();

        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
            } catch (e) {}
        }

        const bar = document.getElementById('mini-music-bar');
        const text = document.getElementById('music-title-text');
        if (bar) bar.classList.remove('playing');
        if (text) text.textContent = "เปิดเพลงคลอ 🎵";
    }

    // เปิดเพลงต่อ (Resume) เล่นต่อจากเพลงของหน้าที่กำลังเปิดอยู่เสมอ!
    resume() {
        this.isUserMuted = false;
        const activeSceneId = this.getCurrentActiveSceneId();
        const expectedMode = this.getSceneMode(activeSceneId);

        // ถ้ามีเพลงเดิมที่ตรงกับหน้านี้ค้างอยู่ ให้เล่นต่อจากตำแหน่งเดิมทันที
        if (this.currentAudio && this.currentMode === expectedMode) {
            this.isPlaying = true;
            this.updateBarUI(expectedMode);
            this.currentAudio.play().catch(() => {
                this.playTrack(expectedMode);
            });
        } else {
            // หากไม่มีหรือข้ามหน้ามา ให้เปิดเพลงประจำหน้านี้
            this.playTrack(expectedMode);
        }
    }

    // เริ่มเล่นเพลงในโหมดที่ระบุ
    playTrack(mode, overrideVolume = null, customFallback = null) {
        if (window.soundManager) window.soundManager.init();

        const trackInfo = this.trackMap[mode] || this.trackMap['main'];
        const volume = overrideVolume !== null ? overrideVolume : (trackInfo.volume || 0.5);
        this.baseVolume = volume;

        // หากกำลังเล่นเพลงเดียวกันอยู่แล้ว
        if (this.currentMode === mode && this.isPlaying && this.currentAudio && !this.currentAudio.paused) {
            return;
        }

        this.stopSynth();

        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } catch(e) {}
            this.currentAudio = null;
        }

        this.isPlaying = true;
        this.currentMode = mode;
        this.updateBarUI(mode);

        if (trackInfo && trackInfo.file) {
            const audio = new Audio(trackInfo.file);
            audio.loop = true;
            audio.volume = volume * (this.volumeMultiplier || 1.0);
            this.currentAudio = audio;

            const fallback = () => {
                if (customFallback) customFallback();
                else this.triggerSynthForMode(mode);
            };

            audio.onerror = () => {
                console.warn(`Could not load audio file ${trackInfo.file}, using synthesizer fallback.`);
                fallback();
            };

            const p = audio.play();
            if (p !== undefined) {
                p.catch(err => {
                    console.warn(`Playback prevented for ${mode}:`, err);
                    fallback();
                });
            }
        } else {
            if (customFallback) customFallback();
            else this.triggerSynthForMode(mode);
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

    startCake(volume = 0.50) {
        this.playTrack('cake', volume);
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

    // เบาเสียงดนตรีลงขณะพิมพ์จดหมาย
    duckVolume(duckLevel = 0.18) {
        this.volumeMultiplier = duckLevel;
        if (this.currentAudio) {
            try {
                this.currentAudio.volume = Math.max(0.03, this.baseVolume * duckLevel);
            } catch(e) {}
        }
    }

    // คืนระดับเสียงดนตรีเมื่อพิมพ์จดหมายเสร็จ
    restoreVolume() {
        this.volumeMultiplier = 1.0;
        if (this.currentAudio) {
            try {
                this.currentAudio.volume = this.baseVolume;
            } catch(e) {}
        }
    }

    // ==========================================
    // 🎹 SYNTHESIZER FALLBACK ENGINES
    // ==========================================
    triggerSynthForMode(mode) {
        switch (mode) {
            case 'fireworks':
                this.startFireworksSynth();
                break;
            case 'heart3d':
                this.startHeart3DSynth();
                break;
            case 'letter':
                this.startLetterSynth();
                break;
            case 'wonderland':
                this.startWonderlandSynth();
                break;
            case 'balloons':
            case 'cake':
            case 'main':
            default:
                this.startCosmicSynthFallback();
                break;
        }
    }

    startCosmicSynthFallback() {
        this.stopSynth();
        const chords = [
            [174.61, 261.63, 329.63, 440.00], // Fmaj7
            [164.81, 246.94, 329.63, 392.00], // Em7
            [146.83, 220.00, 261.63, 349.23], // Dm7
            [130.81, 196.00, 261.63, 329.63]  // Cmaj7
        ];
        this.timer = setInterval(() => {
            if (!this.isPlaying) return;
            const chord = chords[this.step % chords.length];
            this.playChord(chord, 'triangle', 2.4, 0.035);
            this.step++;
        }, 2200);
    }

    startFireworksSynth() {
        this.stopSynth();
        const chords = [
            [233.08, 293.66, 349.23, 440.00], // Bbmaj7
            [196.00, 233.08, 293.66, 349.23], // Gm7
            [155.56, 196.00, 233.08, 293.66], // Ebmaj7
            [174.61, 220.00, 261.63, 349.23]  // F
        ];
        this.timer = setInterval(() => {
            if (!this.isPlaying) return;
            const chord = chords[this.step % chords.length];
            this.playChord(chord, 'sine', 2.0, 0.045);
            this.step++;
        }, 1800);
    }

    startHeart3DSynth() {
        this.stopSynth();
        const chords = [
            [261.63, 329.63, 392.00, 523.25], // C
            [164.81, 246.94, 329.63, 392.00], // Em
            [174.61, 220.00, 261.63, 349.23], // F
            [196.00, 246.94, 293.66, 392.00]  // G
        ];
        this.timer = setInterval(() => {
            if (!this.isPlaying) return;
            const chord = chords[this.step % chords.length];
            this.playChord(chord, 'triangle', 1.8, 0.038);
            this.step++;
        }, 1600);
    }

    startLetterSynth() {
        this.stopSynth();
        const chords = [
            [146.83, 220.00, 277.18, 369.99], // Dmaj7
            [123.47, 185.00, 220.00, 293.66], // Bm7
            [196.00, 246.94, 293.66, 369.99], // Gmaj7
            [220.00, 277.18, 329.63, 440.00]  // A
        ];
        this.timer = setInterval(() => {
            if (!this.isPlaying) return;
            const chord = chords[this.step % chords.length];
            this.playChord(chord, 'sine', 2.2, 0.04);
            this.step++;
        }, 2000);
    }

    startWonderlandSynth() {
        this.stopSynth();
        const chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [293.66, 349.23, 440.00, 523.25], // Dm7
            [196.00, 246.94, 293.66, 349.23]  // G7
        ];
        this.timer = setInterval(() => {
            if (!this.isPlaying) return;
            const chord = chords[this.step % chords.length];
            this.playChord(chord, 'sine', 1.4, 0.05);
            this.step++;
        }, 1500);
    }

    playChord(frequencies, type = 'sine', duration = 1.6, baseGain = 0.04) {
        if (window.soundManager && window.soundManager.isMuted) return;
        const ctx = window.soundManager && window.soundManager.ctx;
        if (!ctx) return;

        const mult = (typeof this.volumeMultiplier === 'number') ? this.volumeMultiplier : 1.0;
        const actualGain = baseGain * mult;

        frequencies.forEach((freq, idx) => {
            try {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.05));

                gain.gain.setValueAtTime(actualGain, ctx.currentTime + (idx * 0.05));
                gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + (idx * 0.05));
                osc.stop(ctx.currentTime + duration);
            } catch (e) {}
        });
    }

    stopSynth() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

window.musicController = new MusicController();
