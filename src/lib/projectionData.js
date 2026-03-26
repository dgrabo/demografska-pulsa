export const CURRENT_POPULATION = 3870000;

export const SCENARIOS = [
  {
    id: 0,
    name: 'Scenarij 1: Eurostat bazni',
    shortName: 'Eurostat bazni',
    color: '#e24b4a',
    description:
      'Nastavak trenutnih demografskih trendova bez značajnih promjena u politikama. Fertilitet ostaje nizak (oko 1,4), emigracija se nastavlja, a starenje populacije ubrzava. Hrvatska bi do 2050. mogla imati manje od 3,1 milijuna stanovnika.',
    data: [
      { godina: 2021, stanovnistvo: 3870000 },
      { godina: 2030, stanovnistvo: 3600000 },
      { godina: 2040, stanovnistvo: 3250000 },
      { godina: 2050, stanovnistvo: 3100000 },
    ],
  },
  {
    id: 1,
    name: 'Scenarij 2: Rast fertiliteta',
    shortName: 'Rast fertiliteta',
    color: '#ba7517',
    description:
      'Stopa fertiliteta postupno raste na razinu zamjene generacija (2,1 djece po ženi) zahvaljujući snažnim pronatalitetnim mjerama. Pad se usporava, ali se ne zaustavlja u potpunosti jer je starosna struktura već nepovoljno pomaknuta.',
    data: [
      { godina: 2021, stanovnistvo: 3870000 },
      { godina: 2030, stanovnistvo: 3700000 },
      { godina: 2040, stanovnistvo: 3500000 },
      { godina: 2050, stanovnistvo: 3420000 },
    ],
  },
  {
    id: 2,
    name: 'Scenarij 3: Umjerena imigracija',
    shortName: 'Umjerena imigracija',
    color: '#2e86c1',
    description:
      'Uz umjerenu neto imigraciju od +0,5% godišnje (oko 19.000 osoba), Hrvatska ublažava demografski pad. Kombinacija imigracije i blago poboljšanog fertiliteta stabilizira tržište rada, no ukupna populacija i dalje lagano opada.',
    data: [
      { godina: 2021, stanovnistvo: 3870000 },
      { godina: 2030, stanovnistvo: 3680000 },
      { godina: 2040, stanovnistvo: 3520000 },
      { godina: 2050, stanovnistvo: 3450000 },
    ],
  },
  {
    id: 3,
    name: 'Scenarij 4: Snažna imigracija',
    shortName: 'Snažna imigracija',
    color: '#1d9e75',
    description:
      'Najoptimističniji scenarij: snažna imigracija uz istovremeni rast fertiliteta i poboljšanje životnog standarda. Hrvatska privlači radnu snagu iz inozemstva i uspijeva zadržati veći dio domaćeg stanovništva. Pad je najmanji, ali se i dalje nastavlja.',
    data: [
      { godina: 2021, stanovnistvo: 3870000 },
      { godina: 2030, stanovnistvo: 3720000 },
      { godina: 2040, stanovnistvo: 3590000 },
      { godina: 2050, stanovnistvo: 3540000 },
    ],
  },
];

export const KEY_FACTORS = [
  {
    label: 'Fertilitet',
    value: '1,48',
    context: 'djece po ženi (2021.)',
    icon: '👶',
  },
  {
    label: 'Očekivano trajanje života',
    value: '76,0',
    context: 'godina (2021.)',
    icon: '🏥',
  },
  {
    label: 'Neto migracije',
    value: '−15.000',
    context: 'osoba godišnje (prosjek)',
    icon: '✈️',
  },
];
