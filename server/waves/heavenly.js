const wave = (...entries) => entries.map(([type, count]) => ({ type, count }));
const repeat = (from, to, entries) => Array.from({ length: to - from + 1 }, () => wave(...entries));

export default [
  ...repeat(1, 5, [["assassinCurse", 30]]),
  ...repeat(6, 10, [["assassinElite", 25]]),
  ...repeat(11, 15, [["hiddenAssassin", 30]]),
  ...repeat(16, 20, [["heavenlySoldier", 20]]),
  ...repeat(21, 24, [["heavenlyCaptain", 15]]),
  wave(["skyboundDuelistBoss", 1]),
];
