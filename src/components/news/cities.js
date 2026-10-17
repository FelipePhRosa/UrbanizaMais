export const CITIES = {
  'camaqua-rs': {
    name: 'Camaquã',
    state: 'Rio Grande do Sul',
    color: '#1E7E46',
    coatOfArms: '../public/brasoes/camaqua-rs.png',
  },
  'paraty-rj': {
    name: 'Paraty',
    state: 'Rio de Janeiro',
    color: '#0F6FB5',
    coatOfArms: '/brasoes/paraty-rj.svg',
  },
  'ouro-preto-mg': {
    name: 'Ouro Preto',
    state: 'Minas Gerais',
    color: '#7A1F1F',
    coatOfArms: '/brasoes/ouro-preto-mg.svg',
  },
};

export function getCity(cityId) {
  return CITIES[cityId];
}