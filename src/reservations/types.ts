export type ReservationForType = 'self' | 'other';
export type GuestCountMode = 'exact' | 'approximate';
export type YesNoValue = 'yes' | 'no';
export type DietaryRestrictionType = 'none' | 'lactose' | 'vegan' | 'celiac' | 'other';
export type SeatingPreference = 'entry' | 'middle' | 'kids_space' | 'stage' | 'no_preference';
export type DiscoverySource = 'google' | 'social' | 'referral' | 'already_customer';
export type ReservationTime = '11:00' | '12:00' | '13:00' | '18:00' | '19:00' | '20:00';
export type MealPeriod = 'lunch' | 'dinner';

export interface ReservationAttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_id?: string;
  gclid?: string;
  fbclid?: string;
  wbraid?: string;
  gbraid?: string;
  fbp?: string;
  fbc?: string;
  page_path?: string;
  page_location?: string;
  referrer?: string;
}

export interface ReservationFormValues {
  customerFullName: string;
  reservationForType: ReservationForType;
  reservedPersonName: string;
  guestCount: string;
  guestCountMode: GuestCountMode;
  hasChildren: YesNoValue;
  dietaryRestrictionType: DietaryRestrictionType;
  dietaryRestrictionNotes: string;
  seatingPreference: SeatingPreference;
  whatsappNumber: string;
  email: string;
  reservationTime: ReservationTime | '';
  reservationDate: string;
  isExistingCustomer: YesNoValue;
  discoverySource: DiscoverySource | '';
  notes: string;
}

export interface ReservationSubmissionPayload {
  customerFullName: string;
  reservationForType: ReservationForType;
  reservedPersonName: string | null;
  guestCount: number;
  guestCountMode: GuestCountMode;
  hasChildren: boolean;
  dietaryRestrictionType: DietaryRestrictionType;
  dietaryRestrictionNotes: string | null;
  seatingPreference: SeatingPreference;
  whatsappNumber: string;
  email: string | null;
  reservationTime: ReservationTime;
  reservationDate: string;
  isExistingCustomer: boolean;
  discoverySource: DiscoverySource | null;
  notes: string | null;
  attribution?: ReservationAttributionData | null;
}

export interface ReservationSuccessSummary {
  reservationCode: string;
  reservationDate: string;
  reservationDateLabel: string;
  reservationTime: ReservationTime;
  mealPeriod: MealPeriod;
  guestCount: number;
  guestCountMode: GuestCountMode;
  customerFullName: string;
  reservedPersonName: string | null;
  hasChildren: boolean;
  dietaryRestrictionType: DietaryRestrictionType;
  dietaryRestrictionNotes: string | null;
  seatingPreference: SeatingPreference;
  whatsappNumber: string;
  email: string | null;
  isExistingCustomer: boolean;
  discoverySource: DiscoverySource | null;
  notes: string | null;
  tolerancePolicyText: string;
}

export interface ReservationSubmitResponse {
  ok: true;
  reservation: ReservationSuccessSummary;
}

export type ReservationFormErrors = Partial<Record<keyof ReservationFormValues | 'form', string>>;
