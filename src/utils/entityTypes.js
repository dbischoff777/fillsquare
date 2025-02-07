import { EquipmentSlot, EQUIPMENT_LIST } from './equipmentTypes';
import playerImage from '../assets/images/player/player.png';
import { CRAFTING_RECIPES } from './craftingRecipes';

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
    attack: 3
  },
  description: "A simple pickaxe for basic mining",
  tier: 0
};

export class Player extends Character {
  constructor(x, y) {
    super(x, y, EntityTypes.PLAYER, 100, 10); // Base HP: 100, Base Attack: 10
    this.baseStats = {
      attack: 10,
      defense: 5,
      hp: 100,
      maxHp: 100,
      mining: 1
    };
    this.defense = 1;
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = 100;
    
    // Initialize equipment slots
    this.equipment = {
      [EquipmentSlot.MAIN_HAND]: null,
      [EquipmentSlot.ARMOR]: null,
      [EquipmentSlot.TOOL]: BASIC_PICKAXE
    };
    
    this.inventory = {
      stone: 0,
      coal: 0,
      copper: 0,
      iron: 0,
      gold: 0,
      diamond: 0
    };
    this.bag = [];  // Array to store unequipped items
    this.bagSize = 10;  // Maximum number of items in bag
    this.image = playerImage;
    
    // Initialize HP after equipment is set
    this.currentHp = this.getTotalStats().maxHp;
  }

  getTotalStats() {
    // Start with base stats
    const totalStats = { ...this.baseStats };

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
    const hpPercentage = this.currentHp / this.baseStats.maxHp;
    this.currentHp = Math.floor(newStats.maxHp * hpPercentage);
    
    // Update attack and defense stats
    this.attack = newStats.attack;
    this.defense = newStats.defense;
  }

  unequip(itemType) {
    this.equipment[itemType] = null;
    
    // Update stats after unequipping
    const newStats = this.getTotalStats();
    const hpPercentage = this.currentHp / this.baseStats.maxHp;
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

  levelUp() {
    this.level += 1;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
    
    // Increase base stats
    this.baseStats.maxHp += 20;
    this.baseStats.hp += 20;
    this.baseStats.attack += 5;
    this.baseStats.defense += 2;
    
    // Update current stats
    const newStats = this.getTotalStats();
    this.currentHp = newStats.maxHp; // Full heal on level up
    this.attack = newStats.attack;
    this.defense = newStats.defense;
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