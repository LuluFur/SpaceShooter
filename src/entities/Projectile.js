class Projectile extends GameObject {
  constructor(x, y, velocity, player) {
    // Generate collision vertices for the projectile as a small circle
    // Call GameObject constructor
    super(x, y, drawVertices, collisionVertices, {
      frictionAir: 0,
      restitution: 1, // Perfectly elastic for bounces
    });
    this.size = 5;
    this.drawVertices = GameObject.generateDefaultVertices(size);
    this.collisionVertices = GameObject.generateDefaultVertices(size);

    this.damage = 5;
    this.isDestroyed = false;
    this.speed = 1;
    this.velocity = velocity.copy().mult(this.speed); // Initial velocity
    Matter.Body.setVelocity(this.body, { x: this.velocity.x, y: this.velocity.y });

    this.player = player;

    // Bouncing properties
    this.bouncesRemaining = player?.bulletBounces || 0;
    this.bounceRange = 150 + this.bouncesRemaining * 50; // Base 150px + 50px per level
    this.hitTargets = new Set(); // Track hit targets to prevent infinite bounces
  }

  update() {
    if (this.isDestroyed) {
      this.Destroy();
      return;
    }

    const position = this.body.position;

    // Check for collisions with asteroids
    for (const asteroid of entities.asteroids) {
      if (this.hitTargets.has(asteroid)) continue;

      const distance = Matter.Vector.magnitude(
        Matter.Vector.sub(position, asteroid.body.position)
      );

      if (distance < asteroid.radius + this.size) {
        // Deal damage to the asteroid
        if (asteroid.health > 0) {
          asteroid.health -= this.damage;
          asteroid.triggerDamageEffect();

          // Calculate bounce normal and apply reflection
          const normal = Matter.Vector.normalise(
            Matter.Vector.sub(position, asteroid.body.position)
          );
          this.bounce(normal);

          // Add asteroid to hit targets and reduce bounces
          this.hitTargets.add(asteroid);
          this.bouncesRemaining--;

          // Create impact effect
          createBulletImpactDebris({
            position: { x: position.x, y: position.y },
            direction: degrees(Math.atan2(normal.y, normal.x)),
            spreadAngle: 30,
          });

          // If no bounces remaining, destroy the projectile
          if (this.bouncesRemaining <= 0) {
            this.isDestroyed = true;
          }
          break;
        }
      }
    }

    // Destroy projectile if it leaves the screen bounds
    if (
      position.x < 0 ||
      position.x > width ||
      position.y < 0 ||
      position.y > height
    ) {
      this.isDestroyed = true;
    }
  }

  bounce(normal) {
    const velocity = this.body.velocity;

    // Reflect the velocity vector
    const dot = Matter.Vector.dot(velocity, normal);
    const reflection = Matter.Vector.sub(
      velocity,
      Matter.Vector.mult(normal, 2 * dot)
    );

    Matter.Body.setVelocity(this.body, reflection);
  }

  draw() {
    const position = this.body.position;

    push();
    translate(position.x, position.y);

    // Enhanced glow effect for bouncing bullets
    if (this.bouncesRemaining > 0) {
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = "rgba(0, 255, 255, 1)";
    } else {
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = "rgba(255, 0, 0, 1)";
    }

    noStroke();
    fill(255, 255, 255);
    const vertices = this.drawVertices

    beginShape();
    vertices.forEach((v) => {vertex(v.x, v.y)})
    endShape();

    drawingContext.shadowBlur = 0;
    pop();
  }

  Destroy() {
    if (this.player) {
      const index = this.player.projectiles.indexOf(this);
      if (index !== -1) {
        this.player.projectiles.splice(index, 1);
      }
    }

    // Remove projectile body from the Matter.js world
    Matter.Composite.remove(world, this.body);
  }
}
