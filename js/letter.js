/**
 * ====================================================================
 * 💌 CINEMATIC LETTER & GOLDEN TICKET CONTROLLER (จดหมายเปิดผนึก & บัตรทอง)
 * ====================================================================
 */

class CinematicLetterController {
    constructor() {
        this.waxSealBtn = null;
        this.envelopeBox = null;
        this.parchmentLetter = null;
        this.paragraphsContainer = null;
        this.goldenPassBox = null;
        this.goldenTicketBtn = null;
        this.isOpen = false;
    }

    init() {
        this.waxSealBtn = document.getElementById('wax-seal-btn');
        this.envelopeBox = document.getElementById('vintage-envelope-box');
        this.parchmentLetter = document.getElementById('parchment-letter');
        this.paragraphsContainer = document.getElementById('letter-paragraphs-container');
        this.goldenPassBox = document.getElementById('golden-pass-box');
        this.goldenTicketBtn = document.getElementById('golden-ticket-vip');

        if (this.waxSealBtn) {
            this.waxSealBtn.addEventListener('click', () => {
                this.openEnvelope();
            });
        }

        if (this.goldenTicketBtn) {
            this.goldenTicketBtn.addEventListener('click', () => {
                this.enterWonderland();
            });
        }
    }

    start() {
        this.isOpen = false;
        if (this.envelopeBox) this.envelopeBox.style.display = 'flex';
        if (this.parchmentLetter) this.parchmentLetter.style.display = 'none';
        if (this.goldenPassBox) this.goldenPassBox.style.display = 'none';
        if (this.paragraphsContainer) this.paragraphsContainer.innerHTML = '';
    }

    openEnvelope() {
        if (this.isOpen) return;
        this.isOpen = true;

        window.soundManager.playPop(800);
        window.soundManager.playVictory();

        if (window.confetti) {
            window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        }

        // เอฟเฟกต์ครั่งแตก
        if (this.waxSealBtn) {
            this.waxSealBtn.style.transform = 'scale(0.3) rotate(30deg)';
            this.waxSealBtn.style.opacity = '0';
        }

        setTimeout(() => {
            if (this.envelopeBox) this.envelopeBox.style.display = 'none';
            if (this.parchmentLetter) this.parchmentLetter.style.display = 'block';

            this.renderLetterContent();
        }, 600);
    }

    renderLetterContent() {
        const letterData = window.HBD_CONFIG.letterContent || {};
        const paras = letterData.paragraphs || [];

        this.paragraphsContainer.innerHTML = '';

        // แสดงหัวจดหมาย
        const headerEl = document.createElement('div');
        headerEl.className = 'letter-recipient-title';
        headerEl.textContent = letterData.to || 'แด่ ณัสริญ มะสะ (Nasrin Masa)';
        this.paragraphsContainer.appendChild(headerEl);

        let delay = 600;

        // แสดงทีละวรรคอย่างนุ่มนวล
        paras.forEach((paraText, idx) => {
            setTimeout(() => {
                const pEl = document.createElement('div');
                pEl.className = 'letter-para';
                pEl.innerHTML = paraText.replace(/\n/g, '<br>');
                this.paragraphsContainer.appendChild(pEl);

                window.soundManager.playPop(450 + idx * 40);

                setTimeout(() => {
                    pEl.classList.add('shown');
                }, 50);
            }, delay);

            delay += 2200; // จังหวะเว้นวรรคให้อ่านอย่างซึ้งใจ
        });

        // แสดงไฮไลท์ "More than words can say"
        setTimeout(() => {
            const hlEl = document.createElement('div');
            hlEl.className = 'letter-highlight-text';
            hlEl.textContent = letterData.highlight || 'More than words can say';
            this.paragraphsContainer.appendChild(hlEl);
            window.soundManager.playChime();
        }, delay);

        delay += 1800;

        // แสดงคำลงท้าย "Happy Birthday, my love...."
        setTimeout(() => {
            const closeEl = document.createElement('div');
            closeEl.className = 'letter-closing-text';
            closeEl.textContent = letterData.closing || 'Happy Birthday, my love....';
            this.paragraphsContainer.appendChild(closeEl);
            window.soundManager.playChime();
        }, delay);

        delay += 2000;

        // เผยบัตรทองคำ VIP สู่ Wonderland
        setTimeout(() => {
            if (this.goldenPassBox) {
                this.goldenPassBox.style.display = 'block';
                window.soundManager.playVictory();
                if (window.confetti) {
                    window.confetti({ particleCount: 90, spread: 80, origin: { y: 0.7 } });
                }
            }
        }, delay);
    }

    enterWonderland() {
        window.soundManager.playVictory();
        window.soundManager.playChime();

        if (window.app) {
            window.app.triggerMagicalPortalWarp();
        }
    }
}

window.cinematicLetter = new CinematicLetterController();
