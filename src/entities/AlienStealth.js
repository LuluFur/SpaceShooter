class AlienStealth extends Alien {
  constructor(x, y) {
    const collisionVertices = Alien.generateCollisionVertices(20);
    super(x, y, collisionVertices, collisionVertices, {
      restitution: 0.5,
      friction: 0.05,
    });

    this.isVisible = false; // Stealth mode by default
    this.visibilityTimer = 0;
    this.visibilityDuration = 3000; // Time visible
    this.invisibilityDuration = 5000; // Time invisible
    this.flashTimer = 0; // Timer for flashing effect
    this.isFlashing = false; // Whether the alien is flashing
  }

  update() {
    if (!entities.player) return;

    // Handle visibility toggle
    const currentTime = millis();
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

    const angleToPlayer = Matter.Vector.angle(
      this.body.position,
      entities.player.body.position
    );

    this.direction = degrees(angleToPlayer); // Update direction to face the player

    if (this.isVisible) {
      // Normal alien update logic
      super.update();
    } else {
      // Hidden mode: faster movement and ramming behavior
      const targetVelocity = Matter.Vector.create(
        Math.cos(angleToPlayer),
        Math.sin(angleToPlayer)
      ).mult(this.maxSpeed * this.intelligenceLevel * 1.5); // Increased speed

      Matter.Body.setVelocity(this.body, targetVelocity);
    }
  }

  draw() {
    const vertices = this.body.vertices;
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    if (this.isVisible || this.isFlashing) {
      // Normal appearance or flashing
      stroke(100, 100, 100, 255); // Solid color when visible
      strokeWeight(2);
      noFill();
      beginShape();
      vertices.forEach((v) => vertex(v.x - this.body.position.x, v.y - this.body.position.y));
      endShape(CLOSE);
    } else {
      // Stealth appearance
      stroke(50, 50, 50, 80); // High transparency
      strokeWeight(1);
      noFill();
      beginShape();
      vertices.forEach((v) => vertex(v.x - this.body.position.x, v.y - this.body.position.y));
      endShape(CLOSE);
    }

    pop();
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
    this.flashTimer = millis();
    return false;
  }
}
