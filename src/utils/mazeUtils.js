import { EntityTypes } from './entityTypes';
import { Enemy, EnemyTypes } from './enemyTypes';
import { EQUIPMENT_LIST } from './equipmentTypes';
import { OreTypes, generateOreWall } from './oreTypes';
import { findPath } from './pathfinding';

export const generateMaze = (width, height, playerLevel = 1) => {
  // Initialize the grid with walls
  const maze = Array(height).fill().map(() => Array(width).fill(1));
  
  // Set starting point and exit
  const startY = 1;
  const startX = 1;
  const exitY = height - 2;
  const exitX = width - 2;
  
  // Start from the exit point to ensure it's reachable
  maze[exitY][exitX] = 2; // 2 represents the exit
  const stack = [[exitX, exitY]];
  
  // Directions: right, down, left, up
  const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];

  while (stack.length > 0) {
    const [currentX, currentY] = stack[stack.length - 1];
    
    // Get available neighbors
    const neighbors = directions
      .map(([dx, dy]) => [currentX + dx, currentY + dy])
      .filter(([x, y]) => 
        x > 0 && x < width - 1 && y > 0 && y < height - 1 && maze[y][x] === 1
      );

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    // Choose random neighbor
    const [nextX, nextY] = neighbors[Math.floor(Math.random() * neighbors.length)];
    
    // Carve path
    maze[nextY][nextX] = 0;
    maze[currentY + (nextY - currentY) / 2][currentX + (nextX - currentX) / 2] = 0;
    
    // If we've reached the start position, mark it
    if (nextX === startX && nextY === startY) {
      maze[startY][startX] = 0;
    }
    
    stack.push([nextX, nextY]);
  }

  // Ensure start position is carved out
  maze[startY][startX] = 0;
  
  // Make sure there's a path to both start and exit
  if (maze[startY][startX + 1] === 1 && maze[startY + 1][startX] === 1) {
    maze[startY][startX + 1] = 0;
  }
  if (maze[exitY][exitX - 1] === 1 && maze[exitY - 1][exitX] === 1) {
    maze[exitY][exitX - 1] = 0;
  }

  // Generate enemies with scaled stats based on player level
  const enemies = [];
  const numEnemies = Math.min(10 + Math.floor(playerLevel / 2), 20); // More enemies as player levels
  
  for (let i = 0; i < numEnemies; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * width);
      y = Math.floor(Math.random() * height);
    } while (
      maze[y][x] !== 0 || // Space is not empty
      (x === 1 && y === 1) || // Starting position
      enemies.some(e => e.x === x && e.y === y) // Another enemy exists here
    );

    // Scale enemy level with player level (random variation ±2 levels)
    const enemyLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 5) - 2);
    
    // Choose enemy type based on player level
    let enemyType;
    if (playerLevel <= 3) {
      enemyType = EnemyTypes.RAT;
    } else if (playerLevel <= 6) {
      enemyType = Math.random() < 0.7 ? EnemyTypes.RAT : EnemyTypes.SKELETON;
    } else if (playerLevel <= 9) {
      enemyType = Math.random() < 0.6 ? EnemyTypes.SKELETON : EnemyTypes.ORC;
    } else {
      // Higher levels get tougher enemies
      const roll = Math.random();
      if (roll < 0.3) enemyType = EnemyTypes.SKELETON;
      else if (roll < 0.7) enemyType = EnemyTypes.ORC;
      else enemyType = EnemyTypes.DEMON;
    }

    const enemy = new Enemy(x, y, enemyType, enemyLevel);
    
    // Scale enemy stats with level
    const levelMultiplier = 1 + (enemyLevel - 1) * 0.2; // 20% increase per level
    enemy.maxHp = Math.floor(enemy.maxHp * levelMultiplier);
    enemy.currentHp = enemy.maxHp;
    enemy.attack = Math.floor(enemy.attack * levelMultiplier);
    
    enemies.push(enemy);
    maze[y][x] = 4; // Mark enemy position
  }

  // Add treasures at dead ends (3 represents treasure)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (maze[y][x] === 0) {
        let wallCount = 0;
        if (maze[y-1][x] === 1) wallCount++;
        if (maze[y+1][x] === 1) wallCount++;
        if (maze[y][x-1] === 1) wallCount++;
        if (maze[y][x+1] === 1) wallCount++;

        if (wallCount === 3 && 
            !(x === startX && y === startY) && 
            !(x === exitX && y === exitY) &&
            !(Math.abs(x - exitX) <= 1 && Math.abs(y - exitY) <= 1)) {
          maze[y][x] = 3;
        }
      }
    }
  }

  // Add ores to walls
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (maze[y][x] === 1) { // If it's a wall
        const ore = generateOreWall();
        if (ore) {
          maze[y][x] = ore.id;
        }
      }
    }
  }

  return { maze, enemies };
};

const isWalkable = (maze, x, y) => {
  const tile = maze[y][x];
  return tile !== EntityTypes.WALL && 
         tile !== 1 && 
         tile !== EntityTypes.EXIT;
};

const isFreeTile = (maze, x, y) => {
  return maze[y][x] === 0;
};

export const moveEnemies = (enemy, player, maze) => {
  if (!enemy || !player || !maze) {
    console.log('Missing required parameters:', { enemy, player, maze });
    return null;
  }

  // Find path to player
  const path = findPath(maze, enemy, player);
  
  if (!path) {
    console.log('No path found for enemy:', enemy, 'to player:', player);
    return null;
  }

  if (path.length < 2) {
    console.log('Path too short:', path);
    return null;
  }

  // Get next position in path
  const nextPos = path[1]; // path[0] is current position
  
  // Verify the move is valid
  if (nextPos.x >= 0 && nextPos.x < maze[0].length &&
      nextPos.y >= 0 && nextPos.y < maze.length) {
    
    // Verify the next tile is free
    if (!isFreeTile(maze, nextPos.x, nextPos.y)) {
      console.log('Next position is not a free tile:', nextPos, maze[nextPos.y][nextPos.x]);
      return null;
    }

    // Calculate movement direction
    const dx = nextPos.x - enemy.x;
    const dy = nextPos.y - enemy.y;

    // Verify it's only moving one tile at a time
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
      return { dx, dy };
    } else {
      console.log('Movement too large:', { dx, dy });
    }
  } else {
    console.log('Next position out of bounds:', nextPos);
  }

  return null;
};

// Add equipment drop chance and selection
const getRandomEquipment = () => {
  const equipmentList = Object.values(EQUIPMENT_LIST);
  const dropChance = Math.random();
  
  if (dropChance > 0.7) { // 30% chance to drop equipment
    return equipmentList[Math.floor(Math.random() * equipmentList.length)];
  }
  return null;
};

// Update movePlayer in GameGrid to handle equipment collection
export const handleEnemyDeath = (enemy) => {
  const droppedEquipment = getRandomEquipment();
  return droppedEquipment;
};