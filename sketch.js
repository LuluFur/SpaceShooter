// Matter.js setup
const { Engine, World, Bodies, Composite } = Matter;

// Set poly-decomp as the decomposition library
if (typeof decomp !== "undefined") {
  Matter.Common.setDecomp(decomp);
} else {
  console.error("poly-decomp library is missing. Make sure it's included in your HTML."); // fixed
  console.log('decomp:', window.decomp);
}

// Initialize Matter.js engine and world
const engine = Engine.create();
const world = engine.world;

// Disable gravity
engine.world.gravity.y = 0; 
engine.world.gravity.x = 0; // Optional, depending on your requirements

// Prevent right-click context menu globally
document.addEventListener("contextmenu", (e) => e.preventDefault());

let alienSpawnTimer = 0;
const alienSpawnDelay = 30000; // Spawn alien every 30 seconds
let miniBossSpawnTimer = 0;
const miniBossSpawnDelay = 60000; // Spawn mini boss every 60 seconds
let lastPlayerLevel = 1;
let backgroundParticles = [];

function preload() {
  // Initialize any resources if needed
}

function setup() {
  const canvas = createCanvas(1080, 720);
  canvas.parent("main");
  canvas.id("gameCanvas");

  entities.player = new Player(width / 2, height / 2);
  entities.asteroids = [];
  entities.aliens = [];
  entities.particleEffects = [];
  entities.textEffects = [];
  entities.xpOrbs = [];

  // Initialize background particles
  backgroundParticles = spawnBackgroundParticles();

  spawnAsteroids(5);
  gameState.startTime = millis();
  alienSpawnTimer = millis();
  miniBossSpawnTimer = millis();
  lastPlayerLevel = entities.player.level;
};

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

function drawStatusBars() {
  const barWidth = 200;
  const barHeight = 10;
  const x = width / 2 - barWidth / 2;

  // Draw health bar
  const healthY = height - 40;
  push();
  noStroke();
  // Background
  fill(100, 0, 0);
  rect(x, healthY, barWidth, barHeight);
  // Current health
  const healthWidth =
    (entities.player.health / entities.player.maxHealth) * barWidth;
  fill(255, 0, 0);
  rect(x, healthY, healthWidth, barHeight);

  // Health text
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(
    `${Math.ceil(entities.player.health)}/${entities.player.maxHealth}`,
    x + barWidth + 10,
    healthY + barHeight / 2
  );
  pop();

  // Draw XP bar
  const xpY = height - 20;
  push();
  noStroke();
  // Background
  fill(0, 50, 100);
  rect(x, xpY, barWidth, barHeight);
  // Current XP
  const xpWidth =
    (entities.player.xp / entities.player.xpToNextLevel) * barWidth;
  fill(0, 150, 255);
  rect(x, xpY, xpWidth, barHeight);

  // Level indicator
  textAlign(LEFT, CENTER);
  fill(255);
  textSize(12);
  text(
    `Level ${entities.player.level}`,
    x + barWidth + 10,
    xpY + barHeight / 2
  );
  pop();
}

function draw() {
  background(0);

  // Draw background particles
  drawBackgroundParticles(backgroundParticles);

  // Alien spawn logic
  if (millis() - alienSpawnTimer > alienSpawnDelay) {
    spawnAlien(false); // Regular alien spawn
    alienSpawnTimer = millis();
  }

  // Mini boss spawn logic
  if (gameState.difficulty >= 2 && millis() - miniBossSpawnTimer > miniBossSpawnDelay) {
    spawnAlien(true); // Force mini boss spawn
    miniBossSpawnTimer = millis();
  }

  updateAsteroidSpawning();

  // Check if player leveled up
  if (entities.player && entities.player.level > lastPlayerLevel) {
    lastPlayerLevel = entities.player.level;
    openSkillMenu();
  }

  let timePlayed = floor((millis() - gameState.startTime) / 1000);

  document.getElementById("score").innerText = `Score: ${gameState.score}`;
  document.getElementById("time-played").innerText = `Time: ${formatTime(timePlayed)}`;

  // Update and draw XP orbs
  for (let i = entities.xpOrbs.length - 1; i >= 0; i--) {
    const orb = entities.xpOrbs[i];
    orb.update(entities.player);
    orb.draw();
    if (orb.collected) {
      entities.xpOrbs.splice(i, 1);
    }
  }

  // Update and draw all entities
  for (const key in entities) {
    const group = entities[key];

    if (Array.isArray(group)) {
      group.forEach((entity) => {
        entity.update?.();
        entity.draw?.();
      });
    } else if (group) {
      group.update?.();
      group.draw?.();
    }
  }

  // Projectile Collisions
  handleProjectileAsteroidCollisions(entities.player.projectiles, entities.asteroids);
  handleProjectilePlayerCollisions(entities.player.projectiles, entities.player);
  handleProjectileAlienCollisions(entities.player.projectiles, entities.aliens);

  // Asteroid Collisions
  handleAsteroidProjectileCollisions(entities.asteroids, entities.player.projectiles);
  handleAsteroidPlayerCollisions(entities.asteroids, entities.player);
  handleAsteroidAlienCollisions(entities.asteroids, entities.aliens);

  // Same Class-Type Collisions
  handleAlienAlienCollisions(entities.aliens);
  handleAsteroidAsteroidCollisions(entities.asteroids);

  // Remove destroyed asteroids
  entities.asteroids = entities.asteroids.filter((asteroid) => !asteroid.isDestroyed);

  // Filter out destroyed objects
  entities.aliens = entities.aliens.filter((alien) => !alien.isDestroyed);

  // Remove destroyed projectiles
  entities.player.projectiles = entities.player.projectiles.filter((projectile) => !projectile.isDestroyed);

  // Update effects
  updateEffects();

  if (entities.player) {
    drawStatusBars();
  }

  // Update Matter.js physics engine
  Matter.Engine.update(engine);
}
