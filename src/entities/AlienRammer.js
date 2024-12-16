//import{ Alien } from './Alien.js';
//import{ GameObject } from './GameObject.js';
//import{ getP5 } from '../game/p5Instance.js';
//import{ Projectile } from './Projectile.js';
//import{ entities, gameState } from '../game/GameState.js';
//import{ playSound } from '../game/SoundManager.js';

class AlienRammer extends Alien {
  constructor(x, y) {
    super(x, y)
  }

  shoot() {}

  draw() {
    push();
    translate(this.position.x, this.position.y);
    rotate(radians(this.direction) + HALF_PI);
    
    // Stealth appearance
    stroke(255, 80, 80); // High transparency
    strokeWeight(1);
    noFill();
    triangle(0, -this.size, -this.size / 2, this.size, this.size / 2, this.size);

    pop();
  }
}
