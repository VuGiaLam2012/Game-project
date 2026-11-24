window.ZN_DATA = {
  technologies: [
    {
      id: "advanced_quarantine",
      name: "Kiểm dịch nâng cao",
      cost: 20,
      description: "Kiểm dịch giảm thêm 10 nhiễm."
    },
    {
      id: "medical_infrastructure",
      name: "Hạ tầng y tế",
      cost: 40,
      description: "Giảm lây nhiễm toàn quốc."
    },
    {
      id: "anti_zombie_weapons",
      name: "Vũ khí chống Zombie",
      cost: 60,
      description: "Quân đội +20% sức mạnh khi đánh Zombie."
    },
    {
      id: "early_warning_system",
      name: "Cảnh báo sớm",
      cost: 80,
      description: "Tăng tầm nhìn Fog of Apocalypse."
    },
    {
      id: "experimental_vaccine",
      name: "Vaccine thử nghiệm",
      cost: 100,
      description: "Điều kiện chiến thắng khoa học."
    }
  ],

  nations: [
    { id: "nation_1", name: "Iron Federation", color: "#b54a4a", motto: "Humanity Will Survive", flag: "horizontal", technologies: [], money: 120, food: 100, energy: 80, research: 10, ai: false, discovered: true, flagConfig: null },
    { id: "nation_2", name: "Cộng hòa Viễn Đông", color: "#765a9c", motto: "Bên ngoài là bóng tối", technologies: [], money: 110, food: 95, energy: 70, research: 12, ai: true, discovered: false, flagConfig: null },
    { id: "nation_3", name: "Hội đồng Biển Đông", color: "#b39b55", motto: "Thế giới vẫn nổi", technologies: [], money: 105, food: 110, energy: 75, research: 10, ai: true, discovered: false, flagConfig: null },
    { id: "nation_4", name: "Liên minh Mặt Trời", color: "#5f9871", motto: "Mặt trời trở lại", technologies: [], money: 95, food: 85, energy: 60, research: 8, ai: true, discovered: false, flagConfig: null },
    { id: "nation_5", name: "Khối Tái Sinh", color: "#9b6651", motto: "Phục sinh nhân loại", technologies: [], money: 90, food: 80, energy: 55, research: 8, ai: true, discovered: false, flagConfig: null }
  ],

  provinces: [
    { id: "P01", name: "A1", owner: "nation_1", population: 140, economy: 18, food: 30, infrastructure: 9, military: 18, infection: 4, row: 1, column: 1 },
    { id: "P02", name: "A2", owner: "nation_1", population: 120, economy: 16, food: 28, infrastructure: 7, military: 12, infection: 4, row: 1, column: 2 },
    { id: "P03", name: "A3", owner: "nation_1", population: 110, economy: 14, food: 25, infrastructure: 6, military: 10, infection: 4, row: 1, column: 3 },
    { id: "P04", name: "A4", owner: "nation_1", population: 95, economy: 12, food: 22, infrastructure: 5, military: 9, infection: 4, row: 1, column: 4 },

    { id: "P05", name: "B1", owner: "nation_2", population: 100, economy: 14, food: 24, infrastructure: 8, military: 15, infection: 34, row: 2, column: 1 },
    { id: "P06", name: "B2", owner: "nation_2", population: 125, economy: 17, food: 27, infrastructure: 9, military: 20, infection: 34, row: 2, column: 2 },
    { id: "P07", name: "B3", owner: "nation_2", population: 85, economy: 12, food: 20, infrastructure: 5, military: 10, infection: 20, row: 2, column: 3 },
    { id: "P08", name: "B4", owner: "nation_2", population: 90, economy: 13, food: 21, infrastructure: 6, military: 13, infection: 12, row: 2, column: 4 },

    { id: "P09", name: "C1", owner: "nation_3", population: 130, economy: 16, food: 29, infrastructure: 7, military: 16, infection: 18, row: 3, column: 1 },
    { id: "P10", name: "C2", owner: "nation_3", population: 115, economy: 15, food: 26, infrastructure: 5, military: 12, infection: 18, row: 3, column: 2 },
    { id: "P11", name: "C3", owner: "nation_3", population: 150, economy: 20, food: 32, infrastructure: 10, military: 22, infection: 8, row: 3, column: 3 },
    { id: "P12", name: "C4", owner: "nation_3", population: 105, economy: 14, food: 23, infrastructure: 6, military: 14, infection: 8, row: 3, column: 4 },

    { id: "P13", name: "D1", owner: "nation_4", population: 80, economy: 10, food: 18, infrastructure: 4, military: 8, infection: 4, row: 4, column: 1 },
    { id: "P14", name: "D2", owner: "nation_4", population: 95, economy: 13, food: 20, infrastructure: 5, military: 12, infection: 4, row: 4, column: 2 },
    { id: "P15", name: "D3", owner: "nation_4", population: 70, economy: 9, food: 16, infrastructure: 3, military: 7, infection: 4, row: 4, column: 3 },
    { id: "P16", name: "D4", owner: "nation_4", population: 75, economy: 11, food: 17, infrastructure: 4, military: 9, infection: 4, row: 4, column: 4 },

    { id: "P17", name: "E1", owner: "nation_5", population: 75, economy: 9, food: 15, infrastructure: 3, military: 8, infection: 4, row: 5, column: 1 },
    { id: "P18", name: "E2", owner: "nation_5", population: 85, economy: 11, food: 18, infrastructure: 4, military: 10, infection: 4, row: 5, column: 2 },
    { id: "P19", name: "E3", owner: "nation_5", population: 65, economy: 8, food: 14, infrastructure: 3, military: 7, infection: 4, row: 5, column: 3 },
    { id: "P20", name: "E4", owner: "nation_5", population: 70, economy: 10, food: 16, infrastructure: 5, military: 11, infection: 4, row: 5, column: 4 }
  ],

  connections: []
};

(function buildConnections() {
  const provinces = window.ZN_DATA.provinces;
  const byPosition = new Map(provinces.map(province => [`${province.row}:${province.column}`, province.id]));
  for (const province of provinces) {
    for (const [rowOffset, columnOffset] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const neighborId = byPosition.get(`${province.row + rowOffset}:${province.column + columnOffset}`);
      if (neighborId) {
        const provinceA = province.id;
        const provinceB = neighborId;
        const exists = window.ZN_DATA.connections.some(connection =>
          connection.provinceA === provinceB && connection.provinceB === provinceA
        );
        if (!exists) window.ZN_DATA.connections.push({ provinceA, provinceB });
      }
    }
  }
})();
