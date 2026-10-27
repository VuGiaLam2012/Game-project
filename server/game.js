import { randomInt as secureRandomInt } from "node:crypto";
import { CONFIG } from "./game/config.js";
import { methods as playerMethods } from "./game/players.js";
import { methods as towerMethods } from "./game/towers.js";
import { methods as enemyMethods } from "./game/enemies.js";
import { methods as loopMethods } from "./game/loop.js";
import { methods as snapshotMethods } from "./game/snapshot.js";

export { CONFIG };

export class Game {
  constructor(profileStore = null, randomInt = secureRandomInt) {
    this.profileStore = profileStore;
    this.randomInt = randomInt;
    this.players = new Map();
    this.enemies = new Map();
    this.towers = new Map();
    this.baseHealth = CONFIG.baseHealth;
    this.wave = 0;
    this.gameOver = false;
    this.victory = false;
    this.started = false;
    this.hostId = null;
    this.mode = "normal";
    this.effects = [];
    this.nextId = 1;
    this.waveState = "waiting";
    this.spawnRemaining = 0;
    this.spawnQueue = [];
    this.spawnQueueIndex = 0;
    this.bossesRemaining = 0;
    this.spawnTimer = 0;
    this.intermissionRemaining = CONFIG.breakBetweenWaves;
    this.elapsed = 0;
  }
}

for (const methods of [playerMethods, towerMethods, enemyMethods, loopMethods, snapshotMethods]) {
  for (const [name, method] of Object.entries(methods)) {
    Object.defineProperty(Game.prototype, name, {
      value: method,
      configurable: true,
      writable: true,
    });
  }
}
