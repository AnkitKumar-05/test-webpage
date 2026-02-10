// ========= DOM =========
const playArea = document.getElementById("playArea");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const result = document.getElementById("result");
const hintText = document.getElementById("hintText");
const meterFill = document.getElementById("meterFill");
const trailLayer = document.getElementById("trailLayer");

const questionEl = document.getElementById("questionText");

// Modal
const modal = document.getElementById("successModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const addToGoogleBtn = document.getElementById("addToGoogleBtn");
const downloadIcsBtn = document.getElementById("downloadIcsBtn");
const copyDetailsBtn = document.getElementById("copyDetailsBtn");

// Form fields
const dateInput = document.getElementById("dateInput");
const startTimeInput = document.getElementById("startTimeInput");
const durationInput = document.getElementById("durationInput");
const titleInput = document.getElementById("titleInput");
const locationInput = document.getElementById("locationInput");
const notesInput = document.getElementById("notesInput");

// ========= 1) Typewriter question (safe) =========
function typewriter(text, speedMs = 38) {
  // Keep fallback text visible immediately
  questionEl.textContent = text;

  try {
    // Enhance with typing animation
    questionEl.innerHTML = "";
    const span = document.createElement("span");
    const caret = document.createElement("span");
    caret.className = "type-caret";
    questionEl.appendChild(span);
    questionEl.appendChild(caret);

    let i = 0;
    const timer = setInterval(() => {
      span.textContent = text.slice(0, i + 1);
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        setTimeout(() => caret.remove(), 600);
      }
    }, speedMs);
  } catch {
    questionEl.textContent = text;
  }
}

// ========= 2) Floating hearts background =========
const HEARTS = ["💗", "💖", "💘", "💕", "💓", "❤️"];
let heartsIntervalId = null;

function spawnHeart() {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];

  const left = Math.random() * 100;
  const duration = 4 + Math.random() * 4;
  const size = 14 + Math.random() * 20;
  const drift = `${-50 + Math.random() * 100}px`;

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

// ========= 3) Sparkle cursor trail =========
let lastSparkleAt = 0;

function spawnSparkle(x, y) {
  const s = document.createElement("div");
  s.className = "sparkle";
  s.style.left = `${x}px`;
  s.style.top = `${y}px`;
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 750);
}

function handlePointerMove(clientX, clientY) {
  const now = performance.now();
  if (now - lastSparkleAt < 28) return;
  lastSparkleAt = now;
  spawnSparkle(clientX, clientY);
}

window.addEventListener(
  "mousemove",
  (e) => handlePointerMove(e.clientX, e.clientY),
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (e) => {
    if (!e.touches || !e.touches[0]) return;
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  },
  { passive: true }
);

// ========= Button behavior =========
let yesScale = 1;
const YES_GROWTH_PER_DODGE = 0.08;
const YES_MAX_SCALE = 2.2;
let dodgeCount = 0;

const noTexts = ["No", "Are you sure?", "Really sure?", "Ok but... no 😅", "Pls? 🥺"];
let noTextIndex = 0;

const hints = [
  "(Choose wisely 😄)",
  "(Don’t be shy 😌)",
  "(This is getting serious 😳)",
  "(I’m running out of No’s… 😅)",
  "(Just tap Yes already 💖)",
];

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
  const pct = Math.min(100, dodgeCount * 12);
  meterFill.style.width = `${pct}%`;
}

function dodge() {
  dodgeCount += 1;
  spawnTrailHeartAtCurrentNo();
  advanceNoText();
  growYes();
  updateHintAndMeter();

  let pos = getRandomPositionInside(playArea, noBtn);
  for (let i = 0; i < 10 && isTooCloseToYes(pos.x, pos.y); i++) {
    pos = getRandomPositionInside(playArea, noBtn);
  }
  setButtonPosition(noBtn, pos.x, pos.y);
}

// ========= Confetti =========
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

function launchConfetti(durationMs = 2600) {
  const start = performance.now();
  const particles = [];
  const W = window.innerWidth;
  const H = window.innerHeight;

  const COLORS = ["#ff4d6d", "#ffb703", "#8ecae6", "#06d6a0", "#8338ec", "#fb5607"];

  const count = 210;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: randomBetween(W * 0.2, W * 0.8),
      y: randomBetween(-40, -10),
      vx: randomBetween(-2.5, 2.5),
      vy: randomBetween(2.7, 7.2),
      size: randomBetween(6, 12),
      rot: randomBetween(0, Math.PI),
      vr: randomBetween(-0.22, 0.22),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() < 0.42 ? "heart" : Math.random() < 0.72 ? "rect" : "circle",
    });
  }

  function drawHeart(size) {
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
      p.vy += 0.03;
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

// ========= Modal open/close (with hidden attribute) =========
function openModal() {
  modal.hidden = false;
  modalBackdrop.hidden = false;

  modal.classList.add("is-open");
  modalBackdrop.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  modalBackdrop.setAttribute("aria-hidden", "false");

  setTimeout(() => dateInput.focus(), 50);
}

function closeModal() {
  modal.classList.remove("is-open");
  modalBackdrop.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalBackdrop.setAttribute("aria-hidden", "true");

  setTimeout(() => {
    modal.hidden = true;
    modalBackdrop.hidden = true;
  }, 200);
}

modalCloseBtn.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ========= Calendar helpers =========
function toGoogleUtcString(localDateObj) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    localDateObj.getUTCFullYear() +
    pad(localDateObj.getUTCMonth() + 1) +
    pad(localDateObj.getUTCDate()) +
    "T" +
    pad(localDateObj.getUTCHours()) +
    pad(localDateObj.getUTCMinutes()) +
    pad(localDateObj.getUTCSeconds()) +
    "Z"
  );
}

