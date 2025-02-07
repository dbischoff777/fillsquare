export const EquipmentSlot = {
  MAIN_HAND: 'mainHand',
  OFF_HAND: 'offHand',
  TOOL: 'tool',
  HELMET: 'helmet',
  BOOTS: 'boots',
  GLOVES: 'gloves'
};

export class Equipment {
  constructor(name, slot, stats = {}, requirements = {}) {
    this.name = name;
    this.type = slot;
    this.stats = stats;
    this.requirements = requirements;
  }
}

// Define some basic equipment
export const EQUIPMENT_LIST = {
  RUSTY_SWORD: new Equipment('Rusty Sword', EquipmentSlot.MAIN_HAND, { 
    attack: 1,
    hp: 2
  }, {
    iron: 1
  }),
  WOODEN_SHIELD: new Equipment('Wooden Shield', EquipmentSlot.OFF_HAND, { 
    defense: 1,
    hp: 3
  }, {
    stone: 2
  }),
  BASIC_PICKAXE: new Equipment('Basic Pickaxe', EquipmentSlot.TOOL, { 
    mining: 1,
    attack: 1,
    hp: 2
  }, {
    stone: 1,
    iron: 1
  }),
  LEATHER_HELMET: new Equipment('Leather Helmet', EquipmentSlot.HELMET, { 
    defense: 1,
    hp: 5
  }, {
    iron: 2
  }),
  LEATHER_BOOTS: new Equipment('Leather Boots', EquipmentSlot.BOOTS, { 
    defense: 1,
    hp: 4
  }, {
    iron: 2
  }),
  LEATHER_GLOVES: new Equipment('Leather Gloves', EquipmentSlot.GLOVES, { 
    defense: 1,
    hp: 3
  }, {
    iron: 1
  }),
  IRON_SWORD: new Equipment('Iron Sword', EquipmentSlot.MAIN_HAND, {
    attack: 3,
    hp: 5
  }, {
    iron: 3,
    coal: 1
  }),
  STEEL_SWORD: new Equipment('Steel Sword', EquipmentSlot.MAIN_HAND, {
    attack: 5,
    hp: 8
  }, {
    iron: 4,
    coal: 2
  }),
  DIAMOND_SWORD: new Equipment('Diamond Sword', EquipmentSlot.MAIN_HAND, {
    attack: 8,
    hp: 12
  }, {
    iron: 3,
    diamond: 2,
    coal: 2
  }),
  IRON_SHIELD: new Equipment('Iron Shield', EquipmentSlot.OFF_HAND, {
    defense: 3,
    hp: 8
  }, {
    iron: 4,
    coal: 1
  }),
  STEEL_PICKAXE: new Equipment('Steel Pickaxe', EquipmentSlot.TOOL, {
    mining: 2,
    attack: 2,
    hp: 5
  }, {
    iron: 3,
    coal: 2
  }),
  DIAMOND_PICKAXE: new Equipment('Diamond Pickaxe', EquipmentSlot.TOOL, {
    mining: 3,
    attack: 3,
    hp: 8
  }, {
    iron: 2,
    diamond: 2,
    coal: 1
  })
}; 