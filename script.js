/* ==========================================================================
   ROMANTIC & CELEBRATORY BIRTHDAY COUNTDOWN SITE - LOGIC & INTERACTION
   Includes: Particle systems, Countdown checks, Audio control, and 3 games
   ========================================================================== */

// ==========================================
// 1. CONFIGURATION & CUSTOMIZATION POINTS
// ==========================================

// CUSTOMIZATION POINT: Change your target birthday date/time here.
// Format: ISO 8601 string. The "+05:30" denotes the timezone offset (e.g. IST).
// If you want it for UTC, use "2026-07-15T00:00:00Z".
const TARGET_DATE_STRING = "2026-07-29T00:00:00+05:30";

// CUSTOMIZATION POINT: Names of the characters
const TARGET_NAME = "Rishika";
const SENDER_NAME = "Aric";

// DOM References
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const lockedStateEl = document.getElementById("locked-state");
const unlockedStateEl = document.getElementById("unlocked-state");
const bgMusic = document.getElementById("bg-music");
const musicToggleBtn = document.getElementById("music-toggle-btn");
const pulsingBook = document.getElementById("pulsing-book");

// State tracking
let isUnlocked = false;
let countdownInterval;

// ==========================================
// 2. AMBIENT BACKGROUND FIREFLY CANVAS
// ==========================================

class AmbientFireflies {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.particles = [];
        this.maxParticles = 40;

        this.init();
        window.addEventListener("resize", () => this.resize());
    }

    init() {
        this.resize();
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle(true));
        }
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(randomY = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: randomY ? Math.random() * this.canvas.height : this.canvas.height + 20,
            radius: Math.random() * 2.5 + 0.8,
            speedY: Math.random() * 0.4 + 0.15,
            wiggleSpeed: Math.random() * 0.02 + 0.005,
            wiggleRange: Math.random() * 20 + 5,
            angle: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.6 + 0.2,
            pulseSpeed: Math.random() * 0.015 + 0.005,
            pulseDir: Math.random() > 0.5 ? 1 : -1
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, idx) => {
            // Update positions
            p.y -= p.speedY;
            p.angle += p.wiggleSpeed;
            p.x += Math.sin(p.angle) * 0.3; // sway side to side

            // Pulse opacity
            p.opacity += p.pulseSpeed * p.pulseDir;
            if (p.opacity > 0.8) {
                p.opacity = 0.8;
                p.pulseDir = -1;
            } else if (p.opacity < 0.1) {
                p.opacity = 0.1;
                p.pulseDir = 1;
            }

            // Draw glowing particle
            this.ctx.beginPath();
            const glow = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
            glow.addColorStop(0, `rgba(229, 169, 59, ${p.opacity})`);
            glow.addColorStop(0.3, `rgba(229, 169, 59, ${p.opacity * 0.5})`);
            glow.addColorStop(1, "rgba(229, 169, 59, 0)");

            this.ctx.fillStyle = glow;
            this.ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Reset if drifts off screen top or sides
            if (p.y < -10 || p.x < -10 || p.x > this.canvas.width + 10) {
                this.particles[idx] = this.createParticle(false);
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize fireflies on load
const fireflyBg = new AmbientFireflies("firefly-canvas");

// ==========================================
// 3. BACKGROUND MUSIC MANAGEMENT (YOUTUBE API)
// ==========================================

let isAudioPlaying = false;
let player;
let isPlayerReady = false;

// Dynamically load the YouTube IFrame API script
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Define global callback for YouTube API
window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: 'DDbJ8yEwUiA',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'playlist': 'DDbJ8yEwUiA', // Required for looping single video in YT player
            'start': 0,
            'mute': 0,
            'playsinline': 1,
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    isPlayerReady = true;
    player.setVolume(60); // Set to a pleasant ambient volume level (0-100)
}

function onPlayerStateChange(event) {
    // If the video ends (in case the playlist/loop parameters fail), seek to 0s and restart
    if (event.data === YT.PlayerState.ENDED) {
        player.seekTo(0);
        player.playVideo();
    }
}

musicToggleBtn.addEventListener("click", () => {
    if (!isPlayerReady) {
        // Gently indicate loading
        const originalText = musicToggleBtn.querySelector(".music-text").textContent;
        musicToggleBtn.querySelector(".music-text").textContent = "Loading Ambient...";
        setTimeout(() => {
            if (musicToggleBtn.querySelector(".music-text").textContent === "Loading Ambient...") {
                musicToggleBtn.querySelector(".music-text").textContent = originalText;
            }
        }, 1500);
        return;
    }

    if (isAudioPlaying) {
        player.pauseVideo();
        musicToggleBtn.classList.add("muted");
        musicToggleBtn.querySelector(".music-icon").classList.remove("icon-playing");
        isAudioPlaying = false;
    } else {
        player.playVideo();
        musicToggleBtn.classList.remove("muted");
        musicToggleBtn.querySelector(".music-icon").classList.add("icon-playing");
        isAudioPlaying = true;
    }
});
// ==========================================
// 4. WHILE YOU WAIT NAVIGATION & ACCORDION
// ==========================================

// Tabs switching
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const targetTabId = btn.getAttribute("data-target");

        // Deactivate active states
        tabBtns.forEach(b => b.classList.remove("active"));
        tabPanels.forEach(p => p.classList.remove("active"));

        // Activate selected
        btn.classList.add("active");
        document.getElementById(targetTabId).classList.add("active");
    });
});

