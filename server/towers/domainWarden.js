export default {
  label: "Domain Warden",
  description: "Amplifies nearby towers and can unleash a short domain.",
  cost: 4000,
  maxLevel: 4,
  color: "#c197e8",
  icon: "◎",
  levels: [
    { damageBuff: 0.1, rangeBuff: 0.1, range: 16 },
    { damageBuff: 0.2, rangeBuff: 0.15, range: 19 },
    { damageBuff: 0.3, rangeBuff: 0.2, range: 22 },
    { damageBuff: 0.5, rangeBuff: 0.3, range: 27 },
    { damageBuff: 0.75, rangeBuff: 0.4, range: 32 },
  ],
  ultimate: { label: "Domain", cooldown: 90, duration: 15, damageMultiplier: 2, radius: 28 },
};
