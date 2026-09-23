import { BaseTower } from './base-tower.js';

export class FarmerTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 0,
      fireRate: 0,
      dmg: 0,
      cost: 260,
      color: '#84cc16',
      skin,
      name: 'Farmer',
      createBullet
    });
    this.incomePerTick = 60;
    this.incomeInterval = 5;
    this.incomeTimer = this.incomeInterval;
    this.incomeDue = false;
  }

  update(dt) {
    if (!this.game?.running) {
      this.incomeDue = false;
      this.pulse = Math.max(0, this.pulse - dt * 2.8);
      return;
    }

    this.incomeTimer -= dt;
    if (this.incomeTimer <= 0) {
      this.incomeTimer += this.incomeInterval;
      this.incomeDue = true;
      this.pulse = 1;
    }
    this.pulse = Math.max(0, this.pulse - dt * 2.8);
  }

  upgrade() {
    if (!super.upgrade()) return false;
    this.incomePerTick = Math.round(this.incomePerTick * 1.5);
    return true;
  }

  draw() {
    const palette = {
      classic: { base: this.color, inner: '#ecfccb' },
      neon: { base: '#bef264', inner: '#f7fee7' },
      shadow: { base: '#4d7c0f', inner: '#d9f99d' }
    }[this.skin] || { base: this.color, inner: '#ecfccb' };

    this.drawPalette(palette.base, palette.inner, {
      bodyWidth: this.GRID_SIZE * 0.46,
      bodyHeight: this.GRID_SIZE * 0.3,
      turretWidth: this.GRID_SIZE * 0.24,
      turretHeight: this.GRID_SIZE * 0.16,
      barrelLength: this.GRID_SIZE * 0.18,
      barrelWidth: this.GRID_SIZE * 0.07,
      weapon: 'none',
      style: 'farm',
      armor: 0.22
    });
  }
}