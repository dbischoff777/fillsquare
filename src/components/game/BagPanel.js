import React, { useState } from 'react';
import Modal from '../common/Modal';

const BagPanel = ({ player, onSalvage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          left: '20px',
          bottom: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Bag ({player.bag.length}/{player.bagSize})
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Bag (${player.bag.length}/${player.bagSize})`}
      >
        <div style={{ color: '#fff' }}>
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
                onClick={() => onSalvage(key)}
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
      </Modal>
    </>
  );
};

export default BagPanel; 