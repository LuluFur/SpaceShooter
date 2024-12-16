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
        // Map distance to grayscale intensity (darker for farther distances)
        let grayValue = map(dis, 0, this.range, 200, 30); // Brighter when close, darker when far
        grayValue = constrain(grayValue, 30, 200); // Ensure within a valid grayscale range
        stroke(grayValue); // Use grayscale value for color
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
