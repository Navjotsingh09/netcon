CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL UNIQUE CHECK (page_slug IN ('home', 'about', 'contact')),
  published_revision_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cms_page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL CHECK (revision_number > 0),
  status post_revision_status NOT NULL DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (page_id, revision_number)
);

ALTER TABLE cms_pages
  ADD CONSTRAINT cms_pages_published_revision_fk
  FOREIGN KEY (published_revision_id) REFERENCES cms_page_revisions(id) ON DELETE RESTRICT;

CREATE INDEX cms_page_revisions_page_status_idx
  ON cms_page_revisions (page_id, status, updated_at DESC);

CREATE TABLE cms_site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  published_revision_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cms_site_setting_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_number INTEGER NOT NULL CHECK (revision_number > 0),
  status post_revision_status NOT NULL DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (revision_number)
);

ALTER TABLE cms_site_settings
  ADD CONSTRAINT cms_site_settings_published_revision_fk
  FOREIGN KEY (published_revision_id) REFERENCES cms_site_setting_revisions(id) ON DELETE RESTRICT;