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

        // แสดงเนื้อความทีละตัวอักษร (Typewriter Effect) แบบเป็นจังหวะ
        let chain = Promise.resolve();

        paras.forEach((paraText, idx) => {
            chain = chain.then(() => {
                return new Promise((resolve) => {
                    const pEl = document.createElement('div');
                    pEl.className = 'letter-para shown';
                    this.paragraphsContainer.appendChild(pEl);

                    this.typewriterParagraph(pEl, paraText, () => {
                        setTimeout(resolve, 600); // หยุดพักหายใจ 0.6 วินาทีระหว่างย่อหน้า
                    });
                });
            });
        });

        // หลังจากพิมพ์ครบทุกย่อหน้า แสดงไฮไลท์และคำลงท้าย
        chain.then(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const hlEl = document.createElement('div');
                    hlEl.className = 'letter-highlight-text';
                    this.paragraphsContainer.appendChild(hlEl);
                    this.typewriterParagraph(hlEl, letterData.highlight || 'More than words can say', () => {
                        window.soundManager.playChime();
                        setTimeout(resolve, 800);
                    });
                }, 400);
            });
        }).then(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const closeEl = document.createElement('div');
                    closeEl.className = 'letter-closing-text';
                    this.paragraphsContainer.appendChild(closeEl);
                    this.typewriterParagraph(closeEl, letterData.closing || 'Happy Birthday, my love....', () => {
                        window.soundManager.playChime();
                        setTimeout(resolve, 1000);
                    });
                }, 300);
            });
        }).then(() => {
            // เผยบัตรทองคำ VIP สู่ Wonderland
            setTimeout(() => {
                if (this.goldenPassBox) {
                    this.goldenPassBox.style.display = 'block';
                    window.soundManager.playVictory();
                    if (window.confetti) {
                        window.confetti({ particleCount: 100, spread: 85, origin: { y: 0.7 } });
                    }
                }
            }, 500);
        });
    }

    typewriterParagraph(el, fullText, onDone) {
        let charIndex = 0;
        const speed = 28; // มิลลิวินาทีต่อตัวอักษร

        const typeNext = () => {
            if (charIndex < fullText.length) {
                const char = fullText.charAt(charIndex);
                if (char === '\n') {
                    el.innerHTML += '<br>';
                } else {
                    el.innerHTML += char;
                }

                // เล่นเสียงเคาะแป้นพิมพ์เบาๆ ทุกๆ 2-3 ตัวอักษร
                if (charIndex % 3 === 0 && window.soundManager.playTypewriterClick) {
                    window.soundManager.playTypewriterClick();
                }

                charIndex++;
                setTimeout(typeNext, speed);
            } else {
                if (onDone) onDone();
            }
        };

        typeNext();
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
