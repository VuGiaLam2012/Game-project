const wave = (...entries) => entries.map(([type, count]) => ({ type, count }));
const repeat = (from, to, entries) => Array.from({ length: to - from + 1 }, () => wave(...entries));

export default [
  ...repeat(1, 5, [["grade3", 30], ["runner", 20]]),
  ...repeat(6, 10, [["armored", 25], ["runner", 30]]),
  ...repeat(11, 15, [["fireCurse", 40], ["armored", 20]]),
  ...repeat(16, 20, [["lavaGiant", 10], ["fireCurse", 50]]),
  ...repeat(21, 24, [["volcanoGuard", 15]]),
  wave(["volcanoBoss", 1]),
];