// "Her Own Words" Quiz — text answers saved to localStorage so they persist
// between visits (this is a real deployed site, not a Claude artifact, so
// localStorage works fine here).
const QUIZ_STORAGE_KEY = "birthdaySiteQuizAnswers";
const quizTextareas = document.querySelectorAll(".quiz-textarea");
const quizSaveBtn = document.getElementById("quiz-save-btn");
const quizSaveStatus = document.getElementById("quiz-save-status");
const quizDeleteBtn = document.getElementById("quiz-delete-btn");

function loadQuizAnswers() {
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY)) || {};
    } catch (e) {
        saved = {};
    }
    quizTextareas.forEach(area => {
        const key = area.getAttribute("data-quiz-key");
        if (saved[key]) area.value = saved[key];
    });
}

function saveQuizAnswers() {
    const answers = {};
    quizTextareas.forEach(area => {
        answers[area.getAttribute("data-quiz-key")] = area.value;
    });
    try {
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(answers));
        if (quizSaveStatus) {
            quizSaveStatus.textContent = "✨ Saved";
            setTimeout(() => { quizSaveStatus.textContent = ""; }, 2500);
        }
    } catch (e) {
        if (quizSaveStatus) quizSaveStatus.textContent = "Couldn't save — try again";
    }
}

function deleteQuizAnswers() {

    if (!confirm("Reset all saved quiz answers?")) {
        return;
    }

    localStorage.removeItem(QUIZ_STORAGE_KEY);

    quizTextareas.forEach(area => {
        area.value = "";
    });

    quizSaveStatus.textContent = "🗑 Answers reset.";

    setTimeout(() => {
        quizSaveStatus.textContent = "";
    }, 2500);
}

if (quizTextareas.length) {
    loadQuizAnswers();
    // Also autosave quietly whenever a field loses focus
    quizTextareas.forEach(area => {
        area.addEventListener("blur", saveQuizAnswers);
    });
}

if (quizDeleteBtn) {
    quizDeleteBtn.addEventListener("click", deleteQuizAnswers);
}
// Toggle "Revisit Hub" in Unlocked state
const toggleHubBtn = document.getElementById("toggle-hub-btn");
const unlockedHubWrapper = document.getElementById("unlocked-hub-wrapper");

if (toggleHubBtn) {
    toggleHubBtn.addEventListener("click", () => {
        const isActive = toggleHubBtn.classList.contains("active");
        if (isActive) {
            toggleHubBtn.classList.remove("active");
            unlockedHubWrapper.classList.remove("active");
        } else {
            toggleHubBtn.classList.add("active");
            unlockedHubWrapper.classList.add("active");
        }
    });
}

// ==========================================
// 5. COUNTDOWN TIMER & REVEAL SYSTEM
// ==========================================

const targetTime = new Date(TARGET_DATE_STRING).getTime();
console.log("Target:", new Date(targetTime));
console.log("Now:", new Date());
console.log("Days:", Math.floor((targetTime - Date.now()) / (1000 * 60 * 60 * 24)));

