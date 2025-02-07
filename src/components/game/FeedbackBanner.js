import React, { useEffect, useState } from 'react';

const FeedbackBanner = ({ messages = [], currentEnemy }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (messages.length > 0) {
      setOpacity(1);
      const timer = setTimeout(() => setOpacity(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const containerStyle = {
    minHeight: '40px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  };

  const messageStyle = {
    transition: 'opacity 0.3s ease-in-out',
    opacity: opacity,
    color: '#fff',
    textAlign: 'center',
    fontSize: '16px',
    textShadow: '0 0 10px rgba(0,0,0,0.5)',
    fontWeight: 'bold'
  };

  const enemyStatsStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '8px',
    marginTop: '10px'
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'damage': return '#ff4444';
      case 'heal': return '#44ff44';
      case 'collect': return '#f6c90e';
      case 'level': return '#44ffff';
      case 'combat': return '#ff8844';
      default: return '#ffffff';
    }
  };

  // Only show the most recent message
  const latestMessage = messages[messages.length - 1];

  return (
    <div style={containerStyle}>
      {latestMessage && (
        <div
          style={{
            ...messageStyle,
            color: getMessageColor(latestMessage.type),
          }}
        >
          {latestMessage.text}
        </div>
      )}
      
      {currentEnemy && (
        <div style={enemyStatsStyle}>
          <div style={{ color: currentEnemy.color, fontWeight: 'bold', fontSize: '18px' }}>
            {currentEnemy.name}
          </div>
          <div style={{ color: '#ff4444' }}>
            HP: {currentEnemy.currentHp} / {currentEnemy.maxHp}
          </div>
          <div style={{ color: '#ff8844' }}>
            Attack: {currentEnemy.attack}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackBanner; 