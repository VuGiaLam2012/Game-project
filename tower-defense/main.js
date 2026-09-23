import { ScoutTower } from './units/scout.js';
import { RiflemanTower } from './units/hunter.js';
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
import { MoltenBossEnemy } from './enemies/molten-boss.js';
import { FallenKingEnemy } from './enemies/fallen-king.js';
import { VoidReaverEnemy } from './enemies/void-reaver.js';
import { SoldierTower } from './units/soldier.js';
import { PaintballerTower } from './units/paintballer.js';
import { FreezerTower } from './units/freezer.js';
import { MilitantTower } from './units/militant.js';
import { AcePilotTower } from './units/ace-pilot.js';
import { RocketeerTower } from './units/rocketeer.js';
import { MilitaryBaseTower } from './units/military-base.js';
import { CommanderTower } from './units/commander.js';
import { DjBoothTower } from './units/dj-booth.js';
import { PursuitTower } from './units/pursuit.js';
import { RangerTower } from './units/ranger.js';
import { TurretTower } from './units/turret.js';
import { EngineerTower } from './units/engineer.js';
import { WardenTower } from './units/warden.js';
import { ToxicGunnerTower } from './units/toxic-gunner.js';
import { SledgerTower } from './units/sledger.js';
import { ExecutionerTower } from './units/executioner.js';
import { GladiatorTower } from './units/gladiator.js';
import { FrostBlasterTower } from './units/frost-blaster.js';
import { ElfCampTower } from './units/elf-camp.js';
import { NecromancerTower } from './units/necromancer.js';
import { HallowboomerTower } from './units/hallowboomer.js';
import { JesterTower } from './units/jester.js';
import { CryomancerTower } from './units/cryomancer.js';
import { GatlingGunTower } from './units/gatling-gun.js';
import { WarMachineTower } from './units/war-machine.js'

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menu-screen');
const inventoryScreen = document.getElementById('inventory-screen');
const loadoutScreen = document.getElementById('loadout-screen');
const gameShell = document.getElementById('game');
const menuStartBtn = document.getElementById('menu-start');
const continueGameBtn = document.getElementById('continue-game');
const continueToLoadoutBtn = document.getElementById('continue-to-loadout');
const enterGameBtn = document.getElementById('enter-game');
const startBtn = document.getElementById('start');
const autoSkipBtn = document.getElementById('auto-skip');
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
const gemsEl = document.getElementById('gems');
const battleGemsEl = document.getElementById('battle-gems');
const openSkinCrateBtn = document.getElementById('open-skin-crate');
const openGoldenCrateBtn = document.getElementById('open-golden-crate');
const crateStatusEl = document.getElementById('crate-status');
const livesEl = document.getElementById('lives');
const battleStatusEl = document.getElementById('battle-status');
const waveBannerEl = document.getElementById('wave-banner');
const towerSelect = document.getElementById('tower-select');
const loadoutSlots = document.getElementById('loadout-slots');
const loadoutUnitSelect = document.getElementById('loadout-unit-select');
const modeSelect = document.getElementById('mode-select');
const mapSelect = document.getElementById('map-select');
const resultOverlay = document.getElementById('result-overlay');
const resultTitle = document.getElementById('result-title');
const resultText = document.getElementById('result-text');
const resultActionBtn = document.getElementById('result-action');
const SAVE_KEY = 'zombie-siege-progress-v1';
const MAX_LOADOUT = 5;
const STARTER_TOWERS = ['scout'];

const game = {
  money: 1000,
  gems: 0,
  lives: 10,
  wave: 0,
  mode: 'molten',
  rewardScale: 1,
  map: 'green-run',
  level: 1,
  xp: 0,
  unlockedTowers: [...STARTER_TOWERS],
  equippedTowers: [...STARTER_TOWERS],
  towerSkins: {},
  enemies: [],
  running: false,
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
    gemsEl.textContent = this.gems;
    battleGemsEl.textContent = this.gems;
    livesEl.textContent = this.lives;
  }
};

let waveBannerTimer = null;

function setBattleStatus(message) {
  if (battleStatusEl) {
    battleStatusEl.textContent = message;
  }
}

function showWaveBanner(message, tone = 'normal') {
  if (!waveBannerEl) return;
  waveBannerEl.textContent = message;
  waveBannerEl.dataset.tone = tone;
  waveBannerEl.classList.remove('hidden');

  if (waveBannerTimer !== null) {
    clearTimeout(waveBannerTimer);
  }

  waveBannerTimer = setTimeout(() => {
    waveBannerEl.classList.add('hidden');
    waveBannerTimer = null;
  }, 1600);
}

