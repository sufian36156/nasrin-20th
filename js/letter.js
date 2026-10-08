/**
 * ====================================================================
 * 💌 CUTE DEEP-PINK INTERACTIVE LETTER CONTROLLER
 * (ซองชมพูเข้ม • สติกเกอร์รูดฉีก • ดึงจดหมายออก • พิมพ์ทีละคำจังหวะละมุน)
 * ====================================================================
 */

class CinematicLetterController {
    constructor() {
        this.envelopeStage = null;
        this.pinkEnvelope = null;
        this.stickerStrip = null;
        this.stickerThumb = null;
        this.stickerTrackFill = null;
        this.letterInsert = null;
        this.guidePill = null;
        this.parchmentLetter = null;
        this.paragraphsContainer = null;
        this.goldenPassBox = null;
        this.goldenTicketBtn = null;

        this.isOpen = false;
        this.isTorn = false;
        this.isDraggingSticker = false;
        this.stickerStartX = 0;
        this.currentStickerProgress = 0;
    }

    init() {
        this.envelopeStage = document.getElementById('cute-envelope-stage');
        this.pinkEnvelope = document.getElementById('cute-pink-envelope');
        this.stickerStrip = document.getElementById('envelope-sticker-strip');
        this.stickerThumb = document.getElementById('sticker-slider-thumb');
        this.stickerTrackFill = document.getElementById('sticker-track-fill');
        this.letterInsert = document.getElementById('envelope-letter-insert');
        this.guidePill = document.getElementById('envelope-guide-pill');
        this.parchmentLetter = document.getElementById('royal-parchment');
        this.paragraphsContainer = document.getElementById('letter-paragraphs-container');
        this.goldenPassBox = document.getElementById('golden-pass-box');
        this.goldenTicketBtn = document.getElementById('golden-ticket-vip');

        if (this.goldenTicketBtn) {
            this.goldenTicketBtn.addEventListener('click', () => {
                this.enterWonderland();
            });
        }

        this.setupStickerSlider();
        this.setupLetterInsertClick();
    }

    start() {
        this.isOpen = false;
        this.isTorn = false;
        this.isDraggingSticker = false;
        this.currentStickerProgress = 0;

        // 🎵 สลับเพลงเฉพาะสำหรับหน้าจดหมายซาบซึ้ง (Letter From The Heart)
        if (window.musicController) {
            window.musicController.startLetterMusic(0.35);
        }

        if (this.envelopeStage) this.envelopeStage.style.display = 'flex';
        if (this.pinkEnvelope) this.pinkEnvelope.classList.remove('opened');
        if (this.stickerStrip) {
            this.stickerStrip.classList.remove('torn');
            this.stickerStrip.style.display = 'flex';
        }
        if (this.stickerThumb) this.stickerThumb.style.left = '4px';
        if (this.stickerTrackFill) this.stickerTrackFill.style.width = '0%';
        if (this.guidePill) {
            this.guidePill.style.display = 'block';
            this.guidePill.innerHTML = `👉 เลื่อนหัวใจไปทางขวาเพื่อฉีกสติกเกอร์เปิดซองนะคนสวย ✨`;
        }

        if (this.parchmentLetter) this.parchmentLetter.style.display = 'none';
        if (this.goldenPassBox) this.goldenPassBox.style.display = 'none';
        if (this.paragraphsContainer) this.paragraphsContainer.innerHTML = '';
    }

    setupStickerSlider() {
        if (!this.stickerThumb || !this.stickerStrip) return;

        const onPointerDown = (e) => {
            if (this.isTorn) return;
            this.isDraggingSticker = true;
            this.stickerStartX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            window.soundManager.playPop(480);
            e.preventDefault();
        };

        const onPointerMove = (e) => {
            if (!this.isDraggingSticker || this.isTorn) return;
            const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const stripRect = this.stickerStrip.getBoundingClientRect();
            const maxDrag = stripRect.width - 46;
            const deltaX = Math.max(0, Math.min(maxDrag, currentX - stripRect.left - 20));

            const progress = deltaX / maxDrag;
            this.currentStickerProgress = progress;

            if (this.stickerThumb) this.stickerThumb.style.left = `${deltaX + 4}px`;
            if (this.stickerTrackFill) this.stickerTrackFill.style.width = `${progress * 100}%`;

            if (progress >= 0.88) {
                this.tearStickerSuccess();
            }
        };

        const onPointerUp = () => {
            if (!this.isDraggingSticker || this.isTorn) return;
            this.isDraggingSticker = false;

            if (this.currentStickerProgress < 0.88) {
                // Snap back
                if (this.stickerThumb) {
                    this.stickerThumb.style.transition = 'left 0.3s ease';
                    this.stickerThumb.style.left = '4px';
                    setTimeout(() => { if (this.stickerThumb) this.stickerThumb.style.transition = ''; }, 300);
                }
                if (this.stickerTrackFill) {
                    this.stickerTrackFill.style.transition = 'width 0.3s ease';
                    this.stickerTrackFill.style.width = '0%';
                    setTimeout(() => { if (this.stickerTrackFill) this.stickerTrackFill.style.transition = ''; }, 300);
                }
            }
        };

        this.stickerThumb.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);

