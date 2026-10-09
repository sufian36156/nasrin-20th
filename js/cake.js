/**
 * ====================================================================
 * 🎂 CAKE CONTROLLER (เป่าเทียน + ตัดเค้ก ฉบับแก้ปัญหาบน iPad 100%)
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
    }

    init() {
        this.isBlown = false;
        this.isCut = false;

        const blowBtn = document.getElementById('cake-blow-btn');
        const cutBtn = document.getElementById('cake-cut-action-btn');
        const cakeStage = document.querySelector('.cake-stage');
        const cutGuide = document.getElementById('cake-cut-guide');

        // 1. ปุ่มเป่าเทียน
        if (blowBtn) {
            blowBtn.addEventListener('click', () => {
                this.extinguishCandle();
            });
        }

        // 1.1 ปุ่มเปิด/ปิดไฟสร้างบรรยากาศ
        const ambientBtn = document.getElementById('cake-ambient-toggle-btn');
        if (ambientBtn) {
            ambientBtn.addEventListener('click', () => {
                this.toggleAmbientLight();
            });
        }

        // 2. แตะที่ตัวเค้ก/เทียนโดยตรงเพื่อเป่า
        if (cakeStage) {
            cakeStage.addEventListener('click', () => {
                if (!this.isBlown) {
                    this.extinguishCandle();
                } else if (!this.isCut) {
                    this.sliceCake();
                }
            });
        }

        // 3. ปุ่มตัดเค้กโดยตรง (ไม่พลาดแน่นอน)
        if (cutBtn) {
            cutBtn.addEventListener('click', () => {
                if (!this.isBlown) this.extinguishCandle();
                this.sliceCake();
            });
        }

        // 4. ลากนิ้วตัดเค้ก (Swipe to Cut)
        if (cutGuide) {
            this.setupKnifeDrag(cutGuide);
        }
    }

    resetAndStart() {
        this.isBlown = false;
        this.isCut = false;
        if (this.micCheckInterval) clearInterval(this.micCheckInterval);

        // จุดไฟเทียนใหม่
        document.querySelectorAll('.candle-flame').forEach(f => f.classList.remove('extinguished'));

        // ประกบซีกเค้กคืนรูป
        const leftHalf = document.getElementById('cake-half-left');
        const rightHalf = document.getElementById('cake-half-right');
        if (leftHalf) leftHalf.classList.remove('cut-left');
        if (rightHalf) rightHalf.classList.remove('cut-right');

        const instruction = document.getElementById('cake-instruction-text');
        const blowBtn = document.getElementById('cake-blow-btn');
        const cutBtn = document.getElementById('cake-cut-action-btn');
        const cutGuide = document.getElementById('cake-cut-guide');
        const celebrationCard = document.getElementById('cake-celebration-card');
        const backBtn = document.getElementById('cake-to-letter-btn');

        if (blowBtn) blowBtn.style.display = 'inline-flex';
        if (cutBtn) cutBtn.style.display = 'none';
        if (cutGuide) cutGuide.style.display = 'none';
        if (celebrationCard) celebrationCard.style.display = 'none';
        if (backBtn) {
            backBtn.style.display = 'inline-flex';
            backBtn.innerHTML = '🎡 กลับสู่ Wonderland Hub ✨';
            backBtn.onclick = () => {
                if (window.app) window.app.enterWonderlandHub();
            };
        }

        if (instruction) {
            instruction.textContent = "อธิษฐานแล้วแตะปุ่มด้านล่าง (หรือเป่าลมใส่ไมค์) เพื่อดับเทียนนะ 💨";
            instruction.style.color = "var(--primary-dark)";
        }

        this.requestMicrophone();
    }

    // ขออนุญาตใช้ไมค์
    async requestMicrophone() {
        const micBadge = document.getElementById('mic-status');
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (micBadge) micBadge.textContent = "💡 แตะปุ่ม 'เป่าเทียน' หรือแตะที่เค้กได้เลยนะ";
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioStream = stream;

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            source.connect(this.analyser);

            if (micBadge) micBadge.textContent = "🎤 ไมค์พร้อมแล้ว! ลองเป่าลมใส่ไมค์ หรือแตะที่เค้กได้เลย 💨";

            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            this.micCheckInterval = setInterval(() => {
                if (this.isBlown) {
                    clearInterval(this.micCheckInterval);
                    return;
                }

                this.analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < 20; i++) {
                    sum += dataArray[i];
                }
                const avgVolume = sum / 20;

                // ไวต่อลมเป่ามากขึ้น (เกณฑ์ 45)
                if (avgVolume > 45) {
                    this.extinguishCandle();
                }
            }, 80);

        } catch (err) {
            if (micBadge) micBadge.textContent = "💡 แตะปุ่มสีชมพูด้านล่างเพื่อเป่าเทียนได้เลยนะจ๊ะ";
        }
    }

    // ดับเทียน
    extinguishCandle() {
        if (this.isBlown) return;
        this.isBlown = true;

        if (this.micCheckInterval) clearInterval(this.micCheckInterval);
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
        }

        window.soundManager.playBlow();
        window.soundManager.playChime();

        // ดับเปลวไฟ
        document.querySelectorAll('.candle-flame').forEach(f => f.classList.add('extinguished'));

        // หากเปิดโหมดปิดไฟมืดอยู่ ให้ค่อยๆ สว่างขึ้นอย่างนุ่มนวล
        const sceneCake = document.getElementById('scene-cake');
        const ambientBtn = document.getElementById('cake-ambient-toggle-btn');
        if (sceneCake && sceneCake.classList.contains('ambient-dark-mode')) {
            setTimeout(() => {
                sceneCake.classList.remove('ambient-dark-mode');
                if (ambientBtn) {
                    ambientBtn.innerHTML = "🕯️ ปิดไฟในห้อง (บรรยากาศเป่าเค้ก)";
                    ambientBtn.classList.remove('active');
                }
            }, 700);
        }

        const instruction = document.getElementById('cake-instruction-text');
        const blowBtn = document.getElementById('cake-blow-btn');
        const cutBtn = document.getElementById('cake-cut-action-btn');
        const cutGuide = document.getElementById('cake-cut-guide');

        if (blowBtn) blowBtn.style.display = 'none';

        if (instruction) {
            instruction.textContent = "🔪 พร้อมแล้ว! กดปุ่ม 'ตัดเค้ก' หรือเอานิ้วลากผ่ากลางเค้กได้เลย!";
            instruction.style.color = "#ff5277";
        }

        if (cutBtn) cutBtn.style.display = 'inline-flex';
        if (cutGuide) cutGuide.style.display = 'block';

        if (window.confetti) {
            window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
    }

    // ลากนิ้วตัดเค้ก
    setupKnifeDrag(cutArea) {
        let isDragging = false;
        let startY = 0;

        const start = (e) => {
            if (!this.isBlown || this.isCut) return;
            isDragging = true;
            startY = e.touches ? e.touches[0].clientY : e.clientY;
        };

        const move = (e) => {
            if (!isDragging || this.isCut) return;
            const currentY = e.touches ? e.touches[0].clientY : e.clientY;
            if (Math.abs(currentY - startY) > 35) {
                this.sliceCake();
                isDragging = false;
            }
        };

        const end = () => { isDragging = false; };

        cutArea.addEventListener('pointerdown', start);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);

        cutArea.addEventListener('touchstart', start, { passive: false });
        window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('touchend', end);
    }

    // เปิด/ปิดไฟในห้องเพื่อสร้างบรรยากาศเป่าเค้ก
    toggleAmbientLight() {
        const sceneCake = document.getElementById('scene-cake');
        const ambientBtn = document.getElementById('cake-ambient-toggle-btn');
        if (!sceneCake) return;

        const isDark = sceneCake.classList.toggle('ambient-dark-mode');
        window.soundManager.playPop(isDark ? 320 : 640);

        if (ambientBtn) {
            ambientBtn.innerHTML = isDark ? "💡 เปิดไฟในห้อง" : "🕯️ ปิดไฟในห้อง (บรรยากาศเป่าเค้ก)";
            ambientBtn.classList.toggle('active', isDark);
        }
    }

    // ตัดเค้กแยก 2 ซีก
    sliceCake() {
        if (this.isCut) return;
        this.isCut = true;

        window.soundManager.playCut();
        window.soundManager.playVictory();

        const leftHalf = document.getElementById('cake-half-left');
        const rightHalf = document.getElementById('cake-half-right');
        if (leftHalf) leftHalf.classList.add('cut-left');
        if (rightHalf) rightHalf.classList.add('cut-right');

        const instruction = document.getElementById('cake-instruction-text');
        const cutBtn = document.getElementById('cake-cut-action-btn');
        const cutGuide = document.getElementById('cake-cut-guide');
        const celebrationCard = document.getElementById('cake-celebration-card');
        const toLetterBtn = document.getElementById('cake-to-letter-btn');

        if (cutBtn) cutBtn.style.display = 'none';
        if (cutGuide) cutGuide.style.display = 'none';

        if (instruction) {
            instruction.textContent = "🎉 สุขสันต์วันเกิดครบรอบ 20 ปีนะ ณัสริญ มะสะ! 🎂💖";
        }

        if (celebrationCard) celebrationCard.style.display = 'block';
        if (toLetterBtn) toLetterBtn.style.display = 'inline-flex';

        if (window.confetti) {
            window.confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
        }
    }
}

window.cakeController = new CakeController();
