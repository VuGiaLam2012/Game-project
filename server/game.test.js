import test from "node:test";
import assert from "node:assert/strict";
import { CONFIG, Game } from "./game.js";

test("players join the shared match with starting cash", () => {
  const game = new Game();

  assert.deepEqual(game.addPlayer("p1", "  Defender  "), { ok: true });
  assert.equal(game.snapshot().players[0].name, "Defender");
  assert.equal(game.snapshot().players[0].cash, CONFIG.startingCash);
});

test("tower placement validates the road and charges the player", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.startMatch("p1");

  const roadPlacement = game.placeTower("p1", { x: 0, z: 0 });
  assert.equal(roadPlacement.ok, false);

  const validPlacement = game.placeTower("p1", { x: -60, z: -21 });
  assert.equal(validPlacement.ok, true);
  assert.equal(game.snapshot().players[0].cash, CONFIG.startingCash - CONFIG.towerTypes.brawler.cost);
  assert.equal(game.snapshot().towers.length, 1);
});

test("players summon moving units from their base for the horizontal lane", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  assert.equal(game.summonUnit("p1", "brawler").ok, false);
  game.startMatch("p1");

  const result = game.summonUnit("p1", "brawler");
  assert.equal(result.ok, true);
  const unit = game.snapshot().towers[0];
  assert.equal(unit.isUnit, true);
  assert.equal(unit.x, CONFIG.waypoints.at(-1).x + 6);
  assert.equal(unit.z, 0);
  assert.equal(game.snapshot().players[0].cash, CONFIG.startingCash - CONFIG.towerTypes.brawler.cost);

  game.tick(0.1);
  assert.ok(game.snapshot().towers[0].x > unit.x);
});

test("summoning rejects invalid units, insufficient cash, and excess units", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.startMatch("p1");

  assert.equal(game.summonUnit("p1", "toString").ok, false);
  game.players.get("p1").cash = 0;
  assert.equal(game.summonUnit("p1", "brawler").reason, "Not enough cash.");
  game.players.get("p1").cash = CONFIG.startingCash;
  game.players.get("p1").towerCount = CONFIG.maxTowersPerPlayer;
  assert.equal(game.summonUnit("p1", "brawler").reason, "Your squad has reached its unit limit.");
});

test("unit training persists XP and applies level bonuses to later matches", () => {
  const profiles = new Map();
  let saveRequests = 0;
  const profileStore = {
    getProfile(id) {
      if (!profiles.has(id)) {
        profiles.set(id, {
          xp: 100,
          unitLevels: Object.fromEntries(Object.keys(CONFIG.towerTypes).map((type) => [type, 1])),
          ownedUnits: ["brawler"],
        });
      }
      return profiles.get(id);
    },
    saveSoon() {
      saveRequests += 1;
    },
  };
  const game = new Game(profileStore);
  game.addPlayer("p1", "Defender", "saved-profile");

  assert.equal(game.upgradeUnit("p1", "brawler").ok, true);
  assert.equal(game.players.get("p1").profile.xp, 0);
  assert.equal(game.players.get("p1").profile.unitLevels.brawler, 2);
  assert.equal(saveRequests, 1);
  assert.equal(game.upgradeUnit("p1", "brawler").reason, "Not enough XP to train this unit.");

  const nextGame = new Game(profileStore);
  nextGame.addPlayer("p2", "Defender", "saved-profile");
  nextGame.startMatch("p2");
  nextGame.summonUnit("p2", "brawler");
  const stats = nextGame.towerStats(nextGame.towers.values().next().value);
  assert.equal(stats.damage, CONFIG.towerTypes.brawler.levels[0].damage * 1.1);
  assert.equal(stats.cooldown, CONFIG.towerTypes.brawler.levels[0].cooldown * 0.975);
});

