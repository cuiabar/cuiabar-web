import {
  DIETARY_RESTRICTION_LABELS,
  DISCOVERY_SOURCE_LABELS,
  FULL_TOLERANCE_POLICY,
  GUEST_COUNT_MODE_LABELS,
  LARGE_PARTY_TOLERANCE_POLICY,
  MEAL_PERIOD_LABELS,
  RESERVATION_STORAGE_PREFIX,
  RESERVATION_TIME_OPTIONS,
  RESERVATION_TIMEZONE,
  SEATING_PREFERENCE_LABELS,
  STANDARD_TOLERANCE_POLICY,
} from './constants';
import type {
  DietaryRestrictionType,
  DiscoverySource,
  MealPeriod,
  ReservationFormErrors,
  ReservationFormValues,
  ReservationSubmissionPayload,
  ReservationSuccessSummary,
  ReservationTime,
  SeatingPreference,
} from './types';

export const initialReservationValues: ReservationFormValues = {
  customerFullName: '',
  reservationForType: 'self',
  reservedPersonName: '',
  guestCount: '',
  guestCountMode: 'exact',
  hasChildren: 'no',
  dietaryRestrictionType: 'none',
  dietaryRestrictionNotes: '',
  seatingPreference: 'no_preference',
  whatsappNumber: '',
  email: '',
  reservationTime: '',
  reservationDate: '',
  isExistingCustomer: 'yes',
  discoverySource: '',
  notes: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeSingleLine = (value: string, maxLength = 160) =>
  value
    .replace(/\s+/g, ' ')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);

const sanitizeMultiline = (value: string, maxLength = 600) =>
  value
    .replace(/\r/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);

const buildCurrentDateParts = () => {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: RESERVATION_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const timeParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: RESERVATION_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const read = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value ?? '';

  return {
    date: `${read(dateParts, 'year')}-${read(dateParts, 'month')}-${read(dateParts, 'day')}`,
    time: `${read(timeParts, 'hour')}:${read(timeParts, 'minute')}`,
  };
};

export const formatWhatsappInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  const localDigits = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;

  if (localDigits.length <= 2) {
    return localDigits ? `(${localDigits}` : '';
  }

  if (localDigits.length <= 7) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2)}`;
  }

  if (localDigits.length <= 11) {
    const middle = localDigits.length === 11 ? 7 : 6;
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, middle)}-${localDigits.slice(middle)}`;
  }

  return `+${digits}`;
};

