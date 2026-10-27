export default {
  label: "Spirit Binder",
  description: "Summons a growing swarm of spirits to attack together.",
  cost: 1800,
  maxLevel: 4,
  color: "#76b992",
  icon: "☷",
  levels: [
    { spiritCount: 2, damage: 250, cooldown: 1, range: 20 },
    { spiritCount: 4, damage: 250, cooldown: 1, range: 22 },
    { spiritCount: 8, damage: 250, cooldown: 1, range: 24 },
    { spiritCount: 12, damage: 250, cooldown: 1, range: 26 },
    { spiritCount: 20, damage: 250, cooldown: 1, range: 28 },
  ],
};
