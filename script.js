const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// تنظیم ابعاد ریسپانسیو
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// مقیاس‌دهی بر اساس طراحی اولیه (446x776)
function getScale() {
  return Math.min(canvas.width / 446, canvas.height / 776);
}
let scale = getScale();

// بارگذاری تصاویر
const playerImg = new Image();
playerImg.src = "PIZZA-KHOOR.png";

const obstacleImg = new Image();
obstacleImg.src = "shit.webp";

const redImg = new Image();
redImg.src = "pizza1.png";

const greenImg = new Image();
greenImg.src = "DRUG.png";

const blueImg = new Image();
blueImg.src = "weed.webp";

let player = {
  x: canvas.width / 2 - 60 * scale,
  y: canvas.height - 170 * scale,
  w: 170 * scale,
  h: 170 * scale
};

let reds = [], obstacles = [], greens = [], blues = [];
let score = 0;
let gameOver = false;
let pizzaProbability = 0.3;

// حرکت با موس
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left - player.w / 2;
});

// حرکت با لمس موبایل
canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  player.x = touchX - player.w / 2;
}, { passive: false });

// کلیک یا لمس برای ریستارت
canvas.addEventListener("click", () => { if (gameOver) restartGame(); });
canvas.addEventListener("touchstart", () => { if (gameOver) restartGame(); });

function spawnRed() {
  reds.push({ x: Math.random() * (canvas.width - 60 * scale), y: -60 * scale, w: 60 * scale, h: 60 * scale, alpha: 1, caught: false });
}
function spawnObstacle() {
  obstacles.push({ x: Math.random() * (canvas.width - 40 * scale), y: -40 * scale, w: 60 * scale, h: 60 * scale });
}
function spawnGreen() {
  greens.push({ x: Math.random() * (canvas.width - 40 * scale), y: -40 * scale, w: 60 * scale, h: 60 * scale });
}
function spawnBlue() {
  blues.push({ x: Math.random() * (canvas.width - 40 * scale), y: -40 * scale, w: 80 * scale, h: 80 * scale });
}

function update() {
  if (gameOver) return;

  reds.forEach(r => {
    r.y += 3 * scale;
    if (isColliding(player, r) && !r.caught) { score++; r.caught = true; }
    if (r.caught) { r.alpha -= 0.05; if (r.alpha <= 0) reds.splice(reds.indexOf(r), 1); }
    if (r.y > canvas.height && !r.caught) gameOver = true;
  });

  obstacles.forEach(o => {
    o.y += 4 * scale;
    if (isColliding(player, o)) gameOver = true;
    if (o.y > canvas.height) obstacles.splice(obstacles.indexOf(o), 1);
  });

  greens.forEach(g => {
    g.y += 3 * scale;
    if (isColliding(player, g)) { pizzaProbability = Math.max(0.1, pizzaProbability - 0.1); greens.splice(greens.indexOf(g), 1); }
    if (g.y > canvas.height) greens.splice(greens.indexOf(g), 1);
  });

  blues.forEach(b => {
    b.y += 3 * scale;
    if (isColliding(player, b)) { pizzaProbability = Math.min(0.9, pizzaProbability + 0.1); blues.splice(blues.indexOf(b), 1); }
    if (b.y > canvas.height) blues.splice(blues.indexOf(b), 1);
  });
}

function isColliding(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  reds.forEach(r => {
    ctx.save();
    if (r.caught) { ctx.globalAlpha = r.alpha; ctx.filter = "blur(2px)"; }
    ctx.drawImage(redImg, r.x, r.y, r.w, r.h);
    ctx.restore();
  });

  obstacles.forEach(o => ctx.drawImage(obstacleImg, o.x, o.y, o.w, o.h));
  greens.forEach(g => ctx.drawImage(greenImg, g.x, g.y, g.w, g.h));
  blues.forEach(b => ctx.drawImage(blueImg, b.x, b.y, b.w, b.h));

  ctx.fillStyle = "black";
  ctx.font = `${20 * scale}px Arial`;
  ctx.fillText(`Score: ${score}`, 10 * scale, 30 * scale);
  ctx.fillText(`Pizza Chance: ${(pizzaProbability*100).toFixed(0)}%`, 10 * scale, 60 * scale);

  if (gameOver) {
    ctx.font = `${40 * scale}px Arial`;
    ctx.fillText("Game Over!", canvas.width / 2 - 100 * scale, canvas.height / 2);
    ctx.font = `${20 * scale}px Arial`;
    ctx.fillText("Tap or Click to Restart", canvas.width / 2 - 100 * scale, canvas.height / 2 + 40 * scale);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  reds = []; obstacles = []; greens = []; blues = [];
  score = 0; pizzaProbability = 0.3; gameOver = false;
}

// زمان‌بندی ظاهر شدن آیتم‌ها
setInterval(() => { if (Math.random() < pizzaProbability) spawnRed(); }, 1500);
setInterval(spawnObstacle, 3000);
setInterval(() => { if (Math.random() < 0.2) spawnGreen(); }, 5000);
setInterval(() => { if (Math.random() < 0.2) spawnBlue(); }, 7000);

gameLoop();