function hideWaveBanner() {
  if (!waveBannerEl) return;
  waveBannerEl.classList.add('hidden');
  if (waveBannerTimer !== null) {
    clearTimeout(waveBannerTimer);
    waveBannerTimer = null;
  }
}

function showResultOverlay(title, message, actionLabel = 'Retry') {
  if (!resultOverlay || !resultTitle || !resultText || !resultActionBtn) return;
  resultTitle.textContent = title;
  resultText.textContent = message;
  resultActionBtn.textContent = actionLabel;
  resultOverlay.classList.remove('hidden');
}

function hideResultOverlay() {
  if (!resultOverlay) return;
  resultOverlay.classList.add('hidden');
}

const towerTypes = [
  { id: 'scout', name: 'Scout', cost: 50, unlockLevel: 1, color: '#8b5cf6', TowerClass: ScoutTower },
  { id: 'rifleman', name: 'Hunter', cost: 75, unlockLevel: 1, unlockCost: 350, color: '#3b82f6', TowerClass: RiflemanTower },
  { id: 'shotgunner', name: 'Shotgunner', cost: 95, unlockLevel: 1, unlockCost: 500, color: '#f59e0b', TowerClass: ShotgunnerTower },
  { id: 'crook-boss', name: 'Crook Boss', cost: 130, unlockLevel: 25, unlockCost: 12000, color: '#ef4444', TowerClass: CrookBossTower },
  { id: 'accelerator', name: 'Accelerator', cost: 7500, unlockLevel: 50, unlockGems: 2500, color: '#22c55e', TowerClass: AcceleratorTower },
  { id: 'sniper', name: 'Sniper', cost: 210, unlockLevel: 1, unlockCost: 300, color: '#06b6d4', TowerClass: SniperTower },
  { id: 'guardian', name: 'Guardian', cost: 185, unlockLevel: 1, unlockCost: 10000, color: '#f43f5e', TowerClass: GuardianTower },
  { id: 'tesla', name: 'Tesla', cost: 240, unlockLevel: 1, unlockCost: 3000, color: '#eab308', TowerClass: TeslaTower },
  { id: 'farmer', name: 'Farmer', cost: 300, unlockLevel: 1, unlockCost: 2000, color: '#84cc16', TowerClass: FarmerTower },
  { id: 'demoman', name: 'Demoman', cost: 420, unlockLevel: 1, unlockCost: 600, color: '#f97316', TowerClass: DemomanTower },
  { id: 'medic', name: 'Medic', cost: 350, unlockLevel: 1, unlockCost: 2500, color: '#ec4899', TowerClass: MedicTower },
  { id: 'electroshocker', name: 'Electroshocker', cost: 520, unlockLevel: 1, unlockCost: 3000, color: '#a855f7', TowerClass: ElectroshockerTower },
  { id: 'minigunner', name: 'Minigunner', cost: 650, unlockLevel: 1, unlockCost: 5000, color: '#64748b', TowerClass: MinigunnerTower },
  { id: 'soldier', name: 'Soldier', cost: 100, unlockLevel: 1, unlockCost: 350, color: '#475569', TowerClass: SoldierTower },
  { id: 'paintballer', name: 'Paintballer', cost: 125, unlockLevel: 1, unlockCost: 400, color: '#ec4899', TowerClass: PaintballerTower },
  { id: 'freezer', name: 'Freezer', cost: 150, unlockLevel: 1, unlockCost: 450, color: '#67e8f9', TowerClass: FreezerTower },
  { id: 'militant', name: 'Militant', cost: 250, unlockLevel: 1, unlockCost: 750, color: '#84cc16', TowerClass: MilitantTower },
  { id: 'ace-pilot', name: 'Ace Pilot', cost: 350, unlockLevel: 1, unlockCost: 1200, color: '#0ea5e9', TowerClass: AcePilotTower },
  { id: 'rocketeer', name: 'Rocketeer', cost: 400, unlockLevel: 1, unlockCost: 1500, color: '#f97316', TowerClass: RocketeerTower },
  { id: 'military-base', name: 'Military Base', cost: 500, unlockLevel: 1, unlockCost: 2000, color: '#166534', TowerClass: MilitaryBaseTower },
  { id: 'commander', name: 'Commander', cost: 350, unlockLevel: 1, unlockCost: 2500, color: '#1d4ed8', TowerClass: CommanderTower },
  { id: 'dj-booth', name: 'DJ Booth', cost: 450, unlockLevel: 1, unlockCost: 2500, color: '#db2777', TowerClass: DjBoothTower },
  { id: 'pursuit', name: 'Pursuit', cost: 700, unlockLevel: 1, unlockCost: 3500, color: '#0284c7', TowerClass: PursuitTower },
  { id: 'ranger', name: 'Ranger', cost: 800, unlockLevel: 1, unlockCost: 4500, color: '#0f766e', TowerClass: RangerTower },
  { id: 'turret', name: 'Turret', cost: 1000, unlockLevel: 1, unlockCost: 6000, color: '#475569', TowerClass: TurretTower },
  { id: 'engineer', name: 'Engineer', cost: 850, unlockLevel: 1, unlockCost: 7500, color: '#facc15', TowerClass: EngineerTower },
  { id: 'warden', name: 'Warden', cost: 600, unlockLevel: 1, unlockCost: 5000, color: '#a3e635', TowerClass: WardenTower },
  { id: 'toxic-gunner', name: 'Toxic Gunner', cost: 650, unlockLevel: 1, unlockCost: 5500, color: '#84cc16', TowerClass: ToxicGunnerTower },
  { id: 'sledger', name: 'Sledger', cost: 500, unlockLevel: 1, unlockCost: 4000, color: '#94a3b8', TowerClass: SledgerTower },
  { id: 'executioner', name: 'Executioner', cost: 700, unlockLevel: 1, unlockCost: 6500, color: '#7c3aed', TowerClass: ExecutionerTower },
  { id: 'gladiator', name: 'Gladiator', cost: 300, unlockLevel: 1, unlockCost: 5000, color: '#dc2626', TowerClass: GladiatorTower },
  { id: 'frost-blaster', name: 'Frost Blaster', cost: 400, unlockLevel: 1, unlockCost: 4500, color: '#38bdf8', TowerClass: FrostBlasterTower },
  { id: 'elf-camp', name: 'Elf Camp', cost: 550, unlockLevel: 1, unlockCost: 5000, color: '#16a34a', TowerClass: ElfCampTower },
  { id: 'necromancer', name: 'Necromancer', cost: 900, unlockLevel: 1, unlockCost: 8000, color: '#9333ea', TowerClass: NecromancerTower },
  { id: 'hallowboomer', name: 'Hallowboomer', cost: 450, unlockLevel: 1, unlockCost: 4000, color: '#fbbf24', TowerClass: HallowboomerTower },
  { id: 'jester', name: 'Jester', cost: 500, unlockLevel: 1, unlockCost: 5000, color: '#e879f9', TowerClass: JesterTower },
  { id: 'cryomancer', name: 'Cryomancer', cost: 500, unlockLevel: 1, unlockCost: 5500, color: '#22d3ee', TowerClass: CryomancerTower },
  { id: 'gatling-gun', name: 'Gatling Gun', cost: 1200, unlockLevel: 1, unlockCost: 10000, color: '#64748b', TowerClass: GatlingGunTower },
  { id: 'war-machine', name: 'War Machine', cost: 2000, unlockLevel: 1, unlockCost: 20000, color: '#b91c1c', TowerClass: WarMachineTower }
];