function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetTime - now;

    // Trigger state change if count hits 0 or we are already past it
    if (difference <= 0) {
        clearInterval(countdownInterval);
        triggerReveal(now === targetTime); // true if unlocked in real-time, false if pre-unlocked
        return;
    }

    // Time calculations
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Write to DOM with leading zeroes
    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
}

function triggerReveal(isRealTime = false) {
    if (isUnlocked) return;
    isUnlocked = true;

    // Duplicate/Move the Q&A and Games hub into the unlocked page collapsible wrapper
    const hubNode = document.querySelector(".waiting-room-hub");
    if (hubNode && unlockedHubWrapper) {
        unlockedHubWrapper.appendChild(hubNode);
    }

    if (isRealTime) {
        // Magical real-time unlock transition
        pulsingBook.style.animation = "none";
        pulsingBook.style.transform = "scale(2)";
        pulsingBook.style.filter = "drop-shadow(0 0 40px rgba(229,169,59,1))";
        pulsingBook.style.opacity = "0";
        pulsingBook.style.transition = "transform 1.8s ease, filter 1.8s ease, opacity 1.8s ease";

        // Confetti burst helper
        setTimeout(() => {
            // Screen fades out, swap elements, fade back in
            lockedStateEl.classList.remove("active");

            setTimeout(() => {
                unlockedStateEl.classList.add("active");
                fireworkConfetti();
            }, 800);
        }, 1500);
    } else {
        // Pre-unlocked: Transition immediately
        lockedStateEl.classList.remove("active");
        unlockedStateEl.classList.add("active");
        // Trigger small welcoming confetti burst
        setTimeout(() => {
            fireworkConfetti();
        }, 1000);
    }
}

// Confetti Reveal Visuals
function fireworkConfetti() {
    if (typeof confetti !== "function") return;

    var duration = 4 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 1100 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function () {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 40 * (timeLeft / duration);
        // Confetti with warm golden, sunset, and rose colored themes
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#E5A93B', '#C57E88', '#F2D2D6', '#A3505D']
        }));
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#E5A93B', '#C57E88', '#F2D2D6', '#A3505D']
        }));
    }, 250);
}

// Initialize countdown updates
countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();


// ==========================================
// 6. MODAL OVERLAY MANAGER FOR GAMES
// ==========================================

const gameModal = document.getElementById("game-modal");

function openGame(gameType) {
    // Hide all game inner containers
    document.querySelectorAll(".game-container-inner").forEach(c => c.classList.remove("active"));

    // Show selected game inner container
    const activeGameContainer = document.getElementById(`game-${gameType}-container`);
    activeGameContainer.classList.add("active");

    // Open Modal overlay
    gameModal.classList.add("active");
    document.body.style.overflow = "hidden"; // disable body scrolling

    // Init specific game loop/setup
    if (gameType === 'scramble') {
        initScrambleGame();
    } else if (gameType === 'fillblank') {
        initFillBlankGame();
    } else if (gameType === 'reorder') {
        initReorderGame();
    }
}

function closeGame() {
    gameModal.classList.remove("active");
    document.body.style.overflow = ""; // enable scrolling
}

// Close modal if user clicks outside of card content
gameModal.addEventListener("click", (e) => {
    if (e.target === gameModal) {
        closeGame();
    }
});


// ==========================================
// 7. GAME 1: WORD BLOOM (WORD SCRAMBLE)
// ==========================================

// Gentle, thematic words — books, poetry, light, wanderlust
const SCRAMBLE_WORDS = [
    "BOOK", "LIGHT", "POETRY", "JOURNEY", "HORIZON",
    "FIREFLY", "LANTERN", "COMPASS", "MEADOW", "STARLIGHT",
    "PASSPORT", "WANDER"
];

let scrambleWordOrder = [];
let scrambleWordPointer = 0;
let scrambleCurrentWord = "";
let scrambleLetterPool = [];   // { char, used }
let scrambleAnswer = [];        // array of pool indices, in chosen order
let scrambleBloomCount = 0;

const scrambleAnswerSlotEl = document.getElementById("scramble-answer-slot");
const scrambleLettersEl = document.getElementById("scramble-letters");
const scrambleCountEl = document.getElementById("scramble-count");

