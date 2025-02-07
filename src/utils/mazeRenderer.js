import { OreTypes } from './oreTypes';
import playerImage from '../assets/images/player/player.png';

// Create and load the player image
const playerSprite = new Image();
playerSprite.src = playerImage;

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
  const cellSize = 18;
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

const drawBackground = (ctx) => {
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const drawTreasure = (ctx, x, y, cellSize, currentTime) => {
  const glowAmount = Math.sin(currentTime / 1000) * 0.2 + 0.8;
  
  // Draw chest base
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(
    x * cellSize + cellSize * 0.2,
    y * cellSize + cellSize * 0.3,
    cellSize * 0.6,
    cellSize * 0.5
  );

  // Draw chest lid
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.moveTo(x * cellSize + cellSize * 0.15, y * cellSize + cellSize * 0.3);
  ctx.lineTo(x * cellSize + cellSize * 0.85, y * cellSize + cellSize * 0.3);
  ctx.lineTo(x * cellSize + cellSize * 0.7, y * cellSize + cellSize * 0.15);
  ctx.lineTo(x * cellSize + cellSize * 0.3, y * cellSize + cellSize * 0.15);
  ctx.closePath();
  ctx.fill();

  // Draw glow effect
  ctx.fillStyle = `rgba(255, 215, 0, ${glowAmount * 0.3})`;
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize * 0.5,
    y * cellSize + cellSize * 0.5,
    cellSize * 0.4,
    0,
    Math.PI * 2
  );
  ctx.fill();
};

const drawHealthBar = (ctx, x, y, cellSize, currentHp, maxHp) => {
  const barWidth = cellSize * 0.8;
  const barHeight = cellSize * 0.1;
  const barX = x * cellSize + (cellSize - barWidth) / 2;
  const barY = y * cellSize - barHeight - 2;

  // Background
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Health
  const healthWidth = (currentHp / maxHp) * barWidth;
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(barX, barY, healthWidth, barHeight);
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
          const oreSize = cellSize * 0.5;
          const margin = (cellSize - oreSize) / 2;
          
          // Draw multiple small circles for ore texture
          for (let i = 0; i < 3; i++) {
            const offsetX = Math.sin(currentTime / 1000 + i) * 2;
            const offsetY = Math.cos(currentTime / 1000 + i) * 2;
            ctx.beginPath();
            ctx.arc(
              x * cellSize + margin + oreSize/2 + offsetX,
              y * cellSize + margin + oreSize/2 + offsetY,
              oreSize/4,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          
          // Add sparkle effect for precious ores
          if (ore === OreTypes.GOLD || ore === OreTypes.DIAMOND) {
            const sparkleOpacity = Math.sin(currentTime / 300) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${sparkleOpacity})`;
            ctx.beginPath();
            ctx.arc(
              x * cellSize + cellSize/2,
              y * cellSize + cellSize/2,
              cellSize/6,
              0,
              Math.PI * 2
            );
            ctx.fill();
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

const drawPlayer = (ctx, cellSize, currentTime, player, moveAnimation, lastMoveTime, playerAngle, setMoveAnimation) => {
  let drawX = player.x;
  let drawY = player.y;
  
  if (moveAnimation) {
    const progress = (currentTime - moveAnimation.startTime) / moveAnimation.duration;
    if (progress < 1) {
      drawX = moveAnimation.startX + (moveAnimation.endX - moveAnimation.startX) * progress;
      drawY = moveAnimation.startY + (moveAnimation.endY - moveAnimation.startY) * progress;
    } else {
      setMoveAnimation(null);
    }
  }

  // Trail effect
  const timeSinceMove = currentTime - lastMoveTime;
  if (timeSinceMove < 200) {
    ctx.fillStyle = `rgba(70, 130, 180, ${0.3 * (1 - timeSinceMove / 200)})`;
    ctx.beginPath();
    ctx.arc((drawX + 0.5) * cellSize, (drawY + 0.5) * cellSize, 
            cellSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player triangle
  ctx.save();
  ctx.translate((drawX + 0.5) * cellSize, (drawY + 0.5) * cellSize);
  ctx.rotate(playerAngle * Math.PI / 180);
  
  ctx.fillStyle = '#f6c90e';
  ctx.beginPath();
  ctx.moveTo(cellSize * 0.4, 0);
  ctx.lineTo(-cellSize * 0.2, -cellSize * 0.2);
  ctx.lineTo(-cellSize * 0.2, cellSize * 0.2);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
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

const drawMiningEffect = (ctx, x, y, cellSize) => {
  const particles = [];
  const numParticles = 5;
  
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: x * cellSize + cellSize / 2,
      y: y * cellSize + cellSize / 2,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      life: 1
    });
  }
  
  return particles;
}; 