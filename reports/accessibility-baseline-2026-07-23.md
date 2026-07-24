# Accessibility Baseline Report (2026-07-23)

## Scope
- Target site: https://network-consultancy.com
- Repository scan date: 2026-07-23
- Standard target in project docs: WCAG 2.2 AA

## What Was Verified
- Internal accessibility policy exists and sets WCAG 2.2 AA target.
- Accessibility widget implementation exists and is integrated across main site pages.
- Accessibility stylesheet exists and includes focus styles, skip-link styling, and reduced-motion handling.
- No package-based accessibility toolchain or CI workflow evidence was found in this repository.

## Automated Structural Baseline (Repo Scan)
- Initial broad scan found preview/asset helper HTML files outside core site scope.
- Final in-scope structural matrix scan set: 62 HTML files
- Excluded from in-scope matrix: preview/asset helper paths under `NetCon-x6Banners`, `NetCon-IconAssets`, and `images/pages/unique`

### Core checks
- Missing lang="en": 0
- Missing <title>: 0
- Missing skip-link class: 0
- Missing `<main id="main">`: 0
- Missing accessibility.css include: 0
- Missing accessibility.js include: 0

### Evidence artifact
- Page-by-page matrix written to: `reports/accessibility-structural-matrix-2026-07-23.csv`
- Matrix columns: file, lang, title, skip-link, main landmark, accessibility CSS include, accessibility JS include

## Fixes Applied During This Pass
1. Homepage skip-link + main landmark support was added.
- Added skip-link anchor near top of body in index.html
- Added main landmark wrapper with id="main" in index.html

2. Accessibility documentation key mismatch was corrected.
- Updated policy text from nc_a11y_v1 to nc_a11y_v2 in .github/accessibility.md to match implementation.

## Current Conformance Claim Position
- Recommended public status: Not assessed

Reason:
- This repo now has strong accessibility implementation indicators, but there is still no complete, documented full-site WCAG 2.2 AA audit trail proving all pages pass all applicable criteria.

## What Still Must Happen Before Claiming "Fully Conformant"
1. Complete page-by-page WCAG 2.2 AA audit across all in-scope pages.
2. Record auditable evidence (issues found, fixes, re-test pass state, date, tester).
3. Run manual keyboard and screen-reader checks on all critical user journeys.
4. Keep a signed-off compliance register and release-level revalidation process.

## Suggested Statement Wording (Safe)
- Conformance status: Not assessed
- Version: 1.0
- Compatibility note: modern browsers; VoiceOver/NVDA referenced as internal testing tools, not guaranteed exhaustive compatibility.
