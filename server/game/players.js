import { CONFIG } from "./config.js";
import { GACHA, getUnitsByRarity } from "../gacha.js";

export const methods = {
  addPlayer(id, name, profileId = id) {
    if (this.players.size >= CONFIG.maxPlayers) {
      return { ok: false, reason: "This match is full." };
    }
    if (this.hostId === null) this.hostId = id;
    const profile = this.profileStore?.getProfile(profileId) ?? {
      xp: 0,
      unitLevels: Object.fromEntries(Object.keys(CONFIG.towerTypes).map((type) => [type, 1])),
      gems: 5000,
      tickets: 10,
      ownedUnits: ["brawler"],
      equippedUnit: "brawler",
      pity: { legendary: 0, secret: 0 },
    };
    this.players.set(id, {
      id,
      name: this.cleanName(name),
      cash: CONFIG.startingCash,
      towerCount: 0,
      abilityCooldowns: { airstrike: 0, freeze: 0, cashBoost: 0 },
      cashBoostRemaining: 0,
      profileId,
      profile,
    });
    return { ok: true };
  },

  removePlayer(id) {
    this.players.delete(id);
    if (this.hostId === id) this.hostId = this.players.keys().next().value ?? null;
    for (const [towerId, tower] of this.towers) {
      if (tower.ownerId === id) this.towers.delete(towerId);
    }
  },

  setMode(playerId, mode) {
    if (this.started) return { ok: false, reason: "The match has already started." };
    if (playerId !== this.hostId) return { ok: false, reason: "Only the host can choose the game mode." };
    if (!Object.hasOwn(CONFIG.modes, mode)) return { ok: false, reason: "Choose a valid game mode." };
    this.mode = mode;
    this.baseHealth = this.gameMode().baseHealth;
    return { ok: true, reason: `${CONFIG.modes[mode].label} mode selected.` };
  },

  startMatch(playerId) {
    if (playerId !== this.hostId) return { ok: false, reason: "Only the host can start the match." };
    if (this.started) return { ok: false, reason: "The match has already started." };
    this.started = true;
    this.baseHealth = CONFIG.modes[this.mode].baseHealth;
    this.startWave();
    return { ok: true, reason: `${CONFIG.modes[this.mode].label} mode started.` };
  },

  activateAbility(playerId, ability, position) {
    const player = this.players.get(playerId);
    const settings = Object.hasOwn(CONFIG.abilities, ability) ? CONFIG.abilities[ability] : undefined;
    if (!player) return { ok: false, reason: "Join the match before using abilities." };
    if (!this.started) return { ok: false, reason: "Start the match before using abilities." };
    if (this.gameOver) return { ok: false, reason: "The match is over." };
    if (!settings) return { ok: false, reason: "That ability is not available." };
    if (player.abilityCooldowns[ability] > 0) {
      return { ok: false, reason: `${this.abilityLabel(ability)} is recharging.` };
    }

    if (ability === "airstrike") {
      if (
        !position ||
        typeof position.x !== "number" ||
        typeof position.z !== "number" ||
        !Number.isFinite(position.x) ||
        !Number.isFinite(position.z) ||
        position.x < CONFIG.map.minX ||
        position.x > CONFIG.map.maxX ||
        position.z < CONFIG.map.minZ ||
        position.z > CONFIG.map.maxZ
      ) {
        return { ok: false, reason: "Choose a target on the map." };
      }
      for (const enemy of [...this.enemies.values()]) {
        if (Math.hypot(enemy.x - position.x, enemy.z - position.z) <= settings.radius) {
          this.damageEnemy(enemy, settings.damage, true);
        }
      }
      this.effects.push({
        id: `fx${this.nextId++}`,
        type: ability,
        x: position.x,
        z: position.z,
        expiresAt: this.elapsed + settings.duration,
      });
    } else if (ability === "freeze") {
      for (const enemy of this.enemies.values()) {
        if (!enemy.freezeImmune && !enemy.stunImmune) {
          enemy.frozenUntil = Math.max(enemy.frozenUntil ?? 0, this.elapsed + settings.duration);
        }
      }
      this.effects.push({
        id: `fx${this.nextId++}`,
        type: ability,
        expiresAt: this.elapsed + settings.duration,
      });
    } else if (ability === "cashBoost") {
      player.cashBoostRemaining = settings.duration;
      this.effects.push({
        id: `fx${this.nextId++}`,
        type: ability,
        expiresAt: this.elapsed + settings.duration,
        ownerId: playerId,
      });
    }

    player.abilityCooldowns[ability] = settings.cooldown;
    return { ok: true, reason: `${this.abilityLabel(ability)} activated.` };
  },

  abilityLabel(ability) {
    return {
      airstrike: "Airstrike",
      freeze: "Freeze",
      cashBoost: "Cash boost",
    }[ability];
  },

  unitUpgradeCost(level) {
    return Math.ceil(100 * level ** 1.5);
  },

  upgradeUnit(playerId, type) {
    const player = this.players.get(playerId);
    if (!player) return { ok: false, reason: "Join the match before training units." };
    if (!Object.hasOwn(CONFIG.towerTypes, type)) {
      return { ok: false, reason: "Choose a valid unit to train." };
    }

    if (!player.profile.ownedUnits.includes(type)) {
      return { ok: false, reason: "Unlock this unit before training it." };
    }
    const currentLevel = player.profile.unitLevels[type] ?? 1;
    if (currentLevel >= CONFIG.maxUnitLevel) {
      return { ok: false, reason: "This unit has reached its maximum level." };
    }
    const cost = this.unitUpgradeCost(currentLevel);
    if (player.profile.xp < cost) return { ok: false, reason: "Not enough XP to train this unit." };

    player.profile.xp -= cost;
    player.profile.unitLevels[type] = currentLevel + 1;
    this.profileStore?.saveSoon();
    return {
      ok: true,
      reason: `${CONFIG.towerTypes[type].label} reached level ${currentLevel + 1}!`,
    };
  },

  awardExperience(player, amount) {
    player.profile.xp += amount;
    this.profileStore?.saveSoon();
  },

  rollRarity(player, guaranteeRarePlus = false) {
    if (player.profile.pity.secret + 1 >= GACHA.pity.secret) return "Secret";
    if (player.profile.pity.legendary + 1 >= GACHA.pity.legendary) return "Legendary";

    const roll = this.randomInt(10000);
    if (guaranteeRarePlus && roll < 7000) {
      const guaranteedRoll = this.randomInt(3000);
      if (guaranteedRoll < 2000) return "Rare";
      if (guaranteedRoll < 2800) return "Epic";
      if (guaranteedRoll < 2980) return "Legendary";
      return "Secret";
    }
    let threshold = 0;
    for (const entry of GACHA.rates) {
      threshold += entry.weight;
      if (roll < threshold) return entry.rarity;
    }
    return "Common";
  },

  summonCapsules(playerId, amount = 1, currency = "gems") {
    const player = this.players.get(playerId);
    if (!player) return { ok: false, reason: "Join the match before performing a ritual." };
    if (this.gameOver) return { ok: false, reason: "The match is over." };
    if (amount !== 1 && amount !== GACHA.multiPullCount) {
      return { ok: false, reason: "Choose a single ritual or the 11-capsule ritual." };
    }
    if (currency !== "gems" && !(currency === "ticket" && amount === 1)) {
      return { ok: false, reason: "That capsule payment option is not available." };
    }
    for (const { rarity } of GACHA.rates) {
      if (getUnitsByRarity(rarity).length === 0) {
        return { ok: false, reason: `No ${rarity} capsule units are configured.` };
      }
    }

    const cost =
      currency === "ticket" ? 0 : amount === 1 ? GACHA.singleCost : GACHA.multiPullCost;
    if (currency === "ticket" ? player.profile.tickets < 1 : player.profile.gems < cost) {
      return {
        ok: false,
        reason: currency === "ticket" ? "You do not have a capsule ticket." : "Not enough gems.",
      };
    }

    if (currency === "ticket") player.profile.tickets -= 1;
    else player.profile.gems -= cost;

    const results = [];
    for (let index = 0; index < amount; index += 1) {
      const guaranteeRarePlus =
        amount === GACHA.multiPullCount &&
        index === amount - 1 &&
        !results.some((result) => ["Rare", "Epic", "Legendary", "Secret"].includes(result.rarity));
      const rarity = this.rollRarity(player, guaranteeRarePlus);
      const units = getUnitsByRarity(rarity);
      if (units.length === 0) {
        return { ok: false, reason: `No ${rarity} capsule units are configured.` };
      }

      const type = units[this.randomInt(units.length)];
      const isNew = !player.profile.ownedUnits.includes(type);
      let duplicateGems = 0;
      if (isNew) player.profile.ownedUnits.push(type);
      else {
        duplicateGems = GACHA.duplicateGems[rarity];
        player.profile.gems += duplicateGems;
      }

      player.profile.pity.legendary += 1;
      player.profile.pity.secret += 1;
      if (rarity === "Legendary" || rarity === "Secret") player.profile.pity.legendary = 0;
      if (rarity === "Secret") player.profile.pity.secret = 0;
      results.push({
        type,
        label: CONFIG.towerTypes[type].label,
        icon: CONFIG.towerTypes[type].icon,
        color: CONFIG.towerTypes[type].color,
        rarity,
        isNew,
        duplicateGems,
      });
    }
    if (results.some((result) => result.rarity === "Secret")) {
      const secret = results.find((result) => result.rarity === "Secret");
      this.lastSecretAnnouncement = { label: secret.label, playerName: player.name };
    }

    this.profileStore?.saveSoon();
    return {
      ok: true,
      reason: amount === 1 ? "Capsule opened!" : "11 capsules opened!",
      results,
      gems: player.profile.gems,
      tickets: player.profile.tickets,
      pity: { ...player.profile.pity },
    };
  },

  equipUnit(playerId, type) {
    const player = this.players.get(playerId);
    if (!player) return { ok: false, reason: "Join the match before equipping a unit." };
    if (!Object.hasOwn(CONFIG.towerTypes, type) || !player.profile.ownedUnits.includes(type)) {
      return { ok: false, reason: "You can only equip a unit in your collection." };
    }
    player.profile.equippedUnit = type;
    this.profileStore?.saveSoon();
    return { ok: true, reason: `${CONFIG.towerTypes[type].label} equipped.` };
  },

  gameMode() {
    return CONFIG.modes[this.mode];
  },

  cleanName(name) {
    if (typeof name !== "string") return "Player";
    const clean = name.trim().replace(/[<>]/g, "").slice(0, 18);
    return clean || "Player";
  }
};
