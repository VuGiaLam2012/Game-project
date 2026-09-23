import { BaseEnemy } from './base-enemy.js';

export class BruteEnemy extends BaseEnemy {
  constructor(path, ctx, GRID_SIZE, hp = 260, speed = 38, gameState = null) {
    super(path, ctx, GRID_SIZE, {
      type: 'brute',
      name: 'Brute',
      hp,
      speed,
      reward: 20,
      color: '#f97316',
      size: 1.5
    }, gameState);
  }

  draw() {
    this.drawZombie({
      bodyW: this.gridSize * 0.62 * this.size,
      bodyH: this.gridSize * 0.86 * this.size,
      headR: this.gridSize * 0.24 * this.size,
      bodyColor: '#f97316',
      accentColor: '#fdba74',
      legColor: '#7c2d12',
      headColor: '#fed7aa',
      eyeColor: '#111827',
      shadowColor: 'rgba(0,0,0,0.2)'
    });
  }
}
