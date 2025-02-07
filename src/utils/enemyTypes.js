export const EnemyTypes = {
  RAT: {
    name: 'Rat',
    baseHp: 6,
    baseAttack: 1,
    color: '#8B4513',
    minLevel: 1,
    spawnWeight: 100
  },
  SPIDER: {
    name: 'Spider',
    baseHp: 12,
    baseAttack: 2,
    color: '#4A0404',
    minLevel: 2,
    spawnWeight: 80
  },
  SKELETON: {
    name: 'Skeleton',
    baseHp: 25,
    baseAttack: 4,
    color: '#E0E0E0',
    minLevel: 3,
    spawnWeight: 60
  },
  GOBLIN: {
    name: 'Goblin',
    baseHp: 30,
    baseAttack: 5,
    color: '#355E3B',
    minLevel: 4,
    spawnWeight: 50
  },
  ORC: {
    name: 'Orc',
    baseHp: 40,
    baseAttack: 6,
    color: '#006400',
    minLevel: 5,
    spawnWeight: 40
  },
  TROLL: {
    name: 'Troll',
    baseHp: 50,
    baseAttack: 7,
    color: '#808000',
    minLevel: 5,
    spawnWeight: 30
  },
  DEMON: {
    name: 'Demon',
    baseHp: 65,
    baseAttack: 8,
    color: '#8B0000',
    minLevel: 6,
    spawnWeight: 20
  },
  DRAGON: {
    name: 'Dragon',
    baseHp: 80,
    baseAttack: 10,
    color: '#FF4500',
    minLevel: 8,
    spawnWeight: 10
  }
};

export class Enemy {
  constructor(x, y, type, playerLevel = 1) {
    this.x = x;
    this.y = y;
    this.type = type || EnemyTypes.RAT;
    this.direction = Math.floor(Math.random() * 4);
    
    // More gradual scaling based on player level
    const levelDifference = playerLevel - this.type.minLevel;
    const levelScale = Math.max(1, 1 + (levelDifference * 0.15)); // Reduced from 0.2 to 0.15
    
    // Cap the maximum scaling based on enemy type
    const maxScale = 1.5 + (this.type.minLevel * 0.1); // Higher level enemies can scale more
    const finalScale = Math.min(levelScale, maxScale);
    
    // Calculate stats with balanced scaling
    this.maxHp = Math.floor(this.type.baseHp * finalScale);
    this.currentHp = this.maxHp;
    this.attack = Math.floor(this.type.baseAttack * finalScale);
    this.name = this.type.name;
    this.color = this.type.color;
    this.level = playerLevel;
  }

  static getRandomType(playerLevel) {
    // Filter enemies by minimum level requirement
    // Only allow enemies up to 2 levels higher than player
    const availableTypes = Object.values(EnemyTypes).filter(
      type => type.minLevel <= playerLevel + 2 && type.minLevel <= Math.max(1, playerLevel)
    );

    if (availableTypes.length === 0) {
      return EnemyTypes.RAT;
    }

    // Adjust weights to favor enemies closer to player level
    const weightedTypes = availableTypes.map(type => ({
      ...type,
      adjustedWeight: type.spawnWeight * (
        1 + Math.max(0, playerLevel - type.minLevel) * 0.1 - // Bonus for being below player level
        Math.max(0, type.minLevel - playerLevel) * 0.3      // Penalty for being above player level
      )
    }));

    const totalWeight = weightedTypes.reduce((sum, type) => sum + type.adjustedWeight, 0);
    let random = Math.random() * totalWeight;
    
    for (const type of weightedTypes) {
      random -= type.adjustedWeight;
      if (random <= 0) {
        return type;
      }
    }

    return EnemyTypes.RAT;
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - amount);
    return this.currentHp <= 0;
  }
} 