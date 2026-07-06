# NetCon — North Star Document
> This is the single source of truth for the Network Consultancy website build.
> It is loaded automatically by GitHub Copilot / the AI agent at the start of every session.
> Every rule here is mandatory. Do not deviate unless the user explicitly overrides a rule in that session.

---

## 1 · Project Overview

**Client:** Network Consultancy (NetCon)
**Purpose:** Marketing/lead-gen website for a UK-based B2B IT networking consultancy targeting SMEs.
**Stack:** Plain HTML + CSS + vanilla JS. No frameworks, no build tools, no npm. Static site.
**Hosting:** Vercel (static deployment).
**Repo root:** `/Users/navjotsinghhundal/Desktop/_Active/NetCon/`

---

## 2 · Deployment Rules — READ FIRST

> ⚠️ **ALWAYS DEPLOY TO `netcon-ivory.vercel.app` — NEVER CREATE NEW PREVIEW LINKS**

- **Staging URL (permanent):** `https://netcon-ivory.vercel.app` — this is always the review/staging destination.
- **Command to deploy (mandatory):** `vercel --prod`
- **NEVER run plain `vercel`** (no flags) — it creates a new throwaway preview URL every time, which is unwanted.
- `netcon-ivory.vercel.app` is the staging domain, NOT the live customer domain. Do not treat it as "going live".
- The real production/live domain (custom domain) will be confirmed by the user separately and explicitly.
- **NEVER deploy to the real custom domain** unless the user explicitly says "go live on the real domain" or words to that effect in that exact session.

---

## 3 · Design System

### Colours
```css
--navy:    #162470   /* primary headings, nav, footer accents */
--blue:    #0982c5   /* CTAs, links, highlights */
--dark:    #353535   /* body text */
--gray-bg: #EBEBEB   /* section backgrounds */
--gray-mid:#d9d9d9   /* borders, dividers */
--sub:     #585151   /* secondary/sub text */
```

### Typography
| Role | Font | Weight |
|---|---|---|
| Section headings / nav | Roboto Condensed | 300 / 400 / 500 / 600 / 700 |
| Body / buttons / labels | Barlow | 400 / 500 / 600 / 700 |
| Fallback | Helvetica Neue, Helvetica, Arial, sans-serif | — |

Google Fonts import (already in `index.html` — copy to every page):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;500;600;700&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Layout
| Variable | Value | Purpose |
|---|---|---|
| `--max-w` | 1440px | Inner content column cap |
| `--section-w` | 1920px | Full-bleed section background cap |
| `--px` | 240px → 120px → 32px → 20px | Horizontal padding (responsive cascade) |

Full-bleed sections use `max-width: var(--section-w)` with `var(--px)` side padding.
Inset card sections cap at `max-width: var(--max-w)`.

### Buttons
```css
.btn-blue  → background #0982c5, white text, 13px 24px padding, border-radius 10px, Barlow 600 20px
.btn-dark  → dark background variant (same structure)
```

### CSS Files
- `css/animations.css` — scroll-triggered animations (animate-fade-up, stagger-children)
- Inline `<style>` in each page for page-specific CSS (this is the current pattern — keep it)

### JS Files
- `js/animations.js` — Intersection Observer for animate-fade-up / stagger-children
- `js/parallax.js` — parallax scroll effect for hero + scroll banners

---

## 4 · File & Folder Structure

