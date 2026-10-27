import { CONFIG } from "./config.js";

export const methods = {
  knockBackEnemy(enemy, distance) {
    let remaining = distance;
    while (remaining > 0 && enemy.waypoint > 0) {
      const start = CONFIG.waypoints[enemy.waypoint - 1];
      const end = CONFIG.waypoints[enemy.waypoint];
      const segmentLength = Math.hypot(end.x - start.x, end.z - start.z);
      const traveled = segmentLength * enemy.progress;
      const moved = Math.min(remaining, traveled);
      enemy.progress -= moved / segmentLength;
      remaining -= moved;
      enemy.x = start.x + (end.x - start.x) * enemy.progress;
      enemy.z = start.z + (end.z - start.z) * enemy.progress;
      if (enemy.progress <= 0) {
        if (enemy.waypoint === 1) {
          enemy.progress = 0;
          break;
        }
        enemy.waypoint -= 1;
        enemy.progress = 1;
      }
    }
  },

  setEnemyPathPosition(enemy, x, z) {
    let nearest;
    let nearestDistance = Infinity;
    for (let index = 0; index < CONFIG.waypoints.length - 1; index += 1) {
      const start = CONFIG.waypoints[index];
      const end = CONFIG.waypoints[index + 1];
      const dx = end.x - start.x;
      const dz = end.z - start.z;
      const progress = Math.max(
        0,
        Math.min(1, ((x - start.x) * dx + (z - start.z) * dz) / (dx * dx + dz * dz)),
      );
      const pointX = start.x + dx * progress;
      const pointZ = start.z + dz * progress;
      const distance = Math.hypot(x - pointX, z - pointZ);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = { index, progress, x: pointX, z: pointZ };
      }
    }
    if (nearest) {
      enemy.waypoint = nearest.index + 1;
      enemy.progress = nearest.progress;
      enemy.x = nearest.x;
      enemy.z = nearest.z;
    }
  },

  startWave() {
    if (this.gameOver) return;
    const mode = this.gameMode();
    this.wave += 1;
    this.waveState = "spawning";
    const schedule = mode.schedule ? CONFIG.waveSchedules[mode.schedule] : undefined;
    let scheduledWave = schedule?.[this.wave - 1];
    if (!scheduledWave && mode.endlessExtension && this.wave > 40) {
      if (this.wave === 100) {
        scheduledWave = [{ type: "kingClone", count: 1 }];
      } else if (this.wave === 150) {
        scheduledWave = [{ type: "domainBoss", count: 1 }];
      } else if (this.wave >= 200) {
        scheduledWave = [{ type: "specialGradeElite", count: 10 + this.wave - 200 }];
      } else {
        scheduledWave = [
          { type: this.wave >= 50 ? "specialGradeElite" : "specialGrade", count: 10 + Math.floor(this.wave / 5) },
        ];
      }
    }
    this.spawnQueue = scheduledWave?.map(({ type, count }) => ({ type, remaining: count })) ?? [];
    this.spawnQueueIndex = 0;
    if (scheduledWave) {
      this.spawnRemaining = scheduledWave.reduce((sum, entry) => sum + entry.count, 0);
      this.bossesRemaining = 0;
      if (mode.randomModifiers) {
        const modifiers = ["doubleHealth", "extraSpeed", "doubleRewards", "hidden", "armored"];
        this.waveModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      } else {
        this.waveModifier = null;
      }
    } else {
      this.spawnRemaining = 5 + this.wave * 2 + (mode.enemyCountBonus ?? 0);
      this.bossesRemaining =
        mode.bossEvery && this.wave % mode.bossEvery === 0 ? mode.bossesPerBossWave : 0;
      this.spawnRemaining += this.bossesRemaining;
      this.waveModifier = null;
    }
    this.spawnTimer = 0;
    this.intermissionRemaining = mode.breakBetweenWaves ?? CONFIG.breakBetweenWaves;
  },

  spawnEnemy(type, parent = null) {
    const mode = this.gameMode();
    const isProceduralBoss = !type && this.bossesRemaining > 0;
    if (isProceduralBoss) this.bossesRemaining -= 1;
    const settings = type ? CONFIG.enemyTypes[type] : undefined;
    if (type && !settings) throw new Error(`Unknown scheduled enemy type: ${type}`);
    const endlessScale = mode.endlessExtension && this.wave >= 200 ? 1.15 ** (this.wave - 199) : 1;
    const isBoss = isProceduralBoss || settings?.kind === "boss";
    const endlessSpecialGradeMultiplier =
      mode.endlessExtension && this.wave >= 50 && this.wave < 100 && type?.includes("specialGrade")
        ? 1.5
        : 1;
    let health = settings
      ? Math.ceil(
          settings.health *
            endlessScale *
            endlessSpecialGradeMultiplier *
            (this.waveModifier === "doubleHealth" ? 2 : 1),
        )
      : Math.ceil(
          (CONFIG.enemyHealth + (this.wave - 1) * 12) *
            (mode.healthMultiplier ?? 1) *
            (isBoss ? CONFIG.bossHealthMultiplier : 1),
        );
    const start = parent ? { x: parent.x, z: parent.z } : CONFIG.waypoints[0];
    const id = `e${this.nextId++}`;
    const flying = settings?.flying ?? (!isBoss && this.wave >= 4 && this.nextId % 7 === 0);
    let hidden = settings?.hidden ?? (!isBoss && this.wave >= 3 && this.nextId % 5 === 0);
    if (this.waveModifier === "hidden") hidden = true;
    const speed = settings?.randomSpeed
      ? settings.randomSpeed.min +
        this.randomInt(settings.randomSpeed.max - settings.randomSpeed.min + 1)
      : settings?.speed ?? CONFIG.enemySpeed * (mode.speedMultiplier ?? 1) * (isBoss ? 0.65 : flying ? 1.35 : 1);
    const reward = (settings?.reward ?? CONFIG.enemyReward) * (this.waveModifier === "doubleRewards" ? 2 : 1);
    this.enemies.set(id, {
      id,
      type: type ?? (isBoss ? "boss" : "normal"),
      label: settings?.label ?? (isBoss ? "Boss Curse" : "Grade 4 Curse"),
      x: start.x,
      z: start.z,
      health,
      maxHealth: health,
      kind: settings?.kind ?? (isBoss ? "boss" : "normal"),
      flying,
      hidden,
      speed: speed * (this.waveModifier === "extraSpeed" ? 1.5 : 1),
      baseDamage: settings?.leakDamageRatio
        ? Math.max(1, Math.ceil(this.baseHealth * settings.leakDamageRatio))
        : isBoss
          ? CONFIG.bossLeakDamage
          : 1,
      reward,
      resistance:
        this.waveModifier === "armored"
          ? Math.max(0.5, settings?.resistance ?? 0)
          : settings?.resistance ?? 0,
      priority: settings?.priority ? 1 : 0,
      burnImmune: settings?.burnImmune ?? false,
      slowImmune: settings?.slowImmune ?? false,
      freezeImmune: settings?.freezeImmune ?? false,
      stunImmune: settings?.stunImmune ?? false,
      regenPerSecond: settings?.regenPerSecond ?? 0,
      regenRatio: mode.endlessExtension && this.wave >= 75 ? 0.01 : 0,
      damageDodgeChance: settings?.damageDodgeChance ?? 0,
      criticalResistance: settings?.criticalResistance ?? 0,
      splitInto: settings?.splitInto ?? null,
      phaseSpawns: settings?.phaseSpawns ?? [],
      triggeredPhases: [],
      bossSettings: settings ?? null,
      shield: settings?.shieldAmount ?? 0,
      maxShield: settings?.shieldAmount ?? 0,
      summonCooldownRemaining: settings?.summonCooldown ?? 0,
      cloneCooldownRemaining: settings?.cloneCooldown ?? 0,
      shieldCooldownRemaining: settings?.shieldCooldown ?? 0,
      abilityCooldownRemaining: settings?.rollCooldown ?? settings?.teleportCooldown ?? settings?.disableTowerCooldown ?? settings?.domainCooldown ?? 0,
      towerStunCooldownRemaining: settings?.towerStunCooldown ?? 0,
      disableTowerCooldownRemaining: settings?.disableTowerCooldown ?? 0,
      domainCooldownRemaining: settings?.domainCooldown ?? 0,
      shrineCooldownRemaining: settings?.shrineCooldown ?? 0,
      speedBoosted: false,
      enraged: false,
      appliedSpeedPhases: [],
      activeDomainUntil: 0,
      invincibleUntil: 0,
      resistanceUntil: 0,
      resistanceCooldownRemaining: settings?.resistanceCooldown ?? 0,
      waypoint: parent?.waypoint ?? 1,
      progress: parent?.progress ?? 0,
    });
    if (settings?.summonType && parent && !settings.phaseSpawns?.length) {
      const newEnemy = this.enemies.get(id);
      if (newEnemy) newEnemy.summoned = true;
    }
  },

  moveEnemy(enemy, deltaTime) {
    if ((enemy.frozenUntil ?? 0) > this.elapsed) return;
    let distanceToTravel = enemy.speed * deltaTime;
    while (distanceToTravel > 0) {
      const current = CONFIG.waypoints[enemy.waypoint - 1];
      const next = CONFIG.waypoints[enemy.waypoint];
      if (!next) {
        this.enemies.delete(enemy.id);
        this.baseHealth = Math.max(0, this.baseHealth - enemy.baseDamage);
        if (this.baseHealth === 0) this.gameOver = true;
        return;
      }

      const segmentLength = Math.hypot(next.x - current.x, next.z - current.z);
      const remaining = segmentLength * (1 - enemy.progress);
      if (distanceToTravel >= remaining) {
        distanceToTravel -= remaining;
        enemy.x = next.x;
        enemy.z = next.z;
        enemy.waypoint += 1;
        enemy.progress = 0;
      } else {
        enemy.progress += distanceToTravel / segmentLength;
        enemy.x = current.x + (next.x - current.x) * enemy.progress;
        enemy.z = current.z + (next.z - current.z) * enemy.progress;
        distanceToTravel = 0;
      }
    }
  },

  damageEnemy(enemy, damage, areaDamage = false) {
    if (!this.enemies.has(enemy.id)) return;
    if ((enemy.invincibleUntil ?? 0) > this.elapsed) return;
    if (enemy.damageDodgeChance && Math.random() < enemy.damageDodgeChance) return;
    const temporaryResistance =
      (enemy.resistanceUntil ?? 0) > this.elapsed
        ? enemy.bossSettings?.activeResistance ?? enemy.bossSettings?.temporaryResistance ?? 0
        : 0;
    const shieldResistance = (enemy.shield ?? 0) > 0 ? enemy.bossSettings?.shieldResistance ?? 0 : 0;
    const areaResistance = areaDamage ? enemy.bossSettings?.aoeResistance ?? 0 : 0;
    const actualDamage = Math.max(
      0,
      damage *
        (1 -
          Math.max(
            enemy.resistance ?? 0,
            temporaryResistance,
            shieldResistance,
            areaResistance,
          )),
    );
    const shieldDamage = Math.min(enemy.shield ?? 0, actualDamage);
    enemy.shield = Math.max(0, (enemy.shield ?? 0) - shieldDamage);
    enemy.health -= actualDamage - shieldDamage;
    (enemy.phaseSpawns ?? []).forEach((phase, phaseIndex) => {
      if (
        !(enemy.triggeredPhases ??= []).includes(phaseIndex) &&
        enemy.health / enemy.maxHealth <= phase.healthRatio
      ) {
        enemy.triggeredPhases.push(phaseIndex);
        for (let index = 0; index < phase.count; index += 1) {
          this.spawnEnemy(phase.type, enemy);
        }
      }
    });
    if (enemy.health > 0) return;
    this.enemies.delete(enemy.id);
    if (enemy.splitInto) {
      for (let index = 0; index < enemy.splitInto.count; index += 1) {
        this.spawnEnemy(enemy.splitInto.type, enemy);
      }
    }
    const experience = Math.max(5, Math.ceil(Math.log10(enemy.maxHealth + 1) * 5));
    for (const player of this.players.values()) {
      const multiplier =
        player.cashBoostRemaining > 0 ? CONFIG.abilities.cashBoost.multiplier : 1;
      player.cash += (enemy.reward ?? CONFIG.enemyReward) * multiplier;
      this.awardExperience(player, experience);
      player.profile.gems += 1;
    }
    this.profileStore?.saveSoon();
  }
};
