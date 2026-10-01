/**
 * ====================================================================
 * 🎬 VIDEO VAULT CONTROLLER (คลังวิดีโอ)
 * ====================================================================
 */

class VideoVaultController {
    constructor() {
        this.grid = null;
        this.modal = null;
        this.playerContainer = null;
    }

    init() {
        this.grid = document.getElementById('video-grid');
        this.modal = document.getElementById('video-modal');
        this.playerContainer = document.getElementById('video-player-container');
        const closeBtn = document.getElementById('video-modal-close');

        if (!this.grid) return;

        this.renderVideos();

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }
    }

    renderVideos() {
        this.grid.innerHTML = '';
        const list = window.HBD_CONFIG.videos || [];

        list.forEach((vid) => {
            const card = document.createElement('div');
            card.className = 'video-card';

            const isVideoThumb = vid.thumbnail && /\.(mp4|mov|webm|m4v)$/i.test(vid.thumbnail);

            card.innerHTML = `
                <div class="video-thumb-box">
                    ${isVideoThumb 
                        ? `<video src="${vid.thumbnail}#t=0.5" muted playsinline webkit-playsinline preload="metadata" style="width:100%; height:100%; object-fit:cover;"></video>`
                        : `<img src="${vid.thumbnail}" alt="${vid.title}" onerror="this.onerror=null; this.src='assets/images/video_thumb_1.svg';">`
                    }
                    <div class="play-circle">▶</div>
                </div>
                <div class="video-info">
                    <div class="video-title">${vid.title}</div>
                    <div class="video-desc">${vid.desc}${vid.duration ? ' • ' + vid.duration : ''}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                this.openModal(vid);
            });

            this.grid.appendChild(card);
        });
    }

    openModal(vid) {
        if (!this.modal || !this.playerContainer) return;
        window.soundManager.playPop(700);

        this.playerContainer.innerHTML = '';
        const targetUrl = (vid.videoUrl || (vid.thumbnail && /\.(mp4|mov|webm|m4v)$/i.test(vid.thumbnail) ? vid.thumbnail : '') || '').trim();

        if (targetUrl && (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be'))) {
            // เล่น YouTube
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.aspectRatio = '16 / 9';
            iframe.style.border = 'none';
            iframe.src = targetUrl + (targetUrl.includes('?') ? '&autoplay=1' : '?autoplay=1');
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            this.playerContainer.appendChild(iframe);
        } else if (targetUrl && /\.(mp4|mov|webm|m4v)$/i.test(targetUrl)) {
            // เล่นไฟล์ MP4 / วิดีโอในเครื่อง (รองรับทั้ง .mp4 และ .MP4 และ iOS Safari)
            const video = document.createElement('video');
            video.style.width = '100%';
            video.style.borderRadius = '14px';
            video.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.src = targetUrl;
            this.playerContainer.appendChild(video);
            video.play().catch(() => {});
        } else {
            // Placeholder เมื่อยังไม่ได้ใส่ลิงก์จริง
            this.playerContainer.innerHTML = `
                <div style="padding: 40px 20px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 12px;">🎬</div>
                    <h3 style="color: #ff5277; margin-bottom: 8px;">${vid.title}</h3>
                    <p style="color: #666; font-size: 0.95rem; line-height: 1.6;">
                        ${vid.desc}<br>
                        <span style="font-size: 0.85rem; color: #999;">(สามารถนำไฟล์คลิป .mp4 มาใส่ใน assets/images/ แล้วระบุใน js/config.js ได้เลยครับ)</span>
                    </p>
                </div>
            `;
        }

        this.modal.style.display = 'flex';
    }

    closeModal() {
        if (!this.modal || !this.playerContainer) return;
        const video = this.playerContainer.querySelector('video');
        if (video) {
            video.pause();
            video.src = '';
        }
        this.playerContainer.innerHTML = '';
        this.modal.style.display = 'none';
    }
}

window.videoVault = new VideoVaultController();
