const playArea = document.getElementById("playArea");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const result = document.getElementById("result");
const hintText = document.getElementById("hintText");
const meterFill = document.getElementById("meterFill");
const trailLayer = document.getElementById("trailLayer");

// --- Yes button growth settings ---
let yesScale = 1;
const YES_GROWTH_PER_DODGE = 0.08; // 8% each dodge
const YES_MAX_SCALE = 2.2;

// --- Dodge progress ---
let dodgeCount = 0;

// --- "No" text progression ---
const noTexts = ["No", "Are you sure?", "Really sure?", "Ok but... no 😅", "Pls? 🥺"];
let noTextIndex = 0;

// --- Playful hint progression ---
const hints = [
  "(Choose wisely 😄)",
  "(Don’t be shy 😌)",
  "(This is getting serious 😳)",
  "(I’m running out of No’s… 😅)",
  "(Just tap Yes already 💖)",
];

// --- Floating hearts background ---
const HEARTS = ["💗", "💖", "💘", "💕", "💓", "❤️"];
let heartsIntervalId = null;

function spawnHeart() {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];

  const left = Math.random() * 100;
  const duration = 4 + Math.random() * 4; // 4–8s
  const size = 14 + Math.random() * 20; // 14–34px
  const drift = `${-50 + Math.random() * 100}px`; // -50..+50

  heart.style.left = `${left}vw`;
  heart.style.fontSize = `${size}px`;
  heart.style.animationDuration = `${duration}s`;
  heart.style.setProperty("--drift", drift);

  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}

function startHearts() {
  if (heartsIntervalId) return;
  heartsIntervalId = setInterval(spawnHeart, 260);
}

// --- Helpers: positions inside play area ---
function getRandomPositionInside(areaEl, buttonEl) {
  const areaRect = areaEl.getBoundingClientRect();
  const btnRect = buttonEl.getBoundingClientRect();

  const maxX = areaRect.width - btnRect.width;
  const maxY = areaRect.height - btnRect.height;

  const x = Math.max(0, Math.floor(Math.random() * Math.max(1, maxX)));
  const y = Math.max(0, Math.floor(Math.random() * Math.max(1, maxY)));

  return { x, y };
}

function setButtonPosition(buttonEl, x, y) {
  buttonEl.style.left = `${x}px`;
  buttonEl.style.top = `${y}px`;
}

// Keep "No" a bit away from "Yes" (feels nicer)
function isTooCloseToYes(x, y) {
  const yesRect = yesBtn.getBoundingClientRect();
  const areaRect = playArea.getBoundingClientRect();

  const candidateCenterX = areaRect.left + x + noBtn.offsetWidth / 2;
  const candidateCenterY = areaRect.top + y + noBtn.offsetHeight / 2;

  const yesCenterX = yesRect.left + yesRect.width / 2;
  const yesCenterY = yesRect.top + yesRect.height / 2;

  const dx = candidateCenterX - yesCenterX;
  const dy = candidateCenterY - yesCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return dist < 95;
}

// --- Heart trail inside play area ---
function spawnTrailHeartAtCurrentNo() {
  const areaRect = playArea.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();

  const x = noRect.left - areaRect.left + noRect.width / 2;
  const y = noRect.top - areaRect.top + noRect.height / 2;

  const el = document.createElement("div");
  el.className = "trail-heart";
  el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.fontSize = `${12 + Math.random() * 12}px`;
  trailLayer.appendChild(el);

  setTimeout(() => el.remove(), 700);
}

// --- UI updates per dodge ---
function growYes() {
  yesScale = Math.min(YES_MAX_SCALE, yesScale + YES_GROWTH_PER_DODGE);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.style.filter = yesScale > 1.6 ? "brightness(1.06)" : "none";
}

function advanceNoText() {
  noTextIndex = (noTextIndex + 1) % noTexts.length;
  noBtn.textContent = noTexts[noTextIndex];
}

