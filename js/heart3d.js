/**
 * ====================================================================
 * 💎 3D PHOTO HEART CONTROLLER (หัวใจ 3D รวมภาพความทรงจำ)
 * ====================================================================
 */

class Heart3DController {
    constructor() {
        this.stage = null;
        this.pivot = null;
        this.cards = [];
        this.rotX = 0;
        this.rotY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.lastTapTime = 0;
        this.isExploded = false;
    }

    init() {
        this.stage = document.getElementById('heart3d-stage');
        this.pivot = document.getElementById('heart3d-pivot');
        if (!this.stage || !this.pivot) return;

        this.setupInteraction();
    }

    start() {
        this.isExploded = false;
        this.rotX = 0;
        this.rotY = 0;
        this.renderHeart();
    }

    renderHeart() {
        this.pivot.innerHTML = '';
        this.cards = [];
        const photoList = window.HBD_CONFIG.heart3dPhotos || [];
        const count = photoList.length || 12;

        // สูตร parametric 3D Heart Curve
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            
            // Parametric equations for heart shape
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            const z = Math.sin(t * 2) * 35; // ให้มีมิติความลึก 3D

            const scale = 5.2; // ปรับขนาดให้พอดีกับหน้าจอมือถือ/iPad
            const posX = x * scale;
            const posY = y * scale;
            const posZ = z;

            const card = document.createElement('div');
            card.className = 'heart3d-card';
            
            const imgSrc = photoList[i] || 'assets/images/polaroids/1.jpeg';
            card.innerHTML = `<img src="${imgSrc}" alt="Memory ${i+1}" onerror="this.onerror=null; this.src='assets/images/polaroids/1.jpeg';">`;

            // กำหนดตำแหน่ง 3D เริ่มต้น
            card.style.transform = `translate3d(${posX}px, ${posY}px, ${posZ}px) rotateY(${t * 30}deg)`;
            card.setAttribute('data-base-x', posX);
            card.setAttribute('data-base-y', posY);
            card.setAttribute('data-base-z', posZ);

            this.pivot.appendChild(card);
            this.cards.push(card);
        }

        this.updateRotation();
    }

    setupInteraction() {
        // Drag to rotate in 3D
        const onStart = (e) => {
            if (this.isExploded) return;
            this.isDragging = true;
            const pt = e.touches ? e.touches[0] : e;
            this.startX = pt.clientX;
            this.startY = pt.clientY;

            // ตรวจสอบ Double Tap
            const now = Date.now();
            if (now - this.lastTapTime < 350) {
                this.explodeHeart();
            }
            this.lastTapTime = now;
        };

        const onMove = (e) => {
            if (!this.isDragging || this.isExploded) return;
            const pt = e.touches ? e.touches[0] : e;
            const deltaX = pt.clientX - this.startX;
            const deltaY = pt.clientY - this.startY;

            this.rotY += deltaX * 0.45;
            this.rotX -= deltaY * 0.45;

            this.startX = pt.clientX;
            this.startY = pt.clientY;
            this.updateRotation();
        };

        const onEnd = () => {
            this.isDragging = false;
        };

        this.stage.addEventListener('pointerdown', onStart);
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onEnd);
    }

    updateRotation() {
        if (!this.pivot) return;
        this.pivot.style.transform = `rotateX(${this.rotX}deg) rotateY(${this.rotY}deg)`;
    }

    explodeHeart() {
        if (this.isExploded) return;
        this.isExploded = true;

        window.soundManager.playPop(350);
        window.soundManager.playVictory();

        if (window.confetti) {
            window.confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
        }

        // กระจายรูปทั้งหมดออกเป็น 3D Explosion
        this.cards.forEach((card) => {
            const bx = parseFloat(card.getAttribute('data-base-x') || 0);
            const by = parseFloat(card.getAttribute('data-base-y') || 0);
            const bz = parseFloat(card.getAttribute('data-base-z') || 0);

            const burstX = bx * 3.5 + (Math.random() - 0.5) * 150;
            const burstY = by * 3.5 + (Math.random() - 0.5) * 150;
            const burstZ = bz * 3 + (Math.random() - 0.5) * 300;
            const rot = (Math.random() - 0.5) * 360;

            card.style.transition = 'transform 1s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 1s ease';
            card.style.transform = `translate3d(${burstX}px, ${burstY}px, ${burstZ}px) rotate(${rot}deg) scale(0.2)`;
            card.style.opacity = '0';
        });

        const hint = document.getElementById('heart3d-hint');
        if (hint) {
            hint.textContent = '💥 หัวใจแห่งความทรงจำแตกกระจาย... ก้าวสู่ลูกโป่ง 20 ปี! 🎈';
        }

        // นำทางสู่ฉากลูกโป่ง 3D
        setTimeout(() => {
            if (window.app) window.app.goToCeremonyScene('scene-balloons');
            if (window.balloons3D) window.balloons3D.start();
        }, 1500);
    }
}

window.heart3D = new Heart3DController();
