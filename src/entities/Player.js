class Player extends GameObject {
  constructor(x, y) {
    super(x, y, GameObjectVerticesLookup.Player(20), GameObjectVerticesLookup.Player(20), {
      isStatic: false
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

    let reducedDamage = damage * (1 - this.damageReduction);
    this.health -= reducedDamage;
    this.health = Math.max(this.health, 0);
    this.iFrames = 60;
  }

  getHealthPercentage() {
    return (this.health / this.maxHealth) * 100;
  }

  move() {
    // log
    if (!this.body || !this.body.position) {
      console.error("Player body position is invalid.");
      return;
    }

    let targetPosition = createVector(mouseX, mouseY);
    let directionToMouse = targetPosition.sub(this.body.position).heading();

    // log
    if (isNaN(directionToMouse)) {
      console.error("Invalid direction to mouse:", directionToMouse);
      return;
    }

    // Calculate the current angle of the body
    let currentAngle = this.body.angle;

    // Calculate the shortest angular difference
    let angularDifference = directionToMouse - currentAngle;
    angularDifference = Math.atan2(Math.sin(angularDifference), Math.cos(angularDifference)); // Normalize to [-PI, PI]

    // log
    if (isNaN(angularDifference)) {
      console.error("Invalid angular difference:", angularDifference);
      return;
    }

    // Define a proportional gain to control rotational speed
    const rotationalForce = 0.1; // Adjust for smoother or faster rotation

    // Set the angular velocity proportional to the angular difference
    Matter.Body.setAngularVelocity(this.body, angularDifference * rotationalForce);

    console.log("Applied rotational force with angular difference:", angularDifference);
  
    if (mouseIsPressed && mouseButton === RIGHT) {
      let force = createVector(cos(directionToMouse), sin(directionToMouse)).mult(0.1);
      Matter.Body.applyForce(this.body, this.body.position, force);
  
      // Debugging: Draw a line showing the applied force
      push();
      stroke(255, 0, 0);
      strokeWeight(2);
      line(
        this.body.position.x,
        this.body.position.y,
        this.body.position.x + force.x * 100,
        this.body.position.y + force.y * 100
      );
      pop();
  
      new ParticleEffect({
        x: this.body.position.x - cos(directionToMouse) * 15,
        y: this.body.position.y - sin(directionToMouse) * 15,
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
    Matter.Body.setVelocity(this.body, Matter.Vector.mult(Matter.Vector.normalise(this.body.velocity), speed));
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
      const angle = atan2(mouseY - this.body.position.y, mouseX - this.body.position.x);
      const spread = 10;

      // Generate bullet angles based on bullet count
      const angles = [...Array(this.bulletCount).keys()].map((i) => angle + radians(i * spread - spread * (this.bulletCount - 1) / 2));

      // Create projectiles
      angles.forEach((a) => {
        const velocity = Matter.Vector.create(Math.cos(a), Math.sin(a));
        const scaledVelocity = Matter.Vector.mult(velocity, this.bulletSpeed);

        const projectile = new Projectile(
          this.body.position.x,
          this.body.position.y,
          scaledVelocity,
          this,
          {
            velocity: Matter.Vector.mult(velocity, this.bulletSpeed),
            damage: this.bulletDamage,
            bouncesRemaining: this.bulletBounces,
            player: this
          }
        );
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
    const pos = this.body.position;
    const angle = this.body.angle;

    translate(pos.x, pos.y);
    rotate(angle);

    if (this.iFrames > 0) {
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

    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';

    const vertices = GameObjectVerticesLookup.Player(this.size);
    beginShape();
    vertices.forEach((v) => vertex(v.x, v.y));
    endShape(CLOSE);

    drawingContext.shadowBlur = 0;
    pop();
  }
}
