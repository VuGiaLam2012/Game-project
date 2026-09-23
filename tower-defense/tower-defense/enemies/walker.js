import { BaseEnemy } from './base-enemy.js';

export class WalkerEnemy extends BaseEnemy {
  constructor(path, ctx, GRID_SIZE, hp = 100, speed = 42, gameState = null) {
    super(path, ctx, GRID_SIZE, {
      type: 'walker',
      name: 'Walker',
      hp,
      speed,
      reward: 10,
      color: '#8ccf6b',
      size: 1
    }, gameState);
  }

  draw() {
    this.drawZombie({
      bodyW: this.gridSize * 0.48 * this.size,
      bodyH: this.gridSize * 0.68 * this.size,
      headR: this.gridSize * 0.2 * this.size,
      bodyColor: '#7ecb5b',
      accentColor: '#5cae4c',
      legColor: '#4b7d34',
      headColor: '#c4f4a3',
      eyeColor: '#1a1a1a',
      shadowColor: 'rgba(0,0,0,0.18)'
    });
  }
}