test("clearing a wave grants XP to every connected player", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender One");
  game.addPlayer("p2", "Defender Two");
  game.startMatch("p1");
  game.wave = 2;
  game.waveState = "clearing";

  game.tick(0.05);

  assert.equal(game.snapshot().players[0].xp, 30);
  assert.equal(game.snapshot().players[1].xp, 30);
});

test("capsules charge gems, unlock units, update pity, and refund duplicate pulls", () => {
  const rolls = [9999, 0, 0, 0];
  const game = new Game(null, (max) => rolls.shift() % max);
  game.addPlayer("p1", "Defender");

  const secretPull = game.summonCapsules("p1", 1, "gems");
  assert.equal(secretPull.ok, true);
  assert.equal(secretPull.results[0].rarity, "Secret");
  assert.equal(secretPull.results[0].type, "shrineKing");
  assert.equal(secretPull.results[0].isNew, true);
  assert.equal(secretPull.pity.secret, 0);
  assert.equal(secretPull.pity.legendary, 0);
  assert.equal(secretPull.gems, 4500);

  const commonPull = game.summonCapsules("p1", 1, "ticket");
  assert.equal(commonPull.ok, true);
  assert.equal(commonPull.results[0].rarity, "Common");
  assert.equal(commonPull.results[0].isNew, false);
  assert.equal(commonPull.results[0].duplicateGems, 25);
  assert.equal(commonPull.tickets, 9);
  assert.equal(commonPull.gems, 4525);
});

test("11-capsule ritual guarantees rare or better and legendary pity guarantees a legendary unit", () => {
  const rolls = [...Array(10).fill([0, 0]).flat(), 0, 0, 0, 0];
  const game = new Game(null, (max) => rolls.shift() % max);
  game.addPlayer("p1", "Defender");

  const multiPull = game.summonCapsules("p1", 11, "gems");
  assert.equal(multiPull.ok, true);
  assert.equal(multiPull.results.length, 11);
  assert.ok(multiPull.results.some((result) => result.rarity !== "Common"));
  assert.equal(multiPull.gems, 250);
  assert.equal(multiPull.tickets, 10);

  const player = game.players.get("p1");
  player.profile.gems += 500;
  player.profile.pity.legendary = 99;
  const guaranteed = game.summonCapsules("p1", 1, "gems");
  assert.equal(guaranteed.results[0].rarity, "Legendary");
  assert.equal(guaranteed.pity.legendary, 0);
});

test("capsule requests reject invalid counts, currency, and insufficient balance", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  assert.equal(game.summonCapsules("p1", 2, "gems").ok, false);
  assert.equal(game.summonCapsules("p1", 11, "ticket").ok, false);
  game.players.get("p1").profile.gems = 0;
  assert.equal(game.summonCapsules("p1", 1, "gems").reason, "Not enough gems.");
  game.players.get("p1").profile.tickets = 0;
  assert.equal(game.summonCapsules("p1", 1, "ticket").reason, "You do not have a capsule ticket.");
});

test("secret pity takes priority and guarantees a secret at the threshold", () => {
  const game = new Game(null, () => 0);
  game.addPlayer("p1", "Defender");
  const profile = game.players.get("p1").profile;
  profile.pity.legendary = 99;
  profile.pity.secret = 999;

  const result = game.summonCapsules("p1", 1, "gems");

  assert.equal(result.results[0].rarity, "Secret");
  assert.equal(result.pity.legendary, 0);
  assert.equal(result.pity.secret, 0);
});

test("locked units cannot be summoned or equipped", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.startMatch("p1");
  game.players.get("p1").cash = 100000;
  assert.equal(game.summonUnit("p1", "shrineKing").ok, false);
  assert.equal(game.summonUnit("p1", "shrineKing").reason, "Unlock this unit before summoning it.");
  assert.equal(game.placeTower("p1", { x: -60, z: -21 }, "shrineKing").reason, "Unlock this unit before placing it.");
  assert.equal(game.equipUnit("p1", "shrineKing").ok, false);
  assert.equal(game.equipUnit("p1", "brawler").ok, true);
});

