class XPOrb extends GameObject {
  constructor(x, y, xpValue) {
    const collisionVertices = GameObject.generateDefaultVertices(10); // Default circular shape
    super(x, y, collisionVertices, collisionVertices, {
      restitution: 0.5,
      friction: 0.05,
    });

    this.xpValue = xpValue;
    this.collectionRange = 150;
    this.attractionRange = 300;
    this.maxSpeed = 5;
    this.collected = false;

    // Add some random initial velocity
    const randomAngle = Math.random() * Math.PI * 2;
    this.velocity = Matter.Vector.create(
      Math.cos(randomAngle),
      Math.sin(randomAngle)
    ).mult(2);
  }

  update(player) {
    if (this.collected) return;

    const distanceToPlayer = Matter.Vector.magnitude(
      Matter.Vector.sub(this.body.position, player.body.position)
    );

    // Check if within collection range
    if (distanceToPlayer < player.size) {
      player.addXP(this.xpValue);
      this.collected = true;
      Matter.Composite.remove(world, this.body); // Remove from Matter.js world
      return;
    }

    // Move towards player if within attraction range
    if (distanceToPlayer < this.attractionRange) {
      const direction = Matter.Vector.normalise(
        Matter.Vector.sub(player.body.position, this.body.position)
      );

      // Increase attraction speed as orb gets closer
      const attractionStrength = map(
        distanceToPlayer,
        0,
        this.attractionRange,
        this.maxSpeed,
        0.5
      );

      const attractionForce = Matter.Vector.mult(direction, attractionStrength);
      this.body.velocity = Matter.Vector.add(
        Matter.Vector.mult(this.body.velocity, 0.9), // Apply dampening
        attractionForce
      );
    }

    // Apply velocity
    Matter.Body.setVelocity(this.body, this.body.velocity);

    // Screen wrapping
    if (this.body.position.x > width + this.size) {
      Matter.Body.setPosition(this.body, {
        x: -this.size,
        y: this.body.position.y,
      });
    } else if (this.body.position.x < -this.size) {
      Matter.Body.setPosition(this.body, {
        x: width + this.size,
        y: this.body.position.y,
      });
    }

    if (this.body.position.y > height + this.size) {
      Matter.Body.setPosition(this.body, {
        x: this.body.position.x,
        y: -this.size,
      });
    } else if (this.body.position.y < -this.size) {
      Matter.Body.setPosition(this.body, {
        x: this.body.position.x,
        y: height + this.size,
      });
    }
  }

  draw() {
    if (this.collected) return;

    const pos = this.body.position;

    push();
    translate(pos.x, pos.y);

    // Glow effect
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(0, 255, 255, 0.5)';

    // Draw orb
    noStroke();
    fill(0, 255, 255);
    circle(0, 0, this.size);

    // Inner highlight
    fill(255);
    circle(0, 0, this.size * 0.5);

    drawingContext.shadowBlur = 0;
    pop();
  }
}
