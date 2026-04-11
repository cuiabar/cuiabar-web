import type { Context } from 'hono';
import type { Hono } from 'hono';
import { all, asJson, first, nowIso, parseJsonText, run } from '../lib/db';
import { HttpError, requireJsonBody } from '../lib/http';
import { generateId } from '../lib/security';
import type { AppVariables, Env } from '../types';

type AppBindings = { Bindings: Env; Variables: AppVariables };
type AppContext = Context<AppBindings>;
type AppInstance = Hono<AppBindings>;

type BlogSection = {
  title: string;
  body: string;
};

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  summary: string;
  category: string;
  eyebrow: string;
  read_time: string;
  cover_image_url: string;
  keywords_json: string;
  sections_json: string;
  status: string;
  published_at: string | null;
  scheduled_at: string | null;
  created_by_email: string | null;
  updated_by_email: string | null;
  created_at: string;
  updated_at: string;
};

type BlogPostInput = {
  title?: string;
  slug?: string;
  excerpt?: string;
  summary?: string;
  category?: string;
  eyebrow?: string;
  readTime?: string;
  coverImageUrl?: string;
  keywords?: string[];
  sections?: BlogSection[];
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt?: string | null;
  scheduledAt?: string | null;
};

const BLOG_EDITOR_HEADER = 'cf-access-authenticated-user-email';

