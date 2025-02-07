import { useRef, useEffect } from 'react';
import { moveEnemies } from '../utils/mazeUtils';
import { EntityTypes } from '../utils/entityTypes';

export const useEnemyMovement = (
  maze,
  enemies,
  setEnemies,
  player,
  setGameOver,
  gameOver,
  showLevelSummary,
  addFeedbackMessage,
  setGameOverReason,
  handlePlayerDeath,
  inCombat
) => {
  const playerRef = useRef(player);
  const moveInterval = useRef(null);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

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
              
              // Check for collision with other enemies
              const enemyCollision = prevEnemies.some(
                otherEnemy => otherEnemy !== enemy && 
                             otherEnemy.x === newX && 
                             otherEnemy.y === newY
              );

              if (!enemyCollision) {
                return { ...enemy, x: newX, y: newY };
              }
            }
            // Invalid move or collision, keep current position
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

  // Remove the attack effect since combat is now turn-based
}; 