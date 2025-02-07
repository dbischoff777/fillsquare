export const handleCombat = (attacker, defender) => {
  const damage = attacker.attack;
  // Ensure HP doesn't go below 0
  defender.currentHp = Math.max(0, defender.currentHp - damage);
  
  const isDead = defender.currentHp <= 0;
  
  return {
    isDead,
    damage
  };
}; 