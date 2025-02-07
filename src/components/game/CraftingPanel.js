import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import { CRAFTING_RECIPES } from '../../utils/craftingRecipes';
import { EquipmentSlot } from '../../utils/equipmentTypes';

const CraftingPanel = ({ player, onCraft }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Early return if no player
  if (!player || !player.inventory) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          left: '160px',
          bottom: '20px',
          backgroundColor: hasCraftableItems ? 'rgba(76, 175, 80, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          border: hasCraftableItems ? '2px solid #4CAF50' : 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}
      >
        Crafting
        {hasCraftableItems && (
          <span style={{
            backgroundColor: '#fff',
            color: '#4CAF50',
            borderRadius: '50%',
            width: '8px',
            height: '8px',
            display: 'inline-block'
          }}/>
        )}
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crafting"
      >
        <div style={{ color: '#fff' }}>
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#aaa', margin: '5px 0' }}>Resources:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              <div>Coal: {player.inventory.coal || 0}</div>
              <div>Iron: {player.inventory.iron || 0}</div>
              <div>Gold: {player.inventory.gold || 0}</div>
              <div>Diamond: {player.inventory.diamond || 0}</div>
            </div>
          </div>

          {equipmentOrder.map(type => {
            const recipes = groupedRecipes[type] || [];
            if (recipes.length === 0) return null;

            return (
              <div key={type} style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  color: '#aaa', 
                  margin: '10px 0', 
                  borderBottom: '1px solid #444',
                  paddingBottom: '5px'
                }}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                </h4>
                
                {recipes.map(recipe => {
                  const canCraft = Object.entries(recipe.requirements).every(
                    ([resource, amount]) => player.inventory[resource.toLowerCase()] >= amount
                  );

                  return (
                    <div key={recipe.id} style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      padding: '15px',
                      marginBottom: '10px',
                      borderRadius: '4px',
                      opacity: canCraft ? 1 : 0.5
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
                        {recipe.name}
                      </div>
                      <div style={{ fontSize: '12px', marginBottom: '5px', lineHeight: '1.4' }}>
                        Stats:
                        {Object.entries(recipe.stats).map(([stat, value]) => (
                          <span key={stat} style={{ marginLeft: '5px' }}>
                            {stat}: {value}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: '12px', color: '#4CAF50', marginBottom: '5px', lineHeight: '1.4' }}>
                        Requirements:
                        {Object.entries(recipe.requirements).map(([resource, amount]) => (
                          <span key={resource} style={{ marginLeft: '5px' }}>
                            {resource}: {amount}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => canCraft && onCraft(recipe)}
                        disabled={!canCraft}
                        style={{
                          backgroundColor: canCraft ? '#4CAF50' : '#666',
                          color: '#fff',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: canCraft ? 'pointer' : 'not-allowed',
                          width: '100%',
                          marginTop: '5px',
                          fontSize: '12px'
                        }}
                      >
                        Craft
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default CraftingPanel; 