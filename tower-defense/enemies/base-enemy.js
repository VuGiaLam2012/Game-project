export class BaseEnemy {
  constructor(path, ctx, GRID_SIZE, config = {}, gameState = null) {
    this.path = path;
    this.ctx = ctx;
    this.gridSize = GRID_SIZE;
    this.game = gameState;
    this.type = config.type ?? 'walker';
    this.name = config.name ?? 'Zombie';
    this.hp = config.hp ?? 100;
    this.maxHp = this.hp;
    this.speed = config.speed ?? 55;
    this.reward = config.reward ?? 10;
    this.color = config.color ?? '#8ccf6b';
    this.size = config.size ?? 1;

    this.progress = 0;
    this.x = path[0].x * GRID_SIZE + GRID_SIZE / 2;
    this.y = path[0].y * GRID_SIZE + GRID_SIZE / 2;
    this.prevX = this.x;
    this.prevY = this.y;
    this.dead = false;
    this.walkTime = 0;
    this.bloodParticles = [];
    this.hitFlash = 0;
    this.stunTimer = 0;
  }

  update(dt) {
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      this.prevX = this.x;
      this.prevY = this.y;
      return;
    }

    this.prevX = this.x;
    this.prevY = this.y;
    this.walkTime += dt * (this.speed / 35);
    this.progress += (this.speed * dt) / this.gridSize;
    const index = Math.floor(this.progress);
    const t = this.progress - index;

    if (index >= this.path.length - 1) {
      this.onReachedEnd();
      return;
    }

    const a = this.path[index];
    const b = this.path[index + 1];
    this.x = (a.x + (b.x - a.x) * t) * this.gridSize + this.gridSize / 2;
    this.y = (a.y + (b.y - a.y) * t) * this.gridSize + this.gridSize / 2;
  }

  onReachedEnd() {
    this.dead = true;
    if (this.game) {
      this.game.lives -= 1;
      this.game.syncHud();
    }
  }

  damage(dmg) {
    this.hp -= dmg;
    this.hitFlash = 0.22;
    if (this.hp <= 0) {
      this.dead = true;
      this.spawnBloodBurst();
      if (this.game) {
        this.game.money += this.reward;
        const xpReward = this.type === 'boss' ? 80 : Math.max(8, Math.round(this.reward * 1.5));
        this.game.addXp(xpReward);
        this.game.syncHud();
      }
    }
  }

  spawnBloodBurst() {
    const bloodCount = this.type === 'boss' ? 28 : 12;
    const baseSpeed = this.type === 'boss' ? 80 : 40;

    for (let i = 0; i < bloodCount; i++) {
      const angle = (Math.PI * 2 * i) / bloodCount + Math.random() * 0.8;
      const speed = baseSpeed + Math.random() * (this.type === 'boss' ? 120 : 75);
      this.bloodParticles.push({
        x: this.x,
        y: this.y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: this.type === 'boss' ? 0.8 + Math.random() * 0.6 : 0.5 + Math.random() * 0.4,
        size: this.type === 'boss' ? 4 + Math.random() * 7 : 3 + Math.random() * 4,
        color: i % 2 === 0 ? '#ef4444' : '#b91c1c'
      });
    }
  }

  updateBlood(dt) {
    for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
      const p = this.bloodParticles[i];
      p.life -= dt;
      p.x += p.dx * dt;
      p.y += p.dy * dt;
      p.dy += 100 * dt;
      if (p.life <= 0) {
        this.bloodParticles.splice(i, 1);
      }
    }
  }

  applyStun(duration = 0.6) {
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  drawZombie({
    bodyW,
    bodyH,
    headR,
    bodyColor = this.color,
    accentColor = '#d8f1a6',
    legColor = '#5d7d3b',
    headColor = '#a7d58b',
    eyeColor = '#1e1e1e',
    shadowColor = 'rgba(0,0,0,0.18)'
  } = {}) {
    const dirX = this.x - this.prevX;
    const dirY = this.y - this.prevY;
    const angle = Math.atan2(dirY, dirX);
    const walkSwing = Math.sin(this.walkTime * 8) * (8 + this.size * 8);
    const bodyBob = Math.sin(this.walkTime * 8) * 4 * this.size;
    const armSwing = Math.sin(this.walkTime * 8 + 1.2) * (8 + this.size * 6);
    const legSwing = Math.sin(this.walkTime * 8) * (10 + this.size * 5);

    this.ctx.save();
    this.ctx.translate(this.x, this.y + bodyBob);
    this.ctx.rotate(angle || 0);

    this.ctx.fillStyle = shadowColor;
    this.ctx.beginPath();
    this.ctx.ellipse(0, bodyH * 0.7, bodyW * 0.7, bodyH * 0.22, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = bodyColor;
    this.ctx.lineWidth = 4 * this.size;
    this.ctx.beginPath();
    this.ctx.moveTo(-bodyW * 0.38, -bodyH * 0.02);
    this.ctx.lineTo(-bodyW * 0.38 + armSwing * 0.4, bodyH * 0.34);
    this.ctx.moveTo(bodyW * 0.38, -bodyH * 0.02);
    this.ctx.lineTo(bodyW * 0.38 - armSwing * 0.4, bodyH * 0.34);
    this.ctx.stroke();

    this.ctx.strokeStyle = legColor;
    this.ctx.lineWidth = 5 * this.size;
    this.ctx.beginPath();
    this.ctx.moveTo(-bodyW * 0.2, bodyH * 0.18);
    this.ctx.lineTo(-bodyW * 0.2 + legSwing * 0.5, bodyH * 0.72);
    this.ctx.moveTo(bodyW * 0.2, bodyH * 0.18);
    this.ctx.lineTo(bodyW * 0.2 - legSwing * 0.5, bodyH * 0.72);
    this.ctx.stroke();

    this.ctx.fillStyle = bodyColor;
    this.ctx.fillRect(-bodyW * 0.38, -bodyH * 0.08, bodyW * 0.76, bodyH * 0.7);
    this.ctx.fillStyle = accentColor;
    this.ctx.fillRect(-bodyW * 0.18, -bodyH * 0.02, bodyW * 0.36, bodyH * 0.22);

    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    this.ctx.fillRect(-bodyW * 0.28, -bodyH * 0.02, bodyW * 0.56, 5 * this.size);

    this.ctx.fillStyle = headColor;
    this.ctx.beginPath();
    this.ctx.arc(0 + walkSwing * 0.05, -bodyH * 0.65, headR, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = eyeColor;
    this.ctx.fillRect(-headR * 0.52, -bodyH * 0.7, 5 * this.size, 8 * this.size);
    this.ctx.fillRect(headR * 0.08, -bodyH * 0.7, 5 * this.size, 8 * this.size);
    this.ctx.fillStyle = 'rgba(255,255,255,0.35)';
    this.ctx.fillRect(-headR * 0.25, -bodyH * 0.82, headR * 0.4, headR * 0.2);

    if (this.hitFlash > 0) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.hitFlash})`;
      this.ctx.fillRect(-bodyW * 0.52, -bodyH * 0.85, bodyW * 1.04, bodyH * 1.5);
      this.hitFlash = Math.max(0, this.hitFlash - 0.04);
    }

    this.ctx.restore();

    if (this.type === 'boss') {
      this.ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, 28 + (1 - Math.min(1, this.bloodParticles.length / 30)) * 18, 0, Math.PI * 2);
      this.ctx.fill();
    }

    for (const p of this.bloodParticles) {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * (p.life * 1.5), 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
