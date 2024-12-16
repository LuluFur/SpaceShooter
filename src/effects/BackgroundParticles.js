class BackgroundParticle {
  constructor() {
    this.x = random(0, width);
    this.y = random(0, height);
    this.r = random(1, 8);
    this.xSpeed = random(-0.2, 0.2);
    this.ySpeed = random(-0.1, 0.15);
    this.opacity = 0.1; // Low alpha value for subtle effect
    this.range = 100; // Maximum distance for visible lines
  }

  createParticle() {
    push();
    noStroke();
    fill(`rgba(255,255,255,${this.opacity})`); // White with low alpha
    circle(this.x, this.y, this.r);
    pop();
  }

  moveParticle() {
    if (this.x < 0 || this.x > width) this.xSpeed *= -1;
    if (this.y < 0 || this.y > height) this.ySpeed *= -1;
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  joinParticles(particles) {
    particles.forEach(element => {
      let dis = dist(this.x, this.y, element.x, element.y);
      if (dis < this.range) {
        push();
        // Map distance to alpha, with closer distances having higher alpha, but never fully white
        let alpha = constrain(map(dis, this.range, 0, 0, this.opacity * 0.9), 0, this.opacity);
        if (alpha >= this.opacity) alpha = this.opacity;
        stroke(`rgba(255,255,255,${alpha})`); // Subtle white line with capped alpha
        line(this.x, this.y, element.x, element.y);
        pop();
      }
    });
  }
}


function spawnBackgroundParticles() {

  const particles = [];
  for (let i = 0; i < width / 10; i++) {
    particles.push(new BackgroundParticle());
  }
  return particles;
}

function drawBackgroundParticles(particles) {
  for (let i = 0; i < particles.length; i++) {
    particles[i].createParticle();
    particles[i].moveParticle();
    particles[i].joinParticles(particles.slice(i));
  }
}
