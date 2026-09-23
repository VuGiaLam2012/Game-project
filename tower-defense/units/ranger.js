import { createTdsTower } from './tds-tower.js';

export const RangerTower = createTdsTower({
  name: 'Ranger',
  range: 5,
  fireRate: 0.5,
  dmg: 110,
  cost: 800,
  color: '#0f766e',
  weapon: 'sniper',
  bodyScale: 1.1
});
