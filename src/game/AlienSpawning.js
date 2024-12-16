//import { entities, gameState } from './GameState.js';
//import { Alien } from '../entities/Alien.js';
//import { AlienStealth } from '../entities/AlienStealth.js';
//import { MiniBossAlien } from '../entities/MiniBossAlien.js';
//import { BossAlien } from '../entities/BossAlien.js';
//import { getP5 } from './p5Instance.js';

function spawnStandardAliens() {
  const alienTypes = [Alien, AlienStealth];
  const spawnCount = Math.floor(1 + entities.player.level / 5); // Spawn more as player levels up

  for (let i = 0; i < spawnCount; i++) {
    const AlienType = random(alienTypes);

    let x, y;
    const side = random(['top', 'bottom', 'left', 'right']);
    switch (side) {
      case 'top': x = random(width); y = -20; break;
      case 'bottom': x = random(width); y = height + 20; break;
      case 'left': x = -20; y = random(height); break;
      case 'right': x = width + 20; y = random(height); break;
    }

    entities.aliens.push(new AlienType(x, y));
  }
}

function checkSpawnMiniBossAlien() {
  
  if (!entities.player) return;

  if (entities.player.level % 5 === 0 && entities.player.level !== 0) {
    let x = random(width);
    let y = -20; // Spawn from the top
    entities.aliens.push(new MiniBossAlien(x, y));
  }
}

function spawnBossAlien() {
  
  if (!entities.player) return;

  let x = random(width);
  let y = -20; // Spawn from the top
  entities.aliens.push(new BossAlien(x, y));
}

function spawnAlien(forceBoss = false) {
  if (forceBoss) {
    spawnBossAlien();
  } else {
    spawnStandardAliens();
  }

  checkSpawnMiniBossAlien(); // Check if MiniBossAlien should spawn
}
