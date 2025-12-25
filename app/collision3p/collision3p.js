// =====================================================
// collision3p.js
// 3 Particle Non-Elastic Collision (2D)
// Time stepping with explicit TDELT (Euler)
// =====================================================

// ---------- GLOBAL ----------
let canvas, ctx;
let particles = [];

let TDELT = 0.01;
let STEPS = 2000;
let COEFR = 0.7;

let stepCount = 0;
let t = 0;

let running = false;
let timer = null;

// visual mapping
const SCALE = 350;
const ORIGIN = { x: 300, y: 200 };

// ---------- PARTICLE ----------
class Particle {
  constructor(x, y, vx, vy, m, r) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.m = m;
    this.r = r;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(
      ORIGIN.x + this.x * SCALE,
      ORIGIN.y - this.y * SCALE,
      this.r * SCALE,
      0, 2 * Math.PI
    );
    ctx.fillStyle = "black";
    ctx.fill();
  }
}

// ---------- INIT ----------
window.onload = function () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  loadDefault();
};

// ---------- PARSER ----------
function readParams() {
  particles = [];
  stepCount = 0;
  t = 0;

  const lines = document.getElementById("input").value.split("\n");

  lines.forEach(line => {
    line = line.trim();
    if (line === "" || line.startsWith("#")) return;

    const p = line.split(/\s+/);

    if (p[0] === "TDELT") TDELT = parseFloat(p[1]);
    if (p[0] === "STEPS") STEPS = parseInt(p[1]);
    if (p[0] === "COEFR") COEFR = parseFloat(p[1]);

    if (p[0] === "P") {
      particles.push(
        new Particle(
          parseFloat(p[1]),
          parseFloat(p[2]),
          parseFloat(p[3]),
          parseFloat(p[4]),
          parseFloat(p[5]),
          parseFloat(p[6])
        )
      );
    }
  });

  document.getElementById("log").value =
    "# t  x0 y0 vx0 vy0  x1 y1 vx1 vy1  x2 y2 vx2 vy2\n";

  logData(); // log kondisi awal t = 0
  draw();
}

// ---------- COLLISION ----------
function resolveCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const minDist = a.r + b.r;

  if (dist >= minDist) return;

  const nx = dx / dist;
  const ny = dy / dist;

  const dvx = b.vx - a.vx;
  const dvy = b.vy - a.vy;
  const vn = dvx * nx + dvy * ny;

  if (vn > 0) return;

  const j = -(1 + COEFR) * vn / (1 / a.m + 1 / b.m);

  a.vx -= (j * nx) / a.m;
  a.vy -= (j * ny) / a.m;
  b.vx += (j * nx) / b.m;
  b.vy += (j * ny) / b.m;
}

// ---------- TIME STEP ----------
function step() {
  if (!running || stepCount >= STEPS) return;

  // update posisi (Euler)
  particles.forEach(p => p.update(TDELT));

  // cek tumbukan
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      resolveCollision(particles[i], particles[j]);
    }
  }

  t += TDELT;
  stepCount++;

  logData();
  draw();
}

// ---------- DRAW ----------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // axes
  ctx.strokeStyle = "#aaa";
  ctx.beginPath();
  ctx.moveTo(0, ORIGIN.y);
  ctx.lineTo(canvas.width, ORIGIN.y);
  ctx.moveTo(ORIGIN.x, 0);
  ctx.lineTo(ORIGIN.x, canvas.height);
  ctx.stroke();

  particles.forEach(p => p.draw());
}

// ---------- LOGGER (UAS STYLE) ----------
function logData() {
  let line = t.toFixed(4);

  particles.forEach(p => {
    line += " " +
      p.x.toFixed(4) + " " +
      p.y.toFixed(4) + " " +
      p.vx.toFixed(4) + " " +
      p.vy.toFixed(4);
  });

  document.getElementById("log").value += line + "\n";
}

// ---------- BUTTONS ----------
function startSim() {
  if (running) return;
  running = true;
  timer = setInterval(step, 20);
}

function stopSim() {
  running = false;
  clearInterval(timer);
}

function clearSim() {
  stopSim();
  particles = [];
  draw();
}

function loadDefault() {
  document.getElementById("input").value =
`# =========================
# Simulation Parameters
# =========================
TDELT 0.01
STEPS 2000
COEFR 0.7

# =========================
# Particles
# x  y  vx  vy  mass  radius
# =========================
P -0.6   0.0   1.0  0.0   1.0   0.04
P  0.0   0.3   0.0  0.0   1.0   0.04
P  0.0  -0.3   0.0  0.0   1.0   0.04`;

  readParams();
}