const gameModes = [
  { id: 'easy', name: 'Easy', description: '30 waves with forgiving enemy health and speed.', lives: 20, hpScale: 0.8, speedScale: 0.85, rewardScale: 0.8, maxWaves: 30, bossClass: BossEnemy },
  { id: 'molten', name: 'Molten', description: '40 waves ending with the Molten Boss.', lives: 15, hpScale: 1, speedScale: 1, rewardScale: 1, maxWaves: 40, bossClass: MoltenBossEnemy },
  { id: 'fallen', name: 'Fallen', description: '40 waves ending with the Fallen King.', lives: 10, hpScale: 1.35, speedScale: 1.15, rewardScale: 1.35, maxWaves: 40, gemRewardScale: 1.5, bossClass: FallenKingEnemy },
  { id: 'hardcore', name: 'Hardcore', description: '50 waves, one life, extreme enemies, and gem rewards.', lives: 1, hpScale: 1.8, speedScale: 1.35, rewardScale: 1.5, gemRewardScale: 3, maxWaves: 50, finalGemReward: 500, bossClass: VoidReaverEnemy }
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

const maps = [
  {
    id: 'green-run',
    name: 'Green Run',
    description: 'A balanced route for learning the defense.',
    path: defaultPath
  },
  {
    id: 'crossroads',
    name: 'Crossroads',
    description: 'A longer route with two sharp turns.',
    path: [
      { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 },
      { x: 3, y: 6 }, { x: 3, y: 5 }, { x: 3, y: 4 }, { x: 4, y: 4 },
      { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 7, y: 5 },
      { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 },
      { x: 10, y: 7 }, { x: 11, y: 7 }, { x: 12, y: 7 }, { x: 13, y: 7 },
      { x: 14, y: 7 }, { x: 15, y: 7 }, { x: 16, y: 7 }, { x: 17, y: 7 },
      { x: 18, y: 7 }, { x: 19, y: 7 }
    ]
  }
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
let hoverCell = null;
let path = defaultPath;
let selectedMapId = 'green-run';
let last = performance.now();
let running = false;
let autoSkip = false;
let autoSkipTimer = null;
let autoSkipCountdownTimer = null;
let autoSkipCountdown = 0;

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
      gems: game.gems,
      lives: game.lives,
      wave: game.wave,
      mode: game.mode,
      map: selectedMapId,
      level: game.level,
      xp: game.xp,
      unlockedTowers: game.unlockedTowers,
      equippedTowers: game.equippedTowers,
      towerSkins: game.towerSkins,
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
  let tower;
  const skin = game.towerSkins[type.id] || 'classic';
  tower = new type.TowerClass(col, row, ctx, GRID_SIZE, (x, y, target, dmg, color) => {
    bullets.push(new Bullet(x, y, target, dmg, color, tower?.isLaser ? 'laser' : 'bullet'));
  }, skin);
  tower.game = game;
  return tower;
}

class CrookMinion {
  constructor(owner, route) {
    this.owner = owner;
    this.path = route?.length ? route : defaultPath;
    this.pathIndex = this.path.length - 1;
    const endPoint = this.path[this.pathIndex] || this.path[0];
    this.x = endPoint.x * GRID_SIZE + GRID_SIZE / 2;
    this.y = endPoint.y * GRID_SIZE + GRID_SIZE / 2;
    this.target = null;
    this.speed = 86;
    this.damage = owner.minionDamage;
    this.attackCooldown = 0;
    this.life = owner.getMinionLife ? owner.getMinionLife() : 25;
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

    const nearbyTarget = enemies
      .filter((enemy) => !enemy.dead)
      .map((enemy) => ({
        enemy,
        distance: Math.hypot(enemy.x - this.x, enemy.y - this.y)
      }))
      .filter(({ distance }) => distance <= 24)
      .sort((a, b) => a.distance - b.distance)[0];

    this.target = nearbyTarget?.enemy || null;
    if (this.target) {
      if (this.attackCooldown <= 0) {
        this.target.damage(this.damage);
        this.attackCooldown = 1.1;
      }
      return;
    }

    if (this.pathIndex > 0) {
      const currentNode = this.path[this.pathIndex];
      const nextNode = this.path[this.pathIndex - 1];
      const targetX = nextNode.x * GRID_SIZE + GRID_SIZE / 2;
      const targetY = nextNode.y * GRID_SIZE + GRID_SIZE / 2;
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= 2) {
        this.pathIndex -= 1;
        if (this.pathIndex === 0) this.dead = true;
        return;
      }

      this.x += (dx / distance) * this.speed * dt;
      this.y += (dy / distance) * this.speed * dt;
      return;
    }

    this.dead = true;
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
  crookMinions.push(new CrookMinion(owner, path));
}

game.spawnCrook = spawnCrookMinion;

function restoreProgress(progress) {
  clearWaveSpawns();
  enemies.length = 0;
  crookMinions.length = 0;
  bullets.length = 0;
  towers.length = 0;
  game.money = Number(progress.money) || 1000;
  game.gems = Math.max(0, Number(progress.gems) || 0);
  game.lives = Number(progress.lives) || 10;
  game.wave = Number(progress.wave) || 0;
  game.mode = gameModes.some((mode) => mode.id === progress.mode) ? progress.mode : 'molten';
  game.rewardScale = (gameModes.find((mode) => mode.id === game.mode) || gameModes[1]).rewardScale;
  selectedMapId = maps.some((map) => map.id === progress.map) ? progress.map : 'green-run';
  path = maps.find((map) => map.id === selectedMapId).path;
  game.level = Math.max(1, Number(progress.level) || 1);
  game.xp = Math.max(0, Number(progress.xp) || 0);
  game.unlockedTowers = Array.isArray(progress.unlockedTowers)
    ? progress.unlockedTowers.filter((id) => towerTypes.some((type) => type.id === id))
    : [...STARTER_TOWERS];
  for (const starter of STARTER_TOWERS) {
    if (!game.unlockedTowers.includes(starter)) game.unlockedTowers.push(starter);
  }
  game.equippedTowers = Array.isArray(progress.equippedTowers)
    ? progress.equippedTowers.filter((id) => game.unlockedTowers.includes(id)).slice(0, MAX_LOADOUT)
    : game.unlockedTowers.slice(0, MAX_LOADOUT);
  game.towerSkins = progress.towerSkins && typeof progress.towerSkins === 'object'
    ? progress.towerSkins
    : {};
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
  game.running = false;
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
  const hasCurrency = type.unlockGems
    ? game.gems >= type.unlockGems
    : !type.unlockCost || game.money >= type.unlockCost;
  return !isTowerUnlocked(type) && game.level >= type.unlockLevel && hasCurrency;
}

function unlockTower(type) {
  if (!canUnlockTower(type)) return false;
  if (type.unlockGems) {
    game.gems -= type.unlockGems;
  } else if (type.unlockCost) {
    game.money -= type.unlockCost;
  }
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

function clearAutoSkip() {
  if (autoSkipTimer !== null) {
    clearTimeout(autoSkipTimer);
    autoSkipTimer = null;
  }
  if (autoSkipCountdownTimer !== null) {
    clearInterval(autoSkipCountdownTimer);
    autoSkipCountdownTimer = null;
  }
  autoSkipCountdown = 0;
  autoSkipBtn.textContent = `Auto Skip: ${autoSkip ? 'On' : 'Off'}`;
}

function scheduleAutoSkip() {
  clearAutoSkip();
  if (!autoSkip || game.lives <= 0) return;

  autoSkipCountdown = 5;
  autoSkipBtn.textContent = `Auto Skip: Next wave in ${autoSkipCountdown}s`;
  autoSkipCountdownTimer = setInterval(() => {
    autoSkipCountdown -= 1;
    if (autoSkipCountdown > 0) {
      autoSkipBtn.textContent = `Auto Skip: Next wave in ${autoSkipCountdown}s`;
    }
    if (autoSkipCountdown <= 0) {
      clearInterval(autoSkipCountdownTimer);
      autoSkipCountdownTimer = null;
    }
  }, 1000);

  autoSkipTimer = setTimeout(() => {
    autoSkipTimer = null;
    autoSkipCountdown = 0;
    if (!running && autoSkip && game.lives > 0) spawnWave();
    autoSkipBtn.textContent = `Auto Skip: ${autoSkip ? 'On' : 'Off'}`;
  }, 5000);
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
    const requirement = type.unlockGems
      ? `${type.unlockGems.toLocaleString()} gems`
      : `${(type.unlockCost || 0).toLocaleString()} coins`;
    btn.title = unlocked ? `${type.name} - $${type.cost}` : `${type.name} - Unlock at level ${type.unlockLevel} for ${requirement}`;
    btn.disabled = !unlocked && !unlockReady;
    btn.addEventListener('click', () => {
      if (!unlocked) {
        unlockTower(type);
        return;
      }
      selectedTowerId = type.id;
      renderTowerSelection();
      setBattleStatus(`${type.name} selected — place on the field`);
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
    const unlockLabel = type.unlockGems
      ? game.level < type.unlockLevel
        ? `Unlocks at level ${type.unlockLevel}`
        : `Unlock for ${type.unlockGems.toLocaleString()} gems`
      : !type.unlockCost
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
      game.rewardScale = mode.rewardScale;
      game.lives = mode.lives;
      game.syncHud();
      saveProgress(true);
      renderLoadout();
    });
    modeSelect.appendChild(btn);
  });

  mapSelect.innerHTML = '';
  maps.forEach((map) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mode-option' + (selectedMapId === map.id ? ' selected' : '');
    btn.innerHTML = `<strong>${map.name}</strong><small>${map.description}</small>`;
    btn.addEventListener('click', () => {
      selectedMapId = map.id;
      path = map.path;
      renderLoadout();
    });
    mapSelect.appendChild(btn);
  });
}

