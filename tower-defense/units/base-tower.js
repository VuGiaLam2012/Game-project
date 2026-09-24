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
    this.range *= 1.1;
    this.fireRate *= 1.08;
    this.dmg = Math.round(this.dmg * 1.22);
    this.upgradeCost = Math.round(this.baseCost * (0.7 + this.level * 0.45));
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
    const weapon = options.weapon ?? 'rifle';
    const style = options.style ?? 'combat';

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

    if (weapon !== 'none') {
      ctx.fillStyle = base;
      if (weapon === 'shotgun') {
        ctx.fillRect(0, -barrelWidth * 0.72, barrelLength, barrelWidth * 0.42);
        ctx.fillRect(0, barrelWidth * 0.3, barrelLength, barrelWidth * 0.42);
      } else if (weapon === 'minigun') {
        for (let barrel = -1; barrel <= 1; barrel++) {
          ctx.fillRect(0, barrel * barrelWidth * 0.72 - barrelWidth * 0.18, barrelLength, barrelWidth * 0.36);
        }
      } else {
        ctx.fillRect(0, -barrelWidth * 0.5, barrelLength, barrelWidth);
      }

      ctx.fillStyle = inner;
      if (weapon === 'laser') {
        ctx.fillRect(0, -barrelWidth * 0.2, barrelLength * 1.15, barrelWidth * 0.4);
        ctx.fillStyle = '#f0fdf4';
        ctx.fillRect(barrelLength * 0.25, -barrelWidth * 0.08, barrelLength * 0.82, barrelWidth * 0.16);
      } else if (weapon === 'shotgun') {
        ctx.fillRect(barrelLength * 0.12, -barrelWidth * 0.58, barrelLength * 0.66, barrelWidth * 0.2);
        ctx.fillRect(barrelLength * 0.12, barrelWidth * 0.44, barrelLength * 0.66, barrelWidth * 0.2);
      } else if (weapon === 'minigun') {
        ctx.fillRect(barrelLength * 0.12, -barrelWidth * 0.12, barrelLength * 0.7, barrelWidth * 0.24);
      } else {
        ctx.fillRect(barrelLength * 0.12, -barrelWidth * 0.28, barrelLength * 0.62, barrelWidth * 0.56);
      }

      if (weapon === 'sniper') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(barrelLength * 0.18, -barrelWidth * 0.92, barrelLength * 0.34, barrelWidth * 0.3);
        ctx.fillStyle = inner;
        ctx.fillRect(barrelLength * 0.24, -barrelWidth * 1.05, barrelLength * 0.2, barrelWidth * 0.12);
      } else if (weapon === 'grenade') {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(barrelLength * 0.9, 0, barrelWidth * 0.72, 0, Math.PI * 2);
        ctx.fill();
      } else if (weapon === 'shock') {
        ctx.strokeStyle = inner;
        ctx.lineWidth = Math.max(2, barrelWidth * 0.18);
        ctx.beginPath();
        ctx.moveTo(barrelLength * 0.65, -barrelWidth * 0.6);
        ctx.lineTo(barrelLength * 0.82, 0);
        ctx.lineTo(barrelLength * 0.65, barrelWidth * 0.6);
        ctx.stroke();
      } else if (weapon === 'syringe') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(barrelLength * 0.75, -barrelWidth * 0.18, barrelLength * 0.3, barrelWidth * 0.36);
        ctx.fillStyle = inner;
        ctx.fillRect(barrelLength * 1.02, -barrelWidth * 0.08, barrelLength * 0.16, barrelWidth * 0.16);
      } else if (weapon === 'pistol') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(barrelLength * 0.72, -barrelWidth * 0.72, barrelLength * 0.2, barrelWidth * 0.24);
      }
    }

    ctx.fillStyle = base;
    ctx.fillRect(-turretWidth * 0.5, -turretHeight * 0.35, turretWidth, turretHeight * 0.7);

    ctx.fillStyle = inner;
    ctx.fillRect(-barrelWidth * 0.1, -barrelWidth * 0.3, barrelWidth * 0.2, barrelWidth * 0.6);

    if (style === 'farm') {
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(-bodyWidth * 0.62, -bodyHeight * 0.9);
      ctx.lineTo(0, -bodyHeight * 1.28);
      ctx.lineTo(bodyWidth * 0.62, -bodyHeight * 0.9);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(-bodyWidth * 0.12, -bodyHeight * 0.28, bodyWidth * 0.24, bodyHeight * 0.58);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-bodyWidth * 0.05, bodyHeight * 0.05, bodyWidth * 0.1, bodyHeight * 0.1);

      ctx.fillStyle = '#bfdbfe';
      ctx.fillRect(-bodyWidth * 0.38, -bodyHeight * 0.42, bodyWidth * 0.2, bodyHeight * 0.2);
      ctx.fillRect(bodyWidth * 0.18, -bodyHeight * 0.42, bodyWidth * 0.2, bodyHeight * 0.2);
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-bodyWidth * 0.28, -bodyHeight * 0.42);
      ctx.lineTo(-bodyWidth * 0.28, -bodyHeight * 0.22);
      ctx.moveTo(bodyWidth * 0.28, -bodyHeight * 0.42);
      ctx.lineTo(bodyWidth * 0.28, -bodyHeight * 0.22);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(bodyWidth * 0.52, -bodyHeight * 0.72, bodyWidth * 0.16, bodyHeight * 0.78);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(bodyWidth * 0.6, -bodyHeight * 0.74, bodyWidth * 0.12, Math.PI, 0);
      ctx.fill();
    }

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
