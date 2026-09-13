export class BaseTower {
  constructor({
    col,
    row,
    ctx,
    GRID_SIZE,
    range,
    fireRate,
    dmg,
    cost,
    color,
    skin,
    name,
    createBullet
  }) {
    this.col = col;
    this.row = row;
    this.ctx = ctx;
    this.GRID_SIZE = GRID_SIZE;
    this.x = col * GRID_SIZE + GRID_SIZE / 2;
    this.y = row * GRID_SIZE + GRID_SIZE / 2;
    this.range = range;
    this.fireRate = fireRate;
    this.cool = 0;
    this.dmg = dmg;
    this.cost = cost;
    this.baseCost = cost;
    this.color = color;
    this.name = name;
    this.skin = skin;
    this.createBullet = createBullet;
    this.level = 1;
    this.maxLevel = 3;
    this.upgradeCost = Math.round(cost * 0.75);
    this.flash = 0;
    this.pulse = 0;
    this.angle = 0;
  }

  findTarget(enemies) {
    let target = null;
    let dmin = Infinity;

    for (const enemy of enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= this.range && distance < dmin) {
        dmin = distance;
        target = enemy;
      }
    }

    return target;
  }

  update(dt, enemies) {
    this.cool -= dt;
    this.flash = Math.max(0, this.flash - dt * 2.4);
    this.pulse = Math.max(0, this.pulse - dt * 2.8);

    const target = this.findTarget(enemies);
    if (target) {
      const desiredAngle = Math.atan2(target.y - this.y, target.x - this.x);
      const delta = Math.atan2(
        Math.sin(desiredAngle - this.angle),
        Math.cos(desiredAngle - this.angle)
      );

      this.angle += delta * Math.min(1, dt * 12);

      if (this.cool <= 0) {
        this.cool = 1 / this.fireRate;
        this.flash = 0.36;
        this.pulse = 1;
        this.createBullet(this.x, this.y, target, this.dmg, this.color);
      }
    }
  }

  upgrade() {
    if (this.level >= this.maxLevel) return false;

    this.level += 1;
    this.range *= 1.15;
    this.fireRate *= 1.12;
    this.dmg = Math.round(this.dmg * 1.28);
    this.upgradeCost = Math.round(this.baseCost * (0.8 + this.level * 0.7));
    return true;
  }

  drawPalette(base, inner, options = {}) {
    const { ctx, col, row, GRID_SIZE } = this;
    const glowAlpha = Math.min(1, this.flash / 0.36);
    const cx = col * GRID_SIZE + GRID_SIZE / 2;
    const cy = row * GRID_SIZE + GRID_SIZE / 2;
    const radius = GRID_SIZE * 0.22;
    const barrelLength = options.barrelLength ?? GRID_SIZE * 0.42;
    const barrelWidth = options.barrelWidth ?? GRID_SIZE * 0.12;
    const turretWidth = options.turretWidth ?? GRID_SIZE * 0.42;
    const turretHeight = options.turretHeight ?? GRID_SIZE * 0.34;
    const bodyWidth = options.bodyWidth ?? GRID_SIZE * 0.42;
    const bodyHeight = options.bodyHeight ?? GRID_SIZE * 0.28;
    const armor = options.armor ?? 0.22;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + GRID_SIZE * 0.18, radius * 1.5, radius * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.28 + glowAlpha * 0.42})`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2.3 + glowAlpha * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle || 0);

    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.roundRect(-bodyWidth * 0.55, -bodyHeight * 0.9, bodyWidth * 1.1, bodyHeight * 1.2, 8);
    ctx.fill();

    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.roundRect(-bodyWidth * 0.28, -bodyHeight * 0.55, bodyWidth * 0.56, bodyHeight * 0.9, 7);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.72)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-bodyWidth * 0.38, -bodyHeight * 0.7, bodyWidth * 0.76, bodyHeight * 0.9, 6);
    ctx.stroke();

    ctx.fillStyle = base;
    ctx.fillRect(-barrelWidth * 0.62, -barrelLength * 0.9, barrelWidth * 1.24, barrelLength * 0.82);

    ctx.fillStyle = inner;
    ctx.fillRect(-barrelWidth * 0.36, -barrelLength * 0.65, barrelWidth * 0.72, barrelLength * 0.7);

    ctx.fillStyle = base;
    ctx.fillRect(-turretWidth * 0.38, -turretHeight * 0.9, turretWidth * 0.76, turretHeight * 0.9);

    ctx.fillStyle = inner;
    ctx.fillRect(-barrelWidth * 0.26, -barrelLength * 0.28, barrelWidth * 0.52, barrelLength * 0.18);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(-bodyWidth * 0.18, -bodyHeight * 1.0, bodyWidth * 0.36, bodyHeight * 0.16);

    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.28, -bodyHeight * 0.18);
    ctx.lineTo(bodyWidth * 0.28, -bodyHeight * 0.18);
    ctx.moveTo(-bodyWidth * 0.18, bodyHeight * 0.2);
    ctx.lineTo(bodyWidth * 0.18, bodyHeight * 0.2);
    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.68, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    if (this.level > 1) {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Lv${this.level}`, cx, row * GRID_SIZE + GRID_SIZE - 8);
      ctx.textAlign = 'left';
    }
  }
}
