import { createTdsTower } from './tds-tower.js';

export const GladiatorTower = createTdsTower({
  name: 'Gladiator',
  range: 1.7,
  fireRate: 1.8,
  dmg: 42,
  cost: 300,
  color: '#dc2626',
  weapon: 'none',
  bodyScale: 1
});
