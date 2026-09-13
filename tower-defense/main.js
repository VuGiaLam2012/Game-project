import { ScoutTower } from './units/scout.js';
import { RiflemanTower } from './units/rifleman.js';
import { ShotgunnerTower } from './units/shotgunner.js';
import { CrookBossTower } from './units/crook-boss.js';
import { AcceleratorTower } from './units/accelerator.js';
import { SniperTower } from './units/sniper.js';
import { GuardianTower } from './units/guardian.js';
import { TeslaTower } from './units/tesla.js';
import { FarmerTower } from './units/farmer.js';
import { MinigunnerTower } from './units/minigunner.js';
import { DemomanTower } from './units/demoman.js';
import { ElectroshockerTower } from './units/electroshocker.js';
import { MedicTower } from './units/medic.js';
import { WalkerEnemy } from './enemies/walker.js';
import { RunnerEnemy } from './enemies/runner.js';
import { TankEnemy } from './enemies/tank.js';
import { BruteEnemy } from './enemies/brute.js';
import { BossEnemy } from './enemies/boss.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menu-screen');
const loadoutScreen = document.getElementById('loadout-screen');
const gameShell = document.getElementById('game');
const menuStartBtn = document.getElementById('menu-start');
const continueGameBtn = document.getElementById('continue-game');
const enterGameBtn = document.getElementById('enter-game');
const startBtn = document.getElementById('start');
const upgradeBtn = document.getElementById('upgrade-tower');
const towerPanel = document.getElementById('tower-panel');
const towerPanelName = document.getElementById('tower-panel-name');
const towerPanelLevel = document.getElementById('tower-panel-level');
const towerPanelBadge = document.getElementById('tower-panel-badge');
const towerStats = document.getElementById('tower-stats');
const playerLevelEl = document.getElementById('player-level');
const xpTextEl = document.getElementById('xp-text');
const xpBarEl = document.getElementById('xp-bar');
const moneyEl = document.getElementById('money');
const livesEl = document.getElementById('lives');
const towerSelect = document.getElementById('tower-select');
const loadoutSlots = document.getElementById('loadout-slots');
const loadoutUnitSelect = document.getElementById('loadout-unit-select');
const modeSelect = document.getElementById('mode-select');
const SAVE_KEY = 'zombie-siege-progress-v1';
const MAX_LOADOUT = 5;
const STARTER_TOWERS = ['scout', 'rifleman', 'shotgunner', 'crook-boss', 'farmer'];

const game = {
  money: 1000,
  lives: 10,
  wave: 0,
  mode: 'normal',
  level: 1,
  xp: 0,
  unlockedTowers: [...STARTER_TOWERS],
  equippedTowers: [...STARTER_TOWERS],
  enemies: [],
  xpToNextLevel() {
    return 100 + (this.level - 1) * 75;
  },
  addXp(amount) {
    this.xp += amount;
    while (this.xp >= this.xpToNextLevel()) {
      this.xp -= this.xpToNextLevel();
      this.level += 1;
      this.money += 100 + this.level * 25;
    }
    renderTowerSelection();
    renderLoadout();
    this.syncHud();
  },
  syncHud() {
    const xpGoal = this.xpToNextLevel();
    playerLevelEl.textContent = this.level;
    xpTextEl.textContent = `${this.xp} / ${xpGoal} XP`;
    xpBarEl.style.width = `${Math.min(100, (this.xp / xpGoal) * 100)}%`;
    moneyEl.textContent = this.money;
    livesEl.textContent = this.lives;
  }
};

