import { EquipmentSlot, EQUIPMENT_LIST } from './equipmentTypes';


export const EntityTypes = {
  WALL: 1,
  EXIT: 2,
  TREASURE: 3,
  ENEMY: 4,
  PLAYER: 5
};

export class Entity {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }
}

export class Character extends Entity {
  constructor(x, y, type, hp, attack) {
    super(x, y, type);
    this.maxHp = hp;
    this.currentHp = hp;
    this.attack = attack;
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - amount);
    return this.currentHp <= 0;
  }
}

// Define the basic pickaxe
const BASIC_PICKAXE = {
  name: "Basic Pickaxe",
  type: EquipmentSlot.TOOL,
  stats: {
    mining: 1,
  },
  description: "A simple pickaxe for basic mining",
  tier: 0
};

export class Player extends Character {
  constructor(x, y) {
    super(x, y, EntityTypes.PLAYER, 50, 2);
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = 100;
    this.maxHp = 50;
    this.currentHp = 50;
    this.attack = 2;
    this.defense = 0;
    this.inventory = {
      stone: 0,
      copper: 0,
      iron: 0,
      gold: 0,
      diamond: 0,
      coal: 0,
      wood: 0,
      cloth: 0
    };
    this.equipment = {
      mainhand: null,
      offhand: null,
      head: null,
      chest: null,
      legs: null,
      feet: null,
      tool: BASIC_PICKAXE  // Start with basic pickaxe equipped
    };
    this.bag = [];
    this.bagSize = 20;
    
    // Add tech-related properties
    this.techPoints = 0;
    this.technologies = [];

    // Update initial stats with equipped pickaxe
    const stats = this.getTotalStats();
    this.attack = stats.attack;
  }

  levelUp() {
    this.level += 1;
    this.maxHp += 10;
    this.currentHp = this.maxHp;
    this.attack += 2;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
    this.techPoints += 1; // Give 1 tech point per level
  }

  getTotalStats() {
    // Start with base stats
    const totalStats = {
      attack: this.attack,
      defense: this.defense,
      hp: this.currentHp,
      maxHp: this.maxHp,
      mining: 1
    };

    // Add equipment bonuses from all slots
    Object.values(this.equipment).forEach(item => {
      if (item?.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          if (stat === 'hp') {
            totalStats.hp += value;
            totalStats.maxHp += value;
          } else {
            totalStats[stat] = (totalStats[stat] || 0) + value;
          }
        });
      }
    });

    return totalStats;
  }

  equip(item) {
    // Store the item in its appropriate slot
    this.equipment[item.type] = item;

    // Update current HP proportionally when max HP changes
    const newStats = this.getTotalStats();
    const hpPercentage = this.currentHp / this.maxHp;
    this.currentHp = Math.floor(newStats.maxHp * hpPercentage);
    
    // Update attack and defense stats
    this.attack = newStats.attack;
    this.defense = newStats.defense;
  }

  unequip(itemType) {
    this.equipment[itemType] = null;
    
    // Update stats after unequipping
    const newStats = this.getTotalStats();
    const hpPercentage = this.currentHp / this.maxHp;
    this.currentHp = Math.floor(newStats.maxHp * hpPercentage);
    this.attack = newStats.attack;
    this.defense = newStats.defense;
  }

  getEquippedItem(slot) {
    return this.equipment[slot];
  }

  takeDamage(amount) {
    const reducedDamage = Math.max(1, amount - this.defense);
    this.currentHp = Math.max(0, this.currentHp - reducedDamage);
    return this.currentHp <= 0;
  }

  gainExperience(amount) {
    this.experience += amount;
    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  getMiningPower() {
    const stats = this.getTotalStats();
    return stats.mining || 1;
  }

  hasPickaxeEquipped() {
    const tool = this.equipment[EquipmentSlot.TOOL];
    return tool && tool.name.includes('Pickaxe');
  }

  collectOre(oreType) {
    const oreName = oreType.name.toLowerCase();
    this.inventory[oreName]++;
  }

  salvageItem(itemIndex) {
    const item = this.bag[itemIndex];
    if (!item) return false;

    // Remove item from bag
    this.bag.splice(itemIndex, 1);

    // Convert item to resources based on its tier/requirements
    if (item.requirements) {
      Object.entries(item.requirements).forEach(([resource, amount]) => {
        this.inventory[resource] = (this.inventory[resource] || 0) + Math.floor(amount * 0.75);
      });
    }

    return true;
  }
}

export class Enemy {
  constructor(x, y, level = 1) {
    this.x = x;
    this.y = y;
    this.type = EntityTypes.ENEMY;
    this.level = level;
    this.baseSpeed = 1;
    this.baseDamage = 10 + (level * 2);
    this.maxHp = 20 + (level * 5);
    this.currentHp = this.maxHp;
    this.color = '#ff0000';
  }

  // Add method to apply difficulty multipliers
  getAdjustedStats(multipliers) {
    return {
      damage: Math.floor(this.baseDamage * multipliers.enemyDamage),
      speed: this.baseSpeed * multipliers.enemySpeed
    };
  }

  // Modify move method to use adjusted speed
  move(dx, dy, multipliers) {
    const { speed } = this.getAdjustedStats(multipliers);
    // Only move if random roll is less than adjusted speed
    if (Math.random() < speed) {
      this.x += dx;
      this.y += dy;
    }
  }

  // Modify damage calculation to use multipliers
  calculateDamage(multipliers) {
    const { damage } = this.getAdjustedStats(multipliers);
    return damage;
  }
} 