import { CONFIG, Game } from "../server/game.js";

const PROFILE_STORAGE_KEY = "lane-guard-single-player-profiles";

function normalizeProfile(profile) {
  const source = profile && typeof profile === "object" ? profile : {};
  const sourceLevels = source.unitLevels && typeof source.unitLevels === "object" ? source.unitLevels : {};
  const ownedUnits = Array.isArray(source.ownedUnits)
    ? [...new Set(source.ownedUnits.filter((type) => Object.hasOwn(CONFIG.towerTypes, type)))]
    : [];
  if (!ownedUnits.includes("brawler")) ownedUnits.push("brawler");
  const sourcePity = source.pity && typeof source.pity === "object" ? source.pity : {};

  return {
    xp: Number.isFinite(source.xp) ? Math.max(0, Math.floor(source.xp)) : 0,
    unitLevels: Object.fromEntries(
      Object.keys(CONFIG.towerTypes).map((type) => [
        type,
        Number.isFinite(sourceLevels[type])
          ? Math.max(1, Math.min(CONFIG.maxUnitLevel, Math.floor(sourceLevels[type])))
          : 1,
      ]),
    ),
    gems: Number.isFinite(source.gems) ? Math.max(0, Math.floor(source.gems)) : 5000,
    tickets: Number.isFinite(source.tickets) ? Math.max(0, Math.floor(source.tickets)) : 10,
    ownedUnits,
    equippedUnit: ownedUnits.includes(source.equippedUnit) ? source.equippedUnit : "brawler",
    pity: {
      legendary: Number.isFinite(sourcePity.legendary)
        ? Math.max(0, Math.floor(sourcePity.legendary))
        : 0,
      secret: Number.isFinite(sourcePity.secret) ? Math.max(0, Math.floor(sourcePity.secret)) : 0,
    },
  };
}

function createProfileStore(storage, notify) {
  const profiles = new Map();
  let storageWarningSent = false;

  function warn(error) {
    console.error("Could not persist single-player progress:", error);
    if (!storageWarningSent) {
      storageWarningSent = true;
      notify("storageWarning", "Progress could not be saved in this browser.");
    }
  }

  if (storage) {
    try {
      const serialized = storage.getItem(PROFILE_STORAGE_KEY);
      if (serialized) {
        const savedProfiles = JSON.parse(serialized);
        if (!savedProfiles || typeof savedProfiles !== "object" || Array.isArray(savedProfiles)) {
          throw new Error("Saved player profiles must be a JSON object.");
        }
        for (const [id, profile] of Object.entries(savedProfiles)) {
          profiles.set(id, normalizeProfile(profile));
        }
      }
    } catch (error) {
      warn(error);
    }
  }

  return {
    getProfile(id) {
      let profile = profiles.get(id);
      if (!profile) {
        profile = normalizeProfile();
        profiles.set(id, profile);
        this.saveSoon();
      }
      return profile;
    },
    saveSoon() {
      if (!storage) return;
      try {
        storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(Object.fromEntries(profiles)));
      } catch (error) {
        warn(error);
      }
    },
  };
}

function secureRandomInt(max) {
  const range = 0x100000000;
  if (!Number.isInteger(max) || max < 1 || max > range) {
    throw new RangeError("Random integer upper bound must be between 1 and 2^32.");
  }
  const limit = Math.floor(range / max) * max;
  const values = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(values);
  } while (values[0] >= limit);
  return values[0] % max;
}

export function createSinglePlayerSocket({
  storage = null,
  randomInt = secureRandomInt,
  scheduleInterval = setInterval,
} = {}) {
  const listeners = new Map();
  const socket = {
    connected: true,
    on(event, handler) {
      const handlers = listeners.get(event) ?? [];
      handlers.push(handler);
      listeners.set(event, handlers);
      return socket;
    },
    emit(event, ...args) {
      const callback = typeof args.at(-1) === "function" ? args.pop() : undefined;
      const payload = args[0];
      let result;

      switch (event) {
        case "join": {
          const profileId = payload?.profileId;
          const playerId = `local-${profileId}`;
          result = game.addPlayer(playerId, payload?.name, profileId);
          if (result.ok) {
            localPlayerId = playerId;
            callback?.({ ok: true, id: playerId });
            publish("state", game.snapshot());
            return socket;
          }
          break;
        }
        case "placeTower":
          result = game.placeTower(localPlayerId, payload?.position, payload?.type);
          break;
        case "summonUnit":
          result = game.summonUnit(localPlayerId, payload);
          break;
        case "upgradeTower":
          result = game.upgradeTower(localPlayerId, payload);
          break;
        case "upgradeUnit":
          result = game.upgradeUnit(localPlayerId, payload);
          break;
        case "summonCapsules":
          result = game.summonCapsules(localPlayerId, payload?.amount, payload?.currency);
          break;
        case "equipUnit":
          result = game.equipUnit(localPlayerId, payload);
          break;
        case "useTowerAbility":
          result = game.activateTowerAbility(
            localPlayerId,
            payload?.towerId,
            payload?.ability,
            payload?.position,
          );
          break;
        case "setMode":
          result = game.setMode(localPlayerId, payload);
          break;
        case "startMatch":
          result = game.startMatch(localPlayerId);
          break;
        case "useAbility":
          result = game.activateAbility(localPlayerId, payload?.ability, payload?.position);
          break;
        default:
          throw new Error(`Unsupported single-player event: ${event}`);
      }

      callback?.(result);
      if (result?.ok) {
        publish("state", game.snapshot());
        const secret = result.results?.find((entry) => entry.rarity === "Secret");
        if (secret) {
          publish("gachaAnnouncement", {
            playerName: game.players.get(localPlayerId)?.name,
            unitLabel: secret.label,
          });
        }
      }
      return socket;
    },
  };

  function publish(event, value) {
    for (const handler of listeners.get(event) ?? []) handler(value);
  }

  const profileStore = createProfileStore(storage, publish);
  const game = new Game(profileStore, randomInt);
  let localPlayerId;

  queueMicrotask(() => {
    publish("connect");
  });

  scheduleInterval(() => {
    if (!localPlayerId) return;
    game.tick(0.05);
    publish("state", game.snapshot());
  }, 50);

  return socket;
}