function buildGoogleCalendarUrl({ title, details, location, startLocal, endLocal }) {
  const startUtc = toGoogleUtcString(startLocal);
  const endUtc = toGoogleUtcString(endLocal);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: details,
    location: location,
    dates: `${startUtc}/${endUtc}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toIcsUtcString(dateObj) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    dateObj.getUTCFullYear() +
    pad(dateObj.getUTCMonth() + 1) +
    pad(dateObj.getUTCDate()) +
    "T" +
    pad(dateObj.getUTCHours()) +
    pad(dateObj.getUTCMinutes()) +
    pad(dateObj.getUTCSeconds()) +
    "Z"
  );
}

function icsEscape(text) {
  return String(text || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function buildIcsContent({ title, details, location, startLocal, endLocal }) {
  const uid = `${crypto?.randomUUID?.() || Date.now()}@valentine-page`;
  const dtstamp = toIcsUtcString(new Date());
  const dtstart = toIcsUtcString(startLocal);
  const dtend = toIcsUtcString(endLocal);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ValentinePage//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(details)}`,
    `LOCATION:${icsEscape(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadTextFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getEventDataFromForm() {
  const dateStr = dateInput.value;
  const timeStr = startTimeInput.value || "19:00";
  const durationMin = Math.max(15, Number(durationInput.value || 120));

  const title = (titleInput.value || "").trim() || "Valentine’s Date 💘";
  const location = (locationInput.value || "").trim() || "";
  const notes = (notesInput.value || "").trim() || "";

  if (!dateStr) return { error: "Please pick a date 💌" };

  const startLocal = new Date(`${dateStr}T${timeStr}:00`);
  const endLocal = new Date(startLocal.getTime() + durationMin * 60 * 1000);

  const detailsLines = ["Yay! Valentine’s date 💖", notes ? `Notes: ${notes}` : "", "— made with love 🥰"].filter(Boolean);

  return {
    title,
    location,
    details: detailsLines.join("\n"),
    startLocal,
    endLocal,
  };
}

addToGoogleBtn.addEventListener("click", () => {
  const data = getEventDataFromForm();
  if (data.error) return alert(data.error);
  const url = buildGoogleCalendarUrl(data);
  window.open(url, "_blank", "noopener,noreferrer");
});

downloadIcsBtn.addEventListener("click", () => {
  const data = getEventDataFromForm();
  if (data.error) return alert(data.error);
  const ics = buildIcsContent(data);
  downloadTextFile("valentines-date.ics", ics, "text/calendar;charset=utf-8");
});

copyDetailsBtn.addEventListener("click", async () => {
  const data = getEventDataFromForm();
  if (data.error) return alert(data.error);

  const text =
    `${data.title}\n` +
    `When: ${data.startLocal.toLocaleString()} - ${data.endLocal.toLocaleString()}\n` +
    (data.location ? `Where: ${data.location}\n` : "") +
    `\n${data.details}\n`;

  try {
    await navigator.clipboard.writeText(text);
    copyDetailsBtn.textContent = "Copied! ✅";
    setTimeout(() => (copyDetailsBtn.textContent = "Copy details"), 1200);
  } catch {
    alert("Copy failed. You can manually copy the details.");
  }
});

// ========= Event bindings =========
noBtn.addEventListener("mouseenter", dodge);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodge();
});
noBtn.addEventListener("focus", dodge);

yesBtn.addEventListener("click", () => {
  result.textContent = "Yay!! 💖";
  launchConfetti(2600);
  startHearts();

  // Default date to today if empty
  if (!dateInput.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  openModal();
});

// ========= Init =========
window.addEventListener("load", () => {
  typewriter("Will you be my Valentine? 💘", 36);

  setButtonPosition(yesBtn, Math.floor(playArea.clientWidth * 0.32), Math.floor(playArea.clientHeight * 0.55));
  setButtonPosition(noBtn, Math.floor(playArea.clientWidth * 0.58), Math.floor(playArea.clientHeight * 0.55));

  noBtn.textContent = noTexts[0];
  startHearts();
});
