class AlienRammer extends Alien {
  constructor(x, y) {
    const collisionVertices = Alien.generateCollisionVertices(20);
    super(x, y, collisionVertices, collisionVertices, {
      restitution: 0.5,
      friction: 0.05,
    });
  }

  shoot() {
    // AlienRammer does not shoot, so this method is intentionally left blank to override the functionality
  }

  draw() {
    const vertices = this.body.vertices;
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    // Render the AlienRammer appearance
    stroke(255, 80, 80); // Red color for ramming aliens
    strokeWeight(1);
    noFill();
    beginShape();
    vertices.forEach((v) => vertex(v.x - this.body.position.x, v.y - this.body.position.y));
    endShape(CLOSE);

    pop();
  }
}
