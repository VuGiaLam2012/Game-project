import { BaseTower } from './base-tower.js';

export class RiflemanTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 2.9 * GRID_SIZE,
      fireRate: 1.25,
      dmg: 18,
      cost: 70,
      color: '#3b82f6',
      skin,
      name: 'Hunter',
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
      weapon: 'rifle',
      armor: 0.2
    });
  }
}
