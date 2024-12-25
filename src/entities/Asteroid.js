class Asteroid extends GameObject {
  constructor(x, y, size, seed, isGold = false, health = 20) {
    const collisionVertices = Asteroid.generateVertices(size, seed);

    super(x, y, collisionVertices, collisionVertices, {
      restitution: 1,
      frictionAir: 0,
    });

    this.seed = seed;
    this.color = "white";
    this.radius = this.calculateRadius();
    this.maxHealth = health;
    this.health = this.maxHealth;
    this.isGold = isGold;
    this.size = size;
    this.speed = 50;
    this.maxSpeed = 5;
    this.dampening = 0.95;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const angleToCenter = Math.atan2(centerY - y, centerX - x);
    const randomAngleOffset = Math.random() * 0.7 - 0.35;
    const finalAngle = angleToCenter + randomAngleOffset;

    const initialVelocity = Matter.Vector.create(
      Math.cos(finalAngle),
      Math.sin(finalAngle)
    );

    Matter.Body.setVelocity(this.body, Matter.Vector.mult(initialVelocity, this.speed / size));
  }

  static generateVertices(size, seed) {
    const vertices = [];
    const totalVertices = Math.floor(Math.random() * 8 + 8);
    const noiseStrength = 3;

    for (let i = 0; i < totalVertices; i++) {
      const angle = (Math.PI * 2 / totalVertices) * i;
      const radius = size + (Math.random() - 0.5) * noiseStrength;
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
    return vertices;
  }

  calculateRadius() {
    return this.size * 1.5;
  }

  applyRepulsion(other) {
    const distance = Matter.Vector.magnitude(
      Matter.Vector.sub(this.body.position, other.body.position)
    );
    const overlap = this.radius + other.radius - distance;

    if (overlap > 0) {
      const repulsionVector = Matter.Vector.normalise(
        Matter.Vector.sub(this.body.position, other.body.position)
      );
      const repulsionForce = Matter.Vector.mult(repulsionVector, overlap * 0.01);

      Matter.Body.applyForce(this.body, this.body.position, repulsionForce);
      Matter.Body.applyForce(
        other.body,
        other.body.position,
        Matter.Vector.neg(repulsionForce)
      );
    }
  }

  draw() {
    const vertices = this.body.vertices;

    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    noFill();
    stroke(this.isGold ? [150, 125, 0] : this.color);
    strokeWeight(2);

    beginShape();
    vertices.forEach((v) => vertex(v.x - this.body.position.x, v.y - this.body.position.y));
    endShape(CLOSE);

    pop();
  }

  update() {
    if (this.isDestroyed) return;

    const velocity = this.body.velocity;
    const speed = Matter.Vector.magnitude(velocity);

    if (speed > this.maxSpeed) {
      Matter.Body.setVelocity(
        this.body,
        Matter.Vector.mult(Matter.Vector.normalise(velocity), this.maxSpeed)
      );
    }
  }
}
