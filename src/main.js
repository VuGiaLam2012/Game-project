import { createSinglePlayerSocket } from "./singlePlayer.js";
import "./style.css";

const CONFIG = {
  pathHalfWidth: 10,
  map: { minX: -82, maxX: 82, minZ: -42, maxZ: 42 },
  waypoints: [{ x: 72, z: 0 }, { x: -72, z: 0 }],
};

const canvas = document.querySelector("#scene");
const ctx = canvas.getContext("2d");
const connectionDot = document.querySelector("#connection-dot");
const connectionLabel = document.querySelector("#connection-label");
const waveValue = document.querySelector("#wave-value");
const baseValue = document.querySelector("#base-value");
const baseHealthBar = document.querySelector("#base-health-bar");
const statusMessage = document.querySelector("#status-message");
const playerCount = document.querySelector("#player-count");
const playerList = document.querySelector("#player-list");
const buildButton = document.querySelector("#build-button");
const towerCost = document.querySelector("#tower-cost");
const towerIcon = document.querySelector("#tower-icon");
const towerName = document.querySelector("#tower-name");
const towerDescription = document.querySelector("#tower-description");
const towerStats = document.querySelector("#tower-stats");
const unitLevelInfo = document.querySelector("#unit-level-info");
const unitXp = document.querySelector("#unit-xp");
const trainButton = document.querySelector("#train-button");
const towerPicker = document.querySelector("#tower-picker");
const selectedTowerPanel = document.querySelector("#selected-tower-panel");
const selectedTowerTitle = document.querySelector("#selected-tower-title");
const towerAbilityList = document.querySelector("#tower-ability-list");
const upgradeButton = document.querySelector("#upgrade-button");
const modeBadge = document.querySelector("#mode-badge");
const lobby = document.querySelector("#lobby");
const modeSelect = document.querySelector("#mode-select");
const lobbyDescription = document.querySelector("#lobby-description");
const startButton = document.querySelector("#start-button");
const hostHint = document.querySelector("#host-hint");
const lobbyTrainingUnit = document.querySelector("#lobby-training-unit");
const lobbyUnitLevel = document.querySelector("#lobby-unit-level");
const lobbyXp = document.querySelector("#lobby-xp");
const lobbyTrainButton = document.querySelector("#lobby-train-button");
const abilityButtons = [...document.querySelectorAll("[data-ability]")];
const toast = document.querySelector("#toast");
const openGachaButton = document.querySelector("#open-gacha");
const gachaScreen = document.querySelector("#gacha-screen");
const closeGachaButton = document.querySelector("#close-gacha");
const gachaGems = document.querySelector("#gacha-gems");
const gachaTickets = document.querySelector("#gacha-tickets");
const ticketPullButton = document.querySelector("#ticket-pull");
const singlePullButton = document.querySelector("#single-pull");
const multiPullButton = document.querySelector("#multi-pull");
const legendaryPity = document.querySelector("#legendary-pity");
const secretPity = document.querySelector("#secret-pity");
const legendaryPityBar = document.querySelector("#legendary-pity-bar");
const secretPityBar = document.querySelector("#secret-pity-bar");
const resonanceWarning = document.querySelector("#resonance-warning");
const collectionPanel = document.querySelector("#collection-panel");
const collectionGrid = document.querySelector("#collection-grid");
const collectionCount = document.querySelector("#collection-count");
const collectionUnitIcon = document.querySelector("#collection-unit-icon");
const collectionUnitName = document.querySelector("#collection-unit-name");
const collectionUnitRarity = document.querySelector("#collection-unit-rarity");
const equipUnitButton = document.querySelector("#equip-unit");
const bannerTab = document.querySelector("#banner-tab");
const collectionTab = document.querySelector("#collection-tab");
const capsuleResults = document.querySelector("#capsule-results");
const resultHeading = document.querySelector("#result-heading");
const resultList = document.querySelector("#result-list");
const continueGachaButton = document.querySelector("#continue-gacha");
const gameOver = document.querySelector("#game-over");
const gameOverEyebrow = document.querySelector("#game-over-eyebrow");
const gameOverTitle = document.querySelector("#game-over-title");
const gameOverMessage = document.querySelector("#game-over-message");
const replayButton = document.querySelector("#replay-button");

const camera = { x: 0, z: 0, zoom: 1, scale: 1, offsetX: 0, offsetY: 0 };
function createProfileId() {
  return globalThis.crypto?.randomUUID?.() ??
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
      const value = Math.floor(Math.random() * 16);
      return (character === "x" ? value : (value & 0x3) | 0x8).toString(16);
    });
}

function getProfileIdentity() {
  try {
    let profileId = localStorage.getItem("lane-guard-profile-id");
    if (!profileId) {
      profileId = createProfileId();
      localStorage.setItem("lane-guard-profile-id", profileId);
    }
    return { profileId, persistent: true };
  } catch (error) {
    console.error("Could not access persistent player storage:", error);
    return { profileId: createProfileId(), persistent: false };
  }
}

const profileIdentity = getProfileIdentity();
const socket = createSinglePlayerSocket({
  storage: profileIdentity.persistent ? window.localStorage : null,
});
let currentState;
let myId;
let selectedTowerType = "brawler";
let selectedTowerId;
let targetingAbility;
let towerAbilityTargeting;
let pointerPosition;
let toastTimer;
let resizeObserver;
let dragState;
let renderedModeKeys;
let selectedDexUnit = "brawler";
let capsuleBusy = false;
let hasInitializedEquippedUnit = false;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const width = rect.width;
  const height = rect.height;
  camera.scale = Math.min((width - 32) / 180, (height - 32) / 100) * camera.zoom;
  camera.offsetX = width / 2 - camera.x * camera.scale;
  camera.offsetY = height / 2 - camera.z * camera.scale;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeObserver = new ResizeObserver(resizeCanvas);
resizeObserver.observe(canvas);
window.addEventListener("resize", resizeCanvas);

