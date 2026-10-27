import { TOWER_TYPES } from "./towers/index.js";

export const GACHA = Object.freeze({
  singleCost: 500,
  multiPullCost: 5000,
  multiPullCount: 11,
  rates: Object.freeze([
    { rarity: "Common", weight: 7000 },
    { rarity: "Rare", weight: 2000 },
    { rarity: "Epic", weight: 800 },
    { rarity: "Legendary", weight: 180 },
    { rarity: "Secret", weight: 20 },
  ]),
  pity: Object.freeze({ legendary: 100, secret: 1000 }),
  duplicateGems: Object.freeze({
    Common: 25,
    Rare: 50,
    Epic: 100,
    Legendary: 250,
    Secret: 1000,
  }),
  units: Object.freeze({
    brawler: "Common",
    flameSage: "Rare",
    frostWarden: "Rare",
    spiritBinder: "Rare",
    skyHunter: "Epic",
    jackpotTrickster: "Epic",
    voidAdept: "Legendary",
    mimic: "Legendary",
    domainWarden: "Legendary",
    shrineKing: "Secret",
  }),
  banner: Object.freeze({
    label: "CURSED CAPSULES",
    subtitle: "PRISON SEAL COLLECTION",
    featured: "shrineKing",
  }),
});

export function getUnitRarity(type) {
  return GACHA.units[type] ?? "Common";
}

export function getUnitsByRarity(rarity) {
  return Object.entries(GACHA.units)
    .filter(([, unitRarity]) => unitRarity === rarity)
    .map(([type]) => type)
    .filter((type) => Object.hasOwn(TOWER_TYPES, type));
}
