function spawnStandardAliens() {
  const alienTypes = [Alien, AlienStealth];
  const spawnCount = Math.floor(1 + entities.player.level / 5); // Spawn more as player levels up

  for (let i = 0; i < spawnCount; i++) {
    const AlienType = random(alienTypes);
    
    const padding = 5;
    const size = (AlienType.size || 20) + padding;
    let x, y;
    const side = random(['top', 'bottom', 'left', 'right']);
    switch (side) {
      case 'top': x = random(width); y = -size; break;
      case 'bottom': x = random(width); y = height + size; break;
      case 'left': x = -size; y = random(height); break;
      case 'right': x = width + size; y = random(height); break;
    }

    entities.aliens.push(new AlienType(x, y, AlienType.generateCollisionVertices(size)));
  }
}

function checkSpawnMiniBossAlien() {
  if (!entities.player || entities.player.level % 5 !== 0 || gameState.miniBossSpawned) return;

  const size = MiniBossAlien.size || 40;
  const x = random(width);
  const y = -size; // Spawn from the top
  entities.aliens.push(new MiniBossAlien(x, y, MiniBossAlien.generateCollisionVertices(size)));
  gameState.miniBossSpawned = true; // Prevent multiple spawns at the same level
}

function spawnBossAlien() {
  if (!entities.player) return;

  const size = BossAlien.size || 80;
  const x = random(width);
  const y = -size; // Spawn from the top
  entities.aliens.push(new BossAlien(x, y, BossAlien.generateCollisionVertices(size)));
}

function spawnAlien(forceBoss = false) {
  if (forceBoss) {
    spawnBossAlien();
  } else {
    spawnStandardAliens();
  }

  checkSpawnMiniBossAlien(); // Check if MiniBossAlien should spawn
}
