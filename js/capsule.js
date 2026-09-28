/**
 * ====================================================================
 * ⏳ TIME CAPSULE 2036 (ไทม์แคปซูลเปิดปีที่ 30)
 * ====================================================================
 */

class TimeCapsuleController {
    constructor() {
        this.storageKey = 'nasrin_time_capsule_2036';
    }

    init() {
        const input = document.getElementById('capsule-input-text');
        const sealBtn = document.getElementById('capsule-seal-btn');
        const lockedCard = document.getElementById('capsule-locked-card');
        const formBox = document.getElementById('capsule-form-box');
        const msgDisplay = document.getElementById('capsule-saved-msg');

        if (!sealBtn) return;

        // โหลดข้อความที่เคยฝากไว้
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            if (formBox) formBox.style.display = 'none';
            if (lockedCard) lockedCard.style.display = 'block';
            if (msgDisplay) msgDisplay.textContent = `"${saved}"`;
        }

        sealBtn.addEventListener('click', () => {
            const val = input ? input.value.trim() : '';
            if (!val) {
                alert('เขียนข้อความหรือคำสัญญาถึงวัย 30 ปีก่อนน้า 💌');
                return;
            }

            localStorage.setItem(this.storageKey, val);
            window.soundManager.playVictory();

            if (formBox) formBox.style.display = 'none';
            if (lockedCard) lockedCard.style.display = 'block';
            if (msgDisplay) msgDisplay.textContent = `"${val}"`;

            if (window.confetti) window.confetti({ particleCount: 70, spread: 80 });
            alert('🔒 ปิดผนึกไทม์แคปซูลเรียบร้อย! อีก 10 ปีข้างหน้าเราจะมาเปิดอ่านด้วยกันนะ 🤍✨');
        });
    }
}

window.capsuleController = new TimeCapsuleController();
