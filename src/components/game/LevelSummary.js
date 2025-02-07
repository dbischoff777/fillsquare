import React from 'react';

const LevelSummary = ({ treasuresCollected, depth, onContinue }) => {
  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1a1a2e',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    color: '#fff',
    textAlign: 'center',
    minWidth: '300px',
    zIndex: 1000,
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
  };

  const buttonStyle = {
    backgroundColor: '#f6c90e',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    color: '#1a1a2e',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
  };

  return (
    <>
      <div style={overlayStyle} />
      <div style={modalStyle}>
        <h2 style={{ color: '#f6c90e', marginTop: 0 }}>Depth {depth} Cleared!</h2>
        <div style={{ marginBottom: '20px' }}>
          <p>Treasures Collected: <span style={{ color: '#f6c90e' }}>{treasuresCollected}</span></p>
        </div>
        <button style={buttonStyle} onClick={onContinue}>
          Descend Deeper
        </button>
      </div>
    </>
  );
};

export default LevelSummary; 