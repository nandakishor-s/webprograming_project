// ========================================================
//  MIND GAMES ENGINE — 5 Games with Firestore score saving
// ========================================================

const MindGames = {

    // ── State ──
    currentGame: null,
    overlay: null,
    arena: null,
    titleEl: null,
    statA: null,
    statB: null,

    // ── Init (called from initApp) ──
    async init() {
        this.overlay = document.getElementById('gameOverlay');
        this.arena = document.getElementById('gameArena');
        this.titleEl = document.getElementById('gameOverlayTitle');
        this.statA = document.getElementById('gameStatA');
        this.statB = document.getElementById('gameStatB');

        // Load high scores
        try {
            const scores = await DataService.getAllHighScores();
            Object.keys(scores).forEach(game => {
                const el = document.getElementById(`best${game.charAt(0).toUpperCase() + game.slice(1)}`);
                if (el) el.textContent = `Best: ${scores[game]}`;
            });
        } catch(e) {}

        // Game card click handlers
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const game = card.dataset.game;
                this.openGame(game);
            });
        });

        // Back button
        document.getElementById('gameBackBtn').addEventListener('click', () => {
            this.closeGame();
        });
    },

    openGame(game) {
        this.currentGame = game;
        this.overlay.classList.add('active');
        this.arena.innerHTML = '';
        this.statA.textContent = '';
        this.statB.textContent = '';
        document.body.style.overflow = 'hidden';

        switch(game) {
            case 'focusshot': this.startFocusShot(); break;
            case 'colormatch': this.startColorMatch(); break;
            case 'memoryflip': this.startMemoryFlip(); break;
            case 'patternrecall': this.startPatternRecall(); break;
            case 'zenpuzzle': this.startZenPuzzle(); break;
        }
    },

    closeGame() {
        this.overlay.classList.remove('active');
        this.arena.innerHTML = '';
        document.body.style.overflow = '';
        // Stop any running game intervals
        if (this._interval) { clearInterval(this._interval); this._interval = null; }
        if (this._timeout) { clearTimeout(this._timeout); this._timeout = null; }
        this.currentGame = null;
    },

    async saveScore(game, score) {
        try {
            await DataService.saveGameScore(game, score);
            const high = await DataService.getHighScore(game);
            const el = document.getElementById(`best${game.charAt(0).toUpperCase() + game.slice(1)}`);
            if (el) el.textContent = `Best: ${high}`;
            return high;
        } catch(e) {
            console.warn('Score save error:', e);
            return score;
        }
    },

    showResult(title, score, label, game) {
        this.arena.innerHTML = `
            <div class="game-result-screen">
                <h3>${title}</h3>
                <div class="result-score">${score}</div>
                <div class="result-label">${label}</div>
                <button class="btn" id="gamePlayAgain" style="margin-top: 10px;"><i class="fas fa-redo"></i> Play Again</button>
                <button class="btn" style="background: var(--bg-color); color: var(--text-main); margin-top: 6px;" id="gameGoBack"><i class="fas fa-arrow-left"></i> Back to Games</button>
            </div>
        `;
        document.getElementById('gamePlayAgain').addEventListener('click', () => this.openGame(game));
        document.getElementById('gameGoBack').addEventListener('click', () => this.closeGame());
    },

    // ================================================================
    //  1. FOCUS SHOT (Aim Trainer / Gridshot)
    // ================================================================
    startFocusShot() {
        this.titleEl.textContent = 'Focus Shot';
        let score = 0, timeLeft = 60, running = false;

        this.statA.textContent = `Time: 60s`;
        this.statB.textContent = `Score: 0`;

        this.arena.innerHTML = `
            <div class="aim-game-wrapper">
                <div id="fsContainer" class="aim-area">
                    <div class="aim-start-text">Tap to Start</div>
                </div>
            </div>
        `;

        const container = document.getElementById('fsContainer');
        const hitSound = new Audio('https://www.soundjay.com/buttons/sounds/button-20.mp3');

        const spawnTarget = () => {
            if (!running || container.querySelectorAll('.aim-target').length >= 3) return;
            const target = document.createElement('div');
            target.className = 'aim-target';
            const margin = 40;
            const maxX = container.clientWidth - margin * 2;
            const maxY = container.clientHeight - margin * 2;
            target.style.left = `${Math.random() * maxX + margin}px`;
            target.style.top = `${Math.random() * maxY + margin}px`;

            const hitHandler = (e) => {
                e.preventDefault();
                if (!running) return;
                hitSound.currentTime = 0;
                hitSound.play().catch(() => {});
                score++;
                this.statB.textContent = `Score: ${score}`;
                target.remove();
                spawnTarget();
            };
            target.addEventListener('mousedown', hitHandler);
            target.addEventListener('touchstart', hitHandler);
            container.appendChild(target);
        };

        const startGame = () => {
            if (running) return;
            running = true;
            score = 0;
            timeLeft = 60;
            container.innerHTML = '';
            this.statA.textContent = `Time: 60s`;
            this.statB.textContent = `Score: 0`;
            for (let i = 0; i < 3; i++) spawnTarget();

            this._interval = setInterval(async () => {
                timeLeft--;
                this.statA.textContent = `Time: ${timeLeft}s`;
                if (timeLeft <= 0) {
                    clearInterval(this._interval);
                    running = false;
                    const high = await this.saveScore('focusshot', score);
                    this.showResult("Time's Up!", score, `High Score: ${high}`, 'focusshot');
                }
            }, 1000);
        };

        container.addEventListener('click', function handler() {
            container.removeEventListener('click', handler);
            startGame();
        });
    },

    // ================================================================
    //  2. COLOR MATCH (Stroop Effect)
    // ================================================================
    startColorMatch() {
        this.titleEl.textContent = 'Color Match';

        const COLORS = [
            { name: 'RED', hex: '#ff4757' },
            { name: 'BLUE', hex: '#3742fa' },
            { name: 'GREEN', hex: '#2ed573' },
            { name: 'YELLOW', hex: '#ffa502' },
        ];
        let score = 0, timeLeft = 30, running = false, currentAnswer = null;

        this.statA.textContent = `Time: 30s`;
        this.statB.textContent = `Score: 0`;

        this.arena.innerHTML = `
            <div class="colormatch-wrapper">
                <div style="color: var(--text-muted); font-size: 0.9rem;">What COLOR is the text displayed in?</div>
                <div class="cm-word" id="cmWord">Tap Start</div>
                <div class="cm-buttons" id="cmButtons"></div>
                <button class="btn" id="cmStart"><i class="fas fa-play"></i> Start (30s)</button>
            </div>
        `;

        const wordEl = document.getElementById('cmWord');
        const btnContainer = document.getElementById('cmButtons');

        // Create color buttons
        COLORS.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'cm-btn';
            btn.style.background = c.hex;
            btn.textContent = c.name;
            btn.dataset.color = c.name;
            btn.addEventListener('click', () => {
                if (!running) return;
                if (c.name === currentAnswer) {
                    score++;
                    this.statB.textContent = `Score: ${score}`;
                    btn.classList.add('correct-flash');
                    setTimeout(() => btn.classList.remove('correct-flash'), 200);
                } else {
                    btn.classList.add('wrong-flash');
                    setTimeout(() => btn.classList.remove('wrong-flash'), 200);
                }
                nextRound();
            });
            btnContainer.appendChild(btn);
        });

        const nextRound = () => {
            // Pick a random word and a DIFFERENT color for it
            const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            let textColor;
            do {
                textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            } while (textColor.name === wordColor.name && Math.random() > 0.25);
            // 25% chance the word matches the color (to keep players honest)

            wordEl.textContent = wordColor.name;
            wordEl.style.color = textColor.hex;
            currentAnswer = textColor.name; // Correct answer is the DISPLAY color
        };

        document.getElementById('cmStart').addEventListener('click', () => {
            if (running) return;
            running = true;
            score = 0;
            timeLeft = 30;
            this.statB.textContent = `Score: 0`;
            document.getElementById('cmStart').style.display = 'none';
            nextRound();

            this._interval = setInterval(async () => {
                timeLeft--;
                this.statA.textContent = `Time: ${timeLeft}s`;
                if (timeLeft <= 0) {
                    clearInterval(this._interval);
                    running = false;
                    const high = await this.saveScore('colormatch', score);
                    this.showResult('Color Match!', score, `High Score: ${high}`, 'colormatch');
                }
            }, 1000);
        });
    },

    // ================================================================
    //  3. MEMORY FLIP (Card Matching)
    // ================================================================
    startMemoryFlip() {
        this.titleEl.textContent = 'Memory Flip';

        const ICONS = ['🌿', '☀️', '🌙', '🌊', '❤️', '⭐', '☁️', '🌸'];
        let pairs = [...ICONS, ...ICONS];
        let moves = 0, matched = 0, firstCard = null, secondCard = null, locked = false;
        let startTime = null;

        // Shuffle
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }

        this.statA.textContent = `Moves: 0`;
        this.statB.textContent = `Pairs: 0/8`;

        this.arena.innerHTML = `<div class="memoryflip-wrapper"><div class="mf-grid" id="mfGrid"></div></div>`;
        const grid = document.getElementById('mfGrid');

        pairs.forEach((icon, i) => {
            const card = document.createElement('div');
            card.className = 'mf-card';
            card.dataset.index = i;
            card.dataset.icon = icon;
            card.innerHTML = `
                <div class="mf-card-inner">
                    <div class="mf-face mf-back"><i class="fas fa-question"></i></div>
                    <div class="mf-face mf-front">${icon}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
                if (!startTime) startTime = Date.now();

                card.classList.add('flipped');

                if (!firstCard) {
                    firstCard = card;
                } else {
                    secondCard = card;
                    moves++;
                    this.statA.textContent = `Moves: ${moves}`;
                    locked = true;

                    if (firstCard.dataset.icon === secondCard.dataset.icon) {
                        firstCard.classList.add('matched');
                        secondCard.classList.add('matched');
                        matched++;
                        this.statB.textContent = `Pairs: ${matched}/8`;
                        firstCard = null;
                        secondCard = null;
                        locked = false;

                        if (matched === 8) {
                            const timeTaken = Math.round((Date.now() - startTime) / 1000);
                            // Score = lower is better, so we save moves
                            const gameScore = moves;
                            this.saveScore('memoryflip', gameScore).then(high => {
                                setTimeout(() => {
                                    this.showResult('All Matched!', `${moves} moves`, `Time: ${timeTaken}s | Best: ${high} moves`, 'memoryflip');
                                }, 500);
                            });
                        }
                    } else {
                        setTimeout(() => {
                            firstCard.classList.remove('flipped');
                            secondCard.classList.remove('flipped');
                            firstCard = null;
                            secondCard = null;
                            locked = false;
                        }, 700);
                    }
                }
            });

            grid.appendChild(card);
        });
    },

    // ================================================================
    //  4. PATTERN RECALL (Simon Says)
    // ================================================================
    startPatternRecall() {
        this.titleEl.textContent = 'Pattern Recall';

        const QUAD_COLORS = [
            { bg: '#ff4757', lit: '#ff6b81' },
            { bg: '#3742fa', lit: '#5352ed' },
            { bg: '#2ed573', lit: '#7bed9f' },
            { bg: '#ffa502', lit: '#ffda79' },
        ];

        let sequence = [], playerIndex = 0, level = 0, canPlay = false;

        this.statA.textContent = `Level: 0`;
        this.statB.textContent = '';

        this.arena.innerHTML = `
            <div class="pattern-wrapper">
                <div class="pattern-status" id="prStatus">Watch the pattern!</div>
                <div class="pattern-grid" id="prGrid"></div>
                <button class="btn" id="prStart"><i class="fas fa-play"></i> Start</button>
            </div>
        `;

        const grid = document.getElementById('prGrid');
        const statusEl = document.getElementById('prStatus');
        const quads = [];

        QUAD_COLORS.forEach((c, i) => {
            const quad = document.createElement('div');
            quad.className = 'pattern-quad';
            quad.style.background = c.bg;
            quad.style.color = c.bg;
            quad.dataset.index = i;
            quads.push(quad);

            quad.addEventListener('click', () => {
                if (!canPlay) return;
                flashQuad(i, 200);

                if (i === sequence[playerIndex]) {
                    playerIndex++;
                    if (playerIndex === sequence.length) {
                        canPlay = false;
                        statusEl.textContent = 'Correct! Next round...';
                        setTimeout(() => nextRound(), 800);
                    }
                } else {
                    canPlay = false;
                    statusEl.textContent = `Game Over! You reached Level ${level}`;
                    this.saveScore('patternrecall', level).then(high => {
                        setTimeout(() => {
                            this.showResult('Pattern Recall', `Level ${level}`, `High Score: Level ${high}`, 'patternrecall');
                        }, 1000);
                    });
                }
            });

            grid.appendChild(quad);
        });

        const flashQuad = (index, duration) => {
            const q = quads[index];
            q.classList.add('lit');
            q.style.background = QUAD_COLORS[index].lit;
            setTimeout(() => {
                q.classList.remove('lit');
                q.style.background = QUAD_COLORS[index].bg;
            }, duration);
        };

        const playSequence = async () => {
            canPlay = false;
            statusEl.textContent = 'Watch carefully...';
            await new Promise(r => setTimeout(r, 500));

            for (let i = 0; i < sequence.length; i++) {
                await new Promise(r => setTimeout(r, 400));
                flashQuad(sequence[i], 350);
            }

            await new Promise(r => setTimeout(r, 500));
            canPlay = true;
            playerIndex = 0;
            statusEl.textContent = 'Your turn! Repeat the pattern.';
        };

        const nextRound = () => {
            level++;
            this.statA.textContent = `Level: ${level}`;
            // Add a new random step
            sequence.push(Math.floor(Math.random() * 4));
            playSequence();
        };

        document.getElementById('prStart').addEventListener('click', function() {
            this.style.display = 'none';
            sequence = [];
            level = 0;
            nextRound();
        });
    },

    // ================================================================
    //  5. ZEN PUZZLE (3x3 Sliding Tiles)
    // ================================================================
    startZenPuzzle() {
        this.titleEl.textContent = 'Zen Puzzle';

        const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        let tiles = [...SOLVED];
        let moves = 0, startTime = null;

        // Shuffle (only solvable states)
        const shuffle = () => {
            // Do random moves from solved to guarantee solvability
            let emptyIdx = 8;
            for (let i = 0; i < 200; i++) {
                const neighbors = getNeighbors(emptyIdx);
                const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
                [tiles[emptyIdx], tiles[pick]] = [tiles[pick], tiles[emptyIdx]];
                emptyIdx = pick;
            }
        };

        const getNeighbors = (idx) => {
            const row = Math.floor(idx / 3), col = idx % 3;
            const n = [];
            if (row > 0) n.push(idx - 3);
            if (row < 2) n.push(idx + 3);
            if (col > 0) n.push(idx - 1);
            if (col < 2) n.push(idx + 1);
            return n;
        };

        const isSolved = () => tiles.every((t, i) => t === SOLVED[i]);

        this.statA.textContent = `Moves: 0`;
        this.statB.textContent = '';

        this.arena.innerHTML = `
            <div class="zenpuzzle-wrapper">
                <div class="zp-status" id="zpStatus">Slide tiles to arrange 1-8 in order</div>
                <div class="zp-grid" id="zpGrid"></div>
                <button class="btn" id="zpShuffle"><i class="fas fa-random"></i> New Puzzle</button>
            </div>
        `;

        const gridEl = document.getElementById('zpGrid');
        const statusEl = document.getElementById('zpStatus');

        const TILE_COLORS = [
            '', // 0 = empty
            'linear-gradient(135deg, #747dff, #5c65ff)',
            'linear-gradient(135deg, #8c94ff, #747dff)',
            'linear-gradient(135deg, #2ed573, #20bf6b)',
            'linear-gradient(135deg, #ffa502, #e17055)',
            'linear-gradient(135deg, #ff4757, #ff6b81)',
            'linear-gradient(135deg, #3742fa, #5352ed)',
            'linear-gradient(135deg, #00b894, #00cec9)',
            'linear-gradient(135deg, #fdcb6e, #f9ca24)',
        ];

        const render = () => {
            gridEl.innerHTML = '';
            tiles.forEach((num, i) => {
                const tile = document.createElement('div');
                tile.className = 'zp-tile' + (num === 0 ? ' empty' : '');
                tile.textContent = num === 0 ? '' : num;
                if (num > 0) tile.style.background = TILE_COLORS[num];

                tile.addEventListener('click', () => {
                    if (num === 0) return;
                    const emptyIdx = tiles.indexOf(0);
                    const neighbors = getNeighbors(i);

                    if (neighbors.includes(emptyIdx)) {
                        if (!startTime) startTime = Date.now();
                        [tiles[i], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[i]];
                        moves++;
                        this.statA.textContent = `Moves: ${moves}`;
                        render();

                        if (isSolved()) {
                            const timeTaken = Math.round((Date.now() - startTime) / 1000);
                            statusEl.textContent = '🎉 Solved!';
                            this.saveScore('zenpuzzle', moves).then(high => {
                                setTimeout(() => {
                                    this.showResult('Puzzle Solved!', `${moves} moves`, `Time: ${timeTaken}s | Best: ${high} moves`, 'zenpuzzle');
                                }, 600);
                            });
                        }
                    }
                });

                gridEl.appendChild(tile);
            });
        };

        const newGame = () => {
            tiles = [...SOLVED];
            shuffle();
            moves = 0;
            startTime = null;
            this.statA.textContent = `Moves: 0`;
            statusEl.textContent = 'Slide tiles to arrange 1-8 in order';
            render();
        };

        document.getElementById('zpShuffle').addEventListener('click', newGame);
        newGame();
    }
};
