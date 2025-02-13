import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { generateMaze, moveEnemies, handleEnemyDeath } from '../../utils/mazeUtils';
import { drawMaze } from '../../utils/mazeRenderer';
import { Player, Enemy, EntityTypes } from '../../utils/entityTypes';
import { OreTypes } from '../../utils/oreTypes';
import PlayerStats from './PlayerStats';
import LevelSummary from './LevelSummary';
import FeedbackBanner from './FeedbackBanner';
import { useEnemyMovement } from '../../hooks/useEnemyMovement';
import EquipmentPanel from './EquipmentPanel';
import CraftingPanel from './CraftingPanel';
import BagPanel from './BagPanel';
import { CombatManager } from '../../utils/combatManager';
import { getAvailableRecipes } from '../../utils/craftingRecipes';
import TechTree from './TechTree';
import playerImage from '../../assets/images/player/player.png';
import { TimePressureProvider, useTimePressure } from '../../contexts/TimePressureContext';
import DangerMeter from './DangerMeter';
import { enemySpawner, useEnemySpawner } from '../../utils/enemySpawner';
import BasePanel from './BasePanel';

const GameGrid = () => {
  const [maze, setMaze] = useState(null);
  const [player, setPlayer] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [moveAnimation, setMoveAnimation] = useState(null);
  const [playerAngle, setPlayerAngle] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showLevelSummary, setShowLevelSummary] = useState(false);
  const [treasuresCollected, setTreasuresCollected] = useState(0);
  const [depth, setDepth] = useState(1);
  const [feedbackMessages, setFeedbackMessages] = useState([]);
  const [touchStart, setTouchStart] = useState(null);
  const [droppedItems, setDroppedItems] = useState(new Map());
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [gameOverReason, setGameOverReason] = useState('');
  const [inCombat, setInCombat] = useState(false);
  const [combatEnemy, setCombatEnemy] = useState(null);
  const [combatTurn, setCombatTurn] = useState('player'); // 'player' or 'enemy'
  const [attackCount, setAttackCount] = useState(0);
  const [limitBreakReady, setLimitBreakReady] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isCraftingOpen, setIsCraftingOpen] = useState(false);
  const [isTechTreeOpen, setIsTechTreeOpen] = useState(false);
  const [isBaseOpen, setIsBaseOpen] = useState(false);
  const [baseInventory, setBaseInventory] = useState({
    ores: {},      // Store ore quantities
    equipment: [], // Store equipment items
    resources: {}  // Store processed resources
  });
  const [baseLayout, setBaseLayout] = useState(null);
  const canvasRef = useRef(null);
  const movePlayerRef = useRef(null);
  const { timeRemaining, resetTime, pauseTime, resumeTime } = useTimePressure();
  const { updateSpawner } = useEnemySpawner();

  const ATTACKS_FOR_LIMIT = 3; // Number of attacks needed for limit break

  const addFeedbackMessage = (text, type) => {
    setFeedbackMessages(prev => [...prev.slice(-2), { text, type, id: Date.now() }]);
  };

  // Initialize combat manager with useMemo and proper dependencies
  const combatManager = useMemo(() => {
    const manager = new CombatManager(
      addFeedbackMessage,
      setPlayer,
      setDroppedItems,
      setEnemies
    );
    return manager;
  }, []);  // Keep empty dependency array to maintain single instance

  const handlePlayerDeath = useCallback(() => {
    setGameOverReason('death');
    setGameOver(true);
    addFeedbackMessage('You have been defeated!', 'damage');
  }, [setGameOver, setGameOverReason, addFeedbackMessage]);

  const handleLimitBreak = useCallback(() => {
    if (!limitBreakReady || !combatEnemy) return;
    combatManager.handleLimitBreak(
      player,
      combatEnemy,
      setLimitBreakReady,
      setAttackCount,
      setCombatTurn
    );
  }, [player, combatEnemy, limitBreakReady]);

  const handleCombatTurn = useCallback((enemy) => {
    combatManager.handleCombatTurn(
      player,
      enemy,
      combatTurn,
      handlePlayerDeath,
      setAttackCount,
      setLimitBreakReady,
      setCombatTurn,
      setInCombat,
      setCombatEnemy
    );
  }, [player, combatTurn, handlePlayerDeath]);

  const resetGame = () => {
    const MAZE_WIDTH = 21;
    const MAZE_HEIGHT = 21;
    
    const { maze: newMaze, enemies: newEnemies } = generateMaze(MAZE_WIDTH, MAZE_HEIGHT, player?.level || 1);
    setMaze(newMaze);
    setEnemies(newEnemies);
    
    // Initialize enemy spawn points for new maze
    enemySpawner.initializeSpawnPoints(newMaze);
    
    setPlayer(prev => {
      const newPlayer = new Player(1, 1);
      Object.assign(newPlayer, {
        ...prev,
        x: 1,
        y: 1,
        currentHp: prev.currentHp,
        maxHp: prev.maxHp,
        attack: prev.attack,
        level: prev.level,
        experience: prev.experience,
        experienceToNextLevel: prev.experienceToNextLevel,
        equipment: prev.equipment
      });
      return newPlayer;
    });
    setMoveAnimation(null);
    setDepth(prev => prev + 1);
  };

  const celebrateVictory = () => {
    setShowLevelSummary(true);
  };

  const handleContinue = () => {
    setShowLevelSummary(false);
    resetTime();
    resetGame();
  };

  const shakeScreen = () => {
    const canvas = canvasRef.current;
    canvas.style.transform = 'translateX(5px)';
    setTimeout(() => {
      canvas.style.transform = 'translateX(-5px)';
      setTimeout(() => {
        canvas.style.transform = 'translateX(0)';
      }, 50);
    }, 50);
  };

  // Animation frame effect
  useEffect(() => {
    if (!maze || !player) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    
    const animate = () => {
      const currentTime = performance.now();
      
      // Update spawner with time pressure context
      updateSpawner(currentTime, player.level);

      // Get combined enemies list (initial enemies + spawned enemies)
      const allEnemies = [...enemies, ...enemySpawner.getEnemies()];
      
      drawMaze(
        ctx, 
        maze, 
        player, 
        moveAnimation, 
        lastMoveTime, 
        playerAngle, 
        setMoveAnimation,
        allEnemies,  // Use combined enemies list
        droppedItems
      );

      // Clear move animation when complete
      if (moveAnimation) {
        const currentTime = performance.now();
        const elapsed = currentTime - moveAnimation.startTime;
        if (elapsed >= moveAnimation.duration) {
          setMoveAnimation(null);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [maze, player, moveAnimation, lastMoveTime, playerAngle, enemies, droppedItems, timeRemaining]);

  const compareEquipment = (newItem, currentItem) => {
    // Different slots should never be compared
    if (newItem.type !== currentItem.type) {
      return false; // Not a downgrade, different slots
    }

    // Compare stats for same slot items
    return Object.entries(newItem.stats).every(([stat, value]) => {
      if (!currentItem.stats[stat]) return false;
      return value <= currentItem.stats[stat];
    });
  };

  const movePlayer = useCallback((dx, dy) => {
    if (!player || !maze) return;
    if (gameOver || showLevelSummary || moveAnimation) return;

    const newX = player.x + dx;
    const newY = player.y + dy;
    
    // Check for dropped items
    const itemKey = `${newX},${newY}`;
    const droppedItem = droppedItems.get(itemKey);
    
    if (droppedItem) {
      const currentItem = player.equipment[droppedItem.type.type];
      
      // Check if this would be a downgrade
      if (currentItem && compareEquipment(droppedItem.type, currentItem)) {
        // If it's a downgrade and bag isn't full, add to bag
        if (player.bag.length < player.bagSize) {
          player.bag.push(droppedItem.type);
          addFeedbackMessage(`Added ${droppedItem.type.name} to bag`, 'collect');
          // Remove item from map
          setDroppedItems(prev => {
            const newMap = new Map(prev);
            newMap.delete(itemKey);
            return newMap;
          });
        } else {
          // If bag is full, just show message but allow movement
          addFeedbackMessage('Bag is full! Item left behind', 'warning');
        }
      } else {
        // If it's an upgrade, equip it and put old item in bag if exists
        if (currentItem && player.bag.length < player.bagSize) {
          player.bag.push(currentItem);
        }
        player.equipment[droppedItem.type.type] = droppedItem.type;
        addFeedbackMessage(`Equipped ${droppedItem.type.name}!`, 'collect');
        // Remove item from map
        setDroppedItems(prev => {
          const newMap = new Map(prev);
          newMap.delete(itemKey);
          return newMap;
        });
      }
    }

    const newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // If in combat, only allow attacking the combat enemy
    if (inCombat) {
      if (newX === combatEnemy.x && newY === combatEnemy.y && combatTurn === 'player') {
        handleCombatTurn(combatEnemy);
        setPlayerAngle(newAngle);
      }
      return;
    }

    // Get all enemies (including spawned ones)
    const allEnemies = [...enemies, ...enemySpawner.getEnemies()];

    // Regular movement and combat initiation
    const enemyAtPosition = allEnemies.find(e => e.x === newX && e.y === newY);
    if (enemyAtPosition) {
      setInCombat(true);
      setCombatEnemy(enemyAtPosition);
      setCombatTurn('player');
      handleCombatTurn(enemyAtPosition);
      setPlayerAngle(newAngle);
      return;
    }

    // Check for wall/ore interaction
    if (newX >= 0 && newX < maze[0].length && 
        newY >= 0 && newY < maze.length && 
        (maze[newY][newX] === EntityTypes.WALL || maze[newY][newX] >= 10)) {
      
      if (player.hasPickaxeEquipped()) {
        const cellType = maze[newY][newX];
        const ore = Object.values(OreTypes).find(o => o.id === cellType);
        if (ore) {
          addFeedbackMessage(`Collected ${ore.name}!`, 'collect');
          setPlayer(prev => {
            const newPlayer = new Player(prev.x, prev.y);
            Object.assign(newPlayer, {
              ...prev,
              currentHp: prev.currentHp,
              maxHp: prev.maxHp,
              attack: prev.attack,
              level: prev.level,
              experience: prev.experience,
              experienceToNextLevel: prev.experienceToNextLevel,
              equipment: prev.equipment,
              inventory: prev.inventory
            });
            newPlayer.collectOre(ore);
            return newPlayer;
          });
        }
        maze[newY][newX] = 0;
        setPlayerAngle(newAngle);
        return;
      } else {
        addFeedbackMessage("Need a pickaxe!", 'damage');
        shakeScreen();
        return;
      }
    }

    // Check for valid movement
    if (newX >= 0 && newX < maze[0].length && 
        newY >= 0 && newY < maze.length && 
        maze[newY][newX] !== EntityTypes.WALL) {
      
      // Handle player reaching exit - check specifically for player entity
      if (maze[newY][newX] === EntityTypes.EXIT && player.type === EntityTypes.PLAYER) {
        setShowLevelSummary(true);
        return;
      }

      // Check for treasure
      if (maze[newY][newX] === EntityTypes.TREASURE) {
        const healChance = 0.4; // 40% chance to get healing
        if (Math.random() < healChance && player.currentHp < player.maxHp) {
          const healAmount = Math.floor(player.maxHp * 0.3); // Heal 30% of max HP
          player.currentHp = Math.min(player.maxHp, player.currentHp + healAmount);
          addFeedbackMessage(`Found healing potion! +${healAmount} HP`, 'heal');
        } else {
          setTreasuresCollected(prev => prev + 1);
          addFeedbackMessage('Found treasure!', 'collect');
        }
        maze[newY][newX] = 0;
      }

      const currentTime = performance.now();
      setMoveAnimation({
        startX: player.x,
        startY: player.y,
        endX: newX,
        endY: newY,
        startTime: currentTime,
        duration: 150
      });
      setLastMoveTime(currentTime);
      
      setPlayerAngle(newAngle);
      setPlayer(prev => {
        const newPlayer = new Player(newX, newY);
        Object.assign(newPlayer, {
          ...prev,
          x: newX,
          y: newY,
          currentHp: prev.currentHp,
          maxHp: prev.maxHp,
          attack: prev.attack,
          level: prev.level,
          experience: prev.experience,
          experienceToNextLevel: prev.experienceToNextLevel,
          equipment: prev.equipment,
          inventory: prev.inventory
        });
        return newPlayer;
      });
      
      if (maze[newY][newX] === EntityTypes.EXIT) {
        celebrateVictory();
      }

      // Check for adjacent enemy (including spawned ones)
      const adjacentEnemy = allEnemies.find(enemy => 
        Math.abs(enemy.x - (player.x + dx)) + Math.abs(enemy.y - (player.y + dy)) === 0
      );

      if (adjacentEnemy) {
        setCurrentEnemy(adjacentEnemy);
      } else {
        setCurrentEnemy(null);
      }
    } else {
      shakeScreen();
    }
  }, [
    player, 
    maze, 
    gameOver, 
    showLevelSummary, 
    moveAnimation, 
    enemies, 
    inCombat, 
    combatEnemy, 
    combatTurn, 
    handleCombatTurn,
    droppedItems,
    addFeedbackMessage
  ]);

  // Auto-trigger enemy turns
  useEffect(() => {
    if (inCombat && combatTurn === 'enemy' && combatEnemy) {
      const timer = setTimeout(() => {
        handleCombatTurn(combatEnemy);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [inCombat, combatTurn, combatEnemy, handleCombatTurn]);

  // Disable normal enemy movement during combat
  useEnemyMovement(
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
    combatManager  // Pass the memoized combat manager
  );

  // Set movePlayerRef.current to the movePlayer function
  useEffect(() => {
    movePlayerRef.current = movePlayer;
  }, [movePlayer]);

  // Keyboard handler using movePlayerRef
  const handleKeyDown = useCallback((e) => {
    if (!player) return;
    if (moveAnimation) return; // Only block during active animation

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        movePlayerRef.current(0, -1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        movePlayerRef.current(0, 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        movePlayerRef.current(-1, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        movePlayerRef.current(1, 0);
        break;
      default:
        break;
    }
  }, [player, moveAnimation]);

  // Set up keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Initialize game state
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Define constant maze dimensions
    const MAZE_WIDTH = 21;
    const MAZE_HEIGHT = 21;
    const CELL_SIZE = 32;

    // Set fixed canvas size
    canvas.width = MAZE_WIDTH * CELL_SIZE;
    canvas.height = MAZE_HEIGHT * CELL_SIZE;

    const { maze: newMaze, enemies: newEnemies } = generateMaze(MAZE_WIDTH, MAZE_HEIGHT);
    setMaze(newMaze);
    setEnemies(newEnemies);
    
    // Initialize player with starting position and stats
    const initialPlayer = new Player(1, 1);
    initialPlayer.currentHp = initialPlayer.maxHp;
    setPlayer(initialPlayer);

    // Initialize enemy spawn points
    enemySpawner.initializeSpawnPoints(newMaze);
  }, []); 

  // Update the effects to pause/resume the timer
  useEffect(() => {
    if (gameOver || showLevelSummary) {
      pauseTime();
    } else {
      resumeTime();
    }
  }, [gameOver, showLevelSummary, pauseTime, resumeTime]);

  // Add effect to check time pressure
  useEffect(() => {
    if (timeRemaining <= 0 && !gameOver && !showLevelSummary) {
      setGameOverReason('time');
      setGameOver(true);
      addFeedbackMessage('Time has run out!', 'damage');
    }
  }, [timeRemaining, gameOver, showLevelSummary]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 50) {
        movePlayer(1, 0); // Right
      } else if (deltaX < -50) {
        movePlayer(-1, 0); // Left
      }
    } else {
      // Vertical swipe
      if (deltaY > 50) {
        movePlayer(0, 1); // Down
      } else if (deltaY < -50) {
        movePlayer(0, -1); // Up
      }
    }
    
    setTouchStart(null);
  };

  const handleCraft = (recipe) => {
    const craftedItem = {
      name: recipe.name,
      type: recipe.type,
      stats: recipe.stats
    };

    setPlayer(prev => {
      const newPlayer = new Player(prev.x, prev.y);
      Object.assign(newPlayer, { ...prev });

      const currentItem = prev.equipment[recipe.type];
      
      if (currentItem && compareEquipment(craftedItem, currentItem)) {
        addFeedbackMessage(
          `Cannot equip ${recipe.name} - Current ${currentItem.name} has better stats!`,
          'warning'
        );
        return newPlayer;
      }

      newPlayer.equipment[recipe.type] = craftedItem;
      addFeedbackMessage(`Crafted and equipped ${recipe.name}!`, 'collect');
      
      return newPlayer;
    });
  };

  // Check if there are items in the bag
  const hasBagItems = player && player.bag.length > 0;
  
  // Check if any recipes are available to craft
  const hasAvailableRecipes = player && getAvailableRecipes(player.inventory, player)
    .some(recipe => recipe.status?.canCraft);

  // Add near other button handlers
  const handleBaseStorage = (itemType, item) => {
    setBaseInventory(prev => {
      const newInventory = { ...prev };
      
      switch (itemType) {
        case 'ore':
          // Store ores
          newInventory.ores[item.name] = (newInventory.ores[item.name] || 0) + 1;
          
          // Remove from player inventory
          setPlayer(prevPlayer => {
            const newPlayer = new Player(prevPlayer.x, prevPlayer.y);
            Object.assign(newPlayer, { ...prevPlayer });
            newPlayer.inventory[item.name]--;
            return newPlayer;
          });
          break;

        case 'equipment':
          // Store equipment
          newInventory.equipment.push(item);
          
          // Remove from player bag
          setPlayer(prevPlayer => {
            const newPlayer = new Player(prevPlayer.x, prevPlayer.y);
            Object.assign(newPlayer, { ...prevPlayer });
            newPlayer.bag = newPlayer.bag.filter(bagItem => bagItem !== item);
            return newPlayer;
          });
          break;

        default:
          break;
      }
      
      return newInventory;
    });
    
    addFeedbackMessage(`Stored ${item.name} in base`, 'collect');
  };

  const handleRetrieveFromBase = (itemType, item) => {
    setBaseInventory(prev => {
      const newInventory = { ...prev };
      
      switch (itemType) {
        case 'ore':
          // Remove ore from base
          newInventory.ores[item.name]--;
          if (newInventory.ores[item.name] <= 0) {
            delete newInventory.ores[item.name];
          }
          
          // Add to player inventory
          setPlayer(prevPlayer => {
            const newPlayer = new Player(prevPlayer.x, prevPlayer.y);
            Object.assign(newPlayer, { ...prevPlayer });
            newPlayer.inventory[item.name] = (newPlayer.inventory[item.name] || 0) + 1;
            return newPlayer;
          });
          break;

        case 'equipment':
          // Remove equipment from base
          newInventory.equipment = newInventory.equipment.filter(e => e !== item);
          
          // Add to player bag if there's space
          setPlayer(prevPlayer => {
            const newPlayer = new Player(prevPlayer.x, prevPlayer.y);
            Object.assign(newPlayer, { ...prevPlayer });
            if (newPlayer.bag.length < newPlayer.bagSize) {
              newPlayer.bag.push(item);
              addFeedbackMessage(`Retrieved ${item.name} from base`, 'collect');
            } else {
              addFeedbackMessage('Bag is full!', 'warning');
            }
            return newPlayer;
          });
          break;

        default:
          break;
      }
      
      return newInventory;
    });
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      padding: '20px',
      backgroundColor: '#16213e',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }}>
      <PlayerStats 
        player={player} 
        treasuresCollected={treasuresCollected}
        depth={depth}
      />
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginBottom: '20px'
        }}>
          <h1 style={{
            color: '#fff',
            fontSize: '28px',
            margin: '0',
            fontWeight: 'bold',
            textShadow: '0 0 10px rgba(255,255,255,0.3)',
            letterSpacing: '2px'
          }}>
            Dungeon Hero
          </h1>
          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            <button
              onClick={() => player && setIsBagOpen(!isBagOpen)}
              style={{
                background: isBagOpen ? '#30475e' : 'rgba(20, 20, 30, 0.9)',
                border: `2px solid ${isBagOpen ? '#4a6b8f' : '#30475e'}`,
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              Bag
              {hasBagItems && (
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ff4444',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: '2px solid rgba(20, 20, 30, 0.9)'
                }}/>
              )}
              <span style={{ 
                marginLeft: '5px', 
                fontSize: '14px', 
                color: '#aaa' 
              }}>
                ({player?.bag.length || 0}/{player?.bagSize || 0})
              </span>
            </button>
            <button
              onClick={() => setIsCraftingOpen(!isCraftingOpen)}
              style={{
                background: isCraftingOpen ? '#30475e' : 'rgba(20, 20, 30, 0.9)',
                border: `2px solid ${isCraftingOpen ? '#4a6b8f' : '#30475e'}`,
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              Craft
              {hasAvailableRecipes && (
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#4caf50',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: '2px solid rgba(20, 20, 30, 0.9)'
                }}/>
              )}
            </button>
            <button
              onClick={() => setIsTechTreeOpen(!isTechTreeOpen)}
              style={{
                background: isTechTreeOpen ? '#30475e' : 'rgba(20, 20, 30, 0.9)',
                border: `2px solid ${isTechTreeOpen ? '#4a6b8f' : '#30475e'}`,
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              Tech
              {player?.techPoints > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#2196f3',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: '2px solid rgba(20, 20, 30, 0.9)'
                }}/>
              )}
              <span style={{ 
                marginLeft: '5px', 
                fontSize: '14px', 
                color: '#aaa' 
              }}>
                ({player?.techPoints || 0})
              </span>
            </button>
            <button
              onClick={() => setIsBaseOpen(!isBaseOpen)}
              style={{
                background: isBaseOpen ? '#30475e' : 'rgba(20, 20, 30, 0.9)',
                border: `2px solid ${isBaseOpen ? '#4a6b8f' : '#30475e'}`,
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
            >
              Base
            </button>
          </div>
        </div>
        
        <canvas 
          ref={canvasRef} 
          style={{ 
            border: '1px solid #30475e',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            marginBottom: '10px',
            position: 'relative'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        {/* Move DangerMeter here, after the canvas */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px',
          marginBottom: '10px'
        }}>
          <DangerMeter />
        </div>

        <FeedbackBanner 
          messages={feedbackMessages} 
          currentEnemy={currentEnemy}
        />

        {inCombat && combatEnemy && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: '20px',
            borderRadius: '12px',
            color: '#fff',
            textAlign: 'center',
            minWidth: '400px',
            border: '2px solid #444',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            zIndex: 1000
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              {/* Enemy info with image */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  border: '2px solid #666',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#222'
                }}>
                  {combatEnemy.image ? (
                  <img 
                      src={combatEnemy.image.src} 
                      alt={combatEnemy.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                  />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: combatEnemy.color
                    }} />
                  )}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {combatEnemy.name}
                  </div>
                <div>
                    HP: {combatEnemy.currentHp}/{combatEnemy.maxHp}
                  <div style={{
                      width: '100px',
                      height: '8px',
                      backgroundColor: '#333',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginTop: '4px'
                    }}>
                      <div style={{
                        width: `${(combatEnemy.currentHp / combatEnemy.maxHp) * 100}%`,
                        height: '100%',
                    backgroundColor: '#ff4444',
                        transition: 'width 0.3s'
                      }}/>
                </div>
              </div>
            </div>
              </div>

              {/* Player info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    Player
                  </div>
                  <div>
                    HP: {player?.currentHp}/{player?.maxHp}
                    <div style={{
                      width: '100px',
                      height: '8px',
                      backgroundColor: '#333',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(player?.currentHp / player?.maxHp) * 100}%`,
                        height: '100%',
                        backgroundColor: '#44ff44',
                        transition: 'width 0.3s'
                      }}/>
                    </div>
                  </div>
                  <div>Attack: {player?.attack}</div>
                </div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  border: '2px solid #666',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#222'
                }}>
                  {playerImage ? (
                    <img 
                      src={playerImage} 
                      alt="Player"
                style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#4444ff'
                    }} />
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              {combatTurn === 'player' ? 
                'Your turn - Move into enemy to attack' : 
                'Enemy turn...'}
            </div>

            {/* Combat buttons - Only show Limit Break when available */}
            {combatTurn === 'player' && limitBreakReady && (
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'center',
                marginTop: '10px' 
              }}>
              <button
                onClick={handleLimitBreak}
                style={{
                    backgroundColor: '#ff0000',
                    color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                    padding: '8px 16px',
                  cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    animation: 'pulse 1s infinite',
                    textTransform: 'uppercase'
                }}
              >
                Limit Break!
              </button>
              </div>
            )}
            
            {/* Attack counter display */}
            <div style={{
              marginTop: '5px',
              fontSize: '12px',
              color: '#aaa'
            }}>
              Attacks: {attackCount}/{ATTACKS_FOR_LIMIT}
            </div>
          </div>
        )}

        {isBagOpen && player && (
          <BagPanel 
            player={player} 
            onClose={() => setIsBagOpen(false)}
          />
        )}

        {isCraftingOpen && player && (
          <CraftingPanel 
            player={player} 
            onClose={() => setIsCraftingOpen(false)}
          />
        )}

        {isTechTreeOpen && player && (
          <TechTree 
            player={player} 
            onClose={() => setIsTechTreeOpen(false)}
          />
        )}

        {isBaseOpen && (
          <BasePanel
            baseInventory={baseInventory}
            onStore={handleBaseStorage}
            onRetrieve={handleRetrieveFromBase}
            player={player}
            onClose={() => setIsBaseOpen(false)}
            baseLayout={baseLayout}
            setBaseLayout={setBaseLayout}
          />
        )}
      </div>
      <EquipmentPanel player={player} />
      {showLevelSummary && (
        <LevelSummary 
          treasuresCollected={treasuresCollected}
          depth={depth}
          timeRemaining={timeRemaining}
          onContinue={handleContinue}
        />
      )}
      {gameOver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          fontSize: '32px',
          zIndex: 1000
        }}>
          <h2>Game Over!</h2>
          <p style={{ 
            fontSize: '24px',
            color: gameOverReason === 'death' ? '#ff4444' : '#ffffff',
            textShadow: '0 0 10px rgba(255,0,0,0.3)',
            marginBottom: '20px'
          }}>
            {gameOverReason === 'death' 
              ? 'You have been defeated!' 
              : 'Time ran out!'}
          </p>
          <div style={{ 
            fontSize: '20px',
            color: '#aaaaaa',
            marginBottom: '30px'
          }}>
            Depth reached: {depth}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '15px 30px',
              fontSize: '20px',
              backgroundColor: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px',
              transition: 'background-color 0.2s'
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

// Wrap the export with TimePressureProvider
const WrappedGameGrid = () => (
  <TimePressureProvider>
    <GameGrid />
  </TimePressureProvider>
);

export default WrappedGameGrid;
