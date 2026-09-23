import { createTdsTower } from './tds-tower.js';

export const NecromancerTower = createTdsTower({
  name: 'Necromancer',
  range: 3.2,
  fireRate: 1.1,
  dmg: 55,
  cost: 900,
  color: '#9333ea',
  weapon: 'laser',
  bodyScale: 1
});
