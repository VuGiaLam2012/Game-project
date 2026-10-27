const wave = (...entries) => entries.map(([type, count]) => ({ type, count }));

export default [
  ...Array.from({ length: 5 }, () => wave(["specialGradeElite", 20])),
  ...Array.from({ length: 5 }, () => wave(["specialGradeElite", 15], ["eliteHidden", 10])),
  ...Array.from({ length: 5 }, () => wave(["disasterGeneral", 25])),
  ...Array.from({ length: 5 }, () => wave(["disasterGeneral", 20], ["mimic", 10])),
  wave(["specialGradeElite", 2]),
  wave(["specialGradeElite", 3]),
  wave(["specialGradeElite", 4]),
  wave(["specialGradeElite", 5]),
  wave(["cursedSovereign", 1]),
];
