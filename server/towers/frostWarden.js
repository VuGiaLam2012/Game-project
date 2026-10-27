export default {
  label: "Frost Warden",
  description: "Chilling attacks slow enemies and freeze them at high level.",
  cost: 1200,
  color: "#6fc6e5",
  icon: "❄",
  levels: [
    { damage: 10, slow: 0.25, cooldown: 1, range: 18, freezeDuration: 0 },
    { damage: 80, slow: 0.35, cooldown: 0.95, range: 20, freezeDuration: 0 },
    { damage: 180, slow: 0.45, cooldown: 0.9, range: 23, freezeDuration: 0.5 },
    { damage: 320, slow: 0.6, cooldown: 0.85, range: 27, freezeDuration: 1 },
    { damage: 480, slow: 0.7, cooldown: 0.8, range: 30, freezeDuration: 2 },
  ],
  maxLevel: 4,
  slowDuration: 2,
};
