// import { gameState, entities } from '../game/GameState.js';
// import { getP5 } from '../game/p5Instance.js';

const skillSets = {
  offensive: {
    bulletDamage: {
      name: "Bullet Damage",
      level: 1,
      maxLevel: 5,
      color: "orange",
      description: "Increase bullet damage and size",
      func: () => {
        if (!entities.player) return;
        let skill = skillSets.offensive.bulletDamage;
        entities.player.bulletDamage = 3 + Math.pow(skill.level, 2);
        entities.player.bulletSize = 5 + Math.pow(skill.level, 1.3);
      }
    },
    fireRate: {
      name: "Fire Rate",
      level: 1,
      maxLevel: 5,
      color: "lime",
      description: "Increase firing speed",
      func: () => {
        if (!entities.player) return;
        let skill = skillSets.offensive.fireRate;
        entities.player.fireRate = 1 + Math.pow(skill.level, 1.5) * 0.2;
      }
    },
    bulletCount: {
      name: "Bullet Count",
      level: 1,
      maxLevel: 5,
      color: "red",
      description: "Increase the number of bullets fired at once",
      func: () => {
        if (!entities.player) return;
        let skill = skillSets.offensive.bulletCount;
        entities.player.bulletCount = Math.floor(1 + Math.pow(skill.level, 1.5));
      }
    }
  },
  defensive: {
    maxHealth: {
      name: "Max Health",
      level: 1,
      maxLevel: 5,
      color: "red",
      description: "Increase maximum health",
      func: () => {
        if (!entities.player) return;
        let skill = skillSets.defensive.maxHealth;
        const oldMaxHealth = entities.player.maxHealth;
        entities.player.maxHealth = 100 + Math.pow(skill.level, 2) * 25;
        entities.player.heal(oldMaxHealth * 0.5);
      }
    },
    xpRange: {
      name: "XP Range",
      level: 1,
      maxLevel: 5,
      color: "cyan",
      description: "Increase XP collection range",
      func: () => {
        if (!entities.player) return;
        let skill = skillSets.defensive.xpRange;
        entities.player.xpCollectionRange = 200 + Math.pow(skill.level, 1.8) * 100;
      }
    },
    xpMultiplier: {
      name: "XP Multiplier",
      level: 1,
      maxLevel: 3,
      color: "magenta",
      description: "Multiply XP gained from all sources",
      func: () => {
        if (!entities.player) return;
        let skill = skillSets.defensive.xpMultiplier;
        entities.player.xpMultiplier = 1 + Math.pow(skill.level, 1.5) * 0.5;
      }
    }
  },
  utility: {
    bulletBounce: {
      name: "Bouncing Bullets",
      level: 2,
      maxLevel: 3,
      color: "aqua",
      description: "Bullets bounce between enemies",
      func: () => {
        if (!entities.player) return;
        let skill = skillSets.utility.bulletBounce;
        entities.player.bulletBounces = Math.floor(1 + Math.pow(skill.level, 1.7));
      }
    },
    spawnBoss: {
      name: "Summon Boss",
      level: 0,
      maxLevel: 1,
      color: "purple",
      description: "Spawn a powerful boss enemy",
      func: () => {
        console.log("Spawn Boss triggered");
        if (!entities.player) return;
        spawnAlien(true); // Force boss spawn
      }
    }
  }
};

function getAvailableSkillsFromSet(set) {
  return Object.entries(skillSets[set])
    .filter(([_, skill]) => skill.level < skill.maxLevel)
    .map(([id, _]) => id);
}

function lockSkillSet(set, chosenSkillId) {
  gameState.skillsToChoose = gameState.skillsToChoose.filter(skillId => skillId !== chosenSkillId);
  Object.entries(skillSets[set]).forEach(([id, skill]) => {
    if (id !== chosenSkillId) {
      gameState.skillsToChoose = gameState.skillsToChoose.filter(skillId => skillId !== id);
    }
  });
  console.log(`Updated skillsToChoose:`, gameState.skillsToChoose); // Debugging output
}

function getRandomSkills(count = 3) {
  const available = gameState.skillsToChoose.slice();

  const selected = [];
  while (selected.length < count && available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    selected.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }

  return selected;
}

function selectSkill(skillId) {
  console.log("Selecting skill:", skillId); // Debugging output
  for (let set in skillSets) {
    if (skillSets[set][skillId]) {
      const skill = { ...skillSets[set][skillId] }; // Create a copy to avoid conflicts
      console.log("Found skill in set:", set); // Debugging output
      lockSkillSet(set, skillId); // Remove locked skills from skillsToChoose
      skill.func(); // Execute the function
      return;
    }
  }
  console.error("Skill not found:", skillId); // Debugging for missing skills
}

function openSkillMenu() {

  if (gameState.skillsToChoose.length === 0) return;
  console.log("leveled up");
  const selectedSkills = getRandomSkills(3);
  renderSkills(selectedSkills);
  document.getElementById("skill-menu").style.display = "block";
  document.getElementById("gameCanvas").style.display = "none";
  gameState.skillMenuOpen = true;
  noLoop();
}

function closeSkillMenu() {
  gameState.skillMenuOpen = false;
  document.getElementById("skill-menu").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  loop();
}

function renderSkills(skillIds) {
  const skillColumns = document.getElementById("skill-columns");
  if (!skillColumns) return;

  skillColumns.innerHTML = "";

  skillIds.forEach((skillId) => {
    const skill = Object.entries(skillSets).flatMap(([setName, set]) => Object.entries(set)).find(([id]) => id === skillId)?.[1];
    if (!skill) return;

    const skillContainer = document.createElement("div");
    skillContainer.classList.add("skill-bar-container");
    skillContainer.style.setProperty('--skill-color', skill.color);

    skillContainer.innerHTML = `
      <h3 class="skill-name">${skill.name}</h3>
      <p class="skill-level">Level: ${skill.level}/${skill.maxLevel}</p>
      <p class="skill-description">${skill.description || "No description available."}</p>
      <button class="upgrade-button" onclick="window.upgradeSkill('${skillId}')">
        <span>Upgrade</span>
      </button>
      <div class="skill-minibars">
        ${[...Array(skill.maxLevel)]
          .map((_, i) => `<div class="skill-mini-bar ${i < skill.level ? "achieved" : ""}" 
           style="background-color: ${i < skill.level ? skill.color : "rgba(255, 255, 255, 0.1)"};"></div>`)
          .join("")}
      </div>
    `;

    skillColumns.appendChild(skillContainer);
  });
}

function upgradeSkill(skillId) {
  const skill = Object.entries(skillSets)
    .flatMap(([setName, set]) => Object.entries(set))
    .find(([id]) => id === skillId)?.[1];

  if (!skill) {
    console.error("Skill not found for upgrade:", skillId); // Debugging output
    return;
  }

  console.log("Upgrading skill:", skillId); // Debugging output
  selectSkill(skillId);

  if (entities.player) {
    entities.player.heal(entities.player.maxHealth * 0.15);
  }

  renderSkills(gameState.skillsToChoose);
  increaseDifficulty();
  closeSkillMenu();
}

function increaseDifficulty() {
  gameState.difficulty++;
  gameState.goldAsteroidChance *= 2;
  gameState.spawnDelay *= 0.9;
  gameState.asteroidCap += 1;
}

window.upgradeSkill = upgradeSkill;
