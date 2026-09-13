import { BaseTower } from './base-tower.js';

export class SniperTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 5.2 * GRID_SIZE,
      fireRate: 0.48,
      dmg: 82,
      cost: 210,
      color: '#06b6d4',
      skin,
      name: 'Sniper',
      createBullet
    });
  }

  draw() {
    const palette = {
      classic: { base: this.color, inner: '#cffafe' },
      neon: { base: '#22d3ee', inner: '#ecfeff' },
      shadow: { base: '#0e7490', inner: '#a5f3fc' }
    }[this.skin] || { base: this.color, inner: '#cffafe' };

    this.drawPalette(palette.base, palette.inner, {
      bodyWidth: this.GRID_SIZE * 0.32,
      bodyHeight: this.GRID_SIZE * 0.22,
      turretWidth: this.GRID_SIZE * 0.24,
      turretHeight: this.GRID_SIZE * 0.16,
      barrelLength: this.GRID_SIZE * 0.72,
      barrelWidth: this.GRID_SIZE * 0.06,
      armor: 0.15
    });
  }
}