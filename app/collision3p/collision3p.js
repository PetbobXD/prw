// ================= GLOBAL =================
let canvas, ctx;
let particles = [];
let DT = 0.01;
let COEFR = 0.7;
let running = false;
let timer = null;
let time = 0;

const SCALE = 200;
const ORIGIN = { x: 300, y: 250 };

// ================= PARTICLE =================
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

// ================= INIT =================
window.onload = () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  loadDefault();
};

// ================= DEFAULT =================
function loadDefault() {
  document.getElementById("params").value =
`DT 0.01
COEFR 0.7
# x y vx vy m r
P -0.6 0 1 0 1 0.05
P 0.0 0 0 0 1 0.05
P 0.6 0 0 0 1 0.05`;
  readParams();
}

// ================= READ PARAMS =================
function readParams() {
  particles = [];
  time = 0;
  clearTable();

  const lines = document.getElementById("params").value.split("\n");
  lines.forEach(line => {
    line = line.trim();
    if (!line || line.startsWith("#")) return;
    const p = line.split(/\s+/);
    if (p[0] === "DT") DT = parseFloat(p[1]);
    if (p[0] === "COEFR") COEFR = parseFloat(p[1]);
    if (p[0] === "P") {
      particles.push(new Particle(
        +p[1], +p[2], +p[3], +p[4], +p[5], +p[6]
      ));
    }
  });

  draw();
}

// ================= COLLISION =================
function resolveCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0 || dist > a.r + b.r) return;

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

// ================= STEP =================
function step() {
  if (!running) return;

  particles.forEach(p => p.update(DT));

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      resolveCollision(particles[i], particles[j]);
    }
  }

  logData();
  draw();
  time += DT;
}

// ================= DRAW =================
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

// ================= DATA TABLE =================
function logData() {
  const tbody = document.getElementById("databody");
  particles.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML =
      `<td>${time.toFixed(2)}</td>
       <td>${p.x.toFixed(3)}</td>
       <td>${p.y.toFixed(3)}</td>
       <td>${p.vx.toFixed(3)}</td>
       <td>${p.vy.toFixed(3)}</td>`;
    tbody.appendChild(row);
  });
}

function clearTable() {
  document.getElementById("databody").innerHTML = "";
}

// ================= BUTTONS =================
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
  clearTable();
  draw();
}
