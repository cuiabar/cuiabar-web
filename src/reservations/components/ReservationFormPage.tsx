import type { ReactNode } from 'react';
import { startTransition, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';
import { useSeo } from '../../hooks/useSeo';
import { decorateOutboundUrl, getAttributionSnapshot, trackContact, trackEvent, trackInitiateCheckout } from '../../lib/analytics';
import { submitReservation } from '../api';
import {
  DIETARY_RESTRICTION_LABELS,
  DISCOVERY_SOURCE_LABELS,
  FULL_TOLERANCE_POLICY,
  GUEST_COUNT_MODE_LABELS,
  GUEST_COUNT_SUGGESTIONS,
  MEAL_PERIOD_LABELS,
  RESERVATION_ANALYTICS_CONTENT_NAME,
  RESERVATION_TIME_OPTIONS,
  SEATING_PREFERENCE_LABELS,
} from '../constants';
import type {
  DietaryRestrictionType,
  DiscoverySource,
  ReservationFormErrors,
  ReservationFormValues,
  ReservationForType,
  ReservationTime,
  SeatingPreference,
  YesNoValue,
} from '../types';
import {
  buildReservationPayload,
  formatReservationDate,
  formatWhatsappInput,
  getMealPeriodFromTime,
  getTolerancePolicyForGuestCount,
  initialReservationValues,
  normalizeGuestCount,
  storeReservationSummary,
  validateReservationForm,
} from '../utils';

type ChoiceOption<T extends string> = {
  label: string;
  value: T;
  description?: string;
};

const SectionCard = ({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) => (
  <section className="rounded-[2rem] border border-cocoa/10 bg-white/92 p-5 shadow-[0_30px_70px_-45px_rgba(51,35,19,0.42)] backdrop-blur sm:p-7">
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-terracotta/80">{eyebrow}</p>
    <h2 className="mt-3 font-heading text-3xl text-cocoa sm:text-[2.2rem]">{title}</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-steel sm:text-[0.98rem]">{description}</p>
    <div className="mt-6 space-y-5">{children}</div>
  </section>
);

const FieldLabel = ({ htmlFor, children, optional }: { htmlFor?: string; children: ReactNode; optional?: boolean }) => (
  <label htmlFor={htmlFor} className="block text-sm font-semibold text-cocoa">
    {children}
    {optional ? <span className="ml-2 text-xs font-medium text-steel">Opcional</span> : null}
  </label>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-2 text-sm font-medium text-[#8d2f20]">{message}</p> : null;

const TextInput = ({
  id,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'email' | 'date';
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    className={`mt-2 w-full rounded-[1.2rem] border px-4 py-3 text-[0.98rem] text-cocoa outline-none transition ${
      error ? 'border-[#b24a35] bg-[#fff2ef]' : 'border-cocoa/10 bg-[#fffdf9] focus:border-terracotta/60 focus:bg-white'
    }`}
  />
);

const TextArea = ({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) => (
  <textarea
    id={id}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    rows={4}
    className="mt-2 w-full rounded-[1.2rem] border border-cocoa/10 bg-[#fffdf9] px-4 py-3 text-[0.98rem] text-cocoa outline-none transition focus:border-terracotta/60 focus:bg-white"
    placeholder="Observacoes importantes para a equipe, aniversarios, mobilidade, carrinho ou qualquer contexto util."
  />
);

const ChoiceGrid = <T extends string>({
  name,
  value,
  onChange,
  options,
  columns = 'grid-cols-1 sm:grid-cols-2',
}: {
  name: string;
  value: T | '';
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
  columns?: string;
}) => (
  <div className={`grid gap-3 ${columns}`}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <label
          key={`${name}-${option.value}`}
          className={`cursor-pointer rounded-[1.35rem] border px-4 py-4 transition ${
            selected
              ? 'border-terracotta/80 bg-[linear-gradient(145deg,rgba(172,84,39,0.14),rgba(255,255,255,0.98))] shadow-[0_24px_50px_-40px_rgba(172,84,39,0.7)]'
              : 'border-cocoa/10 bg-[#fffdf9] hover:border-terracotta/40 hover:bg-white'
          }`}
        >
          <input className="sr-only" type="radio" name={name} checked={selected} onChange={() => onChange(option.value)} />
          <span className="block text-sm font-semibold text-cocoa">{option.label}</span>
          {option.description ? <span className="mt-1 block text-sm leading-5 text-steel">{option.description}</span> : null}
        </label>
      );
    })}
  </div>
);

const mealSections = ['lunch', 'dinner'] as const;

const reservationForOptions: ChoiceOption<ReservationForType>[] = [
  { value: 'self', label: 'Para mim', description: 'Voce sera a pessoa principal da reserva.' },
  { value: 'other', label: 'Para outra pessoa', description: 'A reserva ficara vinculada ao nome principal informado abaixo.' },
];

const yesNoOptions: ChoiceOption<YesNoValue>[] = [{ value: 'yes', label: 'Sim' }, { value: 'no', label: 'Nao' }];

const dietaryOptions: ChoiceOption<DietaryRestrictionType>[] = [
  { value: 'none', label: DIETARY_RESTRICTION_LABELS.none },
  { value: 'lactose', label: DIETARY_RESTRICTION_LABELS.lactose },
  { value: 'vegan', label: DIETARY_RESTRICTION_LABELS.vegan },
  { value: 'celiac', label: DIETARY_RESTRICTION_LABELS.celiac },
  { value: 'other', label: DIETARY_RESTRICTION_LABELS.other },
];

const seatingOptions: ChoiceOption<SeatingPreference>[] = [
  { value: 'entry', label: SEATING_PREFERENCE_LABELS.entry },
  { value: 'middle', label: SEATING_PREFERENCE_LABELS.middle },
  { value: 'kids_space', label: SEATING_PREFERENCE_LABELS.kids_space },
  { value: 'stage', label: SEATING_PREFERENCE_LABELS.stage },
  { value: 'no_preference', label: SEATING_PREFERENCE_LABELS.no_preference },
];

const discoveryOptions: ChoiceOption<DiscoverySource>[] = [
  { value: 'google', label: DISCOVERY_SOURCE_LABELS.google },
  { value: 'social', label: DISCOVERY_SOURCE_LABELS.social },
  { value: 'referral', label: DISCOVERY_SOURCE_LABELS.referral },
  { value: 'already_customer', label: DISCOVERY_SOURCE_LABELS.already_customer },
];

const guestCountModeOptions = [
  { value: 'exact', label: GUEST_COUNT_MODE_LABELS.exact },
  { value: 'approximate', label: GUEST_COUNT_MODE_LABELS.approximate },
] as const;

export const ReservationFormPage = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<ReservationFormValues>(initialReservationValues);
  const [errors, setErrors] = useState<ReservationFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ReservationFormValues, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const hasTrackedFormStartRef = useRef(false);

  const guestCountValue = Number.parseInt(values.guestCount, 10) || 0;
  const tolerancePolicyText = getTolerancePolicyForGuestCount(guestCountValue);
  const liveErrors = useMemo(() => validateReservationForm(values), [values]);
  const whatsappHref = useMemo(
    () =>
      decorateOutboundUrl(`https://wa.me/${siteConfig.whatsappNumber}`, {
        content_name: RESERVATION_ANALYTICS_CONTENT_NAME,
        destination: 'whatsapp',
        reservation_stage: 'form',
      }),
    [],
  );

  useSeo({
    title: 'Reservas Cuiabar | Almoco e jantar em Campinas',
    description: 'Reserve sua mesa no Cuiabar com data, horario, observacoes e confirmacao organizada para almoco ou jantar.',
    ogTitle: 'Reservas Cuiabar',
    ogDescription: 'Faça sua reserva para viver a experiencia Cuiabar com mais conforto e organizacao.',
    canonicalUrl: `${window.location.origin}/`,
    keywords: ['reserva restaurante campinas', 'reserva cuiabar', 'almoco cuiabar', 'jantar cuiabar'],
  });

  const buildReservationAnalyticsParams = (overrides: Record<string, string | number | boolean | undefined> = {}) => ({
    content_name: RESERVATION_ANALYTICS_CONTENT_NAME,
    content_category: 'reservation',
    guest_count: guestCountValue || undefined,
    guest_count_mode: values.guestCountMode,
    reservation_date: values.reservationDate || undefined,
    reservation_time: values.reservationTime || undefined,
    meal_period: values.reservationTime ? getMealPeriodFromTime(values.reservationTime as ReservationTime) : undefined,
    has_children: values.hasChildren === 'yes',
    customer_status: values.isExistingCustomer === 'yes' ? 'existing' : 'new',
    discovery_source: values.isExistingCustomer === 'no' ? values.discoverySource || undefined : 'already_customer',
    ...overrides,
  });

  const trackFormStart = (field: keyof ReservationFormValues) => {
    if (hasTrackedFormStartRef.current) {
      return;
    }

    hasTrackedFormStartRef.current = true;

    const eventParams = buildReservationAnalyticsParams({
      reservation_stage: 'start',
      trigger_field: field,
    });

    trackInitiateCheckout('reservation_portal', eventParams);
    trackEvent('reservation_form_start', eventParams);
  };

  const setField = <K extends keyof ReservationFormValues>(field: K, nextValue: ReservationFormValues[K]) => {
    trackFormStart(field);
    setValues((current) => {
      const nextValues = { ...current, [field]: nextValue };
      if (field === 'reservationForType' && nextValue === 'self') nextValues.reservedPersonName = '';
      if (field === 'dietaryRestrictionType' && nextValue !== 'other') nextValues.dietaryRestrictionNotes = '';
      if (field === 'isExistingCustomer' && nextValue === 'yes') nextValues.discoverySource = '';
      return nextValues;
    });
    setErrors((current) => ({ ...current, form: undefined }));
  };

  const showError = (field: keyof ReservationFormValues) => (touched[field] || submitting ? liveErrors[field] : undefined);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateReservationForm(values);
    setTouched({
      customerFullName: true,
      reservationForType: true,
      reservedPersonName: true,
      guestCount: true,
      guestCountMode: true,
      hasChildren: true,
      dietaryRestrictionType: true,
      dietaryRestrictionNotes: true,
      seatingPreference: true,
      whatsappNumber: true,
      email: true,
      reservationDate: true,
      reservationTime: true,
      isExistingCustomer: true,
      discoverySource: true,
      notes: true,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    try {
      const payload = {
        ...buildReservationPayload(values),
        attribution: getAttributionSnapshot(),
      };
      const response = await submitReservation(payload);
      trackEvent(
        'reservation_submit',
        buildReservationAnalyticsParams({
          reservation_stage: 'submit',
          reservation_code: response.reservation.reservationCode,
          guest_count: response.reservation.guestCount,
          guest_count_mode: response.reservation.guestCountMode,
          reservation_date: response.reservation.reservationDate,
          reservation_time: response.reservation.reservationTime,
          meal_period: response.reservation.mealPeriod,
          has_children: response.reservation.hasChildren,
          customer_status: response.reservation.isExistingCustomer ? 'existing' : 'new',
          discovery_source: response.reservation.discoverySource ?? 'already_customer',
        }),
      );
      storeReservationSummary(response.reservation);
      startTransition(() => navigate(`/sucesso/${response.reservation.reservationCode}`));
    } catch (error) {
      trackEvent(
        'reservation_submit_error',
        buildReservationAnalyticsParams({
          reservation_stage: 'error',
          error_status: error instanceof Error && 'status' in error ? Number(error.status) || undefined : undefined,
        }),
      );
      setErrors((current) => ({
        ...current,
        form: error instanceof Error ? error.message : 'Nao foi possivel registrar a reserva agora.',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-cocoa/10 bg-[linear-gradient(140deg,rgba(255,249,240,0.96),rgba(255,255,255,0.88))] px-5 py-6 shadow-[0_38px_110px_-60px_rgba(51,35,19,0.55)] sm:px-8 sm:py-8 lg:px-10">
        <div className="absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(circle_at_top,rgba(178,146,88,0.22),transparent_58%),radial-gradient(circle_at_bottom,rgba(172,84,39,0.18),transparent_46%)] lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-terracotta/80">Reservas Cuiabar</p>
            <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-[0.92] text-cocoa sm:text-6xl lg:text-[5.3rem]">
              Viva a experiencia Cuiabar com a mesa pronta para receber voce.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-steel sm:text-lg">
              Faça sua reserva para viver a experiencia Cuiabar com mais conforto e organizacao. Leva poucos minutos e a equipe recebe tudo com os detalhes que importam.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-cocoa/10 bg-white/75 px-4 py-2 text-sm font-medium text-cocoa">Almoco: 11h, 12h e 13h</span>
              <span className="rounded-full border border-cocoa/10 bg-white/75 px-4 py-2 text-sm font-medium text-cocoa">Jantar: 18h, 19h e 20h</span>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-terracotta/20 bg-[linear-gradient(145deg,rgba(172,84,39,0.12),rgba(255,255,255,0.96))] p-5 sm:p-6">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-terracotta/80">Politica de tolerancia</p>
            <p className="mt-3 text-sm leading-6 text-cocoa">{FULL_TOLERANCE_POLICY}</p>
            {guestCountValue > 10 ? (
              <div className="mt-4 rounded-[1.4rem] border border-[#b24a35]/35 bg-[#fff1ed] px-4 py-4">
                <p className="text-sm font-semibold text-[#8b331f]">Grupos acima de 10 pessoas nao contam com tolerancia de atraso.</p>
                <p className="mt-2 text-sm leading-6 text-[#8b331f]/90">Nesses casos, a mesa podera ser liberada imediatamente em caso de atraso.</p>
              </div>
            ) : null}
            <div className="mt-5 rounded-[1.4rem] border border-cocoa/10 bg-white/80 px-4 py-4">
              <p className="text-sm font-semibold text-cocoa">Confirmacao organizada</p>
              <p className="mt-2 text-sm leading-6 text-steel">Se voce informar e-mail, enviamos uma copia da reserva e o convite do calendario quando aplicavel.</p>
            </div>
          </aside>
        </div>
      </section>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <SectionCard eyebrow="Quem reserva" title="Dados principais" description="Comecamos pelo nome da pessoa responsavel e por quem sera o atendimento principal da reserva.">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <FieldLabel htmlFor="customerFullName">Nome e sobrenome</FieldLabel>
              <TextInput id="customerFullName" value={values.customerFullName} onChange={(nextValue) => setField('customerFullName', nextValue)} placeholder="Ex.: Maria Fernanda Costa" error={showError('customerFullName')} />
              <FieldError message={showError('customerFullName')} />
            </div>
            <div>
              <FieldLabel>A reserva e para quem?</FieldLabel>
              <div className="mt-2">
                <ChoiceGrid name="reservationForType" value={values.reservationForType} onChange={(nextValue) => setField('reservationForType', nextValue)} options={reservationForOptions} />
              </div>
            </div>
          </div>

          {values.reservationForType === 'other' ? (
            <div>
              <FieldLabel htmlFor="reservedPersonName">Nome da pessoa principal da reserva</FieldLabel>
              <TextInput id="reservedPersonName" value={values.reservedPersonName} onChange={(nextValue) => setField('reservedPersonName', nextValue)} placeholder="Ex.: Joao Henrique" error={showError('reservedPersonName')} />
              <FieldError message={showError('reservedPersonName')} />
            </div>
          ) : null}
        </SectionCard>

        <SectionCard eyebrow="Mesa e horario" title="Quando e como a mesa deve ser preparada" description="Escolha a quantidade de pessoas, a data, o horario desejado e a preferencia de lugar.">
          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <FieldLabel htmlFor="guestCount">Quantas pessoas vao?</FieldLabel>
                <div className="inline-flex rounded-full border border-cocoa/10 bg-[#fff7ef] p-1">
                  {guestCountModeOptions.map((option) => {
                    const selected = values.guestCountMode === option.value;
                    return (
                      <button key={option.value} type="button" className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${selected ? 'bg-cocoa text-white shadow-[0_18px_36px_-22px_rgba(51,35,19,0.82)]' : 'text-cocoa/70'}`} onClick={() => setField('guestCountMode', option.value)}>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <input
                id="guestCount"
                inputMode="numeric"
                value={values.guestCount}
                onChange={(event) => setField('guestCount', normalizeGuestCount(event.target.value))}
                placeholder="Ex.: 6"
                className={`mt-2 w-full rounded-[1.2rem] border px-4 py-3 text-[1.02rem] text-cocoa outline-none transition ${showError('guestCount') ? 'border-[#b24a35] bg-[#fff2ef]' : 'border-cocoa/10 bg-[#fffdf9] focus:border-terracotta/60 focus:bg-white'}`}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {GUEST_COUNT_SUGGESTIONS.map((guestCount) => (
                  <button key={guestCount} type="button" className={`rounded-full border px-3 py-2 text-sm transition ${Number(values.guestCount) === guestCount ? 'border-cocoa bg-cocoa text-white' : 'border-cocoa/10 bg-white text-cocoa hover:border-terracotta/35'}`} onClick={() => setField('guestCount', String(guestCount))}>
                    {values.guestCountMode === 'approximate' ? `~${guestCount}` : guestCount}
                  </button>
                ))}
              </div>
              <FieldError message={showError('guestCount')} />
              <p className="mt-3 text-sm leading-6 text-steel">
                {guestCountValue > 0
                  ? values.guestCountMode === 'approximate'
                    ? `Vamos registrar aproximadamente ${guestCountValue} pessoas, mas o sistema salva o numero objetivo ${guestCountValue}.`
                    : `O sistema vai registrar ${guestCountValue} pessoas para a montagem da mesa.`
                  : 'Voce pode informar o numero exato ou usar o modo aproximado.'}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="reservationDate">Data da reserva</FieldLabel>
                <TextInput id="reservationDate" type="date" value={values.reservationDate} onChange={(nextValue) => setField('reservationDate', nextValue)} error={showError('reservationDate')} />
                <FieldError message={showError('reservationDate')} />
              </div>
              <div>
                <FieldLabel>Tem criancas na reserva?</FieldLabel>
                <div className="mt-2">
                  <ChoiceGrid name="hasChildren" value={values.hasChildren} onChange={(nextValue) => setField('hasChildren', nextValue)} options={yesNoOptions} columns="grid-cols-2" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <FieldLabel>Horario da reserva</FieldLabel>
              <div className="mt-3 space-y-4">
                {mealSections.map((mealPeriod) => (
                  <div key={mealPeriod} className="rounded-[1.4rem] border border-cocoa/10 bg-[#fffdf9] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta/80">{MEAL_PERIOD_LABELS[mealPeriod]}</p>
                      <span className="text-xs text-steel">Duracao media de 2h</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {RESERVATION_TIME_OPTIONS.filter((option) => option.mealPeriod === mealPeriod).map((option) => {
                        const selected = values.reservationTime === option.value;
                        return (
                          <label key={option.value} className={`cursor-pointer rounded-[1.2rem] border px-3 py-3 text-center transition ${selected ? 'border-cocoa bg-cocoa text-white' : 'border-cocoa/10 bg-white text-cocoa hover:border-terracotta/40'}`}>
                            <input className="sr-only" type="radio" name="reservationTime" checked={selected} onChange={() => setField('reservationTime', option.value)} />
                            <span className="text-sm font-semibold">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <FieldError message={showError('reservationTime')} />
            </div>

            <div>
              <FieldLabel>Preferencia de lugar</FieldLabel>
              <div className="mt-2">
                <ChoiceGrid name="seatingPreference" value={values.seatingPreference} onChange={(nextValue) => setField('seatingPreference', nextValue)} options={seatingOptions} />
              </div>
              <FieldError message={showError('seatingPreference')} />
            </div>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Detalhes do grupo" title="Informacoes para a equipe receber melhor" description="Esses campos ajudam a preparar a mesa com mais cuidado e previsibilidade.">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <FieldLabel>Alguma pessoa com restricao alimentar?</FieldLabel>
              <div className="mt-2">
                <ChoiceGrid name="dietaryRestrictionType" value={values.dietaryRestrictionType} onChange={(nextValue) => setField('dietaryRestrictionType', nextValue)} options={dietaryOptions} />
              </div>
            </div>
            <div>
              <FieldLabel>Ja e cliente?</FieldLabel>
              <div className="mt-2">
                <ChoiceGrid name="isExistingCustomer" value={values.isExistingCustomer} onChange={(nextValue) => setField('isExistingCustomer', nextValue)} options={yesNoOptions} columns="grid-cols-2" />
              </div>
            </div>
          </div>

          {values.dietaryRestrictionType === 'other' ? (
            <div>
              <FieldLabel htmlFor="dietaryRestrictionNotes">Quais restricoes devemos considerar?</FieldLabel>
              <TextInput id="dietaryRestrictionNotes" value={values.dietaryRestrictionNotes} onChange={(nextValue) => setField('dietaryRestrictionNotes', nextValue)} placeholder="Ex.: alergia a castanhas e baixo teor de sodio" error={showError('dietaryRestrictionNotes')} />
              <FieldError message={showError('dietaryRestrictionNotes')} />
            </div>
          ) : null}

          {values.isExistingCustomer === 'no' ? (
            <div>
              <FieldLabel>Por onde conheceu o restaurante?</FieldLabel>
              <div className="mt-2">
                <ChoiceGrid name="discoverySource" value={values.discoverySource} onChange={(nextValue) => setField('discoverySource', nextValue)} options={discoveryOptions} columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" />
              </div>
              <FieldError message={showError('discoverySource')} />
            </div>
          ) : null}
        </SectionCard>

        <SectionCard eyebrow="Contato" title="Como a equipe e os lembretes falam com voce" description="WhatsApp e obrigatorio. O e-mail e opcional, mas ele libera a copia automatica da reserva e o convite do Google Calendar.">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <FieldLabel htmlFor="whatsappNumber">Numero de WhatsApp</FieldLabel>
              <TextInput id="whatsappNumber" value={values.whatsappNumber} onChange={(nextValue) => setField('whatsappNumber', formatWhatsappInput(nextValue))} placeholder="(19) 99999-9999" error={showError('whatsappNumber')} />
              <FieldError message={showError('whatsappNumber')} />
            </div>
            <div>
              <FieldLabel htmlFor="email" optional>E-mail</FieldLabel>
              <TextInput id="email" type="email" value={values.email} onChange={(nextValue) => setField('email', nextValue)} placeholder="voce@exemplo.com" error={showError('email')} />
              <FieldError message={showError('email')} />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="notes" optional>Observacoes adicionais</FieldLabel>
            <TextArea id="notes" value={values.notes} onChange={(nextValue) => setField('notes', nextValue)} />
          </div>

          {values.reservationDate && values.reservationTime ? (
            <div className="rounded-[1.5rem] border border-cocoa/10 bg-[linear-gradient(145deg,rgba(255,249,240,0.96),rgba(255,255,255,0.94))] px-5 py-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-terracotta/80">Resumo antes de enviar</p>
              <p className="mt-3 text-base font-semibold text-cocoa">{formatReservationDate(values.reservationDate)} as {RESERVATION_TIME_OPTIONS.find((option) => option.value === values.reservationTime)?.label ?? '--'}</p>
              <p className="mt-2 text-sm leading-6 text-steel">{guestCountValue > 0 ? `${guestCountValue} pessoas` : 'Quantidade a definir'} • {values.reservationTime ? MEAL_PERIOD_LABELS[getMealPeriodFromTime(values.reservationTime as ReservationTime)] : 'Periodo pendente'}</p>
              <p className={`mt-4 rounded-[1.1rem] px-4 py-3 text-sm leading-6 ${guestCountValue > 10 ? 'bg-[#fff1ed] text-[#8b331f]' : 'bg-white text-steel'}`}>{tolerancePolicyText}</p>
            </div>
          ) : null}
        </SectionCard>

        <div className="rounded-[2rem] border border-cocoa/10 bg-[linear-gradient(145deg,rgba(51,35,19,0.98),rgba(85,53,36,0.96))] px-5 py-6 text-white shadow-[0_36px_90px_-54px_rgba(51,35,19,0.92)] sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#f0d2bf]">Confirmacao</p>
              <h2 className="mt-3 font-heading text-4xl">Pronto para registrar sua reserva?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78">Nossa equipe sera avisada imediatamente. Se voce informar e-mail, a copia da reserva tambem sera enviada por la.</p>
              {errors.form ? <p className="mt-4 rounded-[1.2rem] bg-white/10 px-4 py-3 text-sm text-[#ffd5cb]">{errors.form}</p> : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref}
                className="inline-flex items-center justify-center rounded-full border border-white/16 px-6 py-3 text-sm font-semibold text-white/88 transition hover:border-white/34 hover:text-white"
                onClick={() => {
                  const eventParams = buildReservationAnalyticsParams({
                    reservation_stage: 'form',
                    destination: 'whatsapp',
                  });
                  trackEvent('reservation_whatsapp_click', eventParams);
                  trackContact('whatsapp', eventParams);
                }}
              >
                Falar no WhatsApp
              </a>
              <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[#f4d2b0] px-7 py-3 text-sm font-semibold text-cocoa transition hover:translate-y-[-1px] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70" disabled={submitting}>
                {submitting ? 'Registrando reserva...' : 'Registrar reserva'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
