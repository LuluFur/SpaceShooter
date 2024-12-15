//import { getP5 } from '../game/p5Instance.js';
//import { entities } from '../game/GameState.js';

class ParticleEffect {
  constructor({
    x,
    y,
    numParticles = 10,
    sizeMin = 3,
    sizeMax = 6,
    color1 = [255, 100, 0],
    color2 = [255, 255, 0],
    alpha1 = 255,
    alpha2 = 0,
    lifetime = 1,
    speedMin = 1,
    speedMax = 3,
    angleMin = 0,
    angleMax = 360,
  }) {
    
    this.particles = [];
    this.lifetime = lifetime * 60;

    for (let i = 0; i < numParticles; i++) {
      // Convert degrees to radians using Math
      const angle = (random(angleMin, angleMax) * Math.PI) / 180;
      const speed = random(speedMin, speedMax);
      
      // Create velocity vector using Math.cos and Math.sin
      const velocity = createVector(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      this.particles.push({
        position: createVector(x, y),
        velocity: velocity,
        life: this.lifetime,
        currentLife: this.lifetime,
        sizeMin: sizeMin,
        sizeMax: sizeMax,
        color1: color1,
        color2: color2,
        alpha1: alpha1,
        alpha2: alpha2,
      });
    }

    // Add the effect to the global effects array
    entities.particleEffects.push(this);
  }

  update() {
    
    for (let particle of this.particles) {
      particle.position.add(particle.velocity);
      particle.currentLife -= 1;
      
      if (particle.currentLife <= 0) {
        continue;
      }

      particle.size = map(
        particle.currentLife,
        0,
        this.lifetime,
        particle.sizeMin,
        particle.sizeMax
      );

      particle.alpha = map(
        particle.currentLife,
        0,
        this.lifetime,
        particle.alpha2,
        particle.alpha1
      );

      let progress = 1 - particle.currentLife / this.lifetime;
      particle.color = lerpColor(
        color(particle.color1),
        color(particle.color2),
        progress
      );
    }

    this.particles = this.particles.filter((p) => p.currentLife > 0);
  }

  draw() {
    
    for (let particle of this.particles) {
      if (particle.currentLife <= 0) continue;

      push();
      noStroke();
      fill(
        red(particle.color),
        green(particle.color),
        blue(particle.color),
        particle.alpha
      );
      circle(particle.position.x, particle.position.y, particle.size);
      pop();
    }
  }

  isFinished() {
    return this.particles.length === 0;
  }
}