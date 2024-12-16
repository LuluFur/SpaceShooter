//import { Alien } from './Alien.js';
//import { getP5 } from '../game/p5Instance.js';
//import { Projectile } from './Projectile.js';
//import { entities, gameState } from '../game/GameState.js';
//import { playSound } from '../game/SoundManager.js';

class MiniBossAlien extends Alien {
  constructor(x, y) {
    super(x, y);
    
    
    // Double the size
    this.size = 40;
    
    // Increased health pool scaled with difficulty
    this.maxHealth = 100 * (1 + (0.5 * gameState.difficulty));
    this.health = this.maxHealth;
    
    // Higher damage
    this.damage = 25;
    
    // Slower movement
    this.maxSpeed = 1;
    this.preferredDistance = 300;
    this.fleeDistance = 150;
    
    // Slower but more powerful shots
    this.shootDelay = 2000;
    this.projectileSize = 15;
    
    // Boss-specific properties
    this.glowIntensity = 0;
    this.glowDirection = 1;
  }

  shoot() {
    
    if (!entities.player) return;

    const angleToPlayer = atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );

    // Less inaccuracy than regular aliens
    const inaccuracy = (1 - this.intelligenceLevel) * 0.25;
    const finalAngle = angleToPlayer + random(-inaccuracy, inaccuracy);

    const velocity = createVector(
      cos(finalAngle),
      sin(finalAngle)
    ).mult(3); // Slightly slower projectiles

    const projectile = new Projectile(
      this.position.x + cos(finalAngle) * 30,
      this.position.y + sin(finalAngle) * 30,
      velocity,
      this
    );

    projectile.damage = this.damage;
    projectile.size = this.projectileSize;
    this.projectiles.push(projectile);
    this.lastShotTime = millis();
    playSound('shootSound');
  }

  draw() {
    
    
    // Draw projectiles
    for (let proj of this.projectiles) {
      proj.draw();
    }
    
    push();
    translate(this.position.x, this.position.y);
    rotate(radians(this.direction) + HALF_PI);

    // Pulsing glow effect
    this.glowIntensity += 0.05 * this.glowDirection;
    if (this.glowIntensity >= 1) this.glowDirection = -1;
    if (this.glowIntensity <= 0) this.glowDirection = 1;

    // Enhanced glow effect
    drawingContext.shadowBlur = 20 + (this.glowIntensity * 10);
    drawingContext.shadowColor = 'rgba(255, 0, 0, 0.5)';

    // Draw boss alien ship
    stroke(255, 0, 0);
    strokeWeight(3);
    noFill();
    
    // More complex ship design
    beginShape();
    vertex(0, -this.size);
    vertex(-this.size/2, 0);
    vertex(-this.size/3, this.size/2);
    vertex(0, this.size/3);
    vertex(this.size/3, this.size/2);
    vertex(this.size/2, 0);
    endShape(CLOSE);

    // Additional details
    line(-this.size/4, -this.size/2, this.size/4, -this.size/2);
    line(-this.size/3, this.size/4, this.size/3, this.size/4);

    drawingContext.shadowBlur = 0;
    pop();

    // Draw health bar above boss
    this.drawHealthBar();
  }

  drawHealthBar() {
    
    const barWidth = this.size * 2;
    const barHeight = 5;
    const x = this.position.x - barWidth/2;
    const y = this.position.y - this.size - 15;

    push();
    noStroke();
    // Background
    fill(100, 0, 0);
    rect(x, y, barWidth, barHeight);
    // Health
    const healthWidth = (this.health / this.maxHealth) * barWidth;
    fill(255, 0, 0);
    rect(x, y, healthWidth, barHeight);
    pop();
  }
}
