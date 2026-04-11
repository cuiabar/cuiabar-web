import { useEffect, useMemo, useState } from 'react';
import { crmRequest, downloadUrl } from '../api';
import { Badge, Button, Field, InputClassName, MetricCard, PageHeader, Panel, Table } from '../components';
import { useCrm } from '../context';
import type { ReservationAdminRecord, ReservationStatus } from '../types';

const statusOptions: ReservationStatus[] = ['pending', 'confirmed', 'cancelled', 'expired', 'completed'];

const statusTone = (status: ReservationStatus) => {
  if (status === 'confirmed' || status === 'completed') return 'success' as const;
  if (status === 'pending') return 'warning' as const;
  if (status === 'cancelled' || status === 'expired') return 'danger' as const;
  return 'neutral' as const;
};

const mealPeriodLabels = {
  lunch: 'Almoco',
  dinner: 'Jantar',
};

const seatingLabels = {
  entry: 'Entrada',
  middle: 'Meio',
  kids_space: 'Espaco kids',
  stage: 'Palco',
  no_preference: 'Sem preferencia',
};

const dietaryLabels = {
  none: 'Nenhuma',
  lactose: 'Lactose',
  vegan: 'Vegano',
  celiac: 'Celiaco',
  other: 'Outras',
};

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(`${value}T12:00:00-03:00`));

const formatGuestCount = (reservation: ReservationAdminRecord) =>
  reservation.guestCountMode === 'approximate' ? `~${reservation.guestCount}` : String(reservation.guestCount);

