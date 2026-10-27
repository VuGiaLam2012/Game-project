export default {
  label: "Echo Mimic",
  description: "Copies the strongest nearby attacking tower at reduced power.",
  cost: 2500,
  maxLevel: 4,
  color: "#aab5c8",
  icon: "◉",
  levels: [
    { power: 0.55, range: 18 },
    { power: 0.65, range: 21 },
    { power: 0.75, range: 24 },
    { power: 0.82, range: 27 },
    { power: 0.9, range: 30 },
  ],
};
