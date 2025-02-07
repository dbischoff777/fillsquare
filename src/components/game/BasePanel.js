import React, { useState, useRef, useEffect } from 'react';

// Define building materials and their costs
const BUILDING_MATERIALS = {
  WALL: {
    name: 'Wall',
    cost: { stone: 2 },
    icon: '🧱',
    solid: true
  },
  DOOR: {
    name: 'Door',
    cost: { wood: 3, iron: 1 },
    icon: '🚪',
    solid: false
  },
  BED: {
    name: 'Bed',
    cost: { wood: 4, cloth: 2 },
    icon: '🛏️',
    solid: true
  },
  CHEST: {
    name: 'Storage Chest',
    cost: { wood: 3, iron: 2 },
    icon: '📦',
    solid: true
  },
  TORCH: {
    name: 'Torch',
    cost: { wood: 1, coal: 1 },
    icon: '🔥',
    solid: false
  },
  CRAFTING_TABLE: {
    name: 'Crafting Table',
    cost: { wood: 5, iron: 2 },
    icon: '⚒️',
    solid: true
  }
};

const BasePanel = ({ baseInventory, onStore, onRetrieve, player, onClose, baseLayout: propBaseLayout, setBaseLayout: setPropBaseLayout }) => {
  // Initialize local state from props or create new layout
  const [localBaseLayout, setLocalBaseLayout] = useState(() => {
    if (propBaseLayout) return propBaseLayout;
    
    // Initialize a 15x15 grid for the base
    const layout = Array(15).fill().map(() => Array(15).fill(null));
    // Add floor to all tiles
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        layout[y][x] = { type: 'FLOOR', icon: '⬜' };
      }
    }
    return layout;
  });
  
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [buildMode, setBuildMode] = useState(false);
  const [hoveredTile, setHoveredTile] = useState(null);

  // Sync local state with prop state
  useEffect(() => {
    if (!propBaseLayout) {
      setPropBaseLayout(localBaseLayout);
    }
  }, []);

  const canBuild = (material) => {
    if (!material) return false;
    return Object.entries(material.cost).every(([resource, amount]) => 
      (player.inventory[resource] || 0) >= amount
    );
  };

  const handleBuild = (x, y) => {
    if (!selectedMaterial || !buildMode || !canBuild(BUILDING_MATERIALS[selectedMaterial])) return;

    const newLayout = localBaseLayout.map(row => [...row]);
    const currentTile = newLayout[y][x];
    
    // Don't allow building on tiles with solid structures
    if (currentTile && currentTile.type !== 'FLOOR' && BUILDING_MATERIALS[currentTile.type]?.solid) {
      return;
    }

    newLayout[y][x] = {
      type: selectedMaterial,
      icon: BUILDING_MATERIALS[selectedMaterial].icon
    };

    setLocalBaseLayout(newLayout);
    setPropBaseLayout(newLayout);

    // Deduct resources from player inventory
    Object.entries(BUILDING_MATERIALS[selectedMaterial].cost).forEach(([resource, amount]) => {
      onStore('ore', { name: resource, amount: -amount });
    });
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      padding: '20px',
      borderRadius: '12px',
      color: '#fff',
      minWidth: '800px',
      border: '2px solid #444',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Base Builder</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Building Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(15, 30px)',
          gap: '1px',
          backgroundColor: '#333',
          padding: '10px',
          borderRadius: '8px'
        }}>
          {localBaseLayout.map((row, y) => 
            row.map((tile, x) => (
              <div
                key={`${x}-${y}`}
                onClick={() => handleBuild(x, y)}
                onMouseEnter={() => setHoveredTile({ x, y })}
                onMouseLeave={() => setHoveredTile(null)}
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: hoveredTile?.x === x && hoveredTile?.y === y ? '#444' : '#222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: buildMode ? 'pointer' : 'default',
                  fontSize: '20px',
                  transition: 'background-color 0.2s'
                }}
              >
                {tile?.icon}
              </div>
            ))
          )}
        </div>

        {/* Building Controls */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setBuildMode(!buildMode)}
              style={{
                background: buildMode ? '#4CAF50' : '#666',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              {buildMode ? 'Building Mode: ON' : 'Building Mode: OFF'}
            </button>
          </div>

          <h3>Building Materials</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {Object.entries(BUILDING_MATERIALS).map(([key, material]) => (
              <button
                key={key}
                onClick={() => setSelectedMaterial(key)}
                style={{
                  background: selectedMaterial === key ? '#2c3e50' : '#1a1a1a',
                  border: `2px solid ${canBuild(material) ? '#4CAF50' : '#666'}`,
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '20px' }}>{material.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div>{material.name}</div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>
                    {Object.entries(material.cost).map(([resource, amount]) => 
                      `${resource}: ${amount}`
                    ).join(', ')}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <h3>Player Resources</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '5px',
            fontSize: '14px'
          }}>
            {Object.entries(player.inventory).map(([resource, amount]) => (
              <div key={resource} style={{ padding: '5px', background: '#1a1a1a', borderRadius: '4px' }}>
                {resource}: {amount}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasePanel; 