import { createTdsTower } from './tds-tower.js';

export const WarMachineTower = createTdsTower({
  name: 'War Machine',
  range: 4,
  fireRate: 3,
  dmg: 90,
  cost: 2000,
  color: '#b91c1c',
  weapon: 'minigun',
  bodyScale: 1.25
});
