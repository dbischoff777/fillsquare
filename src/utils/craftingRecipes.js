import { EquipmentSlot } from './equipmentTypes';

export const CRAFTING_RECIPES = {
  // Basic Tools - Essential for resource gathering
  STONE_PICKAXE: {
    name: "Stone Pickaxe",
    type: EquipmentSlot.TOOL,
    requirements: {
      stone: 3
    },
    stats: {
      mining: 1,
      hp: 5
    },
    description: "A basic pickaxe for mining iron and coal",
    tier: 1
  },
  
  // Tier 1 Equipment - Iron Based
  IRON_PICKAXE: {
    name: "Iron Pickaxe",
    type: EquipmentSlot.TOOL,
    requirements: {
      iron: 3,
      coal: 1,
      stone: 2
    },
    stats: {
      mining: 2,
      attack: 10,
      hp: 8
    },
    description: "Required for mining gold and diamond",
    tier: 2,
    requires: ["STONE_PICKAXE"]
  },
  IRON_SWORD: {
    name: "Iron Sword",
    type: EquipmentSlot.MAIN_HAND,
    requirements: {
      iron: 4,
      coal: 2,
      stone: 1
    },
    stats: {
      attack: 15,
      hp: 10
    },
    description: "Basic iron sword for combat",
    tier: 2
  },
  
  // Tier 2 Equipment - Steel Based
  STEEL_SWORD: {
    name: "Steel Sword",
    type: EquipmentSlot.MAIN_HAND,
    requirements: {
      iron: 6,
      coal: 4
    },
    stats: {
      attack: 25,
      hp: 20
    },
    description: "Superior to iron weapons",
    tier: 3,
    requires: ["IRON_SWORD"]
  },
  STEEL_PICKAXE: {
    name: "Steel Pickaxe",
    type: EquipmentSlot.TOOL,
    requirements: {
      iron: 5,
      coal: 3
    },
    stats: {
      mining: 3,
      attack: 15,
      hp: 10
    },
    description: "More efficient at mining precious resources",
    tier: 3,
    requires: ["IRON_PICKAXE"]
  },
  
  // Tier 3 Equipment - Diamond/Gold Enhanced
  DIAMOND_PICKAXE: {
    name: "Diamond Pickaxe",
    type: EquipmentSlot.TOOL,
    requirements: {
      iron: 3,
      diamond: 2,
      coal: 2
    },
    stats: {
      mining: 4,
      attack: 20,
      hp: 15
    },
    description: "The ultimate mining tool",
    tier: 4,
    requires: ["STEEL_PICKAXE"]
  },
  GOLD_SWORD: {
    name: "Gold-Infused Sword",
    type: EquipmentSlot.MAIN_HAND,
    requirements: {
      iron: 4,
      gold: 3,
      coal: 2
    },
    stats: {
      attack: 40,
      hp: 30
    },
    description: "A powerful gold-enhanced weapon",
    tier: 4,
    requires: ["STEEL_SWORD"]
  },
  
  // Armor Sets with Progressive Tiers
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
    description: "Basic protective gear",
    tier: 2
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
    description: "Enhanced protection",
    tier: 3,
    requires: ["IRON_ARMOR"]
  },
  DIAMOND_ARMOR: {
    name: "Diamond-Infused Armor",
    type: EquipmentSlot.ARMOR,
    requirements: {
      iron: 5,
      diamond: 3,
      coal: 3
    },
    stats: {
      defense: 40,
      hp: 60
    },
    description: "Ultimate protection",
    tier: 4,
    requires: ["STEEL_ARMOR"]
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

export const getRecipeStatus = (recipe, inventory, player) => {
  // Check resource requirements
  const hasResources = Object.entries(recipe.requirements).every(
    ([resource, amount]) => inventory[resource] >= amount
  );

  // Check tier requirements
  const currentTier = Math.max(
    ...Object.values(player.equipment)
      .filter(item => item && item.type === recipe.type)
      .map(item => item.tier)
      .concat(0)
  );
  
  const isCorrectTier = recipe.tier <= currentTier + 1;

  // Check required items
  const hasRequiredItems = recipe.requires ? 
    recipe.requires.every(requiredItemId => {
      const requiredRecipe = CRAFTING_RECIPES[requiredItemId];
      return Object.values(player.equipment).some(
        equippedItem => 
          equippedItem && 
          equippedItem.name === requiredRecipe.name &&
          equippedItem.tier === requiredRecipe.tier
      );
    }) : true;

  return {
    canCraft: hasResources && isCorrectTier && hasRequiredItems,
    hasResources,
    isCorrectTier,
    hasRequiredItems,
    requiredItems: recipe.requires?.map(id => CRAFTING_RECIPES[id].name) || [],
    missingResources: Object.entries(recipe.requirements)
      .filter(([resource, amount]) => inventory[resource] < amount)
      .map(([resource, amount]) => ({
        resource,
        required: amount,
        current: inventory[resource]
      }))
  };
};

// Update getAvailableRecipes to return all recipes with their status
export const getAvailableRecipes = (inventory, player) => {
  return Object.entries(CRAFTING_RECIPES).map(([id, recipe]) => ({
    id,
    ...recipe,
    status: getRecipeStatus(recipe, inventory, player)
  }));
};

export const canCraft = (recipe, inventory, player) => {
  const status = getRecipeStatus(recipe, inventory, player);
  return status.canCraft;
};

export const craftItem = (recipe, inventory, player) => {
  if (!canCraft(recipe, inventory, player)) return false;
  
  // Deduct resources
  Object.entries(recipe.requirements).forEach(([resource, amount]) => {
    inventory[resource] -= amount;
  });

  // Create the crafted item
  const craftedItem = {
    name: recipe.name,
    type: recipe.type,
    stats: recipe.stats,
    description: recipe.description,
    tier: recipe.tier
  };

  // Automatically equip the item
  player.equip(craftedItem);
  
  return true;
}; 