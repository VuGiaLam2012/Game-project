import { createTdsTower } from './tds-tower.js';

export const MilitaryBaseTower = createTdsTower({
  name: 'Military Base',
  range: 2.5,
  fireRate: 0.8,
  dmg: 30,
  cost: 500,
  color: '#166534',
  weapon: 'none',
  bodyScale: 1.2
});
