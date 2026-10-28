import assert from "node:assert/strict";
import test from "node:test";
import { createSinglePlayerSocket } from "./singlePlayer.js";

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

function createConnectedSocket(storage) {
  const socket = createSinglePlayerSocket({
    storage,
    randomInt: () => 0,
    scheduleInterval: () => undefined,
  });
  let state;
  socket.on("state", (nextState) => {
    state = nextState;
  });

  return new Promise((resolve) => {
    socket.on("connect", () => {
      socket.emit("join", { name: "Solo Defender", profileId: "solo-profile" }, (result) => {
        assert.equal(result.ok, true);
        resolve({ socket, getState: () => state });
      });
    });
  });
}

test("single-player mode runs a match and saves progression in browser storage", async () => {
  const storage = createStorage();
  const { socket, getState } = await createConnectedSocket(storage);

  socket.emit("setMode", "normal");
  socket.emit("startMatch");
  socket.emit("summonUnit", "brawler");
  let state = getState();

  assert.equal(state.players.length, 1);
  assert.equal(state.players[0].name, "Solo Defender");
  assert.equal(state.started, true);
  assert.equal(state.towers.length, 1);
  assert.equal(state.players[0].cash, 0);

  socket.emit("summonCapsules", { amount: 1, currency: "gems" });
  state = getState();
  assert.equal(state.players[0].gems, 4525);

  const reloaded = await createConnectedSocket(storage);
  assert.equal(reloaded.getState().players[0].gems, 4525);
  assert.equal(reloaded.getState().players[0].ownedUnits.includes("brawler"), true);
});
