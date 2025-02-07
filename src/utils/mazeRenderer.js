import { OreTypes } from './oreTypes';
import playerImage from '../assets/images/player/player.png';
import chestImage from '../assets/images/objects/chest.png';

// Create and load the player image
const playerSprite = new Image();
playerSprite.src = playerImage;

// Create and load the chest image
const chestSprite = new Image();
chestSprite.src = chestImage;

export const drawMaze = (
  ctx, 
  maze, 
  player, 
  moveAnimation, 
  lastMoveTime, 
  playerAngle, 
  setMoveAnimation, 
  enemies,
  droppedItems = new Map(),
  miningParticles = []
) => {
  const cellSize = 32;
  const currentTime = performance.now();
  
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw maze elements with all parameters
  drawMazeElements(ctx, maze, cellSize, currentTime, player, enemies, playerAngle);
  
  // Draw dropped items
  droppedItems.forEach((item, key) => {
    const [x, y] = key.split(',').map(Number);
    drawDroppedItem(ctx, x, y, cellSize);
  });

  // Draw mining particles
  miningParticles.forEach((particle, index) => {
    ctx.fillStyle = `rgba(150, 150, 150, ${particle.life})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Update particle
    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.life -= 0.05;
    
    if (particle.life <= 0) {
      miningParticles.splice(index, 1);
    }
  });
};

const drawTreasure = (ctx, x, y, cellSize, currentTime) => {
  // Draw chest sprite only
  if (chestSprite.complete) {
    ctx.drawImage(
      chestSprite,
      x * cellSize + 2,
      y * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );
  }
};

const drawMazeElements = (ctx, maze, cellSize, currentTime, player, enemies = [], playerAngle = 0) => {
  // Draw base maze and walls
  maze.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1 || cell >= 10) { // Wall or ore
        // Base wall
        ctx.fillStyle = '#30475e';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        
        // If it's an ore, add ore overlay
        const ore = Object.values(OreTypes).find(o => o.id === cell);
        if (ore) {
          // Draw ore pattern
          ctx.fillStyle = ore.color;
          
          // Create a more crystalline pattern
          const centerX = x * cellSize + cellSize / 2;
          const centerY = y * cellSize + cellSize / 2;
          const radius = cellSize * 0.3;
          
          // Draw main crystal shape
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const wobble = Math.sin(currentTime / 1000 + i) * 2;
            const pointX = centerX + (radius + wobble) * Math.cos(angle);
            const pointY = centerY + (radius + wobble) * Math.sin(angle);
            
            if (i === 0) {
              ctx.moveTo(pointX, pointY);
            } else {
              ctx.lineTo(pointX, pointY);
            }
          }
          ctx.closePath();
          ctx.fill();
          
          // Add inner details
          ctx.fillStyle = `${ore.color}88`; // Semi-transparent
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3 + currentTime / 2000;
            const innerRadius = radius * 0.5;
            const pointX = centerX + innerRadius * Math.cos(angle);
            const pointY = centerY + innerRadius * Math.sin(angle);
            
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(pointX, pointY);
          }
          ctx.stroke();
          
          // Add sparkle effect for precious ores
          if (ore === OreTypes.GOLD || ore === OreTypes.DIAMOND) {
            const sparkleOpacity = Math.sin(currentTime / 300) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${sparkleOpacity})`;
            
            // Multiple sparkle points
            for (let i = 0; i < 3; i++) {
              const sparkleAngle = currentTime / 1000 + (i * Math.PI * 2) / 3;
              const sparkleX = centerX + radius * 0.6 * Math.cos(sparkleAngle);
              const sparkleY = centerY + radius * 0.6 * Math.sin(sparkleAngle);
              
              ctx.beginPath();
              for (let j = 0; j < 4; j++) {
                const starAngle = (j * Math.PI * 2) / 4 + currentTime / 1000;
                const starRadius = (j % 2 === 0) ? cellSize * 0.1 : cellSize * 0.05;
                const starX = sparkleX + starRadius * Math.cos(starAngle);
                const starY = sparkleY + starRadius * Math.sin(starAngle);
                
                if (j === 0) {
                  ctx.moveTo(starX, starY);
                } else {
                  ctx.lineTo(starX, starY);
                }
              }
              ctx.closePath();
              ctx.fill();
            }
          }
        }
        
        // Wall edge highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, 2);
      } else if (cell === 2) { // Exit
        const glowAmount = Math.sin(currentTime / 500) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(100, 255, 100, ${glowAmount})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (cell === 3) { // Treasure
        drawTreasure(ctx, x, y, cellSize, currentTime);
      }
    });
  });

  // Draw enemies
  enemies.forEach(enemy => {
    const screenX = enemy.x * cellSize;
    const screenY = enemy.y * cellSize;
    
    if (enemy.image && enemy.image.complete && enemy.image.naturalHeight !== 0) {
      ctx.drawImage(
        enemy.image,
        screenX + 2,
        screenY + 2,
        cellSize - 4,
        cellSize - 4
      );
    } else {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(screenX + 2, screenY + 2, cellSize - 4, cellSize - 4);
    }
  });

  // Draw player
  if (player) {
    const screenX = player.x * cellSize;
    const screenY = player.y * cellSize;

    if (playerSprite.complete) {
      ctx.drawImage(
        playerSprite,
        screenX + 2,
        screenY + 2,
        cellSize - 4,
        cellSize - 4
      );
    } else {
      // Fallback to triangle if image not loaded
      ctx.fillStyle = '#4444ff';
      ctx.beginPath();
      ctx.moveTo(screenX + cellSize/2, screenY + 4);
      ctx.lineTo(screenX + cellSize - 4, screenY + cellSize - 4);
      ctx.lineTo(screenX + 4, screenY + cellSize - 4);
      ctx.closePath();
      ctx.fill();
    }
  }
};

const drawDroppedItem = (ctx, x, y, cellSize) => {
  const itemSize = cellSize * 0.4;
  const xPos = x * cellSize + (cellSize - itemSize) / 2;
  const yPos = y * cellSize + (cellSize - itemSize) / 2;

  // Draw item glow
  ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize * 0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw item
  ctx.fillStyle = '#f6c90e';
  ctx.fillRect(xPos, yPos, itemSize, itemSize);
};