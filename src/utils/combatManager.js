import { handleCombat } from './combatUtils';
import { Player } from './entityTypes';
import { EQUIPMENT_LIST } from './equipmentTypes';

const ATTACKS_FOR_LIMIT = 3; // Number of attacks needed for limit break

export class CombatManager {
  constructor(addFeedbackMessage, setPlayer, setDroppedItems, setEnemies) {
    this.addFeedbackMessage = addFeedbackMessage;
    this.setPlayer = setPlayer;
    this.setDroppedItems = setDroppedItems;
    this.setEnemies = setEnemies;
  }

  handleLimitBreak(player, combatEnemy, setLimitBreakReady, setAttackCount, setCombatTurn) {
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
      this.handleEnemyDeath(combatEnemy);
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
        this.handleEnemyDeath(enemy, setInCombat, setCombatEnemy);
        return; // Exit immediately if enemy is dead
      }
      
      // Only proceed with attack counter and enemy turn if enemy is still alive
      setAttackCount(prev => {
        const newCount = prev + 1;
        if (newCount >= ATTACKS_FOR_LIMIT) {
          setLimitBreakReady(true);
          this.addFeedbackMessage('Limit Break Ready!', 'limit');
        }
        return newCount;
      });
      
      setCombatTurn('enemy');
      // Automatically trigger enemy turn after a short delay
      setTimeout(() => {
        // Enemy's turn
        const damage = enemy.attack;
        player.currentHp -= damage;
        this.addFeedbackMessage(`${enemy.name} attacks! -${damage} HP`, 'damage');
        
        if (player.currentHp <= 0) {
          handlePlayerDeath();
        } else {
          setCombatTurn('player');
        }
      }, 500);
    }
  }

  handleEnemyDeath(enemy, setInCombat, setCombatEnemy) {
    this.addFeedbackMessage('Enemy defeated!', 'combat');
    
    // Remove enemy from the game
    this.setEnemies(prevEnemies => prevEnemies.filter(e => e !== enemy));
    
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
    
    // Handle item drops
    this.handleItemDrops(enemy);
    
    this.addFeedbackMessage(`Gained ${expGained} experience!`, 'info');

    // End combat
    setInCombat(false);
    setCombatEnemy(null);
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
} 