CREATE TABLE cms_preview_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL CHECK (page_slug IN ('home', 'about', 'contact')),
  revision_id UUID NOT NULL REFERENCES cms_page_revisions(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  revoked_at TIMESTAMPTZ,
  created_by UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX cms_preview_tokens_lookup_idx ON cms_preview_tokens (token_hash, expires_at) WHERE revoked_at IS NULL;
