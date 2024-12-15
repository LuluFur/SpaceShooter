const gameState = {
  score: 0,
  startTime: 0,
  difficulty: 1,
  difficultyScale: 0.5,
  goldAsteroidChance: 1,
  skillMenuOpen: false,
  asteroidCap: 5,
  spawnDelay: 300,
  nextSpawnTime: 0,
  asteroidSpawnNoiseOffset: 0,
  skillsToChoose: [],
  motivationTexts: [
    "BOOM!", "BAM!", "CRASH!", "POW!", 
    "WHAM!", "PEW!", "BANG!", "POP!", 
    "YES!", "KA-POW!"
  ]
};

const entities = {
  player: null,
  asteroids: [],
  aliens: [],
  particleEffects: [],
  textEffects: [],
  xpOrbs: []
};

const sounds = {
  explodeSound1: undefined,
  explodeSound2: undefined,
  explosionBass: undefined,
  gameStartSound: undefined,
  shootSound: undefined
};