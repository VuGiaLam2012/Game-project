import { BaseEnemy } from './base-enemy.js';

export class TankEnemy extends BaseEnemy {
  constructor(path, ctx, GRID_SIZE, hp = 220, speed = 34, gameState = null) {
    super(path, ctx, GRID_SIZE, {
      type: 'tank',
      name: 'Tank',
      hp,
      speed,
      reward: 18,
      color: '#d97706',
      size: 1.35
    }, gameState);
  }

  draw() {
    this.drawZombie({
      bodyW: this.gridSize * 0.56 * this.size,
      bodyH: this.gridSize * 0.8 * this.size,
      headR: this.gridSize * 0.22 * this.size,
      bodyColor: '#f59e0b',
      accentColor: '#fbbf24',
      legColor: '#7c3c06',
      headColor: '#fde68a',
      eyeColor: '#1f2937',
      shadowColor: 'rgba(0,0,0,0.18)'
    });
  }
}
