export const handleCombat = (player, enemy) => {
  // Player attacks enemy
  const damage = player.attack;
  enemy.currentHp -= damage;
  
  // Enemy counterattacks if still alive
  if (enemy.currentHp > 0) {
    player.currentHp -= enemy.attack;
  }

  // Return combat results
  return {
    isDead: enemy.currentHp <= 0,
    damage: damage,
    playerDamaged: player.currentHp <= 0
  };
}; 