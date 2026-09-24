import { createTdsTower } from './tds-tower.js';

export const PursuitTower = createTdsTower({
  name: 'Pursuit',
  range: 4,
  fireRate: 2.4,
  dmg: 28,
  cost: 700,
  color: '#0284c7',
  weapon: 'missile',
  bodyScale: 1
});