```
/
├── index.html                    ← Home page ✅ BUILT
├── about.html
├── contact.html
├── privacy-policy.html
├── terms-of-service.html
│
├── services/
│   ├── index.html                ← Services landing
│   ├── business-continuity.html
│   ├── firewall-network-security.html
│   ├── managed-network-support.html
│   ├── managed-wireless-lan.html
│   ├── network-consultancy.html
│   ├── network-design-deployment.html
│   ├── network-installations.html
│   ├── network-support.html
│   └── remote-access-vpn.html
│
├── solutions/
│   ├── index.html                ← Solutions landing
│   ├── ai-ready-infrastructure.html
│   ├── cyber-security-review.html
│   ├── microsoft-365-network.html
│   └── network-health-check.html
│
├── industries/
│   ├── index.html                ← Industries landing
│   ├── financial-services.html
│   ├── healthcare-clinics.html
│   ├── internal-it-teams.html
│   ├── legal-firms.html
│   ├── manufacturing.html
│   ├── multi-site-businesses.html
│   ├── professional-services.html
│   └── recruitment-agencies.html
│
├── resources/
│   ├── index.html                ← Resources landing
│   ├── downloads.html
│   ├── guides.html
│   └── blog/
│       ├── index.html            ← Blog listing
│       ├── post-01.html
│       ├── post-02.html
│       └── … post-19.html
│
├── case-studies/
│   ├── index.html                ← Case studies landing
│   ├── antal-international.html
│   ├── auriga-networks.html
│   ├── harry-dobbs-design.html
│   ├── nta-core-network-upgrade.html
│   └── senate-computers.html
│
├── css/
│   └── animations.css
├── js/
│   ├── animations.js
│   └── parallax.js
├── images/
│   ├── banners/
│   ├── features/
│   ├── hero/
│   ├── services/
│   └── misc/
└── Figma Design Files - Netcon/  ← Source designs (PDFs + JPGs) — read-only reference
```

**Total pages to build: ~57**

---

## 5 · Common Sections (Reused Across Pages)

Every section listed here must be **pixel-identical** to the home page implementation. Copy the HTML and CSS directly from `index.html` — do not rewrite from scratch.

