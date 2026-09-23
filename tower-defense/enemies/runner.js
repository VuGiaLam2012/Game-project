import { BaseEnemy } from './base-enemy.js';

export class RunnerEnemy extends BaseEnemy {
  constructor(path, ctx, GRID_SIZE, hp = 80, speed = 66, gameState = null) {
    super(path, ctx, GRID_SIZE, {
      type: 'runner',
      name: 'Runner',
      hp,
      speed,
      reward: 12,
      color: '#66d9a6',
      size: 0.8
    }, gameState);
  }

  draw() {
    this.drawZombie({
      bodyW: this.gridSize * 0.46 * this.size,
      bodyH: this.gridSize * 0.62 * this.size,
      headR: this.gridSize * 0.18 * this.size,
      bodyColor: '#56d79d',
      accentColor: '#1dbf8a',
      legColor: '#1a7a63',
      headColor: '#ccf8df',
      eyeColor: '#0f172a',
      shadowColor: 'rgba(0,0,0,0.16)'
    });
  }
}
