import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Server } from "socket.io";
import { Game } from "./game.js";
import { ProfileStore } from "./profileStore.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: true },
});
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distPath = path.join(root, "dist");
const profileStore = new ProfileStore(path.join(root, "data", "profiles.json"));
await profileStore.load();
const game = new Game(profileStore);

app.use(express.static(distPath));
app.get("/health", (_request, response) => {
  response.json({ ok: true, players: game.players.size, wave: game.wave });
});
app.get("*path", (_request, response, next) => {
  response.sendFile(path.join(distPath, "index.html"), (error) => {
    if (error) next();
  });
});

io.on("connection", (socket) => {
  socket.on("join", (payload, callback) => {
    const hasProfilePayload = payload && typeof payload === "object";
    const name = hasProfilePayload ? payload.name : payload;
    const profileId = hasProfilePayload ? payload.profileId : socket.id;
    if (
      hasProfilePayload &&
      (typeof profileId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(profileId))
    ) {
      if (typeof callback === "function") callback({ ok: false, reason: "Player profile ID is invalid." });
      socket.disconnect(true);
      return;
    }
    const result = game.addPlayer(socket.id, name, profileId);
    if (!result.ok) {
      if (typeof callback === "function") callback(result);
      socket.disconnect(true);
      return;
    }
    if (typeof callback === "function") callback({ ok: true, id: socket.id });
    io.emit("state", game.snapshot());
  });

  socket.on("placeTower", (payload, callback) => {
    const position = payload && typeof payload === "object" ? payload.position : undefined;
    const type = payload && typeof payload === "object" ? payload.type : undefined;
    const result = game.placeTower(socket.id, position, type);
    if (typeof callback === "function") callback(result);
    if (result.ok) io.emit("state", game.snapshot());
  });

  socket.on("summonUnit", (type, callback) => {
    const result = game.summonUnit(socket.id, type);
    if (typeof callback === "function") callback(result);
    if (result.ok) io.emit("state", game.snapshot());
  });

  socket.on("upgradeTower", (towerId, callback) => {
    const result = game.upgradeTower(socket.id, towerId);
    if (typeof callback === "function") callback(result);
    if (result.ok) io.emit("state", game.snapshot());
  });

  socket.on("upgradeUnit", (type, callback) => {
    const result = game.upgradeUnit(socket.id, type);
    if (typeof callback === "function") callback(result);
    if (result.ok) io.emit("state", game.snapshot());
  });

  socket.on("summonCapsules", (payload, callback) => {
    const amount = payload && typeof payload === "object" ? payload.amount : undefined;
    const currency = payload && typeof payload === "object" ? payload.currency : undefined;
    const result = game.summonCapsules(socket.id, amount, currency);
    if (typeof callback === "function") callback(result);
    if (result.ok) {
      io.emit("state", game.snapshot());
      const secret = result.results.find((entry) => entry.rarity === "Secret");
      if (secret) {
        io.emit("gachaAnnouncement", {
          playerName: game.players.get(socket.id)?.name ?? "A player",
          unitLabel: secret.label,
        });
      }
    }
  });

  socket.on("equipUnit", (type, callback) => {
    const result = game.equipUnit(socket.id, type);
    if (typeof callback === "function") callback(result);
    if (result.ok) io.emit("state", game.snapshot());
  });

  socket.on("useTowerAbility", (payload, callback) => {
    const towerId = payload && typeof payload === "object" ? payload.towerId : undefined;
    const ability = payload && typeof payload === "object" ? payload.ability : undefined;
    const position = payload && typeof payload === "object" ? payload.position : undefined;
    const result = game.activateTowerAbility(socket.id, towerId, ability, position);
    if (typeof callback === "function") callback(result);
    if (result.ok) io.emit("state", game.snapshot());
  });

  socket.on("setMode", (mode, callback) => {
    const result = game.setMode(socket.id, mode);
    if (typeof callback === "function") callback(result);
    if (result.ok) io.emit("state", game.snapshot());
  });

  socket.on("startMatch", (callback) => {
    const result = game.startMatch(socket.id);
    if (typeof callback === "function") callback(result);
    if (result.ok) io.emit("state", game.snapshot());
  });

  socket.on("useAbility", (payload, callback) => {
    const ability = payload && typeof payload === "object" ? payload.ability : undefined;
    const position = payload && typeof payload === "object" ? payload.position : undefined;
    const result = game.activateAbility(socket.id, ability, position);
    if (typeof callback === "function") callback(result);
    if (result.ok) io.emit("state", game.snapshot());
  });

  socket.on("disconnect", () => {
    game.removePlayer(socket.id);
    io.emit("state", game.snapshot());
  });
});

const tickInterval = setInterval(() => {
  game.tick(0.05);
  io.volatile.emit("state", game.snapshot());
}, 50);

const port = Number(process.env.PORT) || 3001;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Lane Guard server listening on http://localhost:${port}`);
});

async function shutdown() {
  clearInterval(tickInterval);
  await new Promise((resolve) => io.close(resolve));
  await profileStore.flush();
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    void shutdown().catch((error) => {
      console.error("Could not shut down cleanly:", error);
      process.exitCode = 1;
    });
  });
}
