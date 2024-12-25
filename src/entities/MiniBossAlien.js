class MiniBossAlien extends Alien {
  constructor(x, y) {
    const collisionVertices = Alien.generateCollisionVertices(40);
    super(x, y, collisionVertices, collisionVertices, {
      restitution: 0.5,
      friction: 0.05,
    });

    // Double the size
    this.size = 40;

    // Increased health pool scaled with difficulty
    this.maxHealth = 100 * (1 + 0.5 * gameState.difficulty);
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
    if (!entities.player) return;

    const angleToPlayer = Matter.Vector.angle(
      this.body.position,
      entities.player.body.position
    );

    // Less inaccuracy than regular aliens
    const inaccuracy = (1 - this.intelligenceLevel) * 0.25;
    const finalAngle =
      angleToPlayer + Math.random() * inaccuracy - inaccuracy / 2;

    const velocity = Matter.Vector.create(
      Math.cos(finalAngle),
      Math.sin(finalAngle)
    ).mult(3); // Slightly slower projectiles

    const projectile = new Projectile(
      this.body.position.x + Math.cos(finalAngle) * 30,
      this.body.position.y + Math.sin(finalAngle) * 30,
      velocity,
      this
    );

    projectile.damage = this.damage;
    projectile.size = this.projectileSize;
    this.projectiles.push(projectile);
    this.lastShotTime = millis();
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

    // Enhanced glow effect
    drawingContext.shadowBlur = 20 + this.glowIntensity * 10;
    drawingContext.shadowColor = "rgba(255, 0, 0, 0.5)";

    // Draw boss alien ship
    stroke(255, 0, 0);
    strokeWeight(3);
    noFill();

    // More complex ship design
    beginShape();
    vertices.forEach((v) =>
      vertex(v.x - this.body.position.x, v.y - this.body.position.y)
    );
    endShape(CLOSE);

    // Additional details
    line(-this.size / 4, -this.size / 2, this.size / 4, -this.size / 2);
    line(-this.size / 3, this.size / 4, this.size / 3, this.size / 4);

    drawingContext.shadowBlur = 0;
    pop();

    // Draw health bar above boss
    this.drawHealthBar();
  }

  drawHealthBar() {
    const barWidth = this.size * 2;
    const barHeight = 5;
    const x = this.body.position.x - barWidth / 2;
    const y = this.body.position.y - this.size - 15;

    push();
    noStroke();
    // Background
    fill(100, 0, 0);
    rect(x, y, barWidth, barHeight);
    // Health
    const healthWidth = (this.health / this.maxHealth) * barWidth;
    fill(255, 0, 0);
    rect(x, y, healthWidth, barHeight);
    pop();
  }
}
