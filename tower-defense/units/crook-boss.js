import { BaseTower } from './base-tower.js';

export class CrookBossTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 3.3 * GRID_SIZE,
      fireRate: 0.7,
      dmg: 48,
      cost: 130,
      color: '#ef4444',
      skin,
      name: 'Crook Boss',
      createBullet
    });
    this.summonTimer = 6;
    this.summonInterval = 9;
    this.maxMinions = 2;
    this.minionDamage = 16;
  }

  update(dt, enemies) {
    super.update(dt, enemies);
    this.summonTimer -= dt;

    if (this.summonTimer <= 0 && this.game?.spawnCrook) {
      const activeMinions = this.game.crookMinions.filter((minion) => minion.owner === this && !minion.dead);
      if (activeMinions.length < this.maxMinions) {
        this.game.spawnCrook(this);
        this.summonTimer = this.summonInterval;
      } else {
        this.summonTimer = 0.5;
      }
    }
  }

  upgrade() {
    if (!super.upgrade()) return false;
    this.maxMinions += 1;
    this.minionDamage = Math.round(this.minionDamage * 1.3);
    this.summonInterval = Math.max(5, this.summonInterval - 1);
    return true;
  }

  draw() {
    const palette = {
      classic: { base: this.color, inner: '#fecaca' },
      neon: { base: '#f87171', inner: '#fee2e2' },
      shadow: { base: '#7f1d1d', inner: '#fecaca' }
    }[this.skin] || { base: this.color, inner: '#fecaca' };

    this.drawPalette(palette.base, palette.inner, {
      bodyWidth: this.GRID_SIZE * 0.52,
      bodyHeight: this.GRID_SIZE * 0.34,
      turretWidth: this.GRID_SIZE * 0.46,
      turretHeight: this.GRID_SIZE * 0.28,
      barrelLength: this.GRID_SIZE * 0.52,
      barrelWidth: this.GRID_SIZE * 0.12,
      armor: 0.34
    });
  }
}
