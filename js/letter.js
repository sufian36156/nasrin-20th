/**
 * ====================================================================
 * 💌 CINEMATIC ROYAL LETTER CONTROLLER (จดหมายหรูหรา กว้างสมส่วน & บัตรทอง VIP)
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
        this.envelopeBox = document.getElementById('royal-envelope-box');
        this.parchmentLetter = document.getElementById('royal-parchment');
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

        if (this.waxSealBtn) {
            this.waxSealBtn.style.transform = 'scale(1)';
            this.waxSealBtn.style.opacity = '1';
        }
    }

    openEnvelope() {
        if (this.isOpen) return;
        this.isOpen = true;

        window.soundManager.playPop(820);
        window.soundManager.playVictory();

        if (window.confetti) {
            window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
        }

        // เอฟเฟกต์ตราครั่งขี้ผึ้งแตกออก
        if (this.waxSealBtn) {
            this.waxSealBtn.style.transform = 'scale(0.3) rotate(35deg)';
            this.waxSealBtn.style.opacity = '0';
        }

        setTimeout(() => {
            if (this.envelopeBox) this.envelopeBox.style.display = 'none';
            if (this.parchmentLetter) this.parchmentLetter.style.display = 'block';

            this.renderLetterContent();
        }, 550);
    }

    renderLetterContent() {
        const letterData = window.HBD_CONFIG.letterContent || {};
        const paras = letterData.paragraphs || [];

        this.paragraphsContainer.innerHTML = '';

        // แถบหัวจดหมายหรูหรา
        const headerBand = document.createElement('div');
        headerBand.className = 'letter-header-band';
        headerBand.innerHTML = `
            <div class="letter-header-to">${letterData.to || 'แด่ ณัสริญ มะสะ (Nasrin Masa)'}</div>
            <div class="letter-header-date">10 ตุลาคม 2026 • 20th Anniversary</div>
        `;
        this.paragraphsContainer.appendChild(headerBand);

        let delay = 500;

        // แสดงเนื้อความทีละวรรคอย่างนุ่มนวล
        paras.forEach((paraText, idx) => {
            setTimeout(() => {
                const pEl = document.createElement('div');
                pEl.className = 'letter-para';
                pEl.innerHTML = paraText.replace(/\n/g, '<br>');
                this.paragraphsContainer.appendChild(pEl);

                window.soundManager.playPop(420 + idx * 35);

                setTimeout(() => {
                    pEl.classList.add('shown');
                }, 50);
            }, delay);

            delay += 2300;
        });

        // แสดงไฮไลท์ "More than words can say"
        setTimeout(() => {
            const hlEl = document.createElement('div');
            hlEl.className = 'letter-highlight-text';
            hlEl.textContent = letterData.highlight || 'More than words can say';
            this.paragraphsContainer.appendChild(hlEl);
            window.soundManager.playChime();
        }, delay);

        delay += 1900;

        // แสดงคำลงท้าย "Happy Birthday, my love...."
        setTimeout(() => {
            const closeEl = document.createElement('div');
            closeEl.className = 'letter-closing-text';
            closeEl.textContent = letterData.closing || 'Happy Birthday, my love....';
            this.paragraphsContainer.appendChild(closeEl);
            window.soundManager.playChime();
        }, delay);

        delay += 2100;

        // เผยบัตรทองคำ VIP สู่ Wonderland
        setTimeout(() => {
            if (this.goldenPassBox) {
                this.goldenPassBox.style.display = 'block';
                window.soundManager.playVictory();
                if (window.confetti) {
                    window.confetti({ particleCount: 100, spread: 85, origin: { y: 0.7 } });
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
