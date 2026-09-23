import { createTdsTower } from './tds-tower.js';

export const WardenTower = createTdsTower({
  name: 'Warden',
  range: 2.4,
  fireRate: 2,
  dmg: 36,
  cost: 600,
  color: '#a3e635',
  weapon: 'shock',
  bodyScale: 1
});
