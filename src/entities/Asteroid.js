//import{ GameObject } from './GameObject.js';
//import{ getP5 } from '../game/p5Instance.js';
//import{ createBulletImpactDebris } from '../effects/EffectManager.js';
//import{ playSound } from '../game/SoundManager.js';
//import{ openDeathMenu } from '../game/DeathMenu.js';

class Asteroid extends GameObject {
  constructor(x, y, size, seed, isGold = false, health = 20) {
    
    super(x, y, size, createVector(0, 0), random(0, 360));
    
    this.seed = seed;
    this.color = "white";
    this.vertices = this.generateVertices();
    this.radius = this.calculateRadius();
    // Halve base health and scale with difficulty
    this.maxHealth = (health * 0.5) * (1 + (min(max(0.2, 0.1 * sqrt(this.size)), 2)));
    this.health = this.maxHealth;
    this.damageEffect = null;
    this.isDestroyed = false;
    this.damage = 10;
    this.speed = 50;
    this.maxSize = this.size;
    this.isGold = isGold;
    
    // Speed control properties
    this.maxSpeed = 5;
    this.dampening = 0.95; // Dampening factor when exceeding max speed

    // Calculate direction to center with some randomness
    const centerX = width / 2;
    const centerY = height / 2;
    const angleToCenter = atan2(centerY - y, centerX - x);
    const randomAngleOffset = random(-0.35, 0.35); // About ±20 degrees
    const finalAngle = angleToCenter + randomAngleOffset;
    
    // Set velocity using the calculated angle
    this.velocity.x = cos(finalAngle);
    this.velocity.y = sin(finalAngle);
    this.velocity.mult((1/this.size) * this.speed * (1 + min(max(0.2, 0.1 * sqrt(this.size)), 2)));
  }

  generateVertices() {
    
    noiseSeed(this.seed);
    let vertices = [];
    let totalVertices = int(random(8, 16));
    let noiseStrength = 3;

    for (let i = 0; i < totalVertices; i++) {
      let angle = TWO_PI / totalVertices * i;
      let radius = this.size + noise(i * noiseStrength, this.seed) * this.size * 0.5;
      vertices.push(createVector(cos(angle) * radius, sin(angle) * radius));
    }
    return vertices;
  }

  calculateRadius() {
    let maxDistance = 0;
    for (let v of this.vertices) {
      let distance = v.mag();
      if (distance > maxDistance) maxDistance = distance;
    }
    return maxDistance * (this.size / 60);
  }

  checkPlayerCollision(player) {
    
    if (!player) return false;
    
    let distance = dist(this.position.x, this.position.y, player.position.x, player.position.y);
    
    if (distance < this.radius + player.size) {
      // Apply damage to player
      player.applyDamage(this.damage);
      
      // Calculate repulsion direction (away from player)
      const repulsionAngle = atan2(
        this.position.y - player.position.y,
        this.position.x - player.position.x
      );
      
      // Create repulsion vector
      const repulsionForce = createVector(
        cos(repulsionAngle),
        sin(repulsionAngle)
      ).mult(2); // Adjust multiplier to control repulsion strength
      
      // Apply repulsion to asteroid
      this.velocity.add(repulsionForce);
      
      // Damage the asteroid
      this.health -= this.health * 0.3;
      
      // Check if asteroid should be destroyed
      if (this.health <= 0) {
        this.isDestroyed = true;
        // Heal player when destroying asteroid
        player.heal(10);
        return true;
      }
    }
    return false;
  }

  triggerDamageEffect() {
    this.damageEffect = {
      size: this.size - 10,
      alpha: 128,
      life: 15
    };
  }

  updateDamageEffect() {
    if (this.damageEffect) {
      this.damageEffect.size += 1;
      this.damageEffect.alpha -= 8.5;
      this.damageEffect.life -= 1;

      if (this.damageEffect.life <= 0) {
        this.damageEffect = null;
      }
    }
  }

