import { createTdsTower } from './tds-tower.js';

export const CryomancerTower = createTdsTower({
  name: 'Cryomancer',
  range: 3,
  fireRate: 1.3,
  dmg: 46,
  cost: 500,
  color: '#22d3ee',
  weapon: 'laser',
  bodyScale: 1
});