function resetGame() {
  clearWaveSpawns();
  clearAutoSkip();
  enemies.length = 0;
  crookMinions.length = 0;
  bullets.length = 0;
  towers.length = 0;
  hoverCell = null;
  selectedTower = null;
  selectedTowerId = towerTypes[0].id;
  game.money = 1000;
  game.gems = 0;
  game.level = 1;
  game.xp = 0;
  game.unlockedTowers = [...STARTER_TOWERS];
  game.equippedTowers = [...STARTER_TOWERS];
  game.towerSkins = {};
  game.lives = 10;
  game.wave = 0;
  selectedMapId = maps.some((map) => map.id === selectedMapId) ? selectedMapId : 'green-run';
  path = maps.find((map) => map.id === selectedMapId).path;
  const mode = gameModes.find((item) => item.id === game.mode) || gameModes[1];
  game.lives = mode.lives;
  game.rewardScale = mode.rewardScale;
  setBattleStatus('Prepare your defense');
  hideWaveBanner();
  hideResultOverlay();
  running = false;
  game.running = false;
  last = performance.now();
  renderTowerSelection();
  renderLoadout();
  game.syncHud();
  renderUpgradeButton();
}

function spawnEnemy(type, hp, speed, bossClass = null) {
  const enemyConfig = enemyTypes.find((item) => item.id === type) || enemyTypes[0];
  const EnemyClass = type === 'boss' && bossClass ? bossClass : enemyConfig.EnemyClass;
  enemies.push(new EnemyClass(path, ctx, GRID_SIZE, hp, speed, game));
}