test("knockback moves enemies back toward the enemy base on the straight lane", () => {
  const game = new Game();
  const enemy = {
    waypoint: 1,
    progress: 0.5,
    x: 0,
    z: 0,
  };

  game.knockBackEnemy(enemy, 6);

  assert.ok(enemy.x > 0);
  assert.equal(enemy.z, 0);
});

test("players can build each tower type at its configured price", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.startMatch("p1");

  const damageTower = game.placeTower("p1", { x: -60, z: -21 }, "brawler");
  assert.equal(damageTower.ok, true);
  assert.equal(game.snapshot().players[0].cash, CONFIG.startingCash - CONFIG.towerTypes.brawler.cost);

  const invalidTower = game.placeTower("p1", { x: -45, z: -21 }, "invalid");
  assert.equal(invalidTower.ok, false);
  assert.equal(game.placeTower("p1", { x: -45, z: -21 }, "toString").ok, false);
  assert.equal(game.snapshot().towers[0].type, "brawler");
});

test("invalid positions and unaffordable towers are rejected", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.startMatch("p1");

  assert.equal(game.placeTower("p1", { x: Number.NaN, z: 4 }).ok, false);
  assert.equal(game.placeTower("p1", { x: 90, z: 0 }).ok, false);

  const player = game.players.get("p1");
  player.cash = CONFIG.towerTypes.brawler.cost - 1;
  assert.equal(game.placeTower("p1", { x: -60, z: -21 }).reason, "Not enough cash.");
});

test("server simulation awards all players when a tower defeats an enemy", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender One");
  game.addPlayer("p2", "Defender Two");
  game.startMatch("p1");
  game.placeTower("p1", { x: -60, z: -21 }, "brawler");

  const enemyId = `e${game.nextId++}`;
  game.enemies.set(enemyId, {
    id: enemyId,
    x: -60,
    z: -10,
    health: CONFIG.towerTypes.brawler.levels[0].damage,
    maxHealth: CONFIG.towerTypes.brawler.levels[0].damage,
    kind: "normal",
    speed: 0,
    baseDamage: 1,
    frozenUntil: game.elapsed + 10,
    waypoint: 1,
    progress: 0,
  });

  game.tick(0.05);

  assert.equal(game.enemies.has(enemyId), false);
  assert.equal(
    game.players.get("p1").cash,
    CONFIG.startingCash - CONFIG.towerTypes.brawler.cost + CONFIG.enemyReward,
  );
  assert.equal(game.players.get("p2").cash, CONFIG.startingCash + CONFIG.enemyReward);
  assert.ok(game.snapshot().players[0].xp > 0);
  assert.equal(game.snapshot().players[0].xp, game.snapshot().players[1].xp);
});

test("player limit and tower spacing are enforced", () => {
  const game = new Game();
  for (let index = 0; index < CONFIG.maxPlayers; index += 1) {
    assert.equal(game.addPlayer(`p${index}`, `Player ${index}`).ok, true);
  }
  assert.equal(game.addPlayer("extra", "Extra").reason, "This match is full.");

  game.startMatch("p0");
  game.placeTower("p0", { x: -60, z: -21 }, "brawler");
  assert.equal(game.placeTower("p1", { x: -60, z: -20 }).reason, "Towers are too close together.");
});

test("host selects a mode and only the host can start the match", () => {
  const game = new Game();
  game.addPlayer("host", "Host");
  game.addPlayer("guest", "Guest");

  assert.equal(game.setMode("guest", "hardcore").ok, false);
  assert.equal(game.setMode("host", "challenge").ok, true);
  assert.equal(game.startMatch("guest").ok, false);
  assert.equal(game.startMatch("host").ok, true);
  assert.equal(game.snapshot().mode, "challenge");
  assert.equal(game.snapshot().baseHealth, CONFIG.modes.challenge.baseHealth);
});

