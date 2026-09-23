import { BaseTower } from './base-tower.js';

export class ShotgunnerTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 1.7 * GRID_SIZE,
      fireRate: 0.72,
      dmg: 28,
      cost: 90,
      color: '#f59e0b',
      skin,
      name: 'Shotgunner',
      createBullet
    });
  }

  draw() {
    const palette = {
      classic: { base: this.color, inner: '#fef3c7' },
      neon: { base: '#fbbf24', inner: '#fef9c3' },
      shadow: { base: '#b45309', inner: '#fcd34d' }
    }[this.skin] || { base: this.color, inner: '#fef3c7' };

    this.drawPalette(palette.base, palette.inner, {
      bodyWidth: this.GRID_SIZE * 0.48,
      bodyHeight: this.GRID_SIZE * 0.28,
      turretWidth: this.GRID_SIZE * 0.42,
      turretHeight: this.GRID_SIZE * 0.24,
      barrelLength: this.GRID_SIZE * 0.34,
      barrelWidth: this.GRID_SIZE * 0.11,
      weapon: 'shotgun',
      armor: 0.28
    });
  }
}
