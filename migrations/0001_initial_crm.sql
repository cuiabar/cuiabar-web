PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO roles (id, name, description) VALUES
  ('role_manager', 'gerente', 'Acesso completo ao CRM e configuracoes sensiveis.'),
  ('role_marketing_operator', 'operador_marketing', 'Cria campanhas, templates e acompanha metricas sem acesso a credenciais.');

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  csrf_token TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  source TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained', 'suppressed')),
  opt_in_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (opt_in_status IN ('pending', 'confirmed', 'double_opt_in_pending', 'double_opt_in_confirmed', 'unknown')),
  unsubscribed_at TEXT,
  last_sent_at TEXT,
  last_clicked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_unsubscribed_at ON contacts(unsubscribed_at);

CREATE TABLE IF NOT EXISTS contact_lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'static' CHECK (kind IN ('static', 'system')),
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_lists_created_at ON contact_lists(created_at);

CREATE TABLE IF NOT EXISTS contact_list_items (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (list_id, contact_id),
  FOREIGN KEY (list_id) REFERENCES contact_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contact_list_items_list_id ON contact_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_contact_list_items_contact_id ON contact_list_items(contact_id);

CREATE TABLE IF NOT EXISTS segments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  rules_json TEXT NOT NULL DEFAULT '{}',
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_segments_created_at ON segments(created_at);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  preheader TEXT,
  html_content TEXT NOT NULL,
  text_content TEXT NOT NULL,
  variables_json TEXT NOT NULL DEFAULT '[]',
  created_by_user_id TEXT,
  updated_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preheader TEXT,
  template_id TEXT NOT NULL,
  segment_id TEXT,
  list_id TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'failed', 'cancelled')),
  scheduled_at TEXT,
  started_at TEXT,
  finished_at TEXT,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0,
  total_clicked INTEGER NOT NULL DEFAULT 0,
  total_unsubscribed INTEGER NOT NULL DEFAULT 0,
  total_click_events INTEGER NOT NULL DEFAULT 0,
  total_unique_clicks INTEGER NOT NULL DEFAULT 0,
  delivery_observed_rate REAL NOT NULL DEFAULT 0,
  send_batch_size INTEGER NOT NULL DEFAULT 25,
  send_rate_per_minute INTEGER NOT NULL DEFAULT 45,
  send_pause_ms INTEGER NOT NULL DEFAULT 1500,
  max_recipients INTEGER NOT NULL DEFAULT 5000,
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE RESTRICT,
  FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL,
  FOREIGN KEY (list_id) REFERENCES contact_lists(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_template_id ON campaigns(template_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_segment_id ON campaigns(segment_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_list_id ON campaigns(list_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON campaigns(scheduled_at);

CREATE TABLE IF NOT EXISTS campaign_recipients (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  email_snapshot TEXT NOT NULL,
  first_name_snapshot TEXT,
  last_name_snapshot TEXT,
  personalization_json TEXT NOT NULL DEFAULT '{}',
  tracking_token TEXT NOT NULL UNIQUE,
  unsubscribe_token TEXT NOT NULL UNIQUE,
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'skipped', 'suppressed', 'bounced', 'unsubscribed')),
  last_error TEXT,
  send_attempts INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT,
  clicked_at TEXT,
  unsubscribed_at TEXT,
  bounce_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_contact_id ON campaign_recipients(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_created_at ON campaign_recipients(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_unsubscribed_at ON campaign_recipients(unsubscribed_at);

CREATE TABLE IF NOT EXISTS campaign_links (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  original_url TEXT NOT NULL,
  tracking_path TEXT NOT NULL UNIQUE,
  url_hash TEXT NOT NULL,
  link_label TEXT,
  click_count_total INTEGER NOT NULL DEFAULT 0,
  click_count_unique INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campaign_links_campaign_id ON campaign_links(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_links_url_hash ON campaign_links(url_hash);

CREATE TABLE IF NOT EXISTS campaign_click_events (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  link_id TEXT NOT NULL,
  request_ip TEXT,
  user_agent TEXT,
  referer TEXT,
  is_unique INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES campaign_recipients(id) ON DELETE CASCADE,
  FOREIGN KEY (link_id) REFERENCES campaign_links(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campaign_click_events_campaign_id ON campaign_click_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_click_events_contact_id ON campaign_click_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_click_events_link_id ON campaign_click_events(link_id);
CREATE INDEX IF NOT EXISTS idx_campaign_click_events_created_at ON campaign_click_events(created_at);

CREATE TABLE IF NOT EXISTS send_events (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  recipient_id TEXT,
  contact_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'gmail',
  provider_message_id TEXT,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES campaign_recipients(id) ON DELETE SET NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_send_events_campaign_id ON send_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_send_events_contact_id ON send_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_send_events_status ON send_events(status);
CREATE INDEX IF NOT EXISTS idx_send_events_created_at ON send_events(created_at);

CREATE TABLE IF NOT EXISTS bounce_events (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  recipient_id TEXT,
  contact_id TEXT NOT NULL,
  bounce_type TEXT NOT NULL,
  diagnosis TEXT,
  raw_json TEXT NOT NULL DEFAULT '{}',
  observed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
  FOREIGN KEY (recipient_id) REFERENCES campaign_recipients(id) ON DELETE SET NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bounce_events_campaign_id ON bounce_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_bounce_events_contact_id ON bounce_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_bounce_events_created_at ON bounce_events(created_at);

CREATE TABLE IF NOT EXISTS suppression_list (
  id TEXT PRIMARY KEY,
  contact_id TEXT,
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  source TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_suppression_list_email ON suppression_list(email);
CREATE INDEX IF NOT EXISTS idx_suppression_list_contact_id ON suppression_list(contact_id);
CREATE INDEX IF NOT EXISTS idx_suppression_list_created_at ON suppression_list(created_at);

CREATE TABLE IF NOT EXISTS unsubscribe_events (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  contact_id TEXT NOT NULL,
  recipient_id TEXT,
  token TEXT NOT NULL,
  request_ip TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES campaign_recipients(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_unsubscribe_events_campaign_id ON unsubscribe_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_events_contact_id ON unsubscribe_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_events_created_at ON unsubscribe_events(created_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  ip TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS provider_accounts (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'gmail',
  name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_provider_accounts_provider ON provider_accounts(provider);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL DEFAULT '{}',
  updated_by_user_id TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS csv_imports (
  id TEXT PRIMARY KEY,
  created_by_user_id TEXT,
  original_filename TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  skipped_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  mapping_json TEXT NOT NULL DEFAULT '{}',
  errors_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_csv_imports_created_at ON csv_imports(created_at);

INSERT OR IGNORE INTO app_settings (key, value_json) VALUES
  ('deliverability', '{"spfConfigured":false,"dkimConfigured":false,"dmarcConfigured":false,"listUnsubscribeEnabled":true,"optInRequired":true,"doubleOptInEnabled":false,"warmingPlan":"Comece com lotes pequenos e aumente o volume gradualmente.","bounceHandling":"Suprima imediatamente contatos com bounce observado.","complaintHandling":"Remova reclamacoes e monitore reputacao."}'),
  ('sending', '{"batchSize":25,"ratePerMinute":45,"pauseMs":1500,"campaignMaxRecipients":5000,"retryLimit":2}'),
  ('gmail', '{"provider":"gmail","multiAccountReady":true}');
