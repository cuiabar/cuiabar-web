const buildRobots = (origin) => `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;

export const onRequestGet = async ({ request }) =>
  new Response(buildRobots(new URL(request.url).origin), {
    headers: {
      'content-type': 'text/plain; charset=UTF-8',
      'cache-control': 'public, max-age=300',
    },
  });

