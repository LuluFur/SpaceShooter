class BackgroundParticle {
  constructor() {
    this.x = random(0, width);
    this.y = random(0, height);
    this.r = random(1, 8);
    this.xSpeed = random(-0.2, 0.2);
    this.ySpeed = random(-0.1, 0.15);
    this.range = 100; // Maximum distance for visible lines
    this.opacity = 0.1;
  }

  createParticle() {
    push();
    noStroke();
    fill(`rgba(255,255,255,${this.opacity})`); // White with low alpha

    //blur effect
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = 100;
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    
    stroke(grayValue); // Use the calculated grayscale value
    line(this.x, this.y, element.x, element.y);

    circle(this.x, this.y, this.r);
    
    //remove blur
    drawingContext.shadowBlur = 0;
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
        // Map the distance to grayscale intensity: closer -> brighter, farther -> darker
        let grayValue = map(dis, 0, this.range, 100, 0);
        grayValue = constrain(grayValue, 0, 100); // Ensure grayscale stays within bounds
        
        //blur effect
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = grayValue;
        drawingContext.shadowOffsetX = 0;
        drawingContext.shadowOffsetY = 0;
        
        stroke(grayValue); // Use the calculated grayscale value
        line(this.x, this.y, element.x, element.y);

        //remove blur
        drawingContext.shadowBlur = 0;
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
