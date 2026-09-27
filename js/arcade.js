/**
 * ====================================================================
 * 🎮 EXPANDED ARCADE CONTROLLER — 6 MINI GAMES CAFE
 * ====================================================================
 * 1. Memory Match 🃏
 * 2. Boba & Treats Catch 🧋
 * 3. Love Quiz ❓
 * 4. Lucky Love Wheel 🎡
 * 5. Pop Birthday Balloons 🎈
 * 6. 100% Love Meter Pump 💖
 */

class ArcadeController {
    constructor() {
        this.currentMiniTab = 'wheel';
        // Boba Game
        this.bobaLoop = null;
        this.bobaScore = 0;
        this.bobaTimeLeft = 20;
        this.isBobaPlaying = false;
        // Love Meter
        this.lovePercent = 0;
        // Wheel
        this.isWheelSpinning = false;
        this.wheelRotation = 0;
    }

    init() {
        this.setupSubTabs();
        this.initWheelGame();
        this.initPopBalloonsGame();
        this.initLoveMeterGame();
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

                // หากเข้าเกมชานม ให้ปรับขนาด Canvas ทันทีที่แท็บแสดง
                if (target === 'boba') {
                    this.resizeBobaCanvas();
                }
            });
        });
    }

    // ==========================================
    // 🎡 1. LUCKY LOVE WHEEL (วงล้อเสี่ยงทายความรัก)
    // ==========================================
    initWheelGame() {
        const canvas = document.getElementById('wheel-game-canvas');
        const spinBtn = document.getElementById('wheel-game-spin-btn');
        const resultCard = document.getElementById('wheel-game-result');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const prizes = window.HBD_CONFIG.wheelPrizes;
        const total = prizes.length;
        const arc = (2 * Math.PI) / total;
        const colors = ['#ffccd5', '#ffe5d9', '#d8e2dc', '#fcd5ce', '#ffb5a7', '#e8dff5'];

        const draw = () => {
            const r = canvas.width / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            prizes.forEach((p, i) => {
                const angle = i * arc;
                ctx.beginPath();
                ctx.moveTo(r, r);
                ctx.arc(r, r, r - 4, angle, angle + arc);
                ctx.closePath();
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.save();
                ctx.translate(r, r);
                ctx.rotate(angle + arc / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#4a252b';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(p.text.slice(0, 11) + '..', r - 12, 4);
                ctx.restore();
            });
        };

        draw();

        if (spinBtn) {
            spinBtn.addEventListener('click', () => {
                if (this.isWheelSpinning) return;
                this.isWheelSpinning = true;

                const fullSpins = 4 + Math.floor(Math.random() * 3);
                const winIdx = Math.floor(Math.random() * total);
                const targetDeg = (fullSpins * 360) + (360 - (winIdx * (360 / total)) - (180 / total));

                this.wheelRotation += targetDeg;
                canvas.style.transform = `rotate(${this.wheelRotation}deg)`;

                let tick = setInterval(() => { window.soundManager.playPop(750); }, 130);

                setTimeout(() => {
                    clearInterval(tick);
                    this.isWheelSpinning = false;
                    window.soundManager.playVictory();
                    const win = prizes[winIdx];

                    if (resultCard) {
                        resultCard.style.display = 'block';
                        resultCard.innerHTML = `
                            <div style="font-size:1.1rem; font-weight:700; color:#d83a56;">🎉 ${win.text}</div>
                            <div style="font-size:0.9rem; color:#4a252b; margin-top:4px;">${win.desc}</div>
                        `;
                    }
                    if (window.confetti) window.confetti({ particleCount: 50, spread: 60 });
                }, 4000);
            });
        }
    }

    // ==========================================
    // 🎈 2. POP BIRTHDAY BALLOONS (จิ้มลูกโป่งแตกรับข้อความ)
    // ==========================================
    initPopBalloonsGame() {
        const area = document.getElementById('balloon-pop-area');
        const msgBox = document.getElementById('balloon-pop-msg');
        if (!area) return;

        area.innerHTML = '';
        const secrets = window.HBD_CONFIG.balloonSecrets;
        const colors = ['#ff758c', '#ffb7b2', '#4ea8de', '#f6c90e', '#b5e2fa', '#ff9a9e'];

        secrets.forEach((msg, idx) => {
            const b = document.createElement('div');
            b.className = 'pop-balloon-item';
            b.style.background = colors[idx % colors.length];
            b.innerHTML = `<span>🎈</span>`;

            b.addEventListener('click', () => {
                if (b.classList.contains('popped')) return;
                b.classList.add('popped');
                window.soundManager.playPop(850);
                window.soundManager.playChime();

                if (msgBox) {
                    msgBox.style.display = 'block';
                    msgBox.innerHTML = `💌 <strong>${msg}</strong>`;
                }

                if (window.confetti) {
                    window.confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                }
            });

            area.appendChild(b);
        });
    }

    // ==========================================
    // 💖 3. LOVE METER PUMP (แตะรัวๆ ปั๊มความรัก 100%)
    // ==========================================
    initLoveMeterGame() {
        const heartBtn = document.getElementById('love-meter-heart');
        const fillBar = document.getElementById('love-meter-fill');
        const percentText = document.getElementById('love-meter-percent');
        const winCard = document.getElementById('love-meter-win');
        if (!heartBtn) return;

        this.lovePercent = 0;

        heartBtn.addEventListener('click', () => {
            if (this.lovePercent >= 100) return;

            this.lovePercent = Math.min(100, this.lovePercent + 7);
            window.soundManager.playPop(420 + this.lovePercent * 4);

            if (fillBar) fillBar.style.width = `${this.lovePercent}%`;
            if (percentText) percentText.textContent = `${this.lovePercent}%`;

            heartBtn.style.transform = `scale(${1 + (this.lovePercent / 200)})`;

            if (this.lovePercent >= 100) {
                window.soundManager.playVictory();
                if (window.confetti) {
                    window.confetti({ particleCount: 100, spread: 80 });
                }
                if (winCard) {
                    winCard.style.display = 'block';
                    winCard.innerHTML = `🎉 พลังความรักของเค้าที่มีให้ ณัสริญ เต็ม 100% (และล้นหัวใจ) เสมอครับ! 🤍✨`;
                }
            }
        });
    }

    // ==========================================
    // 🃏 4. MEMORY MATCH
    // ==========================================
    initMemoryGame() {
        const grid = document.getElementById('arcade-memory-grid');
        const quoteEl = document.getElementById('arcade-memory-quote');
        if (!grid) return;

        grid.innerHTML = '';
        const cardsData = [
            { id: 1, icon: "☕", quote: "กาแฟแก้วแรกที่เราไปดื่มด้วยกัน 💕" },
            { id: 2, icon: "🌸", quote: "รอยยิ้มของณัสริญคือพลังใจที่ดีที่สุด ✨" },
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

    // ==========================================
    // 🧋 5. BOBA & TREATS CATCH (แก้บั๊กจอ iPad & ปรับให้เล่นง่าย)
    // ==========================================
    resizeBobaCanvas() {
        const canvas = document.getElementById('boba-game-canvas');
        if (!canvas) return;
        const box = canvas.parentElement;
        if (box) {
            canvas.width = box.clientWidth || 320;
            canvas.height = 240;
        }
    }

    initBobaGame() {
        const canvas = document.getElementById('boba-game-canvas');
        const startBtn = document.getElementById('boba-start-btn');
        const scoreDisplay = document.getElementById('boba-score-text');
        const timerDisplay = document.getElementById('boba-timer-text');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let basketX = 160;
        let items = [];
        const treats = ['🧋', '💖', '🍰', '🍓', '🎀'];

        this.resizeBobaCanvas();

        const moveBasket = (clientX) => {
            const rect = canvas.getBoundingClientRect();
            basketX = Math.max(35, Math.min(canvas.width - 35, clientX - rect.left));
        };

        canvas.addEventListener('mousemove', (e) => moveBasket(e.clientX));
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) moveBasket(e.touches[0].clientX);
        }, { passive: true });

        const spawnItem = () => {
            items.push({
                x: 25 + Math.random() * (canvas.width - 50),
                y: -10,
                speed: 1.8 + Math.random() * 1.5, // ความเร็วพอดีๆ เล่นง่าย
                emoji: treats[Math.floor(Math.random() * treats.length)]
            });
        };

        const gameLoop = () => {
            if (!this.isBobaPlaying) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // วาดตะกร้าขนาดใหญ่ขึ้น (กว้าง 68px)
            ctx.fillStyle = '#ff5e7e';
            ctx.beginPath();
            ctx.roundRect(basketX - 34, canvas.height - 28, 68, 20, 10);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🧺 รับรัก', basketX, canvas.height - 14);

            items.forEach((item, idx) => {
                item.y += item.speed;
                ctx.font = '24px serif';
                ctx.fillText(item.emoji, item.x, item.y);

                // ตรวจจับชนตะกร้าง่ายขึ้น
                if (item.y > canvas.height - 38 && item.y < canvas.height - 5 && Math.abs(item.x - basketX) < 42) {
                    this.bobaScore += 10;
                    if (scoreDisplay) scoreDisplay.textContent = `คะแนน: ${this.bobaScore}`;
                    window.soundManager.playPop(700);
                    items.splice(idx, 1);
                } else if (item.y > canvas.height + 25) {
                    items.splice(idx, 1);
                }
            });

            if (Math.random() < 0.05) spawnItem();

            this.bobaLoop = requestAnimationFrame(gameLoop);
        };

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.isBobaPlaying) return;
                this.resizeBobaCanvas();
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
                        alert(`🎉 หมดเวลา! ณัสริญ ทำได้ ${this.bobaScore} คะแนน เก่งที่สุดเลย! 💖`);
                    }
                }, 1000);

                gameLoop();
            });
        }
    }

    // ==========================================
    // ❓ 6. LOVE QUIZ
    // ==========================================
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

            cur.options.forEach((opt) => {
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
