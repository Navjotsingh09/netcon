# Blog CMS Setup

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
development, preview, and production. Use a separate Supabase project for staging
when available. Retrieve local development values only with `vercel env pull .env.local`.

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

## URL redirects (CMS "URL redirects" field)

Each page's "URL redirects" field in the CMS is stored in Supabase but is **not**
read by anything on the live site by itself -- Vercel only honours the static
`redirects` array in `vercel.json`, evaluated at deploy time. A redirect entered
in the CMS has no effect until it is synced into `vercel.json` and deployed:

```sh
vercel env pull .env.local        # once, or whenever env vars rotate
npm run cms:redirects:check       # dry run -- shows what would change
npm run cms:redirects:write       # writes vercel.json + db/cms-redirects.generated.json
```

Then commit both changed files and go through the normal staging → live deploy
flow. The script only ever touches redirect rules it previously generated itself
(tracked in `db/cms-redirects.generated.json`) -- hand-written entries already in
`vercel.json` are left untouched unless a CMS page defines a redirect with the
same source path.

Each line in the CMS field must be `/old-path -> /new-path`; malformed or no-op
lines are skipped with a warning instead of failing the whole sync.
