import React from 'react';
import Modal from '../common/Modal';

const BagPanel = ({ player, onClose }) => {
  if (!player) return null;

  // Group identical items and count them
  const stackedItems = player.bag.reduce((acc, item) => {
    const key = `${item.name}-${item.type}`;
    if (!acc[key]) {
      acc[key] = { item, count: 1 };
    } else {
      acc[key].count++;
    }
    return acc;
  }, {});

  const handleSalvage = (itemKey) => {
    const [itemName, itemType] = itemKey.split('-');
    const itemsToSalvage = player.bag.filter(item => 
      item.name === itemName && item.type === itemType
    );

    if (itemsToSalvage.length === 0) return;

    // Get the first item as reference for requirements
    const item = itemsToSalvage[0];
    
    // Add salvaged resources to inventory
    if (item.requirements) {
      Object.entries(item.requirements).forEach(([resource, amount]) => {
        const salvageAmount = amount === 1 ? 1 : Math.floor(amount / 2);
        player.inventory[resource] = (player.inventory[resource] || 0) + salvageAmount;
      });
    }

    // Remove salvaged items from bag
    player.bag = player.bag.filter(bagItem => 
      !(bagItem.name === itemName && bagItem.type === itemType)
    );
  };

  return (
    <div className="bag-panel">
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(20, 20, 30, 0.95)',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #30475e',
        color: '#fff',
        minWidth: '300px',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #30475e',
          paddingBottom: '10px'
        }}>
          <h2 style={{ margin: 0 }}>Bag ({player.bag.length}/{player.bagSize})</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px 10px'
            }}
          >
            ×
          </button>
        </div>

        <div>
          {Object.entries(stackedItems).map(([key, { item, count }]) => (
            <div key={key} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '4px'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '5px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{item.name}</span>
                <span style={{ color: '#aaa' }}>x{count}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
                {item.type}
              </div>
              <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                Stats:
                {Object.entries(item.stats).map(([stat, value]) => (
                  <span key={stat} style={{ marginLeft: '5px' }}>
                    {stat}: {value}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#4CAF50', marginBottom: '5px' }}>
                Salvage yields:
                {item.requirements && Object.entries(item.requirements).map(([resource, amount]) => (
                  <span key={resource} style={{ marginLeft: '5px' }}>
                    {resource}: {amount === 1 ? 1 : Math.floor(amount / 2)}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleSalvage(key)}
                style={{
                  backgroundColor: '#ff4444',
                  color: '#fff',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '5px'
                }}
              >
                Salvage All
              </button>
            </div>
          ))}
          
          {player.bag.length === 0 && (
            <div style={{ color: '#aaa', textAlign: 'center' }}>
              Bag is empty
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BagPanel; 