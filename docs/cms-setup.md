# CMS Setup and Staging

The CMS uses Supabase Authentication and Postgres. Blog editing is available at
`/admin`; the Pages editor is at `/admin/pages.html`. It supports the homepage
and the public marketing pages registered in `lib/cms/pages.js` (About, Contact,
Services, Solutions, Industries, Resources, and Case Studies). On those pages,
the team can edit visible copy, links, and search metadata without changing
their layout or media. Blog articles remain managed through the Blog editor;
legal and utility pages are not part of the Pages editor.

Page changes use the same draft, review, and publish workflow as the homepage.
Pages without a published CMS revision continue to use their existing static
HTML. The page templates load published revisions through `js/page-cms.js`.

## Environment safety

- Vercel Preview and Production must use separate Supabase projects and separate
  credentials. Verify the project used by a deployment before changing its
  database.
- Develop and test CMS changes on the permanent staging site,
  `https://netcon-ivory.vercel.app`. Publishing from its CMS changes the staging
  database/site only.
- Do not apply migrations or import content to Production as part of staging
  work. The live Blog CMS also depends on its Production Supabase project being
  available.
- Never commit `.env` files or include their values in logs, screenshots, or
  support messages.

## Authentication and roles

The admin uses Supabase email/password sign-in. After creating the Supabase Auth
user, grant CMS access by inserting their Supabase user ID into `cms_users`:

```sql
INSERT INTO cms_users (supabase_user_id, email, display_name, role)
VALUES ('auth-user-uuid', 'editor@example.com', 'Editor Name', 'editor');
```

Use `role = 'reviewer'` for reviewers. Reviewers can edit, approve, publish,
schedule, archive, and delete articles. Editors can create and submit drafts for
review. A reviewer cannot approve their own submitted revision.

## Environment variables

Configure the required Supabase URL, publishable key, and service-role key
separately for Preview and Production in Vercel. The service-role key is
server-only and must never be exposed to browser code. Use
`vercel env pull .env.local` only for local development; keep that file
uncommitted.

## Database migrations

The ordered SQL migrations are in `db/migrations/`. Apply them only to the
intended Supabase project. The migration runner requires a `DATABASE_URL` for
that exact project:

```sh
node scripts/run-cms-migrations.mjs
```

The Pages pilot migration is `004_page_cms.sql`. It creates page revisions and
workflow/audit tables and functions; it does not seed or publish page content.
Confirm the migration ledger and target project before running or re-running
database changes. Do not run the staging migration against Production.

## Existing blog content

The Blog editor uses paragraph blocks for new text. On save, editor-generated
`div` blocks and unwrapped inline article text are normalised to `<p>` elements;
headings, lists, links, images, and existing paragraphs retain their structure.
The same normalisation runs when serving CMS articles, so older posts with
unwrapped text do not need to be republished or migrated to receive paragraph
markup. The editor preview also wraps these paragraphs.

Check that the static blog content can be imported before performing any
database writes:

```sh
npm run cms:import:check
```

`npm run cms:import:write` writes a reviewed baseline report. The separate
`npm run cms:import:supabase` command mutates the Supabase database; only run it
after verifying the target project and reviewing the baseline. It requires
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the uncommitted local
environment file.

## Staging release

Follow [the release guardrails](./netcon-release-guardrails.md) for every
deployment. The required flow is a clean, identified commit deployed as a
Vercel Preview, then aliased to the permanent staging URL. Do not deploy with
`vercel --prod` or promote to live without explicit owner approval.