test("airstrike damages enemies and respects its cooldown", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.startMatch("p1");
  const enemy = {
    id: "test-enemy",
    x: 0,
    z: 0,
    health: 200,
    maxHealth: 200,
    kind: "normal",
    speed: 0,
    baseDamage: 1,
    frozenUntil: game.elapsed + 10,
    waypoint: 1,
    progress: 0,
  };
  game.enemies.set(enemy.id, enemy);

  assert.equal(game.activateAbility("p1", "airstrike", { x: 0, z: 0 }).ok, true);
  assert.equal(enemy.health, 80);
  assert.equal(game.activateAbility("p1", "airstrike", { x: 0, z: 0 }).ok, false);
  assert.equal(game.activateAbility("p1", "airstrike", { x: 500, z: 500 }).ok, false);
});

test("freeze pauses enemies and cash boost doubles personal bounty", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.addPlayer("p2", "Squadmate");
  game.startMatch("p1");
  const enemy = {
    id: "test-enemy",
    x: 0,
    z: 0,
    health: 20,
    maxHealth: 20,
    kind: "normal",
    speed: 10,
    baseDamage: 1,
    waypoint: 1,
    progress: 0,
  };
  game.enemies.set(enemy.id, enemy);

  assert.equal(game.activateAbility("p1", "freeze").ok, true);
  const positionBefore = { x: enemy.x, z: enemy.z };
  game.tick(0.2);
  assert.deepEqual({ x: enemy.x, z: enemy.z }, positionBefore);

  assert.equal(game.activateAbility("p1", "cashBoost").ok, true);
  game.damageEnemy(enemy, 20);
  assert.equal(game.players.get("p1").cash, CONFIG.startingCash + CONFIG.enemyReward * 2);
  assert.equal(game.players.get("p2").cash, CONFIG.startingCash + CONFIG.enemyReward);
});

test("challenge mode spawns two bosses on each boss wave", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.setMode("p1", "challenge");
  game.startMatch("p1");
  game.wave = 4;
  game.startWave();

  const enemyCount = game.spawnRemaining;
  for (let index = 0; index < enemyCount; index += 1) {
    game.spawnEnemy();
    game.spawnRemaining -= 1;
  }

  assert.equal([...game.enemies.values()].filter((enemy) => enemy.kind === "boss").length, 2);
});

test("campaign modes finish at their wave limit while endless continues", () => {
  const campaign = new Game();
  campaign.addPlayer("p1", "Defender");
  campaign.startMatch("p1");
  campaign.wave = CONFIG.modes.normal.waveLimit;
  campaign.waveState = "clearing";
  campaign.tick(0.05);
  assert.equal(campaign.snapshot().victory, true);

  const endless = new Game();
  endless.addPlayer("p1", "Defender");
  endless.setMode("p1", "endless");
  endless.startMatch("p1");
  endless.wave = 100;
  endless.waveState = "clearing";
  endless.tick(0.05);
  assert.equal(endless.snapshot().gameOver, false);
});

test("domain towers buff nearby attacking towers", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.startMatch("p1");
  game.towers.set("brawler", { id: "brawler", ownerId: "p1", type: "brawler", x: -60, z: -21, level: 0, cooldown: 0 });
  game.towers.set("domain", { id: "domain", ownerId: "p1", type: "domainWarden", x: -45, z: -21, level: 0, cooldown: 0, domainRemaining: 0 });

  assert.deepEqual(game.towerModifiers(game.towers.get("brawler")), {
    damageMultiplier: 1 + CONFIG.towerTypes.domainWarden.levels[0].damageBuff,
    rangeMultiplier: 1 + CONFIG.towerTypes.domainWarden.levels[0].rangeBuff,
    cooldownMultiplier: 1,
  });
});

