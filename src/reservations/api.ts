import type { ReservationSubmissionPayload, ReservationSubmitResponse } from './types';

type ReservationEnv = ImportMetaEnv & {
  readonly VITE_RESERVATION_API_BASE_URL?: string;
};

export class ReservationApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const getReservationApiBaseUrl = () => {
  const env = import.meta.env as ReservationEnv;
  const explicitBase = env.VITE_RESERVATION_API_BASE_URL?.trim();
  if (explicitBase) {
    return explicitBase.replace(/\/$/, '');
  }
  return '';
};

export const submitReservation = async (payload: ReservationSubmissionPayload): Promise<ReservationSubmitResponse> => {
  const baseUrl = getReservationApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/reservations`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => null)) as
    | { ok?: boolean; error?: string }
    | ReservationSubmitResponse
    | null;

  if (!response.ok || !result || !('ok' in result) || result.ok !== true || !('reservation' in result)) {
    const message = result && 'error' in result && typeof result.error === 'string' ? result.error : 'Nao foi possivel registrar a reserva agora.';
    throw new ReservationApiError(message, response.status);
  }

  return result as ReservationSubmitResponse;
};
