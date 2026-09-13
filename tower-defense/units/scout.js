import { BaseTower } from './base-tower.js';

export class ScoutTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 2.4 * GRID_SIZE,
      fireRate: 1.8,
      dmg: 14,
      cost: 50,
      color: '#8b5cf6',
      skin,
      name: 'Scout',
      createBullet
    });
  }

  draw() {
    const palette = {
      classic: { base: this.color, inner: '#f5d0fe' },
      neon: { base: '#a78bfa', inner: '#ecfeff' },
      shadow: { base: '#4c1d95', inner: '#d8b4fe' }
    }[this.skin] || { base: this.color, inner: '#f5d0fe' };

    this.drawPalette(palette.base, palette.inner, {
      bodyWidth: this.GRID_SIZE * 0.34,
      bodyHeight: this.GRID_SIZE * 0.22,
      turretWidth: this.GRID_SIZE * 0.24,
      turretHeight: this.GRID_SIZE * 0.16,
      barrelLength: this.GRID_SIZE * 0.27,
      barrelWidth: this.GRID_SIZE * 0.07,
      armor: 0.15
    });
  }
}
