//import{ GameObject } from './GameObject.js';
//import{ getP5 } from '../game/p5Instance.js';
//import{ Projectile } from './Projectile.js';
//import{ entities, gameState } from '../game/GameState.js';
//import{ playSound } from '../game/SoundManager.js';

class Alien extends GameObject {
  constructor(x, y) {
    
    super(x, y, 20, createVector(0, 0), 0);
    
    // Combat properties
    this.shootDelay = 1000;
    this.lastShotTime = 0;
    this.projectiles = [];
    // Base health halved and scaled with game difficulty
    this.maxHealth = 25 * (1 + (0.5 * gameState.difficulty));
    this.health = this.maxHealth;
    this.damage = 10;
    
    // Movement properties
    this.maxSpeed = 2;
    this.preferredDistance = 200; // Distance it tries to maintain from player
    this.fleeDistance = 100; // Distance at which it starts to flee
    this.intelligenceLevel = random(0.5, 1); // Affects decision making
    
    // Behavior state
    this.state = 'approach'; // approach, maintain, flee
    this.lastStateChange = 0;
    this.stateChangeCooldown = 1000;
  }

  update() {
    
    if (!entities.player) return;

    // Update projectiles
    for (let proj of this.projectiles) {
      proj.update();
    }

    // Calculate distance to player
    const distanceToPlayer = dist(
      this.position.x, this.position.y,
      entities.player.position.x, entities.player.position.y
    );

    // Update state based on distance
    if (millis() - this.lastStateChange > this.stateChangeCooldown) {
      if (distanceToPlayer < this.fleeDistance) {
        this.state = 'flee';
      } else if (distanceToPlayer > this.preferredDistance * 1.2) {
        this.state = 'approach';
      } else {
        this.state = 'maintain';
      }
      this.lastStateChange = millis();
    }

    // Movement behavior based on state
    const angleToPlayer = atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );

    let targetVelocity = createVector(0, 0);
    
    switch (this.state) {
      case 'approach':
        targetVelocity = createVector(cos(angleToPlayer), sin(angleToPlayer));
        break;
      case 'flee':
        targetVelocity = createVector(-cos(angleToPlayer), -sin(angleToPlayer));
        break;
      case 'maintain':
        // Orbit around player
        const orbitAngle = angleToPlayer + HALF_PI;
        targetVelocity = createVector(cos(orbitAngle), sin(orbitAngle));
        break;
    }

    // Apply intelligence level to movement
    targetVelocity.mult(this.maxSpeed * this.intelligenceLevel);
    this.velocity.lerp(targetVelocity, 0.1);

    // Update position
    this.position.add(this.velocity);

    // Update direction to face player
    this.direction = degrees(angleToPlayer);

    // Attempt to shoot based on intelligence level
    if (millis() - this.lastShotTime > this.shootDelay / this.intelligenceLevel) {
      this.shoot();
    }

    // Screen wrapping
    if (this.position.x > width + this.size) this.position.x = -this.size;
    else if (this.position.x < -this.size) this.position.x = width + this.size;
    if (this.position.y > height + this.size) this.position.y = -this.size;
    else if (this.position.y < -this.size) this.position.y = height + this.size;
  }

  shoot() {
    
    if (!entities.player) return;

    const angleToPlayer = atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );

    // Add some inaccuracy based on inverse of intelligence level
    const inaccuracy = (1 - this.intelligenceLevel) * 0.5;
    const finalAngle = angleToPlayer + random(-inaccuracy, inaccuracy);

    const velocity = createVector(
      cos(finalAngle),
      sin(finalAngle)
    ).mult(4);

    const projectile = new Projectile(
      this.position.x + cos(finalAngle) * 20,
      this.position.y + sin(finalAngle) * 20,
      velocity,
      this
    );

    projectile.damage = this.damage;
    this.projectiles.push(projectile);
    this.lastShotTime = millis();
    //playSound('shootSound');
  }

  draw() {
    
    
    // Draw projectiles
    for (let proj of this.projectiles) {
      proj.draw();
    }
    
    push();
    translate(this.position.x, this.position.y);
    rotate(radians(this.direction) + HALF_PI);

    // Shadow effect
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(0, 255, 0, 0.5)';
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;

    // Draw alien ship
    stroke(0, 255, 0);
    strokeWeight(2);
    noFill();
    triangle(0, -this.size, -this.size / 2, this.size, this.size / 2, this.size);

    drawingContext.shadowBlur = 0;
    pop();
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      // Heal player when destroying alien
      if (entities.player) {
        entities.player.heal(20);
      }
      return true;
    }
    return false;
  }
}