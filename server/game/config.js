import { ENEMY_TYPES } from "../enemies/index.js";
import { TOWER_TYPES } from "../towers/index.js";
import { WAVE_SCHEDULES } from "../waves/index.js";

export const CONFIG = Object.freeze({
  startingCash: 500,
  enemyReward: 15,
  enemySpeed: 8,
  enemyHealth: 60,
  enemySpawnInterval: 0.8,
  breakBetweenWaves: 5,
  maxTowersPerPlayer: 12,
  summonedUnitSpeed: 10,
  maxUnitLevel: 10,
  towerSpacing: 8,
  towerPathClearance: 11,
  towerTypes: TOWER_TYPES,
  enemyTypes: ENEMY_TYPES,
  waveSchedules: WAVE_SCHEDULES,
  baseHealth: 20,
  maxPlayers: 6,
  bossHealthMultiplier: 6,
  bossLeakDamage: 5,
  abilities: {
    airstrike: { cooldown: 25, radius: 14, damage: 120, duration: 1.3 },
    freeze: { cooldown: 35, duration: 5 },
    cashBoost: { cooldown: 45, duration: 10, multiplier: 2 },
  },
  modes: {
    story: {
      label: "Story Mode",
      description: "A 40-wave campaign with a final boss and rising enemy variety.",
      baseHealth: 20,
      waveLimit: 40,
      schedule: "story",
      breakBetweenWaves: 5,
    },
    hardcoreVolcano: {
      label: "Hardcore Act 1 · Volcano Spirit",
      description: "A 25-wave fire act ending with the Volcano Spirit.",
      baseHealth: 20,
      waveLimit: 25,
      schedule: "volcano",
      breakBetweenWaves: 4,
    },
    hardcoreOcean: {
      label: "Hardcore Act 2 · Ocean Spirit",
      description: "A 25-wave attrition act ending with the Ocean Spirit.",
      baseHealth: 20,
      waveLimit: 25,
      schedule: "ocean",
      breakBetweenWaves: 4,
    },
    hardcoreForest: {
      label: "Hardcore Act 3 · Forest Spirit",
      description: "A 25-wave summoning act ending with the Forest Spirit.",
      baseHealth: 20,
      waveLimit: 25,
      schedule: "forest",
      breakBetweenWaves: 4,
    },
    hardcoreLightning: {
      label: "Hardcore Act 4 · Lightning Spirit",
      description: "A 25-wave speed act ending with the Lightning Spirit.",
      baseHealth: 20,
      waveLimit: 25,
      schedule: "lightning",
      breakBetweenWaves: 4,
    },
    hardcoreGambler: {
      label: "Hardcore Act 5 · Gambler Supreme",
      description: "A 25-wave random-modifier act ending with Gambler Supreme.",
      baseHealth: 20,
      waveLimit: 25,
      schedule: "gambler",
      randomModifiers: true,
      breakBetweenWaves: 4,
    },
    hardcoreManipulator: {
      label: "Hardcore Act 6 · Wraith Conjurer",
      description: "A 25-wave enemy-swarm act ending with the Wraith Conjurer.",
      baseHealth: 20,
      waveLimit: 25,
      schedule: "manipulator",
      breakBetweenWaves: 4,
    },
    hardcoreHeavenly: {
      label: "Hardcore Act 7 · Skybound Duelist",
      description: "A 25-wave elite act ending with the Skybound Duelist.",
      baseHealth: 20,
      waveLimit: 25,
      schedule: "heavenly",
      breakBetweenWaves: 4,
    },
    hardcoreDomain: {
      label: "Hardcore Act 8 · Domain Master",
      description: "A 25-wave debuff act ending with the Domain Master.",
      baseHealth: 20,
      waveLimit: 25,
      schedule: "domain",
      breakBetweenWaves: 4,
    },
    hardcoreKing: {
      label: "Hardcore Act 9 · Cursed Sovereign",
      description: "The 25-wave final act, ending with the Cursed Sovereign.",
      baseHealth: 20,
      waveLimit: 25,
      schedule: "king",
      breakBetweenWaves: 4,
    },
    normal: {
      label: "Normal",
      description: "Balanced waves and 20 base health.",
      baseHealth: 20,
      waveLimit: 20,
      speedMultiplier: 1,
      healthMultiplier: 1,
      enemyCountBonus: 0,
      breakBetweenWaves: 5,
      bossEvery: 5,
      bossesPerBossWave: 1,
    },
    hardcore: {
      label: "Hardcore",
      description: "Faster, tougher enemies and only 12 base health.",
      baseHealth: 12,
      waveLimit: 20,
      speedMultiplier: 1.4,
      healthMultiplier: 1.25,
      enemyCountBonus: 2,
      breakBetweenWaves: 3,
      bossEvery: 3,
      bossesPerBossWave: 1,
    },
    endless: {
      label: "Endless",
      description: "Ever-growing waves with a short break between rounds.",
      baseHealth: 20,
      waveLimit: null,
      schedule: "story",
      endlessExtension: true,
      speedMultiplier: 1.05,
      healthMultiplier: 1.15,
      enemyCountBonus: 1,
      breakBetweenWaves: 2,
      bossEvery: 5,
      bossesPerBossWave: 1,
    },
    challenge: {
      label: "Challenge",
      description: "Faster enemies and double bosses every fifth wave.",
      baseHealth: 15,
      waveLimit: 10,
      speedMultiplier: 1.25,
      healthMultiplier: 1.1,
      enemyCountBonus: 1,
      breakBetweenWaves: 4,
      bossEvery: 5,
      bossesPerBossWave: 2,
    },
  },
  map: { minX: -82, maxX: 82, minZ: -42, maxZ: 42 },
  pathHalfWidth: 10,
  waypoints: [
    { x: 72, z: 0 },
    { x: -72, z: 0 },
  ],
});

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const lengthSquared = dx * dx + dz * dz;
  const projection = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.z - start.z) * dz) / lengthSquared));
  const nearestX = start.x + projection * dx;
  const nearestZ = start.z + projection * dz;
  return Math.hypot(point.x - nearestX, point.z - nearestZ);
}

export function distanceFromPath(position) {
  let closest = Infinity;
  for (let index = 0; index < CONFIG.waypoints.length - 1; index += 1) {
    closest = Math.min(
      closest,
      distanceToSegment(position, CONFIG.waypoints[index], CONFIG.waypoints[index + 1]),
    );
  }
  return closest;
}
