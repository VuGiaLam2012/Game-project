import { createTdsTower } from './tds-tower.js';

export const AcePilotTower = createTdsTower({
  name: 'Ace Pilot',
  range: 3.4,
  fireRate: 2,
  dmg: 18,
  cost: 350,
  color: '#0ea5e9',
  weapon: 'rifle',
  bodyScale: 1
});
