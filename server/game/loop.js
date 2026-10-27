import { CONFIG } from "./config.js";

export const methods = {
  tick(deltaTime) {
    if (this.gameOver) return;
    const dt = Math.max(0, Math.min(deltaTime, 0.1));
    this.elapsed += dt;

    for (const player of this.players.values()) {
      for (const ability of Object.keys(CONFIG.abilities)) {
        player.abilityCooldowns[ability] = Math.max(0, player.abilityCooldowns[ability] - dt);
      }
      player.cashBoostRemaining = Math.max(0, player.cashBoostRemaining - dt);
    }
    for (const tower of this.towers.values()) {
      tower.specialCooldowns ??= {};
      tower.jackpotRemaining ??= 0;
      tower.domainRemaining ??= 0;
      tower.shrineCooldown ??= CONFIG.towerTypes[tower.type].shrine?.cooldown ?? 0;
      for (const ability of Object.keys(tower.specialCooldowns)) {
        tower.specialCooldowns[ability] = Math.max(0, tower.specialCooldowns[ability] - dt);
      }
      tower.jackpotRemaining = Math.max(0, tower.jackpotRemaining - dt);
      tower.domainRemaining = Math.max(0, tower.domainRemaining - dt);
    }
    this.effects = this.effects.filter((effect) => effect.expiresAt > this.elapsed);

    if (!this.started) return;
    if (this.waveState === "waiting") {
      return;
    } else if (this.waveState === "spawning") {
      this.spawnTimer -= dt;
      if (this.spawnRemaining > 0 && this.spawnTimer <= 0) {
        const queued = this.spawnQueue[this.spawnQueueIndex];
        if (queued) {
          this.spawnEnemy(queued.type);
          queued.remaining -= 1;
          if (queued.remaining === 0) this.spawnQueueIndex += 1;
        } else {
          this.spawnEnemy();
        }
        this.spawnRemaining -= 1;
        this.spawnTimer = CONFIG.enemySpawnInterval;
      }
      if (this.spawnRemaining === 0) this.waveState = "clearing";
    } else if (this.waveState === "clearing" && this.enemies.size === 0) {
      const waveExperience = 20 + this.wave * 5;
      for (const player of this.players.values()) {
        this.awardExperience(player, waveExperience);
        player.profile.gems += 50;
        if (this.wave % 10 === 0) player.profile.tickets += 1;
      }
      this.profileStore?.saveSoon();
      const waveLimit = this.gameMode().waveLimit;
      if (waveLimit !== null && this.wave >= waveLimit) {
        this.gameOver = true;
        this.victory = true;
      } else {
        this.waveState = "intermission";
        this.intermissionRemaining = this.gameMode().breakBetweenWaves;
      }
    } else if (this.waveState === "intermission") {
      this.intermissionRemaining -= dt;
      if (this.intermissionRemaining <= 0) this.startWave();
    }

    if (this.gameOver) return;
    for (const enemy of [...this.enemies.values()]) {
      const enemySettings = enemy.bossSettings;
      if (enemy.regenPerSecond > 0) {
        enemy.health = Math.min(
          enemy.maxHealth,
          enemy.health + (enemy.regenPerSecond + enemy.maxHealth * enemy.regenRatio) * dt,
        );
      }
      if (enemySettings?.role === "healer" && enemySettings.healRadius) {
        for (const ally of this.enemies.values()) {
          if (ally.id !== enemy.id && Math.hypot(ally.x - enemy.x, ally.z - enemy.z) <= enemySettings.healRadius) {
            ally.health = Math.min(ally.maxHealth, ally.health + enemySettings.healAmount * dt);
          }
        }
      }
      if (enemySettings?.summonType) {
        enemy.summonCooldownRemaining -= dt;
        if (enemy.summonCooldownRemaining <= 0) {
          for (let index = 0; index < enemySettings.summonCount; index += 1) {
            this.spawnEnemy(enemySettings.summonType, enemy);
          }
          enemy.summonCooldownRemaining = enemySettings.summonCooldown ?? 20;
        }
      }
      if (enemySettings?.cloneType) {
        enemy.cloneCooldownRemaining -= dt;
        if (enemy.cloneCooldownRemaining <= 0) {
          for (let index = 0; index < enemySettings.cloneCount; index += 1) {
            this.spawnEnemy(enemySettings.cloneType, enemy);
          }
          enemy.cloneCooldownRemaining = enemySettings.cloneCooldown;
        }
      }
      if (enemySettings?.shieldCooldown) {
        enemy.shieldCooldownRemaining -= dt;
        if (enemy.shieldCooldownRemaining <= 0) {
          enemy.shield = Math.max(enemy.shield, enemySettings.shieldAmount);
          enemy.shieldCooldownRemaining = enemySettings.shieldCooldown;
        }
      }
      if (enemySettings?.resistanceCooldown) {
        enemy.resistanceCooldownRemaining -= dt;
        if (enemy.resistanceCooldownRemaining <= 0) {
          enemy.resistanceUntil = this.elapsed + enemySettings.resistanceDuration;
          enemy.resistanceCooldownRemaining = enemySettings.resistanceCooldown;
        }
      }
      if (enemySettings?.removesDebuffs) {
        enemy.slowedUntil = 0;
        enemy.frozenUntil = 0;
      }
      if (enemySettings?.phaseSpeedMultiplier) {
        for (const threshold of [0.75, 0.5, 0.25]) {
          if (
            !enemy.appliedSpeedPhases.includes(threshold) &&
            enemy.health / enemy.maxHealth <= threshold
          ) {
            enemy.appliedSpeedPhases.push(threshold);
            enemy.speed *= enemySettings.phaseSpeedMultiplier;
          }
        }
      }
      if (
        enemySettings?.speedUpAt &&
        !enemy.speedBoosted &&
        enemy.health / enemy.maxHealth <= enemySettings.speedUpAt
      ) {
        enemy.speed *= enemySettings.enrageSpeedMultiplier;
        enemy.speedBoosted = true;
      }
      if (
        enemySettings?.enrageAt &&
        !enemy.enraged &&
        enemy.health / enemy.maxHealth <= enemySettings.enrageAt
      ) {
        enemy.enraged = true;
        if (!enemy.speedBoosted) enemy.speed *= enemySettings.enrageSpeedMultiplier;
        enemy.resistance = Math.max(enemy.resistance, enemySettings.enrageResistance);
      }
      if (enemy.enraged && enemySettings?.enrageSummonType) {
        enemy.enrageSummonCooldownRemaining = (enemy.enrageSummonCooldownRemaining ?? 0) - dt;
        if (enemy.enrageSummonCooldownRemaining <= 0) {
          for (let index = 0; index < enemySettings.enrageSummonCount; index += 1) {
            this.spawnEnemy(enemySettings.enrageSummonType, enemy);
          }
          enemy.enrageSummonCooldownRemaining = enemySettings.enrageSummonCooldown;
        }
      }
      if (enemySettings?.resistancePhaseIncrease) {
        for (const threshold of [0.75, 0.5, 0.25]) {
          if (
            !enemy.appliedSpeedPhases.includes(`resist-${threshold}`) &&
            enemy.health / enemy.maxHealth <= threshold
          ) {
            enemy.appliedSpeedPhases.push(`resist-${threshold}`);
            enemy.resistance = Math.min(0.9, enemy.resistance + enemySettings.resistancePhaseIncrease);
          }
        }
      }
      if (enemySettings?.towerStunCooldown) {
        enemy.towerStunCooldownRemaining -= dt;
        if (enemy.towerStunCooldownRemaining <= 0) {
          for (const tower of this.towers.values()) {
            if (Math.hypot(tower.x - enemy.x, tower.z - enemy.z) <= enemySettings.towerStunRadius) {
              tower.disabledUntil = this.elapsed + enemySettings.towerStunDuration;
            }
          }
          enemy.towerStunCooldownRemaining = enemySettings.towerStunCooldown;
        }
      }
      if (enemySettings?.disableTowerCooldown) {
        enemy.disableTowerCooldownRemaining -= dt;
        if (enemy.disableTowerCooldownRemaining <= 0 && this.towers.size) {
          const targets = [...this.towers.values()];
          const target = targets[Math.floor(Math.random() * targets.length)];
          target.disabledUntil = this.elapsed + enemySettings.disableTowerDuration;
          enemy.disableTowerCooldownRemaining = enemySettings.disableTowerCooldown;
        }
      }
      if (enemySettings?.domainCooldown) {
        enemy.domainCooldownRemaining -= dt;
        if (enemy.domainCooldownRemaining <= 0) {
          enemy.activeDomainUntil = this.elapsed + 15;
          if (enemySettings.shieldEnemiesOnDomain) {
            for (const ally of this.enemies.values()) {
              ally.shield = Math.max(ally.shield, ally.maxHealth * 0.1);
            }
          }
          this.effects.push({
            id: `fx${this.nextId++}`,
            type: "domain",
            x: enemy.x,
            z: enemy.z,
            radius: 35,
            expiresAt: enemy.activeDomainUntil,
          });
          enemy.domainCooldownRemaining = enemySettings.domainCooldown;
        }
      }
      if (enemySettings?.shrineCooldown) {
        enemy.shrineCooldownRemaining -= dt;
        if (enemy.shrineCooldownRemaining <= 0) {
          for (const tower of this.towers.values()) tower.disabledUntil = this.elapsed + 3;
          this.effects.push({
            id: `fx${this.nextId++}`,
            type: "shrine",
            x: enemy.x,
            z: enemy.z,
            radius: 80,
            expiresAt: this.elapsed + 2,
          });
          enemy.shrineCooldownRemaining = enemySettings.shrineCooldown;
        }
      }
      if (enemySettings?.rollCooldown) {
        enemy.abilityCooldownRemaining -= dt;
        if (enemy.abilityCooldownRemaining <= 0) {
          const effect = enemySettings.rollEffects[Math.floor(Math.random() * enemySettings.rollEffects.length)];
          if (effect === "heal" || effect === "fullHeal") enemy.health = enemy.maxHealth;
          if (effect === "speed" || effect === "doubleSpeed") enemy.speed *= 2;
          if (effect === "doubleHealth") {
            enemy.maxHealth *= 2;
            enemy.health *= 2;
          }
          if (effect === "invincible") enemy.invincibleUntil = this.elapsed + 8;
          if (effect === "spawn") {
            for (let index = 0; index < (enemySettings.summonCount ?? 1); index += 1) {
              this.spawnEnemy(enemySettings.summonType ?? "runner", enemy);
            }
          }
          enemy.abilityCooldownRemaining = enemySettings.rollCooldown;
        }
      }
      if (enemySettings?.teleportCooldown) {
        enemy.abilityCooldownRemaining -= dt;
        if (enemy.abilityCooldownRemaining <= 0) {
          this.moveEnemy(enemy, enemySettings.teleportDistance / Math.max(1, enemy.speed));
          enemy.abilityCooldownRemaining = enemySettings.teleportCooldown;
        }
      }
      if ((enemy.burnUntil ?? 0) > this.elapsed && (enemy.nextBurnAt ?? 0) <= this.elapsed) {
        this.damageEnemy(enemy, enemy.burnDamage);
        enemy.nextBurnAt = this.elapsed + 1;
      }
      if (!this.enemies.has(enemy.id)) continue;
      const slowMultiplier = (enemy.slowedUntil ?? 0) > this.elapsed ? enemy.slowMultiplier : 1;
      this.moveEnemy(enemy, dt * slowMultiplier);
    }
    if (this.gameOver) return;

    for (const tower of this.towers.values()) {
      const settings = this.towerStats(tower);
      if ((tower.disabledUntil ?? 0) > this.elapsed) {
        tower.targetId = null;
        continue;
      }
      if (tower.isUnit) {
        const unitHasTarget = [...this.enemies.values()].some((enemy) => {
          if ((enemy.flying && !CONFIG.towerTypes[tower.type].hitsFlying) ||
              (enemy.hidden && !CONFIG.towerTypes[tower.type].hitsHidden)) return false;
          return Math.hypot(enemy.x - tower.x, enemy.z - tower.z) <= settings.range;
        });
        if (!unitHasTarget) {
          tower.x = Math.min(
            CONFIG.waypoints[0].x,
            tower.x + CONFIG.summonedUnitSpeed * dt,
          );
        }
      }
      if (tower.type === "domainWarden") {
        tower.targetId = null;
        continue;
      }
      const modifiers = this.towerModifiers(tower);
      tower.cooldown = Math.max(0, tower.cooldown - dt);
      if (settings.shrine) {
        tower.shrineCooldown -= dt;
        if (tower.shrineCooldown <= 0) {
          for (const enemy of [...this.enemies.values()]) {
            if (Math.hypot(enemy.x - tower.x, enemy.z - tower.z) <= settings.shrine.radius) {
              this.damageEnemy(enemy, settings.shrine.damage, true);
            }
          }
          tower.shrineCooldown = settings.shrine.cooldown;
          this.effects.push({
            id: `fx${this.nextId++}`,
            type: "shrine",
            x: tower.x,
            z: tower.z,
            radius: settings.shrine.radius,
            expiresAt: this.elapsed + 1.5,
          });
        }
      }
      if (settings.power && tower.type === "mimic") {
        const copied = [...this.towers.values()]
          .filter((candidate) => {
            const candidateSettings = CONFIG.towerTypes[candidate.type];
            return (
              candidate.id !== tower.id &&
              candidateSettings.rarity === "Mythic" &&
              candidateSettings.levels[0].damage &&
              Math.hypot(candidate.x - tower.x, candidate.z - tower.z) <= settings.range
            );
          })
          .sort((a, b) => Math.hypot(a.x - tower.x, a.z - tower.z) - Math.hypot(b.x - tower.x, b.z - tower.z))[0];
        if (copied) {
          const copiedStats = this.towerStats(copied);
          settings.damage = copiedStats.damage * settings.power;
          settings.cooldown = copiedStats.cooldown;
          settings.range = copiedStats.range * settings.power;
        } else {
          settings.damage = 0;
          settings.cooldown = 1;
        }
      }
      if (tower.jackpotRemaining > 0) {
        settings.damage *= CONFIG.towerTypes.jackpotTrickster.jackpotDamageMultiplier;
        settings.range *= CONFIG.towerTypes.jackpotTrickster.jackpotRangeMultiplier;
        settings.cooldown *= CONFIG.towerTypes.jackpotTrickster.jackpotCooldownMultiplier;
      }
      const effectiveRange = settings.range * modifiers.rangeMultiplier;
      if (!settings.damage) {
        tower.targetId = null;
        continue;
      }
      if (tower.cooldown > 0) continue;
      let target;
      let targetPriority = -Infinity;
      let furthestProgress = -Infinity;
      for (const enemy of this.enemies.values()) {
        const distance = Math.hypot(enemy.x - tower.x, enemy.z - tower.z);
        if ((enemy.flying && !CONFIG.towerTypes[tower.type].hitsFlying) ||
            (enemy.hidden && !CONFIG.towerTypes[tower.type].hitsHidden)) continue;
        if (
          distance <= effectiveRange &&
          ((enemy.priority ?? 0) > targetPriority ||
            ((enemy.priority ?? 0) === targetPriority && enemy.progress > furthestProgress))
        ) {
          targetPriority = enemy.priority ?? 0;
          furthestProgress = enemy.progress;
          target = enemy;
        }
      }
      if (target) {
        tower.targetId = target.id;
        tower.cooldown = settings.cooldown * modifiers.cooldownMultiplier;
        let damage = Math.ceil(settings.damage * modifiers.damageMultiplier);
        const criticalChance = settings.criticalChance * (1 - (target.criticalResistance ?? 0));
        if (criticalChance && Math.random() < criticalChance) {
          damage *= settings.criticalMultiplier;
        }
        if (tower.type === "jackpotTrickster") {
          const roll = Math.random();
          const { jackpot, mini, nearMiss } = CONFIG.towerTypes.jackpotTrickster.jackpotRolls;
          if (roll < jackpot) {
            tower.jackpotRemaining = CONFIG.towerTypes.jackpotTrickster.jackpotDuration;
            damage *= CONFIG.towerTypes.jackpotTrickster.jackpotDamageMultiplier;
          } else if (roll < jackpot + mini) {
            damage *= 4;
          } else if (roll < jackpot + mini + nearMiss) {
            damage *= 2;
          }
        }
        if (settings.splashRadius) {
          for (const enemy of [...this.enemies.values()]) {
            if (Math.hypot(enemy.x - target.x, enemy.z - target.z) <= settings.splashRadius) {
              this.damageEnemy(enemy, damage, true);
              this.applyTowerEffects(enemy, settings);
            }
          }
        } else {
          this.damageEnemy(target, damage);
          this.applyTowerEffects(target, settings);
        }
      } else {
        tower.targetId = null;
      }
    }
  }
};