test("flame towers damage enemies grouped around their target", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.startMatch("p1");
  game.waveState = "clearing";
  game.towers.set("flame", {
    id: "flame",
    ownerId: "p1",
    type: "flameSage",
    x: -60,
    z: -21,
    level: 0,
    cooldown: 0,
  });

  for (const [id, x, z] of [
    ["target", -60, -10],
    ["splash", -57, -10],
    ["outside", -40, -10],
  ]) {
    game.enemies.set(id, {
      id,
      x,
      z,
      health: 200,
      maxHealth: 200,
      kind: "normal",
      speed: 0,
      baseDamage: 1,
      frozenUntil: game.elapsed + 10,
      waypoint: 1,
      progress: 0,
    });
  }

  game.tick(0.05);

  assert.equal(game.enemies.get("target").health, 200 - CONFIG.towerTypes.flameSage.levels[0].damage);
  assert.equal(game.enemies.get("splash").health, 200 - CONFIG.towerTypes.flameSage.levels[0].damage);
  assert.equal(game.enemies.get("outside").health, 200);
});

test("area damage awards bounty only once when an enemy is hit more than once", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.startMatch("p1");
  const enemy = {
    id: "splash-kill",
    x: 0,
    z: 0,
    health: 1,
    maxHealth: 1,
    kind: "normal",
    speed: 0,
    baseDamage: 1,
    waypoint: 1,
    progress: 0,
  };
  game.enemies.set(enemy.id, enemy);

  game.damageEnemy(enemy, 2);
  game.damageEnemy(enemy, 2);

  assert.equal(game.players.get("p1").cash, CONFIG.startingCash + CONFIG.enemyReward);
});

test("frost towers apply a movement slow after hitting an enemy", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.startMatch("p1");
  game.waveState = "clearing";
  game.towers.set("frost", {
    id: "frost",
    ownerId: "p1",
    type: "frostWarden",
    x: 60,
    z: 0,
    level: 0,
    cooldown: 0,
  });
  const enemy = {
    id: "slow-target",
    x: 72,
    z: 0,
    health: 200,
    maxHealth: 200,
    kind: "normal",
    speed: 10,
    baseDamage: 1,
    waypoint: 1,
    progress: 0,
  };
  game.enemies.set(enemy.id, enemy);

  game.tick(0.05);
  assert.ok(enemy.slowedUntil > game.elapsed);
  const before = { x: enemy.x, z: enemy.z };
  game.tick(0.05);

  assert.ok(Math.hypot(enemy.x - before.x, enemy.z - before.z) < 10 * 0.05);
});

test("tower upgrades validate ownership, cash, and maximum level", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.addPlayer("p2", "Squadmate");
  game.startMatch("p1");
  game.players.get("p1").cash = 1000;
  game.placeTower("p1", { x: -60, z: -21 }, "brawler");
  const towerId = [...game.towers.keys()][0];

  assert.equal(game.upgradeTower("p2", towerId).ok, false);
  assert.equal(game.upgradeTower("p1", towerId).ok, true);
  assert.equal(game.snapshot().towers[0].level, 1);
  game.players.get("p1").cash = 0;
  assert.equal(game.upgradeTower("p1", towerId).reason, "Not enough cash to upgrade.");
  game.players.get("p1").cash = 100000;
  for (let level = 1; level < CONFIG.towerTypes.brawler.maxLevel; level += 1) {
    assert.equal(game.upgradeTower("p1", towerId).ok, true);
  }
  assert.equal(game.upgradeTower("p1", towerId).reason, "This tower is already max level.");
});

