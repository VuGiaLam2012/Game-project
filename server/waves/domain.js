const wave = (...entries) => entries.map(([type, count]) => ({ type, count }));
const repeat = (from, to, entries) => Array.from({ length: to - from + 1 }, () => wave(...entries));

export default [
  ...repeat(1, 5, [["domainCurse", 25]]),
  ...repeat(6, 10, [["specialGradeElite", 20]]),
  ...repeat(11, 15, [["domainCurse", 25], ["domainGuard", 10]]),
  ...repeat(16, 20, [["domainGuard", 20]]),
  ...repeat(21, 24, [["domainGeneral", 15]]),
  wave(["domainMasterBoss", 1]),
];
