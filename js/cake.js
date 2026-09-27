/**
 * ====================================================================
 * 🎂 CAKE CONTROLLER (เป่าเทียนด้วยไมค์ + ลากมีดตัดเค้ก)
 * ====================================================================
 */

class CakeController {
    constructor() {
        this.isBlown = false;
        this.isCut = false;
        this.audioStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.micCheckInterval = null;

        // Cutting swipe state
        this.isDraggingCut = false;
        this.cutStartX = 0;
        this.cutStartY = 0;
    }

    init() {
        this.isBlown = false;
        this.isCut = false;

        const blowBtn = document.getElementById('cake-blow-btn');
        const cutGuide = document.getElementById('cake-cut-guide');

        if (blowBtn) {
            blowBtn.addEventListener('click', () => {
                this.extinguishCandle();
            });
        }

        if (cutGuide) {
            this.setupKnifeDrag(cutGuide);
        }
    }

    // ขออนุญาตใช้ไมค์เพื่อตรวจจับลมเป่า
    async requestMicrophone() {
        const micBadge = document.getElementById('mic-status');
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (micBadge) micBadge.textContent = "💡 กดปุ่มด้านล่างเพื่อเป่าเทียนได้เลยนะ";
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioStream = stream;

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 512;
            source.connect(this.analyser);

            if (micBadge) micBadge.textContent = "🎤 พร้อมแล้ว! ลองเป่าลมใส่ไมค์ได้เลย 💨";

            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            this.micCheckInterval = setInterval(() => {
                if (this.isBlown) {
                    clearInterval(this.micCheckInterval);
                    return;
                }

                this.analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < 40; i++) {
                    sum += dataArray[i];
                }
                const avgVolume = sum / 40;

                if (avgVolume > 65) {
                    this.extinguishCandle();
                }
            }, 100);

        } catch (err) {
            if (micBadge) micBadge.textContent = "💡 แตะปุ่มด้านล่างเพื่อเป่าเทียนได้เลยนะจ๊ะ";
        }
    }

    extinguishCandle() {
        if (this.isBlown) return;
        this.isBlown = true;

        if (this.micCheckInterval) clearInterval(this.micCheckInterval);
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
        }

        window.soundManager.playBlow();
        window.soundManager.playChime();

        // ซ่อนเปลวไฟ
        document.querySelectorAll('.candle-flame').forEach(f => f.classList.add('extinguished'));

        const instruction = document.getElementById('cake-instruction-text');
        const blowBtn = document.getElementById('cake-blow-btn');
        const cutGuide = document.getElementById('cake-cut-guide');

        if (blowBtn) blowBtn.style.display = 'none';

        if (instruction) {
            instruction.textContent = "🔪 ใช้มีด (ลากนิ้วหรือเมาส์ผ่ากลางเค้ก) เพื่อตัดเค้กกัน!";
            instruction.style.color = "#ff5277";
        }

        if (cutGuide) {
            cutGuide.style.display = 'block';
        }
    }

    setupKnifeDrag(cutArea) {
        const onStart = (e) => {
            if (!this.isBlown || this.isCut) return;
            this.isDraggingCut = true;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            this.cutStartX = clientX;
            this.cutStartY = clientY;
        };

        const onMove = (e) => {
            if (!this.isDraggingCut || this.isCut) return;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            const distanceX = Math.abs(clientX - this.cutStartX);
            const distanceY = Math.abs(clientY - this.cutStartY);

            if (distanceY > 60 || distanceX > 70) {
                this.sliceCake();
            }
        };

        const onEnd = () => {
            this.isDraggingCut = false;
        };

        cutArea.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        cutArea.addEventListener('touchstart', onStart, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd);
    }

    sliceCake() {
        if (this.isCut) return;
        this.isCut = true;
        this.isDraggingCut = false;

        window.soundManager.playCut();
        window.soundManager.playVictory();

        const leftHalf = document.getElementById('cake-half-left');
        const rightHalf = document.getElementById('cake-half-right');
        if (leftHalf) leftHalf.classList.add('cut-left');
        if (rightHalf) rightHalf.classList.add('cut-right');

        const instruction = document.getElementById('cake-instruction-text');
        const celebrationCard = document.getElementById('cake-celebration-card');
        const toLetterBtn = document.getElementById('cake-to-letter-btn');

        if (instruction) {
            instruction.textContent = "🎉 สุขสันต์วันเกิดครบรอบ 20 ปีนะเนสริน! 🎂💖";
        }

        if (celebrationCard) {
            celebrationCard.style.display = 'block';
        }

        if (toLetterBtn) {
            toLetterBtn.style.display = 'inline-flex';
        }

        if (window.confetti) {
            window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        }
    }
}

window.cakeController = new CakeController();
