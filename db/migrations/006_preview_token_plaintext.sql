-- Store the raw token alongside its hash so an already-issued preview link can be
-- re-displayed to editors (e.g. after they closed the dialog) without minting a new one.
ALTER TABLE cms_preview_tokens ADD COLUMN IF NOT EXISTS token TEXT;
