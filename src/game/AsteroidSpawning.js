function updateAsteroidSpawning() {
  if (entities.asteroids.length >= gameState.asteroidCap) return;

  let noiseOffset = noise(gameState.asteroidSpawnNoiseOffset) * 2 - 1;
  gameState.asteroidSpawnNoiseOffset += 0.01;
  let randomDelay = gameState.spawnDelay + noiseOffset * 1000;

  if (millis() > gameState.nextSpawnTime) {
    spawnAsteroids();
    gameState.nextSpawnTime = millis() + randomDelay;
  }
}

function spawnAsteroids(amount = 1) {
  for (let i = 0; i < amount; i++) {
    let side = random(['top', 'bottom', 'left', 'right']);
    let x, y;
    
    if (side === 'top') {
      x = random(-50, width + 50);
      y = -50;
    } else if (side === 'bottom') {
      x = random(-50, width + 50);
      y = height + 50;
    } else if (side === 'left') {
      x = -50;
      y = random(-50, height + 50);
    } else {
      x = width + 50;
      y = random(-50, height + 50);
    }

    let isGold = random(100) < gameState.goldAsteroidChance;
    let size = floor(random(2, 3)) * 20 * (isGold ? 1.25 : 1);
    let seed = int(random(1000));
    let health = size * 0.5 * (isGold ? 5 : 1);
    health += 5 * gameState.difficulty;

    entities.asteroids.push(new Asteroid(x, y, size, seed, isGold, health));
  }
}