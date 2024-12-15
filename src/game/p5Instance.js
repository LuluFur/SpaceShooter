let p5Instance = null;

function initializeP5(p) {
  p5Instance = p;
  window.p5Instance = p; // Make p5 instance globally available
}

function getP5() {
  return p5Instance || window.p5Instance;
}