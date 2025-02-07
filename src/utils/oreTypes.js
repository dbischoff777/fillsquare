export const OreTypes = {
  STONE: { id: 10, color: '#808080', name: 'Stone', rarity: 1 },
  COAL: { id: 11, color: '#36454F', name: 'Coal', rarity: 0.8 },
  COPPER: { id: 12, color: '#B87333', name: 'Copper', rarity: 0.7 },
  IRON: { id: 13, color: '#a19d94', name: 'Iron', rarity: 0.5 },
  GOLD: { id: 14, color: '#FFD700', name: 'Gold', rarity: 0.3 },
  DIAMOND: { id: 15, color: '#B9F2FF', name: 'Diamond', rarity: 0.1 }
};

export const generateOreWall = () => {
  const random = Math.random();
  if (random > 0.8) { // 20% chance for ore
    if (random > 0.98) return OreTypes.DIAMOND;
    if (random > 0.95) return OreTypes.GOLD;
    if (random > 0.90) return OreTypes.IRON;
    if (random > 0.85) return OreTypes.COPPER;
    if (random > 0.82) return OreTypes.COAL;
    return OreTypes.STONE;
  }
  return null;
}; 