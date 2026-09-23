import { createTdsTower } from './tds-tower.js';

export const JesterTower = createTdsTower({
  name: 'Jester',
  range: 2.8,
  fireRate: 1.6,
  dmg: 38,
  cost: 500,
  color: '#e879f9',
  weapon: 'shock',
  bodyScale: 1
});
