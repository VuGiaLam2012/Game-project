import { BaseTower } from './base-tower.js';

export function createTdsTower(config) {
  return class TdsTower extends BaseTower {
    constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
      super({
        col,
        row,
        ctx,
        GRID_SIZE,
        range: config.range * GRID_SIZE,
        fireRate: config.fireRate,
        dmg: config.dmg,
        cost: config.cost,
        color: config.color,
        skin,
        name: config.name,
        createBullet
      });
      this.isLaser = config.weapon === 'laser';
      this.weapon = config.weapon || 'rifle';
      this.bodyScale = config.bodyScale || 1;
    }

    draw() {
      const palettes = {
        classic: { base: this.color, inner: '#f8fafc' },
        neon: { base: '#38bdf8', inner: '#ecfeff' },
        shadow: { base: '#334155', inner: '#cbd5e1' },
        golden: { base: '#d4a017', inner: '#fff4a3' }
      };
      const palette = palettes[this.skin] || palettes.classic;
      const scale = this.bodyScale;

      this.drawPalette(palette.base, palette.inner, {
        bodyWidth: this.GRID_SIZE * 0.4 * scale,
        bodyHeight: this.GRID_SIZE * 0.27 * scale,
        turretWidth: this.GRID_SIZE * 0.32 * scale,
        turretHeight: this.GRID_SIZE * 0.21 * scale,
        barrelLength: this.GRID_SIZE * 0.5 * scale,
        barrelWidth: this.GRID_SIZE * 0.09 * scale,
        weapon: this.weapon,
        armor: 0.2
      });
    }
  };
}
