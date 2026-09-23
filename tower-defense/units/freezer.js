import { createTdsTower } from './tds-tower.js';

export const FreezerTower = createTdsTower({
  name: 'Freezer',
  range: 2.4,
  fireRate: 0.9,
  dmg: 10,
  cost: 150,
  color: '#67e8f9',
  weapon: 'shock',
  bodyScale: 1
});
