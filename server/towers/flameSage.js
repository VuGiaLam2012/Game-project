export default {
  label: "Flame Sage",
  description: "Burning attacks that scorch enemies over time.",
  cost: 1000,
  color: "#ef7954",
  icon: "♨",
  levels: [
    { damage: 50, burnDamage: 15, cooldown: 1.5, range: 14 },
    { damage: 150, burnDamage: 35, cooldown: 1.4, range: 16 },
    { damage: 250, burnDamage: 60, cooldown: 1.3, range: 18 },
    { damage: 375, burnDamage: 90, cooldown: 1.2, range: 20 },
    { damage: 500, burnDamage: 120, cooldown: 1.1, range: 22 },
  ],
  maxLevel: 4,
  burnDuration: 3,
  splashRadius: 8,
};