const towerTypes = [
  { id: 'scout', name: 'Scout', cost: 50, unlockLevel: 1, color: '#8b5cf6', TowerClass: ScoutTower },
  { id: 'rifleman', name: 'Rifleman', cost: 75, unlockLevel: 1, color: '#3b82f6', TowerClass: RiflemanTower },
  { id: 'shotgunner', name: 'Shotgunner', cost: 95, unlockLevel: 1, color: '#f59e0b', TowerClass: ShotgunnerTower },
  { id: 'crook-boss', name: 'Crook Boss', cost: 130, unlockLevel: 1, color: '#ef4444', TowerClass: CrookBossTower },
  { id: 'accelerator', name: 'Accelerator', cost: 7500, unlockLevel: 50, unlockCost: 1000000, color: '#22c55e', TowerClass: AcceleratorTower },
  { id: 'sniper', name: 'Sniper', cost: 210, unlockLevel: 2, unlockCost: 500, color: '#06b6d4', TowerClass: SniperTower },
  { id: 'guardian', name: 'Guardian', cost: 185, unlockLevel: 3, unlockCost: 750, color: '#f43f5e', TowerClass: GuardianTower },
  { id: 'tesla', name: 'Tesla', cost: 240, unlockLevel: 4, unlockCost: 1000, color: '#eab308', TowerClass: TeslaTower },
  { id: 'farmer', name: 'Farmer', cost: 300, unlockLevel: 1, color: '#84cc16', TowerClass: FarmerTower },
  { id: 'demoman', name: 'Demoman', cost: 420, unlockLevel: 5, unlockCost: 1500, color: '#f97316', TowerClass: DemomanTower },
  { id: 'medic', name: 'Medic', cost: 350, unlockLevel: 6, unlockCost: 1800, color: '#ec4899', TowerClass: MedicTower },
  { id: 'electroshocker', name: 'Electroshocker', cost: 520, unlockLevel: 8, unlockCost: 2500, color: '#a855f7', TowerClass: ElectroshockerTower },
  { id: 'minigunner', name: 'Minigunner', cost: 650, unlockLevel: 10, unlockCost: 4000, color: '#64748b', TowerClass: MinigunnerTower }
];

const gameModes = [
  { id: 'casual', name: 'Casual', description: 'More lives and slower enemies.', lives: 15, hpScale: 0.8, speedScale: 0.9 },
  { id: 'normal', name: 'Normal', description: 'The balanced siege experience.', lives: 10, hpScale: 1, speedScale: 1 },
  { id: 'nightmare', name: 'Nightmare', description: 'Faster enemies with tougher armor.', lives: 7, hpScale: 1.35, speedScale: 1.18 }
];

const defaultPath = [
  { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
  { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 },
  { x: 5, y: 7 }, { x: 5, y: 8 }, { x: 5, y: 9 }, { x: 6, y: 9 }, { x: 7, y: 9 },
  { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 11, y: 9 }, { x: 12, y: 9 },
  { x: 13, y: 9 }, { x: 14, y: 9 }, { x: 14, y: 8 }, { x: 14, y: 7 }, { x: 14, y: 6 },
  { x: 14, y: 5 }, { x: 14, y: 4 }, { x: 15, y: 4 }, { x: 16, y: 4 }, { x: 17, y: 4 },
  { x: 18, y: 4 }, { x: 19, y: 4 }
];

const enemyTypes = [
  { id: 'walker', name: 'Walker', EnemyClass: WalkerEnemy },
  { id: 'runner', name: 'Runner', EnemyClass: RunnerEnemy },
  { id: 'tank', name: 'Tank', EnemyClass: TankEnemy },
  { id: 'brute', name: 'Brute', EnemyClass: BruteEnemy },
  { id: 'boss', name: 'Boss', EnemyClass: BossEnemy }
];

const GRID_SIZE = 40;
const MAX_FARMERS = 8;
const cols = (canvas.width / GRID_SIZE) | 0;
const rows = (canvas.height / GRID_SIZE) | 0;
const enemies = [];
const towers = [];
const bullets = [];
const crookMinions = [];
const waveSpawnTimers = [];
game.enemies = enemies;
game.crookMinions = crookMinions;

let selectedTowerId = towerTypes[0].id;
let selectedTower = null;
let path = defaultPath;
let last = performance.now();
let running = false;

function readSavedProgress() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveProgress(force = false) {
  if (!force && game.wave === 0 && towers.length === 0) return;

  const towerData = towers.map((tower) => ({
    type: towerTypes.find((type) => type.TowerClass && tower instanceof type.TowerClass)?.id,
    col: tower.col,
    row: tower.row,
    level: tower.level
  }));

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      money: game.money,
      lives: game.lives,
      wave: game.wave,
      mode: game.mode,
      level: game.level,
      xp: game.xp,
      unlockedTowers: game.unlockedTowers,
      equippedTowers: game.equippedTowers,
      selectedTowerId,
      towers: towerData
    }));
    continueGameBtn.classList.remove('hidden');
  } catch {
    // Gameplay remains available when browser storage is blocked.
  }
}

