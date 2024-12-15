//import { GameObject } from './GameObject.js';
//import { getP5 } from '../game/p5Instance.js';
//import { entities } from '../game/GameState.js';
//import { createBulletImpactDebris } from '../effects/EffectManager.js';

class Projectile extends GameObject {
  constructor(x, y, velocity, player) {
    const p5 = getP5();
    super(x, y, 5, velocity, 0);
    this.damage = 5;
    this.isDestroyed = false;
    this.speed = 1;
    this.velocity.mult(this.speed);
    this.player = player;
    
    // Bouncing properties
    this.bouncesRemaining = player?.bulletBounces || 0;
    this.bounceRange = 150 + (this.bouncesRemaining * 50); // Base 150px + 50px per level
    this.hitTargets = new Set(); // Track hit targets to prevent infinite bounces
  }

  calculateBounceNormal(asteroid) {
    const p5 = getP5();
    // Get the vector from asteroid center to projectile
    const normal = createVector(
      this.position.x - asteroid.position.x,
      this.position.y - asteroid.position.y
    ).normalize();
    
    return normal;
  }

  bounce(normal) {
    const p5 = getP5();
    // r = d - 2(d·n)n where d is incident vector, n is normal vector
    const dot = this.velocity.dot(normal);
    const reflection = createVector(
      this.velocity.x - 2 * dot * normal.x,
      this.velocity.y - 2 * dot * normal.y
    );
    
    // Maintain original speed
    reflection.setMag(this.velocity.mag());
    this.velocity = reflection;
  }

  update() {
    const p5 = getP5();
    if (this.isDestroyed) {
      this.Destroy();
      return;
    }

    // Check for collisions with asteroids
    for (const asteroid of entities.asteroids) {
      if (this.hitTargets.has(asteroid)) continue;

      const distance = dist(
        this.position.x, this.position.y,
        asteroid.position.x, asteroid.position.y
      );

      if (distance < asteroid.radius + this.size) {
        // Deal damage to the asteroid
        if (asteroid.health > 0) {
          asteroid.health -= this.damage;
          asteroid.triggerDamageEffect();
          
          // Calculate bounce normal and apply reflection
          const normal = this.calculateBounceNormal(asteroid);
          this.bounce(normal);
          
          // Add asteroid to hit targets and reduce bounces
          this.hitTargets.add(asteroid);
          this.bouncesRemaining--;
          
          // Create impact effect
          createBulletImpactDebris({
            position: this.position,
            direction: degrees(normal.heading()),
            spreadAngle: 30
          });

          // If no bounces remaining, destroy the projectile
          if (this.bouncesRemaining <= 0) {
            this.isDestroyed = true;
          }
          
          break;
        }
      }
    }

    this.position.add(this.velocity);

    if (this.position.x < 0 || this.position.x > width ||
        this.position.y < 0 || this.position.y > height) {
      this.isDestroyed = true;
    }
  }

  draw() {
    const p5 = getP5();
    push();
    translate(this.position.x, this.position.y);

    // Enhanced glow effect for bouncing bullets
    if (this.bouncesRemaining > 0) {
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = 'rgba(0, 255, 255, 1)';
    } else {
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = 'rgba(255, 0, 0, 1)';
    }

    noStroke();
    fill(255, 255, 255);
    circle(0, 0, this.size);

    drawingContext.shadowBlur = 0;
    pop();
  }

  Destroy() {
    if (this.player) {
      const index = this.player.projectiles.indexOf(this);
      if (index !== -1) {
        this.player.projectiles.splice(index, 1);
      }
    }
  }
}