# NetCon — Accessibility North Star Document
> This document defines the accessibility standard for the Network Consultancy website.
> Target compliance: **WCAG 2.2 Level AA**.
> All new pages and components must meet every requirement listed here before staging.

---

## 1 · Why This Matters

Network Consultancy serves SMEs across all industries in the UK. Its website must be usable by:
- Visually impaired users (screen readers, low vision, colour blindness)
- Motor-impaired users (keyboard-only navigation, switch access)
- Cognitively diverse users (dyslexia, ADHD, anxiety)
- Deaf / hard-of-hearing users
- Elderly users on older devices

**UK Legal Context:**
- **Equality Act 2010** — requires "reasonable adjustments" for disabled people. Inaccessible websites can constitute unlawful discrimination.
- **Web Content Accessibility Guidelines (WCAG) 2.2** — the internationally recognised technical standard.
- **EN 301 549** — the European standard adopted in UK law (harmonised with WCAG 2.1 AA, WCAG 2.2 AA is the contemporary baseline).

**Target:** WCAG 2.2 Level AA across all 57 pages.

---

## 2 · POUR Principles

Accessibility is built on four principles. Every success criterion maps to one of these.

### 2.1 Perceivable
Information must be presentable to users in ways they can perceive.

| Criteria | Requirement | NetCon Implementation |
|---|---|---|
| 1.1.1 Non-text Content (A) | All images must have descriptive `alt` text | Every `<img>` needs `alt=""` (decorative) or `alt="description"` |
| 1.3.1 Info & Relationships (A) | Structure conveyed through markup | Use semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` |
| 1.3.3 Sensory Characteristics (A) | Instructions don't rely only on shape/colour | "Click the blue button" → "Click the Enquire button" |
| 1.4.1 Use of Colour (A) | Colour alone doesn't convey meaning | Error states use icon + text, not just red |
| 1.4.3 Contrast Minimum (AA) | Normal text ≥ 4.5:1 contrast ratio | See palette audit below |
| 1.4.4 Resize Text (AA) | Text resizable to 200% without loss | Viewport meta + rem/% units |
| 1.4.5 Images of Text (AA) | No text embedded in images | Use CSS text, not text-in-image |
| 1.4.10 Reflow (AA) | No horizontal scroll at 320px viewport | Single-column layout on mobile |
| 1.4.11 Non-text Contrast (AA) | UI components 3:1 vs background | Form borders, focus outlines, button edges |
| 1.4.12 Text Spacing (AA) | No loss of content when spacing overrides applied | Test with: line-height 1.5×, letter-spacing 0.12em |
| 1.4.13 Content on Hover/Focus (AA) | Tooltip-style content is dismissible & hoverable | Mega menu: must close on Escape |

### 2.2 Operable
Users must be able to operate the interface.

| Criteria | Requirement | NetCon Implementation |
|---|---|---|
| 2.1.1 Keyboard (A) | All functionality available via keyboard | Tab through nav, mega menus, forms, accordion, widget |
| 2.1.2 No Keyboard Trap (A) | Focus can be moved away from any component | Mobile nav + accessibility panel: Escape closes |
| 2.4.1 Bypass Blocks (A) | Skip navigation link | `<a class="skip-link" href="#main-content">` on every page |
| 2.4.2 Page Titled (A) | Unique, descriptive page title | Each page has unique `<title>` — not just "Network Consultancy" |
| 2.4.3 Focus Order (A) | Focus moves in logical sequence | DOM order = visual order |
| 2.4.4 Link Purpose (A) | Link text meaningful out of context | "Read more" → "Read more about Managed Wireless LAN" |
| 2.4.6 Headings & Labels (AA) | Descriptive headings | H1 → H2 → H3 hierarchy, never skip levels |
| 2.4.7 Focus Visible (AA) | Keyboard focus is always visible | 3px solid #0982c5 outline on all interactive elements |
| 2.4.11 Focus Not Obscured (AA) **NEW 2.2** | Focused element not entirely hidden by sticky headers | Scroll padding on `html` to offset fixed navbar |
| 2.5.3 Label in Name (A) | Accessible name includes visible label text | Button labelled "Enquire Here" must have aria-label containing "Enquire" |
| 2.5.8 Target Size Minimum (AA) **NEW 2.2** | Interactive targets ≥ 24×24px | All buttons, links, toggle controls min 44×44px (WCAG recommendation) |

### 2.3 Understandable
Information and UI operation must be understandable.

| Criteria | Requirement | NetCon Implementation |
|---|---|---|
| 3.1.1 Language of Page (A) | `lang` attribute on `<html>` | `<html lang="en">` on every page |
| 3.1.2 Language of Parts (AA) | Language changes marked inline | If any non-English content, wrap in `lang="xx"` |
| 3.2.1 On Focus (A) | No context change on focus | No redirects when tabbing to a link |
| 3.2.2 On Input (A) | No automatic submission | Forms only submit on button click |
| 3.2.3 Consistent Navigation (AA) | Nav same position on every page | Navbar identical across all pages |
| 3.2.6 Consistent Help (A) **NEW 2.2** | Help mechanism in same location | Contact details/form in footer + contact section |
| 3.3.1 Error Identification (A) | Errors described in text | Form validation: "Please enter a valid email address" |
| 3.3.2 Labels or Instructions (A) | Form inputs have labels | All inputs have `<label>` or descriptive `placeholder` + `aria-label` |
| 3.3.7 Redundant Entry (A) **NEW 2.2** | Don't ask for same info twice | Contact form: once per session |
| 3.3.8 Accessible Authentication (AA) **NEW 2.2** | No cognitive tests for login | N/A (no auth on this site) |

### 2.4 Robust
Content must be robust enough to be interpreted by assistive technologies.

| Criteria | Requirement | NetCon Implementation |
|---|---|---|
| 4.1.1 Parsing (A) | Valid HTML | No duplicate IDs, properly nested elements |
| 4.1.2 Name, Role, Value (A) | All UI components have ARIA | Buttons: `aria-label` / `aria-expanded`. Mega menus: `role="region"` |
| 4.1.3 Status Messages (AA) | Status messages programmatically determinable | Form success/error: `aria-live="polite"` |

---

## 3 · Colour Contrast Audit — NetCon Palette

| Colour Pair | Ratio | Normal Text (≥4.5) | Large Text (≥3.0) | UI Component (≥3.0) |
|---|---|---|---|---|
| Navy #162470 on White | 14.6:1 | ✅ PASS | ✅ PASS | ✅ PASS |
| Navy #162470 on Gray-Bg #EBEBEB | 11.4:1 | ✅ PASS | ✅ PASS | ✅ PASS |
| Blue #0982c5 on White | 4.15:1 | ⚠️ BORDERLINE (just below 4.5) | ✅ PASS | ✅ PASS |
| Blue #0982c5 on Gray-Bg #EBEBEB | 3.23:1 | ❌ FAIL body text | ✅ PASS large text | ✅ PASS |
| Dark #353535 on White | 10.7:1 | ✅ PASS | ✅ PASS | ✅ PASS |
| Sub #585151 on White | 6.0:1 | ✅ PASS | ✅ PASS | ✅ PASS |
| White on Navy #162470 | 14.6:1 | ✅ PASS | ✅ PASS | ✅ PASS |
| White on Blue #0982c5 | 4.15:1 | ⚠️ BORDERLINE | ✅ PASS | ✅ PASS |

**Action required for blue #0982c5:**
- NEVER use blue (#0982c5) for body-copy text or small (< 18px) link text on white or light backgrounds.
- Blue is acceptable for: large headings (≥ 18px), CTA button text on blue background (white text on blue), UI elements.
- For small inline links: use navy (#162470) which passes at 14.6:1.

---

## 4 · Per-Page Implementation Checklist

Every page built must tick all boxes before staging.

### HTML Structure
- [ ] `<!DOCTYPE html>` declared
- [ ] `<html lang="en">` set
- [ ] Unique `<title>` — format: `Page Name | Network Consultancy`
- [ ] Meta viewport: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] Skip link as first element inside `<body>`: `<a class="skip-link" href="#main-content">Skip to main content</a>`
- [ ] `<header>` wraps navbar
- [ ] `<main id="main-content">` wraps all page content (everything between header and footer)
- [ ] `<footer>` wraps footer
- [ ] Heading hierarchy: one H1 per page, H2 for section headings, H3 for sub-sections — never skip a level

### Images
- [ ] All decorative images: `alt=""`
- [ ] All informative images: descriptive `alt` text (describe what the image conveys, not just "image of...")
- [ ] `<picture>` with webp + jpg fallback for all images
- [ ] Hero images: no `loading="lazy"` (above fold)
- [ ] All other images: `loading="lazy"`

### Navigation
- [ ] `<nav aria-label="Main navigation">` on navbar
- [ ] `<nav aria-label="Breadcrumb">` on page hero breadcrumb
- [ ] Mega menus: `role="region"` on dropdown, `aria-expanded` on trigger
- [ ] Current page link: `aria-current="page"`
- [ ] Mobile hamburger: `aria-expanded`, `aria-controls`, `aria-label`

### Forms
- [ ] Every input has either a visible `<label>` or `aria-label`
- [ ] `autocomplete` attribute on all inputs
- [ ] Error messages linked to input via `aria-describedby`
- [ ] Success/error feedback uses `aria-live="polite"`
- [ ] No CAPTCHA (blocks accessibility)

### Interactive Components
- [ ] All buttons have meaningful `aria-label` (not just icon)
- [ ] Accordion (FAQ): `aria-expanded`, `aria-controls` on trigger; `id` on panel
- [ ] Testimonial carousel: `aria-label`, prev/next buttons with `aria-label`
- [ ] Focus trap in modal-style overlays (mobile nav, accessibility panel)
- [ ] Escape closes all overlays

### Focus Management
- [ ] All interactive elements visible with keyboard focus (`:focus-visible` outline)
- [ ] Focus order matches visual/logical reading order
- [ ] Scroll-padding-top on `html` to account for fixed navbar height
- [ ] No `outline: none` without a custom focus indicator

### Colour & Contrast
- [ ] No information conveyed by colour alone
- [ ] All text passes minimum contrast ratio (see section 3)
- [ ] Active/selected states have contrast ≥ 3:1 vs unselected

### Motion
- [ ] `prefers-reduced-motion` media query respected
- [ ] Parallax and scroll animations disabled when motion reduced

---

## 5 · The Accessibility Widget

A floating accessibility button appears on every page (bottom-right corner).

**How to include on any page:**
```html
<!-- In <head> -->
<link rel="stylesheet" href="[relative path]/css/accessibility.css">

