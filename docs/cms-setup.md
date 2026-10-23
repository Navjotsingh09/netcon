# Blog CMS Setup

## Website Pages and SEO release

The Pages editor is available at `/admin/pages.html`, linked from the existing
Blog dashboard. This candidate is based on the exact live revision
`8b21a89408821f90bd05cf211d2fc7b4a501f8e9`; it does not replace the existing blog
editor, blog APIs, homepage template or shared public scripts.

The editor discovers text, headings, links, image URLs and alt text from 42
existing templates, including the homepage and legal/utility pages. It also
supports search titles, descriptions, canonical URLs, indexing settings,
page-specific JSON-LD and registered-page redirects. Layout reordering is not
enabled for these live templates. The Microsoft 365 solution is not registered:
the live baseline has no corresponding template and already redirects that URL.
Shared JavaScript-injected sections and sections missing from a template cannot
be edited here. Empty main content, such as the contact-form template, offers
only SEO fields. Preview disables scripts and form submissions.

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
INSERT INTO cms_users (clerk_user_id, email, display_name, role)
VALUES ('auth-user-uuid', 'reviewer@network-consultancy.com', 'Reviewer', 'reviewer');
```

Editors use the same statement with `role = 'editor'`. The API enforces that an
editor cannot approve or publish their own revision.

## Initial import

Run the non-mutating validation first:

```sh
npm run cms:import:check
```

Run `db/migrations/001_blog_cms.sql` through the Supabase SQL Editor after the
project is connected. Then use the generated baseline as the reviewed input to the
transactional database importer.