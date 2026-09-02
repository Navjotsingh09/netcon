CREATE TYPE cms_role AS ENUM ('editor', 'reviewer');
CREATE TYPE post_revision_status AS ENUM (
  'draft',
  'in_review',
  'changes_requested',
  'approved',
  'scheduled',
  'published',
  'archived'
);

CREATE TABLE cms_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role cms_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_slug TEXT NOT NULL UNIQUE CHECK (public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  published_revision_id UUID,
  first_published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE RESTRICT,
  revision_number INTEGER NOT NULL CHECK (revision_number > 0),
  status post_revision_status NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL CHECK (char_length(title) <= 180),
  excerpt TEXT NOT NULL CHECK (char_length(excerpt) <= 360),
  category TEXT NOT NULL CHECK (char_length(category) <= 80),
  article_html TEXT NOT NULL,
  featured_image_url TEXT NOT NULL,
  featured_image_alt TEXT NOT NULL,
  seo_title TEXT NOT NULL CHECK (char_length(seo_title) <= 180),
  seo_description TEXT NOT NULL CHECK (char_length(seo_description) <= 360),
  canonical_url TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_by UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, revision_number),
  CHECK (
    (status = 'scheduled' AND scheduled_for IS NOT NULL)
    OR (status <> 'scheduled')
  )
);

ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_published_revision_fk
  FOREIGN KEY (published_revision_id) REFERENCES blog_revisions(id) ON DELETE RESTRICT;

CREATE TABLE blog_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blob_url TEXT NOT NULL UNIQUE,
  blob_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  width INTEGER CHECK (width > 0),
  height INTEGER CHECK (height > 0),
  alt_text TEXT NOT NULL DEFAULT '',
  uploaded_by UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  revision_id UUID REFERENCES blog_revisions(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX blog_revisions_post_status_idx ON blog_revisions (post_id, status, updated_at DESC);
CREATE INDEX blog_revisions_schedule_idx ON blog_revisions (scheduled_for) WHERE status = 'scheduled';
CREATE INDEX blog_audit_events_post_idx ON blog_audit_events (post_id, created_at DESC);