<!-- Before </body> -->
<script src="[relative path]/js/accessibility.js" defer></script>
```

**Available user controls:**

| Control | What It Does |
|---|---|
| **Text Size −** | Shrinks page zoom to 90% or 82% |
| **Text Size Default** | Resets zoom to 100% |
| **Text Size +** | Scales page zoom to 110%, 125%, 140% |
| **High Contrast** | Black background, white text, yellow links |
| **Negative Contrast** | CSS `invert(1) hue-rotate(180deg)` on `<html>` |
| **Grayscale** | CSS `grayscale(100%)` on `<html>` |
| **Dyslexia Font** | Switches to high-readability font stack (Arial/Verdana) with increased spacing |
| **Highlight Links** | Yellow background + underline on all `<a>` elements |
| **Increase Spacing** | Line-height 1.8, letter-spacing 0.05em |
| **Pause Animations** | Sets all animation and transition durations to 0.001s |
| **Reset All** | Clears all overrides and localStorage |

**Persistence:** All settings saved to `localStorage` key `nc_a11y_v1` — survive page navigation.

---

## 6 · Testing Protocol

### Automated (run before every staging deploy)
1. **axe DevTools** Chrome extension — zero violations on every page
2. **Google Lighthouse** Accessibility score — target 95+
3. **WAVE** (wave.webaim.org) — zero errors, review all alerts

### Manual Keyboard Testing
1. Tab through entire page — every interactive element must be reachable
2. Enter/Space activates buttons and links
3. Escape closes all overlays (mobile nav, mega menu, accessibility panel)
4. Arrow keys navigate select dropdowns
5. Confirm skip link appears on first Tab and sends focus to `#main-content`

