import { BossEnemy } from './boss.js';

export class MoltenBossEnemy extends BossEnemy {
  constructor(path, ctx, GRID_SIZE, hp = 420, speed = 24, gameState = null) {
    super(path, ctx, GRID_SIZE, hp, speed, gameState, {
      name: 'Molten Boss',
      color: '#ea580c',
      accent: '#fed7aa',
      avatar: 'molten',
      skillChance: 0.25
    });
  }
}
