export type RoleName = 'gerente' | 'operador_marketing';

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  BLOG_MEDIA?: R2Bucket;
  APP_NAME: string;
  APP_BASE_URL: string;
  SESSION_COOKIE_NAME: string;
  CSRF_COOKIE_NAME: string;
  DEFAULT_FROM_EMAIL: string;
  DEFAULT_FROM_NAME: string;
  DEFAULT_REPLY_TO: string;
  BLOG_EDITOR_UPSTREAM_URL?: string;
  BLOG_EDITOR_MODE?: string;
  BLOG_EDITOR_ALLOWED_EMAILS?: string;
  BLOG_EDITOR_TOKEN?: string;
  BLOG_MEDIA_PUBLIC_BASE_URL?: string;
  IFOOD_STORE_URL?: string;
  FOOD99_STORE_URL?: string;
  AUTH_MODE?: string;
  GOOGLE_AUTH_CLIENT_ID?: string;
  GOOGLE_ALLOWED_EMAILS?: string;
  GOOGLE_MANAGER_EMAILS?: string;
  ENABLE_OPEN_TRACKING?: string;
  SEND_BATCH_SIZE?: string;
  SEND_RATE_PER_MINUTE?: string;
  SEND_PAUSE_MS?: string;
  CAMPAIGN_MAX_RECIPIENTS?: string;
  DOUBLE_OPT_IN_ENABLED?: string;
  SETUP_ADMIN_TOKEN?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  GOOGLE_BUSINESS_CLIENT_ID?: string;
  GOOGLE_BUSINESS_CLIENT_SECRET?: string;
  GOOGLE_BUSINESS_REFRESH_TOKEN?: string;
  GOOGLE_CALENDAR_ID?: string;
  GOOGLE_ADS_CLIENT_ID?: string;
  GOOGLE_ADS_CLIENT_SECRET?: string;
  GOOGLE_ADS_REFRESH_TOKEN?: string;
  GOOGLE_ADS_DEVELOPER_TOKEN?: string;
  GOOGLE_ADS_CUSTOMER_ID?: string;
  GOOGLE_ADS_LOGIN_CUSTOMER_ID?: string;
  GOOGLE_ADS_CONVERSION_ACTION?: string;
  GOOGLE_ADS_API_VERSION?: string;
  GMAIL_SENDER_EMAIL?: string;
  GMAIL_SENDER_NAME?: string;
  RESERVATION_NOTIFICATION_EMAIL?: string;
  RESERVATION_APP_BASE_URL?: string;
  META_PIXEL_ID?: string;
  META_CAPI_TOKEN?: string;
  META_ACCESS_TOKEN?: string;
  META_GRAPH_API_VERSION?: string;
  META_AD_ACCOUNT_ID?: string;
  META_LEAD_FORM_IDS?: string;
  ZOHO_CLIENT_ID?: string;
  ZOHO_CLIENT_SECRET?: string;
  ZOHO_REFRESH_TOKEN?: string;
  ZOHO_ACCOUNTS_DOMAIN?: string;
  ZOHO_API_DOMAIN?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  status: string;
  roles: RoleName[];
}

export interface SessionRecord {
  id: string;
  userId: string;
  csrfToken: string;
  expiresAt: string;
}

export interface AppVariables {
  user: AuthUser | null;
  session: SessionRecord | null;
}

export interface ContactRecord {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  source: string | null;
  tags_json: string;
  status: string;
  opt_in_status: string;
  unsubscribed_at: string | null;
  last_sent_at: string | null;
  last_clicked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateRecord {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  html_content: string;
  text_content: string;
  variables_json: string;
}

export interface CampaignRecord {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  template_id: string;
  segment_id: string | null;
  list_id: string | null;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  status: string;
  scheduled_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  total_recipients: number;
  total_sent: number;
  total_failed: number;
  total_clicked: number;
  total_opened: number;
  total_unsubscribed: number;
  total_open_events: number;
  total_unique_opens: number;
  total_click_events: number;
  total_unique_clicks: number;
  delivery_observed_rate: number;
  send_batch_size: number;
  send_rate_per_minute: number;
  send_pause_ms: number;
  max_recipients: number;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}
