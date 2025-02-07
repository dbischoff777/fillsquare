import React, { useEffect, useRef } from 'react';
import { TECH_TREE, TECH_CATEGORIES } from '../../utils/techTreeData';

const TechTree = ({ player, onClose }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!player) return null;

  const canResearch = (tech) => {
    if (player.techPoints < tech.cost) return false;
    if (tech.requirements.length === 0) return true;
    return tech.requirements.every(reqId => player.technologies.includes(reqId));
  };

  const handleResearch = (techId) => {
    const tech = TECH_TREE[techId];
    if (!canResearch(tech)) return;

    player.techPoints -= tech.cost;
    player.technologies.push(techId);
    
    // Apply technology effects
    if (tech.effects.attackBonus) {
      player.attack += tech.effects.attackBonus;
    }
    if (tech.effects.hpBonus) {
      player.maxHp += tech.effects.hpBonus;
      player.currentHp += tech.effects.hpBonus;
    }
  };

  const renderTechCategory = (category) => {
    const techs = Object.values(TECH_TREE).filter(tech => tech.category === category);
    
    return (
      <div key={category} style={{
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#4caf50', marginBottom: '10px' }}>{category}</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px'
        }}>
          {techs.map(tech => {
            const isResearched = player.technologies.includes(tech.id);
            const isAvailable = canResearch(tech);
            
            return (
              <div key={tech.id} style={{
                backgroundColor: isResearched ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                padding: '15px',
                borderRadius: '4px',
                opacity: isAvailable || isResearched ? 1 : 0.5
              }}>
                <div style={{ 
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{tech.name}</span>
                  <span style={{ color: '#aaa' }}>Cost: {tech.cost}</span>
                </div>
                <div style={{ fontSize: '14px', marginBottom: '10px' }}>
                  {tech.description}
                </div>
                {tech.requirements.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
                    Requires: {tech.requirements.map(reqId => TECH_TREE[reqId].name).join(', ')}
                  </div>
                )}
                <button
                  onClick={() => handleResearch(tech.id)}
                  disabled={!isAvailable || isResearched}
                  style={{
                    width: '100%',
                    padding: '5px',
                    backgroundColor: isResearched ? '#4caf50' : isAvailable ? '#30475e' : '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAvailable && !isResearched ? 'pointer' : 'default'
                  }}
                >
                  {isResearched ? 'Researched' : isAvailable ? 'Research' : 'Locked'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div ref={panelRef} style={{
        backgroundColor: 'rgba(20, 20, 30, 0.95)',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #30475e',
        color: '#fff',
        width: '80%',
        maxWidth: '1000px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #30475e',
          paddingBottom: '10px'
        }}>
          <h2 style={{ margin: 0 }}>Technology Tree (Points: {player.techPoints})</h2>
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

        {Object.values(TECH_CATEGORIES).map(category => renderTechCategory(category))}
      </div>
    </div>
  );
};

export default TechTree; 