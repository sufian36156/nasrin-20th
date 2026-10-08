/**
 * Web Audio API Sound Synthesizer & Audio Manager
 * สังเคราะห์เสียง Effect ในตัว (Chime, Pop, Fanfare, Swoosh, Cut) ทำให้เล่นเสียงได้ทันทีไม่ต้องโหลดไฟล์ MP3 เพิ่ม
 */

class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmAudio = null;
        this.isPlayingBGM = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // เสียงกดปุ่มเบาๆ น่ารัก (Pop)
    playPop(freq = 480) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {}
    }

    // เสียงแจ้งเตือนเบาๆ เมื่อผิด (Gentle Thud / Buzzer)
    playBuzzer() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.25);

            gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.25);
        } catch (e) {}
    }

    // เสียงระฆังกรุ๊งกริ๊งหวานๆ (Chime)
    playChime() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = this.ctx.currentTime + (index * 0.08);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.15, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.4);
            });
        } catch (e) {}
    }

    // เสียงฉลองชัยชนะ (Fanfare / Unlock Victory)
    playVictory() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const melody = [
                { f: 523.25, d: 0.12 }, // C5
                { f: 659.25, d: 0.12 }, // E5
                { f: 783.99, d: 0.12 }, // G5
                { f: 1046.50, d: 0.35 } // C6
            ];
            let time = this.ctx.currentTime;
            melody.forEach((item) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(item.f, time);

                gain.gain.setValueAtTime(0.3, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + item.d);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(time);
                osc.stop(time + item.d);
                time += item.d * 0.9;
            });
        } catch (e) {}
    }

    // เสียงวืดดด เลื่อนรูป (Swoosh)
    playSwoosh() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (e) {}
    }

    // เสียงตัดเค้ก (Knife Cut)
    playCut() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(900, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.18);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.18);
        } catch (e) {}
    }

    // เสียงลมเป่าดับเทียน (Blow Puff)
    playBlow() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            // สังเคราะห์เสียงลมเบาๆ (White noise buffer)
            const bufferSize = this.ctx.sampleRate * 0.4;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.2;
            }

            const whiteNoise = this.ctx.createBufferSource();
            whiteNoise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.4);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

            whiteNoise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            whiteNoise.start();
        } catch (e) {}
    }

    // หมุนวงล้อ ติ๊กๆ (Wheel Tick)
    playTick() {
        this.playPop(850);
    }

    // เสียงลูกโป่งแตกเป๊าะสมจริง (Realistic Balloon Latex Pop with Reverb)
    playBalloonPop() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;

            // 1. Sharp snappy transient punch (ยางลูกโป่งฉีกขาดอย่างฉับพลัน)
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

            oscGain.gain.setValueAtTime(0.75, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(oscGain);
            oscGain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);

            // 2. Air release snap (เสียงลมแตกกระจาย)
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.Q.setValueAtTime(1.5, now);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.6, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);

            noise.start(now);
        } catch (e) {}
    }

    // เสียงจรวดพลุพุ่งขึ้นฟ้าหวีดหวิว (Realistic Firework Whistle/Whoosh)
    playFireworkWhistle() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.exponentialRampToValueAtTime(1600, now + 0.7);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.7);
        } catch (e) {}
    }

    // เสียงพลุระเบิดกระหึ่มกึกก้องสมจริง (Realistic Deep Low-End Fireworks Boom)
    playFireworkBoom() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;

            // 1. Sub-bass resonant impact (65Hz -> 25Hz)
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(70, now);
            osc.frequency.exponentialRampToValueAtTime(25, now + 0.9);

            oscGain.gain.setValueAtTime(0.9, now);
            oscGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.95);

            osc.connect(oscGain);
            oscGain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.95);

            // 2. White noise explosive burst with realistic lowpass shockwave
            const bufferSize = Math.floor(this.ctx.sampleRate * 1.1);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.9;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, now);
            filter.frequency.exponentialRampToValueAtTime(60, now + 1.1);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.95, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.0005, now + 1.1);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);

            noise.start(now);
        } catch (e) {}
    }

    // เสียงประกายไฟแตกเปรี๊ยะๆ ระยิบระยับ (Crackling Sparkles)
    playFireworkCrackle() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            for (let i = 0; i < 8; i++) {
                const burstTime = now + (i * 0.07) + (Math.random() * 0.03);
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1400 + Math.random() * 1200, burstTime);

                gain.gain.setValueAtTime(0.08, burstTime);
                gain.gain.exponentialRampToValueAtTime(0.0005, burstTime + 0.04);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(burstTime);
                osc.stop(burstTime + 0.04);
            }
        } catch (e) {}
    }

    // เสียงปลายปากกาหมึกซึมตวัดเขียนบนกระดาษสา (Vintage Fountain Pen on Parchment Paper)
    playTypewriterClick() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;

            // 1. White Noise Scratch: สัมผัสคมของหัวปากกากับเนื้อกระดาษ
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.12;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            // กรองความถี่เลียนแบบเสียงขีดเขียน (Bandpass 1800Hz - 3200Hz)
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2200 + Math.random() * 800, now);
            filter.Q.setValueAtTime(3.0, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.045, now);
            gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.045);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(now);
            noise.stop(now + 0.045);
        } catch (e) {}
    }

    // เสียงตราครั่งขี้ผึ้งแตกเป๊าะ (Wax Seal Snap)
    playWaxBreak() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            this.playPop(320);
            setTimeout(() => this.playPop(620), 40);
        } catch (e) {}
    }
}

window.soundManager = new SoundManager();
