-- WhatsApp Intelligence core (CRM interno)
CREATE TABLE IF NOT EXISTS customers (
  phone TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  preferences TEXT NOT NULL DEFAULT '{}',
  last_visit TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wa_inbound_events (
  id TEXT PRIMARY KEY,
  external_message_id TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  source_timestamp TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wa_conversations (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  external_message_id TEXT,
  message_in TEXT NOT NULL,
  message_out TEXT NOT NULL,
  llama_actions TEXT NOT NULL DEFAULT '[]',
  llama_raw_response TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wa_action_logs (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_payload TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wa_reservation_requests (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  customer_name TEXT,
  requested_date TEXT,
  requested_time TEXT,
  requested_people INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processed', 'cancelled')),
  source TEXT NOT NULL DEFAULT 'llama',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wa_conversations_phone ON wa_conversations(phone);
CREATE INDEX IF NOT EXISTS idx_wa_conversations_created_at ON wa_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_wa_action_logs_phone ON wa_action_logs(phone);
CREATE INDEX IF NOT EXISTS idx_wa_action_logs_status ON wa_action_logs(status);
CREATE INDEX IF NOT EXISTS idx_wa_reservation_requests_status ON wa_reservation_requests(status);