        // แตะที่ตัวสติกเกอร์เพื่อเปิดได้เช่นกัน
        this.stickerStrip.addEventListener('click', () => {
            if (!this.isTorn && this.currentStickerProgress < 0.2) {
                // ออโต้สไลด์ฉีก
                this.animateAutoTear();
            }
        });
    }

    animateAutoTear() {
        this.isDraggingSticker = false;
        const stripRect = this.stickerStrip.getBoundingClientRect();
        const maxDrag = stripRect.width - 46;
        if (this.stickerThumb) {
            this.stickerThumb.style.transition = 'left 0.4s ease-out';
            this.stickerThumb.style.left = `${maxDrag + 4}px`;
        }
        if (this.stickerTrackFill) {
            this.stickerTrackFill.style.transition = 'width 0.4s ease-out';
            this.stickerTrackFill.style.width = '100%';
        }
        setTimeout(() => {
            this.tearStickerSuccess();
        }, 380);
    }

    tearStickerSuccess() {
        if (this.isTorn) return;
        this.isTorn = true;
        this.isDraggingSticker = false;

        // เสียงฉีกสติกเกอร์ / ตราครั่งแตก
        if (window.soundManager.playWaxBreak) {
            window.soundManager.playWaxBreak();
        } else {
            window.soundManager.playPop(750);
        }

        if (window.confetti) {
            window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        }

        // เฟดสติกเกอร์หายไป
        if (this.stickerStrip) {
            this.stickerStrip.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            this.stickerStrip.style.opacity = '0';
            this.stickerStrip.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.stickerStrip.classList.add('torn');
            }, 350);
        }

        // เปิดฝาซอง และเลื่อนจดหมายด้านในโผล่ขึ้นมา
        setTimeout(() => {
            if (this.pinkEnvelope) {
                this.pinkEnvelope.classList.add('opened');
            }
            window.soundManager.playVictory();

            if (this.guidePill) {
                this.guidePill.innerHTML = `💌 แตะหรือปัดที่จดหมายเพื่อดึงออกมาอ่านนะคนสวย ✨`;
                this.guidePill.style.animation = 'pulseSoft 1.5s infinite ease-in-out';
            }
        }, 400);
    }

    setupLetterInsertClick() {
        if (!this.letterInsert) return;

        const triggerExtractLetter = () => {
            if (!this.isTorn) {
                // ถ้ายังไม่ฉีก ให้ฉีกก่อนอัตโนมัติ
                this.animateAutoTear();
                setTimeout(() => {
                    this.extractLetterToParchment();
                }, 800);
                return;
            }
            this.extractLetterToParchment();
        };

        this.letterInsert.addEventListener('click', triggerExtractLetter);
    }

    extractLetterToParchment() {
        if (this.isOpen) return;
        this.isOpen = true;

        window.soundManager.playVictory();
        window.soundManager.playChime();

        if (window.confetti) {
            window.confetti({ particleCount: 80, spread: 80, origin: { y: 0.4 } });
        }

        // อนิเมชันจดหมายลอยพุ่งขึ้นมาจากซอง
        if (this.letterInsert) {
            this.letterInsert.style.transition = 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.5s ease';
            this.letterInsert.style.transform = 'translateY(-220px) scale(1.08)';
            this.letterInsert.style.opacity = '0';
        }

        setTimeout(() => {
            if (this.envelopeStage) this.envelopeStage.style.display = 'none';
            if (this.parchmentLetter) this.parchmentLetter.style.display = 'block';

            this.renderLetterContent();
        }, 550);
    }

    renderLetterContent() {
        const letterData = window.HBD_CONFIG.letterContent || {};
        const paras = letterData.paragraphs || [];

        this.paragraphsContainer.innerHTML = '';

        // แถบหัวจดหมายหรูหรา น่ารัก
        const headerBand = document.createElement('div');
        headerBand.className = 'letter-header-band';
        headerBand.innerHTML = `
            <div class="letter-header-to">${letterData.to || 'แด่ ณัสริญ มะสะ (Nasrin Masa)'}</div>
            <div class="letter-header-date">10 ตุลาคม 2026 • 20th Anniversary 🎂</div>
        `;
        this.paragraphsContainer.appendChild(headerBand);

        // 🔉 เบาเสียงดนตรีลงให้แผ่วๆ ขณะที่จดหมายกำลังพิมพ์ เพื่อให้ได้ยินเสียงปากกาขูดกระดาษชัดเจน
        if (window.musicController) {
            window.musicController.duckVolume(0.18);
        }

        // แสดงเนื้อความแบบพิมพ์เป็นคำ/กลุ่มคำอย่างรวดเร็วและมีจังหวะ (Rhythmic Word Typewriter)
        let chain = Promise.resolve();

        paras.forEach((paraText, idx) => {
            chain = chain.then(() => {
                return new Promise((resolve) => {
                    const pEl = document.createElement('div');
                    pEl.className = 'letter-para shown';
                    this.paragraphsContainer.appendChild(pEl);

                    this.typewriterWords(pEl, paraText, () => {
                        setTimeout(resolve, 380); // พักช่วงสั้นๆ ระหว่างย่อหน้า
                    });
                });
            });
        });

        // แสดงไฮไลท์ "More than words can say"
        chain.then(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const hlEl = document.createElement('div');
                    hlEl.className = 'letter-highlight-text';
                    this.paragraphsContainer.appendChild(hlEl);
                    this.typewriterWords(hlEl, letterData.highlight || 'More than words can say', () => {
                        window.soundManager.playChime();
                        setTimeout(resolve, 450);
                    });
                }, 250);
            });
        }).then(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const closeEl = document.createElement('div');
                    closeEl.className = 'letter-closing-text';
                    this.paragraphsContainer.appendChild(closeEl);
                    this.typewriterWords(closeEl, letterData.closing || 'Happy Birthday, my love....', () => {
                        window.soundManager.playChime();
                        setTimeout(resolve, 600);
                    });
                }, 200);
            });
        }).then(() => {
            // 🔊 พิมพ์จดหมายเสร็จสิ้นแล้ว คืนระดับเสียงดนตรีให้ซาบซึ้งเต็มหัวใจ
            if (window.musicController) {
                window.musicController.restoreVolume();
            }

            // เผยบัตรทองคำ VIP สู่ Wonderland
            setTimeout(() => {
                if (this.goldenPassBox) {
                    this.goldenPassBox.style.display = 'block';
                    window.soundManager.playVictory();
                    if (window.confetti) {
                        window.confetti({ particleCount: 120, spread: 90, origin: { y: 0.65 } });
                    }
                }
            }, 400);
        });
    }

    typewriterWords(el, fullText, onDone) {
        // แยกข้อความด้วยการเว้นบรรทัด หรือ คำ เพื่อพิมพ์เร็วเป็นจังหวะกระชับ ไม่ช้าจนอึดอัด
        // รองรับทั้งภาษาไทยและอิโมจิ
        const lines = fullText.split('\n');
        let currentLine = 0;

        const processLine = () => {
            if (currentLine >= lines.length) {
                if (onDone) onDone();
                return;
            }

            const lineStr = lines[currentLine];
            // แยกกลุ่มคำย่อยๆ ประมาณ 3-6 ตัวอักษร
            const chunks = [];
            for (let i = 0; i < lineStr.length; i += 3) {
                chunks.push(lineStr.slice(i, i + 3));
            }

            let chunkIdx = 0;
            const typeChunk = () => {
                if (chunkIdx < chunks.length) {
                    el.innerHTML += chunks[chunkIdx];
                    if (window.soundManager.playTypewriterClick) {
                        window.soundManager.playTypewriterClick();
                    }
                    chunkIdx++;
                    setTimeout(typeChunk, 32); // ความเร็วในการพิมพ์กระชับทันใจ
                } else {
                    currentLine++;
                    if (currentLine < lines.length) {
                        el.innerHTML += '<br>';
                        setTimeout(processLine, 120); // หยุดเว้นบรรทัดนิดนึง
                    } else {
                        processLine();
                    }
                }
            };

            typeChunk();
        };

        processLine();
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
