import menuData from './menu.json';
import type { MenuSection } from './types';

export const menuSections = menuData as MenuSection[];

export const menuSectionEmojis: Record<string, string> = {
  'Abertura de Trabalhos': '🍻',
  'Os Queridinhos da Cozinha': '🔥',
  'Fritinhos do Amor': '❤️',
  'Pastéis': '🥟',
  'Lanches': '🍔',
  'Iscas Supremas': '🥩',
  'CERVEJAS 600ml': '🍺',
  REFRESCOS: '🥤',
  "LONG NECK'S 330ML": '🍻',
  ESPECIAL: '⭐',
  'Drinks Clássicos': '🍸',
  Caipirinha: '🍋',
  Chopp: '🍺',
  'Fogão Cuiabano': '🍽️',
  'AMORAO PRIMEIRO QUEIJO': '🧀',
  'Pra quem troca o pão por paixão': '🍝',
  'PRATOS FAMÍLIA': '👨‍👩‍👧‍👦',
  'PRAS CRIANÇAS': '🧒',
  'Saladas Frescas': '🥗',
  Complementos: '➕',
};

export const menuSectionsWithImages = new Set([
  'Fogão Cuiabano',
  'AMORAO PRIMEIRO QUEIJO',
  'Pra quem troca o pão por paixão',
]);
