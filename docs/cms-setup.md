# Blog CMS Setup

## Website Pages and SEO release

The Pages editor is available at `/admin/pages.html`, linked from the existing
Blog dashboard. The integrated candidate is based on Negi's deployed revision
`ddc718d772f8e8d0b41e2a16f5fb66b1db10328c` from
`5rvdigitalagency/necton2026`, with the Pages CMS and image uploads added.
Existing blog code, homepage markup, public scripts, styles, assets and page
content are retained. Invalid JSON-LD syntax in 26 managed templates is
normalized into valid JSON, retaining every schema value; this is required
for the editor to discover their fields.

The integration branch is `integrate/negi-cms-2026-10-26`. Merge the reviewed
candidate into the team's release branch before future releases. Deploying
the older team branch without this integration removes the Pages editor and
its APIs again. A Git push is not staging review or live promotion.

The editor discovers text, headings, links, image URLs and alt text from 42
existing templates, including the homepage and legal/utility pages. It also
supports search titles, descriptions, canonical URLs, indexing settings,
page-specific JSON-LD and registered-page redirects. Layout reordering is not
enabled for these live templates. The Microsoft 365 solution is not registered:
the live baseline has no corresponding template and already redirects that URL.
Shared JavaScript-injected sections and sections missing from a template cannot
be edited here. Empty main content, such as the contact-form template, offers
only SEO fields. Preview disables scripts and form submissions.

Image fields include an upload control for JPEG, PNG, WebP and AVIF files up to
3 MB. Uploads use the authenticated `/api/cms/media` endpoint and the existing
public `blog-media` bucket; the returned image URL is placed in the page draft,
and the separate alt-text field remains editable. Uploaded files are public
immediately, even before a page draft is saved or published, so only upload
images approved for public website use. Preview and Production share storage;
do not upload throwaway test files.

Apply `db/migrations/004_page_cms.sql` only after confirming the intended
Supabase project and existing migration ledger. This creates page workflow
tables and functions; it does not seed or publish pages. Do not rerun it if
already applied. Blog data is not changed by this migration.

Public page rendering follows only the published revision pointer. Unpublished
templates remain unchanged. A database or rendering failure is logged, serves
the original template without caching, and sets `X-CMS-Status: unavailable`.
Healthy HTML is cached for 60 seconds with stale-while-revalidate for 300
seconds. Redirects use a real redirect status and are not cached by the API.
Only site-relative redirects from registered pages are supported; arbitrary
historical aliases and downstream loops outside the registry are not managed.

Run validation using the Vercel project's Node.js 24 runtime:

```sh
node scripts/configure-cms-routes.mjs
node --test test/cms-pages.test.js test/cms-page-renderer.test.js test/cms-page-redirects.test.js test/cms-page-routing.test.js test/cms-public-page.test.js
```

The last verified staging and live deployments share a Supabase project.
Do not publish test content, apply migrations or test publication on staging
until Preview uses a separate project. A preview deployment alone does not
isolate CMS data. Do not promote this release without staging review and
explicit owner approval.

Pages use the "Publish approved page" action after reviewer approval.
Reviewers may approve their own saved revisions: Save draft, Preview draft,
Approve, then Publish approved page. Sending for review is optional for reviewers;
editors must submit their drafts for a reviewer to approve and publish.
Blog approval and scheduling also permit reviewers' own revisions.
Existing accounts and roles are retained; there is no new super-admin role.
The editor explains missing reviewer actions and confirms publication
before sending the workflow request. Publishing changes the shared database's
published revision pointer, not a Vercel deployment. It affects both live and
staging when they share that database, regardless of `VERCEL_ENV`; the editor
must never claim this is staging-only based on a Preview deployment label.
Public caches may take several minutes to refresh after publication.

### Pages editor controls

Pages and Blog share accessible, branded dialogs (`admin/dialogs.js` and
`admin/dialogs.css`) with plain-language titles, named actions and consistent
spacing. Confirmations distinguish publishing, discarding changes and signing
out. Destructive confirmations initially focus the safe action. Escape cancels,
focus returns to the previous control, and queued dialogs never overlap.
Link, button and image-description prompts use labelled fields rather than
browser prompts. Article deletion names the article and explains that every
revision, including the public version, is removed. Errors remain visible with
an explicit close action or an inline recovery instruction. Browser-controlled
leave-page warnings cannot be restyled and remain native to protect unsaved work.

- Sign in directly at `/admin/pages` with the same account used for Blog. Session
  refresh is checked before requests; expiry locks fields and exposes **Sign in
  again**. Unsaved fields and section order are stored in this tab's
  `sessionStorage`, scoped to the CMS user and page, without credentials.
  Reopening offers restore/discard; a changed server revision or removed template
  fields is reported. Browser storage can be unavailable, so keep the tab open
  when the editor reports a recovery-storage error.
- Search and status filters narrow the grouped page library. The library scrolls
  independently on desktop; content groups collapse and have section jump links.
  Decorative text glyphs are hidden from the form but preserved in saved content.
  Counters appear only near a text field's limit, never under selects.
