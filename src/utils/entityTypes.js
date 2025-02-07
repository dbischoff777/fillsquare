import { EquipmentSlot, EQUIPMENT_LIST } from './equipmentTypes';
import playerImage from '../assets/images/player/player.png';

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

export class Player extends Character {
  constructor(x, y) {
    super(x, y, EntityTypes.PLAYER, 20, 2);
    this.defense = 1;
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = 100;
    this.equipment = {
      [EquipmentSlot.MAIN_HAND]: null,
      [EquipmentSlot.OFF_HAND]: null,
      [EquipmentSlot.TOOL]: {  // Start with basic pickaxe
        name: "Basic Pickaxe",
        type: EquipmentSlot.TOOL,
        stats: {
          mining: 1,
          attack: 5,
          hp: 5
        }
      },
      [EquipmentSlot.HELMET]: null,
      [EquipmentSlot.BOOTS]: null,
      [EquipmentSlot.GLOVES]: null
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
    this.maxHp += 2;
    this.currentHp = this.maxHp;
    this.attack += 1;
  }

  equip(item) {
    this.equipment[item.slot] = item;
    this.updateStats();
  }

  unequip(slot) {
    this.equipment[slot] = null;
    this.updateStats();
  }

  updateStats() {
    // Reset base stats
    this.attack = 6;
    
    // Add equipment bonuses
    Object.values(this.equipment).forEach(item => {
      if (item) {
        if (item.stats.attack) this.attack += item.stats.attack;
      }
    });
  }

  hasPickaxeEquipped() {
    return this.equipment[EquipmentSlot.TOOL]?.name.includes('Pickaxe');
  }

  collectOre(oreType) {
    const oreName = oreType.name.toLowerCase();
    this.inventory[oreName]++;
  }

  // Add method to salvage items
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