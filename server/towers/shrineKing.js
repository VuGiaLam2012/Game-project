export default {
  label: "Shrine Sovereign",
  description: "Secret unit: devastating strikes and a periodic shrine attack.",
  cost: 10000,
  rarity: "Mythic",
  maxLevel: 4,
  color: "#d77c75",
  icon: "卍",
  levels: [
    { damage: 5000, cooldown: 3, range: 35 },
    { damage: 10000, cooldown: 2.8, range: 38 },
    { damage: 20000, cooldown: 2.5, range: 40 },
    { damage: 50000, cooldown: 2.3, range: 45 },
    { damage: 100000, cooldown: 2, range: 50 },
  ],
  shrine: { cooldown: 20, damage: 500000, radius: 30 },
};
