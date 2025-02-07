import { handleCombat } from './combatUtils';
import { Player } from './entityTypes';
import { EQUIPMENT_LIST } from './equipmentTypes';
import { enemySpawner } from './enemySpawner';

const ATTACKS_FOR_LIMIT = 3; // Number of attacks needed for limit break

export class CombatManager {
  constructor(addFeedbackMessage, setPlayer, setDroppedItems, setEnemies) {
    this.addFeedbackMessage = addFeedbackMessage;
    this.setPlayer = setPlayer;
    this.setDroppedItems = setDroppedItems;
    this.setEnemies = setEnemies;
    
    // Debug check
    console.log('CombatManager initialized with setEnemies:', typeof this.setEnemies);
  }

  handleLimitBreak(player, combatEnemy, setLimitBreakReady, setAttackCount, setCombatTurn, setInCombat, setCombatEnemy) {
    if (!combatEnemy) return;

    // Deal massive damage (3x normal damage + level bonus)
    const baseDamage = player.attack * 3;
    const levelBonus = player.level * 2;
    const totalDamage = baseDamage + levelBonus;
    
    combatEnemy.currentHp -= totalDamage;
    this.addFeedbackMessage(`LIMIT BREAK! Dealt ${totalDamage} damage!`, 'limit');
    
    // Reset limit break
    setLimitBreakReady(false);
    setAttackCount(0);
    
    // Check if enemy died
    if (combatEnemy.currentHp <= 0) {
      this.handleEnemyDeath(combatEnemy, setInCombat, setCombatEnemy, setAttackCount, setLimitBreakReady);
    } else {
      setCombatTurn('enemy');
    }
  }

  handleCombatTurn(player, enemy, combatTurn, handlePlayerDeath, setAttackCount, setLimitBreakReady, setCombatTurn, setInCombat, setCombatEnemy) {
    if (combatTurn === 'player') {
      // Player's turn
      const { isDead, damage } = handleCombat(player, enemy);
      this.addFeedbackMessage(`You attack! Dealt ${damage} damage!`, 'combat');
      
      if (isDead) {
        this.handleEnemyDeath(enemy, setInCombat, setCombatEnemy, setAttackCount, setLimitBreakReady);
        return;
      }
      
      setAttackCount(prev => {
        const newCount = prev + 1;
        if (newCount >= ATTACKS_FOR_LIMIT) {
          setLimitBreakReady(true);
          this.addFeedbackMessage('Limit Break Ready!', 'limit');
        }
        return newCount;
      });
      
      setCombatTurn('enemy');
    } else if (combatTurn === 'enemy') {
      // Enemy's turn
      const damage = enemy.attack;
      player.currentHp -= damage;
      this.addFeedbackMessage(`${enemy.name} attacks! -${damage} HP`, 'damage');
      
      // Check for player death first
      if (player.currentHp <= 0) {
        player.currentHp = 0;
        handlePlayerDeath();
        setInCombat(false);
        setCombatEnemy(null);
        return;
      }
      
      // Player's counter-attack
      const { isDead: enemyDied, damage: counterDamage } = handleCombat(player, enemy);
      this.addFeedbackMessage(`You counter-attack! Dealt ${counterDamage} damage!`, 'combat');
      
      if (enemyDied) {
        this.handleEnemyDeath(enemy, setInCombat, setCombatEnemy, setAttackCount, setLimitBreakReady);
        return;
      }
      
      // If both survive, switch to player's turn
      setCombatTurn('player');
    }
  }

