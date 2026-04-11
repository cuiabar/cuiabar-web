export type RoleName = 'gerente' | 'operador_marketing';

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  status: string;
  roles: RoleName[];
}

export interface SessionPayload {
  ok: boolean;
  authenticated: boolean;
  user: SessionUser | null;
  csrfToken: string | null;
}

export interface BootstrapStatus {
  ok: boolean;
  requiresBootstrap: boolean;
  tokenConfigured: boolean;
}

export interface DashboardMetrics {
  campaignsSent: number;
  activeContacts: number;
  totalOpens: number;
  openRate: number;
  totalClicks: number;
  ctr: number;
  failures: number;
  unsubscribes: number;
  sentByPeriod: Array<{ day: string; total: number }>;
}

export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  source: string;
  tags: string[];
  status: string;
  optInStatus: string;
  unsubscribedAt: string | null;
  lastSentAt: string | null;
  lastClickedAt: string | null;
  createdAt: string;
  updatedAt: string;
  zoho: {
    externalId: string | null;
    status: 'synced' | 'error' | 'pending' | 'not_configured';
    lastSyncedAt: string | null;
    lastError: string | null;
  };
}

export interface ContactList {
  id: string;
  name: string;
  description: string | null;
  kind: string;
  created_at: string;
  updated_at: string;
  contact_count: number;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  rules: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  html: string;
  text: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  templateId: string;
  segmentId: string | null;
  listId: string | null;
  fromName: string;
  fromEmail: string;
  replyTo: string | null;
  status: string;
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  totalRecipients: number;
  totalSent: number;
  totalFailed: number;
  totalClicked: number;
  totalOpened: number;
  totalUnsubscribed: number;
  totalOpenEvents: number;
  totalUniqueOpens: number;
  totalClickEvents: number;
  totalUniqueClicks: number;
  sendBatchSize: number;
  sendRatePerMinute: number;
  sendPauseMs: number;
  maxRecipients: number;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  actor: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'completed';
export type ReservationMealPeriod = 'lunch' | 'dinner';
export type ReservationGuestCountMode = 'exact' | 'approximate';
export type ReservationDietaryRestrictionType = 'none' | 'lactose' | 'vegan' | 'celiac' | 'other';
export type ReservationSeatingPreference = 'entry' | 'middle' | 'kids_space' | 'stage' | 'no_preference';

export interface ReservationAdminRecord {
  id: string;
  reservationCode: string;
  reservationDate: string;
  reservationTime: string;
  mealPeriod: ReservationMealPeriod;
  customerFullName: string;
  reservedPersonName: string | null;
  guestCount: number;
  guestCountMode: ReservationGuestCountMode;
  hasChildren: boolean;
  dietaryRestrictionType: ReservationDietaryRestrictionType;
  dietaryRestrictionNotes: string | null;
  seatingPreference: ReservationSeatingPreference;
  whatsappNumber: string;
  email: string | null;
  status: ReservationStatus;
  createdAt: string;
}
