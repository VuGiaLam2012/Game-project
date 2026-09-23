import { createTdsTower } from './tds-tower.js';

export const SledgerTower = createTdsTower({
  name: 'Sledger',
  range: 1.8,
  fireRate: 0.8,
  dmg: 70,
  cost: 500,
  color: '#94a3b8',
  weapon: 'shotgun',
  bodyScale: 1.1
});
