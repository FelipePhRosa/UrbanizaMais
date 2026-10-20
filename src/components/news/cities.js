export const CITIES = {
  'camaqua-rs': {
    name: 'Camaquã',
    state: 'Rio Grande do Sul',
    color: '#1E7E46',
    coat: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Bras%C3%A3o_de_Camaqu%C3%A3.svg'
  },
  'paraty-rj': {
    name: 'Paraty',
    state: 'Rio de Janeiro',
    color: '#0F6FB5',
    coat: ''
  },
  'ouro-preto-mg': {
    name: 'Ouro Preto',
    state: 'Minas Gerais',
    color: '#7A1F1F',
    coat: ''
  },
};

export function getCity(cityId) {
  return CITIES[cityId];
}