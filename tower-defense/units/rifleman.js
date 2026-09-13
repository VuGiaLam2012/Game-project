import { BaseTower } from './base-tower.js';

export class RiflemanTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 3.0 * GRID_SIZE,
      fireRate: 1.4,
      dmg: 22,
      cost: 75,
      color: '#3b82f6',
      skin,
      name: 'Rifleman',
      createBullet
    });
  }

  draw() {
    const palette = {
      classic: { base: this.color, inner: '#dbeafe' },
      neon: { base: '#60a5fa', inner: '#ecfeff' },
      shadow: { base: '#1d4ed8', inner: '#bfdbfe' }
    }[this.skin] || { base: this.color, inner: '#dbeafe' };

    this.drawPalette(palette.base, palette.inner, {
      bodyWidth: this.GRID_SIZE * 0.38,
      bodyHeight: this.GRID_SIZE * 0.25,
      turretWidth: this.GRID_SIZE * 0.30,
      turretHeight: this.GRID_SIZE * 0.20,
      barrelLength: this.GRID_SIZE * 0.42,
      barrelWidth: this.GRID_SIZE * 0.09,
      armor: 0.2
    });
  }
}
