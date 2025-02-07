export const TECH_CATEGORIES = {
  MINING: 'Mining',
  COMBAT: 'Combat',
  CRAFTING: 'Crafting',
  SURVIVAL: 'Survival'
};

export const TECH_TREE = {
  // Mining Technologies
  EFFICIENT_MINING: {
    id: 'EFFICIENT_MINING',
    name: 'Efficient Mining',
    category: TECH_CATEGORIES.MINING,
    description: 'Increases ore yield by 50%',
    cost: 1,
    requirements: [],
    effects: {
      miningEfficiency: 1.5
    }
  },
  ADVANCED_PROSPECTING: {
    id: 'ADVANCED_PROSPECTING',
    name: 'Advanced Prospecting',
    category: TECH_CATEGORIES.MINING,
    description: 'Reveals nearby ore deposits',
    cost: 2,
    requirements: ['EFFICIENT_MINING'],
    effects: {
      oreReveal: true
    }
  },

  // Combat Technologies
  COMBAT_TRAINING: {
    id: 'COMBAT_TRAINING',
    name: 'Combat Training',
    category: TECH_CATEGORIES.COMBAT,
    description: 'Increases base attack by 5',
    cost: 1,
    requirements: [],
    effects: {
      attackBonus: 5
    }
  },
  DEFENSIVE_STANCE: {
    id: 'DEFENSIVE_STANCE',
    name: 'Defensive Stance',
    category: TECH_CATEGORIES.COMBAT,
    description: 'Increases max HP by 25',
    cost: 2,
    requirements: ['COMBAT_TRAINING'],
    effects: {
      hpBonus: 25
    }
  },

  // Crafting Technologies
  BASIC_CRAFTING: {
    id: 'BASIC_CRAFTING',
    name: 'Basic Crafting',
    category: TECH_CATEGORIES.CRAFTING,
    description: 'Unlocks basic equipment crafting',
    cost: 1,
    requirements: [],
    effects: {
      unlockBasicCrafting: true
    }
  },
  ADVANCED_CRAFTING: {
    id: 'ADVANCED_CRAFTING',
    name: 'Advanced Crafting',
    category: TECH_CATEGORIES.CRAFTING,
    description: 'Unlocks advanced equipment crafting',
    cost: 2,
    requirements: ['BASIC_CRAFTING'],
    effects: {
      unlockAdvancedCrafting: true
    }
  },

  // Survival Technologies
  SCAVENGING: {
    id: 'SCAVENGING',
    name: 'Scavenging',
    category: TECH_CATEGORIES.SURVIVAL,
    description: 'Increases resource drops from enemies',
    cost: 1,
    requirements: [],
    effects: {
      dropRateBonus: 1.25
    }
  },
  TREASURE_HUNTER: {
    id: 'TREASURE_HUNTER',
    name: 'Treasure Hunter',
    category: TECH_CATEGORIES.SURVIVAL,
    description: 'Increases treasure chest spawn rate',
    cost: 2,
    requirements: ['SCAVENGING'],
    effects: {
      treasureSpawnRate: 1.5
    }
  }
}; 