import { useRef, useEffect } from 'react';
import { moveEnemies } from '../utils/mazeUtils';
import { EntityTypes } from '../utils/entityTypes';
import { enemySpawner } from '../utils/enemySpawner';
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
  combatManager
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

      // Get all enemies (including spawned ones)
      const allEnemies = [...enemies, ...enemySpawner.getEnemies()];

      // Move regular enemies
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
            if (isValidMove(newX, newY, maze, allEnemies)) {
              const updatedEnemy = { ...enemy, x: newX, y: newY };
              
              if (checkCollisionWithPlayer(updatedEnemy, playerRef.current) && !combatInitiated.current) {
                initiateCombat(updatedEnemy);
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

      // Move spawned enemies
      enemySpawner.getEnemies().forEach(enemy => {
        try {
          const movement = moveEnemies(enemy, playerRef.current, maze);
          if (!movement) return;

          const newX = enemy.x + movement.dx;
          const newY = enemy.y + movement.dy;

          if (isValidMove(newX, newY, maze, allEnemies)) {
            enemy.x = newX;
            enemy.y = newY;

            if (checkCollisionWithPlayer(enemy, playerRef.current) && !combatInitiated.current) {
              initiateCombat(enemy);
            }
          }
        } catch (error) {
          console.error('Error moving spawned enemy:', error);
        }
      });
    }, 1000);

    return () => clearInterval(moveInterval.current);
  }, [maze, enemies, gameOver, showLevelSummary, inCombat]);

  // Helper functions
  const isValidMove = (x, y, maze, allEnemies) => {
    return (
      x >= 0 && x < maze[0].length &&
      y >= 0 && y < maze.length &&
      maze[y][x] !== EntityTypes.WALL &&
      maze[y][x] !== EntityTypes.EXIT &&
      !allEnemies.some(e => e !== null && e.x === x && e.y === y)
    );
  };

  const checkCollisionWithPlayer = (enemy, player) => {
    return (
      (enemy.x === player.x && enemy.y === player.y) ||
      (enemy.x === player.x && enemy.y === player.y)
    );
  };

  const initiateCombat = (enemy) => {
    combatInitiated.current = true;
    setInCombat(true);
    setCombatEnemy(enemy);
    setCombatTurn('enemy');
    clearInterval(moveInterval.current);
    
    setTimeout(() => {
      combatInitiated.current = false;
    }, 1000);
  };

  // Combat turn handling useEffect (unchanged)
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
        if (combatManager && typeof combatManager.handleCombatTurn === 'function') {
          combatManager.handleCombatTurn(
            playerRef.current,
            combatEnemy,
            combatTurn,
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
  }, [inCombat, combatEnemy, combatTurn]);

  // Initial combat turn setting (unchanged)
  useEffect(() => {
    if (inCombat && combatEnemy && typeof setCombatTurn === 'function') {
      console.log('Setting initial combat turn to enemy');
      setCombatTurn('enemy');
    }
  }, [inCombat, combatEnemy]);

  // Cleanup effect (unchanged)
  useEffect(() => {
    return () => {
      clearInterval(moveInterval.current);
      combatInitiated.current = false;
    };
  }, []);
}; 