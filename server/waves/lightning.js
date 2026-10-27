const wave = (...entries) => entries.map(([type, count]) => ({ type, count }));
const repeat = (from, to, entries) => Array.from({ length: to - from + 1 }, () => wave(...entries));

export default [
  ...repeat(1, 5, [["fastCurse", 60]]),
  ...repeat(6, 10, [["dashCurse", 50]]),
  ...repeat(11, 15, [["lightningRunner", 70]]),
  ...repeat(16, 20, [["thunderElite", 20]]),
  ...repeat(21, 24, [["thunderLord", 15]]),
  wave(["lightningSpiritBoss", 1]),
];
