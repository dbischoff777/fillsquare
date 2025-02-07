import React, { useState, useMemo } from 'react';
import { CRAFTING_RECIPES } from '../../utils/craftingRecipes';
import { EquipmentSlot } from '../../utils/equipmentTypes';
import { getAvailableRecipes, craftItem } from '../../utils/craftingRecipes';
import './CraftingPanel.css';

const CraftingPanel = ({ player, onClose }) => {

  // Check if any items are craftable
  const hasCraftableItems = useMemo(() => {
    if (!player || !player.inventory) return false;
    
    return Object.values(CRAFTING_RECIPES).some(recipe => 
      Object.entries(recipe.requirements).every(
        ([resource, amount]) => player.inventory[resource.toLowerCase()] >= amount
      )
    );
  }, [player]);

  // Group recipes by equipment type
  const groupedRecipes = useMemo(() => {
    return Object.entries(CRAFTING_RECIPES).reduce((acc, [id, recipe]) => {
      const type = recipe.type || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push({ id, ...recipe });
      return acc;
    }, {});
  }, []);

  const equipmentOrder = [
    EquipmentSlot.MAIN_HAND,
    EquipmentSlot.OFF_HAND,
    EquipmentSlot.TOOL,
    EquipmentSlot.HELMET,
    EquipmentSlot.BOOTS,
    EquipmentSlot.GLOVES
  ];

  if (!player) {
    return (
      <div className="crafting-panel">
        <div className="crafting-header">
          <h2>Crafting</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="recipes-container">
          Loading...
        </div>
      </div>
    );
  }

  const recipes = getAvailableRecipes(player.inventory, player);

  return (
    <div className="crafting-panel">
      <div className="crafting-header">
        <h2>Crafting</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <div className="recipes-container">
        {recipes.map((recipe) => {
          if (!recipe.status) return null;
          
          return (
            <div 
              key={recipe.id} 
              className={`recipe-card ${recipe.status.canCraft ? 'available' : 'locked'}`}
            >
              <div className="recipe-title">
                <span>{recipe.name}</span>
                <span className="tier-badge">Tier {recipe.tier}</span>
              </div>

              <div className="recipe-description">{recipe.description}</div>

              <div className="recipe-requirements">
                <div className="resources">
                  {Object.entries(recipe.requirements).map(([resource, amount]) => (
                    <div 
                      key={resource}
                      className={`resource ${player.inventory[resource] >= amount ? 'met' : 'unmet'}`}
                    >
                      <span className="resource-name">{resource}:</span>
                      <span className="resource-amount">{player.inventory[resource]}/{amount}</span>
                    </div>
                  ))}
                </div>

                {recipe.status.requiredItems && recipe.status.requiredItems.length > 0 && (
                  <div className="required-items">
                    <div className="requirement-header">Required Items:</div>
                    {recipe.status.requiredItems.map(itemName => (
                      <div 
                        key={itemName}
                        className={`required-item ${recipe.status.hasRequiredItems ? 'met' : 'unmet'}`}
                      >
                        • {itemName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {recipe.stats && (
                <div className="recipe-stats">
                  {Object.entries(recipe.stats).map(([stat, value]) => (
                    <div key={stat} className="stat">
                      <span className="stat-name">{stat}:</span>
                      <span className="stat-value">+{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <button 
                className={`craft-button ${recipe.status.canCraft ? 'available' : 'locked'}`}
                onClick={() => craftItem(recipe, player.inventory, player)}
                disabled={!recipe.status.canCraft}
              >
                {recipe.status.canCraft ? 'Craft' : 'Locked'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CraftingPanel; 