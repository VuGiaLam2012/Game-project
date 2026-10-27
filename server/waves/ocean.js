const wave = (...entries) => entries.map(([type, count]) => ({ type, count }));
const repeat = (from, to, entries) => Array.from({ length: to - from + 1 }, () => wave(...entries));

export default [
  ...repeat(1, 5, [["oceanCurse", 40], ["healerSpirit", 15]]),
  ...repeat(6, 10, [["oceanBrute", 25], ["healerSpirit", 20]]),
  ...repeat(11, 15, [["oceanCurse", 50], ["hidden", 20]]),
  ...repeat(16, 20, [["leviathanSpawn", 15]]),
  ...repeat(21, 24, [["deepSeaGuard", 20]]),
  wave(["oceanSpiritBoss", 1]),
];
