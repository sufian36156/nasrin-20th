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

            const candidates = [
                vid.thumbnail,
                vid.videoUrl,
                `assets/images/videos/video_${vid.id}.mp4`,
                `assets/images/video_thumb_${vid.id}.mp4`,
                `assets/images/videos/video_thumb_${vid.id}.mp4`
            ].filter(Boolean);

            const firstSrc = candidates[0] || `assets/images/videos/video_${vid.id}.mp4`;
            const isVideoThumb = /\.(mp4|mov|webm|m4v)$/i.test(firstSrc);

            card.innerHTML = `
                <div class="video-thumb-box" style="background:#ffd9e2; position:relative; overflow:hidden;">
                    ${isVideoThumb 
                        ? `<video src="${firstSrc}#t=0.1" muted playsinline webkit-playsinline preload="metadata" style="width:100%; height:100%; object-fit:cover; pointer-events:none;"></video>`
                        : `<img src="${firstSrc}" alt="${vid.title}" onerror="this.onerror=null; this.src='assets/images/polaroids/placeholder.jpg';">`
                    }
                    <div class="play-circle">▶</div>
                </div>
                <div class="video-info">
                    <div class="video-title">${vid.title}</div>
                    <div class="video-desc">${vid.desc}${vid.duration ? ' • ' + vid.duration : ''}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                this.openModal(vid, candidates);
            });

            this.grid.appendChild(card);
        });
    }

    openModal(vid, customCandidates) {
        if (!this.modal || !this.playerContainer) return;
        window.soundManager.playPop(700);

        this.playerContainer.innerHTML = '';
        const candidates = customCandidates && customCandidates.length > 0 ? customCandidates : [
            vid.videoUrl,
            vid.thumbnail,
            `assets/images/videos/video_${vid.id}.mp4`,
            `assets/images/video_thumb_${vid.id}.mp4`,
            `assets/images/videos/video_thumb_${vid.id}.mp4`
        ].filter(Boolean);

        const targetUrl = candidates[0] || '';

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
        } else if (candidates.some(c => /\.(mp4|mov|webm|m4v)$/i.test(c))) {
            // เล่นไฟล์ MP4 / วิดีโอในเครื่อง (พร้อมระบบสลับไฟล์อัตโนมัติหากไฟล์แรกหาไม่เจอ)
            const video = document.createElement('video');
            video.style.width = '100%';
            video.style.borderRadius = '14px';
            video.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');

            let currentIdx = 0;
            const mp4Candidates = candidates.filter(c => /\.(mp4|mov|webm|m4v)$/i.test(c));

            const tryLoadCandidate = () => {
                if (currentIdx < mp4Candidates.length) {
                    video.src = mp4Candidates[currentIdx++];
                    video.load();
                    video.play().catch(() => {});
                }
            };

            video.onerror = () => {
                if (currentIdx < mp4Candidates.length) {
                    tryLoadCandidate();
                }
            };

            this.playerContainer.appendChild(video);
            tryLoadCandidate();
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
