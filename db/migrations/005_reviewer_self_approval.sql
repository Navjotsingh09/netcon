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
  actor_role cms_role;
BEGIN
  SELECT role INTO actor_role FROM cms_users
   WHERE id = p_actor_id AND is_active = TRUE
   FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'An active CMS account is required' USING ERRCODE = '22023';
  END IF;
  IF p_action IS DISTINCT FROM 'submit_for_review' AND actor_role <> 'reviewer' THEN
    RAISE EXCEPTION 'A reviewer is required for this action' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO target_page_id FROM cms_pages
   WHERE slug = p_slug FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Page does not exist' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO target_revision FROM cms_page_revisions
   WHERE id = p_revision_id AND page_id = target_page_id FOR UPDATE;
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
      IF target_revision.status <> 'in_review' THEN
        RAISE EXCEPTION 'Page revision cannot be returned for changes' USING ERRCODE = '22023';
      END IF;
      next_status := 'changes_requested';
      audit_action := 'changes_requested';
      is_review_action := TRUE;
    WHEN 'approve' THEN
      IF target_revision.status NOT IN ('draft', 'changes_requested', 'in_review') THEN
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
  VALUES (target_page_id, target_revision.id, p_actor_id, audit_action,
          jsonb_build_object('reviewerNotes', p_reviewer_notes));

  RETURN jsonb_build_object(
    'id', target_revision.id,
    'revision_number', target_revision.revision_number,
    'status', target_revision.status,
    'created_by', target_revision.created_by,
    'updated_at', target_revision.updated_at
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION cms_transition_page_revision(TEXT, UUID, UUID, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION cms_transition_page_revision(TEXT, UUID, UUID, TEXT, TEXT)
  TO service_role;