  handleEnemyDeath(enemy, setInCombat, setCombatEnemy, setAttackCount, setLimitBreakReady) {
    console.log('=== Enemy Death Debug ===');
    console.log('Enemy being removed:', enemy);
    console.log('setEnemies function:', this.setEnemies);
    
    if (typeof this.setEnemies !== 'function') {
      console.error('setEnemies is not a function!');
      return;
    }
    
    this.addFeedbackMessage('Enemy defeated!', 'combat');
    
    // Remove enemy from appropriate list
    this.setEnemies(prevEnemies => {
      console.log('Previous enemies:', prevEnemies);
      // Check if it's a spawned enemy
      const isSpawnedEnemy = enemySpawner.getEnemies().find(e => 
        e === enemy  // Direct reference comparison instead of coordinate comparison
      );
      
      if (isSpawnedEnemy) {
        // Remove from spawner
        enemySpawner.removeEnemy(enemy);
        return prevEnemies; // Return unchanged list
      } else {
        // Remove from regular enemies
        const newEnemies = prevEnemies.filter(e => e !== enemy);
        console.log('Filtered enemies:', newEnemies);
        return newEnemies;
      }
    });
    
    // Handle experience gain
    const expGained = 50 * enemy.level;
    this.setPlayer(prev => {
      const newPlayer = new Player(prev.x, prev.y);
      Object.assign(newPlayer, {
        ...prev,
        experience: prev.experience + expGained
      });
      
      if (newPlayer.experience >= newPlayer.experienceToNextLevel) {
        this.addFeedbackMessage('Level Up!', 'level');
        newPlayer.levelUp();
      }
      
      return newPlayer;
    });
    
    // Process enemy drops
    if (enemy.type?.drops) {
      enemy.type.drops.forEach(drop => {
        if (Math.random() < drop.chance) {
          this.setPlayer(prev => {
            const newPlayer = new Player(prev.x, prev.y);
            Object.assign(newPlayer, { ...prev });
            newPlayer.inventory[drop.type] = (newPlayer.inventory[drop.type] || 0) + drop.amount;
            this.addFeedbackMessage(`Found ${drop.amount} ${drop.type}!`, 'collect');
            return newPlayer;
          });
        }
      });
    }
    
    // Handle equipment drops
    this.handleItemDrops(enemy);
    
    this.addFeedbackMessage(`Gained ${expGained} experience!`, 'info');

    // Reset combat states with debug logging
    console.log('Resetting combat states');
    setInCombat(false);
    setCombatEnemy(null);
    setAttackCount(0);
    setLimitBreakReady(false);
    console.log('=== End Enemy Death Debug ===');
  }

  handleItemDrops(enemy) {
    const dropChance = 0.3 + (enemy.level * 0.05); // Base 30% + 5% per enemy level
    if (Math.random() < dropChance) {
      // Get all available equipment
      const possibleDrops = Object.values(EQUIPMENT_LIST);
      
      // Filter equipment based on enemy level
      let eligibleDrops;
      if (enemy.level >= 8) {
        eligibleDrops = possibleDrops;
      } else if (enemy.level >= 5) {
        eligibleDrops = possibleDrops.filter(item => 
          item.stats.defense <= 2 || item.stats.attack <= 2
        );
      } else {
        eligibleDrops = possibleDrops.filter(item => 
          item.stats.defense <= 1 || item.stats.attack <= 1
        );
      }
      
      const droppedItem = eligibleDrops[Math.floor(Math.random() * eligibleDrops.length)];
      
      // Add item to dropped items map
      this.setDroppedItems(prev => {
        const newMap = new Map(prev);
        const key = `${enemy.x},${enemy.y}`;
        newMap.set(key, {
          type: droppedItem,
          x: enemy.x,
          y: enemy.y
        });
        return newMap;
      });
      
      this.addFeedbackMessage(`Enemy dropped ${droppedItem.name}!`, 'collect');
    }
  }

  handleEscape(player, combatEnemy, handlePlayerDeath, setInCombat, setCombatEnemy, setCombatTurn) {
    // 50% chance to escape successfully
    if (Math.random() < 0.5) {
      this.addFeedbackMessage('Escaped successfully!', 'info');
      setInCombat(false);
      setCombatEnemy(null);
      setCombatTurn('player');
    } else {
      this.addFeedbackMessage('Failed to escape!', 'damage');
      // Enemy gets a free attack
      if (combatEnemy) {
        const damage = combatEnemy.attack;
        player.currentHp -= damage;
        this.addFeedbackMessage(`${combatEnemy.name} attacks! -${damage} HP`, 'damage');
        
        if (player.currentHp <= 0) {
          handlePlayerDeath();
        }
      }
    }
  }

  checkEnemyCollision(player, enemy, setInCombat, setCombatEnemy, setCombatTurn) {
    // Get all enemies (including spawned ones)
    const allEnemies = [...(enemy ? [enemy] : []), ...enemySpawner.getEnemies()];
    
    // Check collision with any enemy
    const collidedEnemy = allEnemies.find(e => 
      e.x === player.x && e.y === player.y
    );

    if (collidedEnemy) {
      this.addFeedbackMessage(`${collidedEnemy.name} attacks you!`, 'damage');
      setInCombat(true);
      setCombatEnemy(collidedEnemy);
      setCombatTurn('enemy'); // Combat starts with enemy turn since they initiated
    }
  }
} 