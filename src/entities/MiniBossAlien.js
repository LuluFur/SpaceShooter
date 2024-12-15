//import { Alien } from './Alien.js';
//import { getP5 } from '../game/p5Instance.js';
//import { Projectile } from './Projectile.js';
//import { entities, gameState } from '../game/GameState.js';
//import { playSound } from '../game/SoundManager.js';

class MiniBossAlien extends Alien {
  constructor(x, y) {
    super(x, y);
    const p5 = getP5();
    
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
    const p5 = getP5();
    if (!entities.player) return;

    const angleToPlayer = p5.atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );

    // Less inaccuracy than regular aliens
    const inaccuracy = (1 - this.intelligenceLevel) * 0.25;
    const finalAngle = angleToPlayer + p5.random(-inaccuracy, inaccuracy);

    const velocity = p5.createVector(
      p5.cos(finalAngle),
      p5.sin(finalAngle)
    ).mult(3); // Slightly slower projectiles

    const projectile = new Projectile(
      this.position.x + p5.cos(finalAngle) * 30,
      this.position.y + p5.sin(finalAngle) * 30,
      velocity,
      this
    );

    projectile.damage = this.damage;
    projectile.size = this.projectileSize;
    this.projectiles.push(projectile);
    this.lastShotTime = p5.millis();
    playSound('shootSound');
  }

  draw() {
    const p5 = getP5();
    
    // Draw projectiles
    for (let proj of this.projectiles) {
      proj.draw();
    }
    
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(p5.radians(this.direction) + p5.HALF_PI);

    // Pulsing glow effect
    this.glowIntensity += 0.05 * this.glowDirection;
    if (this.glowIntensity >= 1) this.glowDirection = -1;
    if (this.glowIntensity <= 0) this.glowDirection = 1;

    // Enhanced glow effect
    p5.drawingContext.shadowBlur = 20 + (this.glowIntensity * 10);
    p5.drawingContext.shadowColor = 'rgba(255, 0, 0, 0.5)';

    // Draw boss alien ship
    p5.stroke(255, 0, 0);
    p5.strokeWeight(3);
    p5.noFill();
    
    // More complex ship design
    p5.beginShape();
    p5.vertex(0, -this.size);
    p5.vertex(-this.size/2, 0);
    p5.vertex(-this.size/3, this.size/2);
    p5.vertex(0, this.size/3);
    p5.vertex(this.size/3, this.size/2);
    p5.vertex(this.size/2, 0);
    p5.endShape(p5.CLOSE);

    // Additional details
    p5.line(-this.size/4, -this.size/2, this.size/4, -this.size/2);
    p5.line(-this.size/3, this.size/4, this.size/3, this.size/4);

    p5.drawingContext.shadowBlur = 0;
    p5.pop();

    // Draw health bar above boss
    this.drawHealthBar();
  }

  drawHealthBar() {
    const p5 = getP5();
    const barWidth = this.size * 2;
    const barHeight = 5;
    const x = this.position.x - barWidth/2;
    const y = this.position.y - this.size - 15;

    p5.push();
    p5.noStroke();
    // Background
    p5.fill(100, 0, 0);
    p5.rect(x, y, barWidth, barHeight);
    // Health
    const healthWidth = (this.health / this.maxHealth) * barWidth;
    p5.fill(255, 0, 0);
    p5.rect(x, y, healthWidth, barHeight);
    p5.pop();
  }
}