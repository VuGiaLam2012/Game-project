import { createTdsTower } from './tds-tower.js';

export const PaintballerTower = createTdsTower({
  name: 'Paintballer',
  range: 2.7,
  fireRate: 1.1,
  dmg: 22,
  cost: 125,
  color: '#ec4899',
  weapon: 'rifle',
  bodyScale: 1
});