export const ReservationsPage = () => {
  const { csrfToken } = useCrm();
  const [reservations, setReservations] = useState<ReservationAdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedReservation = useMemo(
    () => reservations.find((reservation) => reservation.id === selectedReservationId) ?? reservations[0] ?? null,
    [reservations, selectedReservationId],
  );

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (dateFilter) query.set('date', dateFilter);
      if (statusFilter) query.set('status', statusFilter);
      if (search.trim()) query.set('q', search.trim());
      const response = await crmRequest<{ ok: true; reservations: ReservationAdminRecord[] }>(
        `/api/admin/reservations${query.toString() ? `?${query.toString()}` : ''}`,
        {},
        csrfToken,
      );
      setReservations(response.reservations);
      setSelectedReservationId((current) => current && response.reservations.some((reservation) => reservation.id === current) ? current : response.reservations[0]?.id ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Falha ao carregar reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations().catch(() => undefined);
  }, [csrfToken]);

  const filteredMetrics = useMemo(() => {
    const total = reservations.length;
    const pending = reservations.filter((reservation) => reservation.status === 'pending').length;
    const confirmed = reservations.filter((reservation) => reservation.status === 'confirmed').length;
    const largeGroups = reservations.filter((reservation) => reservation.guestCount > 10).length;
    return { total, pending, confirmed, largeGroups };
  }, [reservations]);

  const exportCsvHref = useMemo(() => {
    const query = new URLSearchParams();
    if (dateFilter) query.set('date', dateFilter);
    if (statusFilter) query.set('status', statusFilter);
    if (search.trim()) query.set('q', search.trim());
    return downloadUrl(`/api/admin/reservations/export.csv${query.toString() ? `?${query.toString()}` : ''}`);
  }, [dateFilter, search, statusFilter]);

  const updateStatus = async (reservationId: string, nextStatus: ReservationStatus) => {
    setUpdatingStatusId(reservationId);
    setError(null);
    setMessage(null);
    try {
      await crmRequest(
        `/api/admin/reservations/${reservationId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: nextStatus }),
        },
        csrfToken,
      );
      setMessage('Status da reserva atualizado.');
      await loadReservations();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Falha ao atualizar status da reserva.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservas"
        description="Painel operacional para acompanhar reservas, filtrar por data/status, atualizar atendimento e exportar a base em CSV."
        action={
          <div className="flex gap-3">
            <a href="https://reservas.cuiabar.com" target="_blank" rel="noreferrer">
              <Button variant="ghost">Abrir portal publico</Button>
            </a>
            <a href={exportCsvHref}>
              <Button>Exportar CSV</Button>
            </a>
          </div>
        }
      />

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Reservas visiveis" value={filteredMetrics.total} note="Resultado do filtro atual" />
        <MetricCard label="Pendentes" value={filteredMetrics.pending} note="Aguardando confirmacao ou andamento" />
        <MetricCard label="Confirmadas" value={filteredMetrics.confirmed} note="Status atualizado manualmente" />
        <MetricCard label="Grupos 10+" value={filteredMetrics.largeGroups} note="Sem tolerancia de atraso" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr,0.95fr]">
        <Panel className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr,0.8fr,auto]">
            <Field label="Buscar">
              <input className={InputClassName} placeholder="Nome, codigo, WhatsApp ou e-mail" value={search} onChange={(event) => setSearch(event.target.value)} />
            </Field>
            <Field label="Data">
              <input className={InputClassName} type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
            </Field>
            <Field label="Status">
              <select className={InputClassName} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">Todos</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-end">
              <Button onClick={() => loadReservations()}>Filtrar</Button>
            </div>
          </div>

          <Table>
            <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Reserva</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Mesa</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    Carregando reservas...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                    Nenhuma reserva encontrada para os filtros atuais.
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation.id} className="cursor-pointer hover:bg-white/5" onClick={() => setSelectedReservationId(reservation.id)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{reservation.customerFullName}</div>
                      <div className="text-xs text-slate-400">{reservation.reservationCode}</div>
                      {reservation.reservedPersonName ? <div className="text-xs text-slate-500">Principal: {reservation.reservedPersonName}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{formatDateLabel(reservation.reservationDate)}</div>
                      <div className="text-xs text-slate-400">{reservation.reservationTime.replace(':00', 'h')} • {mealPeriodLabels[reservation.mealPeriod]}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{formatGuestCount(reservation)} pessoas</div>
                      <div className="text-xs text-slate-400">{reservation.guestCount > 10 ? 'Sem tolerancia' : 'Tolerancia de 10 min'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{reservation.whatsappNumber}</div>
                      <div className="text-xs text-slate-400">{reservation.email ?? 'Sem e-mail'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(reservation.status)}>{reservation.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold text-white">Detalhes da reserva</h2>
          {selectedReservation ? (
            <div className="mt-4 space-y-4 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cliente</p>
                <p className="mt-2 text-lg font-semibold text-white">{selectedReservation.customerFullName}</p>
                {selectedReservation.reservedPersonName ? <p className="mt-1 text-slate-300">Reserva principal para {selectedReservation.reservedPersonName}</p> : null}
                <p className="mt-1 text-xs text-slate-400">{selectedReservation.reservationCode}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Data e horario</p>
                  <p className="mt-2 font-medium text-white">{formatDateLabel(selectedReservation.reservationDate)}</p>
                  <p className="text-slate-300">{selectedReservation.reservationTime.replace(':00', 'h')} • {mealPeriodLabels[selectedReservation.mealPeriod]}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mesa</p>
                  <p className="mt-2 font-medium text-white">{formatGuestCount(selectedReservation)} pessoas</p>
                  <p className="text-slate-300">{selectedReservation.hasChildren ? 'Com criancas' : 'Sem criancas'}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preferencias</p>
                  <p className="mt-2 text-white">{seatingLabels[selectedReservation.seatingPreference]}</p>
                  <p className="mt-1 text-slate-300">
                    {selectedReservation.dietaryRestrictionType === 'other' && selectedReservation.dietaryRestrictionNotes
                      ? `Outras (${selectedReservation.dietaryRestrictionNotes})`
                      : dietaryLabels[selectedReservation.dietaryRestrictionType]}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Contato</p>
                  <p className="mt-2 text-white">{selectedReservation.whatsappNumber}</p>
                  <p className="mt-1 text-slate-300">{selectedReservation.email ?? 'Sem e-mail informado'}</p>
                </div>
              </div>

              <Field label="Atualizar status">
                <select
                  className={InputClassName}
                  value={selectedReservation.status}
                  disabled={updatingStatusId === selectedReservation.id}
                  onChange={(event) => updateStatus(selectedReservation.id, event.target.value as ReservationStatus)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="flex flex-wrap gap-3">
                <a href={`https://wa.me/${selectedReservation.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                  <Button variant="ghost">WhatsApp</Button>
                </a>
                {selectedReservation.email ? (
                  <a href={`mailto:${selectedReservation.email}`}>
                    <Button variant="ghost">E-mail</Button>
                  </a>
                ) : null}
                <a href={`https://reservas.cuiabar.com/sucesso/${selectedReservation.reservationCode}`} target="_blank" rel="noreferrer">
                  <Button variant="ghost">Link de sucesso</Button>
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Selecione uma reserva para ver detalhes e atualizar o status.</p>
          )}
        </Panel>
      </div>
    </div>
  );
};
