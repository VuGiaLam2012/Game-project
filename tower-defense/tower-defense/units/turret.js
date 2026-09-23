import { createTdsTower } from './tds-tower.js';

export const TurretTower = createTdsTower({
  name: 'Turret',
  range: 3.5,
  fireRate: 4.2,
  dmg: 24,
  cost: 1000,
  color: '#475569',
  weapon: 'minigun',
  bodyScale: 1.15
});
