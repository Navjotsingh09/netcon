ALTER TABLE blog_posts
  ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN featured_rank SMALLINT,
  ADD CONSTRAINT blog_posts_featured_rank_check
    CHECK (featured_rank IS NULL OR featured_rank > 0);

CREATE UNIQUE INDEX blog_posts_featured_rank_idx
  ON blog_posts (featured_rank)
  WHERE is_featured = TRUE AND archived_at IS NULL;