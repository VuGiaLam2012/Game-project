import { createTdsTower } from './tds-tower.js';

export const RocketeerTower = createTdsTower({
  name: 'Rocketeer',
  range: 3.2,
  fireRate: 0.7,
  dmg: 48,
  cost: 400,
  color: '#f97316',
  weapon: 'grenade',
  bodyScale: 1.1
});
