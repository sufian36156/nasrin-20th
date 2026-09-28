/**
 * ====================================================================
 * 🎨 DOODLE & DRAWING CANVAS (สำหรับ iPad และนิ้วสัมผัส)
 * ====================================================================
 * รองรับ Apple Pencil และการลากนิ้วเขียนการ์ดอวยพรมอบให้กัน
 */

class DoodleCanvasController {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentColor = '#ff5e7e';
        this.brushSize = 4;
    }

    init() {
        this.canvas = document.getElementById('doodle-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.setupDrawingEvents();
        this.setupColorPalette();

        const clearBtn = document.getElementById('doodle-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clear();
                window.soundManager.playPop(400);
            });
        }

        const saveBtn = document.getElementById('doodle-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                window.soundManager.playVictory();
                alert('💌 การ์ดลายมือถูกบันทึกไว้ในหัวใจของเค้าเรียบร้อยแล้วครับ! 💖');
                if (window.confetti) window.confetti({ particleCount: 50, spread: 60 });
            });
        }
    }

    resize() {
        const box = this.canvas.parentElement;
        if (!box) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = box.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = 240 * dpr;
        this.ctx.scale(dpr, dpr);

        this.clear();
    }

    clear() {
        if (!this.ctx || !this.canvas) return;
        const box = this.canvas.parentElement;
        const width = box ? box.clientWidth : 300;
        this.ctx.clearRect(0, 0, width, 240);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, width, 240);

        // วาดลายน้ำบางๆ
        this.ctx.fillStyle = '#ffe5ec';
        this.ctx.font = 'bold 16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('✍️ วาดรูปหรือเขียนข้อความถึงกันที่นี่ได้เลยนะ', width / 2, 120);
    }

    setupDrawingEvents() {
        const getPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const start = (e) => {
            this.isDrawing = true;
            const pos = getPos(e);
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.brushSize;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
        };

        const move = (e) => {
            if (!this.isDrawing) return;
            const pos = getPos(e);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
        };

        const end = () => {
            if (this.isDrawing) {
                this.isDrawing = false;
                this.ctx.closePath();
            }
        };

        this.canvas.addEventListener('mousedown', start);
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);

        this.canvas.addEventListener('touchstart', start, { passive: false });
        window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('touchend', end);
    }

    setupColorPalette() {
        const swatches = document.querySelectorAll('.doodle-color-swatch');
        swatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                swatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                this.currentColor = swatch.dataset.color || '#ff5e7e';
                window.soundManager.playPop(600);
            });
        });
    }
}

window.doodleController = new DoodleCanvasController();
