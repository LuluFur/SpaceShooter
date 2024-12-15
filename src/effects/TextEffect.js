//import { getP5 } from '../game/p5Instance.js';

class TextEffect {
  constructor({
    x,
    y,
    textMinSize = 12,
    textMaxSize = 24,
    textColor1 = [255, 100, 0],
    textColor2 = [255, 255, 0],
    alpha1 = 255,
    alpha2 = 0,
    lifetime = 1,
    speedMin = 1,
    speedMax = 3,
    angleMin = 0,
    angleMax = 360,
    text = "Hello",
  }) {
    const p5 = getP5();
    this.x = x;
    this.y = y;
    this.text = text;
    this.textMinSize = textMinSize;
    this.textMaxSize = textMaxSize;
    this.textColor1 = textColor1;
    this.textColor2 = textColor2;
    this.alpha1 = alpha1;
    this.alpha2 = alpha2;
    this.lifetime = lifetime * 60;
    this.currentLife = this.lifetime;

    // Convert degrees to radians using Math
    const angle = (Math.random() * (angleMax - angleMin) + angleMin) * Math.PI / 180;
    const speed = p5.random(speedMin, speedMax);
    
    // Create velocity vector using Math.cos and Math.sin
    this.velocity = p5.createVector(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.position = p5.createVector(x, y);
  }

  update() {
    const p5 = getP5();
    this.position.add(this.velocity);
    this.currentLife -= 1;

    if (this.currentLife <= 0) {
      return;
    }

    this.size = p5.map(
      this.currentLife,
      0,
      this.lifetime,
      this.textMinSize,
      this.textMaxSize
    );

    this.alpha = p5.map(
      this.currentLife,
      0,
      this.lifetime,
      this.alpha2,
      this.alpha1
    );

    let progress = 1 - this.currentLife / this.lifetime;
    this.color = p5.lerpColor(
      p5.color(this.textColor1),
      p5.color(this.textColor2),
      progress
    );
  }

  draw() {
    const p5 = getP5();
    if (this.currentLife <= 0) return;

    p5.push();
    p5.noStroke();
    p5.fill(
      p5.red(this.color),
      p5.green(this.color),
      p5.blue(this.color),
      this.alpha
    );
    p5.textSize(this.size);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text(this.text, this.position.x, this.position.y);
    p5.pop();
  }

  isFinished() {
    return this.currentLife <= 0;
  }
}