const playArea = document.getElementById("playArea");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const result = document.getElementById("result");

// --- Yes button growth settings ---
let yesScale = 1;
const YES_GROWTH_PER_DODGE = 0.08; // 8% bigger each dodge
const YES_MAX_SCALE = 2.2; // cap it so it doesn't get ridiculous

// --- "No" text progression ---
const noTexts = ["No", "Are you sure?", "Really sure?", "Ok but... no 😅"];
let noTextIndex = 0;

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

// Keep the "No" button away from the "Yes" button a bit (optional but helps)
function isTooCloseToYes(x, y) {
  const yesRect = yesBtn.getBoundingClientRect();
  const areaRect = playArea.getBoundingClientRect();

  // Convert candidate (x,y) inside play area to viewport coords
  const candidateCenterX = areaRect.left + x + noBtn.offsetWidth / 2;
  const candidateCenterY = areaRect.top + y + noBtn.offsetHeight / 2;

  const yesCenterX = yesRect.left + yesRect.width / 2;
  const yesCenterY = yesRect.top + yesRect.height / 2;

  const dx = candidateCenterX - yesCenterX;
  const dy = candidateCenterY - yesCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return dist < 90; // px
}

// --- Dodge behavior ---
function growYes() {
  yesScale = Math.min(YES_MAX_SCALE, yesScale + YES_GROWTH_PER_DODGE);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.style.filter = yesScale > 1.6 ? "brightness(1.05)" : "none";
}

function advanceNoText() {
  noTextIndex = (noTextIndex + 1) % noTexts.length;
  noBtn.textContent = noTexts[noTextIndex];
}

function dodge() {
  // Update "No" text and grow "Yes"
  advanceNoText();
  growYes();

  // Find a random position, retry a few times to avoid being too close to Yes
  let pos = getRandomPositionInside(playArea, noBtn);
  for (let i = 0; i < 10 && isTooCloseToYes(pos.x, pos.y); i++) {
    pos = getRandomPositionInside(playArea, noBtn);
  }

  setButtonPosition(noBtn, pos.x, pos.y);
}

// Initialize positions (use px so movement is consistent)
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

  // Ensure initial "No" text is exactly "No"
  noBtn.textContent = noTexts[0];
});

// Desktop: move when hovered
noBtn.addEventListener("mouseenter", dodge);
// Mobile: move when touched
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
  // Account for device pixel ratio for crispness
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

function launchConfetti(durationMs = 2200) {
  const start = performance.now();
  const particles = [];
  const W = window.innerWidth;
  const H = window.innerHeight;

  const COLORS = ["#ff4d6d", "#ffb703", "#8ecae6", "#06d6a0", "#8338ec", "#fb5607"];

  // Create particles
  const count = 180;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: randomBetween(W * 0.2, W * 0.8),
      y: randomBetween(-40, -10),
      vx: randomBetween(-2.2, 2.2),
      vy: randomBetween(2.5, 6.5),
      size: randomBetween(6, 12),
      rot: randomBetween(0, Math.PI),
      vr: randomBetween(-0.2, 0.2),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() < 0.5 ? "rect" : "circle",
    });
  }

  function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Simple gravity + drift
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
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Stop after duration or once most are offscreen
    const offscreenCount = particles.filter((p) => p.y > H + 40).length;
    if (t < durationMs && offscreenCount < particles.length * 0.9) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  requestAnimationFrame(frame);
}

// Clicking "Yes" => message + confetti
yesBtn.addEventListener("click", () => {
  result.textContent = "Yay!! 💖 See you on Valentine’s! 🥰";
  launchConfetti();
});
