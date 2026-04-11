ALTER TABLE campaigns ADD COLUMN total_opened INTEGER NOT NULL DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN total_open_events INTEGER NOT NULL DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN total_unique_opens INTEGER NOT NULL DEFAULT 0;

ALTER TABLE campaign_recipients ADD COLUMN opened_at TEXT;

CREATE TABLE IF NOT EXISTS campaign_open_events (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  request_ip TEXT,
  user_agent TEXT,
  referer TEXT,
  is_unique INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES campaign_recipients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campaign_open_events_campaign_id ON campaign_open_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_open_events_contact_id ON campaign_open_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_open_events_recipient_id ON campaign_open_events(recipient_id);
CREATE INDEX IF NOT EXISTS idx_campaign_open_events_created_at ON campaign_open_events(created_at);
