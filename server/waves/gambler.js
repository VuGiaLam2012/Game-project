const wave = (...entries) => entries.map(([type, count]) => ({ type, count }));
const repeat = (from, to, entries) => Array.from({ length: to - from + 1 }, () => wave(...entries));

export default [
  ...repeat(1, 5, [["hidden", 20], ["armored", 20]]),
  ...repeat(6, 10, [["casinoCurse", 25], ["armored", 25]]),
  ...repeat(11, 15, [["disaster", 20], ["mimic", 10]]),
  ...repeat(16, 20, [["hidden", 25], ["casinoCurse", 20], ["luckyCurse", 5]]),
  ...repeat(21, 24, [["jackpotSpirit", 5], ["disaster", 20], ["mimic", 15]]),
  wave(["gamblerSupremeBoss", 1]),
];
