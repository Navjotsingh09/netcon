-- Run only against an isolated test database with migrations 001 through 005.
BEGIN;
DO $$
DECLARE
  reviewer_id UUID := gen_random_uuid();
  editor_id UUID := gen_random_uuid();
  inactive_id UUID := gen_random_uuid();
  test_page_id UUID;
  test_revision_id UUID;
  source_status post_revision_status;
  result JSONB;
BEGIN
  INSERT INTO auth.users (id) VALUES (reviewer_id), (editor_id), (inactive_id);
  INSERT INTO cms_users (id, supabase_user_id, email, display_name, role, is_active)
  VALUES
    (reviewer_id, reviewer_id, 'reviewer@test.invalid', 'Reviewer', 'reviewer', TRUE),
    (editor_id, editor_id, 'editor@test.invalid', 'Editor', 'editor', TRUE),
    (inactive_id, inactive_id, 'inactive@test.invalid', 'Inactive', 'reviewer', FALSE);
  INSERT INTO cms_pages (slug, canonical_path, title)
  VALUES ('self-approval-test', '/self-approval-test', 'Self approval test')
  RETURNING id INTO test_page_id;

  FOREACH source_status IN ARRAY ARRAY['draft', 'changes_requested', 'in_review']::post_revision_status[]
  LOOP
    INSERT INTO cms_page_revisions (page_id, revision_number, status, content, created_by)
    VALUES (test_page_id, 1, source_status, '{}', reviewer_id)
    RETURNING id INTO test_revision_id;
    result := cms_transition_page_revision('self-approval-test', test_revision_id, reviewer_id, 'approve', 'Checked');
    IF result->>'status' <> 'approved' OR NOT EXISTS (
      SELECT 1 FROM cms_page_revisions WHERE id = test_revision_id AND reviewed_by = reviewer_id
    ) OR NOT EXISTS (
      SELECT 1 FROM cms_page_audit_events WHERE revision_id = test_revision_id
        AND actor_id = reviewer_id AND action = 'approved'
    ) THEN
      RAISE EXCEPTION 'Self approval did not preserve reviewer and audit';
    END IF;
    IF (SELECT published_revision_id FROM cms_pages WHERE id = test_page_id) IS NOT NULL THEN
      RAISE EXCEPTION 'Approval unexpectedly published content';
    END IF;
    DELETE FROM cms_page_audit_events WHERE revision_id = test_revision_id;
    DELETE FROM cms_page_revisions WHERE id = test_revision_id;
  END LOOP;

  INSERT INTO cms_page_revisions (page_id, revision_number, status, content, created_by)
  VALUES (test_page_id, 1, 'draft', '{}', editor_id)
  RETURNING id INTO test_revision_id;
  BEGIN
    PERFORM cms_transition_page_revision('self-approval-test', test_revision_id, editor_id, 'approve');
    RAISE EXCEPTION 'Editor was allowed to approve';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  BEGIN
    PERFORM cms_transition_page_revision('self-approval-test', test_revision_id, inactive_id, 'approve');
    RAISE EXCEPTION 'Inactive reviewer was allowed to approve';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  BEGIN
    PERFORM cms_publish_page_revision('self-approval-test', test_revision_id, reviewer_id);
    RAISE EXCEPTION 'Unapproved draft was published';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  PERFORM cms_transition_page_revision('self-approval-test', test_revision_id, editor_id, 'submit_for_review');
  PERFORM cms_transition_page_revision('self-approval-test', test_revision_id, reviewer_id, 'request_changes');
  PERFORM cms_transition_page_revision('self-approval-test', test_revision_id, reviewer_id, 'approve');
  PERFORM cms_publish_page_revision('self-approval-test', test_revision_id, reviewer_id);
  IF (SELECT published_revision_id FROM cms_pages WHERE id = test_page_id) <> test_revision_id THEN
    RAISE EXCEPTION 'Approved publication did not update published pointer';
  END IF;
  BEGIN
    PERFORM cms_transition_page_revision('self-approval-test', test_revision_id, reviewer_id, 'approve');
    RAISE EXCEPTION 'Published revision was reapproved';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
END;
$$;
ROLLBACK;
