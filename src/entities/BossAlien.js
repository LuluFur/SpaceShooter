class BossAlien extends MiniBossAlien {
  constructor(x, y) {
    const collisionVertices = Alien.generateCollisionVertices(80);
    super(x, y, collisionVertices, collisionVertices, {
      restitution: 0.5,
      friction: 0.05,
    });

    // Double the size of mini boss
    this.size = 80;

    // Much higher health pool scaled with difficulty
    this.maxHealth = 300 * (1 + 0.5 * gameState.difficulty);
    this.health = this.maxHealth;

    // Shooting patterns
    this.shootingMode = "heavy"; // 'heavy' or 'rapid'
    this.modeChangeTimer = 0;
    this.modeChangeDuration = 5000; // Change mode every 5 seconds

    // Heavy shot properties
    this.heavyDamage = 50;
    this.heavySize = 30;
    this.heavySpeed = 2;
    this.heavyDelay = 2000;

    // Rapid shot properties
    this.rapidDamage = 10;
    this.rapidSize = 8;
    this.rapidSpeed = 8;
    this.rapidDelay = 200;

    // Burst properties
    this.burstCount = 3;
    this.burstDelay = 150;
    this.currentBurst = 0;
    this.burstTimer = 0;

    // Movement
    this.maxSpeed = 0.75;
    this.preferredDistance = 400;
    this.fleeDistance = 200;
  }

  update() {
    // Update mode
    if (millis() - this.modeChangeTimer > this.modeChangeDuration) {
      this.shootingMode = this.shootingMode === "heavy" ? "rapid" : "heavy";
      this.modeChangeTimer = millis();
      this.currentBurst = 0;
      this.burstTimer = 0;
    }

    // Increase burst count as health decreases
    this.burstCount = 3 + Math.floor((1 - this.health / this.maxHealth) * 5);

    // Update shooting delay based on mode
    this.shootDelay =
      this.shootingMode === "heavy" ? this.heavyDelay : this.rapidDelay;

    super.update();
  }

  shoot() {
    if (!entities.player) return;

    // Check if it's time for a new burst
    if (this.currentBurst === 0 && millis() - this.lastShotTime >= this.shootDelay) {
      this.startBurst();
    }

    // Check if it's time for the next shot in the burst
    if (this.currentBurst > 0 && millis() - this.burstTimer >= this.burstDelay) {
      this.fireBullet();
      this.currentBurst--;
      this.burstTimer = millis();

      if (this.currentBurst === 0) {
        this.lastShotTime = millis();
      }
    }
  }

  startBurst() {
    this.currentBurst = this.burstCount;
    this.burstTimer = millis();
  }

  fireBullet() {
    if (!entities.player) return;

    const angleToPlayer = Matter.Vector.angle(
      this.body.position,
      entities.player.body.position
    );

    // Less inaccuracy for heavy shots
    const inaccuracy = this.shootingMode === "heavy" ? 0.1 : 0.2;
    const finalAngle =
      angleToPlayer + Math.random() * inaccuracy - inaccuracy / 2;

    const speed =
      this.shootingMode === "heavy" ? this.heavySpeed : this.rapidSpeed;
    const velocity = Matter.Vector.create(
      Math.cos(finalAngle),
      Math.sin(finalAngle)
    ).mult(speed);

    const projectile = new Projectile(
      this.body.position.x + Math.cos(finalAngle) * 40,
      this.body.position.y + Math.sin(finalAngle) * 40,
      velocity,
      this
    );

    // Set projectile properties based on mode
    if (this.shootingMode === "heavy") {
      projectile.damage = this.heavyDamage;
      projectile.size = this.heavySize;
    } else {
      projectile.damage = this.rapidDamage;
      projectile.size = this.rapidSize;
    }

    this.projectiles.push(projectile);
    playSound("shootSound");
  }

  draw() {
    // Draw projectiles
    this.projectiles.forEach((proj) => proj.draw());

    const vertices = this.body.vertices;
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    // Pulsing glow effect
    this.glowIntensity += 0.05 * this.glowDirection;
    if (this.glowIntensity >= 1) this.glowDirection = -1;
    if (this.glowIntensity <= 0) this.glowDirection = 1;

    // Mode-specific glow color
    const glowColor =
      this.shootingMode === "heavy"
        ? "rgba(255, 0, 0, 0.5)"
        : "rgba(255, 150, 0, 0.5)";

    // Enhanced glow effect
    drawingContext.shadowBlur = 30 + this.glowIntensity * 15;
    drawingContext.shadowColor = glowColor;

    // Draw boss ship
    stroke(
      this.shootingMode === "heavy" ? 255 : 255,
      this.shootingMode === "heavy" ? 0 : 150,
      0
    );
    strokeWeight(4);
    noFill();

    // Complex ship design
    beginShape();
    vertices.forEach((v) =>
      vertex(v.x - this.body.position.x, v.y - this.body.position.y)
    );
    endShape(CLOSE);

    drawingContext.shadowBlur = 0;
    pop();

    // Draw health bar
    this.drawHealthBar();
  }
}
