import { createTdsTower } from './tds-tower.js';

export const EngineerTower = createTdsTower({
  name: 'Engineer',
  range: 3.2,
  fireRate: 1.5,
  dmg: 34,
  cost: 850,
  color: '#facc15',
  weapon: 'rifle',
  bodyScale: 1
});
