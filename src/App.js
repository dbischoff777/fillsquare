import React from 'react';
import GameGrid from './components/game/GameGrid';
import { TimePressureProvider } from './contexts/TimePressureContext';
import './App.css';

function App() {
  return (
    <TimePressureProvider>
      <GameGrid />
    </TimePressureProvider>
  );
}

export default App;
