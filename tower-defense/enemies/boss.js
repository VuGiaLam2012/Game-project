import { BaseEnemy } from './base-enemy.js';

export class BossEnemy extends BaseEnemy {
  constructor(path, ctx, GRID_SIZE, hp = 420, speed = 24, gameState = null, bossConfig = {}) {
    super(path, ctx, GRID_SIZE, {
      type: 'boss',
      name: bossConfig.name ?? 'Boss',
      hp,
      speed,
      reward: bossConfig.reward ?? 40,
      color: bossConfig.color ?? '#ef4444',
      size: bossConfig.size ?? 1.9
    }, gameState);
    this.stunCooldown = 0;
    this.skillChance = bossConfig.skillChance ?? 0.22;
    this.bossColor = bossConfig.color ?? '#ef4444';
    this.bossAccent = bossConfig.accent ?? '#fca5a5';
    this.avatar = bossConfig.avatar ?? 'standard';
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
    const avatarStyles = {
      standard: {
        bodyW: 0.7,
        bodyH: 0.9,
        headR: 0.26,
        legColor: '#7f1d1d',
        eyeColor: '#1a1a1a'
      },
      molten: {
        bodyW: 0.76,
        bodyH: 0.94,
        headR: 0.27,
        legColor: '#7c2d12',
        eyeColor: '#fff7ed'
      },
      fallen: {
        bodyW: 0.82,
        bodyH: 0.98,
        headR: 0.29,
        legColor: '#312e81',
        eyeColor: '#fef08a'
      },
      void: {
        bodyW: 0.88,
        bodyH: 1.04,
        headR: 0.31,
        legColor: '#020617',
        eyeColor: '#c4b5fd'
      }
    }[this.avatar] || null;
    const style = avatarStyles || {
      bodyW: 0.7,
      bodyH: 0.9,
      headR: 0.26,
      legColor: '#7f1d1d',
      eyeColor: '#1a1a1a'
    };

    this.drawZombie({
      bodyW: this.gridSize * style.bodyW * this.size,
      bodyH: this.gridSize * style.bodyH * this.size,
      headR: this.gridSize * style.headR * this.size,
      bodyColor: this.bossColor,
      accentColor: this.bossAccent,
      legColor: style.legColor,
      headColor: '#fecaca',
      eyeColor: style.eyeColor,
      shadowColor: 'rgba(0,0,0,0.2)'
    });

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    this.ctx.fillRect(this.x - 72, this.y - 62, 144, 18);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.name, this.x, this.y - 48);
    this.ctx.fillStyle = '#111827';
    this.ctx.fillRect(this.x - 72, this.y - 32, 144, 8);
    this.ctx.fillStyle = this.bossColor;
    this.ctx.fillRect(this.x - 72, this.y - 32, 144 * (this.hp / this.maxHp), 8);
    this.ctx.textAlign = 'left';

    if (this.avatar === 'molten') {
      this.ctx.fillStyle = '#facc15';
      this.ctx.beginPath();
      this.ctx.arc(this.x - 28, this.y - 62, 5, 0, Math.PI * 2);
      this.ctx.arc(this.x + 28, this.y - 58, 4, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.avatar === 'fallen') {
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.beginPath();
      this.ctx.moveTo(this.x - 34, this.y - 72);
      this.ctx.lineTo(this.x - 18, this.y - 94);
      this.ctx.lineTo(this.x, this.y - 78);
      this.ctx.lineTo(this.x + 18, this.y - 94);
      this.ctx.lineTo(this.x + 34, this.y - 72);
      this.ctx.closePath();
      this.ctx.fill();
    } else if (this.avatar === 'void') {
      this.ctx.strokeStyle = '#a78bfa';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y - 26, 48, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }
}
