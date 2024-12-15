//import{ Alien } from './Alien.js';
//import{ entities, gameState } from '../game/GameState.js';
//import{ getP5 } from '../game/p5Instance.js';
//import{ GameObject } from './GameObject.js';
//import{ Projectile } from './Projectile.js';
//import{ playSound } from '../game/SoundManager.js';

class AlienStealth extends Alien {
  constructor(x, y) {
    super(x, y);

    this.isVisible = false; // Stealth mode by default
    this.visibilityTimer = 0;
    this.visibilityDuration = 3000; // Time visible
    this.invisibilityDuration = 5000; // Time invisible
    this.flashTimer = 0; // Timer for flashing effect
    this.isFlashing = false; // Whether the alien is flashing
  }

  update() {
    

    // Handle visibility toggle
    const currentTime = p5.millis();
    if (this.isVisible && currentTime - this.visibilityTimer > this.visibilityDuration) {
      this.isVisible = false;
      this.visibilityTimer = currentTime;
    } else if (!this.isVisible && currentTime - this.visibilityTimer > this.invisibilityDuration) {
      this.isVisible = true;
      this.visibilityTimer = currentTime;
    }

    if (this.isFlashing && currentTime - this.flashTimer > 200) {
      this.isFlashing = false; // End flashing after 200ms
    }

    const angleToPlayer = p5.atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );

    this.direction = p5.degrees(angleToPlayer); // Update direction to face the player

    if (this.isVisible) {
      // Normal alien update logic
      super.update();
    } else {
      // Hidden mode: faster movement and ramming behavior
      const targetVelocity = p5.createVector(
        p5.cos(angleToPlayer),
        p5.sin(angleToPlayer)
      ).mult(this.maxSpeed * this.intelligenceLevel * 1.5); // Increased speed

      this.velocity.lerp(targetVelocity, 0.2);
      this.position.add(this.velocity);
    }
  }

  draw() {
    
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(p5.radians(this.direction) + p5.HALF_PI);

    if (this.isVisible || this.isFlashing) {
      // Normal appearance or flashing
      p5.stroke(100, 100, 100, 255); // Solid color when visible
      p5.strokeWeight(2);
      p5.noFill();
      p5.triangle(0, -this.size, -this.size / 2, this.size, this.size / 2, this.size);
    } else {
      // Stealth appearance
      p5.stroke(50, 50, 50, 80); // High transparency
      p5.strokeWeight(1);
      p5.noFill();
      p5.triangle(0, -this.size, -this.size / 2, this.size, this.size / 2, this.size);
    }

    p5.pop();
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      if (entities.player) {
        entities.player.heal(20);
      }
      return true;
    }

    // Trigger flashing effect on damage
    this.isFlashing = true;
    this.flashTimer = getP5().millis();
    return false;
  }
}