### 5.1 Navbar
- Appears on: **ALL pages**
- Source: `index.html` lines ~1337–1578
- Contains: logo, mega menus (Services, Solutions, Industries, Resources), "Book a Free Health Check" CTA, hamburger for mobile
- Mega menu items must link to the correct page paths (use relative paths from each page's location)
- Path adjustments: pages in subdirectories need `../` prefixes on all asset paths and links

### 5.2 Footer
- Appears on: **ALL pages**
- Source: `index.html` lines ~2005–2085
- Contains: brand column (logo, tagline, search, social icons), 3-col link columns (Industries / Services / Solutions+Resources), divider, copyright + legal links
- Footer links must point to actual page paths once pages are built

### 5.3 Contact CTA Section
- Appears on: Home, About, all Services pages, all Industries pages, all Solutions pages
- Source: `index.html` lines ~1966–2004
- Phone: +44 (0) 203 150 1401
- Address: Birmingham, Beech House, Greenfield Crescent, Edgbaston, B15 3BE
- Email: info@network-consultancy.com
- Form fields: Full Name, Last Name, Phone Number, Company Name, I Need help with, Scale of Business, Message, Where did you hear about us?

### 5.4 FAQ Accordion
- Appears on: Home, Services pages (likely), Industries pages (likely)
- Source: `index.html` lines ~1919–1965
- JS accordion logic is inline in `index.html` — copy to each page that uses it

### 5.5 Testimonials
- Appears on: Home (and likely About, Services landing)
- Source: `index.html` lines ~1888–1918

### 5.6 Our Clients Logo Strip
- Appears on: Home, About
- Source: `index.html` lines ~1869–1887

### 5.7 Inner Page Hero Banner
- Appears on: every inner page (NOT home — home has its own full hero)
- Layout: dark/navy background with page title + breadcrumb, typically with a background image
- Structure template:
```html
<section class="page-hero">
  <div class="page-hero__content">
    <nav class="breadcrumb">
      <a href="/">Home</a> <span>/</span> <span>Page Title</span>
    </nav>
    <h1 class="page-hero__title">Page Title</h1>
    <p class="page-hero__sub">Short description line</p>
  </div>
</section>
```

### 5.8 Parallax Scroll Banners
- Appears on: Home (Managed Network Security + Network Consultancy Services)
- May appear on relevant service/solution pages — check Figma PDF before adding

---

## 6 · Figma Design Files Reference

All source designs are in:
`Figma Design Files - Netcon/`

| Category | Files |
|---|---|
| Home | `Home page.jpg` |
| Core | `About Us.pdf`, `Contact Us.pdf`, `Contact Us-1.pdf`, `Privacy Polic.pdf`, `Terms of Service.pdf` |
| Services | `SERVICES (Landing Page).pdf` + 9 individual service PDFs |
| Solutions | `SOLUTIONS (Landing Page) APPROVED.pdf` + 4 individual solution PDFs |
| Industries | `INDUSTRIES (Landing Page).pdf` + 8 individual industry PDFs + `INDUSTRIES → Internal IT Teams/Co-Managed IT.pdf` |
| Resources | `RESOURCES (Landing Page).pdf`, `RESOURCES → Blogs.pdf` + 19 blog PDFs, `RESOURCES → Downloads (Landing Page).pdf`, `RESOURCES → Guides (Landing Page).pdf` |
| Case Studies | `CASE STUDIES - Landing Page.pdf` + 5 individual case study PDFs |

**To view a PDF design:** Convert with `sips -s format png "filename.pdf" --out /tmp/preview.png` then view the PNG.

---

## 7 · Build Rules & Guardrails

### Code Quality
- Plain HTML/CSS/JS only — no frameworks, no npm, no build steps
- Each page is a self-contained `.html` file with inline `<style>` for page-specific CSS
- Always link `css/animations.css`, `js/animations.js`, `js/parallax.js` using correct relative paths
- Use `<picture>` + `<source type="image/webp">` + `<img>` for all images (webp with jpg fallback — both exist in `/images/`)
- All images: `loading="lazy"` except above-the-fold hero images
- Maintain `max-width: var(--section-w)` / `var(--max-w)` pattern on all sections

### Path Rules for Subdirectory Pages
Pages inside `services/`, `solutions/`, `industries/`, `resources/`, `case-studies/` must use `../` for all asset paths:
```html
<!-- From services/network-consultancy.html -->
<link rel="stylesheet" href="../css/animations.css">
<script src="../js/animations.js" defer></script>
<img src="../images/hero/hero-bg.webp" ...>
```
Blog posts at `resources/blog/` go two levels deep: `../../css/animations.css`

### Content Rules
- **NEVER fabricate** any of the following: statistics, client names, testimonial quotes, study references, phone numbers, addresses, or pricing. Use only what appears in the Figma design PDF.
- If a Figma design shows placeholder text (Lorem ipsum or "Client Name") — use that placeholder and flag it for the user to replace.
- The contact details (phone, address, email) are real — they are in the Figma and in `index.html`. Use them as-is.
- Company name is always "Network Consultancy" — never abbreviate to "NetCon" in user-facing copy.

### HTML Standards
- `lang="en"` on every `<html>` tag
- Semantic elements: `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<header>`
- Every `<img>` must have a descriptive `alt` attribute
- Form inputs must have `autocomplete` attributes and associated `<label>` or `placeholder`
- No inline `onclick` handlers — use `addEventListener` in a `<script>` block

### CSS Standards
- Use the CSS custom properties (`--navy`, `--blue`, `--dark`, etc.) — never hardcode these hex values outside of the `:root` block
- Responsive breakpoints follow the pattern in `index.html`:
  - `≤1440px` → `--px: 120px`
  - `≤1200px` → `--px: 80px` (hamburger nav activates)
  - `≤768px` → `--px: 32px`
  - `≤480px` → `--px: 20px`

---

## 8 · Workflow for Each New Page

1. **View the Figma PDF first** — convert to PNG using `sips`, view with `view_image` tool
2. **Identify which common sections appear** on that page (navbar + footer always; check for contact, FAQ, testimonials, parallax banners)
3. **Build the page** — copy navbar and footer verbatim from `index.html`, build unique sections fresh from the Figma design
4. **Adjust all asset paths** for the page's directory depth
5. **Verify disk write** — run `wc -l` on the file after creation to confirm it's not a 0-byte buffer
6. **Deploy to staging** — run `vercel` (no flags) to push to preview URL
7. **Never `vercel --prod`** unless the user explicitly says "go live"

---

## 9 · Session Startup Checklist

At the start of each working session on this project:
1. Read this file
2. Check which pages are already built: `find . -name "*.html" | sort`
3. Confirm the last deployed staging URL from `.vercel/` config
4. Ask the user which page/section to work on next

---

## 10 · Page Status Tracker

Update this table as pages are built and approved.

| Page | File | Built | Reviewed | Staged |
|---|---|---|---|---|
| Home | `index.html` | ✅ | ⬜ | ⬜ |
| About Us | `about.html` | ⬜ | ⬜ | ⬜ |
| Contact Us | `contact.html` | ⬜ | ⬜ | ⬜ |
| Privacy Policy | `privacy-policy.html` | ⬜ | ⬜ | ⬜ |
| Terms of Service | `terms-of-service.html` | ⬜ | ⬜ | ⬜ |
| Services Landing | `services/index.html` | ⬜ | ⬜ | ⬜ |
| Services → Business Continuity | `services/business-continuity.html` | ⬜ | ⬜ | ⬜ |
| Services → Firewall & Network Security | `services/firewall-network-security.html` | ⬜ | ⬜ | ⬜ |
| Services → Managed Network Support | `services/managed-network-support.html` | ⬜ | ⬜ | ⬜ |
| Services → Managed Wireless LAN | `services/managed-wireless-lan.html` | ⬜ | ⬜ | ⬜ |
| Services → Network Consultancy | `services/network-consultancy.html` | ⬜ | ⬜ | ⬜ |
| Services → Network Design & Deployment | `services/network-design-deployment.html` | ⬜ | ⬜ | ⬜ |
| Services → Network Installations | `services/network-installations.html` | ⬜ | ⬜ | ⬜ |
| Services → Network Support | `services/network-support.html` | ⬜ | ⬜ | ⬜ |
| Services → Remote Access & VPN | `services/remote-access-vpn.html` | ⬜ | ⬜ | ⬜ |
| Solutions Landing | `solutions/index.html` | ⬜ | ⬜ | ⬜ |
| Solutions → AI-Ready Infrastructure | `solutions/ai-ready-infrastructure.html` | ⬜ | ⬜ | ⬜ |
| Solutions → Cyber Security Review | `solutions/cyber-security-review.html` | ⬜ | ⬜ | ⬜ |
| Solutions → Microsoft 365 & Network | `solutions/microsoft-365-network.html` | ⬜ | ⬜ | ⬜ |
| Solutions → Network Health Check | `solutions/network-health-check.html` | ⬜ | ⬜ | ⬜ |
| Industries Landing | `industries/index.html` | ⬜ | ⬜ | ⬜ |
| Industries → Financial Services | `industries/financial-services.html` | ⬜ | ⬜ | ⬜ |
| Industries → Healthcare & Clinics | `industries/healthcare-clinics.html` | ⬜ | ⬜ | ⬜ |
| Industries → Internal IT Teams | `industries/internal-it-teams.html` | ⬜ | ⬜ | ⬜ |
| Industries → Legal Firms | `industries/legal-firms.html` | ⬜ | ⬜ | ⬜ |
| Industries → Manufacturing | `industries/manufacturing.html` | ⬜ | ⬜ | ⬜ |
| Industries → Multi-Site Businesses | `industries/multi-site-businesses.html` | ⬜ | ⬜ | ⬜ |
| Industries → Professional Services | `industries/professional-services.html` | ⬜ | ⬜ | ⬜ |
| Industries → Recruitment Agencies | `industries/recruitment-agencies.html` | ⬜ | ⬜ | ⬜ |
| Resources Landing | `resources/index.html` | ⬜ | ⬜ | ⬜ |
| Resources → Blog Landing | `resources/blog/index.html` | ⬜ | ⬜ | ⬜ |
| Resources → Blog Posts 01–19 | `resources/blog/post-01.html` … | ⬜ | ⬜ | ⬜ |
| Resources → Downloads | `resources/downloads.html` | ⬜ | ⬜ | ⬜ |
| Resources → Guides | `resources/guides.html` | ⬜ | ⬜ | ⬜ |
| Case Studies Landing | `case-studies/index.html` | ⬜ | ⬜ | ⬜ |
| Case Studies → Antal International | `case-studies/antal-international.html` | ⬜ | ⬜ | ⬜ |
| Case Studies → Auriga Networks | `case-studies/auriga-networks.html` | ⬜ | ⬜ | ⬜ |
| Case Studies → Harry Dobbs Design | `case-studies/harry-dobbs-design.html` | ⬜ | ⬜ | ⬜ |
| Case Studies → NTA Core Network Upgrade | `case-studies/nta-core-network-upgrade.html` | ⬜ | ⬜ | ⬜ |
| Case Studies → Senate Computers | `case-studies/senate-computers.html` | ⬜ | ⬜ | ⬜ |
