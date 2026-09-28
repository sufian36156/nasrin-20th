/**
 * ====================================================================
 * 🔮 MAGIC FORTUNE BALL (ลูกแก้วพยากรณ์ชีวิตวัย 20 ขวบ)
 * ====================================================================
 */

class FortuneBallController {
    constructor() {
        this.fortunes = [
            "💖 ด้านความรัก: ความรักจะหวานชื่น มีคนคอยสปอยล์และอยู่เคียงข้างเสมอ",
            "✨ ด้านชีวิตวัย 20: ทุกความฝันที่ตั้งใจจะสำเร็จอย่างราบรื่นและเปล่งประกาย",
            "🍰 ด้านของกิน: จะได้กินของอร่อย ขนมหวาน ชานม และบุฟเฟต์ตามใจตลอดปี!",
            "✈️ ด้านการเดินทาง: จะได้ไปเที่ยวทริปสวยๆ มีตากล้องส่วนตัวถ่ายรูปให้เพียบ",
            "🌸 ด้านสุขภาพใจ: จะมีรอยยิ้มสดใส ไม่มีความเครียด มีแต่พลังบวกเต็มเปี่ยม",
            "👑 ด้านความโชคดี: โชคดีที่สุดของเธอคือมีคนที่รักเธอหมดหัวใจอยู่ตรงนี้นะ!"
        ];
        this.isShaking = false;
    }

    init() {
        const ball = document.getElementById('magic-fortune-ball');
        const resultText = document.getElementById('fortune-result-text');
        if (!ball) return;

        ball.addEventListener('click', () => {
            if (this.isShaking) return;
            this.isShaking = true;

            ball.classList.add('shake-animation');
            window.soundManager.playPop(800);
            if (resultText) resultText.textContent = "🔮 ลูกแก้วกำลังทำนายดวงชะตาสุดปัง...";

            setTimeout(() => {
                ball.classList.remove('shake-animation');
                this.isShaking = false;
                window.soundManager.playChime();

                const fortune = this.fortunes[Math.floor(Math.random() * this.fortunes.length)];
                if (resultText) resultText.innerHTML = `<strong>${fortune}</strong>`;
                if (window.confetti) window.confetti({ particleCount: 35, spread: 50 });
            }, 1200);
        });
    }
}

window.fortuneController = new FortuneBallController();
