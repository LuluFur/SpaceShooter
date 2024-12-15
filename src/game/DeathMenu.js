//import { getP5 } from './p5Instance.js';
//import { gameState, entities } from './GameState.js';
//import { spawnAsteroids } from './AsteroidSpawning.js';
//import { playSound } from './SoundManager.js';
//import { Player } from '../entities/Player.js';

function openDeathMenu() {
  const p5 = getP5();
  if (!p5) return;

  const deathMenu = document.createElement('div');
  deathMenu.className = 'death-menu';
  deathMenu.id = 'death-menu';
  
  const content = document.createElement('div');
  content.className = 'death-content';
  
  const timePlayed = Math.floor((p5.millis() - gameState.startTime) / 1000);
  
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
  p5.noLoop();
}

function closeDeathMenu() {
  const p5 = getP5();
  if (!p5) return;

  const deathMenu = document.getElementById('death-menu');
  if (deathMenu) {
    deathMenu.remove();
  }
  
  document.getElementById("gameCanvas").style.display = "block";
  resetGame();
  p5.loop();
}

function resetGame() {
  const p5 = getP5();
  if (!p5) return;

  // Reset game state
  gameState.score = 0;
  gameState.startTime = p5.millis();
  gameState.difficulty = 1;
  gameState.skillLevelUp = 0;
  
  // Reset entities
  entities.player = null;
  entities.asteroids = [];
  entities.aliens = [];
  entities.particleEffects = [];
  entities.textEffects = [];
  
  // Create new player
  entities.player = new Player(p5.width / 2, p5.height / 2);
  
  // Spawn initial asteroids
  spawnAsteroids(p5, 5);
  
  // Play start sound
  playSound('gameStartSound');
}

// Make retry function available globally
window.retryGame = closeDeathMenu;