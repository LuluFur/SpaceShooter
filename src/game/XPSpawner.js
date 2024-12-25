const MAX_XP_PER_ORB = 10;

function spawnXPOrbs(x, y, totalXP) {
  
  const numOrbs = Math.ceil(totalXP / MAX_XP_PER_ORB);
  const xpPerOrb = Math.min(totalXP / numOrbs, MAX_XP_PER_ORB);
  
  for (let i = 0; i < numOrbs; i++) {
    // Add some random offset to prevent orbs from spawning at exactly the same spot
    const offsetX = random(-20, 20);
    const offsetY = random(-20, 20);
    
    // For the last orb, add any remaining XP to make sure we distribute exactly totalXP
    const isLastOrb = i === numOrbs - 1;
    const remainingXP = totalXP - (xpPerOrb * (numOrbs - 1));
    const orbXP = isLastOrb ? remainingXP : xpPerOrb;
    
    entities.xpOrbs.push(new XPOrb(x + offsetX, y + offsetY, orbXP));
  }
}