function clearSavedProgress() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore storage restrictions when starting a new game.
  }
  continueGameBtn.classList.add('hidden');
}

function createTower(type, col, row) {
  const tower = new type.TowerClass(col, row, ctx, GRID_SIZE, (x, y, target, dmg, color) => {
    bullets.push(new Bullet(x, y, target, dmg, color));
  }, 'classic');
  tower.game = game;
  return tower;
}

class CrookMinion {
  constructor(owner) {
    this.owner = owner;
    this.x = owner.x;
    this.y = owner.y;
    this.target = null;
    this.speed = 86;
    this.damage = owner.minionDamage;
    this.attackCooldown = 0;
    this.life = 24;
    this.dead = false;
    this.walkTime = 0;
  }

  update(dt) {
    this.life -= dt;
    this.attackCooldown -= dt;
    this.walkTime += dt;
    if (this.life <= 0) {
      this.dead = true;
      return;
    }

    if (!this.target || this.target.dead) {
      this.target = enemies
        .filter((enemy) => !enemy.dead)
        .sort((a, b) => Math.hypot(a.x - this.x, a.y - this.y) - Math.hypot(b.x - this.x, b.y - this.y))[0] || null;
    }
    if (!this.target) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 24) {
      if (this.attackCooldown <= 0) {
        this.target.damage(this.damage);
        this.attackCooldown = 1.1;
      }
      return;
    }

    this.x += (dx / distance) * this.speed * dt;
    this.y += (dy / distance) * this.speed * dt;
  }

  draw() {
    const bob = Math.sin(this.walkTime * 9) * 2;
    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.fillStyle = 'rgba(15, 23, 42, .5)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-10, -8, 20, 18);
    ctx.fillStyle = '#fecaca';
    ctx.beginPath();
    ctx.arc(0, -14, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(-5, -16, 3, 4);
    ctx.fillRect(2, -16, 3, 4);
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-7, 10);
    ctx.lineTo(-10, 18);
    ctx.moveTo(7, 10);
    ctx.lineTo(10, 18);
    ctx.stroke();
    ctx.restore();
  }
}

function spawnCrookMinion(owner) {
  crookMinions.push(new CrookMinion(owner));
}

game.spawnCrook = spawnCrookMinion;

function restoreProgress(progress) {
  clearWaveSpawns();
  enemies.length = 0;
  crookMinions.length = 0;
  bullets.length = 0;
  towers.length = 0;
  game.money = Number(progress.money) || 1000;
  game.lives = Number(progress.lives) || 10;
  game.wave = Number(progress.wave) || 0;
  game.mode = gameModes.some((mode) => mode.id === progress.mode) ? progress.mode : 'normal';
  game.level = Math.max(1, Number(progress.level) || 1);
  game.xp = Math.max(0, Number(progress.xp) || 0);
  game.unlockedTowers = Array.isArray(progress.unlockedTowers)
    ? progress.unlockedTowers.filter((id) => towerTypes.some((type) => type.id === id))
    : [...STARTER_TOWERS];
  for (const starter of STARTER_TOWERS) {
    if (!game.unlockedTowers.includes(starter)) game.unlockedTowers.push(starter);
  }
  if (!game.unlockedTowers.includes('farmer')) game.unlockedTowers.push('farmer');
  game.equippedTowers = Array.isArray(progress.equippedTowers)
    ? progress.equippedTowers.filter((id) => game.unlockedTowers.includes(id)).slice(0, MAX_LOADOUT)
    : game.unlockedTowers.slice(0, MAX_LOADOUT);
  if (!game.equippedTowers.length) game.equippedTowers = game.unlockedTowers.slice(0, MAX_LOADOUT);
  selectedTowerId = towerTypes.some((type) => type.id === progress.selectedTowerId && isTowerUnlocked(type))
    ? progress.selectedTowerId
    : towerTypes[0].id;

  let restoredFarmers = 0;
  for (const savedTower of progress.towers || []) {
    const type = towerTypes.find((item) => item.id === savedTower.type);
    if (!type || !isTowerUnlocked(type)) continue;
    if (type.id === 'farmer' && restoredFarmers >= MAX_FARMERS) continue;
    const tower = createTower(type, savedTower.col, savedTower.row);
    const targetLevel = Math.min(tower.maxLevel, Math.max(1, Number(savedTower.level) || 1));
    while (tower.level < targetLevel) tower.upgrade();
    towers.push(tower);
    if (type.id === 'farmer') restoredFarmers += 1;
  }

  selectedTower = null;
  running = false;
  last = performance.now();
  renderTowerSelection();
  renderLoadout();
  renderUpgradeButton();
  game.syncHud();
}

