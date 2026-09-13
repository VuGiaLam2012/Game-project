import { BaseTower } from './base-tower.js';

export class ElectroshockerTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({ col, row, ctx, GRID_SIZE, range: 2.3 * GRID_SIZE, fireRate: 2.8, dmg: 18, cost: 520, color: '#a855f7', skin, name: 'Electroshocker', createBullet });
  }

  draw() {
    const palette = { classic: { base: this.color, inner: '#f3e8ff' }, neon: { base: '#c084fc', inner: '#faf5ff' }, shadow: { base: '#7e22ce', inner: '#e9d5ff' } }[this.skin] || { base: this.color, inner: '#f3e8ff' };
    this.drawPalette(palette.base, palette.inner, { bodyWidth: this.GRID_SIZE * 0.38, bodyHeight: this.GRID_SIZE * 0.28, turretWidth: this.GRID_SIZE * 0.34, turretHeight: this.GRID_SIZE * 0.22, barrelLength: this.GRID_SIZE * 0.5, barrelWidth: this.GRID_SIZE * 0.1, armor: 0.22 });
  }
}