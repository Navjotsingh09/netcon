# NetCon Release Guardrails

**Purpose:** Keep Network Consultancy staging and live releases traceable, reviewable, and safe. This document applies to the owner, the India-based developer, the wider team, and any automation or AI agent working in this repository.

## Core Rule

No one deploys the current working folder by default.

A deployment must come from one explicitly identified, committed Git revision in a clean working tree. A dirty workspace, an unclear branch, or mixed work from multiple people is a hard stop.

## Environments

- **Live:** `https://network-consultancy.com` and `https://www.network-consultancy.com`
- **Staging:** `https://netcon-ivory.vercel.app`

Staging may be one approved change ahead of live while it is being reviewed. When there is no pending review, staging and live must point to the same approved deployment/content.

Live is never rebuilt separately from staging. Live is promoted from the exact deployment that was reviewed on staging.

## Ownership and Branches

- **Navjot Singh is the senior developer, repository owner, and release approver.** Navjot controls release selection, staging replacement, and promotion to live.
- **Negi is a junior developer on the India development team.** Negi may commit and push her work on her own branch for staging review, but her branch is never deployed implicitly and cannot promote to live without Navjot's explicit approval.
- Navjot may also commit and push work for staging review on his own branch.
- A developer branch is not automatically a live branch.
- A branch name, author, or remote does not by itself authorise deployment.
- Do not merge, rebase, reset, switch branches, or resolve conflicts unless the owner explicitly requests it.
- Do not deploy a different developer's branch simply because it is the newest branch or commit.

Each staging candidate must identify:

- branch name;
- commit SHA;
- author/contributor;
- purpose or ticket;
- files in scope;
- reviewer;
- staging deployment URL and deployment ID.

## Clean-Tree Gate

Before staging or live work, run:

```sh
git branch --show-current
git rev-parse --short HEAD
git status --short
```

The tree must be clean. This means no modified, deleted, staged, untracked, or generated files outside the selected commit.

If the tree is dirty:

1. Stop.
2. Do not deploy.
3. Do not stash, reset, clean, or delete files automatically.
4. Ask the owner which changes belong to the candidate.
5. Create or use a clean worktree from the approved commit.

A clean deployment worktree should be created outside the active editing folder when necessary:

```sh
git worktree add "$TMPDIR/netcon-release-<sha>" <approved-branch-or-sha>
cd "$TMPDIR/netcon-release-<sha>"
git status --short
```

The final `git status --short` must print nothing.

## Staging Release Flow

Only after the clean-tree gate passes:

```sh
vercel deploy
vercel alias set <preview-deployment-url> netcon-ivory.vercel.app
```

Record the preview URL, deployment ID, commit SHA, branch, timestamp, and reviewer in the release log or pull request.

Never use `vercel --prod`.

Never alias a preview directly to `network-consultancy.com` or `www.network-consultancy.com`.

Never overwrite staging with a different branch during an active review unless the owner explicitly approves replacing the candidate.

## Review and Promotion

The reviewer checks the staging URL, not a local file and not an unrelated preview URL. Review should include the changed pages, navigation, forms, responsive layouts, redirects, and any relevant asset/network requests.

A staging candidate remains the active candidate until one of these happens:

- the owner requests another staging candidate to replace it;
- the owner rejects it and identifies the replacement commit;
- the owner explicitly approves promotion.

Promotion requires explicit wording from the owner such as **go live**, **promote this staging build**, or **finalize this deployment**. Approval to deploy to staging is not approval to go live.

Promote the exact reviewed deployment:

```sh
vercel promote <reviewed-preview-deployment-id-or-url>
```

Do not rebuild between review and promotion.

## Synchronisation Rule

When staging has no pending changes, verify that staging and live are on the same approved deployment/content.

When staging is ahead, record that it is a review candidate and leave live unchanged. Do not describe staging as live, and do not describe a local change as staged until it has been verified at `netcon-ivory.vercel.app`.

## Required Verification

After aliasing staging, verify the staging URL directly. At minimum:

```sh
curl -I https://netcon-ivory.vercel.app/
curl -I https://netcon-ivory.vercel.app/<changed-route>
```

For content changes, check the exact expected text and the absence of stale text. For JavaScript or CSS changes, fetch the deployed asset and check its marker or version. For redirects, verify the status and `Location` header without following the redirect first.

Do not claim a change is staged based only on:

- a successful local edit;
- a local browser result;
- a preview URL that is not the permanent staging URL;
- a deployment command without a successful alias;
- a raw HTML check when the behavior is injected by JavaScript;
- a cached browser tab.

## Git Push Rules

The two GitHub push URLs configured under `origin` must remain in lockstep:

- `Navjotsingh09/netcon.git`
- `Devanhaar/netcon2026.git`

Use:

```sh
git push origin <branch>
```

Do not push only to `charity` or only to one repository. Before pushing, confirm the intended branch and clean-tree state. Pushing code and deploying code are separate approvals.

## Stop Conditions

Stop and ask the owner if any of the following is true:

- `git status --short` is not empty;
- the requested branch or commit is not explicit;
- the candidate contains another contributor's unreviewed work;
- the staging alias target is unknown;
- the preview deployment is not ready;
- the requested operation would rebuild live;
- the requested operation would promote without explicit sign-off;
- local and staging content do not match the claimed candidate;
- a browser cache or runtime-generated content makes the result ambiguous.

## Release Record

Every staging candidate should leave a compact record:

```text
Date/time:
Contributor:
Branch:
Commit SHA:
Scope:
Preview URL:
Preview deployment ID:
Staging URL:
Staging alias target:
Reviewer:
Review status:
Live promotion status:
Notes/rollback:
```

## Current Repository Recovery Note

At the time this runbook was created, the active workspace contained a large dirty working tree and the active branch was not the same branch as the separate `charity/negi` evening content commits. No further deployment should be made from that folder until the owner separates the work into intentional commits and creates a clean release worktree.
