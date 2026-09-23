import { createTdsTower } from './tds-tower.js';

export const FrostBlasterTower = createTdsTower({
  name: 'Frost Blaster',
  range: 2.5,
  fireRate: 1.2,
  dmg: 32,
  cost: 400,
  color: '#38bdf8',
  weapon: 'shock',
  bodyScale: 1
});
