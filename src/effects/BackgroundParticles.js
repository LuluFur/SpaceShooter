//import { getP5 } from '../game/p5Instance.js';

// this class describes the properties of a single particle.
class BackgroundParticle {
  // setting the co-ordinates, radius and the
  // speed of a particle in both the co-ordinates axes.
  constructor() {
    this.x = random(0, width);
    this.y = random(0, height);
    this.r = random(1, 8);
    this.xSpeed = random(-0.2, 0.2);
    this.ySpeed = random(-0.1, 0.15);
    this.opacity = 0.05;
    this.range = 100;
  }

  // creation of a particle.
  createParticle() {
    noStroke();
    fill('rgba(200,169,169,'+this.opacity+')');
    circle(this.x, this.y, this.r);
  }

  // setting the particle in motion.
  moveParticle() {
    if (this.x < 0 || this.x > width)
      this.xSpeed *= -1;
    if (this.y < 0 || this.y > height)
      this.ySpeed *= -1;
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  // this function creates the connections(lines)
  // between particles which are less than a certain distance apart
  joinParticles(particles) {

    particles.forEach(element => {
      let dis = dist(this.x, this.y, element.x, element.y);
      if (dis < this.range) {
        stroke('rgba(255,255,255,'+0.05*1/range+')');
        line(this.x, this.y, element.x, element.y);
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
