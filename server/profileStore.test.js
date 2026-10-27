import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ProfileStore } from "./profileStore.js";

test("player progression saves and reloads with safe level bounds", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "lane-guard-profile-"));
  const filePath = path.join(directory, "profiles.json");
  const id = "d4219cab-03dc-4bdb-b6e5-5f6b6c4a24e0";

  try {
    const store = new ProfileStore(filePath);
    await store.load();
    const profile = store.getProfile(id);
    profile.xp = 275;
    profile.unitLevels.brawler = 3;
    profile.ownedUnits.push("flameSage");
    profile.equippedUnit = "flameSage";
    profile.gems = 4250;
    profile.tickets = 8;
    profile.pity.legendary = 12;
    store.saveSoon();
    await store.flush();

    const restored = new ProfileStore(filePath);
    await restored.load();
    assert.equal(restored.getProfile(id).xp, 275);
    assert.equal(restored.getProfile(id).unitLevels.brawler, 3);
    assert.equal(restored.getProfile(id).gems, 4250);
    assert.equal(restored.getProfile(id).tickets, 8);
    assert.deepEqual(restored.getProfile(id).ownedUnits, ["brawler", "flameSage"]);
    assert.equal(restored.getProfile(id).equippedUnit, "flameSage");
    assert.equal(restored.getProfile(id).pity.legendary, 12);

    await writeFile(
      filePath,
      JSON.stringify({ [id]: { xp: -20, unitLevels: { brawler: 100 } } }),
      "utf8",
    );
    const normalized = new ProfileStore(filePath);
    await normalized.load();
    assert.equal(normalized.getProfile(id).xp, 0);
    assert.equal(normalized.getProfile(id).unitLevels.brawler, 10);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
