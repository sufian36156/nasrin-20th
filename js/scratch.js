/**
 * ====================================================================
 * 🪙 RETINA-AWARE SCRATCH-OFF CARD CONTROLLER
 * ====================================================================
 * รองรับหน้าจอ Retina ของ iPad (devicePixelRatio 2x) และ Touch Event แบบไร้ดีเลย์
 */

class ScratchCardController {
    constructor() {
        this.cards = [];
        this.revealedCount = 0;
    }

    init() {
        const container = document.getElementById('coupons-list');
        if (!container) return;

        container.innerHTML = '';
        const coupons = window.HBD_CONFIG.coupons;

        coupons.forEach((coupon, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'scratch-card';
            cardEl.id = `scratch-card-${coupon.id}`;

            cardEl.innerHTML = `
                <div class="coupon-underneath">
                    <span class="coupon-tag" style="background: ${coupon.color};">${coupon.tag}</span>
                    <div class="coupon-title">${coupon.title}</div>
                    <div class="coupon-desc">${coupon.desc}</div>
                </div>
                <canvas class="scratch-canvas" id="canvas-${coupon.id}"></canvas>
            `;

            container.appendChild(cardEl);

            // เซ็ตอัพ Canvas ขูด
            this.setupCanvas(coupon);
        });
    }

    setupCanvas(coupon) {
        const canvas = document.getElementById(`canvas-${coupon.id}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // วาดแผ่นฟอยล์สีเงินประกายชมพูสำหรับขูด
        const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
        grad.addColorStop(0, '#f2d6dc');
        grad.addColorStop(0.5, '#ffd8e2');
        grad.addColorStop(1, '#ffccd7');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, rect.width, rect.height);

        // วาดข้อความ "ขูดตรงนี้ 🪙"
        ctx.fillStyle = '#9c5b68';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨ ใช้นิ้วขูดเพื่อเปิดคูปอง 🪙', rect.width / 2, rect.height / 2);

        let isScratching = false;
        let isRevealed = false;

        const scratch = (clientX, clientY) => {
            if (isRevealed) return;
            const b = canvas.getBoundingClientRect();
            const x = clientX - b.left;
            const y = clientY - b.top;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 22, 0, Math.PI * 2);
            ctx.fill();

            window.soundManager.playPop(350 + Math.random() * 80);
            checkScratched();
        };

        const checkScratched = () => {
            if (isRevealed) return;
            // เช็คอัตราส่วนที่ขูดไปแล้ว
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imgData.data;
            let transparentCount = 0;

            for (let i = 3; i < pixels.length; i += 16) {
                if (pixels[i] === 0) transparentCount++;
            }

            const totalSampled = pixels.length / 16;
            const ratio = transparentCount / totalSampled;

            if (ratio > 0.40) {
                isRevealed = true;
                canvas.style.transition = 'opacity 0.5s ease-out';
                canvas.style.opacity = '0';
                setTimeout(() => {
                    canvas.style.display = 'none';
                }, 500);

                window.soundManager.playChime();
                if (window.confetti) {
                    window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
                }
            }
        };

        // Pointer / Touch Handlers รองรับ iPad เต็มรูปแบบ
        const onDown = (e) => {
            isScratching = true;
            const pt = e.touches ? e.touches[0] : e;
            scratch(pt.clientX, pt.clientY);
        };

        const onMove = (e) => {
            if (!isScratching) return;
            const pt = e.touches ? e.touches[0] : e;
            scratch(pt.clientX, pt.clientY);
        };

        const onUp = () => {
            isScratching = false;
        };

        canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        canvas.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);
    }
}

window.scratchController = new ScratchCardController();
