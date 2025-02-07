import React, { createContext, useContext, useState, useEffect } from 'react';

const TimePressureContext = createContext();
const LEVEL_TIME_LIMIT = 240; // 4 minutes in seconds
const WARNING_TIME = 60; // 1 minute warning
const CRITICAL_TIME = 30; // 30 seconds - for extra pressure

export function TimePressureProvider({ children }) {
  const [timeRemaining, setTimeRemaining] = useState(LEVEL_TIME_LIMIT);
  const [isPaused, setIsPaused] = useState(false);
  const [dangerLevel, setDangerLevel] = useState(0); // 0: normal, 1: warning, 2: critical

  useEffect(() => {
    // Update danger level based on time
    if (timeRemaining <= CRITICAL_TIME) {
      setDangerLevel(2);
    } else if (timeRemaining <= WARNING_TIME) {
      setDangerLevel(1);
    } else {
      setDangerLevel(0);
    }
  }, [timeRemaining]);

  useEffect(() => {
    let interval;
    if (!isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, timeRemaining]);

  const getDifficultyMultipliers = () => {
    const timeSpent = LEVEL_TIME_LIMIT - timeRemaining;
    const pressureFactor = timeSpent / LEVEL_TIME_LIMIT; // 0 to 1
    
    // Add exponential scaling for more dramatic end-game pressure
    const exponentialPressure = Math.pow(pressureFactor, 1.5);
    
    return {
      enemySpeed: 1 + (exponentialPressure * 0.75),  // Up to 75% faster
      enemyDamage: 1 + (exponentialPressure * 0.5),  // Up to 50% more damage
      rewardMultiplier: 1 + (exponentialPressure * 1.0), // Up to 100% more rewards
      // Add combo multiplier for risk/reward
      comboMultiplier: timeRemaining <= CRITICAL_TIME ? 2 : 1, // Double points in critical time
    };
  };

  const resetTime = () => {
    setTimeRemaining(LEVEL_TIME_LIMIT);
  };

  const pauseTime = () => {
    setIsPaused(true);
  };

  const resumeTime = () => {
    setIsPaused(false);
  };

  return (
    <TimePressureContext.Provider 
      value={{ 
        timeRemaining,
        getDifficultyMultipliers, 
        resetTime,
        pauseTime,
        resumeTime,
        WARNING_TIME,
        CRITICAL_TIME,
        dangerLevel
      }}
    >
      {children}
    </TimePressureContext.Provider>
  );
}

export const useTimePressure = () => useContext(TimePressureContext); 