function getEnemyStatsForType(type, wave, mode) {
  const baseHpByType = {
    walker: 36 + wave * 6,
    runner: 28 + wave * 5,
    tank: 90 + wave * 17,
    brute: 150 + wave * 24,
    boss: 420 + wave * 70
  };
  const baseSpeedByType = {
    walker: (42 + wave * 2.5) * mode.speedScale,
    runner: (54 + wave * 3.2) * mode.speedScale,
    tank: (30 + wave * 1.8) * mode.speedScale,
    brute: (36 + wave * 2.1) * mode.speedScale,
    boss: (22 + wave * 1.1) * mode.speedScale
  };

  const hp = Math.max(12, Math.round((baseHpByType[type] || baseHpByType.walker) * mode.hpScale));
  const speed = (baseSpeedByType[type] || baseSpeedByType.walker) * (type === 'boss' ? 0.9 : 1);

  return { hp, speed };
}

function buildWaveQueue(wave, mode) {
  const queue = [];
  const total = 5 + (wave - 1) * 3;
  const bossWave = wave === mode.maxWaves;
  const modePools = {
    easy: ['walker', 'walker', 'runner'],
    molten: ['walker', 'runner', 'runner', 'tank'],
    fallen: ['walker', 'runner', 'tank', 'brute', 'brute'],
    hardcore: ['runner', 'tank', 'brute', 'brute', 'boss']
  };
  const pool = modePools[mode.id] || modePools.molten;

  for (let i = 0; i < total; i++) {
    let type = pool[Math.floor(Math.random() * pool.length)];

    if (bossWave && i === total - 1) {
      type = 'boss';
    } else if (mode.id === 'easy') {
      type = wave >= 3 && i % 3 === 0 ? 'runner' : 'walker';
    } else if (mode.id === 'molten') {
      if (wave < 5) type = i % 3 === 0 ? 'runner' : 'walker';
      if (wave >= 5 && i % 4 === 0) type = 'tank';
      if (wave >= 15 && i % 5 === 0) type = 'brute';
    } else if (mode.id === 'fallen') {
      if (wave < 5) type = i % 2 === 0 ? 'walker' : 'runner';
      if (wave >= 5 && i % 3 === 0) type = 'tank';
      if (wave >= 10 && i % 4 === 0) type = 'brute';
    } else if (mode.id === 'hardcore') {
      if (wave < 2) type = 'runner';
      if (wave >= 5 && i % 3 === 0) type = 'tank';
      if (wave >= 10 && i % 4 === 0) type = 'brute';
    }

    queue.push(type);
  }

  if (bossWave && !queue.includes('boss')) {
    queue[queue.length - 1] = 'boss';
  }

  return queue;
}

