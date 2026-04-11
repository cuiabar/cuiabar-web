CREATE TABLE IF NOT EXISTS ad_platform_accounts (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  external_account_id TEXT NOT NULL,
  account_name TEXT,
  account_status TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  last_synced_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider, external_account_id)
);

CREATE INDEX IF NOT EXISTS idx_ad_platform_accounts_provider ON ad_platform_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_ad_platform_accounts_last_synced_at ON ad_platform_accounts(last_synced_at);

CREATE TABLE IF NOT EXISTS ad_platform_sync_runs (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'error')),
  account_id TEXT,
  summary_json TEXT NOT NULL DEFAULT '{}',
  error TEXT,
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ad_platform_sync_runs_provider ON ad_platform_sync_runs(provider);
CREATE INDEX IF NOT EXISTS idx_ad_platform_sync_runs_status ON ad_platform_sync_runs(status);
CREATE INDEX IF NOT EXISTS idx_ad_platform_sync_runs_started_at ON ad_platform_sync_runs(started_at);

CREATE TABLE IF NOT EXISTS ad_platform_campaign_metrics (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  campaign_status TEXT,
  metric_date TEXT NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  interactions INTEGER NOT NULL DEFAULT 0,
  ctr REAL,
  spend_amount REAL NOT NULL DEFAULT 0,
  spend_currency TEXT,
  conversions REAL NOT NULL DEFAULT 0,
  raw_json TEXT NOT NULL DEFAULT '{}',
  synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider, account_id, campaign_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_ad_platform_campaign_metrics_provider ON ad_platform_campaign_metrics(provider);
CREATE INDEX IF NOT EXISTS idx_ad_platform_campaign_metrics_account_id ON ad_platform_campaign_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_ad_platform_campaign_metrics_campaign_id ON ad_platform_campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_platform_campaign_metrics_metric_date ON ad_platform_campaign_metrics(metric_date);

CREATE TABLE IF NOT EXISTS ad_platform_leads (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  external_lead_id TEXT NOT NULL,
  account_id TEXT,
  form_id TEXT,
  campaign_id TEXT,
  adset_id TEXT,
  ad_id TEXT,
  contact_id TEXT,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  lead_created_at TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}',
  synced_to_contact INTEGER NOT NULL DEFAULT 0,
  synced_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider, external_lead_id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ad_platform_leads_provider ON ad_platform_leads(provider);
CREATE INDEX IF NOT EXISTS idx_ad_platform_leads_contact_id ON ad_platform_leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_ad_platform_leads_campaign_id ON ad_platform_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_platform_leads_email ON ad_platform_leads(email);
CREATE INDEX IF NOT EXISTS idx_ad_platform_leads_lead_created_at ON ad_platform_leads(lead_created_at);

CREATE TABLE IF NOT EXISTS ad_platform_conversion_uploads (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  contact_id TEXT,
  external_click_id TEXT,
  click_id_type TEXT,
  conversion_key TEXT,
  conversion_label TEXT,
  conversion_time TEXT,
  conversion_value REAL,
  currency_code TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'skipped')),
  provider_response_json TEXT NOT NULL DEFAULT '{}',
  error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ad_platform_conversion_uploads_provider ON ad_platform_conversion_uploads(provider);
CREATE INDEX IF NOT EXISTS idx_ad_platform_conversion_uploads_contact_id ON ad_platform_conversion_uploads(contact_id);
CREATE INDEX IF NOT EXISTS idx_ad_platform_conversion_uploads_status ON ad_platform_conversion_uploads(status);
CREATE INDEX IF NOT EXISTS idx_ad_platform_conversion_uploads_created_at ON ad_platform_conversion_uploads(created_at);
