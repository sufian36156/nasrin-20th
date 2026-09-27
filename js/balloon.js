/**
 * ====================================================================
 * 🎈 MAKE A WISH — BALLOON SKY CONTROLLER
 * ====================================================================
 * พิมพ์คำอธิษฐานแล้วปล่อยลูกโป่งลอยขึ้นสู่ท้องฟ้ายามค่ำคืน
 */

class BalloonWishController {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.balloons = [];
        this.stars = [];
    }

    init() {
        this.canvas = document.getElementById('wish-canvas');
        const sendBtn = document.getElementById('wish-send-btn');
        const input = document.getElementById('wish-input-field');

        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.initStars();
        this.animate();

        // โหลดคำอธิษฐานเริ่มต้น
        this.addBalloon("ขอให้เนสรินในวัย 20 ปีมีความสุขที่สุดในโลก ✨", "#ff758c");

        if (sendBtn && input) {
            const handleSend = () => {
                const text = input.value.trim();
                if (!text) return;

                const colors = ['#ff758c', '#ffb7b2', '#e63946', '#4ea8de', '#f6c90e', '#b5e2fa'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];

                this.addBalloon(text, randomColor);
                input.value = '';
                window.soundManager.playVictory();

                if (window.confetti) {
                    window.confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
                }
            };

            sendBtn.addEventListener('click', handleSend);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleSend();
            });
        }
    }

    resize() {
        const box = this.canvas.parentElement;
        if (!box) return;
        this.canvas.width = box.clientWidth;
        this.canvas.height = box.clientHeight;
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < 40; i++) {
            this.stars.push({
                x: Math.random() * (this.canvas.width || 300),
                y: Math.random() * (this.canvas.height || 260),
                radius: Math.random() * 1.5,
                alpha: 0.2 + Math.random() * 0.8,
                speed: 0.02 + Math.random() * 0.03
            });
        }
    }

    addBalloon(text, color) {
        const width = this.canvas.width || 300;
        const height = this.canvas.height || 260;

        this.balloons.push({
            x: 40 + Math.random() * (width - 80),
            y: height + 20,
            targetY: 30 + Math.random() * (height - 90),
            color: color,
            text: text,
            speedY: 1.2 + Math.random() * 0.8,
            sway: 0,
            swaySpeed: 0.03 + Math.random() * 0.02
        });
    }

    animate() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // วาดดวงดาวระยิบระยับ
        this.stars.forEach(s => {
            s.alpha += s.speed;
            if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // วาดลูกโป่ง
        this.balloons.forEach(b => {
            if (b.y > b.targetY) {
                b.y -= b.speedY;
            }
            b.sway += b.swaySpeed;
            const currentX = b.x + Math.sin(b.sway) * 8;

            // ตัวลูกโป่ง
            this.ctx.fillStyle = b.color;
            this.ctx.beginPath();
            this.ctx.ellipse(currentX, b.y, 14, 18, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // เชือกลูกโป่ง
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(currentX, b.y + 18);
            this.ctx.lineTo(currentX, b.y + 34);
            this.ctx.stroke();

            // ป้ายข้อความ
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = '11px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(b.text.slice(0, 24) + (b.text.length > 24 ? '..' : ''), currentX, b.y + 48);
        });

        requestAnimationFrame(() => this.animate());
    }
}

window.balloonController = new BalloonWishController();