function spawnWave() {
  clearWaveSpawns();

  const mode = gameModes.find((item) => item.id === game.mode) || gameModes[1];
  const maxWaves = mode.maxWaves || 8;
  if (game.wave >= maxWaves) return;

  const wave = game.wave + 1;
  const queue = buildWaveQueue(wave, mode);
  const spawnGap = Math.max(220, (720 - wave * 28) / mode.speedScale);

  game.wave = wave;
  running = true;
  game.running = true;
  const bossWave = wave === mode.maxWaves;
  showWaveBanner(bossWave ? `Boss wave ${wave}` : `Wave ${wave}`, bossWave ? 'boss' : 'normal');
  setBattleStatus(`Wave ${wave} incoming — ${mode.name} mode`);
  saveProgress();

  queue.forEach((type, index) => {
    const timerId = setTimeout(() => {
      const { hp, speed } = getEnemyStatsForType(type, wave, mode);
      spawnEnemy(type, hp, speed, type === 'boss' ? mode.bossClass : null);

      const queueIndex = waveSpawnTimers.indexOf(timerId);
      if (queueIndex >= 0) {
        waveSpawnTimers.splice(queueIndex, 1);
      }
    }, index * spawnGap);

    waveSpawnTimers.push(timerId);
  });
}

function rewardWaveVictory() {
  const rewardScale = game.rewardScale ?? 1;
  const mode = gameModes.find((item) => item.id === game.mode) || gameModes[1];
  const moneyReward = Math.round((75 + game.wave * 25) * rewardScale);
  const xpReward = Math.round((40 + game.wave * 15) * rewardScale);
  const isHardcore = mode.id === 'hardcore';
  const gemReward = isHardcore
    ? Math.max(1, Math.round((5 + game.wave * 2) * mode.gemRewardScale))
      + (game.wave === mode.maxWaves ? mode.finalGemReward || 0 : 0)
    : 0;

  game.money += moneyReward;
  if (gemReward > 0) game.gems += gemReward;
  game.addXp(xpReward);
  const rewardMessage = isHardcore && game.wave === mode.maxWaves
    ? `Hardcore complete! +${gemReward} gems`
    : isHardcore
      ? `Victory! Wave ${game.wave} cleared (+$${moneyReward}, +${gemReward} gems, +${xpReward} XP)`
      : `Victory! Wave ${game.wave} cleared (+$${moneyReward}, +${xpReward} XP)`;
  setBattleStatus(rewardMessage);
  game.syncHud();
  saveProgress();
}

