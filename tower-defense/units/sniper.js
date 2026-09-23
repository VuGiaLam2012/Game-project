import { BaseTower } from './base-tower.js';

export class SniperTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 5.1 * GRID_SIZE,
      fireRate: 0.42,
      dmg: 72,
      cost: 200,
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
      weapon: 'sniper',
      armor: 0.15
    });
  }
}