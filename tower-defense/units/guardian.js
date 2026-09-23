import { BaseTower } from './base-tower.js';

export class GuardianTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 2.0 * GRID_SIZE,
      fireRate: 0.58,
      dmg: 54,
      cost: 175,
      color: '#f43f5e',
      skin,
      name: 'Guardian',
      createBullet
    });
  }

  draw() {
    const palette = {
      classic: { base: this.color, inner: '#ffe4e6' },
      neon: { base: '#fb7185', inner: '#fff1f2' },
      shadow: { base: '#be123c', inner: '#fecdd3' }
    }[this.skin] || { base: this.color, inner: '#ffe4e6' };

    this.drawPalette(palette.base, palette.inner, {
      bodyWidth: this.GRID_SIZE * 0.52,
      bodyHeight: this.GRID_SIZE * 0.34,
      turretWidth: this.GRID_SIZE * 0.46,
      turretHeight: this.GRID_SIZE * 0.26,
      barrelLength: this.GRID_SIZE * 0.34,
      barrelWidth: this.GRID_SIZE * 0.14,
      weapon: 'shotgun',
      armor: 0.4
    });
  }
}