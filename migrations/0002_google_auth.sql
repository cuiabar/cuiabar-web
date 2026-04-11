ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'local_password';
ALTER TABLE users ADD COLUMN google_subject TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_subject ON users(google_subject);