function openSkinCrate() {
  const crateCost = 1000;
  if (game.money < crateCost) {
    crateStatusEl.textContent = `You need ${crateCost.toLocaleString()} coins to open a crate.`;
    return;
  }

  const eligibleTowers = towerTypes.filter((type) => type.id !== 'scout');
  const tower = eligibleTowers[Math.floor(Math.random() * eligibleTowers.length)];
  const skins = ['neon', 'shadow'];
  const skin = skins[Math.floor(Math.random() * skins.length)];

  game.money -= crateCost;
  game.towerSkins[tower.id] = skin;
  crateStatusEl.textContent = `${tower.name} received the ${skin} skin!`;
  game.syncHud();
  saveProgress(true);
  renderTowerSelection();
}

function openGoldenCrate() {
  const crateCost = 50000;
  if (game.money < crateCost) {
    crateStatusEl.textContent = `You need ${crateCost.toLocaleString()} coins to open a Golden Crate.`;
    return;
  }

  const eligibleTowers = towerTypes.filter((type) => type.id !== 'scout');
  const tower = eligibleTowers[Math.floor(Math.random() * eligibleTowers.length)];

  game.money -= crateCost;
  game.towerSkins[tower.id] = 'golden';
  crateStatusEl.textContent = `${tower.name} received the Golden skin!`;
  game.syncHud();
  saveProgress(true);
  renderTowerSelection();
}

class Bullet {
  constructor(x, y, target, dmg, color = 'yellow', type = 'bullet') {
    this.x = x;
    this.y = y;
    this.target = target;
    this.speed = 400;
    this.dmg = dmg;
    this.color = color;
    this.type = type;
    this.dead = false;
    this.life = type === 'laser' ? 0.08 : 999;
    this.hitDone = false;
  }