export const formatReservationDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    timeZone: RESERVATION_TIMEZONE,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00-03:00`));

export const getMealPeriodFromTime = (reservationTime: ReservationTime): MealPeriod =>
  RESERVATION_TIME_OPTIONS.find((option) => option.value === reservationTime)?.mealPeriod ?? 'lunch';

export const getTolerancePolicyForGuestCount = (guestCount: number) =>
  guestCount > 10 ? LARGE_PARTY_TOLERANCE_POLICY : STANDARD_TOLERANCE_POLICY;

export const reservationSummaryStorageKey = (reservationCode: string) => `${RESERVATION_STORAGE_PREFIX}${reservationCode}`;
export const reservationSuccessTrackingStorageKey = (reservationCode: string) => `${RESERVATION_STORAGE_PREFIX}tracked:${reservationCode}`;

export const storeReservationSummary = (summary: ReservationSuccessSummary) => {
  window.sessionStorage.setItem(reservationSummaryStorageKey(summary.reservationCode), JSON.stringify(summary));
};

export const readStoredReservationSummary = (reservationCode: string) => {
  const raw = window.sessionStorage.getItem(reservationSummaryStorageKey(reservationCode));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ReservationSuccessSummary;
  } catch {
    return null;
  }
};

export const hasTrackedReservationSuccess = (reservationCode: string) =>
  window.sessionStorage.getItem(reservationSuccessTrackingStorageKey(reservationCode)) === '1';

export const markReservationSuccessTracked = (reservationCode: string) => {
  window.sessionStorage.setItem(reservationSuccessTrackingStorageKey(reservationCode), '1');
};

export const normalizeGuestCount = (value: string) => value.replace(/\D/g, '').slice(0, 2);

const normalizeWhatsappForPayload = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    return `+${digits}`;
  }
  return '';
};

const isFullName = (value: string) => value.split(' ').filter(Boolean).length >= 2;

export const validateReservationForm = (values: ReservationFormValues): ReservationFormErrors => {
  const errors: ReservationFormErrors = {};
  const customerFullName = sanitizeSingleLine(values.customerFullName);
  const reservedPersonName = sanitizeSingleLine(values.reservedPersonName);
  const guestCount = Number.parseInt(values.guestCount, 10);
  const email = values.email.trim();
  const current = buildCurrentDateParts();

  if (!customerFullName || !isFullName(customerFullName)) {
    errors.customerFullName = 'Informe nome e sobrenome.';
  }

  if (values.reservationForType === 'other' && reservedPersonName.length < 3) {
    errors.reservedPersonName = 'Informe o nome principal da reserva.';
  }

  if (!values.guestCount) {
    errors.guestCount = 'Informe a quantidade de pessoas.';
  } else if (!Number.isFinite(guestCount) || guestCount <= 0) {
    errors.guestCount = 'Use um numero valido.';
  }

  if (!values.reservationDate) {
    errors.reservationDate = 'Escolha a data da reserva.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.reservationDate)) {
    errors.reservationDate = 'Use uma data valida.';
  } else if (values.reservationDate < current.date) {
    errors.reservationDate = 'Escolha hoje ou uma data futura.';
  }

  if (!values.reservationTime) {
    errors.reservationTime = 'Escolha um horario disponivel.';
  } else if (!RESERVATION_TIME_OPTIONS.some((option) => option.value === values.reservationTime)) {
    errors.reservationTime = 'Horario fora da lista permitida.';
  } else if (values.reservationDate === current.date && values.reservationTime < current.time) {
    errors.reservationTime = 'Esse horario ja passou. Escolha outro horario.';
  }

  if (!normalizeWhatsappForPayload(values.whatsappNumber)) {
    errors.whatsappNumber = 'Informe um WhatsApp valido com DDD.';
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errors.email = 'Use um e-mail valido.';
  }

  if (values.dietaryRestrictionType === 'other' && sanitizeSingleLine(values.dietaryRestrictionNotes, 180).length < 3) {
    errors.dietaryRestrictionNotes = 'Descreva a restricao alimentar.';
  }

  if (!values.seatingPreference) {
    errors.seatingPreference = 'Escolha a preferencia de lugar.';
  }

  if (values.isExistingCustomer === 'no' && !values.discoverySource) {
    errors.discoverySource = 'Conte para a gente como conheceu o restaurante.';
  }

  return errors;
};

export const buildReservationPayload = (values: ReservationFormValues): ReservationSubmissionPayload => ({
  customerFullName: sanitizeSingleLine(values.customerFullName),
  reservationForType: values.reservationForType,
  reservedPersonName: values.reservationForType === 'other' ? sanitizeSingleLine(values.reservedPersonName) : null,
  guestCount: Number.parseInt(values.guestCount, 10),
  guestCountMode: values.guestCountMode,
  hasChildren: values.hasChildren === 'yes',
  dietaryRestrictionType: values.dietaryRestrictionType,
  dietaryRestrictionNotes: values.dietaryRestrictionType === 'other' ? sanitizeSingleLine(values.dietaryRestrictionNotes, 180) : null,
  seatingPreference: values.seatingPreference,
  whatsappNumber: normalizeWhatsappForPayload(values.whatsappNumber),
  email: values.email.trim() ? values.email.trim().toLowerCase() : null,
  reservationTime: values.reservationTime as ReservationTime,
  reservationDate: values.reservationDate,
  isExistingCustomer: values.isExistingCustomer === 'yes',
  discoverySource: values.isExistingCustomer === 'no' ? (values.discoverySource as DiscoverySource) : null,
  notes: values.notes.trim() ? sanitizeMultiline(values.notes) : null,
});

export const describeGuestCount = (guestCount: number, guestCountMode: 'exact' | 'approximate') =>
  guestCountMode === 'approximate' ? `Aproximadamente ${guestCount} pessoas` : `${guestCount} pessoas`;

export const describeDietaryRestriction = (type: DietaryRestrictionType, notes: string | null) => {
  if (type === 'other' && notes) {
    return `Outras (${notes})`;
  }
  return DIETARY_RESTRICTION_LABELS[type];
};

export const describeSeatingPreference = (value: SeatingPreference) => SEATING_PREFERENCE_LABELS[value];

export const describeDiscoverySource = (value: DiscoverySource | null) => (value ? DISCOVERY_SOURCE_LABELS[value] : 'Nao informado');

export const describeMealPeriod = (value: MealPeriod) => MEAL_PERIOD_LABELS[value];

export const describeGuestMode = (value: 'exact' | 'approximate') => GUEST_COUNT_MODE_LABELS[value];

export const describeTolerancePolicy = (guestCount: number) =>
  guestCount > 10 ? FULL_TOLERANCE_POLICY : STANDARD_TOLERANCE_POLICY;
