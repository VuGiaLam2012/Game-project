const countries = structuredClone(window.ZN_DATA.nations);

let provinces = [];
let selectedId = "P02";
let turn = 1;
let gameOver = false;
let player = "nation_1";
let visionLevel = 2;
let selectedLayout = "horizontal";

function flagConfig() {
  return {
    layout: selectedLayout,
    colors: [
      document.getElementById("nation-color-1").value,
      document.getElementById("nation-color-2").value,
      document.getElementById("nation-color-3").value
    ],
    symbol: document.getElementById("symbol-select").value,
    size: Number(document.getElementById("symbol-size").value),
    rotate: Number(document.getElementById("symbol-rotate").value),
    x: Number(document.getElementById("symbol-x").value),
    y: Number(document.getElementById("symbol-y").value)
  };
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;"
  })[char]);
}

function createFlagSvg(config) {
  const safe = config || {
    layout: "horizontal",
    colors: ["#202020", "#b54a4a", "#f0e9d2"],
    symbol: "",
    size: 34,
    rotate: 0,
    x: 50,
    y: 50
  };
  const [c1, c2, c3] = safe.colors;
  let shapes = "";

  if (safe.layout === "horizontal") {
    shapes = `<rect width="300" height="100" fill="${c1}"/><rect y="100" width="300" height="100" fill="${c2}"/><rect y="200" width="300" height="100" fill="${c3}"/>`;
  } else if (safe.layout === "vertical") {
    shapes = `<rect width="100" height="300" fill="${c1}"/><rect x="100" width="100" height="300" fill="${c2}"/><rect x="200" width="100" height="300" fill="${c3}"/>`;
  } else if (safe.layout === "cross") {
    shapes = `<rect width="300" height="300" fill="${c1}"/><rect x="120" width="60" height="300" fill="${c3}"/><rect y="120" width="300" height="60" fill="${c3}"/><rect x="135" width="30" height="300" fill="${c2}"/><rect y="135" width="300" height="30" fill="${c2}"/>`;
  } else if (safe.layout === "diagonal") {
    shapes = `<rect width="300" height="300" fill="${c1}"/><path d="M-30 0L0-30 330 300 300 330Z" fill="${c2}"/><path d="M330 0L300-30-30 300 0 330Z" fill="${c3}"/>`;
  } else if (safe.layout === "triangle") {
    shapes = `<rect width="300" height="300" fill="${c2}"/><path d="M0 0H220L300 150 220 300H0Z" fill="${c1}"/><path d="M0 0L150 150 0 300Z" fill="${c3}"/>`;
  } else if (safe.layout === "circle") {
    shapes = `<rect width="300" height="300" fill="${c1}"/><circle cx="150" cy="150" r="92" fill="${c2}"/><circle cx="150" cy="150" r="42" fill="${c3}"/>`;
  } else if (safe.layout === "left-canton") {
    shapes = `<rect width="300" height="300" fill="${c2}"/><rect y="100" width="300" height="100" fill="${c3}"/><rect width="110" height="130" fill="${c1}"/>`;
  } else {
    shapes = `<rect width="150" height="300" fill="${c1}"/><rect x="150" width="150" height="300" fill="${c2}"/>`;
  }

  const symbol = safe.symbol
    ? `<text x="${safe.x * 3}" y="${safe.y * 3}" fill="${c3}" font-size="${safe.size * 1.7}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${safe.rotate} ${safe.x * 3} ${safe.y * 3})">${escapeXml(safe.symbol)}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">${shapes}${symbol}</svg>`;
}

function createProvinces() {
  provinces = window.ZN_DATA.provinces.map(province => ({
    ...structuredClone(province),
    army: province.military,
    quarantine: 0,
    zombieProvince: false,
    hasActed: false
  }));
  addAdjacency();
}

function addAdjacency() {
  for (const province of provinces) {
    province.neighbors = window.ZN_DATA.connections
      .filter(connection =>
        connection.provinceA === province.id ||
        connection.provinceB === province.id
      )
      .map(connection =>
        connection.provinceA === province.id
          ? connection.provinceB
          : connection.provinceA
      );
  }
}

