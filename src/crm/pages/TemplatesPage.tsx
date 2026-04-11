import { useEffect, useMemo, useState } from 'react';
import { crmRequest } from '../api';
import { Badge, Button, Field, InputClassName, MetricCard, PageHeader, Panel } from '../components';
import { useCrm } from '../context';
import { defaultEmailTemplatePreset, emailTemplatePresets } from '../emailPresets';
import type { Template } from '../types';

type TemplateFormState = {
  name: string;
  subject: string;
  preheader: string;
  html: string;
  text: string;
};

type FeedbackTone = 'success' | 'danger' | 'neutral';

type FeedbackState = {
  tone: FeedbackTone;
  message: string;
} | null;

const RESERVED_VARIABLES = ['first_name', 'last_name', 'email', 'unsubscribe_url', 'campaign_name', 'reply_to'] as const;

const BLANK_TEMPLATE_HTML = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Template Cuiabar</title>
  </head>
  <body style="margin:0;padding:0;background:#efe5d8;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#efe5d8;">
      {{campaign_name}}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#efe5d8;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;background:#fffaf4;border-radius:28px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:#3f2416;">
                <img src="https://cuiabar.com/logo-villa-cuiabar.png" alt="Villa Cuiabar" width="84" style="display:block;width:84px;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:32px;line-height:1.08;color:#2f1c12;">Ola {{first_name}},</h1>
                <p style="margin:0 0 14px;font-family:Arial, Helvetica, sans-serif;font-size:16px;line-height:1.7;color:#5c4738;">Edite este rascunho com a campanha que voce quer disparar pelo CRM do Cuiabar.</p>
                <p style="margin:0 0 20px;font-family:Arial, Helvetica, sans-serif;font-size:16px;line-height:1.7;color:#5c4738;">Use imagens com URL absoluta, CTA claro e um texto simples tambem no modo plain text.</p>
                <a href="https://cuiabar.com" target="_blank" rel="noreferrer" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#b45b30;color:#ffffff;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;text-decoration:none;">Abrir site</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;">
                <img src="https://cuiabar.com/menu/picanha-carreteira.png" alt="Prato do Villa Cuiabar" width="576" style="display:block;width:100%;max-width:576px;height:auto;border-radius:20px;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:26px 32px;background:#3a2317;">
                <p style="margin:0 0 10px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#f3e4d5;">Campanha: {{campaign_name}}</p>
                <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:1.7;color:#f3e4d5;">Descadastrar: <a href="{{unsubscribe_url}}" style="color:#f3e4d5;text-decoration:underline;">{{unsubscribe_url}}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const BLANK_TEMPLATE_TEXT = `Ola {{first_name}},

Edite este rascunho com a campanha que voce quer disparar pelo CRM do Cuiabar.

CTA principal: https://cuiabar.com
Reply-To sugerido: {{reply_to}}

