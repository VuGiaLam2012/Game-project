import { BossEnemy } from './boss.js';

export class VoidReaverEnemy extends BossEnemy {
  constructor(path, ctx, GRID_SIZE, hp = 420, speed = 24, gameState = null) {
    super(path, ctx, GRID_SIZE, hp, speed, gameState, {
      name: 'Void Reaver',
      color: '#111827',
      accent: '#a78bfa',
      size: 2.25,
      avatar: 'void',
      skillChance: 0.38
    });
  }
}