- Published, approved and in-review revisions are read-only until **Edit (new
  draft)**. This unlocks editing without writing to the database. **Save draft**
  creates a new revision; it does not change the published pointer. In-app page
  changes and closing the editor confirm discarding unsaved changes.
- Each image has a thumbnail and nearby upload guidance. Uploads are public
  immediately, independent of saving or publishing; the public image changes
  only when its new URL is published. Thumbnails use the actual supplied image
  URL, not a fabricated alternate-format fallback. Empty alt text prompts an
  accurate description or explicit decorative choice. Portrait identities are
  never guessed. Suggested copy corrections require an editor's click and follow
  the normal save/review/publish process; templates are not silently rewritten.
- Canonical URLs, search indexing, JSON-LD and redirects are in a collapsed
  reviewer-only Advanced panel. The save API also rejects editor changes and
  preserves protected values if omitted. JSON must parse before saving;
  changed advanced settings require confirmation. Redirect status is disabled
  when there is no redirect. Review/publication warns about noindex, redirects,
  empty alt text and heading structure rather than silently blocking legacy
  templates.
- Link fields offer registered site pages. Changed internal destinations match
  normalized registry paths or are checked with a bounded HEAD request, allowing
  legitimate resources and blog routes outside the Pages registry. A failed
  response requires confirmation; a network failure must be resolved before
  saving. Existing unchanged links are not repeatedly probed.
- **Preview draft** opens alongside the form on wide screens and below it on
  smaller screens. Phone, tablet and desktop iframe widths are available.
  Highlighted blocks support click or Tab/Enter to focus their field; editing
  marks the preview out of date until refreshed. Scripts, form submission and
  nested frames are disabled. The iframe allows same-origin DOM access only,
  not scripts; this is needed for parent-controlled selection.
- **History & compare** reads page-scoped, 20-item revision history without
  overwriting unsaved fields. It identifies the current published pointer,
  authors, reviewers and notes. Compare two saved revisions or a revision
  against current editor values, including section-order changes. History is
  authenticated and sent with `Cache-Control: no-store`; there is no one-click
  restoration or automatic publishing.

Run the focused automated regression suite with Node 24:

```sh
node --test test/cms-page-editor.test.js test/cms-page-editing.test.js \
  test/cms-page-history.test.js test/cms-page-renderer.test.js \
  test/cms-pages.test.js test/cms-reviewer-workflow.test.js \
  test/cms-page-redirects.test.js test/cms-page-routing.test.js \
  test/cms-public-page.test.js
```

For manual UI checks, `node scripts/cms-page-editor-fixture.mjs` prints a localhost
URL. It serves an in-memory About page and test sign-in, never contacting Supabase
or publishing real content. It initially uses a reviewer; set localStorage
`test-role` to `editor` and reload to check editor controls. In its browser
console, `window.__cmsTestAuth.expire()` simulates session expiry. Verify draft
recovery, published-to-draft editing, section jumps, upload hints, preview
selection and history comparison at 375, 768 and 1168 pixels. Stop the fixture
when finished. If sandbox policy blocks localhost listeners, report browser
checks as blocked rather than claiming visual verification.

Apply `db/migrations/005_reviewer_self_approval.sql` to the verified CMS database
before deploying the self-approval UI. This replaces only the page transition
function, enforces active CMS roles, and preserves status checks and audit events.
It does not change accounts, drafts, or published pointers. Do not rerun earlier
migrations. The migration runner records this file in `cms_schema_migrations`.

Routing configuration is generated from the registry. After changing registered
paths, run `node scripts/configure-cms-routes.mjs --write`. Existing blog rewrites,
redirects and public assets must remain unchanged.

The CMS is intentionally additive. Do not enable public blog route rewrites until
the imported database content passes the parity checks in the implementation plan.

## Required services

1. Use the existing Supabase project for Postgres, authentication and storage.
2. Enable email/password and Google login in Supabase Authentication.
3. Create a public Supabase Storage bucket named `blog-media`.
4. Add local, staging and production `/admin` URLs under Supabase Authentication
   URL Configuration.

## Environment variables

Add the names in `.env.example` with `vercel env add <name> <environment>` for
development, preview, and production. Use a separate Supabase project for staging before testing writes or publishing.
Retrieve local development values only with `vercel env pull .env.local`.

## Roles

The first reviewer must be seeded after their Supabase Auth user ID is known:

```sql
INSERT INTO cms_users (supabase_user_id, email, display_name, role)
VALUES ('auth-user-uuid', 'reviewer@network-consultancy.com', 'Reviewer', 'reviewer');
```

Editors use the same statement with `role = 'editor'`. Editors cannot approve,
publish, or schedule revisions. Reviewers can perform those actions on their own
revisions or another author's; `reviewed_by` and audit events record the actor.

## Initial import

Run the non-mutating validation first:

```sh
npm run cms:import:check
```

Run `db/migrations/001_blog_cms.sql` through the Supabase SQL Editor after the
project is connected. Then use the generated baseline as the reviewed input to the
transactional database importer.