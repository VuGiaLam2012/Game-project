import { BaseEnemy } from './base-enemy.js';

export class BossEnemy extends BaseEnemy {
  constructor(path, ctx, GRID_SIZE, hp = 420, speed = 24, gameState = null) {
    super(path, ctx, GRID_SIZE, {
      type: 'boss',
      name: 'Boss',
      hp,
      speed,
      reward: 40,
      color: '#ef4444',
      size: 1.9
    }, gameState);
    this.stunCooldown = 0;
    this.skillChance = 0.22;
  }

  update(dt) {
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return;
    }

    this.stunCooldown -= dt;
    if (this.stunCooldown <= 0) {
      const roll = Math.random();
      if (roll < this.skillChance) {
        this.tryStunNearbyEnemies();
      }
      this.stunCooldown = 2.2 + Math.random() * 2.8;
    }

    super.update(dt);
  }

  tryStunNearbyEnemies() {
    const enemyList = this.game?.enemies ?? [];
    if (!Array.isArray(enemyList)) return;

    for (const enemy of enemyList) {
      if (enemy === this || enemy.dead) continue;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= 90) {
        enemy.applyStun?.(0.9);
      }
    }
  }

  draw() {
    this.drawZombie({
      bodyW: this.gridSize * 0.7 * this.size,
      bodyH: this.gridSize * 0.9 * this.size,
      headR: this.gridSize * 0.26 * this.size,
      bodyColor: '#ef4444',
      accentColor: '#fca5a5',
      legColor: '#7f1d1d',
      headColor: '#fecaca',
      eyeColor: '#1a1a1a',
      shadowColor: 'rgba(0,0,0,0.2)'
    });

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    this.ctx.fillRect(this.x - 72, this.y - 62, 144, 18);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Boss Zombie', this.x, this.y - 48);
    this.ctx.fillStyle = '#111827';
    this.ctx.fillRect(this.x - 72, this.y - 32, 144, 8);
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(this.x - 72, this.y - 32, 144 * (this.hp / this.maxHp), 8);
    this.ctx.textAlign = 'left';
  }
}
