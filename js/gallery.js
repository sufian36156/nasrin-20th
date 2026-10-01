/**
 * ====================================================================
 * 📸 PHOTO AVALANCHE (แกลเลอรีรูปภาพโพลารอยด์)
 * ====================================================================
 */

class PolaroidGallery {
    constructor() {
        this.container = null;
        this.proceedBtn = null;
        this.observer = null;
    }

    init() {
        this.container = document.getElementById('polaroid-container');
        this.proceedBtn = document.getElementById('gallery-proceed-btn');
        if (!this.container) return;

        this.renderPolaroids();
        this.setupScrollObserver();

        if (this.proceedBtn) {
            this.proceedBtn.addEventListener('click', () => {
                window.soundManager.playSwoosh();
                window.app.goToScene('scene-letter');
            });
        }
    }

    renderPolaroids() {
        this.container.innerHTML = '';
        const items = window.HBD_CONFIG.polaroids;

        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'polaroid-item';
            
            // มุมเอียงสุ่มเล็กน้อยตามที่เซ็ตไว้
            const angle = item.angle || ((index % 2 === 0 ? 1 : -1) * (3 + Math.random() * 4));
            card.style.transform = `rotate(${angle}deg)`;

            const baseWithoutExt = item.image.replace(/\.[^/.]+$/, "");
            const fallbackCandidates = [
                item.image,
                baseWithoutExt + '.jpeg',
                baseWithoutExt + '.jpg',
                baseWithoutExt + '.png',
                baseWithoutExt + '.svg',
                'assets/images/polaroids/placeholder.svg'
            ];

            card.innerHTML = `
                <div class="polaroid-tape"></div>
                <div class="polaroid-img-box">
                    <img src="${item.image}" alt="Memory photo" data-src-idx="1">
                </div>
                <div class="polaroid-caption">${item.caption}</div>
                <div class="polaroid-date">${item.date || `Memory #${index + 1}`}</div>
            `;

            const img = card.querySelector('img');
            img.onerror = function() {
                let currentIdx = parseInt(this.getAttribute('data-src-idx') || '1', 10);
                while (currentIdx < fallbackCandidates.length) {
                    const nextSrc = fallbackCandidates[currentIdx++];
                    this.setAttribute('data-src-idx', currentIdx);
                    if (nextSrc !== this.getAttribute('src')) {
                        this.src = nextSrc;
                        return;
                    }
                }
                this.onerror = null;
                this.src = 'assets/images/polaroids/placeholder.svg';
            };

            this.container.appendChild(card);
        });
    }

    setupScrollObserver() {
        if (!('IntersectionObserver' in window)) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.soundManager.playPop(450 + Math.random() * 150);
                    entry.target.style.opacity = '1';
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.4s ease';
                }
            });
        }, { threshold: 0.3 });

        const cards = this.container.querySelectorAll('.polaroid-item');
        cards.forEach(c => this.observer.observe(c));
    }
}

window.polaroidGallery = new PolaroidGallery();
