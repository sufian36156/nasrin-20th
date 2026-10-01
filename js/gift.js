/**
 * ====================================================================
 * 🎁 REAL GIFT BOX REVEAL (เปิดกล่องของขวัญชิ้นจริง)
 * ====================================================================
 */

class RealGiftController {
    constructor() {
        this.isOpened = false;
    }

    init() {
        const giftBox = document.getElementById('real-gift-box');
        const revealCard = document.getElementById('real-gift-card');
        const replayBtn = document.getElementById('real-gift-replay-btn');

        if (!giftBox) return;

        giftBox.addEventListener('click', () => {
            this.openGift();
        });

        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                this.resetGift();
            });
        }

        this.populateGiftInfo();
    }

    populateGiftInfo() {
        const cfg = window.HBD_CONFIG.realGift;
        if (!cfg) return;

        const titleEl = document.getElementById('real-gift-title');
        const clueEl = document.getElementById('real-gift-clue');
        const subClueEl = document.getElementById('real-gift-subclue');

        if (titleEl && cfg.title) titleEl.textContent = cfg.title;
        if (clueEl && cfg.hintClue) clueEl.textContent = cfg.hintClue;
        if (subClueEl && cfg.secondaryClue) subClueEl.textContent = cfg.secondaryClue;
    }

    openGift() {
        if (this.isOpened) return;
        this.isOpened = true;

        const giftBox = document.getElementById('real-gift-box');
        const revealCard = document.getElementById('real-gift-card');
        const hintTap = document.getElementById('gift-box-tap-hint');

        if (giftBox) giftBox.classList.add('opened');
        if (hintTap) hintTap.style.display = 'none';

        window.soundManager.playVictory();
        window.soundManager.playChime();

        if (window.confetti) {
            window.confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
            setTimeout(() => {
                window.confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
                window.confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
            }, 300);
        }

        setTimeout(() => {
            if (revealCard) {
                revealCard.style.display = 'block';
                revealCard.classList.add('card-revealed-anim');
            }
        }, 500);
    }

    resetGift() {
        this.isOpened = false;
        const giftBox = document.getElementById('real-gift-box');
        const revealCard = document.getElementById('real-gift-card');
        const hintTap = document.getElementById('gift-box-tap-hint');

        if (giftBox) giftBox.classList.remove('opened');
        if (revealCard) revealCard.style.display = 'none';
        if (hintTap) hintTap.style.display = 'block';

        window.soundManager.playPop(500);
    }
}

window.realGiftController = new RealGiftController();