const normalizeText = (value: unknown) => String(value ?? '').trim();

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const estimateReadTime = (input: string) => {
  const words = input.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 180))} min`;
};

const parseEmailSet = (value: string | undefined) =>
  new Set(
    (value ?? '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );

const getAccessEmail = (request: Request) =>
  request.headers.get(BLOG_EDITOR_HEADER) ??
  request.headers.get(BLOG_EDITOR_HEADER.toUpperCase()) ??
  request.headers.get('x-authenticated-email') ??
  '';

const getProvidedEditorToken = (c: AppContext) =>
  c.req.header('x-blog-editor-token')?.trim() ||
  c.req.query('token')?.trim() ||
  '';

const requireBlogEditorAccess = (c: AppContext) => {
  const token = getProvidedEditorToken(c);
  const configuredToken = c.env.BLOG_EDITOR_TOKEN?.trim();
  if (configuredToken && token === configuredToken) {
    return 'token';
  }

  const email = getAccessEmail(c.req.raw).trim().toLowerCase();
  if (!email) {
    throw new HttpError(401, 'Acesso editorial nao autenticado. Proteja /editor com Cloudflare Access ou use BLOG_EDITOR_TOKEN.');
  }

  const allowed = parseEmailSet(c.env.BLOG_EDITOR_ALLOWED_EMAILS);
  if (allowed.size > 0 && !allowed.has(email)) {
    throw new HttpError(403, 'Este e-mail nao esta liberado para o editor do blog.');
  }

  return email;
};

const parseSections = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as BlogSection[];
  }

  return value
    .map((section) => ({
      title: normalizeText((section as BlogSection)?.title),
      body: normalizeText((section as BlogSection)?.body),
    }))
    .filter((section) => section.title || section.body)
    .map((section, index) => ({
      title: section.title || `Secao ${index + 1}`,
      body: section.body,
    }));
};

const normalizeBlogInput = (body: BlogPostInput, existing?: BlogPostRow | null) => {
  const title = normalizeText(body.title || existing?.title);
  if (!title) {
    throw new HttpError(400, 'Titulo e obrigatorio.');
  }

  const slug = slugify(normalizeText(body.slug || existing?.slug || title));
  if (!slug) {
    throw new HttpError(400, 'Slug invalido.');
  }

  const excerpt = normalizeText(body.excerpt || existing?.excerpt);
  const summary = normalizeText(body.summary || existing?.summary || excerpt || title);
  const category = normalizeText(body.category || existing?.category || 'Blog');
  const eyebrow = normalizeText(body.eyebrow || existing?.eyebrow || 'Editorial');
  const coverImageUrl = normalizeText(body.coverImageUrl || existing?.cover_image_url);
  const keywords = Array.isArray(body.keywords)
    ? body.keywords.map((entry) => normalizeText(entry)).filter(Boolean)
    : parseJsonText<string[]>(existing?.keywords_json, []).map((entry) => normalizeText(entry)).filter(Boolean);
  const sections = parseSections(body.sections ?? parseJsonText<BlogSection[]>(existing?.sections_json, []));
  const readTime =
    normalizeText(body.readTime || existing?.read_time) ||
    estimateReadTime([title, excerpt, summary, ...sections.map((section) => `${section.title} ${section.body}`)].join(' '));

  const status = body.status || (existing?.status as BlogPostInput['status']) || 'draft';
  const publishedAt = body.publishedAt === undefined ? existing?.published_at ?? null : body.publishedAt;
  const scheduledAt = body.scheduledAt === undefined ? existing?.scheduled_at ?? null : body.scheduledAt;

  return {
    title,
    slug,
    excerpt,
    summary,
    category,
    eyebrow,
    coverImageUrl,
    keywords,
    sections,
    readTime,
    status,
    publishedAt,
    scheduledAt,
  };
};

const mapRowToEditorPost = (row: BlogPostRow) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  summary: row.summary,
  category: row.category,
  eyebrow: row.eyebrow,
  readTime: row.read_time,
  coverImageUrl: row.cover_image_url,
  keywords: parseJsonText<string[]>(row.keywords_json, []),
  sections: parseJsonText<BlogSection[]>(row.sections_json, []),
  status: row.status,
  publishedAt: row.published_at,
  scheduledAt: row.scheduled_at,
  createdByEmail: row.created_by_email,
  updatedByEmail: row.updated_by_email,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapRowToKnowledgeArticle = (row: BlogPostRow) => ({
  id: row.id,
  title: row.title,
  excerpt: row.excerpt,
  category: row.category,
  readTime: row.read_time || estimateReadTime(`${row.title} ${row.summary}`),
  date: (row.published_at || row.created_at).slice(0, 10),
  image: row.cover_image_url || '/home/home-salao-dia-da-mulher.jpg',
  slug: row.slug,
  eyebrow: row.eyebrow,
  summary: row.summary,
  keywords: parseJsonText<string[]>(row.keywords_json, []),
  sections:
    parseJsonText<BlogSection[]>(row.sections_json, []).filter((section) => section.title || section.body).length > 0
      ? parseJsonText<BlogSection[]>(row.sections_json, [])
      : [{ title: 'Conteudo principal', body: row.summary }],
});

const resolveMediaUrl = (request: Request, env: Env, objectKey: string) => {
  const explicitBase = (env.BLOG_MEDIA_PUBLIC_BASE_URL ?? '').trim().replace(/\/$/, '');
  if (explicitBase) {
    return `${explicitBase}/${objectKey}`;
  }
  const origin = new URL(request.url).origin;
  return `${origin}/api/blog/media/${objectKey}`;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderEditorHtml = (authorized: boolean, email: string | null, tokenSeed: string | null) => `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
    <title>Editor do Blog Cuiabar</title>
    <style>
      :root { color-scheme: light; --bg:#f6efe6; --surface:#fffdf8; --text:#2c1e14; --muted:#6e5948; --accent:#a85125; --border:rgba(44,30,20,.12); --radius:22px; }
      * { box-sizing: border-box; } body { margin:0; font-family:"Segoe UI",Arial,sans-serif; background:linear-gradient(180deg,#fffaf4,var(--bg)); color:var(--text); }
      .shell { width:min(1320px,calc(100vw - 32px)); margin:24px auto 48px; }
      .topbar { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:16px; }
      .topbar h1 { margin:0; font-size:clamp(2rem,3vw,3.2rem); line-height:1; }
      .muted { color:var(--muted); font-size:14px; }
      .layout { display:grid; grid-template-columns:340px minmax(0,1fr); gap:16px; }
      .panel { background:rgba(255,253,248,.92); border:1px solid var(--border); border-radius:var(--radius); box-shadow:0 24px 60px rgba(58,30,6,.08); }
      .panel-inner { padding:20px; }
      .post-list { display:grid; gap:10px; max-height:calc(100vh - 220px); overflow:auto; }
      .post-row { border:1px solid var(--border); border-radius:18px; padding:12px; background:rgba(255,255,255,.55); cursor:pointer; }
      .post-row.active { border-color:rgba(168,81,37,.42); background:rgba(168,81,37,.08); }
      .post-row h3 { margin:6px 0 4px; font-size:17px; }
      .pill { display:inline-flex; padding:6px 10px; border-radius:999px; background:rgba(168,81,37,.1); color:var(--accent); font-size:12px; font-weight:700; }
      .grid { display:grid; gap:14px; }
      .row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
      label { display:grid; gap:8px; color:var(--muted); font-size:13px; }
      input, textarea, select, button { font:inherit; }
      input, textarea, select { width:100%; border:1px solid var(--border); border-radius:14px; padding:12px 14px; background:#fff; color:var(--text); }
      textarea { min-height:110px; resize:vertical; }
      .sections { display:grid; gap:12px; }
      .section-card { padding:14px; border:1px solid var(--border); border-radius:18px; background:rgba(255,255,255,.58); }
      .actions { display:flex; flex-wrap:wrap; gap:10px; }
      button { border:0; border-radius:999px; padding:12px 16px; cursor:pointer; font-weight:700; background:var(--accent); color:#fff; }
      button.secondary { background:rgba(168,81,37,.12); color:var(--accent); }
      .status { min-height:20px; font-size:14px; color:var(--muted); }
      .empty { padding:28px; border:1px solid var(--border); border-radius:var(--radius); background:rgba(255,253,248,.92); }
      @media (max-width: 1040px) { .layout, .row { grid-template-columns:1fr; } .post-list { max-height:none; } }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="topbar">
        <div><div class="muted">CMS nativo em Cloudflare</div><h1>Editor do Blog Cuiabar</h1></div>
        <div class="muted">${authorized ? `Acesso: ${escapeHtml(email === 'token' ? 'token temporario' : email || 'Cloudflare Access')}` : 'Acesso protegido por Cloudflare Access'}</div>
      </div>
      ${
        authorized
          ? `<div class="layout">
              <aside class="panel"><div class="panel-inner">
                <div class="actions" style="margin-bottom:12px">
                  <button id="new-post" type="button">Novo post</button>
                  <button id="refresh-posts" type="button" class="secondary">Atualizar</button>
                </div>
                <div class="status" id="list-status"></div>
                <div class="post-list" id="post-list"></div>
              </div></aside>
              <main class="panel"><div class="panel-inner">
                <div class="grid">
                  <div class="status" id="form-status"></div>
                  <div class="row">
                    <label>Titulo<input id="title" type="text" /></label>
                    <label>Slug<input id="slug" type="text" /></label>
                  </div>
                  <div class="row">
                    <label>Categoria<input id="category" type="text" value="Blog" /></label>
                    <label>Eyebrow<input id="eyebrow" type="text" value="Editorial" /></label>
                  </div>
                  <label>Excerpt<textarea id="excerpt"></textarea></label>
                  <label>Resumo<textarea id="summary"></textarea></label>
                  <div class="row">
                    <label>Keywords separadas por virgula<input id="keywords" type="text" /></label>
                    <label>Tempo de leitura<input id="read-time" type="text" placeholder="Ex: 4 min" /></label>
                  </div>
                  <div class="row">
                    <label>Imagem de capa (URL)<input id="cover-image-url" type="url" /></label>
                    <label>Status<select id="status"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="scheduled">Agendado</option><option value="archived">Arquivado</option></select></label>
                  </div>
                  <div class="row">
                    <label>Publicar em<input id="published-at" type="datetime-local" /></label>
                    <label>Agendar para<input id="scheduled-at" type="datetime-local" /></label>
                  </div>
                  <label>Upload de imagem<input id="cover-upload" type="file" accept="image/*" /></label>
                  <div>
                    <div class="actions" style="margin-bottom:12px"><button id="add-section" type="button" class="secondary">Adicionar secao</button></div>
                    <div class="sections" id="sections"></div>
                  </div>
                  <div class="actions">
                    <button id="save-draft" type="button">Salvar</button>
                    <button id="publish-now" type="button" class="secondary">Publicar agora</button>
                    <button id="delete-post" type="button" class="secondary">Excluir</button>
                  </div>
                </div>
              </div></main>
            </div>`
          : `<section class="empty"><h2>Entrar no editor</h2><p>O fluxo definitivo deste painel usa <strong>Cloudflare Access</strong> em <strong>blog.cuiabar.com/editor</strong>. Enquanto o Zero Trust nao e ativado na conta, o Worker ainda aceita um token editorial temporario como contingencia.</p><div class="grid" style="margin-top:16px; max-width:440px"><label>Token editorial<input id="editor-token-input" type="password" placeholder="Cole o token do editor" /></label><div class="actions"><button id="editor-token-submit" type="button">Entrar com token</button></div><div class="status" id="editor-token-status"></div></div></section>`
      }
    </div>
    ${
      authorized
        ? `<script>
            const editorApiBase = '/editor/api/blog';
            const persistedToken = ${JSON.stringify(tokenSeed || '')};
            if (persistedToken) {
              localStorage.setItem('blogEditorToken', persistedToken);
              if (!location.search.includes('token=')) history.replaceState({}, '', location.pathname);
            }
            const state = { posts: [], currentId: null };
            const withTokenHeaders = (headers = {}) => {
              const token = localStorage.getItem('blogEditorToken') || '';
              return token ? { ...headers, 'x-blog-editor-token': token } : headers;
            };
            const els = {
              listStatus: document.getElementById('list-status'), formStatus: document.getElementById('form-status'), postList: document.getElementById('post-list'),
              newPost: document.getElementById('new-post'), refreshPosts: document.getElementById('refresh-posts'),
              title: document.getElementById('title'), slug: document.getElementById('slug'), category: document.getElementById('category'),
              eyebrow: document.getElementById('eyebrow'), excerpt: document.getElementById('excerpt'), summary: document.getElementById('summary'),
              keywords: document.getElementById('keywords'), readTime: document.getElementById('read-time'), coverImageUrl: document.getElementById('cover-image-url'),
              status: document.getElementById('status'), publishedAt: document.getElementById('published-at'), scheduledAt: document.getElementById('scheduled-at'),
              coverUpload: document.getElementById('cover-upload'), sections: document.getElementById('sections'), addSection: document.getElementById('add-section'),
              saveDraft: document.getElementById('save-draft'), publishNow: document.getElementById('publish-now'), deletePost: document.getElementById('delete-post')
            };
            const slugify = (value) => String(value || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const setStatus = (message, target = 'form') => ((target === 'list' ? els.listStatus : els.formStatus).textContent = message || '');
            const toInputDateTime = (value) => { if (!value) return ''; const date = new Date(value); const pad = (n) => String(n).padStart(2, '0'); return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') + 'T' + [pad(date.getHours()), pad(date.getMinutes())].join(':'); };
            const fromInputDateTime = (value) => value ? new Date(value).toISOString() : null;
            const createSectionCard = (section = { title: '', body: '' }) => { const wrapper = document.createElement('div'); wrapper.className = 'section-card'; wrapper.innerHTML = '<label>Titulo da secao<input type="text" class="section-title" /></label><label style="margin-top:10px">Texto<textarea class="section-body"></textarea></label><div class="actions" style="margin-top:10px"><button type="button" class="secondary remove-section">Remover</button></div>'; wrapper.querySelector('.section-title').value = section.title || ''; wrapper.querySelector('.section-body').value = section.body || ''; wrapper.querySelector('.remove-section').addEventListener('click', () => wrapper.remove()); return wrapper; };
            const getSections = () => [...els.sections.querySelectorAll('.section-card')].map((card) => ({ title: card.querySelector('.section-title').value.trim(), body: card.querySelector('.section-body').value.trim() })).filter((section) => section.title || section.body);
            const getPayload = () => ({ title: els.title.value.trim(), slug: els.slug.value.trim(), category: els.category.value.trim(), eyebrow: els.eyebrow.value.trim(), excerpt: els.excerpt.value.trim(), summary: els.summary.value.trim(), keywords: els.keywords.value.split(',').map((item) => item.trim()).filter(Boolean), readTime: els.readTime.value.trim(), coverImageUrl: els.coverImageUrl.value.trim(), status: els.status.value, publishedAt: fromInputDateTime(els.publishedAt.value), scheduledAt: fromInputDateTime(els.scheduledAt.value), sections: getSections() });
            const renderPosts = () => { els.postList.innerHTML = ''; state.posts.forEach((post) => { const row = document.createElement('article'); row.className = 'post-row' + (post.id === state.currentId ? ' active' : ''); row.innerHTML = '<span class="pill">' + post.status + '</span><h3>' + post.title + '</h3><div class="muted">' + (post.updatedAt || post.createdAt || '').replace('T', ' ').slice(0, 16) + '</div>'; row.addEventListener('click', () => fillForm(post)); els.postList.appendChild(row); }); };
            const fillForm = (post) => { state.currentId = post?.id || null; els.title.value = post?.title || ''; els.slug.value = post?.slug || ''; els.category.value = post?.category || 'Blog'; els.eyebrow.value = post?.eyebrow || 'Editorial'; els.excerpt.value = post?.excerpt || ''; els.summary.value = post?.summary || ''; els.keywords.value = (post?.keywords || []).join(', '); els.readTime.value = post?.readTime || ''; els.coverImageUrl.value = post?.coverImageUrl || ''; els.status.value = post?.status || 'draft'; els.publishedAt.value = toInputDateTime(post?.publishedAt); els.scheduledAt.value = toInputDateTime(post?.scheduledAt); els.coverUpload.value = ''; els.sections.innerHTML = ''; (post?.sections?.length ? post.sections : [{ title: '', body: '' }]).forEach((section) => els.sections.appendChild(createSectionCard(section))); renderPosts(); };
            const loadPosts = async () => { setStatus('Carregando posts...', 'list'); const response = await fetch(editorApiBase + '/posts?scope=editor', { headers: withTokenHeaders() }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Falha ao carregar posts.'); state.posts = payload.posts || []; renderPosts(); setStatus(state.posts.length + ' post(s) carregado(s).', 'list'); if (!state.currentId && state.posts[0]) fillForm(state.posts[0]); if (!state.posts.length) fillForm(null); };
            const persistPost = async (mode) => { const payload = getPayload(); if (!payload.slug && payload.title) { payload.slug = slugify(payload.title); els.slug.value = payload.slug; } if (mode === 'publish') { payload.status = 'published'; payload.publishedAt = new Date().toISOString(); els.status.value = 'published'; els.publishedAt.value = toInputDateTime(payload.publishedAt); } setStatus(mode === 'publish' ? 'Publicando...' : 'Salvando...'); const method = state.currentId ? 'PUT' : 'POST'; const endpoint = state.currentId ? editorApiBase + '/posts/' + state.currentId : editorApiBase + '/posts'; const response = await fetch(endpoint, { method, headers: withTokenHeaders({ 'content-type': 'application/json' }), body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Falha ao salvar post.'); setStatus(result.message || 'Post salvo.'); await loadPosts(); fillForm(result.post); };
            const deletePost = async () => { if (!state.currentId || !confirm('Excluir este post?')) return; setStatus('Excluindo...'); const response = await fetch(editorApiBase + '/posts/' + state.currentId, { method: 'DELETE', headers: withTokenHeaders() }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Falha ao excluir.'); setStatus('Post excluido.'); state.currentId = null; await loadPosts(); fillForm(null); };
            const uploadCover = async (file) => { if (!file) return; setStatus('Enviando imagem...'); const formData = new FormData(); formData.append('file', file); const response = await fetch(editorApiBase + '/media', { method: 'POST', headers: withTokenHeaders(), body: formData }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Falha no upload.'); els.coverImageUrl.value = result.asset.publicUrl; setStatus('Imagem enviada para a biblioteca.'); };
            els.newPost.addEventListener('click', () => fillForm(null));
            els.refreshPosts.addEventListener('click', () => loadPosts().catch((error) => setStatus(error.message, 'list')));
            els.addSection.addEventListener('click', () => els.sections.appendChild(createSectionCard()));
            els.saveDraft.addEventListener('click', () => persistPost('save').catch((error) => setStatus(error.message)));
            els.publishNow.addEventListener('click', () => persistPost('publish').catch((error) => setStatus(error.message)));
            els.deletePost.addEventListener('click', () => deletePost().catch((error) => setStatus(error.message)));
            els.coverUpload.addEventListener('change', (event) => uploadCover(event.target.files?.[0]).catch((error) => setStatus(error.message)));
            els.title.addEventListener('input', () => { if (!state.currentId) els.slug.value = slugify(els.title.value); });
            loadPosts().catch((error) => setStatus(error.message, 'list'));
          </script>`
        : `<script>
            const input = document.getElementById('editor-token-input');
            const button = document.getElementById('editor-token-submit');
            const status = document.getElementById('editor-token-status');
            button?.addEventListener('click', () => {
              const token = input?.value?.trim();
              if (!token) {
                status.textContent = 'Informe o token do editor.';
                return;
              }
              localStorage.setItem('blogEditorToken', token);
              const nextUrl = new URL(location.href);
              nextUrl.searchParams.set('token', token);
              location.href = nextUrl.toString();
            });
          </script>`
    }
  </body>
</html>`;

export const publishScheduledBlogPosts = async (env: Env) => {
  await run(
    env.DB.prepare(
      `UPDATE blog_posts
       SET status = 'published',
           published_at = COALESCE(published_at, scheduled_at, ?),
           updated_at = ?
       WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= ?`,
    ).bind(nowIso(), nowIso(), nowIso()),
  );
};

export const registerBlogRoutes = (app: AppInstance) => {
  app.get('/editor', async (c) => {
    let authorized = false;
    let email: string | null = null;
    const providedToken = getProvidedEditorToken(c);
    try {
      email = requireBlogEditorAccess(c);
      authorized = true;
    } catch {
      authorized = false;
    }

    return new Response(renderEditorHtml(authorized, email, authorized && providedToken ? providedToken : null), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex, nofollow, noarchive, nosnippet',
      },
    });
  });

  app.get('/editor/', (c) => c.redirect('/editor'));

  app.get('/api/blog/posts', async (c) => {
    const scope = c.req.query('scope');
    const format = c.req.query('format');
    const status = c.req.query('status');
    const isEditorScope = scope === 'editor';

    if (isEditorScope) {
      requireBlogEditorAccess(c);
    }

    const rows = await all<BlogPostRow>(
      c.env.DB.prepare(
        `SELECT * FROM blog_posts
         WHERE ${
           isEditorScope
             ? status
               ? 'status = ?'
               : '1 = 1'
             : `status = 'published'`
         }
         ORDER BY COALESCE(published_at, scheduled_at, updated_at, created_at) DESC`,
      ).bind(...(isEditorScope && status ? [status] : [])),
    );

    if (format === 'knowledge') {
      return c.json(rows.map(mapRowToKnowledgeArticle));
    }

    return c.json({
      ok: true,
      posts: isEditorScope ? rows.map(mapRowToEditorPost) : rows.map(mapRowToKnowledgeArticle),
    });
  });

  app.get('/api/blog/posts/:identifier', async (c) => {
    const identifier = c.req.param('identifier');
    const scope = c.req.query('scope');
    const isEditorScope = scope === 'editor';
    if (isEditorScope) {
      requireBlogEditorAccess(c);
    }

    const row = await first<BlogPostRow>(
      c.env.DB.prepare(
        `SELECT * FROM blog_posts
         WHERE (id = ? OR slug = ?)
           ${isEditorScope ? '' : `AND status = 'published'`}
         LIMIT 1`,
      ).bind(identifier, identifier),
    );

    if (!row) {
      throw new HttpError(404, 'Post nao encontrado.');
    }

    return c.json({
      ok: true,
      post: isEditorScope ? mapRowToEditorPost(row) : mapRowToKnowledgeArticle(row),
    });
  });

  app.post('/api/blog/posts', async (c) => {
    const editorEmail = requireBlogEditorAccess(c);
    const body = await requireJsonBody<BlogPostInput>(c.req.raw);
    const normalized = normalizeBlogInput(body);

    const duplicate = await first<{ id: string }>(
      c.env.DB.prepare('SELECT id FROM blog_posts WHERE slug = ? LIMIT 1').bind(normalized.slug),
    );
    if (duplicate) {
      throw new HttpError(409, 'Ja existe um post com este slug.');
    }

    const id = generateId('blog');
    const createdAt = nowIso();
    await run(
      c.env.DB.prepare(
        `INSERT INTO blog_posts
          (id, slug, title, excerpt, summary, category, eyebrow, read_time, cover_image_url, keywords_json, sections_json, status, published_at, scheduled_at, created_by_email, updated_by_email, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        id,
        normalized.slug,
        normalized.title,
        normalized.excerpt,
        normalized.summary,
        normalized.category,
        normalized.eyebrow,
        normalized.readTime,
        normalized.coverImageUrl,
        asJson(normalized.keywords),
        asJson(normalized.sections),
        normalized.status,
        normalized.status === 'published' ? normalized.publishedAt || nowIso() : normalized.publishedAt,
        normalized.status === 'scheduled' ? normalized.scheduledAt : null,
        editorEmail,
        editorEmail,
        createdAt,
        createdAt,
      ),
    );

    const created = await first<BlogPostRow>(c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id));
    return c.json({ ok: true, message: 'Post criado.', post: created ? mapRowToEditorPost(created) : null }, 201);
  });

  app.put('/api/blog/posts/:id', async (c) => {
    const editorEmail = requireBlogEditorAccess(c);
    const existing = await first<BlogPostRow>(c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(c.req.param('id')));
    if (!existing) {
      throw new HttpError(404, 'Post nao encontrado.');
    }

    const body = await requireJsonBody<BlogPostInput>(c.req.raw);
    const normalized = normalizeBlogInput(body, existing);

    const duplicate = await first<{ id: string }>(
      c.env.DB.prepare('SELECT id FROM blog_posts WHERE slug = ? AND id <> ? LIMIT 1').bind(normalized.slug, existing.id),
    );
    if (duplicate) {
      throw new HttpError(409, 'Ja existe outro post com este slug.');
    }

    await run(
      c.env.DB.prepare(
        `UPDATE blog_posts
         SET slug = ?, title = ?, excerpt = ?, summary = ?, category = ?, eyebrow = ?, read_time = ?, cover_image_url = ?, keywords_json = ?, sections_json = ?, status = ?, published_at = ?, scheduled_at = ?, updated_by_email = ?, updated_at = ?
         WHERE id = ?`,
      ).bind(
        normalized.slug,
        normalized.title,
        normalized.excerpt,
        normalized.summary,
        normalized.category,
        normalized.eyebrow,
        normalized.readTime,
        normalized.coverImageUrl,
        asJson(normalized.keywords),
        asJson(normalized.sections),
        normalized.status,
        normalized.status === 'published' ? normalized.publishedAt || existing.published_at || nowIso() : normalized.publishedAt,
        normalized.status === 'scheduled' ? normalized.scheduledAt : null,
        editorEmail,
        nowIso(),
        existing.id,
      ),
    );

    const updated = await first<BlogPostRow>(c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(existing.id));
    return c.json({ ok: true, message: 'Post atualizado.', post: updated ? mapRowToEditorPost(updated) : null });
  });

  app.delete('/api/blog/posts/:id', async (c) => {
    requireBlogEditorAccess(c);
    await run(c.env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(c.req.param('id')));
    return c.json({ ok: true, message: 'Post excluido.' });
  });

  app.post('/api/blog/posts/:id/publish', async (c) => {
    const editorEmail = requireBlogEditorAccess(c);
    await run(
      c.env.DB.prepare(
        `UPDATE blog_posts
         SET status = 'published', published_at = COALESCE(published_at, ?), scheduled_at = null, updated_by_email = ?, updated_at = ?
         WHERE id = ?`,
      ).bind(nowIso(), editorEmail, nowIso(), c.req.param('id')),
    );

    const updated = await first<BlogPostRow>(c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(c.req.param('id')));
    return c.json({ ok: true, message: 'Post publicado.', post: updated ? mapRowToEditorPost(updated) : null });
  });

  app.post('/api/blog/media', async (c) => {
    const editorEmail = requireBlogEditorAccess(c);
    if (!c.env.BLOG_MEDIA) {
      throw new HttpError(503, 'Binding BLOG_MEDIA ainda nao configurado no Worker.');
    }

    const formData = await c.req.raw.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      throw new HttpError(400, 'Arquivo ausente.');
    }

    const objectKey = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, '')) || 'imagem'}-${crypto.randomUUID().slice(0, 8)}.${file.name.split('.').pop() || 'bin'}`;
    await c.env.BLOG_MEDIA.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    const publicUrl = resolveMediaUrl(c.req.raw, c.env, objectKey);
    await run(
      c.env.DB.prepare(
        `INSERT INTO blog_media_assets
          (id, object_key, file_name, content_type, file_size, alt_text, public_url, uploaded_by_email, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(generateId('media'), objectKey, file.name, file.type || 'application/octet-stream', file.size, null, publicUrl, editorEmail, nowIso()),
    );

    return c.json({
      ok: true,
      asset: {
        objectKey,
        publicUrl,
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSize: file.size,
      },
    });
  });

  app.get('/api/blog/media/:key', async (c) => {
    if (!c.env.BLOG_MEDIA) {
      throw new HttpError(404, 'Biblioteca de midia nao configurada.');
    }

    const object = await c.env.BLOG_MEDIA.get(c.req.param('key'));
    if (!object) {
      throw new HttpError(404, 'Arquivo nao encontrado.');
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    return new Response(object.body, { headers });
  });
};
