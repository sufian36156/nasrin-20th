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
        window.soundManager.init();
        this.isPlaying = true;
        this.step = 0;

        const bar = document.getElementById('mini-music-bar');
        const text = document.getElementById('music-title-text');
        if (bar) bar.classList.add('playing');
        if (text) text.textContent = "กำลังเล่น: เพลงรักของเรา 🎵";

        // เล่นไฟล์จริง หรือ เล่นดนตรีสังเคราะห์
        if (this.audioEl && this.hasRealAudio) {
            this.audioEl.play().catch(() => {
                this.startSynthFallback();
            });
        } else {
            this.startSynthFallback();
        }
    }

    startSynthFallback() {
        if (this.timer) clearInterval(this.timer);

        // คอร์ดโรแมนติกหวานๆ (Cmaj7 - Am7 - Dm7 - G7)
        const chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [293.66, 349.23, 440.00, 523.25], // Dm7
            [196.00, 246.94, 293.66, 349.23]  // G7
        ];

        this.timer = setInterval(() => {
            if (!this.isPlaying) return;
            const chord = chords[this.step % chords.length];
            this.playChord(chord);
            this.step++;
        }, 1600);
    }

    playChord(frequencies) {
        if (window.soundManager.isMuted) return;
        const ctx = window.soundManager.ctx;
        if (!ctx) return;

        frequencies.forEach((freq, idx) => {
            try {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.04));

                gain.gain.setValueAtTime(0.04, ctx.currentTime + (idx * 0.04));
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + (idx * 0.04));
                osc.stop(ctx.currentTime + 1.5);
            } catch (e) {}
        });
    }

    stop() {
        this.isPlaying = false;
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