function countryById(id) {
  return countries.find(country => country.id === id);
}

function provinceById(id) {
  return provinces.find(province => province.id === id);
}

function infectionColor(province) {
  if (province.zombieProvince) return "#c64f5a";
  if (province.infection > 50) return "#de8357";
  if (province.infection > 20) return "#e8c76a";
  return province.owner ? countryById(province.owner).color : "#397c9e";
}

function isVisible(province) {
  if (province.owner === player) return true;
  const playerProvinces = provinces.filter(p => p.owner === player);

  if (visionLevel >= 2) {
    if (playerProvinces.some(p =>
      p.neighbors && p.neighbors.includes(province.id)
    )) return true;
  }

  if (visionLevel >= 3) {
    const secondRing = playerProvinces.flatMap(p =>
      p.neighbors
        .map(provinceById)
        .filter(Boolean)
        .flatMap(n => n.neighbors)
    );
    if (secondRing.includes(province.id)) return true;
  }

  const owner = countryById(province.owner);
  if (owner && owner.discovered) return true;
  return false;
}

function discoverNearbyCountries() {
  const visible = provinces.filter(province => isVisible(province));
  for (const province of visible) {
    const country = countryById(province.owner);
    if (country) country.discovered = true;
  }
}

function render() {
  renderResources();
  renderMap();
  renderDetails();
  renderCountries();
  renderNationMark();
  document.getElementById("turn").textContent = `${turn} / 20`;
}

function renderNationMark() {
  const nation = countryById(player);
  const mark = document.getElementById("nation-mark");
  mark.className = "nation-mark";
  mark.innerHTML = createFlagSvg(nation.flagConfig);
  mark.title = `${nation.name} - ${nation.motto || ""}`;
}

