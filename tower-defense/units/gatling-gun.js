import { createTdsTower } from './tds-tower.js';

export const GatlingGunTower = createTdsTower({
  name: 'Gatling Gun',
  range: 3.8,
  fireRate: 6,
  dmg: 30,
  cost: 1200,
  color: '#64748b',
  weapon: 'minigun',
  bodyScale: 1.2
});
