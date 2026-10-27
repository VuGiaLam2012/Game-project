import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { TOWER_TYPES } from "./towers/index.js";

const MAX_UNIT_LEVEL = 10;
const INITIAL_GEMS = 5000;
const INITIAL_TICKETS = 10;

function normalizeProfile(profile) {
  const source = profile && typeof profile === "object" ? profile : {};
  const sourceLevels = source.unitLevels && typeof source.unitLevels === "object" ? source.unitLevels : {};
  const ownedUnits = Array.isArray(source.ownedUnits)
    ? [...new Set(source.ownedUnits.filter((type) => Object.hasOwn(TOWER_TYPES, type)))]
    : [];
  if (!ownedUnits.includes("brawler")) ownedUnits.push("brawler");
  const sourcePity = source.pity && typeof source.pity === "object" ? source.pity : {};
  const equippedUnit = ownedUnits.includes(source.equippedUnit) ? source.equippedUnit : "brawler";
  const unitLevels = Object.fromEntries(
    Object.keys(TOWER_TYPES).map((type) => [
      type,
      Number.isFinite(sourceLevels[type])
        ? Math.max(1, Math.min(MAX_UNIT_LEVEL, Math.floor(sourceLevels[type])))
        : 1,
    ]),
  );
  return {
    xp: Number.isFinite(source.xp) ? Math.max(0, Math.floor(source.xp)) : 0,
    unitLevels,
    gems: Number.isFinite(source.gems) ? Math.max(0, Math.floor(source.gems)) : INITIAL_GEMS,
    tickets: Number.isFinite(source.tickets)
      ? Math.max(0, Math.floor(source.tickets))
      : INITIAL_TICKETS,
    ownedUnits,
    equippedUnit,
    pity: {
      legendary: Number.isFinite(sourcePity.legendary)
        ? Math.max(0, Math.floor(sourcePity.legendary))
        : 0,
      secret: Number.isFinite(sourcePity.secret) ? Math.max(0, Math.floor(sourcePity.secret)) : 0,
    },
  };
}

export class ProfileStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.profiles = new Map();
    this.writeQueue = Promise.resolve();
    this.saveTimer = undefined;
  }

  async load() {
    let serialized;
    try {
      serialized = await readFile(this.filePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }

    const savedProfiles = JSON.parse(serialized);
    if (!savedProfiles || typeof savedProfiles !== "object" || Array.isArray(savedProfiles)) {
      throw new Error("Saved player profiles must be a JSON object.");
    }
    for (const [id, profile] of Object.entries(savedProfiles)) {
      this.profiles.set(id, normalizeProfile(profile));
    }
  }

  getProfile(id) {
    let profile = this.profiles.get(id);
    if (!profile) {
      profile = normalizeProfile();
      this.profiles.set(id, profile);
    }
    return profile;
  }

  saveSoon() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = undefined;
      void this.flush();
    }, 250);
    this.saveTimer.unref?.();
  }

  flush() {
    clearTimeout(this.saveTimer);
    this.saveTimer = undefined;
    this.writeQueue = this.writeQueue
      .then(async () => {
        const directory = path.dirname(this.filePath);
        await mkdir(directory, { recursive: true });
        const temporaryPath = `${this.filePath}.tmp`;
        const serialized = JSON.stringify(Object.fromEntries(this.profiles), null, 2);
        await writeFile(temporaryPath, serialized, "utf8");
        await rename(temporaryPath, this.filePath);
      })
      .catch((error) => {
        console.error("Could not save player progression:", error);
      });
    return this.writeQueue;
  }
}
