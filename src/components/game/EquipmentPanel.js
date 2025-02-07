import React from 'react';
import { OreTypes } from '../../utils/oreTypes';

const EquipmentPanel = ({ player }) => {
  if (!player) return null;

  const containerStyle = {
    backgroundColor: '#1a1b26',
    padding: '20px',
    borderRadius: '8px',
    color: '#fff',
    minWidth: '200px',
    marginLeft: '20px'
  };

  const sectionStyle = {
    marginBottom: '20px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  };

  const slotStyle = {
    backgroundColor: '#2a2b36',
    padding: '10px',
    borderRadius: '4px'
  };

  const labelStyle = {
    color: '#8b8c98',
    fontSize: '14px',
    marginBottom: '4px'
  };

  const valueStyle = {
    color: '#fff',
    fontSize: '16px'
  };

  const inventoryStyle = {
    display: 'grid',
    gap: '8px'
  };

  const inventoryItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#2a2b36',
    borderRadius: '4px'
  };

  // Debug log to see what's in the equipment object
  console.log('Equipment:', player.equipment);

  // Filter and standardize equipment slots to show
  const equipmentSlots = {
    mainHand: player.equipment.mainHand || player.equipment.mainhand,
    offHand: player.equipment.offHand || player.equipment.offhand,
    head: player.equipment.helmet || player.equipment.Helmet,
    chest: player.equipment.chest || player.equipment.Chest,
    feet: player.equipment.boots || player.equipment.Boots,
    hands: player.equipment.gloves || player.equipment.Gloves,
    tool: player.equipment.tool || player.equipment.Tool
  };

  // Debug log to see what slots we're displaying
  console.log('Equipment Slots:', equipmentSlots);

  return (
    <div style={containerStyle}>
      <div style={sectionStyle}>
        <h2>Equipment</h2>
        <div style={gridStyle}>
          {Object.entries(equipmentSlots).map(([slot, item]) => {
            // Debug log for each slot
            console.log(`Slot ${slot}:`, item);
            
            return (
              <div key={slot} style={slotStyle}>
                <div style={labelStyle}>
                  {slot.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}
                </div>
                <div style={valueStyle}>
                  {item ? item.name : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={sectionStyle}>
        <h2>Inventory</h2>
        <div style={inventoryStyle}>
          {Object.entries(player.inventory).map(([ore, amount]) => (
            <div key={ore} style={inventoryItemStyle}>
              <span style={{ 
                color: OreTypes[ore.toUpperCase()]?.color || '#fff',
                textTransform: 'capitalize'
              }}>
                {ore}
              </span>
              <span>{amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EquipmentPanel; 