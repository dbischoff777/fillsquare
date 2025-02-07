import { useRef, useEffect } from 'react';
import { moveEnemies } from '../utils/mazeUtils';
import { EntityTypes } from '../utils/entityTypes';
import { CombatManager } from '../utils/combatManager';

export const useEnemyMovement = (
  maze,
  enemies,
  setEnemies,
  player,
  gameOver,
  showLevelSummary,
  inCombat,
  setInCombat,
  setCombatEnemy,
  setCombatTurn,
  handlePlayerDeath,
  setAttackCount,
  setLimitBreakReady,
  combatTurn,
  combatEnemy,
  combatManager  // This should be the actual CombatManager instance
) => {
  const playerRef = useRef(player);
  const moveInterval = useRef(null);
  const combatInitiated = useRef(false);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // First useEffect for movement and combat initiation
  useEffect(() => {
    if (gameOver || showLevelSummary || inCombat || !enemies || !Array.isArray(enemies)) {
      clearInterval(moveInterval.current);
      return;
    }

    moveInterval.current = setInterval(() => {
      if (!playerRef.current) return;

      setEnemies(prevEnemies => {
        if (!prevEnemies || !Array.isArray(prevEnemies)) return [];
        
        return prevEnemies.map(enemy => {
          if (!enemy) return enemy;
          
          try {
            const movement = moveEnemies(enemy, playerRef.current, maze);
            if (!movement) return enemy;
            
            const newX = enemy.x + movement.dx;
            const newY = enemy.y + movement.dy;

            // Check if new position is valid
            if (newX >= 0 && newX < maze[0].length &&
                newY >= 0 && newY < maze.length &&
                maze[newY][newX] !== EntityTypes.WALL &&
                maze[newY][newX] !== EntityTypes.EXIT) {
              
              const updatedEnemy = { ...enemy, x: newX, y: newY };
              
              // Check for collision with player
              const willCollide = (
                (newX === playerRef.current.x && newY === playerRef.current.y) ||
                (enemy.x === playerRef.current.x && enemy.y === playerRef.current.y)
              );
              
              if (willCollide && !combatInitiated.current) {
                combatInitiated.current = true;
                setInCombat(true);
                setCombatEnemy(updatedEnemy);
                setCombatTurn('enemy');
                clearInterval(moveInterval.current);
                
                setTimeout(() => {
                  combatInitiated.current = false;
                }, 1000);

                return enemy;
              }
              
              return updatedEnemy;
            }
            return enemy;
          } catch (error) {
            console.error('Error moving enemy:', error);
            return enemy;
          }
        });
      });
    }, 1000);

    return () => clearInterval(moveInterval.current);
  }, [maze, enemies, gameOver, showLevelSummary, inCombat]);

  // Separate useEffect for enemy turns
  useEffect(() => {
    if (!inCombat || !combatEnemy) return;

    console.log('Combat conditions met - checking combat manager:', {
      inCombat,
      hasEnemy: !!combatEnemy,
      managerType: typeof combatManager,
      turn: combatTurn
    });
    
    const attackTimeout = setTimeout(() => {
      console.log('Triggering combat turn');
      try {
        // Call handleCombatTurn directly from the manager
        if (combatManager && typeof combatManager.handleCombatTurn === 'function') {
          combatManager.handleCombatTurn(
            playerRef.current,  // player
            combatEnemy,       // enemy
            combatTurn,        // current turn
            handlePlayerDeath,
            setAttackCount,
            setLimitBreakReady,
            setCombatTurn,
            setInCombat,
            setCombatEnemy
          );
        } else {
          console.error('Combat manager not properly initialized:', combatManager);
        }
      } catch (error) {
        console.error('Error in combat turn:', error);
      }
    }, 500);

    return () => {
      clearTimeout(attackTimeout);
    };
  }, [inCombat, combatEnemy, combatTurn]); // Removed combatManager from dependencies

  // When initiating combat, make sure we set the turn correctly
  useEffect(() => {
    if (inCombat && combatEnemy && typeof setCombatTurn === 'function') {
      console.log('Setting initial combat turn to enemy');
      setCombatTurn('enemy');
    }
  }, [inCombat, combatEnemy]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      clearInterval(moveInterval.current);
      combatInitiated.current = false;
    };
  }, []);
}; 