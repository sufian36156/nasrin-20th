/**
 * ====================================================================
 * 🎵 ROMANTIC BGM CONTROLLER (รองรับ MP3 จริง + สำรอง Synthesizer)
 * ====================================================================
 * หากใส่ไฟล์เพลงจริงที่ assets/music/bgm.mp3 จะเล่นเพลงจริงทันที
 * หากยังไม่ได้ใส่ จะเล่นเสียงดนตรีสังเคราะห์ Lo-Fi Chords สุดละมุนโดยอัตโนมัติ
 */

class MusicController {
    constructor() {
        this.isPlaying = false;
        this.timer = null;
        this.step = 0;
        this.currentAudio = null;
        this.currentMode = null;
        this.volumeMultiplier = 1.0;
        this.baseVolume = 0.5;
        this.trackMap = {
            main: { file: 'assets/music/bgm_main.mp3', title: '🌸 Nostalgic Journey (เพลงการเดินทาง) 🎵' },
            fireworks: { file: 'assets/music/bgm_fireworks.mp3', title: '🎆 Fireworks Grand Night (เพลงพลุราตรีตระการตา) 🎵' },
            heart3d: { file: 'assets/music/bgm_heart3d.mp3', title: '💎 Memory Waltz 3D (เพลงวอลซ์แห่งความทรงจำ) 🎵' },
            balloons: { file: 'assets/music/bgm_balloons.mp3', title: '🎈 Balloons In The Sky (เพลงปล่อยลูกโป่ง 20 ปี) 🎵' },
            letter: { file: 'assets/music/bgm_letter.mp3', title: '💌 Letter From The Heart (บทเพลงจดหมายจากใจ) 🎵' },
            wonderland: { file: 'assets/music/bgm_wonderland.mp3', title: '🎡 Wonderland Celebration (เพลงเฉลิมฉลอง) 🎵' }
        };
    }

