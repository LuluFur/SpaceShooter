//import { getP5 } from './p5Instance.js';
//import { gameState, entities } from './GameState.js';
//import { spawnAsteroids } from './AsteroidSpawning.js';
//import { playSound } from './SoundManager.js';
//import { Player } from '../entities/Player.js';

function openDeathMenu() {
  const deathMenu = document.createElement('div');
  deathMenu.className = 'death-menu';
  deathMenu.id = 'death-menu';
  
  const content = document.createElement('div');
  content.className = 'death-content';
  
  const timePlayed = Math.floor((millis() - gameState.startTime) / 1000);
  
  content.innerHTML = `
    <h1 class="death-title">Game Over</h1>
    <div class="death-stats">
      <p>Score: ${gameState.score}</p>
      <p>Time Survived: ${timePlayed} seconds</p>
    </div>
    <button class="retry-button" onclick="window.retryGame()">Try Again</button>
  `;
  
  deathMenu.appendChild(content);
  document.getElementById('game-container').appendChild(deathMenu);
  
  document.getElementById("gameCanvas").style.display = "none";
  document.getElementById("death-menu").style.display = "block";
  noLoop();
}

function closeDeathMenu() {
  const deathMenu = document.getElementById('death-menu');
  if (deathMenu) {
    deathMenu.remove();
  }
  
  document.getElementById("gameCanvas").style.display = "block";
  resetGame();
  loop();
}

function resetGame() {
  // Reset game state
  gameState.score = 0;
  gameState.startTime = millis();
  gameState.difficulty = 1;
  gameState.skillLevelUp = 0;
  
  // Reset entities
  entities.player = null;
  entities.asteroids = [];
  entities.aliens = [];
  entities.particleEffects = [];
  entities.textEffects = [];
  
  // Create new player
  entities.player = new Player(width / 2, height / 2);
  
  // Spawn initial asteroids
  spawnAsteroids(5);
  
  // Play start sound
  playSound('gameStartSound');
}

// Make retry function available globally
window.retryGame = closeDeathMenu;
