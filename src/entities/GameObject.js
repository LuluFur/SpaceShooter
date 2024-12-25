class GameObject {
  constructor(x, y, drawVertices, collisionVertices, options = {}, size = 20) {
      this.size = size; // Default size if not provided
    
      // Store draw and collision vertices
      this.drawVertices = drawVertices || generateDefaultVertices(size); // For rendering in p5.js
      this.collisionVertices = collisionVertices || generateDefaultVertices(size); // For physics in Matter.js

      // Create a Matter.js body using the collision vertices
      this.body = Matter.Bodies.fromVertices(x, y, collisionVertices, options);

      // Add the body to the physics world
      Matter.Composite.add(world, this.body);

      this.isDestroyed = false; // Default is false
  }

  static generateDefaultVertices(size) {
    // Generate a simple polygon (e.g., a hexagon or circle approximation)
    const vertices = [];
    const sides = 6; // Example: Hexagon
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides;
      vertices.push({ x: Math.cos(angle) * size, y: Math.sin(angle) * size });
    }
    return vertices;
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
