class Alien extends GameObject {
  constructor(x, y) {
    const collisionVertices = Alien.generateCollisionVertices(20);
    super(x, y, collisionVertices, collisionVertices, {
      restitution: 0.5,
      friction: 0.05,
    });

    // Combat properties
    this.shootDelay = 1000;
    this.lastShotTime = 0;
    this.projectiles = [];
    // Base health halved and scaled with game difficulty
    this.maxHealth = 25 * (1 + 0.5 * gameState.difficulty);
    this.health = this.maxHealth;
    this.damage = 10;

    // Movement properties
    this.maxSpeed = 2;
    this.preferredDistance = 200; // Distance it tries to maintain from player
    this.fleeDistance = 100; // Distance at which it starts to flee
    this.intelligenceLevel = Math.random() * 0.5 + 0.5; // Affects decision making

    // Behavior state
    this.state = "approach"; // approach, maintain, flee
    this.lastStateChange = 0;
    this.stateChangeCooldown = 1000;
  }

  static generateCollisionVertices(size) {
    return [
      { x: 0, y: -size },
      { x: -size / 2, y: size },
      { x: size / 2, y: size },
    ];
  }

  update() {
    if (!entities.player) return;

    // Update projectiles
    this.projectiles.forEach((proj) => proj.update());

    // Calculate distance to player
    const distanceToPlayer = Matter.Vector.magnitude(
      Matter.Vector.sub(this.body.position, entities.player.body.position)
    );

    // Update state based on distance
    if (millis() - this.lastStateChange > this.stateChangeCooldown) {
      if (distanceToPlayer < this.fleeDistance) {
        this.state = "flee";
      } else if (distanceToPlayer > this.preferredDistance * 1.2) {
        this.state = "approach";
      } else {
        this.state = "maintain";
      }
      this.lastStateChange = millis();
    }

    // Movement behavior based on state
    const angleToPlayer = Matter.Vector.angle(
      this.body.position,
      entities.player.body.position
    );

    let targetVelocity = Matter.Vector.create(0, 0);

    switch (this.state) {
      case "approach":
        targetVelocity = Matter.Vector.create(
          Math.cos(angleToPlayer),
          Math.sin(angleToPlayer)
        );
        break;
      case "flee":
        targetVelocity = Matter.Vector.create(
          -Math.cos(angleToPlayer),
          -Math.sin(angleToPlayer)
        );
        break;
      case "maintain":
        // Orbit around player
        const orbitAngle = angleToPlayer + Math.PI / 2;
        targetVelocity = Matter.Vector.create(
          Math.cos(orbitAngle),
          Math.sin(orbitAngle)
        );
        break;
    }

    // Apply intelligence level to movement
    targetVelocity = Matter.Vector.mult(
      targetVelocity,
      this.maxSpeed * this.intelligenceLevel
    );
    Matter.Body.setVelocity(this.body, targetVelocity);

    // Attempt to shoot based on intelligence level
    if (millis() - this.lastShotTime > this.shootDelay / this.intelligenceLevel) {
      this.shoot();
    }
  }

  shoot() {
    if (!entities.player) return;

    const angleToPlayer = Matter.Vector.angle(
      this.body.position,
      entities.player.body.position
    );

    // Add some inaccuracy based on inverse of intelligence level
    const inaccuracy = (1 - this.intelligenceLevel) * 0.5;
    const finalAngle = angleToPlayer + Math.random() * inaccuracy - inaccuracy / 2;

    const velocity = Matter.Vector.create(
      Math.cos(finalAngle),
      Math.sin(finalAngle)
    );
    const projectile = new Projectile(
      this.body.position.x + Math.cos(finalAngle) * 20,
      this.body.position.y + Math.sin(finalAngle) * 20,
      Matter.Vector.mult(velocity, 4),
      this
    );

    projectile.damage = this.damage;
    this.projectiles.push(projectile);
    this.lastShotTime = millis();
  }

  draw() {
    // Draw projectiles
    this.projectiles.forEach((proj) => proj.draw());

    const vertices = this.body.vertices;
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    // Shadow effect
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(0, 255, 0, 0.5)";

    // Draw alien ship
    stroke(0, 255, 0);
    strokeWeight(2);
    noFill();
    beginShape();
    vertices.forEach((v) => vertex(v.x - this.body.position.x, v.y - this.body.position.y));
    endShape(CLOSE);

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
