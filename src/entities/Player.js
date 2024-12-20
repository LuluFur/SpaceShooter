class Player extends GameObject {
  constructor(x, y) {
    const collisionVertices = Player.generateCollisionVertices(x, y, 20);
    const drawVertices = Player.generateDrawVertices(20);

    super(x, y, drawVertices, collisionVertices, {
      restitution: 0.5,
      friction: 0.05,
    });

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

  static generateCollisionVertices(x, y, size) {
    const vertices = [];
    for (let i = 0; i < 3; i++) {
      const angle = i * (TWO_PI / 3) - HALF_PI;
      vertices.push({
        x: x + size * Math.cos(angle),
        y: y + size * Math.sin(angle),
      });
    }
    return vertices;
  }

  static generateDrawVertices(size) {
    return [
      { x: 0, y: -size },
      { x: -size / 2, y: size },
      { x: size / 2, y: size },
    ];
  }

  heal(amount) {
    const oldHealth = this.health;
    this.health = Math.min(this.health + amount, this.maxHealth);
    const healedAmount = this.health - oldHealth;

    if (healedAmount > 0) {
      createHealEffect(this.body.position, Math.ceil(healedAmount));
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

    const reducedDamage = damage * (1 - this.damageReduction);
    this.health -= reducedDamage;
    this.health = Math.max(this.health, 0);
    this.iFrames = 60;
  }

  getHealthPercentage() {
    return (this.health / this.maxHealth) * 100;
  }

  move() {
    const targetPosition = Matter.Vector.create(mouseX, mouseY);
    const directionToMouse = Matter.Vector.angle(targetPosition, this.body.position);

    if (mouseIsPressed && mouseButton === RIGHT) {
      const force = Matter.Vector.create(
        Math.cos(directionToMouse),
        Math.sin(directionToMouse)
      );
      Matter.Body.applyForce(this.body, this.body.position, force);

      new ParticleEffect({
        x: this.body.position.x - Math.cos(directionToMouse) * 15,
        y: this.body.position.y - Math.sin(directionToMouse) * 15,
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
    }

    // Limit speed
    const speed = Math.min(Matter.Vector.magnitude(this.body.velocity), this.speed);
    Matter.Body.setVelocity(
      this.body,
      Matter.Vector.mult(Matter.Vector.normalise(this.body.velocity), speed)
    );
  }

  update() {
    this.move();

    // Reduce iFrames
    if (this.iFrames > 0) this.iFrames--;

    // Update projectiles
    this.projectiles.forEach((proj) => proj.update());

    // Fire bullets
    if (mouseIsPressed && mouseButton === LEFT) {
      this.shoot();
    }
  }

  shoot() {
    if (millis() - this.lastShotTime >= this.shootDelay / this.fireRate) {
      const angle = Math.atan2(
        mouseY - this.body.position.y,
        mouseX - this.body.position.x
      );
      const spread = 10;

      // Generate bullet angles based on bullet count
      const angles = [...Array(this.bulletCount).keys()].map(
        (i) => angle + radians(i * spread - spread * (this.bulletCount - 1) / 2)
      );

      // Create projectiles
      angles.forEach((a) => {
        const velocity = Matter.Vector.create(Math.cos(a), Math.sin(a));
        const projectile = new Projectile(
          this.body.position.x,
          this.body.position.y,
          Matter.Vector.mult(velocity, this.bulletSpeed),
          this
        );
        projectile.size = this.bulletSize;
        projectile.damage = this.bulletDamage;
        projectile.bouncesRemaining = this.bulletBounces;
        this.projectiles.push(projectile);
      });

      this.lastShotTime = millis();
    }
  }

  draw() {
    for (let proj of this.projectiles) {
      proj.draw();
    }

    push();
    translate(this.body.position.x, this.body.position.y);

    // Flash effect during iFrames
    if (this.iFrames > 0) {
      // Flash every 4 frames
      if (Math.floor(this.iFrames / 4) % 2 === 0) {
        stroke(255, 0, 0); // Red flash
      } else {
        stroke(255, 255, 0); // Normal color
      }
    } else {
      stroke(255, 255, 0); // Normal color
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

    triangle(0, -20, -10, 20, 10, 20);

    drawingContext.shadowBlur = 0;
    pop();
  }
}