function updateHintAndMeter() {
  const hintIdx = Math.min(hints.length - 1, Math.floor(dodgeCount / 2));
  hintText.textContent = hints[hintIdx];

  // Resistance meter: cap at 100%
  const pct = Math.min(100, dodgeCount * 12);
  meterFill.style.width = `${pct}%`;
}

// --- Dodge behavior ---
function dodge() {
  dodgeCount += 1;

  // Trail heart at old spot
  spawnTrailHeartAtCurrentNo();

  // Update text + grow yes + hint/meter
  advanceNoText();
  growYes();
  updateHintAndMeter();

  // Move "No"
  let pos = getRandomPositionInside(playArea, noBtn);
  for (let i = 0; i < 10 && isTooCloseToYes(pos.x, pos.y); i++) {
    pos = getRandomPositionInside(playArea, noBtn);
  }
  setButtonPosition(noBtn, pos.x, pos.y);
}

// Initialize
window.addEventListener("load", () => {
  setButtonPosition(
    yesBtn,
    Math.floor(playArea.clientWidth * 0.32),
    Math.floor(playArea.clientHeight * 0.55)
  );

  setButtonPosition(
    noBtn,
    Math.floor(playArea.clientWidth * 0.58),
    Math.floor(playArea.clientHeight * 0.55)
  );

  noBtn.textContent = noTexts[0];
  startHearts();
});

// Desktop: move when hovered
noBtn.addEventListener("mouseenter", dodge);
// Mobile: move when touched (prevents click)
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodge();
});
// Keyboard: move when focused
noBtn.addEventListener("focus", dodge);

// --- Confetti (no libraries) ---
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");

function resizeConfettiCanvas() {
  const dpr = window.devicePixelRatio || 1;
  confettiCanvas.width = Math.floor(window.innerWidth * dpr);
  confettiCanvas.height = Math.floor(window.innerHeight * dpr);
  confettiCanvas.style.width = `${window.innerWidth}px`;
  confettiCanvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeConfettiCanvas);
resizeConfettiCanvas();

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function launchConfetti(durationMs = 2400) {
  const start = performance.now();
  const particles = [];
  const W = window.innerWidth;
  const H = window.innerHeight;

  const COLORS = ["#ff4d6d", "#ffb703", "#8ecae6", "#06d6a0", "#8338ec", "#fb5607"];

  const count = 200;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: randomBetween(W * 0.2, W * 0.8),
      y: randomBetween(-40, -10),
      vx: randomBetween(-2.4, 2.4),
      vy: randomBetween(2.6, 7.0),
      size: randomBetween(6, 12),
      rot: randomBetween(0, Math.PI),
      vr: randomBetween(-0.22, 0.22),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() < 0.42 ? "heart" : Math.random() < 0.7 ? "rect" : "circle",
    });
  }

  function drawHeart(size) {
    // Simple heart path
    ctx.beginPath();
    ctx.moveTo(0, size * 0.25);
    ctx.bezierCurveTo(-size * 0.5, -size * 0.25, -size, size * 0.35, 0, size);
    ctx.bezierCurveTo(size, size * 0.35, size * 0.5, -size * 0.25, 0, size * 0.25);
    ctx.closePath();
    ctx.fill();
  }

  function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of particles) {
      p.vy += 0.03; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawHeart(p.size);
      }

      ctx.restore();
    }

    const off = particles.filter((p) => p.y > H + 60).length;
    if (t < durationMs && off < particles.length * 0.92) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  requestAnimationFrame(frame);
}

// Clicking "Yes" => message + confetti + extra hearts
yesBtn.addEventListener("click", () => {
  result.textContent = "Yay!! 💖 See you on Valentine’s! 🥰";
  launchConfetti(2600);
  startHearts();

  // Tiny “final glow”
  yesBtn.style.transform = `scale(${Math.min(YES_MAX_SCALE, yesScale + 0.18)})`;
});
