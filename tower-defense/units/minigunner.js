import { BaseTower } from './base-tower.js';

export class MinigunnerTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({ col, row, ctx, GRID_SIZE, range: 3.1 * GRID_SIZE, fireRate: 5.2, dmg: 7, cost: 600, color: '#64748b', skin, name: 'Minigunner', createBullet });
  }

  draw() {
    const palette = { classic: { base: this.color, inner: '#e2e8f0' }, neon: { base: '#94a3b8', inner: '#f8fafc' }, shadow: { base: '#334155', inner: '#cbd5e1' } }[this.skin] || { base: this.color, inner: '#e2e8f0' };
    this.drawPalette(palette.base, palette.inner, { bodyWidth: this.GRID_SIZE * 0.5, bodyHeight: this.GRID_SIZE * 0.32, turretWidth: this.GRID_SIZE * 0.45, turretHeight: this.GRID_SIZE * 0.26, barrelLength: this.GRID_SIZE * 0.55, barrelWidth: this.GRID_SIZE * 0.15, weapon: 'minigun', armor: 0.35 });
  }
}