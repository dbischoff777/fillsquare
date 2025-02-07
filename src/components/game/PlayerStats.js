import React from 'react';

const PlayerStats = ({ player, treasuresCollected, depth }) => {
  if (!player) return null;

  const containerStyle = {
    backgroundColor: '#1a1b26',
    padding: '20px',
    borderRadius: '8px',
    color: '#fff',
    minWidth: '200px',
    marginRight: '20px'
  };

  const statBlockStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    color: '#8b8c98',
    fontSize: '14px',
    marginBottom: '4px'
  };

  const barContainerStyle = {
    backgroundColor: '#2a2b36',
    height: '20px',
    borderRadius: '4px',
    overflow: 'hidden'
  };

  const barStyle = (value, max, color) => ({
    width: `${Math.min((value / max) * 100, 100)}%`,
    height: '100%',
    backgroundColor: color,
    transition: 'width 0.3s ease-in-out'
  });

  const valueStyle = {
    textAlign: 'right',
    fontSize: '14px',
    color: '#8b8c98'
  };

  return (
    <div style={containerStyle}>
      <div style={statBlockStyle}>
        <div style={labelStyle}>Health</div>
        <div style={barContainerStyle}>
          <div style={barStyle(player.currentHp, player.maxHp, '#ff4444')} />
        </div>
        <div style={valueStyle}>{player.currentHp} / {player.maxHp}</div>
      </div>

      <div style={statBlockStyle}>
        <div style={labelStyle}>Level {player.level}</div>
        <div style={barContainerStyle}>
          <div style={barStyle(player.experience, player.experienceToNextLevel, '#44ff44')} />
        </div>
        <div style={valueStyle}>
          {Math.min(player.experience, player.experienceToNextLevel)} / {player.experienceToNextLevel}
        </div>
      </div>

      <div style={statBlockStyle}>
        <div style={labelStyle}>Attack</div>
        <div style={valueStyle}>{player.attack}</div>
      </div>

      <div style={statBlockStyle}>
        <div style={labelStyle}>Depth</div>
        <div style={valueStyle}>{depth}</div>
      </div>

      <div style={statBlockStyle}>
        <div style={labelStyle}>Treasures</div>
        <div style={valueStyle}>{treasuresCollected}</div>
      </div>
    </div>
  );
};

export default PlayerStats; 