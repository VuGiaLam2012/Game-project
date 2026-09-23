import { createTdsTower } from './tds-tower.js';

export const ExecutionerTower = createTdsTower({
  name: 'Executioner',
  range: 2.8,
  fireRate: 1,
  dmg: 62,
  cost: 700,
  color: '#7c3aed',
  weapon: 'shotgun',
  bodyScale: 1
});