function initScrambleGame() {
    scrambleBloomCount = 0;
    scrambleCountEl.textContent = 0;
    scrambleWordOrder = [...SCRAMBLE_WORDS];
    shuffleDeck(scrambleWordOrder);
    scrambleWordPointer = 0;
    loadNextScrambleWord();
}

function loadNextScrambleWord() {
    if (scrambleWordPointer >= scrambleWordOrder.length) {
        scrambleWordPointer = 0;
        shuffleDeck(scrambleWordOrder);
    }
    scrambleCurrentWord = scrambleWordOrder[scrambleWordPointer];
    scrambleWordPointer++;

    let letters = scrambleCurrentWord.split("");
    // Make sure the scrambled order isn't accidentally identical to the answer
    let scrambled;
    do {
        scrambled = [...letters];
        shuffleDeck(scrambled);
    } while (scrambled.join("") === scrambleCurrentWord && letters.length > 1);

    scrambleLetterPool = scrambled.map(char => ({ char, used: false }));
    scrambleAnswer = [];
    renderScrambleBoard();
}

function renderScrambleBoard() {
    // Answer slot
    scrambleAnswerSlotEl.innerHTML = "";
    for (let i = 0; i < scrambleCurrentWord.length; i++) {
        const slot = document.createElement("div");
        slot.classList.add("scramble-slot");
        if (scrambleAnswer[i] !== undefined) {
            const poolItem = scrambleLetterPool[scrambleAnswer[i]];
            slot.textContent = poolItem.char;
            slot.classList.add("filled");
            slot.addEventListener("click", () => removeScrambleLetter(i));
        }
        scrambleAnswerSlotEl.appendChild(slot);
    }

    // Letter pool
    scrambleLettersEl.innerHTML = "";
    scrambleLetterPool.forEach((item, idx) => {
        const tile = document.createElement("button");
        tile.classList.add("scramble-tile");
        tile.textContent = item.char;
        if (item.used) {
            tile.classList.add("used");
            tile.disabled = true;
        } else {
            tile.addEventListener("click", () => pickScrambleLetter(idx));
        }
        scrambleLettersEl.appendChild(tile);
    });
}

function pickScrambleLetter(poolIdx) {
    if (scrambleLetterPool[poolIdx].used) return;
    scrambleLetterPool[poolIdx].used = true;
    scrambleAnswer.push(poolIdx);
    renderScrambleBoard();

    if (scrambleAnswer.length === scrambleCurrentWord.length) {
        checkScrambleAnswer();
    }
}

function removeScrambleLetter(answerIdx) {
    const poolIdx = scrambleAnswer[answerIdx];
    scrambleLetterPool[poolIdx].used = false;
    scrambleAnswer.splice(answerIdx, 1);
    renderScrambleBoard();
}

function checkScrambleAnswer() {
    const built = scrambleAnswer.map(idx => scrambleLetterPool[idx].char).join("");
    if (built === scrambleCurrentWord) {
        scrambleBloomCount++;
        scrambleCountEl.textContent = scrambleBloomCount;
        scrambleAnswerSlotEl.classList.add("scramble-success");
        if (typeof confetti === "function") {
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        }
        setTimeout(() => {
            scrambleAnswerSlotEl.classList.remove("scramble-success");
            loadNextScrambleWord();
        }, 900);
    } else {
        scrambleAnswerSlotEl.classList.add("scramble-shake");
        setTimeout(() => {
            scrambleAnswerSlotEl.classList.remove("scramble-shake");
            // Return letters to the pool
            scrambleLetterPool.forEach(item => item.used = false);
            scrambleAnswer = [];
            renderScrambleBoard();
        }, 500);
    }
}

function skipScrambleWord() {
    loadNextScrambleWord();
}

function hintScrambleWord() {
    // Reveal the next correct, still-empty position
    const nextPos = scrambleAnswer.length;
    if (nextPos >= scrambleCurrentWord.length) return;
    const neededChar = scrambleCurrentWord[nextPos];
    const poolIdx = scrambleLetterPool.findIndex(item => !item.used && item.char === neededChar);
    if (poolIdx !== -1) {
        pickScrambleLetter(poolIdx);
    }
}


// ==========================================
// 8. GAME 2: FILL THE VERSE (POETRY FILL-IN-BLANK)
// ==========================================

