// =======================
// GLOBAL
// =======================
let canvas, ctx;
let particles = [];
let DT = 0.01;
let STEPS = 2000;
let COEFR = 0.7;

let running = false;
let stepCount = 0;
let timer = null;

// visual scale
const SCALE = 400;
const ORIGIN = { x: 300, y: 200 };

// =======================
// PARTICLE
// =======================
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

// =======================
// INIT (WAJIB)
// =======================
window.onload = function () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  loadDefault();
};

// =======================
// PARSER
// =======================
function readParams() {
  particles = [];
  stepCount = 0;

  const lines = input.value.split("\n");
  lines.forEach(line => {
    line = line.trim();
    if (line === "" || line.startsWith("#")) return;

    const p = line.split(/\s+/);
    if (p[0] === "DT") DT = parseFloat(p[1]);
    if (p[0] === "STEPS") STEPS = parseInt(p[1]);
    if (p[0] === "COEFR") COEFR = parseFloat(p[1]);

    if (p[0] === "P") {
      particles.push(new Particle(
        parseFloat(p[1]),
        parseFloat(p[2]),
        parseFloat(p[3]),
        parseFloat(p[4]),
        parseFloat(p[5]),
        parseFloat(p[6])
      ));
    }
  });

  draw();
}

// =======================
// COLLISION
// =======================
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

// =======================
// STEP
// =======================
function step() {
  if (!running || stepCount > STEPS) return;

  particles.forEach(p => p.update(DT));

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      resolveCollision(particles[i], particles[j]);
    }
  }

  draw();
  stepCount++;
}

// =======================
// DRAW
// =======================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // axis
  ctx.strokeStyle = "#aaa";
  ctx.beginPath();
  ctx.moveTo(0, ORIGIN.y);
  ctx.lineTo(canvas.width, ORIGIN.y);
  ctx.moveTo(ORIGIN.x, 0);
  ctx.lineTo(ORIGIN.x, canvas.height);
  ctx.stroke();

  particles.forEach(p => p.draw());
}

// =======================
// BUTTONS
// =======================
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
  input.value =
`# Simulation Parameters
DT 0.01
STEPS 2000
COEFR 0.7

# Particles: x y vx vy mass radius
P -0.6  0.0  1.0 0.0  1.0 0.04
P  0.0  0.3  0.0 0.0  1.0 0.04
P  0.0 -0.3  0.0 0.0  1.0 0.04`;

  readParams();
}
