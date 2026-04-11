import type { Context } from 'hono';

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const jsonError = (c: Context, status: number, message: string, details?: unknown) =>
  c.json(
    {
      ok: false,
      error: message,
      details,
    },
    status as never,
  );

export const getRequestIp = (request: Request) =>
  request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

export const isMutationMethod = (method: string) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());

export const requireJsonBody = async <T>(request: Request) => {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, 'JSON invalido.');
  }
};

export const csvResponse = (content: string, filename: string) =>
  new Response(content, {
    headers: {
      'content-type': 'text/csv; charset=UTF-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  });
