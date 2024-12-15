//import { getP5 } from '../game/p5Instance.js';

class GameObject {
  constructor(x, y, size, velocity, direction) {
    this.position = createVector(x, y);
    this.size = size;
    this.velocity = velocity;
    this.direction = direction;
  }

  update() {
    this.position.add(this.velocity);
  }

  draw() {
    // Override in subclasses
  }

  isColliding(other) {
    let distance = dist(
      this.position.x, 
      this.position.y, 
      other.position.x, 
      other.position.y
    );
    return distance < (this.size + other.size) / 2;
  }
}