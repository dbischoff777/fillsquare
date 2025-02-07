import { EquipmentSlot } from './equipmentTypes';

export const CRAFTING_RECIPES = {
  IRON_SWORD: {
    name: "Iron Sword",
    type: EquipmentSlot.MAIN_HAND,
    requirements: {
      iron: 3,
      coal: 1
    },
    stats: {
      attack: 15,
      hp: 10
    },
    description: "A basic iron sword"
  },
  STEEL_SWORD: {
    name: "Steel Sword",
    type: EquipmentSlot.MAIN_HAND,
    requirements: {
      iron: 5,
      coal: 3
    },
    stats: {
      attack: 25,
      hp: 20
    },
    description: "A sturdy steel sword"
  },
  IRON_SHIELD: {
    name: "Iron Shield",
    type: EquipmentSlot.OFF_HAND,
    requirements: {
      iron: 4,
      coal: 2
    },
    stats: {
      defense: 10,
      hp: 15
    },
    description: "A basic iron shield"
  },
  IRON_HELMET: {
    name: "Iron Helmet",
    type: EquipmentSlot.HELMET,
    requirements: {
      iron: 4,
      coal: 2
    },
    stats: {
      defense: 8,
      hp: 12
    },
    description: "A basic iron helmet"
  },
  IRON_BOOTS: {
    name: "Iron Boots",
    type: EquipmentSlot.BOOTS,
    requirements: {
      iron: 3,
      coal: 2
    },
    stats: {
      defense: 6,
      hp: 10
    },
    description: "Basic iron boots"
  },
  IRON_GLOVES: {
    name: "Iron Gloves",
    type: EquipmentSlot.GLOVES,
    requirements: {
      iron: 2,
      coal: 1
    },
    stats: {
      defense: 4,
      hp: 8
    },
    description: "Basic iron gloves"
  },
  STEEL_PICKAXE: {
    name: "Steel Pickaxe",
    type: EquipmentSlot.TOOL,
    requirements: {
      iron: 5,
      coal: 3
    },
    stats: {
      mining: 2,
      attack: 15,
      hp: 10
    },
    description: "A sturdy steel pickaxe"
  },
  DIAMOND_PICKAXE: {
    name: "Diamond Pickaxe",
    type: EquipmentSlot.TOOL,
    requirements: {
      iron: 3,
      diamond: 1,
      coal: 2
    },
    stats: {
      mining: 3,
      attack: 20,
      hp: 15
    },
    description: "A superior diamond pickaxe"
  },
  STEEL_SHIELD: {
    name: "Steel Shield",
    type: EquipmentSlot.OFF_HAND,
    requirements: {
      iron: 6,
      coal: 4
    },
    stats: {
      defense: 20,
      hp: 25
    },
    description: "A sturdy steel shield"
  },
  GOLD_SWORD: {
    name: "Gold-Infused Sword",
    type: EquipmentSlot.MAIN_HAND,
    requirements: {
      iron: 3,
      gold: 2,
      coal: 2
    },
    stats: {
      attack: 40,
      hp: 30
    },
    description: "A powerful gold-infused sword"
  },
  IRON_ARMOR: {
    name: "Iron Armor",
    type: EquipmentSlot.ARMOR,
    requirements: {
      iron: 5,
      coal: 2
    },
    stats: {
      defense: 15,
      hp: 25
    },
    description: "Basic iron armor"
  },
  STEEL_ARMOR: {
    name: "Steel Armor",
    type: EquipmentSlot.ARMOR,
    requirements: {
      iron: 8,
      coal: 4
    },
    stats: {
      defense: 25,
      hp: 40
    },
    description: "Sturdy steel armor"
  },
  DIAMOND_ARMOR: {
    name: "Diamond-Infused Armor",
    type: EquipmentSlot.ARMOR,
    requirements: {
      iron: 5,
      diamond: 2,
      coal: 3
    },
    stats: {
      defense: 40,
      hp: 60
    },
    description: "Superior diamond-infused armor"
  },
  DIAMOND_SHIELD: {
    name: "Diamond Shield",
    type: EquipmentSlot.OFF_HAND,
    requirements: {
      iron: 4,
      diamond: 2,
      coal: 3
    },
    stats: {
      defense: 35,
      hp: 40
    },
    description: "A superior diamond-infused shield"
  }
};

export const canCraft = (recipe, inventory) => {
  return Object.entries(recipe.requirements).every(([resource, amount]) => 
    inventory[resource] >= amount
  );
};

export const craftItem = (recipe, inventory) => {
  if (!canCraft(recipe, inventory)) return false;
  
  // Deduct resources
  Object.entries(recipe.requirements).forEach(([resource, amount]) => {
    inventory[resource] -= amount;
  });
  
  return true;
}; 