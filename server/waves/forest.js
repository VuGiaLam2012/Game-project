const wave = (...entries) => entries.map(([type, count]) => ({ type, count }));
const repeat = (from, to, entries) => Array.from({ length: to - from + 1 }, () => wave(...entries));

export default [
  ...repeat(1, 5, [["natureCurse", 50]]),
  ...repeat(6, 10, [["treeGuardian", 20], ["natureCurse", 60]]),
  ...repeat(11, 15, [["curseWolf", 40], ["curseBird", 40]]),
  ...repeat(16, 20, [["elderTree", 15]]),
  ...repeat(21, 24, [["ancientGuardian", 15]]),
  wave(["forestSpiritBoss", 1]),
];