function worldToScreen(x, z) {
  return {
    x: camera.offsetX + x * camera.scale,
    y: camera.offsetY + z * camera.scale,
  };
}

function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left - camera.offsetX) / camera.scale,
    z: (clientY - rect.top - camera.offsetY) / camera.scale,
  };
}

function roundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawOutlinedShape(fill, stroke, lineWidth, draw) {
  ctx.beginPath();
  draw();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawBoard() {
  const { width, height } = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f4d98d";
  ctx.fillRect(0, 0, width, height);

  const topLeft = worldToScreen(CONFIG.map.minX, CONFIG.map.minZ);
  const boardWidth = (CONFIG.map.maxX - CONFIG.map.minX) * camera.scale;
  const boardHeight = (CONFIG.map.maxZ - CONFIG.map.minZ) * camera.scale;
  roundedRect(topLeft.x, topLeft.y, boardWidth, boardHeight, 18);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#a9d77d";
  ctx.fillRect(topLeft.x, topLeft.y, boardWidth, boardHeight);

  ctx.globalAlpha = 0.5;
  for (let index = 0; index < 130; index += 1) {
    const x = topLeft.x + ((index * 73) % Math.max(1, boardWidth));
    const y = topLeft.y + ((index * 119) % Math.max(1, boardHeight));
    ctx.fillStyle = index % 3 === 0 ? "#f5f0bb" : index % 3 === 1 ? "#83bd69" : "#e9c36f";
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1.5, (1.4 + (index % 3) * 0.35) * camera.scale), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawRoad();
  drawMarkers();
  drawTowers();
  drawEnemies();
  drawEffects();
  drawAbilityPreview();
  ctx.restore();

  ctx.strokeStyle = "rgba(231, 239, 218, .5)";
  ctx.lineWidth = 3;
  roundedRect(topLeft.x, topLeft.y, boardWidth, boardHeight, 18);
  ctx.stroke();
  ctx.strokeStyle = "#604c3e";
  ctx.lineWidth = 2;
  roundedRect(topLeft.x, topLeft.y, boardWidth, boardHeight, 18);
  ctx.stroke();
}

function drawRoad() {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  CONFIG.waypoints.forEach((point, index) => {
    const screen = worldToScreen(point.x, point.z);
    if (index === 0) ctx.moveTo(screen.x, screen.y);
    else ctx.lineTo(screen.x, screen.y);
  });
  ctx.strokeStyle = "#604c3e";
  ctx.lineWidth = (CONFIG.pathHalfWidth * 2 + 6) * camera.scale;
  ctx.stroke();
  ctx.strokeStyle = "#f8d88f";
  ctx.lineWidth = CONFIG.pathHalfWidth * 2 * camera.scale;
  ctx.stroke();
  ctx.setLineDash([8 * camera.scale, 6 * camera.scale]);
  ctx.strokeStyle = "rgba(119, 83, 58, .25)";
  ctx.lineWidth = Math.max(1, 0.7 * camera.scale);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawMarkers() {
  for (const [point, color, label] of [
    [CONFIG.waypoints[0], "#e36d54", "ENEMY BASE"],
    [CONFIG.waypoints.at(-1), "#6cae53", "YOUR BASE"],
  ]) {
    const screen = worldToScreen(point.x, point.z);
    const radius = Math.max(8, 5.5 * camera.scale);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#604c3e";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = "#fff8d9";
    ctx.font = `800 ${Math.max(8, 2.2 * camera.scale)}px "Trebuchet MS", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(label, screen.x, screen.y - radius - 3);
  }

  const enemyBase = worldToScreen(CONFIG.waypoints[0].x, CONFIG.waypoints[0].z);
  const enemySize = Math.max(18, camera.scale * 10);
  drawOutlinedShape("#f2a28a", "#604c3e", Math.max(1.5, camera.scale * 0.5), () => {
    roundedRect(enemyBase.x - enemySize / 2, enemyBase.y - enemySize / 2, enemySize, enemySize, enemySize * 0.25);
  });
  ctx.fillStyle = "#604c3e";
  ctx.beginPath();
  ctx.arc(enemyBase.x - enemySize * 0.18, enemyBase.y - enemySize * 0.08, Math.max(1.4, camera.scale * 0.75), 0, Math.PI * 2);
  ctx.arc(enemyBase.x + enemySize * 0.18, enemyBase.y - enemySize * 0.08, Math.max(1.4, camera.scale * 0.75), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#604c3e";
  ctx.lineWidth = Math.max(1.2, camera.scale * 0.45);
  ctx.beginPath();
  ctx.arc(enemyBase.x, enemyBase.y + enemySize * 0.12, enemySize * 0.18, 0, Math.PI);
  ctx.stroke();

  const base = worldToScreen(CONFIG.waypoints.at(-1).x, CONFIG.waypoints.at(-1).z);
  const size = Math.max(15, camera.scale * 8);
  drawOutlinedShape("#fff0b0", "#604c3e", Math.max(1.5, camera.scale * 0.45), () => {
    roundedRect(base.x - size / 2, base.y - size / 2, size, size, size * 0.25);
  });
  ctx.fillStyle = "#ed765b";
  ctx.beginPath();
  ctx.moveTo(base.x - size * 0.58, base.y - size * 0.2);
  ctx.lineTo(base.x, base.y - size * 0.72);
  ctx.lineTo(base.x + size * 0.58, base.y - size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#604c3e";
  ctx.lineWidth = Math.max(1.5, camera.scale * 0.4);
  ctx.stroke();
  ctx.fillStyle = "#6b9fce";
  ctx.fillRect(base.x - size * 0.13, base.y - size * 0.1, size * 0.26, size * 0.6);
}

function drawTowers() {
  for (const tower of currentState?.towers || []) {
    const point = worldToScreen(tower.x, tower.z);
    const radius = Math.max(7, 3.7 * camera.scale);
    const settings = currentState.towerTypes?.[tower.type];
    const color = settings?.color || "#e7b85b";
    const target = tower.targetId && currentState.enemies.find((enemy) => enemy.id === tower.targetId);
    if (tower.type === "domainWarden") {
      ctx.beginPath();
      ctx.arc(point.x, point.y, (tower.stats?.range || 16) * camera.scale, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(172, 127, 218, .12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(123, 80, 157, .35)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (target) {
      const enemyPoint = worldToScreen(target.x, target.z);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(enemyPoint.x, enemyPoint.y);
      ctx.strokeStyle = "rgba(238, 116, 82, .7)";
      ctx.lineWidth = Math.max(1.5, camera.scale * 0.35);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(91, 73, 52, .25)";
    ctx.beginPath();
    ctx.ellipse(point.x + radius * 0.12, point.y + radius * 0.8, radius * 1.1, radius * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    if (tower.id === selectedTowerId) {
      ctx.strokeStyle = "#fff3a7";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(point.x, point.y + radius * 0.15, radius * 1.8, radius * 1.05, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    const angle = target ? Math.atan2(target.z - tower.z, target.x - tower.x) : -Math.PI / 2;
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(angle * 0.12);
    const lineWidth = Math.max(1.5, radius * 0.17);
    const bodyWidth = radius * 1.65;
    const bodyHeight = radius * 1.2;
    drawOutlinedShape(color, "#604c3e", lineWidth, () => {
      roundedRect(-bodyWidth / 2, -bodyHeight * 0.05, bodyWidth, bodyHeight, bodyHeight * 0.42);
    });
    drawOutlinedShape("#fff0c2", "#604c3e", lineWidth, () => {
      ctx.arc(0, -radius * 0.42, radius * 0.76, 0, Math.PI * 2);
    });
    ctx.fillStyle = "#4a3b36";
    ctx.beginPath();
    ctx.arc(-radius * 0.22, -radius * 0.45, Math.max(1, radius * 0.11), 0, Math.PI * 2);
    ctx.arc(radius * 0.22, -radius * 0.45, Math.max(1, radius * 0.11), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#604c3e";
    ctx.lineWidth = Math.max(1, radius * 0.1);
    ctx.beginPath();
    ctx.arc(0, -radius * 0.25, radius * 0.18, 0.2, Math.PI - 0.2);
    ctx.stroke();
    if (tower.type === "shrineKing") {
      ctx.fillStyle = "#f4c34d";
      ctx.beginPath();
      ctx.moveTo(-radius * 0.55, -radius * 0.86);
      ctx.lineTo(-radius * 0.38, -radius * 1.25);
      ctx.lineTo(-radius * 0.08, -radius * 0.92);
      ctx.lineTo(radius * 0.2, -radius * 1.28);
      ctx.lineTo(radius * 0.55, -radius * 0.86);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#604c3e";
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawEnemies() {
  for (const enemy of currentState?.enemies || []) {
    const point = worldToScreen(enemy.x, enemy.z);
    const radius = Math.max(6, camera.scale * (enemy.kind === "boss" ? 3.2 : enemy.flying ? 2.4 : 2.1));
    ctx.fillStyle = "rgba(91, 73, 52, .24)";
    ctx.beginPath();
    ctx.ellipse(point.x + radius * 0.1, point.y + radius * 0.72, radius * 1.1, radius * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    const fill = enemy.frozen ? "#72cce2" : enemy.kind === "boss" ? "#9a62b5" : enemy.flying ? "#f2b74e" : enemy.hidden ? "#9988be" : "#f07862";
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.globalAlpha = enemy.hidden ? 0.68 : 1;
    if (enemy.flying) {
      drawOutlinedShape("#fff0c2", "#604c3e", Math.max(1, radius * 0.14), () => {
        ctx.ellipse(-radius * 0.82, radius * 0.05, radius * 0.62, radius * 0.24, -0.5, 0, Math.PI * 2);
        ctx.ellipse(radius * 0.82, radius * 0.05, radius * 0.62, radius * 0.24, 0.5, 0, Math.PI * 2);
      });
    }
    drawOutlinedShape(fill, "#604c3e", Math.max(1.5, radius * 0.16), () => {
      ctx.ellipse(0, 0, radius, radius * 0.88, 0, 0, Math.PI * 2);
    });
    ctx.fillStyle = "#604c3e";
    ctx.beginPath();
    ctx.arc(-radius * 0.3, -radius * 0.12, Math.max(1.2, radius * 0.14), 0, Math.PI * 2);
    ctx.arc(radius * 0.3, -radius * 0.12, Math.max(1.2, radius * 0.14), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#604c3e";
    ctx.lineWidth = Math.max(1, radius * 0.1);
    ctx.beginPath();
    ctx.arc(0, radius * 0.2, radius * 0.2, 0.15, Math.PI - 0.15);
    ctx.stroke();
    if (enemy.kind === "boss") {
      ctx.fillStyle = "#f4c34d";
      ctx.beginPath();
      ctx.moveTo(-radius * 0.62, -radius * 0.58);
      ctx.lineTo(-radius * 0.48, -radius * 1.12);
      ctx.lineTo(-radius * 0.12, -radius * 0.78);
      ctx.lineTo(radius * 0.18, -radius * 1.18);
      ctx.lineTo(radius * 0.62, -radius * 0.58);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#604c3e";
      ctx.lineWidth = Math.max(1.5, radius * 0.14);
      ctx.stroke();
    }
    ctx.restore();

    const barWidth = Math.max(14, radius * 2.4);
    const barHeight = Math.max(3, radius * 0.38);
    const ratio = Math.max(0, enemy.health / enemy.maxHealth);
    const barX = point.x - barWidth / 2;
    const barY = point.y - radius - barHeight - 3;
    ctx.fillStyle = "#604c3e";
    roundedRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, barHeight);
    ctx.fill();
    ctx.fillStyle = "#fff2cc";
    roundedRect(barX, barY, barWidth, barHeight, barHeight);
    ctx.fill();
    ctx.fillStyle = ratio > 0.5 ? "#74bd59" : ratio > 0.25 ? "#f3bb4d" : "#ed6b59";
    roundedRect(barX, barY, barWidth * ratio, barHeight, barHeight);
    ctx.fill();
  }
}

function drawEffects() {
  for (const effect of currentState?.effects || []) {
    if (effect.x === null || effect.z === null) continue;
    const point = worldToScreen(effect.x, effect.z);
    const pulse = (Date.now() % 420) / 420;
    const radius = (effect.radius ?? 8) * camera.scale * (0.88 + pulse * 0.12);
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle =
      effect.type === "pull"
        ? `rgba(121, 149, 244, ${1 - pulse})`
        : effect.type === "blast" || effect.type === "nuke"
          ? `rgba(238, 115, 101, ${1 - pulse})`
          : effect.type === "domain"
            ? `rgba(190, 145, 231, ${1 - pulse})`
            : effect.type === "shrine"
              ? `rgba(239, 112, 105, ${1 - pulse})`
              : `rgba(255, 218, 126, ${1 - pulse})`;
    ctx.lineWidth = Math.max(1, 1.5 * camera.scale);
    ctx.stroke();
  }
  if ((currentState?.effects || []).some((effect) => effect.type === "freeze")) {
    ctx.fillStyle = "rgba(108, 200, 232, .08)";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }
}

function drawAbilityPreview() {
  if ((targetingAbility !== "airstrike" && !towerAbilityTargeting) || !pointerPosition) return;
  const { x, z } = pointerPosition;
  const point = worldToScreen(x, z);
  const tower = currentState?.towers.find((entry) => entry.id === towerAbilityTargeting?.towerId);
  const ability = tower && currentState.towerTypes[tower.type].abilities?.[towerAbilityTargeting.ability];
  const radius = targetingAbility === "airstrike" ? 14 : ability?.radius ?? 5;
  if (tower && ability) {
    const towerPoint = worldToScreen(tower.x, tower.z);
    ctx.beginPath();
    ctx.arc(towerPoint.x, towerPoint.y, ability.range * camera.scale, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 224, 150, .45)";
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = "rgba(251, 192, 107, .15)";
  ctx.strokeStyle = "rgba(255, 219, 150, .9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius * camera.scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function renderPlayers(players) {
  playerCount.textContent = `${players.length}/1`;
  playerList.replaceChildren();
  for (const player of players) {
    const item = document.createElement("li");
    const dot = document.createElement("span");
    dot.className = "player-dot";
    dot.style.backgroundColor = player.id === myId ? "#e7b85b" : "#69b6c0";
    const name = document.createElement("span");
    name.className = "player-name";
    name.textContent = player.name + (player.id === myId ? " (you)" : "");
    const cash = document.createElement("b");
    cash.textContent = `$${player.cash}`;
    item.append(dot, name, cash);
    playerList.append(item);
  }
}

function renderState(state) {
  if (myId && !hasInitializedEquippedUnit) {
    const player = state.players.find((entry) => entry.id === myId);
    if (player?.ownedUnits?.includes(player.equippedUnit)) {
      selectedTowerType = player.equippedUnit;
      selectedDexUnit = player.equippedUnit;
      hasInitializedEquippedUnit = true;
    }
  }
  waveValue.textContent = String(state.wave).padStart(2, "0");
  const maxBaseHealth = state.maxBaseHealth || 20;
  baseValue.textContent = `${state.baseHealth} / ${maxBaseHealth}`;
  baseHealthBar.style.width = `${Math.max(0, state.baseHealth / maxBaseHealth) * 100}%`;
  const mode = state.modes?.[state.mode];
  modeBadge.textContent = `${mode?.label || state.mode} MODE`;
  if (!state.started) {
    statusMessage.textContent = "Choose a mode and start your run.";
  } else if (state.waveState === "spawning") {
    statusMessage.textContent = `Wave ${state.wave} is arriving · ${state.enemies.length} on the path`;
  } else if (state.waveState === "intermission") {
    statusMessage.textContent = `Next wave in ${state.nextWaveIn}s · summon more units`;
  } else {
    statusMessage.textContent = `Push the lane · ${state.enemies.length} enemies remain`;
  }
  if (state.waveModifier) statusMessage.textContent += ` · ${state.waveModifier} modifier`;
  renderPlayers(state.players);
  renderLobby(state);
  renderAbilityButtons(state);
  renderTowerSelection(state);
  renderGacha(state);
  if (state.gameOver) {
    gameOverEyebrow.textContent = state.victory ? "DEFENSE COMPLETE" : "DEFENSE FAILED";
    gameOverTitle.textContent = state.victory ? "The enemy stronghold has fallen!" : "Your base has fallen.";
    gameOverMessage.textContent = state.victory
      ? `You cleared every ${state.mode === "challenge" ? "challenge" : "campaign"} wave.`
      : "Your defense has fallen. Start a new run to try again.";
    gameOver.classList.remove("hidden");
    setTargetingAbility(undefined);
  }
}

function renderGacha(state) {
  const player = state.players.find((entry) => entry.id === myId);
  const gacha = state.gacha;
  if (!player || !gacha) return;

  const owned = new Set(player.ownedUnits);
  gachaGems.textContent = String(player.gems);
  gachaTickets.textContent = String(player.tickets);
  legendaryPity.textContent = `${player.pity.legendary} / ${gacha.pity.legendary}`;
  secretPity.textContent = `${player.pity.secret} / ${gacha.pity.secret}`;
  const legendaryProgress = Math.min(100, (player.pity.legendary / gacha.pity.legendary) * 100);
  const secretProgress = Math.min(100, (player.pity.secret / gacha.pity.secret) * 100);
  legendaryPityBar.style.width = `${legendaryProgress}%`;
  secretPityBar.style.width = `${secretProgress}%`;
  resonanceWarning.classList.toggle(
    "hidden",
    legendaryProgress < 80 && secretProgress < 80,
  );
  const canPull = socket.connected && !state.gameOver && !capsuleBusy;
  ticketPullButton.disabled = !canPull || player.tickets < 1;
  singlePullButton.disabled = !canPull || player.gems < gacha.singleCost;
  multiPullButton.disabled = !canPull || player.gems < gacha.multiPullCost;

  const featured = state.towerTypes[gacha.banner.featured];
  if (featured) {
    document.querySelector("#featured-unit-icon").textContent = featured.icon;
    document.querySelector("#featured-unit-icon").style.color = featured.color;
    document.querySelector("#featured-unit-name").textContent = featured.label.toUpperCase();
  }
  const rateList = document.querySelector(".rate-list");
  rateList.replaceChildren(
    ...gacha.rates.map((entry) => {
      const row = document.createElement("div");
      row.className = `rarity-${entry.rarity.toLowerCase()}`;
      const name = document.createElement("b");
      name.textContent = entry.rarity.toUpperCase();
      const rate = document.createElement("strong");
      rate.textContent = `${entry.percent}%`;
      row.append(name, rate);
      return row;
    }),
  );

  const units = Object.entries(state.towerTypes);
  collectionCount.textContent = `${owned.size} / ${units.length} OWNED`;
  collectionGrid.replaceChildren(
    ...units.map(([type, unit]) => {
      const isOwned = owned.has(type);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `dex-unit ${isOwned ? "" : "locked"}${selectedDexUnit === type ? " selected" : ""}`;
      button.dataset.dexUnit = type;
      button.disabled = !isOwned;
      const icon = document.createElement("span");
      icon.textContent = isOwned ? unit.icon : "？";
      icon.style.color = unit.color;
      const name = document.createElement("b");
      name.textContent = isOwned ? unit.label : "SEALED UNIT";
      const rarity = document.createElement("small");
      rarity.textContent = (gacha.units[type] ?? "Common").toUpperCase();
      button.append(icon, name, rarity);
      return button;
    }),
  );
  renderDexDetail(state, selectedDexUnit, owned);
}

function renderDexDetail(state, type, owned = new Set()) {
  const unit = state.towerTypes[type];
  if (!unit) return;
  const player = state.players.find((entry) => entry.id === myId);
  const isOwned = owned.has(type) || player?.ownedUnits.includes(type);
  collectionUnitIcon.textContent = isOwned ? unit.icon : "？";
  collectionUnitIcon.style.color = unit.color;
  collectionUnitName.textContent = isOwned ? unit.label : "Sealed unit";
  collectionUnitRarity.textContent = `${state.gacha.units[type] ?? "Common"} · ${
    player?.equippedUnit === type ? "EQUIPPED" : isOwned ? "OWNED" : "LOCKED"
  }`;
  equipUnitButton.disabled = !socket.connected || !isOwned || capsuleBusy;
  equipUnitButton.textContent = player?.equippedUnit === type ? "EQUIPPED" : "EQUIP";
}

function renderCapsuleResults(results) {
  resultList.replaceChildren(
    ...results.map((result) => {
      const card = document.createElement("article");
      card.className = `pull-result rarity-${result.rarity.toLowerCase()}`;
      const icon = document.createElement("span");
      icon.className = "pull-result-icon";
      icon.textContent = result.icon;
      icon.style.color = result.color;
      const details = document.createElement("div");
      details.className = "pull-result-details";
      const rarity = document.createElement("small");
      rarity.textContent = result.rarity.toUpperCase();
      const label = document.createElement("b");
      label.textContent = result.label;
      const status = document.createElement("span");
      status.textContent = result.isNew ? "NEW UNIT" : `DUPLICATE · +${result.duplicateGems} ◆`;
      details.append(rarity, label, status);
      const equip = document.createElement("button");
      equip.type = "button";
      equip.className = "result-equip";
      equip.dataset.equipType = result.type;
      equip.textContent = "EQUIP";
      card.append(icon, details, equip);
      return card;
    }),
  );
}

function renderTowerSelection(state) {
  const settings = state.towerTypes?.[selectedTowerType];
  if (!settings) return;
  const player = state.players.find((entry) => entry.id === myId);
  const isSelectedUnitOwned = player?.ownedUnits?.includes(selectedTowerType) ?? false;
  const profileLevel = player?.unitLevels?.[selectedTowerType] ?? 1;
  const maxUnitLevel = state.progression?.maxUnitLevel ?? 10;
  const xpCostBase = state.progression?.xpCostBase ?? 100;
  const levelBonus = profileLevel - 1;
  const levelStats = { ...(settings.levels?.[0] ?? {}) };
  for (const stat of ["damage", "burnDamage", "damageBuff", "rangeBuff", "splashRadius"]) {
    if (typeof levelStats[stat] === "number") levelStats[stat] *= 1 + levelBonus * 0.1;
  }
  if (typeof levelStats.cooldown === "number") {
    levelStats.cooldown *= Math.max(0.7, 1 - levelBonus * 0.025);
  }
  if (typeof levelStats.range === "number") levelStats.range *= 1 + levelBonus * 0.02;
  towerIcon.textContent = settings.icon;
  towerIcon.style.color = settings.color;
  towerName.textContent = settings.label;
  towerDescription.textContent = settings.description;
  towerCost.textContent = `$${settings.cost}`;
  const fireRate = levelStats.cooldown
    ? levelStats.cooldown <= 0.35
      ? "VERY FAST"
      : levelStats.cooldown <= 0.8
        ? "FAST"
        : `${levelStats.cooldown}s`
    : "PASSIVE";
  const stats = [
    ["RANGE", String(levelStats.range ?? "—")],
    [
      levelStats.damageBuff ? "BUFF" : levelStats.burnDamage ? "BURN" : "DAMAGE",
      levelStats.damageBuff
        ? `${Math.round(levelStats.damageBuff * 100)}%`
        : levelStats.spiritCount
          ? `${levelStats.spiritCount} spirits`
          : levelStats.damage
            ? `${levelStats.damage}${levelStats.burnDamage ? ` + ${levelStats.burnDamage}/s` : ""}`
            : "SUPPORT",
    ],
    [levelStats.slow ? "SLOW" : "FIRE RATE", levelStats.slow ? `${Math.round(levelStats.slow * 100)}%` : fireRate],
  ];
  towerStats.replaceChildren(
    ...stats.map(([label, value]) => {
      const stat = document.createElement("span");
      const caption = document.createTextNode(`${label} `);
      const amount = document.createElement("b");
      amount.textContent = value;
      stat.append(caption, amount);
      return stat;
    }),
  );
  const trainingCost =
    profileLevel >= maxUnitLevel ? null : Math.ceil(xpCostBase * profileLevel ** 1.5);
  unitLevelInfo.textContent = `Lv. ${profileLevel} · +${(profileLevel - 1) * 10}% ATK`;
  unitXp.textContent = `${player?.xp ?? 0} XP`;
  trainButton.textContent = trainingCost === null ? "MAX LEVEL" : `TRAIN · ${trainingCost} XP`;
  trainButton.disabled =
    !socket.connected ||
    !player ||
    trainingCost === null ||
    player.xp < trainingCost;
  lobbyTrainingUnit.replaceChildren(
    ...Object.entries(state.towerTypes).map(([type, unit]) => {
      const option = document.createElement("option");
      option.value = type;
      const unitLevel = player?.unitLevels?.[type] ?? 1;
      const isOwned = player?.ownedUnits?.includes(type) ?? false;
      option.textContent = isOwned ? `${unit.label} · Lv ${unitLevel}` : `${unit.label} · LOCKED`;
      option.disabled = !isOwned;
      return option;
    }),
  );
  lobbyTrainingUnit.value = isSelectedUnitOwned ? selectedTowerType : player?.equippedUnit ?? "brawler";
  lobbyUnitLevel.textContent = `LEVEL ${profileLevel}`;
  lobbyXp.textContent = `${player?.xp ?? 0} XP`;
  lobbyTrainButton.textContent =
    trainingCost === null ? "MAX LEVEL" : `TRAIN UNIT · ${trainingCost} XP`;
  lobbyTrainButton.disabled =
    !socket.connected ||
    !player ||
    trainingCost === null ||
    player.xp < trainingCost;
  towerPicker.replaceChildren(
    ...Object.entries(state.towerTypes).map(([type, option]) => {
      const button = document.createElement("button");
      button.className = `tower-option${type === selectedTowerType ? " selected" : ""}`;
      button.type = "button";
      button.dataset.tower = type;
      const isOwned = player?.ownedUnits?.includes(type) ?? false;
      button.disabled = !isOwned || !state.started || state.gameOver || !socket.connected;
      const icon = document.createElement("span");
      icon.textContent = option.icon;
      icon.style.color = option.color;
      const label = document.createElement("b");
      label.textContent = option.label;
      const cost = document.createElement("small");
      const unitLevel = player?.unitLevels?.[type] ?? 1;
      cost.textContent = isOwned ? `$${option.cost} · Lv ${unitLevel}` : "LOCKED";
      button.append(icon, label, cost);
      return button;
    }),
  );
  buildButton.querySelector("span").textContent = `Summon ${settings.label}`;
  buildButton.disabled =
    !isSelectedUnitOwned ||
    !state.started ||
    state.gameOver ||
    !socket.connected ||
    (player?.cash ?? 0) < settings.cost;
  renderSelectedTower(state);
}

function renderSelectedTower(state) {
  const tower = state.towers.find((entry) => entry.id === selectedTowerId);
  if (!tower) {
    selectedTowerId = undefined;
    selectedTowerPanel.classList.add("hidden");
    towerAbilityList.replaceChildren();
    return;
  }
  selectedTowerPanel.classList.remove("hidden");
  const settings = state.towerTypes[tower.type];
  const owned = tower.ownerId === myId;
  const player = state.players.find((entry) => entry.id === myId);
  const unitLevel = player?.unitLevels?.[tower.type] ?? 1;
  selectedTowerTitle.textContent = `${settings.label} · UNIT LV ${unitLevel} · BATTLE LV ${tower.level}`;
  const abilities = Object.entries(settings.abilities ?? {});
  if (settings.ultimate) abilities.push(["ultimate", settings.ultimate]);
  towerAbilityList.replaceChildren(
    ...abilities.map(([key, ability]) => {
      const button = document.createElement("button");
      const cooldown = tower.abilityCooldowns?.[key] ?? 0;
      button.className = `tower-special-button${towerAbilityTargeting?.ability === key && towerAbilityTargeting?.towerId === tower.id ? " selected" : ""}`;
      button.type = "button";
      button.dataset.towerAbility = key;
      button.textContent = cooldown > 0 ? `${ability.label} ${Math.ceil(cooldown)}s` : ability.label;
      button.disabled = !owned || !socket.connected || cooldown > 0 || !state.started || state.gameOver;
      return button;
    }),
  );
  upgradeButton.textContent = tower.upgradeCost === null ? "MAX LEVEL" : `IN-BATTLE UPGRADE · $${tower.upgradeCost}`;
  upgradeButton.disabled =
    !owned ||
    tower.upgradeCost === null ||
    !socket.connected ||
    !state.started ||
    state.gameOver ||
    (state.players.find((entry) => entry.id === myId)?.cash ?? 0) < tower.upgradeCost;
}

function renderLobby(state) {
  lobby.classList.toggle("hidden", state.started);
  const modeEntries = Object.entries(state.modes);
  const modeKeys = modeEntries.map(([value]) => value).join("|");
  if (renderedModeKeys !== modeKeys) {
    const options = modeEntries.map(([value, mode]) => {
      const option = document.createElement("option");
      option.value = value;
      const waveCount = mode.waveLimit === null ? "Endless" : `${mode.waveLimit} waves`;
      option.textContent = `${mode.label} — ${waveCount}`;
      return option;
    });
    modeSelect.replaceChildren(...options);
    renderedModeKeys = modeKeys;
  }
  modeSelect.value = state.mode;
  const host = state.hostId === myId;
  modeSelect.disabled = !host || state.started;
  startButton.disabled = !host || state.started || !socket.connected;
  startButton.textContent = state.started
    ? "Run started"
    : host
      ? "Start solo run"
      : "Waiting to start";
  hostHint.textContent = "Choose a mode, train your unit, and defend your base.";
  lobbyDescription.textContent =
    state.modes?.[state.mode]?.description || "Choose a challenge and defend your base.";
}

function renderAbilityButtons(state) {
  const player = state.players.find((entry) => entry.id === myId);
  for (const button of abilityButtons) {
    const ability = button.dataset.ability;
    const cooldown = player?.abilityCooldowns?.[ability] ?? 0;
    const activeDuration = ability === "cashBoost" ? player?.cashBoostRemaining ?? 0 : 0;
    const cooldownLabel = button.querySelector(".ability-cooldown");
    button.disabled = !socket.connected || !state.started || state.gameOver || cooldown > 0;
    button.classList.toggle("selected", targetingAbility === ability);
    if (activeDuration > 0) {
      cooldownLabel.textContent = `ACTIVE ${Math.ceil(activeDuration)}s`;
    } else if (cooldown > 0) {
      cooldownLabel.textContent = `${Math.ceil(cooldown)}s`;
    } else {
      cooldownLabel.textContent = "";
    }
    if (cooldownLabel.textContent) button.disabled = true;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
}

function showGachaScreen() {
  if (!currentState) return;
  gachaScreen.classList.remove("hidden");
  renderGacha(currentState);
}

function hideGachaScreen() {
  if (capsuleBusy) return;
  gachaScreen.classList.add("hidden");
  capsuleResults.classList.add("hidden");
}

function setGachaTab(showCollection) {
  collectionPanel.classList.toggle("hidden", !showCollection);
  bannerTab.classList.toggle("selected", !showCollection);
  collectionTab.classList.toggle("selected", showCollection);
}

function performCapsulePull(amount, currency) {
  if (!socket.connected || capsuleBusy) return;
  capsuleBusy = true;
  gachaScreen.classList.add("capsule-shaking");
  renderGacha(currentState);
  socket.emit("summonCapsules", { amount, currency }, (result) => {
    gachaScreen.classList.remove("capsule-shaking");
    capsuleBusy = false;
    if (!result?.ok) {
      renderGacha(currentState);
      showToast(result?.reason || "The capsule ritual failed.");
      return;
    }

    renderGacha(currentState);
    gachaGems.textContent = String(result.gems);
    gachaTickets.textContent = String(result.tickets);
    legendaryPity.textContent = `${result.pity.legendary} / ${currentState.gacha.pity.legendary}`;
    secretPity.textContent = `${result.pity.secret} / ${currentState.gacha.pity.secret}`;
    const secretPull = result.results.some((entry) => entry.rarity === "Secret");
    resultHeading.textContent = secretPull ? "SPECIAL GRADE FOUND!" : "YOUR PULLS";
    renderCapsuleResults(result.results);
    capsuleResults.classList.toggle("secret", secretPull);
    capsuleResults.classList.remove("hidden");
    if (secretPull) showToast("BLACK FLASH RESONANCE! A Secret unit emerged!");
  });
}

function equipCollectionUnit(type) {
  if (!socket.connected) return;
  socket.emit("equipUnit", type, (result) => {
    showToast(result?.reason || "Could not equip this unit.");
    if (!result?.ok) return;
    selectedTowerType = type;
    selectedDexUnit = type;
    setGachaTab(true);
    if (currentState) {
      renderGacha(currentState);
      renderTowerSelection(currentState);
    }
  });
}

function trainSelectedUnit() {
  if (!socket.connected || !currentState) return;
  socket.emit("upgradeUnit", selectedTowerType, (result) => {
    showToast(result?.reason || "Could not train this unit.");
  });
}

function setTargetingAbility(ability) {
  targetingAbility = ability;
  pointerPosition = undefined;
  for (const button of abilityButtons) {
    button.classList.toggle("selected", button.dataset.ability === ability);
  }
}

function updatePointer(event) {
  pointerPosition = screenToWorld(event.clientX, event.clientY);
}

function useAbility(ability, position) {
  socket.emit("useAbility", { ability, position }, (result) => {
    showToast(result?.reason || "Ability activation failed.");
    if (result?.ok) setTargetingAbility(undefined);
  });
}

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  if (targetingAbility === "airstrike" || towerAbilityTargeting) {
    updatePointer(event);
    return;
  }
  dragState = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    cameraX: camera.x,
    cameraZ: camera.z,
    moved: false,
  };
});

canvas.addEventListener("pointermove", (event) => {
  if (targetingAbility === "airstrike" || towerAbilityTargeting) {
    updatePointer(event);
    return;
  }
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  const dx = event.clientX - dragState.x;
  const dy = event.clientY - dragState.y;
  if (Math.hypot(dx, dy) > 3) dragState.moved = true;
  camera.x = dragState.cameraX - dx / camera.scale;
  camera.z = dragState.cameraZ - dy / camera.scale;
  resizeCanvas();
});

canvas.addEventListener("pointerup", (event) => {
  if (targetingAbility === "airstrike" || towerAbilityTargeting) {
    const position = screenToWorld(event.clientX, event.clientY);
    if (targetingAbility === "airstrike") {
      useAbility("airstrike", position);
    } else if (towerAbilityTargeting) {
      const { towerId, ability } = towerAbilityTargeting;
      socket.emit("useTowerAbility", { towerId, ability, position }, (result) => {
        showToast(result?.reason || "Tower ability failed.");
        if (result?.ok) {
          towerAbilityTargeting = undefined;
          pointerPosition = undefined;
        }
      });
    }
    return;
  }
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  const wasDrag = dragState.moved;
  dragState = undefined;
  if (wasDrag || !currentState) return;
  const position = screenToWorld(event.clientX, event.clientY);
  const selected = [...currentState.towers]
    .reverse()
    .find((tower) => Math.hypot(tower.x - position.x, tower.z - position.z) < 6);
  selectedTowerId = selected?.id;
  renderTowerSelection(currentState);
});

canvas.addEventListener("pointercancel", () => {
  dragState = undefined;
});

canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    const before = screenToWorld(event.clientX, event.clientY);
    camera.zoom = Math.max(0.75, Math.min(2.2, camera.zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1)));
    resizeCanvas();
    const after = screenToWorld(event.clientX, event.clientY);
    camera.x += before.x - after.x;
    camera.z += before.z - after.z;
    resizeCanvas();
  },
  { passive: false },
);

buildButton.addEventListener("click", () => {
  if (buildButton.disabled) return;
  socket.emit("summonUnit", selectedTowerType, (result) => {
    showToast(result?.reason || "Could not summon this unit.");
  });
});

trainButton.addEventListener("click", trainSelectedUnit);
lobbyTrainButton.addEventListener("click", trainSelectedUnit);
openGachaButton.addEventListener("click", showGachaScreen);
closeGachaButton.addEventListener("click", hideGachaScreen);
continueGachaButton.addEventListener("click", () => capsuleResults.classList.add("hidden"));
bannerTab.addEventListener("click", () => setGachaTab(false));
collectionTab.addEventListener("click", () => setGachaTab(true));
ticketPullButton.addEventListener("click", () => performCapsulePull(1, "ticket"));
singlePullButton.addEventListener("click", () => performCapsulePull(1, "gems"));
multiPullButton.addEventListener("click", () => performCapsulePull(11, "gems"));
equipUnitButton.addEventListener("click", () => equipCollectionUnit(selectedDexUnit));

collectionGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dex-unit]");
  if (!button || button.disabled || !currentState) return;
  selectedDexUnit = button.dataset.dexUnit;
  renderGacha(currentState);
});

resultList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-equip-type]");
  if (!button) return;
  const type = button.dataset.equipType;
  capsuleResults.classList.add("hidden");
  equipCollectionUnit(type);
});

lobbyTrainingUnit.addEventListener("change", () => {
  selectedTowerType = lobbyTrainingUnit.value;
  if (currentState) renderTowerSelection(currentState);
});

towerPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tower]");
  if (!button || button.disabled) return;
  selectedTowerType = button.dataset.tower;
  if (currentState) renderTowerSelection(currentState);
});

towerAbilityList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tower-ability]");
  if (!button || button.disabled || !selectedTowerId) return;
  const ability = button.dataset.towerAbility;
  const selected = currentState?.towers.find((tower) => tower.id === selectedTowerId);
  if (!selected) return;
  if (ability === "ultimate") {
    socket.emit("useTowerAbility", { towerId: selectedTowerId, ability }, (result) => {
      showToast(result?.reason || "Tower ability failed.");
    });
    return;
  }
  towerAbilityTargeting = { towerId: selectedTowerId, ability };
  setTargetingAbility(undefined);
  showToast(`Choose a target for ${button.textContent.split(" ")[0]}.`);
});

upgradeButton.addEventListener("click", () => {
  if (upgradeButton.disabled || !selectedTowerId) return;
  socket.emit("upgradeTower", selectedTowerId, (result) => {
    showToast(result?.reason || "Tower upgrade failed.");
  });
});

for (const button of abilityButtons) {
  button.addEventListener("click", () => {
    if (button.disabled) return;
    towerAbilityTargeting = undefined;
    const ability = button.dataset.ability;
    if (ability === "airstrike") {
      const nextAbility = targetingAbility === ability ? undefined : ability;
      setTargetingAbility(nextAbility);
      if (nextAbility) showToast("Click an enemy group to call an airstrike.");
    } else {
      setTargetingAbility(undefined);
      useAbility(ability);
    }
  });
}

modeSelect.addEventListener("change", () => {
  socket.emit("setMode", modeSelect.value, (result) => {
    if (!result?.ok) {
      showToast(result?.reason || "Could not change game mode.");
      if (currentState) modeSelect.value = currentState.mode;
      return;
    }
    showToast(result.reason);
  });
});

startButton.addEventListener("click", () => {
  if (startButton.disabled) return;
  socket.emit("startMatch", (result) => {
    if (!result?.ok) {
      showToast(result?.reason || "Could not start the match.");
      return;
    }
    showToast(result.reason);
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!capsuleResults.classList.contains("hidden")) {
      capsuleResults.classList.add("hidden");
      return;
    }
    if (!gachaScreen.classList.contains("hidden")) {
      hideGachaScreen();
      return;
    }
    if (targetingAbility) setTargetingAbility(undefined);
    towerAbilityTargeting = undefined;
    pointerPosition = undefined;
  }
});

socket.on("connect", () => {
  connectionDot.classList.add("online");
  connectionLabel.textContent = "Ready";
  const requestedName =
    new URLSearchParams(window.location.search).get("name") || `Defender ${Math.floor(100 + Math.random() * 900)}`;
  socket.emit("join", { name: requestedName, profileId: profileIdentity.profileId }, (result) => {
    if (!result?.ok) {
      showToast(result?.reason || "Couldn't join this match.");
      connectionLabel.textContent = "Match full";
      return;
    }
    myId = result.id;
    if (!profileIdentity.persistent) {
      showToast("Browser storage is unavailable; this profile will not persist after closing the tab.");
    }
    if (currentState) renderState(currentState);
  });
});

socket.on("disconnect", () => {
  connectionDot.classList.remove("online");
  connectionLabel.textContent = "Reconnecting";
});

socket.on("connect_error", () => {
  connectionDot.classList.remove("online");
  connectionLabel.textContent = "Game unavailable";
});

socket.on("state", (state) => {
  currentState = state;
  renderState(state);
});

socket.on("gachaAnnouncement", ({ playerName, unitLabel } = {}) => {
  showToast(`${playerName || "A player"} pulled ${unitLabel || "a Secret unit"}!`);
});

socket.on("storageWarning", (message) => {
  showToast(message);
});

replayButton.addEventListener("click", () => window.location.reload());

function animate() {
  drawBoard();
  requestAnimationFrame(animate);
}

buildButton.disabled = true;
animate();
