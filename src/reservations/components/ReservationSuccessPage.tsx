import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';
import { useSeo } from '../../hooks/useSeo';
import { decorateOutboundUrl, trackContact, trackEvent, trackLead } from '../../lib/analytics';
import { DIETARY_RESTRICTION_LABELS, MEAL_PERIOD_LABELS, RESERVATION_ANALYTICS_CONTENT_NAME, SEATING_PREFERENCE_LABELS } from '../constants';
import { describeGuestCount, formatReservationDate, hasTrackedReservationSuccess, markReservationSuccessTracked, readStoredReservationSummary } from '../utils';

export const ReservationSuccessPage = () => {
  const { reservationCode = '' } = useParams();
  const reservation = useMemo(() => (reservationCode ? readStoredReservationSummary(reservationCode) : null), [reservationCode]);
  const whatsappHref = useMemo(
    () =>
      decorateOutboundUrl(`https://wa.me/${siteConfig.whatsappNumber}`, {
        content_name: RESERVATION_ANALYTICS_CONTENT_NAME,
        destination: 'whatsapp',
        reservation_stage: 'success',
        reservation_code: reservationCode || undefined,
      }),
    [reservationCode],
  );

  useSeo({
    title: 'Reserva registrada | Cuiabar',
    description: 'Sua reserva foi registrada com sucesso e a equipe do Cuiabar ja foi notificada.',
    canonicalUrl: `${window.location.origin}/sucesso/${reservationCode}`,
    robots: 'noindex,nofollow',
  });

  useEffect(() => {
    if (!reservationCode || hasTrackedReservationSuccess(reservationCode)) {
      return;
    }

    const eventParams = {
      content_name: RESERVATION_ANALYTICS_CONTENT_NAME,
      content_category: 'reservation',
      reservation_stage: 'success',
      reservation_code: reservationCode,
      guest_count: reservation?.guestCount,
      guest_count_mode: reservation?.guestCountMode,
      reservation_date: reservation?.reservationDate,
      reservation_time: reservation?.reservationTime,
      meal_period: reservation?.mealPeriod,
      has_children: reservation?.hasChildren,
      customer_status: reservation ? (reservation.isExistingCustomer ? 'existing' : 'new') : undefined,
      discovery_source: reservation?.discoverySource ?? undefined,
    };

    trackEvent('reservation_success', eventParams);
    trackLead('reservation_portal', eventParams);
    markReservationSuccessTracked(reservationCode);
  }, [reservation, reservationCode]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2.5rem] border border-cocoa/10 bg-[linear-gradient(145deg,rgba(255,249,240,0.98),rgba(255,255,255,0.92))] shadow-[0_40px_120px_-72px_rgba(51,35,19,0.66)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-cocoa/10 px-6 py-7 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-terracotta/80">Reserva registrada</p>
            <h1 className="mt-4 font-heading text-5xl leading-[0.95] text-cocoa sm:text-6xl">Tudo certo por aqui.</h1>
            <p className="mt-5 text-base leading-7 text-steel">
              Nossa equipe foi notificada. Se voce informou um e-mail, tambem enviamos uma copia da reserva e o convite do calendario quando aplicavel.
            </p>

            <div className="mt-8 rounded-[1.8rem] border border-cocoa/10 bg-white/85 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta/80">Codigo da reserva</p>
              <p className="mt-3 text-3xl font-semibold tracking-[0.14em] text-cocoa">{reservationCode || '---'}</p>
            </div>

            <div className="mt-6 rounded-[1.6rem] border border-cocoa/10 bg-[#fff8f1] p-5">
              <p className="text-sm leading-6 text-cocoa">
                Reservas possuem tolerancia de 10 minutos. Para grupos acima de 10 pessoas, nao ha tolerancia. Apos o horario combinado, a mesa podera ser desmontada e liberada por ordem de chegada.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/" className="inline-flex items-center justify-center rounded-full bg-cocoa px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]">
                Nova reserva
              </Link>
              <a
                href={whatsappHref}
                className="inline-flex items-center justify-center rounded-full border border-cocoa/12 px-6 py-3 text-sm font-semibold text-cocoa transition hover:border-terracotta/35"
                onClick={() => {
                  const eventParams = {
                    content_name: RESERVATION_ANALYTICS_CONTENT_NAME,
                    content_category: 'reservation',
                    reservation_stage: 'success',
                    reservation_code: reservationCode || undefined,
                    destination: 'whatsapp',
                  };
                  trackEvent('reservation_whatsapp_click', eventParams);
                  trackContact('whatsapp', eventParams);
                }}
              >
                Falar com a equipe
              </a>
            </div>
          </div>

          <div className="px-6 py-7 sm:px-8 lg:px-10 lg:py-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-terracotta/80">Resumo da reserva</p>
            {reservation ? (
              <dl className="mt-5 space-y-4 text-sm leading-6 text-steel">
                <div className="rounded-[1.35rem] border border-cocoa/10 bg-white/82 px-4 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/65">Nome</dt>
                  <dd className="mt-1 text-base font-semibold text-cocoa">{reservation.customerFullName}</dd>
                  {reservation.reservedPersonName ? <dd className="mt-1 text-sm text-steel">Reserva principal em nome de {reservation.reservedPersonName}</dd> : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-cocoa/10 bg-white/82 px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/65">Data</dt>
                    <dd className="mt-1 text-base font-semibold text-cocoa">{reservation.reservationDateLabel || formatReservationDate(reservation.reservationDate)}</dd>
                  </div>
                  <div className="rounded-[1.35rem] border border-cocoa/10 bg-white/82 px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/65">Horario</dt>
                    <dd className="mt-1 text-base font-semibold text-cocoa">
                      {reservation.reservationTime.replace(':00', 'h')} • {MEAL_PERIOD_LABELS[reservation.mealPeriod]}
                    </dd>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-cocoa/10 bg-white/82 px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/65">Pessoas</dt>
                    <dd className="mt-1 text-base font-semibold text-cocoa">{describeGuestCount(reservation.guestCount, reservation.guestCountMode)}</dd>
                  </div>
                  <div className="rounded-[1.35rem] border border-cocoa/10 bg-white/82 px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/65">Criancas</dt>
                    <dd className="mt-1 text-base font-semibold text-cocoa">{reservation.hasChildren ? 'Sim' : 'Nao'}</dd>
                  </div>
                </div>
                <div className="rounded-[1.35rem] border border-cocoa/10 bg-white/82 px-4 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/65">Restricao alimentar</dt>
                  <dd className="mt-1 text-base font-semibold text-cocoa">
                    {reservation.dietaryRestrictionType === 'other' && reservation.dietaryRestrictionNotes
                      ? `Outras (${reservation.dietaryRestrictionNotes})`
                      : DIETARY_RESTRICTION_LABELS[reservation.dietaryRestrictionType]}
                  </dd>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-cocoa/10 bg-white/82 px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/65">Lugar</dt>
                    <dd className="mt-1 text-base font-semibold text-cocoa">{SEATING_PREFERENCE_LABELS[reservation.seatingPreference]}</dd>
                  </div>
                  <div className="rounded-[1.35rem] border border-cocoa/10 bg-white/82 px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/65">Contato</dt>
                    <dd className="mt-1 text-base font-semibold text-cocoa">{reservation.whatsappNumber}</dd>
                    {reservation.email ? <dd className="mt-1 text-sm text-steel">{reservation.email}</dd> : null}
                  </div>
                </div>
                {reservation.notes ? (
                  <div className="rounded-[1.35rem] border border-cocoa/10 bg-white/82 px-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa/65">Observacoes</dt>
                    <dd className="mt-1 text-sm leading-6 text-steel">{reservation.notes}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <div className="mt-5 rounded-[1.8rem] border border-cocoa/10 bg-white/85 p-5 text-sm leading-6 text-steel">
                O codigo foi registrado, mas este navegador nao manteve o resumo local da reserva. Se precisar de ajuda, fale com a equipe pelo WhatsApp oficial.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