// Tiny original verses with one blank each — self-written for this site
const FILLBLANK_VERSES = [
    {
        lines: ["The pages turn like {blank} take flight,", "each word a spark of golden light."],
        answer: "birds",
        options: ["birds", "stones", "clocks"]
    },
    {
        lines: ["Somewhere past the {blank} line,", "your compass points to paths yet mine."],
        answer: "horizon",
        options: ["horizon", "kitchen", "hallway"]
    },
    {
        lines: ["A {blank} of stars above the tent,", "map enough for wherever we went."],
        answer: "handful",
        options: ["handful", "basket", "ladder"]
    },
    {
        lines: ["Open the cover, breathe it in —", "every {blank} is a world to begin."],
        answer: "chapter",
        options: ["chapter", "engine", "ladder"]
    },
    {
        lines: ["Small and bright and full of {blank},", "she lights the room without a sound."],
        answer: "cheer",
        options: ["cheer", "stone", "fog"]
    }
];

let fillblankOrder = [];
let fillblankIndex = 0;

const fillblankBoardEl = document.getElementById("fillblank-board");
const fillblankProgressEl = document.getElementById("fillblank-progress");
const fillblankTotalEl = document.getElementById("fillblank-total");

function initFillBlankGame() {
    fillblankOrder = FILLBLANK_VERSES.map((v, i) => i);
    shuffleDeck(fillblankOrder);
    fillblankIndex = 0;
    if (fillblankTotalEl) fillblankTotalEl.textContent = FILLBLANK_VERSES.length;
    renderFillBlankVerse();
}

function renderFillBlankVerse() {
    if (fillblankIndex >= fillblankOrder.length) {
        fillblankBoardEl.innerHTML = `
            <div class="victory-message">
                <p class="victory-text serif-italic">"You found every word, just like you find the right ones for everyone around you." ✨</p>
            </div>
        `;
        if (typeof confetti === "function") {
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        }
        return;
    }

    if (fillblankProgressEl) fillblankProgressEl.textContent = fillblankIndex + 1;

    const verse = FILLBLANK_VERSES[fillblankOrder[fillblankIndex]];
    const shuffledOptions = [...verse.options];
    shuffleDeck(shuffledOptions);

    const linesHtml = verse.lines
        .map(line => line.replace("{blank}", `<span class="fillblank-target" id="fillblank-target">____</span>`))
        .join("<br>");

    fillblankBoardEl.innerHTML = `
        <p class="fillblank-verse-text serif-italic">${linesHtml}</p>
        <div class="fillblank-options" id="fillblank-options"></div>
    `;

    const optionsWrap = document.getElementById("fillblank-options");
    shuffledOptions.forEach(word => {
        const btn = document.createElement("button");
        btn.classList.add("fillblank-option-btn");
        btn.textContent = word;
        btn.addEventListener("click", () => handleFillBlankChoice(word, btn, verse.answer));
        optionsWrap.appendChild(btn);
    });
}

function handleFillBlankChoice(word, btnEl, correctAnswer) {
    if (word === correctAnswer) {
        const target = document.getElementById("fillblank-target");
        target.textContent = correctAnswer;
        target.classList.add("fillblank-filled");
        document.querySelectorAll(".fillblank-option-btn").forEach(b => b.disabled = true);
        if (typeof confetti === "function") {
            confetti({ particleCount: 25, spread: 45, origin: { y: 0.65 } });
        }
        setTimeout(() => {
            fillblankIndex++;
            renderFillBlankVerse();
        }, 1100);
    } else {
        btnEl.classList.add("fillblank-shake");
        setTimeout(() => btnEl.classList.remove("fillblank-shake"), 450);
    }
}


// ==========================================
// 9. GAME 3: VERSE WEAVER (POEM LINE REORDER)
// ==========================================

// Tiny original 4-line poems, self-written for this site
const REORDER_POEMS = [
    [
        "The morning opens like a page,",
        "spelling light in every stage.",
        "A single line, a single start —",
        "the whole wide world within your heart."
    ],
    [
        "Somewhere a compass waits for you,",
        "pointing toward the mornings new.",
        "Every road still finds its way",
        "back to where you'll want to stay."
    ],
    [
        "Small in step but tall in light,",
        "you carry stars into the night.",
        "Every page you've ever read",
        "lives quietly inside your head."
    ]
];

