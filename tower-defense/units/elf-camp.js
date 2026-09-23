import { createTdsTower } from './tds-tower.js';

export const ElfCampTower = createTdsTower({
  name: 'Elf Camp',
  range: 2.5,
  fireRate: 1,
  dmg: 30,
  cost: 550,
  color: '#16a34a',
  weapon: 'rifle',
  bodyScale: 1.1
});
