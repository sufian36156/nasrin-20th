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
        this.audioEl = null;
        this.hasRealAudio = false;
    }

    init() {
        // ทดสอบโหลดไฟล์เพลงจริง assets/music/bgm.mp3
        try {
            this.audioEl = new Audio('assets/music/bgm.mp3');
            this.audioEl.loop = true;
            this.audioEl.volume = 0.7;

            this.audioEl.addEventListener('canplaythrough', () => {
                this.hasRealAudio = true;
            });

            this.audioEl.addEventListener('error', () => {
                this.hasRealAudio = false;
            });
        } catch (e) {
            this.hasRealAudio = false;
        }

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
        this.startSoft(0.65);
    }

    startCosmic(volume = 0.35) {
        window.soundManager.init();
        if (this.currentMode === 'cosmic' && this.isPlaying) return;
        this.stop();

        this.isPlaying = true;
        this.currentMode = 'cosmic';
        this.step = 0;

        const bar = document.getElementById('mini-music-bar');
        const text = document.getElementById('music-title-text');
        if (bar) {
            bar.style.display = 'flex';
            bar.classList.add('playing');
        }
        if (text) text.textContent = "🌌 Starry Cosmic Dream (เพลงค่ำคืนดวงดาว) 🎵";

        // Cosmic Synth Harmony: ดนตรีแนวฝันหวานกลางห้วงอวกาศ (Fmaj7 - Em7 - Dm7 - Cmaj7)
        this.startCosmicSynthFallback();
    }

    startWonderland(volume = 0.65) {
        window.soundManager.init();
        this.stop();

        this.isPlaying = true;
        this.currentMode = 'wonderland';
        this.step = 0;

        const bar = document.getElementById('mini-music-bar');
        const text = document.getElementById('music-title-text');
        if (bar) {
            bar.style.display = 'flex';
            bar.classList.add('playing');
        }
        if (text) text.textContent = "🎡 Wonderland Celebration 🎵";

        // เล่นไฟล์จริง หรือ เล่นดนตรีรื่นเริง
        if (this.audioEl) {
            this.audioEl.volume = volume;
            this.audioEl.play().catch(() => {
                this.startWonderlandSynth();
            });
        } else {
            this.startWonderlandSynth();
        }
    }

    startSoft(volume = 0.35) {
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

        frequencies.forEach((freq, idx) => {
            try {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.05));

                gain.gain.setValueAtTime(baseGain, ctx.currentTime + (idx * 0.05));
                gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + (idx * 0.05));
                osc.stop(ctx.currentTime + duration);
            } catch (e) {}
        });
    }

    stop() {
        this.isPlaying = false;
        this.currentMode = null;
        if (this.timer) clearInterval(this.timer);
        if (this.audioEl) {
            try { this.audioEl.pause(); } catch(e) {}
        }

        const bar = document.getElementById('mini-music-bar');
        const text = document.getElementById('music-title-text');
        if (bar) bar.classList.remove('playing');
        if (text) text.textContent = "เปิดเพลงคลอ 🎵";
    }
}

window.musicController = new MusicController();
