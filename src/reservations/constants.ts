import type { DietaryRestrictionType, DiscoverySource, GuestCountMode, MealPeriod, ReservationTime, SeatingPreference } from './types';

export const RESERVATION_HOSTNAME = 'reservas.cuiabar.com';
export const RESERVATION_TIMEZONE = 'America/Sao_Paulo';
export const RESERVATION_STORAGE_PREFIX = 'cuiabar-reservation:';
export const RESERVATION_ANALYTICS_CONTENT_NAME = 'reservas_portal';

export const RESERVATION_TIME_OPTIONS: Array<{ value: ReservationTime; label: string; mealPeriod: MealPeriod }> = [
  { value: '11:00', label: '11h', mealPeriod: 'lunch' },
  { value: '12:00', label: '12h', mealPeriod: 'lunch' },
  { value: '13:00', label: '13h', mealPeriod: 'lunch' },
  { value: '18:00', label: '18h', mealPeriod: 'dinner' },
  { value: '19:00', label: '19h', mealPeriod: 'dinner' },
  { value: '20:00', label: '20h', mealPeriod: 'dinner' },
];

export const GUEST_COUNT_SUGGESTIONS = [2, 4, 6, 8, 10, 12];

export const GUEST_COUNT_MODE_LABELS: Record<GuestCountMode, string> = {
  exact: 'Numero exato',
  approximate: 'Aproximadamente',
};

export const DIETARY_RESTRICTION_LABELS: Record<DietaryRestrictionType, string> = {
  none: 'Nenhuma',
  lactose: 'Lactose',
  vegan: 'Vegano',
  celiac: 'Celiaco',
  other: 'Outras',
};

export const SEATING_PREFERENCE_LABELS: Record<SeatingPreference, string> = {
  entry: 'Entrada',
  middle: 'Meio',
  kids_space: 'Perto do espaco kids',
  stage: 'Perto do palco',
  no_preference: 'Sem preferencia',
};

export const DISCOVERY_SOURCE_LABELS: Record<DiscoverySource, string> = {
  google: 'Google',
  social: 'Facebook/Instagram',
  referral: 'Indicacao',
  already_customer: 'Ja era cliente',
};

export const MEAL_PERIOD_LABELS: Record<MealPeriod, string> = {
  lunch: 'Almoco',
  dinner: 'Jantar',
};

export const STANDARD_TOLERANCE_POLICY =
  'Reservas possuem tolerancia de 10 minutos. Apos o horario combinado, a mesa podera ser desmontada e liberada por ordem de chegada.';

export const LARGE_PARTY_TOLERANCE_POLICY =
  'Para grupos acima de 10 pessoas nao ha tolerancia. Apos o horario combinado, a mesa podera ser desmontada e liberada por ordem de chegada.';

export const FULL_TOLERANCE_POLICY =
  'Reservas possuem tolerancia de 10 minutos. Para grupos acima de 10 pessoas, nao ha tolerancia. Apos o horario combinado, a mesa podera ser desmontada e liberada por ordem de chegada.';
