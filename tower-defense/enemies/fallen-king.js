import { BossEnemy } from './boss.js';

export class FallenKingEnemy extends BossEnemy {
  constructor(path, ctx, GRID_SIZE, hp = 420, speed = 24, gameState = null) {
    super(path, ctx, GRID_SIZE, hp, speed, gameState, {
      name: 'Fallen King',
      color: '#7c3aed',
      accent: '#ddd6fe',
      size: 2.1,
      avatar: 'fallen',
      skillChance: 0.3
    });
  }
}
