import { CONFIG, distanceFromPath } from "./config.js";

export const methods = {
  placeTower(playerId, position, type = "brawler") {
    const player = this.players.get(playerId);
    if (!player) return { ok: false, reason: "Join the match before building." };
    if (!this.started) return { ok: false, reason: "The host needs to start the match first." };
    if (this.gameOver) return { ok: false, reason: "The match is over." };
    const towerSettings = Object.hasOwn(CONFIG.towerTypes, type) ? CONFIG.towerTypes[type] : undefined;
    if (!towerSettings) return { ok: false, reason: "Choose a valid tower type." };
    if (!player.profile.ownedUnits.includes(type)) {
      return { ok: false, reason: "Unlock this unit before placing it." };
    }
    if (
      !position ||
      typeof position.x !== "number" ||
      typeof position.z !== "number" ||
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.z)
    ) {
      return { ok: false, reason: "That placement is invalid." };
    }

    const { x, z } = position;
    if (x < CONFIG.map.minX || x > CONFIG.map.maxX || z < CONFIG.map.minZ || z > CONFIG.map.maxZ) {
      return { ok: false, reason: "Place towers on the grass." };
    }
    if (distanceFromPath(position) < CONFIG.towerPathClearance) {
      return { ok: false, reason: "Towers need more space from the road." };
    }
    if (player.towerCount >= CONFIG.maxTowersPerPlayer) {
      return { ok: false, reason: "You have reached your tower limit." };
    }
    for (const tower of this.towers.values()) {
      if (Math.hypot(tower.x - x, tower.z - z) < CONFIG.towerSpacing) {
        return { ok: false, reason: "Towers are too close together." };
      }
    }
    if (player.cash < towerSettings.cost) {
      return { ok: false, reason: "Not enough cash." };
    }

    player.cash -= towerSettings.cost;
    player.towerCount += 1;
    const id = `t${this.nextId++}`;
    this.towers.set(id, {
      id,
      ownerId: playerId,
      type,
      x,
      z,
      level: 0,
      cooldown: 0,
      specialCooldowns: {},
      jackpotRemaining: 0,
      domainRemaining: 0,
      shrineCooldown: towerSettings.shrine?.cooldown ?? 0,
    });
    return { ok: true, reason: `${towerSettings.label} tower placed.` };
  },

  summonUnit(playerId, type = "brawler") {
    const player = this.players.get(playerId);
    if (!player) return { ok: false, reason: "Join the match before summoning." };
    if (!this.started) return { ok: false, reason: "The host needs to start the match first." };
    if (this.gameOver) return { ok: false, reason: "The match is over." };
    const unitSettings = Object.hasOwn(CONFIG.towerTypes, type) ? CONFIG.towerTypes[type] : undefined;
    if (!unitSettings) return { ok: false, reason: "Choose a valid unit." };
    if (!player.profile.ownedUnits.includes(type)) {
      return { ok: false, reason: "Unlock this unit before summoning it." };
    }
    if (player.towerCount >= CONFIG.maxTowersPerPlayer) {
      return { ok: false, reason: "Your squad has reached its unit limit." };
    }
    if (player.cash < unitSettings.cost) return { ok: false, reason: "Not enough cash." };

    player.cash -= unitSettings.cost;
    player.towerCount += 1;
    const id = `t${this.nextId++}`;
    this.towers.set(id, {
      id,
      ownerId: playerId,
      type,
      x: CONFIG.waypoints.at(-1).x + 6,
      z: 0,
      isUnit: true,
      level: 0,
      cooldown: 0,
      specialCooldowns: {},
      jackpotRemaining: 0,
      domainRemaining: 0,
      shrineCooldown: unitSettings.shrine?.cooldown ?? 0,
    });
    return { ok: true, reason: `${unitSettings.label} summoned!` };
  },

  towerStats(tower) {
    const settings = CONFIG.towerTypes[tower.type];
    const player = this.players.get(tower.ownerId);
    const unitLevel = player?.profile.unitLevels[tower.type] ?? 1;
    const levelBonus = unitLevel - 1;
    const stats = { ...settings.levels[tower.level], ...settings };
    for (const stat of ["damage", "burnDamage", "damageBuff", "rangeBuff", "splashRadius"]) {
      if (typeof stats[stat] === "number") stats[stat] *= 1 + levelBonus * 0.1;
    }
    if (typeof stats.cooldown === "number") {
      stats.cooldown *= Math.max(0.7, 1 - levelBonus * 0.025);
    }
    if (typeof stats.range === "number") stats.range *= 1 + levelBonus * 0.02;
    return stats;
  },

  upgradeCost(tower) {
    const settings = CONFIG.towerTypes[tower.type];
    const multipliers = [0.65, 0.9, 1.25, 1.7];
    return Math.ceil(settings.cost * multipliers[tower.level]);
  },

  upgradeTower(playerId, towerId) {
    const player = this.players.get(playerId);
    const tower = this.towers.get(towerId);
    if (!player) return { ok: false, reason: "Join the match before upgrading." };
    if (!this.started || this.gameOver) return { ok: false, reason: "The match is not active." };
    if (!tower || tower.ownerId !== playerId) {
      return { ok: false, reason: "You can only upgrade your own towers." };
    }
    const settings = CONFIG.towerTypes[tower.type];
    if (tower.level >= settings.maxLevel) return { ok: false, reason: "This tower is already max level." };
    const cost = this.upgradeCost(tower);
    if (player.cash < cost) return { ok: false, reason: "Not enough cash to upgrade." };
    player.cash -= cost;
    tower.level += 1;
    return { ok: true, reason: `${settings.label} upgraded to level ${tower.level}.` };
  },

  activateTowerAbility(playerId, towerId, ability, position) {
    const tower = this.towers.get(towerId);
    if (!this.players.has(playerId)) return { ok: false, reason: "Join the match before using abilities." };
    if (!this.started || this.gameOver) return { ok: false, reason: "The match is not active." };
    if (!tower || tower.ownerId !== playerId) {
      return { ok: false, reason: "You can only use abilities on your own towers." };
    }

    const settings = CONFIG.towerTypes[tower.type];
    const abilitySettings = settings.abilities?.[ability];
    const isUltimate = ability === "ultimate" && settings.ultimate;
    if (!abilitySettings && !isUltimate) return { ok: false, reason: "That tower has no such ability." };
    const cooldown = tower.specialCooldowns[ability] ?? 0;
    if (cooldown > 0) return { ok: false, reason: `${abilitySettings?.label ?? settings.ultimate.label} is recharging.` };

    if (ability === "ultimate") {
      tower.domainRemaining = settings.ultimate.duration;
      tower.specialCooldowns.ultimate = settings.ultimate.cooldown;
      this.effects.push({
        id: `fx${this.nextId++}`,
        type: "domain",
        x: tower.x,
        z: tower.z,
        radius: settings.ultimate.radius,
        expiresAt: this.elapsed + settings.ultimate.duration,
      });
      return { ok: true, reason: "Domain activated." };
    }

    if (
      !position ||
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.z) ||
      position.x < CONFIG.map.minX ||
      position.x > CONFIG.map.maxX ||
      position.z < CONFIG.map.minZ ||
      position.z > CONFIG.map.maxZ ||
      Math.hypot(position.x - tower.x, position.z - tower.z) > abilitySettings.range
    ) {
      return { ok: false, reason: "Choose a target within this tower's ability range." };
    }

    const targets = [...this.enemies.values()].filter(
      (enemy) => Math.hypot(enemy.x - position.x, enemy.z - position.z) <= abilitySettings.radius,
    );
    const pullCenter =
      ability === "pull" && targets.length
        ? {
            x: targets.reduce((sum, enemy) => sum + enemy.x, 0) / targets.length,
            z: targets.reduce((sum, enemy) => sum + enemy.z, 0) / targets.length,
          }
        : null;
    for (const enemy of targets) {
      this.damageEnemy(enemy, abilitySettings.damage, true);
      if (ability === "pull") {
        enemy.slowMultiplier = 0.45;
        enemy.slowedUntil = this.elapsed + 2;
        if (this.enemies.has(enemy.id)) {
          this.setEnemyPathPosition(
            enemy,
            enemy.x + (pullCenter.x - enemy.x) * 0.75,
            enemy.z + (pullCenter.z - enemy.z) * 0.75,
          );
        }
      } else if (ability === "blast") {
        if (!enemy.stunImmune) {
          enemy.frozenUntil = Math.max(enemy.frozenUntil ?? 0, this.elapsed + abilitySettings.stun);
        }
        this.knockBackEnemy(enemy, 6);
      }
    }
    tower.specialCooldowns[ability] = abilitySettings.cooldown;
    this.effects.push({
      id: `fx${this.nextId++}`,
      type: ability,
      x: position.x,
      z: position.z,
      radius: abilitySettings.radius,
      expiresAt: this.elapsed + 1.2,
    });
    return { ok: true, reason: `${abilitySettings.label} activated.` };
  },

  towerModifiers(tower) {
    let damageMultiplier = 1;
    let bossDamageMultiplier = 1;
    let rangeMultiplier = 1;
    let cooldownMultiplier = 1;
    let suppressBuffs = false;
    for (const enemy of this.enemies.values()) {
      const settings = enemy.bossSettings;
      if (!settings) continue;
      const distance = Math.hypot(enemy.x - tower.x, enemy.z - tower.z);
      const rangePenaltyActive = !settings.domainCooldown || enemy.activeDomainUntil > this.elapsed;
      if (
        settings.towerRangePenalty &&
        rangePenaltyActive &&
        distance <= (settings.auraRadius ?? Infinity)
      ) {
        rangeMultiplier *= 1 - settings.towerRangePenalty;
      }
      if (settings.towerSlowMultiplier && distance <= (settings.towerSlowRadius ?? Infinity)) {
        cooldownMultiplier = Math.max(cooldownMultiplier, 1 / settings.towerSlowMultiplier);
      }
      if (settings.towerBuffSuppression && enemy.activeDomainUntil > this.elapsed) {
        suppressBuffs = true;
      }
      if (settings.domainAt && enemy.health / enemy.maxHealth <= settings.domainAt) {
        bossDamageMultiplier = Math.min(bossDamageMultiplier, 0.7);
      }
      if (settings.antiBuffRadius && distance <= settings.antiBuffRadius) {
        suppressBuffs = true;
      }
    }
    for (const support of this.towers.values()) {
      if (support.id === tower.id) continue;
      const supportSettings = this.towerStats(support);
      if (!suppressBuffs && support.type === "domainWarden") {
        const distance = Math.hypot(support.x - tower.x, support.z - tower.z);
        const inAura = distance <= supportSettings.range;
        const inDomain =
          support.domainRemaining > 0 &&
          distance <= CONFIG.towerTypes.domainWarden.ultimate.radius;
        if (inAura) {
          damageMultiplier = Math.max(damageMultiplier, 1 + supportSettings.damageBuff);
          rangeMultiplier = Math.max(rangeMultiplier, 1 + supportSettings.rangeBuff);
        }
        if (inDomain) damageMultiplier = Math.max(damageMultiplier, 2);
      }
    }
    return {
      damageMultiplier: damageMultiplier * bossDamageMultiplier,
      rangeMultiplier,
      cooldownMultiplier,
    };
  },

  applyTowerEffects(enemy, settings) {
    if (!this.enemies.has(enemy.id)) return;
    if (settings.burnDamage) {
      if (enemy.burnImmune) return;
      enemy.burnDamage = settings.burnDamage;
      enemy.burnUntil = this.elapsed + CONFIG.towerTypes.flameSage.burnDuration;
      enemy.nextBurnAt = this.elapsed + 1;
    }
    if (settings.slow && !enemy.slowImmune) {
      enemy.slowMultiplier = 1 - settings.slow;
      enemy.slowedUntil = this.elapsed + CONFIG.towerTypes.frostWarden.slowDuration;
      if (settings.freezeDuration > 0 && !enemy.freezeImmune) {
        enemy.frozenUntil = Math.max(enemy.frozenUntil ?? 0, this.elapsed + settings.freezeDuration);
      }
    }
  }
};
