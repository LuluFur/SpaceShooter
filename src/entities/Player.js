//import { GameObject } from './GameObject.js';
//import { getP5 } from '../game/p5Instance.js';
//import { Projectile } from './Projectile.js';
//import { ParticleEffect } from '../effects/ParticleEffect.js';
//import { playSound } from '../game/SoundManager.js';
//import { createHealEffect } from '../effects/EffectManager.js';

class Player extends GameObject {
  constructor(x, y) {
    super(x, y, 20, createVector(0, 0), 0);
    
    // Combat properties
    this.shootDelay = 500;
    this.lastShotTime = 0;
    this.projectiles = [];
    this.iFrames = 0;
    
    // Bullet properties
    this.bulletCount = 1;
    this.bulletDamage = 5;
    this.bulletSize = 5;
    this.fireRate = 1;
    this.bulletSpeed = 1;
    this.bulletBounces = 0;
    
    // Defense properties
    this.shieldEnabled = false;
    this.shieldHits = 2;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.speed = 2;
    this.damageReduction = 0;

    // XP System
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.xpMultiplier = 1;
    this.xpCollectionRange = 300;
  }

  heal(amount) {
    const oldHealth = this.health;
    this.health = Math.min(this.health + amount, this.maxHealth);
    const healedAmount = this.health - oldHealth;
    
    if (healedAmount > 0) {
      createHealEffect(this.position, Math.ceil(healedAmount));
    }
  }

  addXP(amount) {
    const adjustedAmount = amount * this.xpMultiplier;
    this.xp += adjustedAmount;
    
    while (this.xp >= this.xpToNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.xp -= this.xpToNextLevel;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.2);
    this.heal(this.maxHealth * 0.3); // Heal 30% of max health on level up
  }

  setHealth(health) {
    this.health = Math.min(health, this.maxHealth);
  }

  applyDamage(damage) {
    if (this.iFrames > 0) return;
    
    let reducedDamage = damage * (1 - this.damageReduction);
    this.health -= reducedDamage;
    this.health = Math.max(this.health, 0);
    this.iFrames = 60;
  }

  getHealthPercentage() {
    return (this.health / this.maxHealth) * 100;
  }

  generateVertices() {
    
    this.shieldSeed = Math.floor((frameCount / 15) % 4) + 1;

    let vertices = [];
    let totalVertices = 8;
    let noiseStrength = 3;

    for (let i = 0; i < totalVertices; i++) {
      let angle = TWO_PI / totalVertices * i;
      let radius = this.size + noise(i * noiseStrength, this.shieldSeed) * this.size * 0.5;
      vertices.push(createVector(cos(angle) * radius, sin(angle) * radius));
    }
    return vertices;
  }

  drawShieldEffect() {
    
    beginShape();
    for (let v of this.generateVertices()) {
      vertex(v.x * (this.size / 15), v.y * (this.size / 15));
    }
    endShape(CLOSE);
  }

  move() {
    
    let mouseVector = createVector(mouseX, mouseY);
    let directionToMouse = mouseVector.sub(this.position).heading();
    this.direction = degrees(directionToMouse);

    if (mouseIsPressed && mouseButton === RIGHT) {
      let force = createVector(cos(directionToMouse), sin(directionToMouse)).mult(0.1);
      this.velocity.add(force);
      
      new ParticleEffect({
        x: this.position.x - cos(directionToMouse) * 15,
        y: this.position.y - sin(directionToMouse) * 15,
        numParticles: 3,
        sizeMin: 6,
        sizeMax: 4,
        color1: [255, 50, 50],
        color2: [255, 200, 0],
        alpha1: 255,
        alpha2: 50,
        lifetime: 0.25,
        speedMin: 3,
        speedMax: 1,
        angleMin: degrees(directionToMouse) + 180 - 35,
        angleMax: degrees(directionToMouse) + 180 + 35,
      });
    } else {
      this.velocity.mult(0.98);
    }

    this.velocity.limit(3);
    this.position.add(this.velocity);
  }

  update() {
    
    if (mouseIsPressed && mouseButton === LEFT) {
      this.shoot();
    }
    
    this.move();
    
    if (this.iFrames > 0) this.iFrames--;

    for (let proj of this.projectiles) {
      proj.update();
    }
  }

  shoot() {
    
    if (millis() - this.lastShotTime >= this.shootDelay / this.fireRate) {
      let directionToMouse = atan2(mouseY - this.position.y, mouseX - this.position.x);
      let spread = 10;

      let angles = [];
      if (this.bulletCount % 2 === 1) {
        angles.push(directionToMouse);
        for (let i = 1; i <= Math.floor(this.bulletCount / 2); i++) {
          let offset = radians(i * spread);
          angles.push(directionToMouse - offset, directionToMouse + offset);
        }
      } else {
        for (let i = 1; i <= this.bulletCount / 2; i++) {
          let offset = radians(i * spread - spread * 0.5);
          angles.push(directionToMouse - offset, directionToMouse + offset);
        }
      }

      angles.forEach(angle => {
        let velocity = createVector(cos(angle), sin(angle)).mult(5 * this.bulletSpeed);
        let px = this.position.x + cos(directionToMouse) * 15;
        let py = this.position.y + sin(directionToMouse) * 15;
        let newProjectile = new Projectile(px, py, velocity, this);
        newProjectile.size = this.bulletSize;
        newProjectile.damage = this.bulletDamage;
        newProjectile.bouncesRemaining = this.bulletBounces;
        this.projectiles.push(newProjectile);
      });

      //playSound('shootSound');
      this.lastShotTime = millis();
    }
  }

  draw() {
    
    
    for (let proj of this.projectiles) {
      proj.draw();
    }
    
    push();
    translate(this.position.x, this.position.y);
    
    // Flash effect during iFrames
    if (this.iFrames > 0) {
      // Flash every 4 frames
      if (Math.floor(this.iFrames / 4) % 2 === 0) {
        stroke(255, 0, 0); // Red flash
      } else {
        stroke(255); // Normal color
      }
    } else {
      stroke(255); // Normal color
    }
    
    noFill();
    strokeWeight(2);
    
    if (this.shieldEnabled) {
      stroke(0, 100, 255);
      this.drawShieldEffect();
      if (this.iFrames > 0) {
        stroke(255, 0, 0);
      } else {
        stroke(255);
      }
    }
    
    rotate(radians(this.direction) + HALF_PI);

    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;

    triangle(0, -this.size, -this.size / 2, this.size, this.size / 2, this.size);
    
    drawingContext.shadowBlur = 0;
    pop();
  }
}