function renderResources() {
  const country = countryById(player);
  const population = provinces
    .filter(province => province.owner === player && !province.zombieProvince)
    .reduce((sum, province) => sum + province.population, 0);
  const army = provinces
    .filter(province => province.owner === player)
    .reduce((sum, province) => sum + province.army, 0);
  const resources = [
    ["Tiền", country.money],
    ["Dân số", population],
    ["Lương thực", country.food],
    ["Năng lượng", country.energy],
    ["Quân sự", army],
    ["Nghiên cứu", country.research]
  ];
  document.getElementById("resources").innerHTML = resources
    .map(([label, value]) => `<div class="resource"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function renderMap() {
  const map = document.getElementById("map");
  map.innerHTML = "";
  for (const province of provinces) {
    if (!isVisible(province)) {
      const node = document.createElement("button");
      node.className = "province";
      node.style.gridRow = province.row;
      node.style.gridColumn = province.column;
      node.style.background = "#252b2d";
      node.style.opacity = ".72";
      node.innerHTML = '<span class="province-name">Ẩn số</span><span class="province-meta">Fog of Apocalypse</span>';
      node.disabled = true;
      map.appendChild(node);
      continue;
    }
    const node = document.createElement("button");
    node.className = "province";
    node.style.gridRow = province.row;
    node.style.gridColumn = province.column;
    if (province.id === selectedId) node.classList.add("selected");
    if (province.zombieProvince) node.classList.add("zombie");
    node.style.left = `${province.x}%`;
    node.style.top = `${province.y}%`;
    node.style.background = infectionColor(province);
    node.innerHTML = `
      <span class="province-name">${province.name}</span>
      <span class="province-meta">${province.zombieProvince ? "ZOMBIE" : `Nhiễm ${province.infection}%`} · ${province.army} quân</span>
    `;
    node.addEventListener("click", () => {
      selectedId = province.id;
      render();
    });
    map.appendChild(node);
  }
}

function renderDetails() {
  const province = provinceById(selectedId);
  if (!province) return;
  const owner = countryById(province.owner);
  document.getElementById("province-details").innerHTML = `
    <h3>${province.name}</h3>
    <div class="stat"><span>Quốc gia</span><strong>${owner.name}</strong></div>
    <div class="stat"><span>Dân số</span><strong>${province.population}</strong></div>
    <div class="stat"><span>Kinh tế</span><strong>${province.economy}</strong></div>
    <div class="stat"><span>Quân đội</span><strong>${province.army}</strong></div>
    <div class="stat"><span>Hạ tầng</span><strong>${province.infrastructure}</strong></div>
    <div class="stat"><span>Nhiễm</span><strong>${province.zombieProvince ? "100% (Zombie)" : `${province.infection}%`}</strong></div>
  `;

  const enabled = province.owner === player &&
    !province.zombieProvince &&
    !province.hasActed &&
    !gameOver;
  document.querySelectorAll(".actions button").forEach(button => {
    if (button.dataset.action === "attack") {
      const canAttack = province.owner !== player &&
        province.neighbors.some(id => provinceById(id).owner === player);
      button.disabled = !canAttack || gameOver;
    } else {
      button.disabled = !enabled;
    }
  });
}

function renderCountries() {
  const container = document.getElementById("countries");
  container.innerHTML = countries.map(country => {
    if (country.id !== player && !country.discovered) {
      return `
        <div class="country">
          <i class="country-dot" style="background:#596266"></i>
          <div><strong>Quốc gia chưa khám phá</strong><span>Chưa xác định vị trí</span></div>
          <b>?</b>
        </div>
      `;
    }
    const owned = provinces.filter(province => province.owner === country.id);
    const population = owned
      .filter(province => !province.zombieProvince)
      .reduce((sum, province) => sum + province.population, 0);
    return `
      <div class="country">
        <i class="country-dot" style="background:${country.color}"></i>
        <div><strong>${country.name}</strong><span>${owned.length} tỉnh · ${population} dân</span></div>
        <b>${country.money}</b>
      </div>
    `;
  }).join("");
}

function log(message) {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = message;
  const logBox = document.getElementById("log");
  logBox.prepend(entry);
}

function spend(countryId, amount) {
  const country = countryById(countryId);
  if (country.money < amount) return false;
  country.money -= amount;
  return true;
}

function actionEconomy(province) {
  if (!spend(player, 25)) return "Không đủ tiền";
  province.economy += 5;
  return "Tăng kinh tế tỉnh";
}

function actionInfrastructure(province) {
  if (!spend(player, 30)) return "Không đủ tiền";
  province.infrastructure += 5;
  return "Nâng cấp hạ tầng";
}

function actionRecruit(province) {
  const country = countryById(player);
  if (province.population < 20) return "Không đủ dân";
  if (!spend(player, 40)) return "Không đủ tiền";
  province.population -= 20;
  province.army += 20;
  return "Tuyển 20 quân";
}

function actionResearch(province) {
  const country = countryById(player);
  if (!spend(player, 20)) return "Không đủ tiền";
  country.research += 8;
  unlockTechnologies(country);
  return "Cộng 8 điểm nghiên cứu";
}

function actionQuarantine(province) {
  if (!spend(player, 15)) return "Không đủ tiền";
  const country = countryById(player);
  const extra = country.technologies.includes("advanced_quarantine") ? 10 : 0;
  province.infection = Math.max(0, province.infection - 15 - extra);
  province.quarantine = 1;
  return "Giảm nhiễm 15 điểm";
}

function unlockTechnologies(country) {
  for (const tech of window.ZN_DATA.technologies) {
    if (
      country.research >= tech.cost &&
      !country.technologies.includes(tech.id)
    ) {
      country.technologies.push(tech.id);
      log(`<b>${country.name}</b> mở khóa công nghệ: ${tech.name}`);
      if (tech.id === "early_warning_system") {
        visionLevel = Math.min(visionLevel + 1, 6);
      }
    }
  }
}

function actionAttack(defender) {
  if (!defender || defender.owner === player) return "Chọn một tỉnh địch lân cận";
  const attacker = provinces
    .filter(province =>
      province.owner === player &&
      province.neighbors.includes(defender.id) &&
      !province.zombieProvince
    )
    .sort((a, b) => b.army - a.army)[0];
  if (!attacker || attacker.army < 10) return "Không có quân đủ sức tấn công";

  const nation = countryById(player);
  if (!spend(player, 10)) return "Không đủ tiền để huy động tấn công";
  const zombieBonus = defender.zombieProvince &&
    nation.technologies.includes("anti_zombie_weapons") ? 1.2 : 1;
  const attackPower = attacker.army * zombieBonus * (1 + nation.research / 100) *
    (1 + attacker.infrastructure / 100);
  const defendPower = defender.army * (1 + defender.infrastructure / 100) * 1.2;
  const randomFactor = 0.9 + Math.random() * 0.2;
  const winChance = attackPower * randomFactor /
    (attackPower * randomFactor + defendPower);

  if (Math.random() < winChance) {
    attacker.hasActed = true;
    defender.owner = player;
    defender.zombieProvince = false;
    defender.infection = Math.min(defender.infection, 20);
    defender.army = Math.max(5, Math.floor(attacker.army * 0.25));
    attacker.army = Math.max(5, attacker.army - Math.floor(attacker.army * 0.2));
    discoverNearbyCountries();
    return `<b>${attacker.name}</b> chiếm ${defender.name}`;
  }

  attacker.hasActed = true;
  attacker.army = Math.max(5, attacker.army - Math.floor(attacker.army * 0.3));
  defender.army = Math.max(5, defender.army - Math.floor(defender.army * 0.15));
  return `<b>${defender.name}</b> đánh bại cuộc tấn công`;
}

document.querySelectorAll(".actions button").forEach(button => {
  button.addEventListener("click", () => {
    const province = provinceById(selectedId);
    const action = button.dataset.action;
    if (!province) return;
    if (action === "attack") {
      const result = actionAttack(province);
      log(result);
      saveGame();
      render();
      return;
    }
    if (province.owner !== player) return;
    let result;
    if (action === "economy") result = actionEconomy(province);
    if (action === "infrastructure") result = actionInfrastructure(province);
    if (action === "recruit") result = actionRecruit(province);
    if (action === "research") result = actionResearch(province);
    if (action === "quarantine") result = actionQuarantine(province);
    log(`<b>${province.name}</b>: ${result}`);
    province.hasActed = true;
    saveGame();
    render();
  });
});

function collectIncome() {
  for (const country of countries) {
    let income = 0;
    let foodProduction = 0;
    let energyProduction = 0;
    for (const province of provinces.filter(item => item.owner === country.id)) {
      if (province.zombieProvince) continue;
      income += Math.floor(province.population / 100 + province.economy + province.infrastructure / 5);
      foodProduction += province.economy;
      energyProduction += Math.floor(province.economy / 3);
    }
    const army = provinces
      .filter(province => province.owner === country.id)
      .reduce((sum, province) => sum + province.army, 0);
    const upkeep = Math.floor(army / 10);
    country.money = Math.max(0, country.money + income - upkeep);
    country.food = Math.max(0, country.food + Math.floor(foodProduction / 8));
    country.energy = Math.max(0, country.energy + energyProduction);
  }
}

function consumeFood() {
  for (const country of countries) {
    const population = provinces
      .filter(province => province.owner === country.id && !province.zombieProvince)
      .reduce((sum, province) => sum + province.population, 0);
    const army = provinces
      .filter(province => province.owner === country.id)
      .reduce((sum, province) => sum + province.army, 0);
    const consumption = Math.ceil(population / 100 + army / 50);
    country.food -= consumption;
    if (country.food < 0) {
      country.food = 0;
      for (const province of provinces.filter(item => item.owner === country.id)) {
        province.population = Math.max(0, province.population - 5);
      }
      if (country.id === player) log("<b>Thiếu lương thực</b>: dân số giảm.");
    }
  }
}

function spreadInfection() {
  for (const province of provinces) {
    if (province.zombieProvince) {
      province.infection = 100;
      continue;
    }
    const nearbyZombie = province.neighbors
      .map(provinceById)
      .filter(neighbor => neighbor && neighbor.zombieProvince).length;
    const quarantineEffect = province.quarantine ? 10 : 0;
    const extra = nearbyZombie * 5 + province.infection * 0.025;
    const owner = countryById(province.owner);
    const medicalEffect = owner &&
      owner.technologies.includes("medical_infrastructure") ? 5 : 0;
    const decrease = quarantineEffect + province.infrastructure / 20 + medicalEffect;
    province.infection = Math.max(0, Math.min(100,
      Math.round(province.infection + extra - decrease)
    ));
    province.quarantine = 0;
    if (province.infection >= 100) {
      province.zombieProvince = true;
      province.infection = 100;
      province.population = 0;
      province.army = Math.floor(province.army * 0.4);
      log(`<b>${province.name}</b> đã trở thành <b>Zombie Province</b>`);
    }
  }
}

function zombieAttack() {
  for (const province of provinces.filter(item => item.zombieProvince)) {
    for (const neighborId of province.neighbors) {
      const neighbor = provinceById(neighborId);
      if (!neighbor || neighbor.zombieProvince) continue;
      if (Math.random() < 0.22 && neighbor.infection < 100) {
        neighbor.infection = Math.min(100, neighbor.infection + 12);
        if (neighbor.infection >= 100) {
          neighbor.zombieProvince = true;
          neighbor.population = 0;
          log(`<b>${neighbor.name}</b> đã sụp đổ trước Zombie Army`);
        }
      }
    }
  }
}

function aiTurn() {
  for (const country of countries.filter(item => item.ai)) {
    const owned = provinces.filter(province =>
      province.owner === country.id && !province.zombieProvince
    );
    if (!owned.length) continue;

    const crisis = owned.find(province => province.infection > 50);
    if (crisis && country.money >= 15) {
      spend(country.id, 15);
      crisis.infection = Math.max(0, crisis.infection - 15);
      crisis.quarantine = 1;
      continue;
    }

    if (country.money >= 40) {
      const target = owned.sort((a, b) => b.economy - a.economy)[0];
      spend(country.id, 25);
      target.economy += 3;
    }

    if (country.money >= 60) {
      const target = owned.sort((a, b) => b.infrastructure - a.infrastructure)[0];
      spend(country.id, 40);
      target.army += 10;
    }

    const weakNeighbor = owned
      .flatMap(province => province.neighbors.map(provinceById))
      .find(neighbor => neighbor && neighbor.owner !== country.id && neighbor.army < 12);
    if (weakNeighbor && !weakNeighbor.zombieProvince) {
      resolveWar(country.id, weakNeighbor.id);
    }
  }
}

function resolveWar(attackerId, defenderId) {
  const defender = provinceById(defenderId);
  if (!defender) return;
  const attackProvinces = provinces.filter(province =>
    province.owner === attackerId &&
    province.neighbors.includes(defenderId) &&
    !province.zombieProvince
  );
  if (!attackProvinces.length) return;

  const attackerProvince = attackProvinces.sort((a, b) => b.army - a.army)[0];
  const attackTech = countryById(attackerId).research;
  const attackPower = attackerProvince.army * (1 + attackTech / 100) *
    (1 + attackerProvince.infrastructure / 100);
  const defendPower = defender.army * (1 + defender.infrastructure / 100) * 1.2;
  const randomFactor = 0.9 + Math.random() * 0.2;
  const winChance = attackPower * randomFactor /
    (attackPower * randomFactor + defendPower);

  if (Math.random() < winChance) {
    defender.owner = attackerId;
    defender.army = Math.max(5, Math.floor(attackerProvince.army * 0.25));
    attackerProvince.army = Math.max(5, attackerProvince.army - Math.floor(attackerProvince.army * 0.2));
    log(`<b>${countryById(attackerId).name}</b> chiếm ${defender.name}`);
  } else {
    attackerProvince.army = Math.max(5, attackerProvince.army - Math.floor(attackerProvince.army * 0.3));
    defender.army = Math.max(5, defender.army - Math.floor(defender.army * 0.15));
  }
}

function checkVictory() {
  const playerProvinces = provinces.filter(province => province.owner === player);
  if (playerProvinces.length === 0) {
    endGame("Thất bại", "Quốc gia của bạn không còn tỉnh.");
    return true;
  }
  if (playerProvinces.length >= 12) {
    endGame("Chiến thắng quân sự", "Bạn đã kiểm soát phần lớn bản đồ.");
    return true;
  }
  if (countryById(player).research >= 100) {
    endGame("Chiến thắng khoa học", "Bạn đã hoàn thành vaccine thử nghiệm.");
    return true;
  }
  if (turn >= 20) {
    const alive = provinces.some(province => province.owner === player && !province.zombieProvince);
    if (alive) endGame("Chiến thắng sinh tồn", "Quốc gia của bạn còn tồn tại sau 20 lượt.");
    else endGame("Thất bại", "Quốc gia của bạn đã sụp đổ.");
    return true;
  }
  return false;
}

function endGame(title, message) {
  gameOver = true;
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-message").textContent = message;
  document.getElementById("modal").classList.remove("hidden");
}

document.getElementById("end-turn").addEventListener("click", () => {
  if (gameOver) return;
  collectIncome();
  consumeFood();
  spreadInfection();
  zombieAttack();
  aiTurn();
  turn += 1;
  log(`<b>--- Lượt ${turn - 1} kết thúc ---</b>`);
  saveGame();
  discoverNearbyCountries();
  if (!checkVictory()) render();
});

document.getElementById("modal-close").addEventListener("click", () => {
  location.reload();
});

function saveGame() {
  const state = {
    countries,
    provinces,
    selectedId,
    turn,
    gameOver,
    player,
    visionLevel
  };
  localStorage.setItem("zombie-nations-save", JSON.stringify(state));
}

function loadGame() {
  const raw = localStorage.getItem("zombie-nations-save");
  if (!raw) return false;
  try {
    const state = JSON.parse(raw);
    if (
      !Array.isArray(state.countries) ||
      !Array.isArray(state.provinces) ||
      !state.provinces.some(province => province.id === "P01")
    ) {
      localStorage.removeItem("zombie-nations-save");
      return false;
    }
    countries.splice(0, countries.length, ...state.countries);
    provinces = state.provinces;
    addAdjacency();
    selectedId = state.selectedId;
    turn = state.turn;
    gameOver = state.gameOver;
    player = state.player;
    visionLevel = state.visionLevel || 2;
    return true;
  } catch (error) {
    localStorage.removeItem("zombie-nations-save");
    return false;
  }
}

const setupModal = document.getElementById("setup-modal");
const createNationButton = document.getElementById("create-nation");
const savedGame = loadGame();

function updateFlagPreview() {
  document.getElementById("flag-preview").innerHTML = createFlagSvg(flagConfig());
}

document.querySelectorAll(".layout-option").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".layout-option").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    selectedLayout = button.dataset.layout;
    updateFlagPreview();
  });
});

document.querySelectorAll(".palette input").forEach(input => {
  input.addEventListener("input", updateFlagPreview);
});

document.querySelectorAll(".color-presets button").forEach(button => {
  button.addEventListener("click", () => {
    const colors = button.dataset.colors.split(",");
    document.getElementById("nation-color-1").value = colors[0];
    document.getElementById("nation-color-2").value = colors[1];
    document.getElementById("nation-color-3").value = colors[2];
    updateFlagPreview();
  });
});

document.querySelectorAll("#symbol-select, #symbol-size, #symbol-rotate, #symbol-x, #symbol-y")
  .forEach(control => control.addEventListener("input", updateFlagPreview));

updateFlagPreview();

if (savedGame) {
  createNationButton.textContent = "Tiếp tục quốc gia";
}

createNationButton.addEventListener("click", () => {
  if (!savedGame) {
    const customName = document.getElementById("nation-name").value.trim();
    const customMotto = document.getElementById("nation-motto").value.trim();
    const config = flagConfig();
    const nation = countryById(player);
    nation.name = customName || "Quốc gia chưa đặt tên";
    nation.motto = customMotto || "Survive";
    nation.flag = config.layout;
    nation.flagConfig = config;
    nation.color = config.colors[1];
    createProvinces();
  }
  setupModal.classList.add("hidden");
  discoverNearbyCountries();
  log(savedGame ? "<b>Đã khôi phục tiến trình.</b>" : `<b>${countryById(player).name}</b> đã được thành lập.`);
  saveGame();
  render();
});

if (!savedGame) {
  createProvinces();
  render();
}
