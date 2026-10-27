const wave = (...entries) => entries.map(([type, count]) => ({ type, count }));
const repeat = (from, to, entries) => Array.from({ length: to - from + 1 }, () => wave(...entries));

export default [
  ...repeat(1, 5, [["eliteGrade1", 30]]),
  ...repeat(6, 10, [["eliteHidden", 30], ["armored", 20]]),
  ...repeat(11, 15, [["eliteSplitter", 25]]),
  ...repeat(16, 20, [["eliteDisaster", 20], ["medic", 20]]),
  ...repeat(21, 24, [["specialGradeElite", 10]]),
  wave(["wraithConjurerBoss", 1]),
];
