export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const crmRequest = async <T>(path: string, init: RequestInit = {}, csrfToken?: string | null): Promise<T> => {
  const headers = new Headers(init.headers);

  if (!headers.has('content-type') && init.body && !(init.body instanceof FormData)) {
    headers.set('content-type', 'application/json');
  }

  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes((init.method ?? 'GET').toUpperCase())) {
    headers.set('x-csrf-token', csrfToken);
  }

  const response = await fetch(path, {
    credentials: 'include',
    ...init,
    headers,
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as { ok?: boolean; error?: string; details?: unknown }) : {};

  if (!response.ok) {
    throw new ApiError(response.status, payload.error ?? 'Falha inesperada na API.', payload.details);
  }

  return payload as T;
};

export const downloadUrl = (path: string) => path;
