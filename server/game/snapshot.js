import { CONFIG } from "./config.js";
import { GACHA } from "../gacha.js";

export const methods = {
  snapshot() {
    return {
      wave: this.wave,
      waveState: this.waveState,
      nextWaveIn: Math.max(0, Math.ceil(this.intermissionRemaining)),
      baseHealth: this.baseHealth,
      maxBaseHealth: this.gameMode().baseHealth,
      gameOver: this.gameOver,
      victory: this.victory,
      started: this.started,
      hostId: this.hostId,
      mode: this.mode,
      modes: Object.fromEntries(
        Object.entries(CONFIG.modes).map(([id, mode]) => [
          id,
          { label: mode.label, description: mode.description, waveLimit: mode.waveLimit },
        ]),
      ),
      towerTypes: Object.fromEntries(
        Object.entries(CONFIG.towerTypes).map(([id, settings]) => [id, { ...settings }]),
      ),
      progression: { maxUnitLevel: CONFIG.maxUnitLevel, xpCostBase: 100 },
      gacha: {
        ...GACHA,
        rates: GACHA.rates.map((entry) => ({
          rarity: entry.rarity,
          percent: entry.weight / 100,
        })),
        units: { ...GACHA.units },
      },
      effects: this.effects.map(({ id, type, x, z, radius, ownerId, expiresAt }) => ({
        id,
        type,
        x: x ?? null,
        z: z ?? null,
        radius: radius ?? null,
        ownerId: ownerId ?? null,
        expiresIn: Math.max(0, expiresAt - this.elapsed),
      })),
      enemies: [...this.enemies.values()].map((enemy) => ({
        id: enemy.id,
        x: enemy.x,
        z: enemy.z,
        health: enemy.health,
        maxHealth: enemy.maxHealth,
        kind: enemy.kind,
        type: enemy.type,
        label: enemy.label,
        flying: enemy.flying,
        hidden: enemy.hidden,
        frozen: (enemy.frozenUntil ?? 0) > this.elapsed,
        shield: enemy.shield,
      })),
      towers: [...this.towers.values()].map((tower) => ({
        id: tower.id,
        ownerId: tower.ownerId,
        type: tower.type,
        isUnit: Boolean(tower.isUnit),
        x: tower.x,
        z: tower.z,
        level: tower.level,
        stats: this.towerStats(tower),
        upgradeCost: tower.level < CONFIG.towerTypes[tower.type].maxLevel ? this.upgradeCost(tower) : null,
        targetId: tower.targetId ?? null,
        abilityCooldowns: { ...tower.specialCooldowns },
        jackpotRemaining: tower.jackpotRemaining,
        domainRemaining: tower.domainRemaining,
      })),
      players: [...this.players.values()].map(({ id, name, cash, towerCount, abilityCooldowns, cashBoostRemaining, profile }) => ({
        id,
        name,
        cash,
        towerCount,
        abilityCooldowns,
        cashBoostRemaining,
        xp: profile.xp,
        unitLevels: { ...profile.unitLevels },
        gems: profile.gems,
        tickets: profile.tickets,
        ownedUnits: [...profile.ownedUnits],
        equippedUnit: profile.equippedUnit,
        pity: { ...profile.pity },
      })),
      waveModifier: this.waveModifier,
    };
  }
};