    init() {
        const musicBar = document.getElementById('mini-music-bar');
        if (musicBar) {
            musicBar.addEventListener('click', () => {
                this.toggle();
            });
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        this.startSoft(0.5);
    }

    playTrack(mode, defaultVolume = 0.5, synthFallback = null) {
        window.soundManager.init();
        if (this.currentMode === mode && this.isPlaying) return;
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
        this.baseVolume = defaultVolume;

        const trackInfo = this.trackMap[mode];
        const bar = document.getElementById('mini-music-bar');
        const text = document.getElementById('music-title-text');
        if (bar) {
            bar.style.display = 'flex';
            bar.classList.add('playing');
        }
        if (text && trackInfo) {
            text.textContent = trackInfo.title;
        }

        if (trackInfo && trackInfo.file) {
            const audio = new Audio(trackInfo.file);
            audio.loop = true;
            audio.volume = defaultVolume * (this.volumeMultiplier || 1.0);
            this.currentAudio = audio;

            audio.play().catch(() => {
                if (synthFallback) synthFallback();
            });
        } else {
            if (synthFallback) synthFallback();
        }
    }

    startCosmic(volume = 0.45) {
        this.playTrack('main', volume, () => this.startCosmicSynthFallback());
    }

    startFireworks(volume = 0.55) {
        this.playTrack('fireworks', volume, () => this.startFireworksSynth());
    }

    startHeart3D(volume = 0.48) {
        this.playTrack('heart3d', volume, () => this.startHeart3DSynth());
    }

    startBalloons(volume = 0.5) {
        this.playTrack('balloons', volume, () => this.startCosmicSynthFallback());
    }

    startLetterMusic(volume = 0.42) {
        this.playTrack('letter', volume, () => this.startLetterSynth());
    }

    // เบาเสียงดนตรีลงเหลือแค่แผ่วๆ ขณะที่จดหมายกำลังพิมพ์
    duckVolume(duckLevel = 0.18) {
        this.volumeMultiplier = duckLevel;
        if (this.currentAudio) {
            try {
                this.currentAudio.volume = Math.max(0.04, this.baseVolume * duckLevel);
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

    startWonderland(volume = 0.6) {
        this.playTrack('wonderland', volume, () => this.startWonderlandSynth());
    }

    startSoft(volume = 0.45) {
        this.startCosmic(volume);
    }

    startCosmicSynthFallback() {
        if (this.timer) clearInterval(this.timer);

        // คอร์ดนุ่มนวลอบอุ่น สไตล์อวกาศโรแมนติก
        const chords = [
            [174.61, 261.63, 329.63, 440.00], // Fmaj7 (deep warm)
            [164.81, 246.94, 329.63, 392.00], // Em7
            [146.83, 220.00, 261.63, 349.23], // Dm7
            [130.81, 196.00, 261.63, 329.63]  // Cmaj7
        ];

        this.timer = setInterval(() => {
            if (!this.isPlaying || this.currentMode !== 'cosmic') return;
            const chord = chords[this.step % chords.length];
            this.playChord(chord, 'triangle', 2.4, 0.035);
            this.step++;
        }, 2200);
    }

    startFireworksSynth() {
        if (this.timer) clearInterval(this.timer);

        // คอร์ดพลุราตรี: อลังการ กว้างลึก ประทับใจ (Bbmaj7 - Gm7 - Ebmaj7 - F)
        const chords = [
            [233.08, 293.66, 349.23, 440.00], // Bbmaj7
            [196.00, 233.08, 293.66, 349.23], // Gm7
            [155.56, 196.00, 233.08, 293.66], // Ebmaj7
            [174.61, 220.00, 261.63, 349.23]  // F
        ];

        this.timer = setInterval(() => {
            if (!this.isPlaying || this.currentMode !== 'fireworks') return;
            const chord = chords[this.step % chords.length];
            this.playChord(chord, 'sine', 2.0, 0.045);
            this.step++;
        }, 1800);
    }

    startHeart3DSynth() {
        if (this.timer) clearInterval(this.timer);

        // คอร์ด Memory Waltz: หวานละมุน อบอุ่น หมุนวนเหมือนกล่องดนตรี (C - Em - F - G)
        const chords = [
            [261.63, 329.63, 392.00, 523.25], // C
            [164.81, 246.94, 329.63, 392.00], // Em
            [174.61, 220.00, 261.63, 349.23], // F
            [196.00, 246.94, 293.66, 392.00]  // G
        ];

        this.timer = setInterval(() => {
            if (!this.isPlaying || this.currentMode !== 'heart3d') return;
            const chord = chords[this.step % chords.length];
            // เสียงระฆังกล่องดนตรีผสมคอร์ดนุ่ม
            this.playChord(chord, 'triangle', 1.8, 0.038);
            this.step++;
        }, 1600);
    }

    startLetterSynth() {
        if (this.timer) clearInterval(this.timer);

        // คอร์ด Letter From The Heart: อบอุ่น ลึกซึ้ง ตราตรึงใจ (Dmaj7 - Bm7 - Gmaj7 - A)
        const chords = [
            [146.83, 220.00, 277.18, 369.99], // Dmaj7
            [123.47, 185.00, 220.00, 293.66], // Bm7
            [196.00, 246.94, 293.66, 369.99], // Gmaj7
            [220.00, 277.18, 329.63, 440.00]  // A
        ];

        this.timer = setInterval(() => {
            if (!this.isPlaying || this.currentMode !== 'letter') return;
            const chord = chords[this.step % chords.length];
            this.playChord(chord, 'sine', 2.2, 0.04);
            this.step++;
        }, 2000);
    }

    startWonderlandSynth() {
        if (this.timer) clearInterval(this.timer);

        // คอร์ดรื่นเริงสดใส (Cmaj7 - Am7 - Dm7 - G7) จังหวะสนุก
        const chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [293.66, 349.23, 440.00, 523.25], // Dm7
            [196.00, 246.94, 293.66, 349.23]  // G7
        ];

        this.timer = setInterval(() => {
            if (!this.isPlaying || this.currentMode !== 'wonderland') return;
            const chord = chords[this.step % chords.length];
            this.playChord(chord, 'sine', 1.4, 0.05);
            this.step++;
        }, 1500);
    }

    playChord(frequencies, type = 'sine', duration = 1.6, baseGain = 0.04) {
        if (window.soundManager.isMuted) return;
        const ctx = window.soundManager.ctx;
        if (!ctx) return;

        // คำนวณความดังโดยคูณด้วย volumeMultiplier (เบาเสียงขณะพิมพ์จดหมาย)
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

    stop() {
        this.isPlaying = false;
        this.currentMode = null;
        this.stopSynth();
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } catch(e) {}
            this.currentAudio = null;
        }

        const bar = document.getElementById('mini-music-bar');
        const text = document.getElementById('music-title-text');
        if (bar) bar.classList.remove('playing');
        if (text) text.textContent = "เปิดเพลงคลอ 🎵";
    }
}

window.musicController = new MusicController();
