import type { Hono } from 'hono';
import { csvResponse, HttpError, requireJsonBody } from '../lib/http';
import type { AppVariables, Env } from '../types';
import { RESERVATION_STATUSES } from './constants';
import { changeReservationStatus, createReservation, listReservations } from './service';
import type { ReservationListFilters, ReservationRequestPayload, ReservationStatus } from './types';

type ReservationApp = Hono<{ Bindings: Env; Variables: AppVariables }>;

const isAllowedLocalOrigin = (origin: string | null) => Boolean(origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin));

const setCorsHeaders = (app: ReservationApp) => {
  app.use('/api/reservations*', async (c, next) => {
    const origin = c.req.header('origin') ?? null;
    if (isAllowedLocalOrigin(origin)) {
      c.header('Access-Control-Allow-Origin', origin!);
      c.header('Vary', 'Origin');
      c.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
      c.header('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }

    await next();
  });
};

const requireAuthenticatedUser = (appContext: { get: (key: 'user') => AppVariables['user'] }) => {
  const user = appContext.get('user');
  if (!user) {
    throw new HttpError(401, 'Autenticacao necessaria para consultar reservas.');
  }
  return user;
};

const buildReservationCsv = (rows: Awaited<ReturnType<typeof listReservations>>) => {
  const headers = [
    'reservation_code',
    'reservation_date',
    'reservation_time',
    'meal_period',
    'customer_full_name',
    'reserved_person_name',
    'guest_count',
    'guest_count_mode',
    'has_children',
    'dietary_restriction_type',
    'dietary_restriction_notes',
    'seating_preference',
    'whatsapp_number',
    'email',
    'status',
  ];

  const escape = (value: string | number | null) => {
    const normalized = value == null ? '' : String(value);
    return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
  };

  return [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.reservationCode,
        row.reservationDate,
        row.reservationTime,
        row.mealPeriod,
        row.customerFullName,
        row.reservedPersonName,
        row.guestCount,
        row.guestCountMode,
        row.hasChildren ? 'yes' : 'no',
        row.dietaryRestrictionType,
        row.dietaryRestrictionNotes,
        row.seatingPreference,
        row.whatsappNumber,
        row.email,
        row.status,
      ]
        .map((value) => escape(value ?? null))
        .join(','),
    ),
  ].join('\n');
};

const readListFilters = (url: URL): ReservationListFilters => ({
  reservationDate: url.searchParams.get('date'),
  status: (url.searchParams.get('status') as ReservationStatus | null) ?? null,
  query: url.searchParams.get('q'),
});

export const registerReservationRoutes = (app: ReservationApp) => {
  setCorsHeaders(app);

  app.post('/api/reservations', async (c) => {
    const payload = await requireJsonBody<ReservationRequestPayload>(c.req.raw);
    const reservation = await createReservation(c.env, c.req.raw, payload);
    return c.json({ ok: true, reservation }, 201 as never);
  });

  app.get('/api/admin/reservations/export.csv', async (c) => {
    requireAuthenticatedUser(c);
    const rows = await listReservations(c.env, readListFilters(new URL(c.req.url)));
    return csvResponse(buildReservationCsv(rows), `reservations-${new Date().toISOString().slice(0, 10)}.csv`);
  });

  app.get('/api/admin/reservations', async (c) => {
    requireAuthenticatedUser(c);
    const rows = await listReservations(c.env, readListFilters(new URL(c.req.url)));
    return c.json({
      ok: true,
      reservations: rows.map((row) => ({
        id: row.id,
        reservationCode: row.reservationCode,
        reservationDate: row.reservationDate,
        reservationTime: row.reservationTime,
        mealPeriod: row.mealPeriod,
        customerFullName: row.customerFullName,
        reservedPersonName: row.reservedPersonName,
        guestCount: row.guestCount,
        guestCountMode: row.guestCountMode,
        hasChildren: row.hasChildren,
        dietaryRestrictionType: row.dietaryRestrictionType,
        dietaryRestrictionNotes: row.dietaryRestrictionNotes,
        seatingPreference: row.seatingPreference,
        whatsappNumber: row.whatsappNumber,
        email: row.email,
        status: row.status,
        createdAt: row.createdAt,
      })),
    });
  });

  app.patch('/api/admin/reservations/:id/status', async (c) => {
    const user = requireAuthenticatedUser(c);
    const body = await requireJsonBody<{ status?: string }>(c.req.raw);
    if (!body.status || !RESERVATION_STATUSES.includes(body.status as ReservationStatus)) {
      throw new HttpError(400, 'Status invalido para a reserva.');
    }

    await changeReservationStatus(c.env, c.req.param('id'), body.status as ReservationStatus, user.email);
    return c.json({ ok: true });
  });
};