function isTowerUnlocked(type) {
  return game.unlockedTowers.includes(type.id);
}

function isTowerEquipped(type) {
  return game.equippedTowers.includes(type.id);
}

function toggleTowerEquip(type) {
  if (!isTowerUnlocked(type)) return;
  if (isTowerEquipped(type)) {
    if (game.equippedTowers.length <= 1) return;
    game.equippedTowers = game.equippedTowers.filter((id) => id !== type.id);
  } else if (game.equippedTowers.length < MAX_LOADOUT) {
    game.equippedTowers.push(type.id);
  }
  if (!game.equippedTowers.includes(selectedTowerId)) selectedTowerId = game.equippedTowers[0];
  saveProgress(true);
  renderLoadout();
  renderTowerSelection();
}

function canUnlockTower(type) {
  return !isTowerUnlocked(type) && game.level >= type.unlockLevel && game.money >= type.unlockCost;
}

function unlockTower(type) {
  if (!canUnlockTower(type)) return false;
  game.money -= type.unlockCost;
  game.unlockedTowers.push(type.id);
  game.syncHud();
  saveProgress(true);
  renderTowerSelection();
  renderLoadout();
  return true;
}

function renderUpgradeButton() {
  if (!selectedTower) {
    towerPanel.classList.add('hidden');
    upgradeBtn.disabled = true;
    upgradeBtn.textContent = 'Upgrade Tower';
    return;
  }

  renderTowerPanel();

  if (selectedTower.level >= selectedTower.maxLevel) {
    upgradeBtn.disabled = true;
    upgradeBtn.textContent = 'Max Level';
    return;
  }

  upgradeBtn.disabled = game.money < selectedTower.upgradeCost;
  upgradeBtn.textContent = `Upgrade (${selectedTower.upgradeCost})`;
}

