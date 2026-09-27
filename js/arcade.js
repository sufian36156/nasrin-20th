/**
 * ====================================================================
 * 🎮 ARCADE CONTROLLER — MINI GAMES CAFE
 * ====================================================================
 * รวม 3 มินิเกมเล่นเพลิน: จับคู่การ์ด, เกมตะกร้ารับชานมไข่มุก (20 วิ), และควิซทายใจ
 */

class ArcadeController {
    constructor() {
        this.currentMiniTab = 'memory';
        // Boba Game
        this.bobaLoop = null;
        this.bobaScore = 0;
        this.bobaTimeLeft = 20;
        this.isBobaPlaying = false;
    }

    init() {
        this.setupSubTabs();
        this.initMemoryGame();
        this.initBobaGame();
        this.initQuizGame();
    }

    setupSubTabs() {
        const btns = document.querySelectorAll('.arcade-subtab-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const target = btn.dataset.tab;
                document.querySelectorAll('.arcade-game-view').forEach(view => view.style.display = 'none');
                const targetView = document.getElementById(`arcade-view-${target}`);
                if (targetView) targetView.style.display = 'block';

                window.soundManager.playPop(550);
            });
        });
    }

    // 1. Memory Match
    initMemoryGame() {
        const grid = document.getElementById('arcade-memory-grid');
        const quoteEl = document.getElementById('arcade-memory-quote');
        if (!grid) return;

        grid.innerHTML = '';
        const cardsData = [
            { id: 1, icon: "☕", quote: "กาแฟแก้วแรกที่เราไปดื่มด้วยกัน 💕" },
            { id: 2, icon: "🌸", quote: "รอยยิ้มของเนสรินคือพลังใจที่ดีที่สุด ✨" },
            { id: 3, icon: "🏖️", quote: "ทริปเที่ยวทะเลกับคนโปรด 🌊" },
            { id: 4, icon: "🍰", quote: "ของหวานโปรดที่ต้องกินด้วยกันเสมอ 🍓" }
        ];

        let deck = [...cardsData, ...cardsData].sort(() => Math.random() - 0.5);
        let flipped = [];
        let matched = 0;

        deck.forEach(item => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-front">💖</div>
                    <div class="memory-back"><span style="font-size:2rem;">${item.icon}</span></div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (card.classList.contains('flipped') || card.classList.contains('matched') || flipped.length >= 2) return;

                window.soundManager.playPop(500);
                card.classList.add('flipped');
                flipped.push({ el: card, item });

                if (flipped.length === 2) {
                    if (flipped[0].item.id === flipped[1].item.id) {
                        setTimeout(() => {
                            window.soundManager.playChime();
                            flipped[0].el.classList.add('matched');
                            flipped[1].el.classList.add('matched');
                            if (quoteEl) {
                                quoteEl.style.display = 'block';
                                quoteEl.textContent = `💌 ${flipped[0].item.quote}`;
                            }
                            flipped = [];
                            matched++;
                            if (matched === 4 && window.confetti) {
                                window.confetti({ particleCount: 50, spread: 60 });
                            }
                        }, 400);
                    } else {
                        setTimeout(() => {
                            flipped[0].el.classList.remove('flipped');
                            flipped[1].el.classList.remove('flipped');
                            flipped = [];
                        }, 750);
                    }
                }
            });

            grid.appendChild(card);
        });
    }

    // 2. Catch the Boba & Treats
    initBobaGame() {
        const canvas = document.getElementById('boba-game-canvas');
        const startBtn = document.getElementById('boba-start-btn');
        const scoreDisplay = document.getElementById('boba-score-text');
        const timerDisplay = document.getElementById('boba-timer-text');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let basketX = 140;
        let items = [];
        const treats = ['🧋', '💖', '🍰', '🍓', '🎀'];

        const resize = () => {
            const box = canvas.parentElement;
            if (box) {
                canvas.width = box.clientWidth || 300;
                canvas.height = 240;
            }
        };
        resize();

        // เคลื่อนที่ตะกร้าตามการสัมผัส / เมาส์
        const moveBasket = (clientX) => {
            const rect = canvas.getBoundingClientRect();
            basketX = Math.max(25, Math.min(canvas.width - 25, clientX - rect.left));
        };

        canvas.addEventListener('mousemove', (e) => moveBasket(e.clientX));
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) moveBasket(e.touches[0].clientX);
        }, { passive: true });

        const spawnItem = () => {
            items.push({
                x: 20 + Math.random() * (canvas.width - 40),
                y: -10,
                speed: 2 + Math.random() * 2,
                emoji: treats[Math.floor(Math.random() * treats.length)]
            });
        };

        const gameLoop = () => {
            if (!this.isBobaPlaying) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // วาดตะกร้า
            ctx.fillStyle = '#ff758c';
            ctx.beginPath();
            ctx.roundRect(basketX - 25, canvas.height - 25, 50, 18, 8);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🧺 รักเธอ', basketX, canvas.height - 12);

            // ขยับและวาดสิ่งของ
            items.forEach((item, idx) => {
                item.y += item.speed;
                ctx.font = '22px serif';
                ctx.fillText(item.emoji, item.x, item.y);

                // ตรวจจับชนตะกร้า
                if (item.y > canvas.height - 35 && item.y < canvas.height - 10 && Math.abs(item.x - basketX) < 32) {
                    this.bobaScore += 10;
                    if (scoreDisplay) scoreDisplay.textContent = `คะแนน: ${this.bobaScore}`;
                    window.soundManager.playPop(700);
                    items.splice(idx, 1);
                } else if (item.y > canvas.height + 20) {
                    items.splice(idx, 1);
                }
            });

            if (Math.random() < 0.04) spawnItem();

            this.bobaLoop = requestAnimationFrame(gameLoop);
        };

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.isBobaPlaying) return;
                this.isBobaPlaying = true;
                this.bobaScore = 0;
                this.bobaTimeLeft = 20;
                items = [];
                startBtn.disabled = true;
                if (scoreDisplay) scoreDisplay.textContent = "คะแนน: 0";

                const timerInterval = setInterval(() => {
                    this.bobaTimeLeft--;
                    if (timerDisplay) timerDisplay.textContent = `เวลา: ${this.bobaTimeLeft}s`;
                    if (this.bobaTimeLeft <= 0) {
                        clearInterval(timerInterval);
                        this.isBobaPlaying = false;
                        startBtn.disabled = false;
                        cancelAnimationFrame(this.bobaLoop);
                        window.soundManager.playVictory();
                        if (window.confetti) window.confetti({ particleCount: 70, spread: 70 });
                        alert(`🎉 หมดเวลา! เนสรินทำได้ ${this.bobaScore} คะแนน เก่งมากเลยคนโปรด! 💖`);
                    }
                }, 1000);

                gameLoop();
            });
        }
    }

    // 3. Quiz
    initQuizGame() {
        const qText = document.getElementById('arcade-quiz-q');
        const optsBox = document.getElementById('arcade-quiz-opts');
        const reactBox = document.getElementById('arcade-quiz-react');
        if (!qText || !optsBox) return;

        const quizzes = window.HBD_CONFIG.quizzes;
        let curIdx = 0;

        const renderQ = (idx) => {
            const cur = quizzes[idx];
            qText.textContent = cur.q;
            optsBox.innerHTML = '';
            if (reactBox) reactBox.style.display = 'none';

            cur.options.forEach((opt, oIdx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-opt-btn';
                btn.textContent = opt;

                btn.addEventListener('click', () => {
                    optsBox.querySelectorAll('button').forEach(b => b.disabled = true);
                    btn.classList.add('correct');
                    window.soundManager.playChime();

                    if (reactBox) {
                        reactBox.style.display = 'block';
                        reactBox.textContent = `💬 ${cur.reaction}`;
                    }

                    setTimeout(() => {
                        if (curIdx < quizzes.length - 1) {
                            curIdx++;
                            renderQ(curIdx);
                        } else {
                            if (reactBox) reactBox.textContent = "🎉 ตอบครบหมดแล้ว! เอาคะแนนความรักไปเต็ม 100% เลยนะ! 🤍";
                        }
                    }, 2200);
                });

                optsBox.appendChild(btn);
            });
        };

        renderQ(0);
    }
}

window.arcadeController = new ArcadeController();
