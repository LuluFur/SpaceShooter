class GameObject {
  constructor(x, y, drawVertices, collisionVertices, options = {}) {
      // Store draw and collision vertices
      this.drawVertices = drawVertices; // For rendering in p5.js
      this.collisionVertices = collisionVertices; // For physics in Matter.js

      // Create a Matter.js body using the collision vertices
      this.body = Matter.Bodies.fromVertices(x, y, collisionVertices, options);

      // Add the body to the physics world
      Matter.Composite.add(world, this.body);

      this.isDestroyed = false; // Default is false
  }

  update() {
      // Matter.js automatically updates position and rotation
  }

  draw() {
      const pos = this.body.position;
      const angle = this.body.angle;

      // Render the draw shape using p5.js
      push();
      translate(pos.x, pos.y);
      rotate(angle);
      beginShape();
      this.drawVertices.forEach((v) => vertex(v.x, v.y));
      endShape(CLOSE);
      pop();
  }

  collidingWith(other) {
      // Use Matter.js SAT collision detection
      const collision = Matter.SAT.collides(this.body, other.body);
      return collision.collided;
  }

  destroy() {
    this.isDestroyed = true;
  }
}
