import { createTdsTower } from './tds-tower.js';

export const MilitantTower = createTdsTower({
  name: 'Militant',
  range: 3,
  fireRate: 2.4,
  dmg: 16,
  cost: 250,
  color: '#84cc16',
  weapon: 'rifle',
  bodyScale: 1
});
