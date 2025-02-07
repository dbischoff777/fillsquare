import { Enemy, EnemyTypes } from './enemyTypes';
import { useTimePressure } from '../contexts/TimePressureContext';

class EnemySpawner {
  constructor() {
    this.spawnPoints = [];
    this.enemies = [];
    this.lastSpawnTime = 0;
    this.baseSpawnInterval = 10000; // 10 seconds base interval
    this.minSpawnInterval = 2000;   // Minimum 2 seconds between spawns
    this.maxEnemies = 8;           // Maximum concurrent spawned enemies
  }

  // Initialize spawn points based on maze layout
  initializeSpawnPoints(maze) {
    this.spawnPoints = [];
    
    // Look for valid spawn points (empty cells near walls)
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 0) { // Empty cell
          // Check if adjacent to a wall
          const hasAdjacentWall = this.checkAdjacentWalls(maze, x, y);
          if (hasAdjacentWall) {
            this.spawnPoints.push({ x, y });
          }
        }
      });
    });
  }

  checkAdjacentWalls(maze, x, y) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return directions.some(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;
      return (
        newX >= 0 && 
        newY >= 0 && 
        newY < maze.length && 
        newX < maze[0].length && 
        (maze[newY][newX] === 1 || maze[newY][newX] >= 10)
      );
    });
  }

  update(currentTime, timePressureData, playerLevel) {
    const { getDifficultyMultipliers, dangerLevel } = timePressureData;
    const multipliers = getDifficultyMultipliers();

    // Scale spawn interval based on enemy speed multiplier
    const spawnInterval = Math.max(
      this.minSpawnInterval,
      this.baseSpawnInterval / multipliers.enemySpeed
    );

    // Check if it's time to spawn and we haven't hit the enemy limit
    if (currentTime - this.lastSpawnTime >= spawnInterval && 
        this.enemies.length < this.maxEnemies && 
        this.spawnPoints.length > 0) {
      
      // Chance to spawn multiple enemies at higher danger levels
      const multiSpawnChance = dangerLevel * 0.2; // 0%, 20%, or 40% based on danger level
      if (Math.random() < multiSpawnChance) {
        // Spawn 2-3 enemies at once
        const spawnCount = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < spawnCount; i++) {
          if (this.enemies.length < this.maxEnemies) {
            this.spawnEnemy(playerLevel, multipliers);
          }
        }
      } else {
        this.spawnEnemy(playerLevel, multipliers);
      }
      
      this.lastSpawnTime = currentTime;
    }

    // Update existing enemies
    this.enemies = this.enemies.filter(enemy => enemy.currentHp > 0);
  }

  spawnEnemy(playerLevel, multipliers) {
    const spawnPoint = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
    const enemyType = Enemy.getRandomType(playerLevel);
    
    // Create new enemy instance using the existing Enemy class
    const enemy = new Enemy(
      spawnPoint.x,
      spawnPoint.y,
      enemyType,
      playerLevel
    );

    // Apply time pressure multipliers to enemy stats
    enemy.attack = Math.ceil(enemy.attack * multipliers.enemyDamage);
    
    // Store original speed for movement calculations
    enemy.baseSpeed = enemy.speed || 1;
    enemy.speed = enemy.baseSpeed * multipliers.enemySpeed;

    this.enemies.push(enemy);
  }

  getEnemies() {
    return this.enemies;
  }

  removeEnemy(enemyToRemove) {
    this.enemies = this.enemies.filter(enemy => enemy !== enemyToRemove);
  }
}

export const enemySpawner = new EnemySpawner();

// Helper hook to use the spawner with TimePressure context
export const useEnemySpawner = () => {
  const timePressure = useTimePressure();
  
  return {
    spawner: enemySpawner,
    updateSpawner: (currentTime, playerLevel) => {
      enemySpawner.update(currentTime, timePressure, playerLevel);
    }
  };
}; 