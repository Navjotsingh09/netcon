CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  canonical_path TEXT NOT NULL,
  title TEXT NOT NULL,
  published_revision_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cms_page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE RESTRICT,
  revision_number INTEGER NOT NULL CHECK (revision_number > 0),
  status post_revision_status NOT NULL DEFAULT 'draft',
  content JSONB NOT NULL,
  created_by UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (page_id, revision_number)
);

ALTER TABLE cms_pages
  ADD CONSTRAINT cms_pages_published_revision_fk
  FOREIGN KEY (published_revision_id)
  REFERENCES cms_page_revisions(id)
  ON DELETE RESTRICT;

CREATE TABLE cms_page_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES cms_pages(id) ON DELETE SET NULL,
  revision_id UUID REFERENCES cms_page_revisions(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES cms_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX cms_page_revisions_page_status_idx
  ON cms_page_revisions (page_id, status, revision_number DESC);
CREATE INDEX cms_page_audit_events_page_idx
  ON cms_page_audit_events (page_id, created_at DESC);

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_audit_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON cms_pages, cms_page_revisions, cms_page_audit_events FROM anon, authenticated;
GRANT ALL ON cms_pages, cms_page_revisions, cms_page_audit_events TO service_role;

CREATE OR REPLACE FUNCTION cms_save_page_draft(
  p_slug TEXT,
  p_path TEXT,
  p_title TEXT,
  p_content JSONB,
  p_actor_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  target_page_id UUID;
  next_revision_number INTEGER;
  created_revision cms_page_revisions%ROWTYPE;
BEGIN
  INSERT INTO cms_pages (slug, canonical_path, title)
  VALUES (p_slug, p_path, p_title)
  ON CONFLICT (slug) DO UPDATE
    SET canonical_path = EXCLUDED.canonical_path,
        title = EXCLUDED.title,
        updated_at = NOW()
  RETURNING id INTO target_page_id;

  PERFORM 1 FROM cms_pages WHERE id = target_page_id FOR UPDATE;
  SELECT COALESCE(MAX(revision_number), 0) + 1
    INTO next_revision_number
    FROM cms_page_revisions
   WHERE page_id = target_page_id;

  INSERT INTO cms_page_revisions (page_id, revision_number, status, content, created_by)
  VALUES (target_page_id, next_revision_number, 'draft', p_content, p_actor_id)
  RETURNING * INTO created_revision;

  INSERT INTO cms_page_audit_events (page_id, revision_id, actor_id, action)
  VALUES (target_page_id, created_revision.id, p_actor_id, 'draft_created');

  RETURN to_jsonb(created_revision);
END;
$$;

CREATE OR REPLACE FUNCTION cms_transition_page_revision(
  p_slug TEXT,
  p_revision_id UUID,
  p_actor_id UUID,
  p_action TEXT,
  p_reviewer_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  target_page_id UUID;
  target_revision cms_page_revisions%ROWTYPE;
  next_status post_revision_status;
  audit_action TEXT;
  is_review_action BOOLEAN := FALSE;
BEGIN
  SELECT id INTO target_page_id
    FROM cms_pages
   WHERE slug = p_slug
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Page does not exist' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO target_revision
    FROM cms_page_revisions
   WHERE id = p_revision_id
     AND page_id = target_page_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Page revision does not exist' USING ERRCODE = 'P0002';
  END IF;

  CASE p_action
    WHEN 'submit_for_review' THEN
      IF target_revision.status NOT IN ('draft', 'changes_requested') THEN
        RAISE EXCEPTION 'Page revision cannot be submitted' USING ERRCODE = '22023';
      END IF;
      next_status := 'in_review';
      audit_action := 'submitted_for_review';
    WHEN 'request_changes' THEN
      IF target_revision.status <> 'in_review' OR target_revision.created_by = p_actor_id THEN
        RAISE EXCEPTION 'Page revision cannot be returned for changes' USING ERRCODE = '22023';
      END IF;
      next_status := 'changes_requested';
      audit_action := 'changes_requested';
      is_review_action := TRUE;
    WHEN 'approve' THEN
      IF target_revision.status <> 'in_review' OR target_revision.created_by = p_actor_id THEN
        RAISE EXCEPTION 'Page revision cannot be approved' USING ERRCODE = '22023';
      END IF;
      next_status := 'approved';
      audit_action := 'approved';
      is_review_action := TRUE;
    WHEN 'publish_live' THEN
      IF target_revision.status NOT IN ('draft', 'changes_requested') THEN
        RAISE EXCEPTION 'Page revision cannot be published directly' USING ERRCODE = '22023';
      END IF;
      next_status := 'approved';
      audit_action := 'published_to_live_requested';
      is_review_action := TRUE;
    ELSE
      RAISE EXCEPTION 'Unsupported page workflow action' USING ERRCODE = '22023';
  END CASE;

  UPDATE cms_page_revisions
     SET status = next_status,
         reviewer_notes = p_reviewer_notes,
         reviewed_by = CASE WHEN is_review_action THEN p_actor_id ELSE NULL END,
         updated_at = NOW()
   WHERE id = target_revision.id
  RETURNING * INTO target_revision;

  INSERT INTO cms_page_audit_events (page_id, revision_id, actor_id, action, detail)
  VALUES (
    target_page_id,
    target_revision.id,
    p_actor_id,
    audit_action,
    jsonb_build_object('reviewerNotes', p_reviewer_notes)
  );

  RETURN jsonb_build_object(
    'id', target_revision.id,
    'revision_number', target_revision.revision_number,
    'status', target_revision.status,
    'created_by', target_revision.created_by,
    'updated_at', target_revision.updated_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION cms_publish_page_revision(p_slug TEXT, p_revision_id UUID, p_actor_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  target_page_id UUID;
  target_revision cms_page_revisions%ROWTYPE;
BEGIN
  SELECT id INTO target_page_id
    FROM cms_pages
   WHERE slug = p_slug
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Page does not exist' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO target_revision
    FROM cms_page_revisions
   WHERE id = p_revision_id
     AND page_id = target_page_id
   FOR UPDATE;

  IF NOT FOUND OR target_revision.status <> 'approved' THEN
    RAISE EXCEPTION 'Page revision is not approved for publication'
      USING ERRCODE = '22023';
  END IF;

  UPDATE cms_page_revisions
     SET status = 'archived', updated_at = NOW()
   WHERE page_id = target_page_id
     AND status = 'published'
     AND id <> target_revision.id;

  UPDATE cms_page_revisions
     SET status = 'published',
         published_at = COALESCE(published_at, NOW()),
         updated_at = NOW()
   WHERE id = target_revision.id;

  UPDATE cms_pages
     SET published_revision_id = target_revision.id,
         updated_at = NOW()
   WHERE id = target_page_id;

  INSERT INTO cms_page_audit_events (page_id, revision_id, actor_id, action)
  VALUES (target_page_id, target_revision.id, p_actor_id, 'published');

  RETURN target_revision.id;
END;
$$;

REVOKE EXECUTE ON FUNCTION cms_save_page_draft(TEXT, TEXT, TEXT, JSONB, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION cms_transition_page_revision(TEXT, UUID, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION cms_publish_page_revision(TEXT, UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION cms_save_page_draft(TEXT, TEXT, TEXT, JSONB, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION cms_transition_page_revision(TEXT, UUID, UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION cms_publish_page_revision(TEXT, UUID, UUID) TO service_role;
