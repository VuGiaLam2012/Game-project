import { BaseTower } from './base-tower.js';

export class CrookBossTower extends BaseTower {
  constructor(col, row, ctx, GRID_SIZE, createBullet, skin = 'classic') {
    super({
      col,
      row,
      ctx,
      GRID_SIZE,
      range: 3.1 * GRID_SIZE,
      fireRate: 0.8,
      dmg: 42,
      cost: 120,
      color: '#ef4444',
      skin,
      name: 'Crook Boss',
      createBullet
    });
    this.summonTimer = 50;
    this.summonInterval = 50;
    this.maxMinions = Infinity;
    this.minionDamage = 16;
    this.baseMinionLife = 25;
    this.minionLife = this.baseMinionLife;
  }

  update(dt, enemies) {
    super.update(dt, enemies);
    this.summonTimer -= dt;

    if (this.summonTimer <= 0 && this.game?.spawnCrook) {
      const activeMinions = this.game.crookMinions.filter((minion) => minion.owner === this && !minion.dead);
      if (this.maxMinions === Infinity || activeMinions.length < this.maxMinions) {
        this.game.spawnCrook(this);
      }
      this.summonTimer = this.getSummonInterval();
    }
  }

  getSummonInterval() {
    if (this.level >= 3) return 20;
    if (this.level >= 2) return 35;
    return 50;
  }

  getMinionLife() {
    return this.baseMinionLife + (Math.max(0, this.level - 1) * 100);
  }

  upgrade() {
    if (!super.upgrade()) return false;
    this.maxMinions += 1;
    this.minionDamage = Math.round(this.minionDamage * 1.3);
    this.minionLife = this.getMinionLife();
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
      weapon: 'rifle',
      armor: 0.34
    });
  }
}
