import { BaseTower } from './base-tower.js';

export class MedicTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({ col, row, ctx, GRID_SIZE, range: 2.5 * GRID_SIZE, fireRate: 1.1, dmg: 12, cost: 350, color: '#ec4899', skin, name: 'Medic', createBullet });
  }

  draw() {
    const palette = { classic: { base: this.color, inner: '#fce7f3' }, neon: { base: '#f472b6', inner: '#fff1f2' }, shadow: { base: '#be185d', inner: '#fbcfe8' } }[this.skin] || { base: this.color, inner: '#fce7f3' };
    this.drawPalette(palette.base, palette.inner, { bodyWidth: this.GRID_SIZE * 0.42, bodyHeight: this.GRID_SIZE * 0.3, turretWidth: this.GRID_SIZE * 0.32, turretHeight: this.GRID_SIZE * 0.2, barrelLength: this.GRID_SIZE * 0.3, barrelWidth: this.GRID_SIZE * 0.09, armor: 0.25 });
  }
}