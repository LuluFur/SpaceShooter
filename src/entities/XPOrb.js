//import { GameObject } from './GameObject.js';
//import { getP5 } from '../game/p5Instance.js';

class XPOrb extends GameObject {
  constructor(x, y, xpValue) {
    
    super(x, y, 10, createVector(0, 0), 0);
    this.xpValue = xpValue;
    this.collectionRange = 150;
    this.attractionRange = 300;
    this.maxSpeed = 5;
    this.collected = false;
    
    // Add some random initial velocity
    const randomAngle = random(TWO_PI);
    this.velocity = createVector(
      cos(randomAngle),
      sin(randomAngle)
    ).mult(2);
  }

  update(player) {
    
    if (this.collected) return;

    const distanceToPlayer = dist(
      this.position.x, this.position.y,
      player.position.x, player.position.y
    );

    // Check if within collection range
    if (distanceToPlayer < player.size) {
      player.addXP(this.xpValue);
      this.collected = true;
      return;
    }

    // Move towards player if within attraction range
    if (distanceToPlayer < this.attractionRange) {
      const direction = createVector(
        player.position.x - this.position.x,
        player.position.y - this.position.y
      ).normalize();

      // Increase attraction speed as orb gets closer
      const attractionStrength = map(
        distanceToPlayer,
        0, this.attractionRange,
        this.maxSpeed, 0.5
      );

      direction.mult(attractionStrength);
      this.velocity.lerp(direction, 0.1);
    }

    // Apply velocity with some dampening
    this.velocity.mult(0.98);
    this.position.add(this.velocity);

    // Screen wrapping
    if (this.position.x > width + this.size) this.position.x = -this.size;
    else if (this.position.x < -this.size) this.position.x = width + this.size;
    if (this.position.y > height + this.size) this.position.y = -this.size;
    else if (this.position.y < -this.size) this.position.y = height + this.size;
  }

  draw() {
    
    if (this.collected) return;

    push();
    translate(this.position.x, this.position.y);

    // Glow effect
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(0, 255, 255, 0.5)';

    // Draw orb
    noStroke();
    fill(0, 255, 255);
    circle(0, 0, this.size);

    // Inner highlight
    fill(255);
    circle(0, 0, this.size * 0.5);

    drawingContext.shadowBlur = 0;
    pop();
  }
}