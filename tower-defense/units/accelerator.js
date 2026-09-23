import { BaseTower } from './base-tower.js';

export class AcceleratorTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 4.2 * GRID_SIZE,
      fireRate: 5.2,
      dmg: 10,
      cost: 150,
      color: '#22c55e',
      skin,
      name: 'Accelerator',
      createBullet
    });
    this.isLaser = true;
  }

  draw() {
    const palette = {
      classic: { base: this.color, inner: '#dcfce7' },
      neon: { base: '#4ade80', inner: '#f0fdf4' },
      shadow: { base: '#166534', inner: '#bbf7d0' }
    }[this.skin] || { base: this.color, inner: '#dcfce7' };

    this.drawPalette(palette.base, palette.inner, {
      bodyWidth: this.GRID_SIZE * 0.3,
      bodyHeight: this.GRID_SIZE * 0.22,
      turretWidth: this.GRID_SIZE * 0.28,
      turretHeight: this.GRID_SIZE * 0.18,
      barrelLength: this.GRID_SIZE * 0.58,
      barrelWidth: this.GRID_SIZE * 0.07,
      weapon: 'laser',
      armor: 0.18
    });
  }
}
