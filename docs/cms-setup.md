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