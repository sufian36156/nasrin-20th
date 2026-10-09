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
        this.currentMiniTab = 'memory';
        // Boba Game
        this.bobaLoop = null;
        this.bobaScore = 0;
        this.bobaTimeLeft = 20;
        this.isBobaPlaying = false;
        // Love Meter
        this.lovePercent = 0;
    }

    init() {
        this.setupSubTabs();
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
    // 🃏 4. MEMORY MATCH (ดึงรูปจากลูกโป่ง สุ่มคละ 6 คู่ = 12 ใบ)
    // ==========================================
    initMemoryGame() {
        const grid = document.getElementById('arcade-memory-grid');
        const quoteEl = document.getElementById('arcade-memory-quote');
        if (!grid) return;

        grid.innerHTML = '';

        // รวบรวมรูปภาพจากโฟลเดอร์เดียวกันกับลูกโป่ง (assets/images/balloons/)
        const allPhotos = [];
        for (let i = 1; i <= 20; i++) {
            allPhotos.push({
                id: i,
                img: `assets/images/balloons/balloon_${i}.jpg`,
                quote: `ความทรงจำที่แสนงดงามรูปที่ ${i} กับคนพิเศษที่สุด 💖`
            });
        }

        // สุ่มเลือก 6 รูป จาก 20 รูป (ไม่ซ้ำกันในแต่ละตา)
        const shuffledPool = [...allPhotos].sort(() => Math.random() - 0.5);
        const selectedPairs = shuffledPool.slice(0, 6);

        // นำมาจับคู่เป็นการ์ด 12 ใบ แล้วสับตำแหน่ง
        let deck = [];
        selectedPairs.forEach((item, index) => {
            deck.push({ ...item, pairKey: `p_${index}_a` });
            deck.push({ ...item, pairKey: `p_${index}_b` });
        });
        deck.sort(() => Math.random() - 0.5);

        let flipped = [];
        let matchedCount = 0;

        deck.forEach(item => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-front">💖</div>
                    <div class="memory-back">
                        <img src="${item.img}" alt="Memory" style="width:100%; height:100%; object-fit:cover; border-radius:12px; pointer-events:none;">
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (card.classList.contains('flipped') || card.classList.contains('matched') || flipped.length >= 2) return;

                window.soundManager.playPop(520);
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
                                quoteEl.textContent = `✨ ${flipped[0].item.quote}`;
                            }
                            flipped = [];
                            matchedCount++;
                            if (matchedCount === 6 && window.confetti) {
                                window.soundManager.playVictory();
                                window.confetti({ particleCount: 80, spread: 80 });
                                if (quoteEl) {
                                    quoteEl.textContent = `🎉 เก่งมากๆ เลยคนดี! จับคู่รูปภาพครบทั้ง 6 คู่แล้วนะ 💖✨`;
                                }
                            }
                        }, 380);
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
    // 🧋 5. BOBA & TREATS CATCH (ล็อกหน้าจอ iPad & ปรับสมูท 60fps)
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
        let targetBasketX = 160;
        let items = [];
        const treats = ['🧋', '💖', '🍰', '🍓', '⭐', '🎀'];

        this.resizeBobaCanvas();

        const moveBasket = (clientX) => {
            const rect = canvas.getBoundingClientRect();
            targetBasketX = Math.max(38, Math.min(canvas.width - 38, clientX - rect.left));
        };

        // ล็อกหน้าจอมือถือและไอแพดอย่างสมบูรณ์แบบ ไม่ให้หน้าเว็บเลื่อนตามนิ้ว
        canvas.style.touchAction = 'none';
        if (canvas.parentElement) {
            canvas.parentElement.style.touchAction = 'none';
        }

        canvas.addEventListener('mousemove', (e) => moveBasket(e.clientX));

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches && e.touches[0]) moveBasket(e.touches[0].clientX);
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches && e.touches[0]) moveBasket(e.touches[0].clientX);
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });

        const spawnItem = () => {
            items.push({
                x: 25 + Math.random() * (canvas.width - 50),
                y: -15,
                speed: 2.0 + Math.random() * 1.5,
                emoji: treats[Math.floor(Math.random() * treats.length)]
            });
        };

        const gameLoop = () => {
            if (!this.isBobaPlaying) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // คำนวณตำแหน่งตะกร้าแบบ Smooth Interpolation (lerp)
            basketX += (targetBasketX - basketX) * 0.45;

            // วาดตะกร้าสีชมพูหวานเรืองแสง
            ctx.shadowColor = 'rgba(255, 105, 180, 0.45)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ff4d6d';
            ctx.beginPath();
            ctx.roundRect(basketX - 38, canvas.height - 30, 76, 22, 11);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🧺 รับชานม', basketX, canvas.height - 15);

            for (let idx = items.length - 1; idx >= 0; idx--) {
                const item = items[idx];
                item.y += item.speed;
                ctx.font = '26px serif';
                ctx.textAlign = 'center';
                ctx.fillText(item.emoji, item.x, item.y);

                // ตรวจจับชนตะกร้าอย่างแม่นยำ
                if (item.y > canvas.height - 40 && item.y < canvas.height - 4 && Math.abs(item.x - basketX) < 46) {
                    this.bobaScore += 10;
                    if (scoreDisplay) scoreDisplay.textContent = `คะแนน: ${this.bobaScore}`;
                    window.soundManager.playPop(750);
                    items.splice(idx, 1);
                } else if (item.y > canvas.height + 25) {
                    items.splice(idx, 1);
                }
            }

            if (Math.random() < 0.055) spawnItem();

            this.bobaLoop = requestAnimationFrame(gameLoop);
        };

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.isBobaPlaying) return;
                this.resizeBobaCanvas();
                basketX = canvas.width / 2;
                targetBasketX = basketX;
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