function renderTowerPanel() {
  if (!selectedTower) return;

  towerPanel.classList.remove('hidden');
  towerPanelName.textContent = selectedTower.name;
  towerPanelLevel.textContent = `Level ${selectedTower.level} / ${selectedTower.maxLevel}`;
  towerPanelBadge.style.background = selectedTower.color;

  const stats = selectedTower.incomePerTick
    ? [
      ['Income', `${selectedTower.incomePerTick} / ${selectedTower.incomeInterval}s`],
      ['Next level', selectedTower.level < selectedTower.maxLevel ? `${Math.round(selectedTower.incomePerTick * 1.5)} / ${selectedTower.incomeInterval}s` : 'MAX']
    ]
    : [
      ['Damage', selectedTower.dmg],
      ['Range', `${(selectedTower.range / GRID_SIZE).toFixed(1)} tiles`],
      ['Fire rate', `${selectedTower.fireRate.toFixed(2)} / sec`]
    ];

  towerStats.innerHTML = stats.map(([label, value]) => `<div class="tower-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function clearWaveSpawns() {
  waveSpawnTimers.forEach((timerId) => clearTimeout(timerId));
  waveSpawnTimers.length = 0;
}

function renderTowerSelection() {
  towerSelect.innerHTML = '';
  towerTypes.filter((type) => isTowerEquipped(type)).forEach((type) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const unlocked = isTowerUnlocked(type);
    const unlockReady = canUnlockTower(type);
    btn.className = 'tower-option' + (selectedTowerId === type.id ? ' selected' : '') + (!unlocked ? ' locked' : '');
    btn.style.background = unlocked ? type.color : '#334155';
    btn.innerHTML = `<span>${type.name}</span><span class="badge" style="background:${unlocked ? type.color : '#64748b'};box-shadow:0 0 0 2px rgba(255,255,255,.6);">${unlocked ? '' : 'L'}</span>`;
    btn.title = unlocked ? `${type.name} - $${type.cost}` : `${type.name} - Unlock at level ${type.unlockLevel} for ${type.unlockCost.toLocaleString()} coins`;
    btn.disabled = !unlocked && !unlockReady;
    btn.addEventListener('click', () => {
      if (!unlocked) {
        unlockTower(type);
        return;
      }
      selectedTowerId = type.id;
      renderTowerSelection();
    });
    towerSelect.appendChild(btn);
  });
}

function renderLoadout() {
  loadoutSlots.innerHTML = '';
  for (let index = 0; index < MAX_LOADOUT; index++) {
    const type = towerTypes.find((item) => item.id === game.equippedTowers[index]);
    const slot = document.createElement('div');
    slot.className = 'loadout-slot' + (type ? '' : ' empty');
    slot.innerHTML = type
      ? `<span class="loadout-slot-icon" style="background:${type.color}"></span><strong>${type.name}</strong>`
      : `<span class="loadout-slot-number">${index + 1}</span><small>Empty slot</small>`;
    loadoutSlots.appendChild(slot);
  }

  loadoutUnitSelect.innerHTML = '';
  towerTypes.forEach((type) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const unlocked = isTowerUnlocked(type);
    const equipped = isTowerEquipped(type);
    btn.className = 'loadout-option' + (equipped ? ' equipped' : '') + (!unlocked ? ' locked' : '');
    const unlockReady = canUnlockTower(type);
    const unlockLabel = !type.unlockCost
      ? 'Available from start'
      : game.level < type.unlockLevel
        ? `Unlocks at level ${type.unlockLevel}`
        : `Unlock for ${type.unlockCost.toLocaleString()} coins`;
    btn.innerHTML = `<span class="loadout-icon" style="background:${unlocked ? type.color : '#475569'}"></span><span><strong>${type.name}</strong><small>${unlocked ? (equipped ? 'Equipped - click to remove' : 'Owned - click to equip') : unlockLabel}</small></span><span class="loadout-state">${equipped ? 'ON' : unlocked ? 'OWNED' : 'LOCKED'}</span>`;
    btn.disabled = !unlocked && !unlockReady;
    btn.addEventListener('click', () => {
      if (!unlocked) {
        unlockTower(type);
        return;
      }
      toggleTowerEquip(type);
    });
    loadoutUnitSelect.appendChild(btn);
  });

  modeSelect.innerHTML = '';
  gameModes.forEach((mode) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mode-option' + (game.mode === mode.id ? ' selected' : '');
    btn.innerHTML = `<strong>${mode.name}</strong><small>${mode.description}</small>`;
    btn.addEventListener('click', () => {
      game.mode = mode.id;
      renderLoadout();
    });
    modeSelect.appendChild(btn);
  });
}

function resetGame() {
  clearWaveSpawns();
  enemies.length = 0;
  crookMinions.length = 0;
  bullets.length = 0;
  towers.length = 0;
  selectedTower = null;
  selectedTowerId = towerTypes[0].id;
  game.money = 1000;
  game.level = 1;
  game.xp = 0;
  game.unlockedTowers = [...STARTER_TOWERS];
  game.equippedTowers = [...STARTER_TOWERS];
  game.lives = 10;
  game.wave = 0;
  const mode = gameModes.find((item) => item.id === game.mode) || gameModes[1];
  game.lives = mode.lives;
  running = false;
  last = performance.now();
  renderTowerSelection();
  renderLoadout();
  game.syncHud();
  renderUpgradeButton();
}

function spawnEnemy(type, hp, speed) {
  const enemyConfig = enemyTypes.find((item) => item.id === type) || enemyTypes[0];
  enemies.push(new enemyConfig.EnemyClass(path, ctx, GRID_SIZE, hp, speed, game));
}

function spawnWave() {
  clearWaveSpawns();

  const wave = game.wave + 1;
  const mode = gameModes.find((item) => item.id === game.mode) || gameModes[1];
  const total = 5 + (wave - 1) * 3;
  const baseHp = 6 * mode.hpScale * Math.pow(0.75, wave - 1);
  const spawnGap = Math.max(260, (700 - wave * 30) / mode.speedScale);

  game.wave = wave;
  running = true;
  saveProgress();

  for (let i = 0; i < total; i++) {
    const timerId = setTimeout(() => {
      const hp = Math.max(1, Number(baseHp.toFixed(2)));
      const speed = (42 + wave * 3.1) * mode.speedScale;
      spawnEnemy('walker', hp, speed);

      const index = waveSpawnTimers.indexOf(timerId);
      if (index >= 0) {
        waveSpawnTimers.splice(index, 1);
      }
    }, i * spawnGap);

    waveSpawnTimers.push(timerId);
  }
}

function rewardWaveVictory() {
  const moneyReward = 75 + game.wave * 25;
  const xpReward = 40 + game.wave * 15;

  game.money += moneyReward;
  game.addXp(xpReward);
  game.syncHud();
  saveProgress();
}

class Bullet {
  constructor(x, y, target, dmg, color = 'yellow') {
    this.x = x;
    this.y = y;
    this.target = target;
    this.speed = 400;
    this.dmg = dmg;
    this.color = color;
    this.dead = false;
  }

  update(dt) {
    if (this.target.dead) {
      this.dead = true;
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;

    if (step >= dist) {
      this.target.damage(this.dmg);
      this.dead = true;
      return;
    }

    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

renderTowerSelection();
renderLoadout();
renderUpgradeButton();
game.syncHud();
if (readSavedProgress()) continueGameBtn.classList.remove('hidden');

function openGame() {
  menuScreen.classList.add('hidden');
  loadoutScreen.classList.remove('hidden');
}

menuStartBtn.addEventListener('click', () => {
  const progress = readSavedProgress();
  if (progress) {
    restoreProgress(progress);
    menuScreen.classList.add('hidden');
    loadoutScreen.classList.add('hidden');
    gameShell.classList.remove('hidden');
    return;
  }
  openGame();
});

continueGameBtn.addEventListener('click', () => {
  const progress = readSavedProgress();
  if (!progress) return;
  restoreProgress(progress);
  menuScreen.classList.add('hidden');
  loadoutScreen.classList.add('hidden');
  gameShell.classList.remove('hidden');
});

enterGameBtn.addEventListener('click', () => {
  clearSavedProgress();
  resetGame();
  loadoutScreen.classList.add('hidden');
  gameShell.classList.remove('hidden');
});

startBtn.addEventListener('click', () => {
  if (running) return;
  spawnWave();
});

upgradeBtn.addEventListener('click', () => {
  if (!selectedTower) return;
  if (selectedTower.level >= selectedTower.maxLevel) return;
  if (game.money < selectedTower.upgradeCost) return;

  game.money -= selectedTower.upgradeCost;
  selectedTower.upgrade();
  game.syncHud();
  saveProgress();
  renderUpgradeButton();
});

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mx = event.clientX - rect.left;
  const my = event.clientY - rect.top;
  const col = Math.floor(mx / GRID_SIZE);
  const row = Math.floor(my / GRID_SIZE);

  const existing = towers.find((tower) => tower.col === col && tower.row === row);
  if (existing) {
    selectedTower = existing;
    renderUpgradeButton();
    return;
  }

  selectedTower = null;
  renderUpgradeButton();

  if (path.some((point) => point.x === col && point.y === row)) return;

  const selectedType = towerTypes.find((tower) => tower.id === selectedTowerId) || towerTypes[0];
  if (!isTowerUnlocked(selectedType) || !isTowerEquipped(selectedType)) return;
  if (selectedType.id === 'farmer' && towers.filter((tower) => tower instanceof FarmerTower).length >= MAX_FARMERS) return;
  const tower = createTower(selectedType, col, row);

  if (game.money >= tower.cost) {
    game.money -= tower.cost;
    towers.push(tower);
    selectedTower = tower;
    game.syncHud();
    saveProgress();
    renderUpgradeButton();
  }
});

function update() {
  const now = performance.now();
  const dt = (now - last) / 1000;
  last = now;

  for (const enemy of enemies) {
    if (!enemy.dead) enemy.update(dt);
    enemy.updateBlood(dt);
  }

  for (const tower of towers) {
    tower.update(dt, enemies);
    if (tower.incomePerTick && tower.incomeDue) {
      game.money += tower.incomePerTick;
      tower.incomeDue = false;
      game.syncHud();
      renderUpgradeButton();
      saveProgress();
    }
  }

  for (const bullet of bullets) {
    if (!bullet.dead) bullet.update(dt);
  }

  for (const minion of crookMinions) {
    if (!minion.dead) minion.update(dt);
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].dead) enemies.splice(i, 1);
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].dead) bullets.splice(i, 1);
  }

  for (let i = crookMinions.length - 1; i >= 0; i--) {
    if (crookMinions[i].dead) crookMinions.splice(i, 1);
  }

  if (running && enemies.length === 0 && waveSpawnTimers.length === 0 && game.wave > 0) {
    running = false;
    rewardWaveVictory();
    renderUpgradeButton();
  }

  if (game.lives <= 0) {
    running = false;
    alert('Game Over');
    clearSavedProgress();
    resetGame();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cellX = x * GRID_SIZE;
      const cellY = y * GRID_SIZE;
      const onPath = path.some((point) => point.x === x && point.y === y);

      const baseColors = ['#1f3d2e', '#213f31', '#264d39', '#1a3328'];
      const shade = baseColors[(x * 3 + y * 5) % baseColors.length];

      ctx.fillStyle = onPath ? '#34d399' : shade;
      ctx.fillRect(cellX + 1, cellY + 1, GRID_SIZE - 2, GRID_SIZE - 2);

      if (!onPath) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fillRect(cellX + 6, cellY + 8, GRID_SIZE * 0.18, GRID_SIZE * 0.18);

        if ((x + y) % 4 === 0) {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
          ctx.beginPath();
          ctx.arc(cellX + GRID_SIZE * 0.7, cellY + GRID_SIZE * 0.72, GRID_SIZE * 0.07, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * GRID_SIZE, 0);
    ctx.lineTo(x * GRID_SIZE, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * GRID_SIZE);
    ctx.lineTo(canvas.width, y * GRID_SIZE);
    ctx.stroke();
  }

  ctx.save();
  ctx.lineCap = 'square';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#064e3b';
  ctx.lineWidth = GRID_SIZE - 4;
  ctx.beginPath();
  ctx.moveTo(path[0].x * GRID_SIZE + GRID_SIZE / 2, path[0].y * GRID_SIZE + GRID_SIZE / 2);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x * GRID_SIZE + GRID_SIZE / 2, path[i].y * GRID_SIZE + GRID_SIZE / 2);
  }
  ctx.stroke();

  ctx.strokeStyle = '#34d399';
  ctx.shadowColor = 'rgba(52, 211, 153, 0.65)';
  ctx.shadowBlur = 14;
  ctx.lineWidth = GRID_SIZE - 10;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(236, 253, 245, 0.32)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 12]);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const ax = a.x * GRID_SIZE + GRID_SIZE / 2;
    const ay = a.y * GRID_SIZE + GRID_SIZE / 2;
    const bx = b.x * GRID_SIZE + GRID_SIZE / 2;
    const by = b.y * GRID_SIZE + GRID_SIZE / 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  const entrance = path[0];
  const exit = path[path.length - 1];
  for (const [point, color, label] of [
    [entrance, '#facc15', 'IN'],
    [exit, '#fb7185', 'OUT']
  ]) {
    const centerX = point.x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = point.y * GRID_SIZE + GRID_SIZE / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, centerX, centerY);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  for (const tower of towers) tower.draw();
  for (const enemy of enemies) enemy.draw();
  for (const minion of crookMinions) minion.draw();
  for (const bullet of bullets) bullet.draw();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
setInterval(saveProgress, 2000);
window.addEventListener('beforeunload', saveProgress);