test("tower abilities enforce ownership, range, and cooldown", () => {
  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.addPlayer("p2", "Squadmate");
  game.startMatch("p1");
  game.players.get("p1").cash = 5000;
  game.players.get("p1").profile.ownedUnits.push("voidAdept");
  game.placeTower("p1", { x: -60, z: -21 }, "voidAdept");
  const towerId = [...game.towers.keys()][0];
  const enemy = {
    id: "ability-target",
    x: -50,
    z: -21,
    health: 2000,
    maxHealth: 2000,
    kind: "normal",
    speed: 0,
    baseDamage: 1,
    waypoint: 1,
    progress: 0,
  };
  game.enemies.set(enemy.id, enemy);

  assert.equal(game.activateTowerAbility("p2", towerId, "blast", { x: -50, z: -21 }).ok, false);
  assert.equal(game.activateTowerAbility("p1", towerId, "blast", { x: 50, z: 21 }).ok, false);
  assert.equal(game.activateTowerAbility("p1", towerId, "blast", { x: -50, z: -21 }).ok, true);
  assert.equal(enemy.health, 1100);
  assert.ok(enemy.frozenUntil > game.elapsed);
  assert.equal(game.activateTowerAbility("p1", towerId, "blast", { x: -50, z: -21 }).ok, false);
});

test("story and hardcore wave schedules contain the requested wave counts", () => {
  assert.equal(CONFIG.waveSchedules.story.length, 40);
  for (const act of [
    "volcano",
    "ocean",
    "forest",
    "lightning",
    "gambler",
    "manipulator",
    "heavenly",
    "domain",
    "king",
  ]) {
    assert.equal(CONFIG.waveSchedules[act].length, 25, `${act} should have 25 waves`);
  }

  const game = new Game();
  game.addPlayer("p1", "Defender");
  game.setMode("p1", "story");
  game.startMatch("p1");
  game.tick(0.05);
  const firstEnemy = [...game.enemies.values()][0];
  assert.equal(firstEnemy.type, "grade4");
  assert.equal(firstEnemy.maxHealth, CONFIG.enemyTypes.grade4.health);
  assert.equal(firstEnemy.speed, CONFIG.enemyTypes.grade4.speed);
});

test("individual enemy definitions retain the supplied endgame stats", () => {
  assert.equal(CONFIG.enemyTypes.volcanoBoss.health, 25_000_000);
  assert.equal(CONFIG.enemyTypes.oceanSpiritBoss.regenPerSecond, 100_000);
  assert.equal(CONFIG.enemyTypes.cursedSovereign.health, 1_000_000_000);
  assert.equal(CONFIG.enemyTypes.shrineSpawn.regenPerSecond, 100_000);
  assert.equal(CONFIG.enemyTypes.curseBird.flying, true);
});

test("ocean boss cloning runs on its own cooldown", () => {
  const game = new Game();
  game.started = true;
  game.waveState = "clearing";
  game.spawnEnemy("oceanSpiritBoss");

  for (let index = 0; index < 251; index += 1) game.tick(0.1);

  assert.equal(game.nextId, 7);
});

test("enemy random speed, resistance, and debuff removal traits are applied", () => {
  const game = new Game(null, (max) => max - 1);
  game.started = true;
  game.waveState = "clearing";
  game.spawnEnemy("casinoCurse");
  const casinoCurse = [...game.enemies.values()][0];
  assert.equal(casinoCurse.speed, CONFIG.enemyTypes.casinoCurse.randomSpeed.max);
  casinoCurse.speed = 0;

  game.spawnEnemy("jackpotSpirit");
  const jackpotSpirit = [...game.enemies.values()].find((enemy) => enemy.type === "jackpotSpirit");
  jackpotSpirit.speed = 0;
  for (let index = 0; index < 301; index += 1) game.tick(0.1);
  assert.ok(jackpotSpirit.resistanceUntil > game.elapsed);
  const healthBeforeHit = jackpotSpirit.health;
  game.damageEnemy(jackpotSpirit, 100);
  assert.ok(Math.abs(healthBeforeHit - jackpotSpirit.health - 20) < 1e-8);

  game.spawnEnemy("domainGeneral");
  const domainGeneral = [...game.enemies.values()].find((enemy) => enemy.type === "domainGeneral");
  domainGeneral.speed = 0;
  domainGeneral.slowedUntil = 10;
  domainGeneral.frozenUntil = 10;
  game.tick(0.05);
  assert.equal(domainGeneral.slowedUntil, 0);
  assert.equal(domainGeneral.frozenUntil, 0);
});
