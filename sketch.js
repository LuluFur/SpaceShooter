// Matter.js setup
const { Engine, World, Bodies, Composite } = Matter;

// Set poly-decomp as the decomposition library
Matter.Common.setDecomp(decomp);

// Initialize Matter.js engine and world
const engine = Engine.create();
const world = engine.world;

// Prevent right-click context menu globally
document.addEventListener('contextmenu', (e) => e.preventDefault());

let alienSpawnTimer = 0;
const alienSpawnDelay = 30000; // Spawn alien every 30 seconds
let miniBossSpawnTimer = 0;
const miniBossSpawnDelay = 60000; // Spawn mini boss every 60 seconds
let lastPlayerLevel = 1;
let backgroundParticles = [];

function preload() {
  //initializeP5(p);
};

function setup() {
  const canvas = createCanvas(1080, 720);
  canvas.parent('main');
  canvas.id('gameCanvas');

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

  // Check alien spawn timer
  if (millis() - alienSpawnTimer > alienSpawnDelay) {
    spawnAlien(false); // Regular alien spawn
    alienSpawnTimer = millis();
  }

  // Check mini boss spawn timer
  if (
    gameState.difficulty >= 2 &&
    millis() - miniBossSpawnTimer > miniBossSpawnDelay
  ) {
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

  document.getElementById('score').innerText = `Score: ${gameState.score}`;
  document.getElementById('time-played').innerText = `Time: ${formatTime(
    timePlayed
  )}`;

  // Update and draw XP orbs
  for (let i = entities.xpOrbs.length - 1; i >= 0; i--) {
    const orb = entities.xpOrbs[i];
    orb.update(entities.player);
    orb.draw();
    if (orb.collected) {
      entities.xpOrbs.splice(i, 1);
    }
  }

  // Update and draw all objects
  for (const obj of gameObjects) {
    obj.update();
    obj.draw();

    // Handle collisions based on object type
    if (obj instanceof Projectile) {
        handleProjectileAsteroidCollisions(obj, gameObjects);
        handleProjectilePlayerCollisions(obj, entities.player);
        handleProjectileAlienCollisions(obj, gameObjects);
    }
  }

  // Update and draw asteroids
  for (let i = entities.asteroids.length - 1; i >= 0; i--) {
    const asteroid = entities.asteroids[i];
    asteroid.update();
    asteroid.draw();

    if (asteroid.checkPlayerCollision(entities.player)) {
      entities.asteroids.splice(i, 1);
      continue;
    }

    for (let j = entities.player.projectiles.length - 1; j >= 0; j--) {
      const projectile = entities.player.projectiles[j];
      if (asteroid.checkProjectileCollision(projectile)) {
        if (asteroid.health <= 0) {
          if (asteroid.isGold) {
            gameState.score += 100;
            spawnXPOrbs(asteroid.position.x, asteroid.position.y, 20);
          } else {
            gameState.score += 10;
            spawnXPOrbs(asteroid.position.x, asteroid.position.y, 5);
          }
          entities.asteroids.splice(i, 1);
        }
        break;
      }
    }

    for (let j = i + 1; j < entities.asteroids.length; j++) {
      asteroid.applyRepulsion(entities.asteroids[j]);
    }
  }

  // Update and draw aliens
  for (let i = entities.aliens.length - 1; i >= 0; i--) {
    const alien = entities.aliens[i];
    alien.update();
    alien.draw();

    // Check alien projectiles collision with player
    for (let j = alien.projectiles.length - 1; j >= 0; j--) {
      const projectile = alien.projectiles[j];
      const distance = dist(
        entities.player.position.x,
        entities.player.position.y,
        projectile.position.x,
        projectile.position.y
      );

      if (distance < entities.player.size + projectile.size) {
        entities.player.applyDamage(projectile.damage);
        projectile.isDestroyed = true;

        if (entities.player.health <= 0) {
          openDeathMenu();
        }

        // Calculate impact direction
        const relativeVelocity = createVector(
          projectile.velocity.x - entities.player.velocity.x,
          projectile.velocity.y - entities.player.velocity.y
        );
        const impactDirection = degrees(relativeVelocity.heading());

        // Create impact effect
        createBulletImpactDebris({
          position: projectile.position,
          direction: impactDirection,
          spreadAngle: 120,
        });

        break;
      }
    }

    // Check player projectiles collision with alien
    for (let j = entities.player.projectiles.length - 1; j >= 0; j--) {
      const projectile = entities.player.projectiles[j];
      const distance = dist(
        alien.position.x,
        alien.position.y,
        projectile.position.x,
        projectile.position.y
      );

      if (distance < alien.size + projectile.size) {
        if (alien.takeDamage(projectile.damage)) {
          entities.aliens.splice(i, 1);

          // Check if the destroyed alien was a mini boss
          if (alien instanceof MiniBossAlien) {
            gameState.score += 1000;
            spawnXPOrbs(alien.position.x, alien.position.y, 300); // 10x normal alien XP
          } else {
            gameState.score += 200;
            spawnXPOrbs(alien.position.x, alien.position.y, 30);
          }
        }

        const relativeVelocity = createVector(
          projectile.velocity.x - alien.velocity.x,
          projectile.velocity.y - alien.velocity.y
        );
        const impactDirection = degrees(relativeVelocity.heading());

        createBulletImpactDebris({
          position: projectile.position,
          direction: impactDirection,
          spreadAngle: 120,
        });

        projectile.isDestroyed = true;
        break;
      }
    }
  }

  // Update effects
  updateEffects();

  if (entities.player) {
    entities.player.update();
    entities.player.draw();
    drawStatusBars();
  }
};
