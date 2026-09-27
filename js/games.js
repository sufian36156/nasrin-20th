/**
 * ====================================================================
 * 🎮 MINI GAMES CONTROLLER (4 เกมแห่งความทรงจำ)
 * ====================================================================
 */

class MiniGamesController {
    constructor() {
        this.currentGameIndex = 1; // 1 to 4
        this.totalGames = 4;

        // Game 1: Memory
        this.memoryFlippedCards = [];
        this.memoryMatchedCount = 0;

        // Game 2: Puzzle
        this.puzzlePieces = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        this.selectedPuzzleIndex = null;

        // Game 3: Wheel
        this.wheelRotation = 0;
        this.isWheelSpinning = false;

        // Game 4: Quiz
        this.currentQuizIndex = 0;
    }

    init() {
        this.updateStepBadge();
        this.initMemoryGame();
        this.initPuzzleGame();
        this.initWheelGame();
        this.initQuizGame();
    }

    updateStepBadge() {
        const badge = document.getElementById('game-step-indicator');
        if (badge) {
            badge.textContent = `🎮 เกมที่ ${this.currentGameIndex}/${this.totalGames}`;
        }
    }

    switchGame(index) {
        this.currentGameIndex = index;
        this.updateStepBadge();

        document.querySelectorAll('.game-tab').forEach((tab) => {
            tab.classList.remove('active');
        });

        const targetTab = document.getElementById(`game-tab-${index}`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        window.soundManager.playPop(600);
    }

    // ==========================================
    // 🃏 GAME 1: MEMORY MATCH
    // ==========================================
    initMemoryGame() {
        const grid = document.getElementById('memory-grid');
        const quoteToast = document.getElementById('memory-quote-toast');
        const nextBtn = document.getElementById('memory-next-btn');
        if (!grid) return;

        grid.innerHTML = '';
        this.memoryMatchedCount = 0;

        // ดึงการ์ด 4 คู่ (8 ใบ) จาก Config
        const cardsData = window.HBD_CONFIG.memoryCards;
        let deck = [];
        cardsData.forEach(card => {
            deck.push({ ...card, uniqueId: `${card.id}-a` });
            deck.push({ ...card, uniqueId: `${card.id}-b` });
        });

        // สับไพ่
        deck.sort(() => Math.random() - 0.5);

        deck.forEach(item => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.dataset.id = item.id;
            cardEl.dataset.quote = item.quote;

            cardEl.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-front">💖</div>
                    <div class="memory-back">
                        <span style="font-size: 2.2rem;">${item.icon}</span>
                    </div>
                </div>
            `;

            cardEl.addEventListener('click', () => {
                if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched') || this.memoryFlippedCards.length >= 2) {
                    return;
                }

                window.soundManager.playPop(500);
                cardEl.classList.add('flipped');
                this.memoryFlippedCards.push(cardEl);

                if (this.memoryFlippedCards.length === 2) {
                    const [c1, c2] = this.memoryFlippedCards;
                    if (c1.dataset.id === c2.dataset.id) {
                        // จับคู่ถูกต้อง
                        setTimeout(() => {
                            window.soundManager.playChime();
                            c1.classList.add('matched');
                            c2.classList.add('matched');
                            this.memoryFlippedCards = [];
                            this.memoryMatchedCount++;

                            // โชว์ข้อความความทรงจำซึ้งๆ
                            if (quoteToast) {
                                quoteToast.style.display = 'block';
                                quoteToast.innerHTML = `💌 <strong>${c1.dataset.quote}</strong>`;
                            }

                            // หากครบ 4 คู่
                            if (this.memoryMatchedCount === 4) {
                                if (window.confetti) window.confetti({ particleCount: 50, spread: 60 });
                                if (nextBtn) nextBtn.style.display = 'inline-flex';
                            }
                        }, 500);
                    } else {
                        // จับคู่ผิด พลิกกลับ
                        setTimeout(() => {
                            c1.classList.remove('flipped');
                            c2.classList.remove('flipped');
                            this.memoryFlippedCards = [];
                        }, 850);
                    }
                }
            });

            grid.appendChild(cardEl);
        });

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.switchGame(2));
        }
    }

    // ==========================================
    // 🧩 GAME 2: PUZZLE CHALLENGE
    // ==========================================
    initPuzzleGame() {
        const board = document.getElementById('puzzle-board');
        const nextBtn = document.getElementById('puzzle-next-btn');
        const messageEl = document.getElementById('puzzle-reveal-msg');
        if (!board) return;

        // ลายชิ้นส่วน 9 ชิ้น พร้อมไอคอน/สัญลักษณ์น่ารัก
        const icons = ['🌸', '🐱', '✨', '🎂', '💖', '🎁', '🍰', '🍓', '🎀'];

        // สับชิ้นส่วน
        this.puzzlePieces = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);

        const renderPuzzle = () => {
            board.innerHTML = '';
            this.puzzlePieces.forEach((pieceVal, slotIndex) => {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'puzzle-piece';
                if (this.selectedPuzzleIndex === slotIndex) {
                    pieceEl.classList.add('selected');
                }

                pieceEl.innerHTML = `
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <span>${icons[pieceVal]}</span>
                        <span style="font-size:0.75rem; color:#ff758c; font-weight:bold; margin-top:2px;">#${pieceVal + 1}</span>
                    </div>
                `;

                pieceEl.addEventListener('click', () => {
                    window.soundManager.playPop(620);
                    if (this.selectedPuzzleIndex === null) {
                        this.selectedPuzzleIndex = slotIndex;
                        renderPuzzle();
                    } else {
                        // สลับชิ้นส่วน
                        const temp = this.puzzlePieces[this.selectedPuzzleIndex];
                        this.puzzlePieces[this.selectedPuzzleIndex] = this.puzzlePieces[slotIndex];
                        this.puzzlePieces[slotIndex] = temp;
                        this.selectedPuzzleIndex = null;
                        renderPuzzle();
                        checkPuzzleWin();
                    }
                });

                board.appendChild(pieceEl);
            });
        };

        const checkPuzzleWin = () => {
            const isSolved = this.puzzlePieces.every((val, idx) => val === idx);
            if (isSolved) {
                window.soundManager.playVictory();
                if (window.confetti) window.confetti({ particleCount: 70, spread: 70 });
                if (messageEl) {
                    messageEl.style.display = 'block';
                    messageEl.textContent = window.HBD_CONFIG.puzzle.revealMessage;
                }
                if (nextBtn) nextBtn.style.display = 'inline-flex';
            }
        };

        renderPuzzle();

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.switchGame(3));
        }
    }

    // ==========================================
    // 🎡 GAME 3: MEMORY WHEEL
    // ==========================================
    initWheelGame() {
        const canvas = document.getElementById('wheel-canvas');
        const spinBtn = document.getElementById('wheel-spin-btn');
        const storyCard = document.getElementById('wheel-story-result');
        const nextBtn = document.getElementById('wheel-next-btn');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const stories = window.HBD_CONFIG.wheelStories;
        const totalSegments = stories.length;
        const segmentAngle = (2 * Math.PI) / totalSegments;

        const pastelColors = ['#ffccd5', '#ffe5d9', '#d8e2dc', '#fcd5ce', '#ffb5a7', '#e8dff5'];

        const drawWheel = () => {
            const width = canvas.width;
            const height = canvas.height;
            const radius = width / 2;
            ctx.clearRect(0, 0, width, height);

            stories.forEach((item, i) => {
                const angle = i * segmentAngle;
                ctx.beginPath();
                ctx.moveTo(radius, radius);
                ctx.arc(radius, radius, radius - 4, angle, angle + segmentAngle);
                ctx.closePath();
                ctx.fillStyle = pastelColors[i % pastelColors.length];
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.stroke();

                // วาดข้อความย่อ
                ctx.save();
                ctx.translate(radius, radius);
                ctx.rotate(angle + segmentAngle / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#4a282d';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(item.text.slice(0, 10) + '..', radius - 15, 4);
                ctx.restore();
            });
        };

        drawWheel();

        if (spinBtn) {
            spinBtn.addEventListener('click', () => {
                if (this.isWheelSpinning) return;
                this.isWheelSpinning = true;

                // สุ่มรอบหมุน 4-6 รอบเต็ม + องศาตก
                const randomFullRotations = 4 + Math.floor(Math.random() * 3);
                const randomSegmentIndex = Math.floor(Math.random() * totalSegments);
                const targetDegree = (randomFullRotations * 360) + (360 - (randomSegmentIndex * (360 / totalSegments)) - (180 / totalSegments));

                this.wheelRotation += targetDegree;
                canvas.style.transform = `rotate(${this.wheelRotation}deg)`;

                // เล่นเสียงติ๊กๆ
                let tickInterval = setInterval(() => {
                    window.soundManager.playTick();
                }, 120);

                setTimeout(() => {
                    clearInterval(tickInterval);
                    this.isWheelSpinning = false;
                    window.soundManager.playChime();

                    const winningStory = stories[randomSegmentIndex];
                    if (storyCard) {
                        storyCard.style.display = 'block';
                        storyCard.innerHTML = `
                            <div style="font-size:1.05rem; font-weight:700; color:#e04868; margin-bottom:6px;">✨ ${winningStory.text}</div>
                            <div style="font-size:0.92rem; color:#4a282d; line-height:1.5;">${winningStory.desc}</div>
                        `;
                    }

                    if (nextBtn) nextBtn.style.display = 'inline-flex';
                }, 4000);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.switchGame(4));
        }
    }

    // ==========================================
    // ❓ GAME 4: LOVE QUIZ
    // ==========================================
    initQuizGame() {
        const questionEl = document.getElementById('quiz-question-text');
        const optionsBox = document.getElementById('quiz-options-box');
        const reactionBox = document.getElementById('quiz-reaction-box');
        const finishBtn = document.getElementById('quiz-finish-btn');
        if (!questionEl || !optionsBox) return;

        const quizzes = window.HBD_CONFIG.quizzes;

        const loadQuiz = (idx) => {
            const current = quizzes[idx];
            questionEl.textContent = current.question;
            optionsBox.innerHTML = '';
            if (reactionBox) reactionBox.style.display = 'none';

            current.options.forEach((optText, optIndex) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-opt-btn';
                btn.textContent = optText;

                btn.addEventListener('click', () => {
                    // ปิดการกดช้อยส์อื่น
                    const allBtns = optionsBox.querySelectorAll('.quiz-opt-btn');
                    allBtns.forEach(b => b.disabled = true);

                    if (optIndex === current.correctIndex || current.correctIndex === 3) {
                        btn.classList.add('correct');
                        window.soundManager.playChime();
                    } else {
                        btn.classList.add('correct'); // ให้ถูกหมดเพื่อความหวาน
                        window.soundManager.playChime();
                    }

                    if (reactionBox) {
                        reactionBox.style.display = 'block';
                        reactionBox.textContent = `💬 ${current.sweetReaction}`;
                    }

                    // ขยับไปข้อถัดไป
                    setTimeout(() => {
                        if (this.currentQuizIndex < quizzes.length - 1) {
                            this.currentQuizIndex++;
                            loadQuiz(this.currentQuizIndex);
                        } else {
                            // เล่นครบทั้ง 4 ด่านแล้ว!
                            if (window.confetti) window.confetti({ particleCount: 100, spread: 80 });
                            window.soundManager.playVictory();
                            if (finishBtn) finishBtn.style.display = 'inline-flex';
                        }
                    }, 2400);
                });

                optionsBox.appendChild(btn);
            });
        };

        loadQuiz(0);

        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                window.soundManager.playSwoosh();
                window.app.goToScene('scene-gallery');
            });
        }
    }
}

window.miniGames = new MiniGamesController();
