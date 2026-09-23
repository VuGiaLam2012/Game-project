import { createTdsTower } from './tds-tower.js';

export const CommanderTower = createTdsTower({
  name: 'Commander',
  range: 3.5,
  fireRate: 1.2,
  dmg: 18,
  cost: 350,
  color: '#1d4ed8',
  weapon: 'rifle',
  bodyScale: 1
});
