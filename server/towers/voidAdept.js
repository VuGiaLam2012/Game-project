export default {
  label: "Void Adept",
  description: "Long-range energy shots and three powerful techniques.",
  cost: 1500,
  rarity: "Mythic",
  maxLevel: 4,
  color: "#8b8ce8",
  icon: "✦",
  levels: [
    { damage: 100, cooldown: 3, range: 25 },
    { damage: 200, cooldown: 2.8, range: 27 },
    { damage: 400, cooldown: 2.5, range: 30 },
    { damage: 850, cooldown: 2.4, range: 35 },
    { damage: 2000, cooldown: 2.2, range: 40 },
  ],
  abilities: {
    pull: { label: "Blue", cooldown: 18, range: 32, radius: 15, damage: 400 },
    blast: { label: "Red", cooldown: 24, range: 32, radius: 13, damage: 900, stun: 1.3 },
    nuke: { label: "Purple", cooldown: 120, range: 50, radius: 50, damage: 50000 },
  },
};
