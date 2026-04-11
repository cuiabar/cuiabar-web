-- Base usada no sprint do CMS nativo do blog em Cloudflare D1
-- Espelho de migrations/0005_cloudflare_native_blog.sql

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Blog',
  eyebrow TEXT NOT NULL DEFAULT 'Editorial',
  read_time TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT NOT NULL DEFAULT '',
  keywords_json TEXT NOT NULL DEFAULT '[]',
  sections_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at TEXT,
  scheduled_at TEXT,
  created_by_email TEXT,
  updated_by_email TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_at ON blog_posts(status, scheduled_at);

CREATE TABLE IF NOT EXISTS blog_media_assets (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  public_url TEXT NOT NULL,
  uploaded_by_email TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_media_created_at ON blog_media_assets(created_at DESC);
