import { BaseTower } from './base-tower.js';

export class DemomanTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({ col, row, ctx, GRID_SIZE, range: 2.5 * GRID_SIZE, fireRate: 0.68, dmg: 50, cost: 390, color: '#f97316', skin, name: 'Demoman', createBullet });
  }

  draw() {
    const palette = { classic: { base: this.color, inner: '#ffedd5' }, neon: { base: '#fb923c', inner: '#fff7ed' }, shadow: { base: '#c2410c', inner: '#fed7aa' } }[this.skin] || { base: this.color, inner: '#ffedd5' };
    this.drawPalette(palette.base, palette.inner, { bodyWidth: this.GRID_SIZE * 0.5, bodyHeight: this.GRID_SIZE * 0.32, turretWidth: this.GRID_SIZE * 0.48, turretHeight: this.GRID_SIZE * 0.28, barrelLength: this.GRID_SIZE * 0.4, barrelWidth: this.GRID_SIZE * 0.16, weapon: 'grenade', armor: 0.3 });
  }
}