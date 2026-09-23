import { createTdsTower } from './tds-tower.js';

export const SoldierTower = createTdsTower({
  name: 'Soldier',
  range: 3,
  fireRate: 1.5,
  dmg: 13,
  cost: 100,
  color: '#475569',
  weapon: 'rifle',
  bodyScale: 1
});
