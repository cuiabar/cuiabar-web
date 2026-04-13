import type { Env } from './index';

export class BaileysSessionDO {
  constructor(private readonly state: DurableObjectState, private readonly env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/send' && request.method === 'POST') {
      const body = await request.text();

      const response = await fetch(`${this.env.BAILEYS_GATEWAY_BASE_URL}/send`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-internal-secret': this.env.BAILEYS_GATEWAY_TOKEN,
        },
        body,
      });

      return new Response(await response.text(), {
        status: response.status,
        headers: { 'content-type': response.headers.get('content-type') || 'application/json; charset=utf-8' },
      });
    }

    if (url.pathname === '/health') {
      return new Response('ok', { status: 200 });
    }

    return new Response('not_found', { status: 404 });
  }
}
