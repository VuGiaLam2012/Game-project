import { BaseTower } from './base-tower.js';

export class TeslaTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 2.5 * GRID_SIZE,
      fireRate: 3.0,
      dmg: 8,
      cost: 220,
      color: '#eab308',
      skin,
      name: 'Tesla',
      createBullet
    });
  }

  draw() {
    const palette = {
      classic: { base: this.color, inner: '#fef9c3' },
      neon: { base: '#fde047', inner: '#fffff0' },
      shadow: { base: '#a16207', inner: '#fef08a' }
    }[this.skin] || { base: this.color, inner: '#fef9c3' };

    this.drawPalette(palette.base, palette.inner, {
      bodyWidth: this.GRID_SIZE * 0.4,
      bodyHeight: this.GRID_SIZE * 0.3,
      turretWidth: this.GRID_SIZE * 0.34,
      turretHeight: this.GRID_SIZE * 0.22,
      barrelLength: this.GRID_SIZE * 0.48,
      barrelWidth: this.GRID_SIZE * 0.1,
      weapon: 'shock',
      armor: 0.24
    });
  }
}