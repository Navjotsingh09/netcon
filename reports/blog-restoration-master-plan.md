# NetCon Blog Restoration Master Plan

Date: 2026-07-17
Owner: Copilot + User
Status: In progress

## 1) Objectives

1. Restore the full blog family on the rebuilt site.
2. Repopulate with the approved source articles (14 URLs provided by user).
3. Preserve discoverability for legacy /blog URLs while serving the new pages under /resources/blog.
4. Standardize post templates, metadata, and image variants (featured, card, thumbnail).
5. Improve content quality without inventing facts, stats, quotes, or sources.

## 2) Current State Snapshot

1. Blog scaffold exists:
	- resources/blog/index.html
	- resources/blog/post-01.html through resources/blog/post-19.html
2. Blog listing data exists in js/blog-cms.js and node map in resources/blog/blog-node-map.json.
3. Blog-specific image assets already exist for index and posts 02-19 in images/pages/unique.
4. Blocking issue found in routing:
	- vercel.json currently redirects /resources/blog/:path* to /resources, which disables all blog post URLs.
5. Sitemap currently has no /blog or /resources/blog entries.

## 3) Canonical URL Strategy

1. Canonical serving path for rebuilt pages:
	- /resources/blog
	- /resources/blog/post-01 ... /resources/blog/post-19
2. Legacy path compatibility:
	- Add explicit redirects from /blog/<legacy-slug> to mapped /resources/blog/post-xx
3. Remove the current catch-all redirect that forces /resources/blog/* to /resources.

## 4) Source URL to Local Post Mapping

| Priority | Legacy URL slug | Target page | Action |
|---|---|---|---|
| P1 | overview-of-network-design-implementation | /resources/blog/post-01.html | Replace current post-01 content with this source article |
| P1 | network-validation-everything-you-need-to-know | /resources/blog/post-06.html | Refresh content and metadata |
| P1 | why-your-business-needs-cloud-networking-key-benefits-and-implementation-strategies | /resources/blog/post-05.html | Refresh content and metadata |
| P1 | the-value-of-professional-it-services-from-it-consultant-to-network-consulting-services | /resources/blog/post-09.html | Refresh content and metadata |
| P1 | how-ai-is-revolutionising-network-operations-cost-control | /resources/blog/post-11.html | Populate/refresh as AI operations post |
| P1 | a-guide-to-wireless-security-solutions | /resources/blog/post-04.html | Refresh content and metadata |
| P1 | wireless-vs-wired-networks | /resources/blog/post-03.html | Refresh content and metadata |
| P1 | leveraging-cloud-networking-for-business-efficiency | /resources/blog/post-07.html | Refresh content and metadata |
| P1 | top-network-security-solutions-for-remote-work-2025-tips | /resources/blog/post-12.html | Refresh content and metadata |
| P1 | how-can-a-network-consultant-transform-your-it-infrastructure | /resources/blog/post-19.html | Replace placeholder content with full article |
| P2 | everything-you-need-to-know-about-wlans | /resources/blog/post-10.html | Refresh content and metadata |
| P2 | optimising-your-network-with-network-consultancy | /resources/blog/post-15.html | Refresh content and metadata |
| P2 | cisco-delivers-network-convergence-system-to-power-internet-of-everything | /resources/blog/post-17.html | Keep as vendor/industry legacy category |
| P2 | virtualised-networks-designed-installed-by-us | /resources/blog/post-18.html | Keep as vendor/industry legacy category |

Notes:
1. This mapping reuses existing file slots to avoid unnecessary new page creation.
2. Post slots not in this set remain available for future editorial backlog.

## 5) Image Strategy (Featured, Card, Thumbnail)

### 5.1 Source Priority

1. First choice: existing local blog image assets already in repo.
2. Second choice: source article hero image from legacy URL.
3. Third choice: approved design exports already in local design folders.

### 5.2 Existing Blog Image Coverage

Folder: images/pages/unique

1. resources-blog-index-professional.jpg
2. resources-blog-post-02-resources.jpg through resources-blog-post-19-resources.jpg

### 5.3 Output Convention

For each active post, keep one base image and generate 3 usage variants:

1. Featured: post hero image
2. Card: listing card image
3. Thumbnail: sidebar/latest compact image

Naming pattern:

1. images/pages/unique/resources-blog-post-XX-feature.jpg
2. images/pages/unique/resources-blog-post-XX-card.jpg
3. images/pages/unique/resources-blog-post-XX-thumb.jpg

Optional WebP mirrors can be added after baseline completion.

## 6) Template and Content Standard

Each post page must include:

1. Correct title, meta description, canonical, OG title/description/image
2. Real article body from mapped source URL (cleaned and structured)
3. Relevant category label matching the chosen taxonomy
4. Sidebar latest items with real links and thumbnails
5. Internal links to service pages where contextually valid
6. Contact CTA at end of article

## 7) Taxonomy for Listing Filters

Use practical filter groups for current set:

1. Cloud
2. Security
3. Infrastructure
4. Managed Services
5. Strategy
6. Industry News (for vendor legacy articles)

## 8) Delivery Batches

### Batch A (Core launch)

1. post-01, post-03, post-04, post-05, post-06, post-07, post-09, post-11, post-12, post-19

Goal: bring back the highest business and search intent posts.

### Batch B (Secondary coverage)

1. post-10, post-15

Goal: complete WLAN and optimization coverage.

### Batch C (Legacy vendor articles)

1. post-17, post-18

Goal: preserve legacy topics under Industry News positioning.

### Batch D (Platform wiring)

1. Update js/blog-cms.js post titles/excerpts/categories/images
2. Update resources/blog/index.html featured cards if needed
3. Update js/search-index.js to include key blog entries
4. Update vercel.json redirects
5. Update sitemap.xml with blog URLs

## 9) Acceptance Checklist

1. /resources/blog and each mapped post page load locally.
2. No redirect loop or forced redirect away from /resources/blog.
3. Legacy /blog slugs redirect to correct mapped pages.
4. Listing cards display correct image/title/excerpt/date/category.
5. Post hero, sidebar thumbs, and thumbnail images render with valid paths.
6. Metadata present and unique per post.
7. Search index includes blog pages targeted for launch.

## 11) Progress Log

1. Fixed vercel.json — removed the blanket redirect that disabled all /resources/blog/* pages; added 14 legacy /blog/<slug> redirects to the correct mapped posts.
2. Rewrote body content + metadata for post-01, 03, 04, 05, 06, 07, 09, 10, 11, 12, 15, 17, 18, 19 using the real source articles (many of these were OCR-corrupted placeholder text and have now been fully replaced).
3. Updated js/blog-cms.js listing metadata (title/excerpt/category/image) for all 14 restored posts to match the new content.
4. Added sitemap.xml entries for the blog index and all 14 restored posts.
5. Added search-index.js entries for the blog index and all 14 restored posts.
6. Verified locally: blog listing renders correct titles; post-01 and post-19 render correct H1, hero image, and full body paragraphs.

### Known follow-up (out of current scope)
Posts 02, 08, 13, 14, and 16 are also OCR-corrupted but were not part of the 14 user-supplied source URLs. They remain on the backlog for a future batch.


