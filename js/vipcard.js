/**
 * ====================================================================
 * 🪪 VIP CITIZEN CARD (บัตรประชาชนคนน่ารัก ประจำวัย 20 ขวบ)
 * ====================================================================
 */

class VIPCardController {
    init() {
        const downloadBtn = document.getElementById('vip-card-save-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                window.soundManager.playVictory();
                alert('📸 แคปหน้าจอบัตรนี้ (Screenshot) เก็บไว้ในอัลบั้มรูป iPad เพื่อใช้แสดงสิทธิ์แฟนดีเด่นได้ตลอดชีพเลยนะ! 👑💖');
                if (window.confetti) window.confetti({ particleCount: 50, spread: 60 });
            });
        }
    }
}

window.vipCardController = new VIPCardController();