  drawDamageEffect() {
    
    if (this.damageEffect) {
      push();
      translate(this.position.x, this.position.y);
      noFill();
      rotate(radians(this.direction));
      
      if (this.isGold) {
        stroke(150, 125, 0, map(this.damageEffect.life, 30, 0, 128, 0));
      } else {
        stroke(150, 150, 150, map(this.damageEffect.life, 30, 0, 128, 0));
      }
      
      strokeWeight(2);
      beginShape();
      for (let v of this.vertices) {
        let scaledVertex = v.copy().mult(this.damageEffect.size / this.size);
        vertex(scaledVertex.x, scaledVertex.y);
      }
      endShape(CLOSE);
      pop();
    }
  }

  draw() {
    
    this.updateDamageEffect();
    this.drawDamageEffect();
    
    push();
    translate(this.position.x, this.position.y);
    rotate(radians(this.direction));

    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = `rgba(150, 150, 150, 0.8)`;

    noFill();
    if (this.isGold) {
      stroke(150, 125, 0);
    } else {
      stroke(this.color);
    }
    strokeWeight(2);
    beginShape();
    for (let v of this.vertices) {
      vertex(v.x * (this.size / 60), v.y * (this.size / 60));
    }
    endShape(CLOSE);

    drawingContext.shadowBlur = 0;
    pop();
  }

  update() {
    
    if (this.isDestroyed) {
      return;
    }

    // Apply speed dampening if exceeding max speed
    const currentSpeed = this.velocity.mag();
    if (currentSpeed > this.maxSpeed) {
      this.velocity.mult(this.dampening);
    }

    this.position.add(this.velocity);

    if (this.position.x > width + this.radius) this.position.x = -this.radius;
    else if (this.position.x < -this.radius) this.position.x = width + this.radius;
    if (this.position.y > height + this.radius) this.position.y = -this.radius;
    else if (this.position.y < -this.radius) this.position.y = height + this.radius;

    let offset = this.radius;
    if (this.position.x < -this.radius - offset ||
        this.position.x > width + this.radius + offset ||
        this.position.y < -this.radius - offset ||
        this.position.y > height + this.radius + offset) {
      this.isDestroyed = true;
    }
  }

  checkProjectileCollision(projectile) {
    
    let distance = dist(this.position.x, this.position.y, projectile.position.x, projectile.position.y);

    if (distance < this.radius + projectile.size) {
      this.health -= projectile.damage;
      
      const impactForce = createVector(
        this.position.x - projectile.position.x,
        this.position.y - projectile.position.y
      ).normalize().mult(1 / this.size * 20);
      
      this.velocity.add(impactForce);
      this.triggerDamageEffect();
      
      this.size = map(this.health, this.maxHealth, 0, this.maxSize, 20);
      this.radius = this.calculateRadius();
      
      // Calculate relative velocity for impact direction
      const relativeVelocity = createVector(
        projectile.velocity.x - this.velocity.x,
        projectile.velocity.y - this.velocity.y
      );
      const impactDirection = degrees(relativeVelocity.heading());
      
      createBulletImpactDebris({
        position: projectile.position,
        direction: impactDirection,
        spreadAngle: 120
      });
      
      //playSound('explodeSound1');
      
      projectile.Destroy();
      return this.health <= 0;
    }
    return false;
  }

  applyRepulsion(other) {
    
    let distance = dist(this.position.x, this.position.y, other.position.x, other.position.y);
    let overlap = this.radius + other.radius - distance;

    if (overlap > 0) {
      const repulsion = createVector(
        this.position.x - other.position.x,
        this.position.y - other.position.y
      ).normalize();
      
      let repulsionStrength = min(overlap * 0.1, 1);
      repulsion.mult(repulsionStrength);

      this.velocity.add(repulsion);
      other.velocity.sub(repulsion);

      this.velocity.mult(0.9);
      other.velocity.mult(0.9);
    }
  }
}