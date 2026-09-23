import { createTdsTower } from './tds-tower.js';

export const ToxicGunnerTower = createTdsTower({
  name: 'Toxic Gunner',
  range: 3.1,
  fireRate: 2,
  dmg: 25,
  cost: 650,
  color: '#84cc16',
  weapon: 'minigun',
  bodyScale: 1
});
