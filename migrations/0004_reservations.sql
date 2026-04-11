PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  reservation_code TEXT NOT NULL UNIQUE,
  reservation_date TEXT NOT NULL,
  reservation_time TEXT NOT NULL,
  meal_period TEXT NOT NULL CHECK (meal_period IN ('lunch', 'dinner')),
  customer_full_name TEXT NOT NULL,
  reservation_for_type TEXT NOT NULL CHECK (reservation_for_type IN ('self', 'other')),
  reserved_person_name TEXT,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  guest_count_mode TEXT NOT NULL DEFAULT 'exact' CHECK (guest_count_mode IN ('exact', 'approximate')),
  has_children INTEGER NOT NULL DEFAULT 0 CHECK (has_children IN (0, 1)),
  dietary_restriction_type TEXT NOT NULL CHECK (dietary_restriction_type IN ('none', 'lactose', 'vegan', 'celiac', 'other')),
  dietary_restriction_notes TEXT,
  seating_preference TEXT NOT NULL CHECK (seating_preference IN ('entry', 'middle', 'kids_space', 'stage', 'no_preference')),
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  is_existing_customer INTEGER NOT NULL DEFAULT 0 CHECK (is_existing_customer IN (0, 1)),
  discovery_source TEXT CHECK (discovery_source IN ('google', 'social', 'referral', 'already_customer')),
  notes TEXT,
  tolerance_policy_text TEXT NOT NULL,
  google_calendar_event_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired', 'completed')),
  request_ip TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_time ON reservations(reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_name ON reservations(customer_full_name);
CREATE INDEX IF NOT EXISTS idx_reservations_whatsapp ON reservations(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_reservations_code ON reservations(reservation_code);
CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations(reservation_date, reservation_time);

CREATE TABLE IF NOT EXISTS reservation_logs (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reservation_logs_reservation_id ON reservation_logs(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_logs_event_type ON reservation_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_reservation_logs_status ON reservation_logs(status);
CREATE INDEX IF NOT EXISTS idx_reservation_logs_created_at ON reservation_logs(created_at);