### Screen Reader Testing
- **macOS VoiceOver** (Cmd + F5): Confirm landmarks, heading structure, alt text
- **NVDA + Firefox** (Windows): Test form flow, error messages, live regions
- **iOS VoiceOver**: Test mobile layout

### Colour Contrast Testing
- Colour Contrast Analyser app (TPGi) — spot-check all text/background combos
- Sim Daltonism app — simulate 8 types of colour blindness

### Responsive / Reflow Testing
- Test at 320px viewport width — no horizontal scroll
- Test at 1920px — no unreadable line lengths (max ~75 characters)
- Test with browser zoom at 200% — no content loss

---

## 7 · ARIA Landmark Structure (Every Page)

```html
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <header role="banner">
    <nav aria-label="Main navigation">...</nav>
  </header>

  <main id="main-content">
    <!-- page-specific sections here -->
    <!-- Each section should have aria-label or heading -->
  </main>

  <footer role="contentinfo">...</footer>

  <!-- Accessibility widget (injected by accessibility.js) -->
</body>
```

---

## 8 · scroll-padding-top (Fixed Navbar Offset)

The fixed navbar is approximately 80px tall. Add to every page's CSS to prevent focused elements from hiding behind it:

```css
html {
  scroll-padding-top: 100px; /* navbar height + breathing room */
}
```

This satisfies WCAG 2.4.11 Focus Not Obscured (AA).

---

## 9 · Continuous Improvement

| Priority | Enhancement | When |
|---|---|---|
| High | Screen reader testing on all 57 pages | Before launch |
| High | ARIA live regions for form submission | Before launch |
| Medium | Dyslexia font (OpenDyslexic CDN) | Phase 2 |
| Medium | Focus visible enhancement for carousels | Phase 2 |
| Low | WCAG AAA colour contrast (7:1) mode | Phase 3 |
| Low | Sign language video (BSL) for key pages | Phase 3 |

---

## 10 · Reference Standards

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — W3C Recommendation, October 2023
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) — W3C WAI
- [GOV.UK Accessibility](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites) — UK PSBAR 2018
- [Equality Act 2010](https://www.legislation.gov.uk/ukpga/2010/15/contents) — UK legislation
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — colour contrast tool
- [axe DevTools](https://www.deque.com/axe/) — automated testing
