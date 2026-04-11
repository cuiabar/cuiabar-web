import { sanitizeTemplateHtml } from './security';

export interface MergeContext {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  unsubscribe_url?: string;
  campaign_name?: string;
  reply_to?: string | null;
  [key: string]: string | null | undefined;
}

const mergePattern = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export const extractMergeVariables = (source: string) => {
  const names = new Set<string>();
  for (const match of source.matchAll(mergePattern)) {
    if (match[1]) {
      names.add(match[1]);
    }
  }
  return [...names];
};

export const applyMergeTags = (source: string, context: MergeContext) =>
  source.replace(mergePattern, (_, rawName: string) => {
    const value = context[rawName];
    return value == null ? '' : String(value);
  });

export const prepareTemplateContent = (html: string, text: string, context: MergeContext) => ({
  html: sanitizeTemplateHtml(applyMergeTags(html, context)),
  text: applyMergeTags(text, context),
});

export const extractHrefLinks = (html: string) => {
  const urls = new Set<string>();
  const pattern = /href=(["'])(https?:\/\/[^"']+)\1/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    urls.add(match[2]);
  }

  return [...urls];
};

export const replaceHtmlLinks = (html: string, replacements: Map<string, string>) =>
  html.replace(/href=(["'])(https?:\/\/[^"']+)\1/gi, (full, quote: string, url: string) => {
    const replacement = replacements.get(url);
    if (!replacement) {
      return full;
    }
    return `href=${quote}${replacement}${quote}`;
  });

export const replaceTextLinks = (text: string, replacements: Map<string, string>) => {
  let updated = text;
  for (const [original, replacement] of replacements.entries()) {
    updated = updated.split(original).join(replacement);
  }
  return updated;
};