  update(dt) {
    if (this.target.dead) {
      this.dead = true;
      return;
    }

    if (this.type === 'laser') {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (!this.hitDone && dist <= 28) {
        this.target.damage(this.dmg);
        this.hitDone = true;
      }
      this.life -= dt;
      if (this.life <= 0 || this.hitDone) {
        this.dead = true;
      }
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
    if (this.type === 'laser') {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + (dx / dist) * 24, this.y + (dy / dist) * 24);
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

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
setBattleStatus('Prepare your defense');
if (readSavedProgress()) continueGameBtn.classList.remove('hidden');

function openGame() {
  menuScreen.classList.add('hidden');
  inventoryScreen.classList.remove('hidden');
  loadoutScreen.classList.add('hidden');
}

function openBattleSettings() {
  inventoryScreen.classList.add('hidden');
  loadoutScreen.classList.remove('hidden');
}

function returnToLobby() {
  hideResultOverlay();
  clearAutoSkip();
  clearWaveSpawns();
  menuScreen.classList.remove('hidden');
  inventoryScreen.classList.add('hidden');
  loadoutScreen.classList.add('hidden');
  gameShell.classList.add('hidden');
}

menuStartBtn.addEventListener('click', () => {
  hideResultOverlay();
  const progress = readSavedProgress();
  if (progress) {
    restoreProgress(progress);
    menuScreen.classList.add('hidden');
    openGame();
    return;
  }
  openGame();
});

continueGameBtn.addEventListener('click', () => {
  hideResultOverlay();
  const progress = readSavedProgress();
  if (!progress) return;
  restoreProgress(progress);
  menuScreen.classList.add('hidden');
  openGame();
});

continueToLoadoutBtn.addEventListener('click', openBattleSettings);
openSkinCrateBtn.addEventListener('click', openSkinCrate);
openGoldenCrateBtn.addEventListener('click', openGoldenCrate);

enterGameBtn.addEventListener('click', () => {
  hideResultOverlay();
  clearSavedProgress();
  resetGame();
  inventoryScreen.classList.add('hidden');
  loadoutScreen.classList.add('hidden');
  gameShell.classList.remove('hidden');
});

resultActionBtn.addEventListener('click', () => {
  hideResultOverlay();
  clearSavedProgress();
  resetGame();
  menuScreen.classList.remove('hidden');
  inventoryScreen.classList.add('hidden');
  loadoutScreen.classList.add('hidden');
  gameShell.classList.add('hidden');
});

startBtn.addEventListener('click', () => {
  if (running) return;
  clearAutoSkip();
  spawnWave();
});

autoSkipBtn.addEventListener('click', () => {
  autoSkip = !autoSkip;
  autoSkipBtn.setAttribute('aria-pressed', String(autoSkip));
  autoSkipBtn.classList.toggle('enabled', autoSkip);
  clearAutoSkip();
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

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mx = event.clientX - rect.left;
  const my = event.clientY - rect.top;
  hoverCell = {
    col: Math.floor(mx / GRID_SIZE),
    row: Math.floor(my / GRID_SIZE)
  };
});

canvas.addEventListener('mouseleave', () => {
  hoverCell = null;
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
    setBattleStatus(`${existing.name} selected — ready to upgrade`);
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
    setBattleStatus(`${tower.name} deployed — range ${tower.range}px`);
    game.syncHud();
    saveProgress();
    renderUpgradeButton();
  } else {
    setBattleStatus(`Not enough money for ${selectedType.name}`);
  }
});

function update() {
  const now = performance.now();
  const dt = (now - last) / 1000;
  last = now;

  for (const enemy of enemies) {
    enemy.updateDamagePopups(dt);
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
    game.running = false;

    const mode = gameModes.find((item) => item.id === game.mode) || gameModes[1];
    const maxWaves = mode.maxWaves || 8;
    if (game.wave >= maxWaves) {
      rewardWaveVictory();
      saveProgress(true);
      setBattleStatus(game.mode === 'hardcore' ? 'Hardcore victory! The horde is defeated.' : 'Victory! The siege is won.');
      returnToLobby();
      return;
    }

    rewardWaveVictory();
    scheduleAutoSkip();
    renderUpgradeButton();
  }

  if (game.lives <= 0) {
    running = false;
    game.running = false;
    clearAutoSkip();
    setBattleStatus('Game over — the horde broke through');
    showResultOverlay('Defeat', 'The horde reached the exit. Try a different loadout and hold the line.', 'Retry');
    clearSavedProgress();
  }
}

function getPlacementState(col, row) {
  if (path.some((point) => point.x === col && point.y === row)) return 'blocked';
  if (towers.some((tower) => tower.col === col && tower.row === row)) return 'occupied';
  return 'free';
}

function drawPlacementPreview() {
  if (hoverCell == null) return;

  const { col, row } = hoverCell;
  const state = getPlacementState(col, row);
  const x = col * GRID_SIZE;
  const y = row * GRID_SIZE;
  const selectedType = towerTypes.find((item) => item.id === selectedTowerId) || towerTypes[0];

  ctx.save();
  ctx.fillStyle = state === 'free' ? 'rgba(34, 197, 94, 0.22)' : 'rgba(239, 68, 68, 0.22)';
  ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
  ctx.strokeStyle = state === 'free' ? '#4ade80' : '#f87171';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 4, y + 4, GRID_SIZE - 8, GRID_SIZE - 8);

  const tower = createTower(selectedType, col, row);
  const rangeRadius = tower.range;
  ctx.beginPath();
  ctx.arc(col * GRID_SIZE + GRID_SIZE / 2, row * GRID_SIZE + GRID_SIZE / 2, rangeRadius, 0, Math.PI * 2);
  ctx.strokeStyle = state === 'free' ? 'rgba(74, 222, 128, 0.7)' : 'rgba(248, 113, 113, 0.7)';
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
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

  for (const tower of towers) {
    ctx.save();
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    tower.draw();
  }

  drawPlacementPreview();

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