Descadastrar: {{unsubscribe_url}}`;

const previewDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const extractMergeVariables = (source: string) => {
  const names = new Set<string>();

  for (const match of source.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)) {
    if (match[1]) {
      names.add(match[1]);
    }
  }

  return [...names];
};

const applyMergeTags = (source: string, context: Record<string, string>) =>
  source.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, rawName: string) => context[rawName] ?? '');

const toPreviewDocument = (html: string, context: Record<string, string>) => {
  const merged = applyMergeTags(html, context);

  if (/<html[\s>]/i.test(merged)) {
    return merged;
  }

  return `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body style="margin:0;background:#f3f4f6;">${merged}</body></html>`;
};

const createBlankForm = (): TemplateFormState => ({
  name: '',
  subject: '',
  preheader: '',
  html: BLANK_TEMPLATE_HTML,
  text: BLANK_TEMPLATE_TEXT,
});

const createFormFromPreset = (preset = defaultEmailTemplatePreset): TemplateFormState => ({
  name: preset.name,
  subject: preset.subject,
  preheader: preset.preheader,
  html: preset.html,
  text: preset.text,
});

const createFormFromTemplate = (template: Template): TemplateFormState => ({
  name: template.name,
  subject: template.subject,
  preheader: template.preheader,
  html: template.html,
  text: template.text,
});

const duplicateTemplateDraft = (template: Template): TemplateFormState => ({
  name: `${template.name} copia`,
  subject: template.subject,
  preheader: template.preheader,
  html: template.html,
  text: template.text,
});

const feedbackClassName = (tone: FeedbackTone) =>
  tone === 'success'
    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
    : tone === 'danger'
      ? 'border-rose-500/25 bg-rose-500/10 text-rose-200'
      : 'border-white/10 bg-white/5 text-slate-200';

export const TemplatesPage = () => {
  const { csrfToken } = useCrm();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState<TemplateFormState>(() => createFormFromPreset());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(defaultEmailTemplatePreset.id);
  const [testEmails, setTestEmails] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sendingTemplateId, setSendingTemplateId] = useState<string | null>(null);

  const load = async () => {
    const response = await crmRequest<{ ok: true; templates: Template[] }>('/api/templates', {}, csrfToken);
    setTemplates(response.templates);
    return response.templates;
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [csrfToken]);

  const activePreset = useMemo(
    () => emailTemplatePresets.find((preset) => preset.id === activePresetId) ?? null,
    [activePresetId],
  );

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  const currentVariables = useMemo(
    () => Array.from(new Set([...extractMergeVariables(form.html), ...extractMergeVariables(form.text), ...RESERVED_VARIABLES])).sort(),
    [form.html, form.text],
  );

  const previewContext = useMemo(
    () => ({
      first_name: 'Marina',
      last_name: 'Souza',
      email: 'marina@exemplo.com',
      campaign_name: form.name || activePreset?.name || 'Newsletter Cuiabar',
      unsubscribe_url: 'https://crm.cuiabar.com/unsubscribe/exemplo',
      reply_to: 'contato@cuiabar.com',
    }),
    [activePreset?.name, form.name],
  );

  const previewDocument = useMemo(() => toPreviewDocument(form.html, previewContext), [form.html, previewContext]);
  const previewText = useMemo(() => applyMergeTags(form.text, previewContext), [form.text, previewContext]);

  const startBlankDraft = () => {
    setSelectedTemplateId(null);
    setActivePresetId(null);
    setForm(createBlankForm());
    setFeedback({ tone: 'neutral', message: 'Rascunho em branco carregado no editor.' });
  };

  const applyPreset = (presetId: string) => {
    const preset = emailTemplatePresets.find((entry) => entry.id === presetId);
    if (!preset) return;

    setSelectedTemplateId(null);
    setActivePresetId(preset.id);
    setForm(createFormFromPreset(preset));
    setFeedback({ tone: 'neutral', message: `Preset "${preset.name}" carregado no editor.` });
  };

  const editSavedTemplate = (template: Template) => {
    setSelectedTemplateId(template.id);
    setActivePresetId(null);
    setForm(createFormFromTemplate(template));
    setFeedback({ tone: 'neutral', message: `Template "${template.name}" aberto para edicao.` });
  };

  const duplicateSavedTemplate = (template: Template) => {
    setSelectedTemplateId(null);
    setActivePresetId(null);
    setForm(duplicateTemplateDraft(template));
    setFeedback({ tone: 'neutral', message: `Conteudo de "${template.name}" duplicado como novo rascunho.` });
  };

  const saveTemplate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      if (selectedTemplateId) {
        await crmRequest(
          `/api/templates/${selectedTemplateId}`,
          {
            method: 'PUT',
            body: JSON.stringify(form),
          },
          csrfToken,
        );
        await load();
        setFeedback({ tone: 'success', message: 'Template atualizado no CRM.' });
      } else {
        const response = await crmRequest<{ ok: true; templateId: string }>(
          '/api/templates',
          {
            method: 'POST',
            body: JSON.stringify(form),
          },
          csrfToken,
        );
        await load();
        setSelectedTemplateId(response.templateId);
        setActivePresetId(null);
        setFeedback({ tone: 'success', message: 'Novo template salvo no CRM.' });
      }
    } catch (error) {
      setFeedback({
        tone: 'danger',
        message: error instanceof Error ? error.message : 'Nao foi possivel salvar o template.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sendTest = async (templateId: string) => {
    const emails = testEmails
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!emails.length) {
      setFeedback({ tone: 'danger', message: 'Informe pelo menos um e-mail de teste separado por virgula.' });
      return;
    }

    setSendingTemplateId(templateId);
    setFeedback(null);

    try {
      await crmRequest(
        `/api/templates/${templateId}/test-send`,
        {
          method: 'POST',
          body: JSON.stringify({ emails }),
        },
        csrfToken,
      );
      setFeedback({ tone: 'success', message: `Teste enviado para ${emails.length} destinatario(s).` });
    } catch (error) {
      setFeedback({
        tone: 'danger',
        message: error instanceof Error ? error.message : 'Nao foi possivel disparar o teste.',
      });
    } finally {
      setSendingTemplateId(null);
    }
  };

  const editorLabel = selectedTemplate
    ? `Editando template salvo: ${selectedTemplate.name}`
    : activePreset
      ? `Rascunho a partir do preset: ${activePreset.name}`
      : 'Novo rascunho no editor';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Biblioteca com presets de email marketing, editor com preview realista e fluxo para transformar rascunhos em templates salvos do CRM."
        action={
          <Button type="button" variant="ghost" onClick={startBlankDraft}>
            Novo rascunho
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Presets prontos" value={emailTemplatePresets.length} note="Base inicial para newsletter, cardapio, delivery e B2B." />
        <MetricCard label="Templates salvos" value={templates.length} note="Qualquer template salvo fica disponivel para campanhas e testes." />
        <MetricCard label="Variaveis detectadas" value={currentVariables.length} note="Merge tags extraidas do HTML e do plain text atual." />
      </div>

      {feedback ? (
        <div className={`rounded-3xl border px-4 py-3 text-sm ${feedbackClassName(feedback.tone)}`}>{feedback.message}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <div className="space-y-6">
          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Biblioteca de presets</h2>
                <p className="mt-1 text-sm text-slate-400">Layouts ja montados com cara de marca para acelerar a producao do marketing.</p>
              </div>
              <Badge tone="warning">Pronto para editar</Badge>
            </div>

            <div className="grid gap-4">
              {emailTemplatePresets.map((preset) => {
                const isActive = activePresetId === preset.id;

                return (
                  <article
                    key={preset.id}
                    className={`overflow-hidden rounded-[28px] border transition ${isActive ? 'border-amber-300/50 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                  >
                    <div
                      className="flex items-center justify-between gap-4 px-5 py-4"
                      style={{
                        background: `linear-gradient(135deg, ${preset.palettePreview[0]}, ${preset.palettePreview[1]})`,
                      }}
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/70">{preset.category}</p>
                        <h3 className="mt-1 text-lg font-semibold text-white">{preset.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        {preset.palettePreview.map((color) => (
                          <span key={color} className="h-4 w-4 rounded-full border border-white/30" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 px-5 py-5">
                      <p className="text-sm leading-relaxed text-slate-300">{preset.summary}</p>
                      <p className="text-xs leading-relaxed text-slate-400">{preset.idealFor}</p>

                      <div className="flex flex-wrap gap-2">
                        {preset.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button type="button" onClick={() => applyPreset(preset.id)} disabled={isActive}>
                          {isActive ? 'Carregado' : 'Usar no editor'}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setPreviewMode('desktop')}>
                          Preview amplo
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </Panel>

          <Panel className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Templates salvos</h2>
              <p className="mt-1 text-sm text-slate-400">Use o campo abaixo para enviar testes rapidamente a partir de qualquer template ja salvo.</p>
            </div>

            <Field label="Destinatarios de teste" hint="Separe por virgula, por exemplo: teste@empresa.com, time@cuiabar.com">
              <input className={InputClassName} value={testEmails} onChange={(event) => setTestEmails(event.target.value)} />
            </Field>

            <div className="grid gap-3">
              {templates.length ? (
                templates.map((template) => (
                  <article key={template.id} className="rounded-[24px] border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{template.name}</h3>
                        <p className="mt-1 text-sm text-slate-300">{template.subject}</p>
                        <p className="mt-2 text-xs text-slate-500">Atualizado em {previewDateFormatter.format(new Date(template.updatedAt))}</p>
                      </div>
                      <Badge tone={selectedTemplateId === template.id ? 'success' : 'neutral'}>
                        {selectedTemplateId === template.id ? 'No editor' : 'Salvo'}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {template.variables.slice(0, 6).map((variable) => (
                        <Badge key={variable}>{variable}</Badge>
                      ))}
                      {template.variables.length > 6 ? <Badge>+{template.variables.length - 6}</Badge> : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button type="button" onClick={() => editSavedTemplate(template)}>
                        Editar
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => duplicateSavedTemplate(template)}>
                        Duplicar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={sendingTemplateId === template.id}
                        onClick={() => sendTest(template.id)}
                      >
                        {sendingTemplateId === template.id ? 'Enviando...' : 'Enviar teste'}
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 px-5 py-6 text-sm text-slate-400">
                  Ainda nao ha templates salvos. Escolha um preset, ajuste o conteudo e salve o primeiro.
                </div>
              )}
            </div>
          </Panel>

          <Panel className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Guia rapido</h2>
              <p className="mt-1 text-sm text-slate-400">Boas praticas para o email ficar bonito no CRM e menos fragil no inbox.</p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Prefira tabelas, estilos inline e imagens com URL absoluta como `https://cuiabar.com/...`.
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Mantenha o texto simples coerente com o HTML para preservar legibilidade em clientes mais restritivos.
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Sempre deixe um CTA principal muito claro e um descadastro funcional via <code>{'{{unsubscribe_url}}'}</code>.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {RESERVED_VARIABLES.map((variable) => (
                <Badge key={variable}>{variable}</Badge>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="space-y-5">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Editor</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{editorLabel}</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-400">Salve como novo template ou atualize um existente sem sair da tela.</p>
              </div>
              {selectedTemplate ? (
                <Button type="button" variant="ghost" onClick={() => duplicateSavedTemplate(selectedTemplate)}>
                  Duplicar como novo
                </Button>
              ) : null}
            </div>

            <form className="grid gap-4" onSubmit={saveTemplate}>
              <Field label="Nome do template">
                <input
                  className={InputClassName}
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </Field>

              <Field label="Assunto">
                <input
                  className={InputClassName}
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  required
                />
              </Field>

              <Field label="Preheader" hint="Trecho curto que costuma aparecer ao lado do assunto em muitos inboxes.">
                <input
                  className={InputClassName}
                  value={form.preheader}
                  onChange={(event) => setForm((current) => ({ ...current, preheader: event.target.value }))}
                />
              </Field>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">Variaveis detectadas neste rascunho</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentVariables.map((variable) => (
                    <Badge key={variable}>{variable}</Badge>
                  ))}
                </div>
              </div>

              <Field label="HTML" hint="Use estilos inline, largura maxima perto de 600px e links absolutos para imagens e CTA.">
                <textarea
                  className={`${InputClassName} min-h-[360px] font-mono text-xs leading-6`}
                  value={form.html}
                  onChange={(event) => setForm((current) => ({ ...current, html: event.target.value }))}
                />
              </Field>

              <Field label="Texto simples" hint="Versao plain text usada como fallback e apoio de entregabilidade.">
                <textarea
                  className={`${InputClassName} min-h-[220px] font-mono text-xs leading-6`}
                  value={form.text}
                  onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
                />
              </Field>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : selectedTemplateId ? 'Atualizar template' : 'Salvar como novo'}
                </Button>
                <Button type="button" variant="ghost" onClick={startBlankDraft}>
                  Limpar editor
                </Button>
              </div>
            </form>
          </Panel>

          <Panel className="space-y-5">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Preview</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Visual do email no editor</h2>
                <p className="mt-2 text-sm text-slate-400">A simulacao aplica merge tags de exemplo para facilitar revisao visual antes de salvar ou testar.</p>
              </div>

              <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm transition ${previewMode === 'desktop' ? 'bg-amber-300 text-slate-950' : 'text-slate-300 hover:bg-white/10'}`}
                  onClick={() => setPreviewMode('desktop')}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm transition ${previewMode === 'mobile' ? 'bg-amber-300 text-slate-950' : 'text-slate-300 hover:bg-white/10'}`}
                  onClick={() => setPreviewMode('mobile')}
                >
                  Mobile
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Assunto</p>
                  <p className="mt-1 text-base font-semibold text-white">{form.subject || 'Sem assunto ainda'}</p>
                  <p className="mt-2 text-sm text-slate-400">{form.preheader || 'Sem preheader no momento.'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
                  <p>Para: {previewContext.first_name} &lt;{previewContext.email}&gt;</p>
                  <p className="mt-1">Reply-To: {previewContext.reply_to}</p>
                </div>
              </div>

              <div className={`pt-5 transition-all ${previewMode === 'mobile' ? 'mx-auto max-w-[390px]' : 'w-full'}`}>
                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl shadow-black/30">
                  <iframe title="Preview do template" srcDoc={previewDocument} sandbox="" className="h-[780px] w-full bg-white" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.88fr,1.12fr]">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">Merge tags de exemplo</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  <div className="rounded-2xl bg-slate-950/60 px-3 py-3">
                    <span className="text-slate-500">first_name:</span> {previewContext.first_name}
                  </div>
                  <div className="rounded-2xl bg-slate-950/60 px-3 py-3">
                    <span className="text-slate-500">campaign_name:</span> {previewContext.campaign_name}
                  </div>
                  <div className="rounded-2xl bg-slate-950/60 px-3 py-3">
                    <span className="text-slate-500">reply_to:</span> {previewContext.reply_to}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">Plain text renderizado</p>
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950/60 px-4 py-4 font-mono text-xs leading-6 text-slate-300">
                  {previewText}
                </pre>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};
