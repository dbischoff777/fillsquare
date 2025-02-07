import React, { useState } from 'react';
import { useTimePressure } from '../../contexts/TimePressureContext';

const DangerMeter = () => {
  const { timeRemaining, getDifficultyMultipliers, WARNING_TIME, CRITICAL_TIME, dangerLevel } = useTimePressure();
  const { enemySpeed, enemyDamage, rewardMultiplier, comboMultiplier } = getDifficultyMultipliers();
  const [showTooltip, setShowTooltip] = useState(false);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDangerColor = () => {
    if (timeRemaining <= 60) return '#ff0000';  // Bright red for critical phase
    switch (dangerLevel) {
      case 2: return '#ff3333';  // Slightly softer red
      case 1: return '#ff9900';  // Orange for warning
      default: return '#00ff00'; // Green for normal
    }
  };

  const getPulseAnimation = () => {
    if (timeRemaining <= 60) return 'criticalPulse 0.5s infinite';
    if (dangerLevel === 2) return 'pulse 0.5s infinite';
    if (dangerLevel === 1) return 'pulse 1s infinite';
    return 'none';
  };

  const getPhaseDescription = () => {
    if (timeRemaining <= CRITICAL_TIME) {
      return "CRITICAL PHASE: Maximum difficulty with 2x rewards! Survive for epic loot! Reach the exit!";
    } else if (timeRemaining <= WARNING_TIME) {
      return "WARNING PHASE: Difficulty increasing rapidly. Prepare for critical phase!";
    }
    return "NORMAL PHASE: Standard difficulty scaling over time.";
  };

  return (
    <div 
      className="danger-meter" 
      style={{
        position: 'relative',
        color: getDangerColor(),
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: dangerLevel > 0 ? `0 0 10px ${getDangerColor()}80` : 'none',
        animation: getPulseAnimation(),
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        cursor: 'help'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={{ minWidth: '80px' }}>{formatTime(timeRemaining)}</div>
      
      <div style={{
        width: '120px',
        height: '12px',
        background: '#333',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid #666',
      }}>
        <div style={{
          width: `${(timeRemaining / 240) * 100}%`,
          height: '100%',
          background: getDangerColor(),
          transition: 'all 0.3s ease',
          boxShadow: dangerLevel > 0 ? `0 0 10px ${getDangerColor()}` : 'none',
        }} />
      </div>

      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '120%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.95)',
          border: '1px solid #666',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '14px',
          zIndex: 1000,
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{ 
            marginBottom: '10px',
            color: getDangerColor(),
            fontWeight: 'bold' 
          }}>
            {getPhaseDescription()}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Current Effects:</strong>
            <ul style={{ 
              margin: '5px 0',
              paddingLeft: '20px',
              color: '#ccc'
            }}>
              <li>Enemy Speed: +{((enemySpeed - 1) * 100).toFixed()}% faster</li>
              <li>Enemy Damage: +{((enemyDamage - 1) * 100).toFixed()}% damage</li>
              <li>Rewards: +{((rewardMultiplier * comboMultiplier - 1) * 100).toFixed()}% loot</li>
            </ul>
          </div>

          <div style={{ fontSize: '12px', color: '#999' }}>
            <strong>Time Thresholds:</strong><br/>
            Warning Phase: {WARNING_TIME}s | Critical Phase: {CRITICAL_TIME}s
          </div>
        </div>
      )}

      {/* Multiplier indicators */}
      <div style={{
        display: 'flex',
        gap: '8px',
        fontSize: '14px',
        opacity: 0.8,
      }}>
        <span title="Speed">🏃 x{enemySpeed.toFixed(1)}</span>
        <span title="Damage">⚔️ x{enemyDamage.toFixed(1)}</span>
        <span title="Rewards">💎 x{(rewardMultiplier * comboMultiplier).toFixed(1)}</span>
      </div>
    </div>
  );
};

// Update the pulse animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes criticalPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

export default DangerMeter; 