CREATE TABLE IF NOT EXISTS public_interaction_events (
  id TEXT PRIMARY KEY,
  event_id TEXT,
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  source TEXT NOT NULL,
  channel TEXT,
  contact_id TEXT,
  identity_email TEXT,
  identity_phone TEXT,
  session_key TEXT,
  external_ref TEXT,
  page_path TEXT,
  page_location TEXT,
  href TEXT,
  label TEXT,
  referrer TEXT,
  request_ip TEXT,
  user_agent TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_public_interaction_events_event_name ON public_interaction_events(event_name);
CREATE INDEX IF NOT EXISTS idx_public_interaction_events_event_category ON public_interaction_events(event_category);
CREATE INDEX IF NOT EXISTS idx_public_interaction_events_source ON public_interaction_events(source);
CREATE INDEX IF NOT EXISTS idx_public_interaction_events_contact_id ON public_interaction_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_public_interaction_events_identity_email ON public_interaction_events(identity_email);
CREATE INDEX IF NOT EXISTS idx_public_interaction_events_created_at ON public_interaction_events(created_at);

CREATE TABLE IF NOT EXISTS contact_provider_links (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_module TEXT NOT NULL,
  external_id TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'active' CHECK (sync_status IN ('active', 'error', 'pending')),
  last_synced_at TEXT,
  last_error TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (contact_id, provider, provider_module),
  UNIQUE (provider, provider_module, external_id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contact_provider_links_contact_id ON contact_provider_links(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_provider_links_provider ON contact_provider_links(provider);
CREATE INDEX IF NOT EXISTS idx_contact_provider_links_sync_status ON contact_provider_links(sync_status);
CREATE INDEX IF NOT EXISTS idx_contact_provider_links_updated_at ON contact_provider_links(updated_at);