let reorderPoemOrder = [];
let reorderPoemIndex = 0;
let reorderCorrectLines = [];
let reorderShuffledLines = [];
let reorderPicked = []; // array of shuffled-index in the order clicked

const reorderBoardEl = document.getElementById("reorder-board");
const reorderProgressEl = document.getElementById("reorder-progress");
const reorderTotalEl = document.getElementById("reorder-total");
const reorderVictoryMsgEl = document.getElementById("reorder-victory-msg");
const reorderVictoryTextEl = document.getElementById("reorder-victory-text");

function initReorderGame() {
    reorderPoemOrder = REORDER_POEMS.map((p, i) => i);
    shuffleDeck(reorderPoemOrder);
    reorderPoemIndex = 0;
    if (reorderTotalEl) reorderTotalEl.textContent = REORDER_POEMS.length;
    loadReorderPoem();
}

function loadReorderPoem() {
    reorderVictoryMsgEl.classList.add("hidden");

    if (reorderPoemIndex >= reorderPoemOrder.length) {
        reorderBoardEl.innerHTML = "";
        reorderVictoryMsgEl.classList.remove("hidden");
        reorderVictoryTextEl.textContent = "You've woven every poem back together. ✨";
        if (typeof confetti === "function") {
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        }
        return;
    }

    if (reorderProgressEl) reorderProgressEl.textContent = reorderPoemIndex + 1;

    reorderCorrectLines = REORDER_POEMS[reorderPoemOrder[reorderPoemIndex]];
    reorderShuffledLines = reorderCorrectLines.map((line, i) => i);
    shuffleDeck(reorderShuffledLines);
    reorderPicked = [];
    renderReorderBoard();
}

function resetReorderGame() {
    reorderPicked = [];
    shuffleDeck(reorderShuffledLines);
    renderReorderBoard();
}

function renderReorderBoard() {
    reorderBoardEl.innerHTML = "";

    // "Your poem so far" area
    const sequenceWrap = document.createElement("div");
    sequenceWrap.classList.add("reorder-sequence");
    reorderPicked.forEach((lineIdx, order) => {
        const line = document.createElement("div");
        line.classList.add("reorder-sequence-line");
        line.innerHTML = `<span class="reorder-line-number">${order + 1}</span> ${reorderCorrectLines[lineIdx]}`;
        sequenceWrap.appendChild(line);
    });
    reorderBoardEl.appendChild(sequenceWrap);

    // Remaining pool of lines to click, in shuffled order
    const poolWrap = document.createElement("div");
    poolWrap.classList.add("reorder-pool");
    reorderShuffledLines.forEach(lineIdx => {
        if (reorderPicked.includes(lineIdx)) return;
        const lineBtn = document.createElement("button");
        lineBtn.classList.add("reorder-pool-line");
        lineBtn.textContent = reorderCorrectLines[lineIdx];
        lineBtn.addEventListener("click", () => pickReorderLine(lineIdx));
        poolWrap.appendChild(lineBtn);
    });
    reorderBoardEl.appendChild(poolWrap);
}

function pickReorderLine(lineIdx) {
    reorderPicked.push(lineIdx);
    renderReorderBoard();

    if (reorderPicked.length === reorderCorrectLines.length) {
        const isCorrect = reorderPicked.every((lineIdx, i) => lineIdx === i);
        if (isCorrect) {
            reorderVictoryMsgEl.classList.remove("hidden");
            reorderVictoryTextEl.textContent = "Beautifully woven. ✨";
            if (typeof confetti === "function") {
                confetti({ particleCount: 40, spread: 60, origin: { y: 0.65 } });
            }
            setTimeout(() => {
                reorderPoemIndex++;
                loadReorderPoem();
            }, 1600);
        } else {
            reorderBoardEl.classList.add("reorder-shake");
            setTimeout(() => {
                reorderBoardEl.classList.remove("reorder-shake");
                reorderPicked = [];
                renderReorderBoard();
            }, 550);
        }
    }
}


// ==========================================
// 10. SHARED HELPER — SHUFFLE (used by all 3 games)
// ==========================================

function shuffleDeck(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
