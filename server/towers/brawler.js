export default {
  label: "Street Brawler",
  description: "Close-range strikes with a chance to land a critical combo.",
  cost: 500,
  maxLevel: 4,
  color: "#e7b85b",
  icon: "拳",
  levels: [
    { damage: 150, cooldown: 0.8, range: 12 },
    { damage: 250, cooldown: 0.8, range: 13 },
    { damage: 400, cooldown: 0.7, range: 14 },
    { damage: 700, cooldown: 0.6, range: 15 },
    { damage: 1200, cooldown: 0.5, range: 16 },
  ],
  criticalChance: 0.05,
  criticalMultiplier: 4,
};
