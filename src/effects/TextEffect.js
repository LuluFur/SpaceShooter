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
    const speed = random(speedMin, speedMax);
    
    // Create velocity vector using Math.cos and Math.sin
    this.velocity = createVector(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.position = createVector(x, y);
  }

  update() {
    
    this.position.add(this.velocity);
    this.currentLife -= 1;

    if (this.currentLife <= 0) {
      return;
    }

    this.size = map(
      this.currentLife,
      0,
      this.lifetime,
      this.textMinSize,
      this.textMaxSize
    );

    this.alpha = map(
      this.currentLife,
      0,
      this.lifetime,
      this.alpha2,
      this.alpha1
    );

    let progress = 1 - this.currentLife / this.lifetime;
    this.color = lerpColor(
      color(this.textColor1),
      color(this.textColor2),
      progress
    );
  }

  draw() {
    
    if (this.currentLife <= 0) return;

    push();
    noStroke();
    fill(
      red(this.color),
      green(this.color),
      blue(this.color),
      this.alpha
    );
    textSize(this.size);
    textAlign(CENTER, CENTER);
    text(this.text, this.position.x, this.position.y);
    pop();
  }

  isFinished() {
    return this.currentLife <= 0;
  }
}
