(async function () {
  'use strict';

  const elements = {
    auth: document.getElementById('cms-auth'), setup: document.getElementById('cms-setup'),
    setupMessage: document.getElementById('cms-setup-message'), workspace: document.getElementById('cms-workspace'),
    session: document.getElementById('cms-session'), connection: document.getElementById('cms-connection'),
    newPost: document.getElementById('new-post-button'), editor: document.getElementById('editor-panel'),
    form: document.getElementById('article-form'), list: document.getElementById('post-list'), search: document.getElementById('post-search'),
    preview: document.getElementById('preview-dialog'), previewContent: document.getElementById('preview-content'),
    saveStatus: document.getElementById('save-status'), publishLive: document.getElementById('publish-live-button'), articlesButton: document.getElementById('articles-button'), pagesButton: document.getElementById('pages-button'), pagesPanel: document.getElementById('pages-panel'), pagesList: document.getElementById('pages-list'), pageForm: document.getElementById('page-form'), pagePublish: document.getElementById('publish-page-button'), pagePreviewDialog: document.getElementById('page-preview-link-dialog'), pagePreviewInput: document.getElementById('page-preview-link-input'), pagePreviewLink: document.getElementById('generate-preview-link-button'), pageSaveStatus: document.getElementById('page-save-status')
  };
  let token = ''; let cmsUser = null; let posts = []; let currentPost = null; let pages = []; let currentPage = null;
  function setupPageSectionAccordions() {
    const form = elements.pageForm;
    if (form.dataset.accordionsReady) return;
    const index = document.getElementById('page-section-index');
    const labels = { 'SEO and schema': 'SEO and schema', 'Structured data (JSON-LD)': 'SEO and schema', 'Hero slides': 'Hero slider', 'Services and capability cards': 'Core services and capability cards', 'Highlight section': 'Highlight section', 'Trusted expert cards': 'Trusted expert cards', 'Managed network slider': 'Managed network slider', 'Services list': 'Services list', 'Introduction content': 'Introduction', 'Contact CTA': 'Contact CTA', 'Frequently asked questions': 'FAQs', Testimonials: 'Testimonials' };
    let anchor = index;
    const sections = [...form.querySelectorAll(':scope > fieldset')].map((fieldset, position) => {
      const details = document.createElement('details');
      details.className = 'cms-section-accordion cms-form-grid__wide';
      details.open = position < 2;
      const summary = document.createElement('summary');
      const title = labels[fieldset.querySelector('legend')?.textContent.trim()] || `Section ${position + 1}`;
      summary.innerHTML = `<span class="cms-section-number">${position + 1}</span><span>${escapeHtml(title)}</span>`;
      details.append(summary, fieldset);
      form.insertBefore(details, anchor.nextSibling);
      anchor = details;
      return { details, title };
    });
    index.innerHTML = `<p class="cms-editor__state">Page sections</p><ol>${sections.map((section, position) => `<li><button type="button" data-section-target="${position}">${escapeHtml(section.title)}</button></li>`).join('')}</ol>`;
    index.querySelectorAll('[data-section-target]').forEach((button) => button.addEventListener('click', () => { const section = sections[Number(button.dataset.sectionTarget)].details; section.open = true; section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    form.dataset.accordionsReady = 'true';
  }
  const articleEditor = document.getElementById('article-editor');
  const articleHtmlField = document.querySelector('[name="articleHtml"]');
  const articleEditorImage = document.getElementById('article-editor-image');
  const deleteArticleDialog = document.getElementById('delete-article-dialog');
  let articleEditorSelection = null;
  let pendingDeletionSlug = null;

  function escapeHtml(value) { const node = document.createElement('div'); node.textContent = value || ''; return node.innerHTML; }
  function syncArticleEditor() { articleHtmlField.value = articleEditor.innerHTML.trim(); }
  function rememberArticleEditorSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount && articleEditor.contains(selection.anchorNode)) articleEditorSelection = selection.getRangeAt(0).cloneRange();
  }
  function restoreArticleEditorSelection() {
    articleEditor.focus();
    if (!articleEditorSelection) return;
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(articleEditorSelection);
  }
  function insertArticleHtml(html) { restoreArticleEditorSelection(); document.execCommand('insertHTML', false, html); syncArticleEditor(); rememberArticleEditorSelection(); }
  function loadSupabase() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Clerk could not be loaded.'));
      document.head.appendChild(script);
    });
  }
  function safePreviewHtml(value) {
    const allowedTags = new Set(['A', 'BLOCKQUOTE', 'BR', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'IMG', 'LI', 'OL', 'P', 'STRONG', 'UL']);
    const allowedAttributes = { A: new Set(['href', 'target', 'rel', 'class']), IMG: new Set(['src', 'alt', 'width', 'height']) };
    const documentFragment = new DOMParser().parseFromString(String(value || ''), 'text/html');
    documentFragment.body.querySelectorAll('*').forEach((node) => {
      if (!allowedTags.has(node.tagName)) { node.replaceWith(...node.childNodes); return; }
      [...node.attributes].forEach((attribute) => {
        if (!allowedAttributes[node.tagName]?.has(attribute.name.toLowerCase())) node.removeAttribute(attribute.name);
      });
      if (node.tagName === 'A' && !/^(https?:|mailto:)/i.test(node.getAttribute('href') || '')) node.removeAttribute('href');
      if (node.tagName === 'A' && node.getAttribute('class') !== 'article-cta') node.removeAttribute('class');
      if (node.tagName === 'IMG' && !/^(https?:|\/)/i.test(node.getAttribute('src') || '')) node.remove();
    });
    return documentFragment.body.innerHTML;
  }
  function setConnection(text, isReady) { elements.connection.textContent = text; elements.connection.style.color = isReady ? '#bce6c8' : '#f5d593'; }
  function clearValidationErrors() {
    document.getElementById('validation-errors').textContent = '';
    [...elements.form.elements].forEach((field) => field.setCustomValidity(''));
  }
  function showValidationErrors(error) {
    clearValidationErrors();
    const fields = error.fields || {};
    const messages = Object.entries(fields).map(([fieldName, message]) => {
      const field = elements.form.elements[fieldName];
      if (field) field.setCustomValidity(message);
      return `${fieldName}: ${message}`;
    });
    document.getElementById('validation-errors').textContent = messages.length ? messages.join(' ') : error.message;
    const firstField = Object.keys(fields).map((fieldName) => elements.form.elements[fieldName]).find(Boolean);
    if (firstField) firstField.focus();
  }
  async function api(path, options = {}) {
    const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw || `CMS request failed (${response.status}).` }; }
    if (!response.ok) {
      const error = new Error(data.error || `CMS request failed (${response.status}).`);
      error.fields = data.fields || {};
      throw error;
    }
    return data;
  }
  function renderPosts() {
    const query = elements.search.value.trim().toLowerCase();
    const visible = posts.filter((post) => `${post.title} ${post.publicSlug} ${post.category}`.toLowerCase().includes(query));
    elements.list.innerHTML = visible.map((post) => {
      const label = (post.archivedAt ? 'archived' : (post.status || 'draft')).replace(/_/g, ' ');
      const rowClass = `${currentPost?.publicSlug === post.publicSlug ? 'is-selected' : ''}${post.archivedAt ? ' is-archived' : ''}`.trim();
      const slug = encodeURIComponent(post.publicSlug);
      const actions = [`<a class="cms-article-action" href="/resources/blogs/${slug}" target="_blank" rel="noopener" aria-label="View ${escapeHtml(post.title || 'article')}" title="View published article"><i data-lucide="external-link"></i></a>`, `<button class="cms-article-action" data-action="edit" data-slug="${escapeHtml(post.publicSlug)}" type="button" aria-label="Edit ${escapeHtml(post.title || 'article')}" title="Edit article"><i data-lucide="pencil"></i></button>`];
      if (cmsUser?.role === 'reviewer') actions.push(`<button class="cms-article-action cms-article-action--danger" data-action="delete_post" data-slug="${escapeHtml(post.publicSlug)}" type="button" aria-label="Delete ${escapeHtml(post.title || 'article')}" title="Delete article"><i data-lucide="trash-2"></i></button>`);
      return `<article class="cms-article-card ${rowClass}"><div class="cms-article-card__body"><h3>${escapeHtml(post.title || 'Untitled article')}</h3><p>/resources/blogs/${escapeHtml(post.publicSlug)}</p><div class="cms-article-card__meta"><span class="cms-status" data-status="${escapeHtml(label)}">${escapeHtml(label)}</span><time datetime="${post.updatedAt || ''}">${post.updatedAt ? new Date(post.updatedAt).toLocaleDateString('en-GB') : 'Not saved'}</time></div></div><div class="cms-article-actions" aria-label="Article actions">${actions.join('')}</div></article>`;
    }).join('') || '<p class="cms-article-list__empty">No articles match this search.</p>';
    const countElementIds = { published: 'published-count', draft: 'draft-count', in_review: 'review-count', scheduled: 'scheduled-count' };
    Object.entries(countElementIds).forEach(([status, id]) => { document.getElementById(id).textContent = posts.filter((post) => post.status === status).length; });
    if (window.lucide) window.lucide.createIcons();
  }
  function renderFeaturedImage(url, altText) {
    const panel = document.getElementById('featured-image-panel');
    const image = document.getElementById('featured-image-preview');
    const name = document.getElementById('featured-image-name');
    if (!url) { panel.hidden = true; image.removeAttribute('src'); return; }
    image.onerror = () => { image.onerror = null; image.src = '/images/pages/network-abstract.jpg'; name.textContent = 'The selected image could not be loaded. A fallback preview is shown.'; };
    image.src = url;
    image.alt = altText || 'Current featured image';
    name.textContent = url;
    panel.hidden = false;
  }
  async function refreshPosts() {
    const data = await api('/api/cms/posts'); cmsUser = data.user; posts = data.posts; renderPosts();
    elements.session.innerHTML = `<span class="cms-connection">${escapeHtml(cmsUser.display_name)} · ${escapeHtml(cmsUser.role)}</span><button class="cms-button cms-button--secondary" id="sign-out" type="button">Sign out</button>`;
    document.getElementById('sign-out').addEventListener('click', async () => { await window.netconSupabase.auth.signOut(); window.location.reload(); });
  }
  function setPageStatus(message) {
    elements.pageSaveStatus.textContent = message;
    const topStatus = document.getElementById('page-save-status-top');
    if (topStatus) topStatus.textContent = message;
  }
  function showPages() {
    document.querySelector('.cms-workspace__body').hidden = true;
    elements.pagesPanel.hidden = false;
    elements.articlesButton.classList.remove('cms-tab--active');
    elements.pagesButton.classList.add('cms-tab--active');
  }
  function showArticles() {
    elements.pagesPanel.hidden = true;
    document.querySelector('.cms-workspace__body').hidden = false;
    elements.pagesButton.classList.remove('cms-tab--active');
    elements.articlesButton.classList.add('cms-tab--active');
  }
  function renderPages() {
    elements.pagesList.innerHTML = pages.map((page) => `<button class="cms-page-card${currentPage?.slug === page.slug ? ' is-selected' : ''}" type="button" data-page-slug="${escapeHtml(page.slug)}"><span><strong>${escapeHtml(page.label)}</strong><small>${escapeHtml(page.path)}</small></span><span class="cms-status" data-status="${escapeHtml(page.status)}">${escapeHtml(page.status)}</span></button>`).join('');
  }
  async function refreshPages() {
    try {
      const data = await api('/api/cms/pages');
      pages = data.pages;
    } catch (error) {
      pages = [{ slug: 'home', label: 'Home', path: '/', status: 'setup required' }, { slug: 'about', label: 'About Us', path: '/about', status: 'setup required' }, { slug: 'contact', label: 'Contact Us', path: '/contact', status: 'setup required' }];
      setPageStatus('Page storage is not connected yet. Apply the CMS database migration to edit these pages.');
    }
    renderPages();
  }
  function setPageFormContent(content = {}) {
    elements.pageForm.elements.seoTitle.value = content['seo.title'] || '';
    elements.pageForm.elements.seoDescription.value = content['seo.description'] || '';
    elements.pageForm.elements.ogTitle.value = content['seo.ogTitle'] || '';
    elements.pageForm.elements.ogDescription.value = content['seo.ogDescription'] || '';
    elements.pageForm.elements.schemaMarkup.value = typeof content['seo.schemaMarkup'] === 'string' ? content['seo.schemaMarkup'] : JSON.stringify(content['seo.schemaMarkup'] || {}, null, 2);
    renderPageBlocks(content.content || {});
    renderRepeaters(content);
  }
  const pageBlockDefinitions = { home: [{ key: 'heroTitle', label: 'Hero heading', type: 'h1', value: 'Business Network Solutions' }, { key: 'heroDescription', label: 'Hero paragraph', type: 'p', value: 'High-performance, secure networks for thriving UK SMEs.' }, { key: 'servicesHeading', label: 'Services section heading', type: 'h2', value: 'Core Services' }, { key: 'faqQuestion', label: 'FAQ question', type: 'faq-question', value: 'Can network consultancy help reduce cybersecurity risks?' }, { key: 'faqAnswer', label: 'FAQ answer', type: 'faq-answer', value: 'Yes. We do security audits to update out-of-date firewall configurations and block unauthorised device access before hackers can breach your data perimeter.' }, { key: 'imageAlt', label: 'Page image alt text', type: 'image-alt', value: 'IT networking infrastructure' }], about: [{ key: 'heroTitle', label: 'Hero heading', type: 'h1', value: 'About Network Consultancy' }, { key: 'heroDescription', label: 'Hero paragraph', type: 'p', value: 'Network Consultancy Overview' }, { key: 'storyHeading', label: 'Our story heading', type: 'h2', value: 'The Origin of Network Consultancy' }, { key: 'faqQuestion', label: 'FAQ question', type: 'faq-question', value: 'What does Network Consultancy specialise in?' }, { key: 'faqAnswer', label: 'FAQ answer', type: 'faq-answer', value: 'We design, secure, and manage business-critical networks and IT infrastructure.' }, { key: 'imageAlt', label: 'Page image alt text', type: 'image-alt', value: 'Two Network Consultancy specialists discussing a network migration' }], contact: [{ key: 'heroTitle', label: 'Contact heading', type: 'h1', value: 'Reach Out to Us' }, { key: 'formHeading', label: 'Contact form heading', type: 'h2', value: 'Contact us today for a free consultation' }, { key: 'formIntro', label: 'Contact form paragraph', type: 'p', value: 'Get in touch with Network Consultancy.' }, { key: 'imageAlt', label: 'Page image alt text', type: 'image-alt', value: 'Business professional speaking on the phone while working on a laptop' }] };
  function renderPageBlocks(content = {}) { const pageBlocks = document.getElementById('page-blocks'); if (!pageBlocks) return; const definitions = pageBlockDefinitions[currentPage?.slug] || []; pageBlocks.innerHTML = definitions.map((block) => `<div class="cms-page-block"><label>${escapeHtml(block.label)} <small>${escapeHtml(block.type)}</small><div class="cms-page-block__toolbar" role="toolbar"><button type="button" data-block-command="bold" title="Bold"><strong>B</strong></button><button type="button" data-block-command="italic" title="Italic"><em>I</em></button><button type="button" data-block-command="${block.type === 'h1' || block.type === 'h2' ? 'formatBlock' : 'paragraph'}" data-block-format="${block.type === 'h1' || block.type === 'h2' ? block.type : 'p'}" title="Heading or paragraph">${block.type === 'h1' || block.type === 'h2' ? 'H' : 'P'}</button><button type="button" data-block-command="insertUnorderedList" title="Bullet list">&#8226;</button><button type="button" data-block-command="createLink" title="Link">Link</button></div><div class="cms-page-block__surface" contenteditable="true" data-block-key="${escapeHtml(block.key)}" data-placeholder="Enter ${escapeHtml(block.label.toLowerCase())}">${escapeHtml(content[block.key] ?? block.value ?? '')}</div></label></div>`).join(''); pageBlocks.querySelectorAll('[data-block-command]').forEach((button) => button.addEventListener('click', () => { const surface = button.closest('.cms-page-block').querySelector('.cms-page-block__surface'); surface.focus(); const command = button.dataset.blockCommand; const value = command === 'createLink' ? window.prompt('Enter link URL.', 'https://') : button.dataset.blockFormat; if (command === 'formatBlock') document.execCommand(command, false, value); else if (command === 'createLink' && value) document.execCommand(command, false, value); else document.execCommand(command, false); })); }
  function renderRepeaters(content = {}) {
    const pageContent = content.content || content;
    const heroSlides = pageContent.heroSlides || [{ heading: '', paragraph: '', buttonText: '', buttonUrl: '', imageUrl: '', imageAlt: '' }];
    const cards = pageContent.cards || [{ heading: '', paragraph: '', imageAlt: '' }];
    const faqs = pageContent.faqs || [{ question: '', answer: '', headingTag: 'h3' }];
    const testimonials = pageContent.testimonials || [{ quote: '', name: '', role: '', imageAlt: '' }];
    const introduction = pageContent.introduction || { heading: '', paragraph: '' };
    const contactCta = pageContent.contactCta || { heading: '', paragraph: '', buttonText: '', buttonUrl: '' };
    const highlight = pageContent.highlight || { heading: '', paragraph: '', point1: '', point2: '', point3: '' };
    const expertCards = pageContent.expertCards || [{ heading: '', paragraph: '', imageAlt: '' }];
    const managedSlides = pageContent.managedSlides || [{ heading: '', intro: '', pointsText: '' }];
    const servicesList = pageContent.servicesList || [{ title: '', copy: '', imageUrl: '', imageAlt: '', href: '' }];
    const ksaIntro = pageContent.keySolutionAreasIntro || { heading: '', paragraph: '' };
    const keySolutionAreas = pageContent.keySolutionAreas || [{ title: '', description: '', imageUrl: '' }];
    const whoWeServe = pageContent.whoWeServe || { heading: '', paragraph: '', imageUrl: '', imageAlt: '', tilesText: '' };
    const bizIntro = pageContent.businessImpactIntro || { heading: '', paragraph: '' };
    const businessImpact = pageContent.businessImpact || [{ title: '', description: '' }];
    const whyChooseUs = pageContent.whyChooseUs || { heading: '', paragraph1: '', paragraph2: '', imageUrl: '', imageAlt: '' };
    const whyChooseUsList = pageContent.whyChooseUsList || { heading: '', itemsText: '' };
    const commonIssues = pageContent.commonIssues || { heading: '', paragraph: '', itemsText: '' };
    document.getElementById('hero-slide-repeater').innerHTML = heroSlides.map((item, index) => `<article class="cms-repeater-item"><div class="cms-repeater-item__head"><strong>Hero slide ${index + 1}</strong><button type="button" class="cms-link-button cms-link-button--danger" data-remove-repeater="heroSlides" data-index="${index}">Remove</button></div><label>Heading<input data-repeater="heroSlides" data-index="${index}" data-field="heading" value="${escapeHtml(item.heading || '')}" maxlength="180"></label><label>Paragraph<textarea data-repeater="heroSlides" data-index="${index}" data-field="paragraph" rows="3" maxlength="600">${escapeHtml(item.paragraph || '')}</textarea></label><label>Button text<input data-repeater="heroSlides" data-index="${index}" data-field="buttonText" value="${escapeHtml(item.buttonText || '')}" maxlength="100"></label><label>Button URL<input data-repeater="heroSlides" data-index="${index}" data-field="buttonUrl" value="${escapeHtml(item.buttonUrl || '')}" maxlength="300"></label><label>Image URL<input data-repeater="heroSlides" data-index="${index}" data-field="imageUrl" value="${escapeHtml(item.imageUrl || '')}" maxlength="500"></label><label>Image alt text<input data-repeater="heroSlides" data-index="${index}" data-field="imageAlt" value="${escapeHtml(item.imageAlt || '')}" maxlength="250"></label></article>`).join('');
    document.getElementById('card-repeater').innerHTML = cards.map((item, index) => `<article class="cms-repeater-item"><div class="cms-repeater-item__head"><strong>Card ${index + 1}</strong><button type="button" class="cms-link-button cms-link-button--danger" data-remove-repeater="cards" data-index="${index}">Remove</button></div><label>Heading<input data-repeater="cards" data-index="${index}" data-field="heading" value="${escapeHtml(item.heading || '')}" maxlength="180"></label><label>Paragraph<textarea data-repeater="cards" data-index="${index}" data-field="paragraph" rows="3" maxlength="600">${escapeHtml(item.paragraph || '')}</textarea></label><label>Image alt text<input data-repeater="cards" data-index="${index}" data-field="imageAlt" value="${escapeHtml(item.imageAlt || '')}" maxlength="250"></label></article>`).join('');
    document.getElementById('introduction-repeater').innerHTML = `<article class="cms-repeater-item"><label>Introduction heading<input data-repeater="introduction" data-index="0" data-field="heading" value="${escapeHtml(introduction.heading || '')}" maxlength="180"></label><label>Introduction paragraph<textarea data-repeater="introduction" data-index="0" data-field="paragraph" rows="4" maxlength="1200">${escapeHtml(introduction.paragraph || '')}</textarea></label></article>`;
    document.getElementById('contact-cta-repeater').innerHTML = `<article class="cms-repeater-item"><label>CTA heading<input data-repeater="contactCta" data-index="0" data-field="heading" value="${escapeHtml(contactCta.heading || '')}" maxlength="180"></label><label>CTA paragraph<textarea data-repeater="contactCta" data-index="0" data-field="paragraph" rows="3" maxlength="600">${escapeHtml(contactCta.paragraph || '')}</textarea></label><label>Button text<input data-repeater="contactCta" data-index="0" data-field="buttonText" value="${escapeHtml(contactCta.buttonText || '')}" maxlength="100"></label><label>Button URL<input data-repeater="contactCta" data-index="0" data-field="buttonUrl" value="${escapeHtml(contactCta.buttonUrl || '')}" maxlength="300"></label></article>`;
    document.getElementById('faq-repeater').innerHTML = faqs.map((item, index) => `<article class="cms-repeater-item"><div class="cms-repeater-item__head"><strong>FAQ ${index + 1}</strong><button type="button" class="cms-link-button cms-link-button--danger" data-remove-repeater="faqs" data-index="${index}">Remove</button></div><label>Question heading tag<select data-repeater="faqs" data-index="${index}" data-field="headingTag"><option value="h2" ${item.headingTag === 'h2' ? 'selected' : ''}>H2</option><option value="h3" ${item.headingTag !== 'h2' && item.headingTag !== 'h4' ? 'selected' : ''}>H3</option><option value="h4" ${item.headingTag === 'h4' ? 'selected' : ''}>H4</option></select></label><label>Question<input data-repeater="faqs" data-index="${index}" data-field="question" value="${escapeHtml(item.question || '')}" maxlength="300"></label><label>Answer<textarea data-repeater="faqs" data-index="${index}" data-field="answer" rows="4" maxlength="1200">${escapeHtml(item.answer || '')}</textarea></label></article>`).join('');
    document.getElementById('testimonial-repeater').innerHTML = testimonials.map((item, index) => `<article class="cms-repeater-item"><div class="cms-repeater-item__head"><strong>Testimonial ${index + 1}</strong><button type="button" class="cms-link-button cms-link-button--danger" data-remove-repeater="testimonials" data-index="${index}">Remove</button></div><label>Quote<textarea data-repeater="testimonials" data-index="${index}" data-field="quote" rows="4" maxlength="1200">${escapeHtml(item.quote || '')}</textarea></label><label>Name<input data-repeater="testimonials" data-index="${index}" data-field="name" value="${escapeHtml(item.name || '')}" maxlength="120"></label><label>Role<input data-repeater="testimonials" data-index="${index}" data-field="role" value="${escapeHtml(item.role || '')}" maxlength="160"></label><label>Image alt text<input data-repeater="testimonials" data-index="${index}" data-field="imageAlt" value="${escapeHtml(item.imageAlt || '')}" maxlength="250"></label></article>`).join('');
    document.getElementById('highlight-repeater').innerHTML = `<article class="cms-repeater-item"><label>Heading<input data-repeater="highlight" data-index="0" data-field="heading" value="${escapeHtml(highlight.heading || '')}" maxlength="180"></label><label>Paragraph<textarea data-repeater="highlight" data-index="0" data-field="paragraph" rows="3" maxlength="600">${escapeHtml(highlight.paragraph || '')}</textarea></label><label>Checklist point 1<input data-repeater="highlight" data-index="0" data-field="point1" value="${escapeHtml(highlight.point1 || '')}" maxlength="120"></label><label>Checklist point 2<input data-repeater="highlight" data-index="0" data-field="point2" value="${escapeHtml(highlight.point2 || '')}" maxlength="120"></label><label>Checklist point 3<input data-repeater="highlight" data-index="0" data-field="point3" value="${escapeHtml(highlight.point3 || '')}" maxlength="120"></label></article>`;
    document.getElementById('expert-card-repeater').innerHTML = expertCards.map((item, index) => `<article class="cms-repeater-item"><div class="cms-repeater-item__head"><strong>Card ${index + 1}</strong><button type="button" class="cms-link-button cms-link-button--danger" data-remove-repeater="expertCards" data-index="${index}">Remove</button></div><label>Heading (large title)<input data-repeater="expertCards" data-index="${index}" data-field="heading" value="${escapeHtml(item.heading || '')}" maxlength="180"></label><label>Heading (inside card box)<input data-repeater="expertCards" data-index="${index}" data-field="leadHeading" value="${escapeHtml(item.leadHeading || item.heading || '')}" maxlength="180"></label><label>Paragraph<textarea data-repeater="expertCards" data-index="${index}" data-field="paragraph" rows="3" maxlength="600">${escapeHtml(item.paragraph || '')}</textarea></label><label>Image alt text<input data-repeater="expertCards" data-index="${index}" data-field="imageAlt" value="${escapeHtml(item.imageAlt || '')}" maxlength="250"></label></article>`).join('');
    document.getElementById('managed-slide-repeater').innerHTML = managedSlides.map((item, index) => `<article class="cms-repeater-item"><div class="cms-repeater-item__head"><strong>Slide ${index + 1}</strong></div><label>Heading<input data-repeater="managedSlides" data-index="${index}" data-field="heading" value="${escapeHtml(item.heading || '')}" maxlength="180"></label><label>Intro paragraph<textarea data-repeater="managedSlides" data-index="${index}" data-field="intro" rows="3" maxlength="600">${escapeHtml(item.intro || '')}</textarea></label><label>Bullet points (one per line)<textarea data-repeater="managedSlides" data-index="${index}" data-field="pointsText" rows="4" maxlength="800">${escapeHtml(item.pointsText || '')}</textarea></label></article>`).join('');
    document.getElementById('services-list-repeater').innerHTML = servicesList.map((item, index) => `<article class="cms-repeater-item"><div class="cms-repeater-item__head"><strong>Service ${index + 1}</strong></div><label>Title<input data-repeater="servicesList" data-index="${index}" data-field="title" value="${escapeHtml(item.title || '')}" maxlength="120"></label><label>Description<textarea data-repeater="servicesList" data-index="${index}" data-field="copy" rows="3" maxlength="500">${escapeHtml(item.copy || '')}</textarea></label><label>Image URL<input data-repeater="servicesList" data-index="${index}" data-field="imageUrl" value="${escapeHtml(item.imageUrl || '')}" maxlength="500"></label><label>Image alt text<input data-repeater="servicesList" data-index="${index}" data-field="imageAlt" value="${escapeHtml(item.imageAlt || '')}" maxlength="250"></label><label>Link URL<input data-repeater="servicesList" data-index="${index}" data-field="href" value="${escapeHtml(item.href || '')}" maxlength="300"></label></article>`).join('');
    document.getElementById('key-solution-areas-repeater').innerHTML = `<article class="cms-repeater-item"><label>Section heading<input data-repeater="keySolutionAreasIntro" data-index="0" data-field="heading" value="${escapeHtml(ksaIntro.heading || '')}" maxlength="180"></label><label>Section intro<textarea data-repeater="keySolutionAreasIntro" data-index="0" data-field="paragraph" rows="3" maxlength="600">${escapeHtml(ksaIntro.paragraph || '')}</textarea></label></article>` + keySolutionAreas.map((item, index) => `<article class="cms-repeater-item"><div class="cms-repeater-item__head"><strong>Tab ${index + 1}</strong></div><label>Title<input data-repeater="keySolutionAreas" data-index="${index}" data-field="title" value="${escapeHtml(item.title || '')}" maxlength="120"></label><label>Description<textarea data-repeater="keySolutionAreas" data-index="${index}" data-field="description" rows="3" maxlength="500">${escapeHtml(item.description || '')}</textarea></label><label>Image URL<input data-repeater="keySolutionAreas" data-index="${index}" data-field="imageUrl" value="${escapeHtml(item.imageUrl || '')}" maxlength="500"></label></article>`).join('');
    document.getElementById('who-we-serve-repeater').innerHTML = `<article class="cms-repeater-item"><label>Heading<input data-repeater="whoWeServe" data-index="0" data-field="heading" value="${escapeHtml(whoWeServe.heading || '')}" maxlength="180"></label><label>Paragraph<textarea data-repeater="whoWeServe" data-index="0" data-field="paragraph" rows="3" maxlength="600">${escapeHtml(whoWeServe.paragraph || '')}</textarea></label><label>Image URL<input data-repeater="whoWeServe" data-index="0" data-field="imageUrl" value="${escapeHtml(whoWeServe.imageUrl || '')}" maxlength="500"></label><label>Image alt text<input data-repeater="whoWeServe" data-index="0" data-field="imageAlt" value="${escapeHtml(whoWeServe.imageAlt || '')}" maxlength="250"></label><label>Audience tiles (one per line)<textarea data-repeater="whoWeServe" data-index="0" data-field="tilesText" rows="8" maxlength="1200">${escapeHtml(whoWeServe.tilesText || '')}</textarea></label></article>`;
    document.getElementById('business-impact-repeater').innerHTML = `<article class="cms-repeater-item"><label>Section heading<input data-repeater="businessImpactIntro" data-index="0" data-field="heading" value="${escapeHtml(bizIntro.heading || '')}" maxlength="220"></label><label>Section intro<textarea data-repeater="businessImpactIntro" data-index="0" data-field="paragraph" rows="3" maxlength="600">${escapeHtml(bizIntro.paragraph || '')}</textarea></label></article>` + businessImpact.map((item, index) => `<article class="cms-repeater-item"><div class="cms-repeater-item__head"><strong>Slide ${index + 1}</strong></div><label>Title<input data-repeater="businessImpact" data-index="${index}" data-field="title" value="${escapeHtml(item.title || '')}" maxlength="120"></label><label>Description<textarea data-repeater="businessImpact" data-index="${index}" data-field="description" rows="3" maxlength="500">${escapeHtml(item.description || '')}</textarea></label></article>`).join('');
    document.getElementById('why-choose-us-repeater').innerHTML = `<article class="cms-repeater-item"><label>Heading<input data-repeater="whyChooseUs" data-index="0" data-field="heading" value="${escapeHtml(whyChooseUs.heading || '')}" maxlength="180"></label><label>Paragraph 1<textarea data-repeater="whyChooseUs" data-index="0" data-field="paragraph1" rows="3" maxlength="600">${escapeHtml(whyChooseUs.paragraph1 || '')}</textarea></label><label>Paragraph 2<textarea data-repeater="whyChooseUs" data-index="0" data-field="paragraph2" rows="3" maxlength="600">${escapeHtml(whyChooseUs.paragraph2 || '')}</textarea></label><label>Image URL<input data-repeater="whyChooseUs" data-index="0" data-field="imageUrl" value="${escapeHtml(whyChooseUs.imageUrl || '')}" maxlength="500"></label><label>Image alt text<input data-repeater="whyChooseUs" data-index="0" data-field="imageAlt" value="${escapeHtml(whyChooseUs.imageAlt || '')}" maxlength="250"></label></article>`;
    document.getElementById('why-choose-us-list-repeater').innerHTML = `<article class="cms-repeater-item"><label>Heading<input data-repeater="whyChooseUsList" data-index="0" data-field="heading" value="${escapeHtml(whyChooseUsList.heading || '')}" maxlength="180"></label><label>Bullets (one per line)<textarea data-repeater="whyChooseUsList" data-index="0" data-field="itemsText" rows="8" maxlength="1200">${escapeHtml(whyChooseUsList.itemsText || '')}</textarea></label></article>`;
    document.getElementById('common-issues-repeater').innerHTML = `<article class="cms-repeater-item"><label>Heading<input data-repeater="commonIssues" data-index="0" data-field="heading" value="${escapeHtml(commonIssues.heading || '')}" maxlength="220"></label><label>Intro<textarea data-repeater="commonIssues" data-index="0" data-field="paragraph" rows="3" maxlength="600">${escapeHtml(commonIssues.paragraph || '')}</textarea></label><label>Tile labels (one per line)<textarea data-repeater="commonIssues" data-index="0" data-field="itemsText" rows="10" maxlength="1200">${escapeHtml(commonIssues.itemsText || '')}</textarea></label></article>`;
  }
  const SINGLETON_REPEATERS = new Set(['introduction', 'contactCta', 'highlight', 'keySolutionAreasIntro', 'whoWeServe', 'businessImpactIntro', 'whyChooseUs', 'whyChooseUsList', 'commonIssues']);
  function collectRepeater(name) { const fields = [...document.querySelectorAll(`[data-repeater="${name}"][data-field]`)]; if (SINGLETON_REPEATERS.has(name)) return fields.reduce((item, field) => ({ ...item, [field.dataset.field]: field.value.trim() }), {}); return fields.reduce((items, field) => { const index = Number(field.dataset.index); items[index] = items[index] || {}; items[index][field.dataset.field] = field.value.trim(); return items; }, []); }
  function repeaterContent() { return { heroSlides: collectRepeater('heroSlides'), cards: collectRepeater('cards'), introduction: collectRepeater('introduction'), contactCta: collectRepeater('contactCta'), faqs: collectRepeater('faqs'), testimonials: collectRepeater('testimonials'), highlight: collectRepeater('highlight'), expertCards: collectRepeater('expertCards'), managedSlides: collectRepeater('managedSlides'), servicesList: collectRepeater('servicesList'), keySolutionAreasIntro: collectRepeater('keySolutionAreasIntro'), keySolutionAreas: collectRepeater('keySolutionAreas'), whoWeServe: collectRepeater('whoWeServe'), businessImpactIntro: collectRepeater('businessImpactIntro'), businessImpact: collectRepeater('businessImpact'), whyChooseUs: collectRepeater('whyChooseUs'), whyChooseUsList: collectRepeater('whyChooseUsList'), commonIssues: collectRepeater('commonIssues') }; }
  function addRepeaterItem(name) { const content = repeaterContent(); content[name].push(name === 'heroSlides' ? { heading: '', paragraph: '', buttonText: '', buttonUrl: '', imageUrl: '', imageAlt: '' } : name === 'faqs' ? { question: '', answer: '', headingTag: 'h3' } : name === 'testimonials' ? { quote: '', name: '', role: '', imageAlt: '' } : name === 'managedSlides' ? { heading: '', intro: '', pointsText: '' } : name === 'expertCards' ? { heading: '', leadHeading: '', paragraph: '', imageAlt: '' } : { heading: '', paragraph: '', imageAlt: '' }); renderRepeaters(content); }
  document.getElementById('add-hero-slide-button')?.addEventListener('click', () => addRepeaterItem('heroSlides'));
  document.getElementById('add-card-button')?.addEventListener('click', () => addRepeaterItem('cards'));
  document.getElementById('add-expert-card-button')?.addEventListener('click', () => addRepeaterItem('expertCards'));
  document.getElementById('add-faq-button')?.addEventListener('click', () => addRepeaterItem('faqs'));
  document.getElementById('add-testimonial-button')?.addEventListener('click', () => addRepeaterItem('testimonials'));
  document.getElementById('page-form')?.addEventListener('click', (event) => { const button = event.target.closest('[data-remove-repeater]'); if (!button) return; const content = repeaterContent(); content[button.dataset.removeRepeater].splice(Number(button.dataset.index), 1); renderRepeaters(content); });
  // Pulls a JS array literal (e.g. `var data = [...]` or `window.PAGE_FAQ = [...]`) out of whichever inline <script> contains it, since DOMParser can't execute JS to read runtime-only values.
  function extractArrayLiteral(doc, mustInclude, assignmentPattern) {
    const script = [...doc.querySelectorAll('script:not([src])')].map((node) => node.textContent).find((text) => text.includes(mustInclude));
    const match = script && script.match(assignmentPattern);
    if (!match) return null;
    try { return new Function(`return ${match[1]};`)(); } catch { return null; }
  }
  const SERVICE_DETAIL_SLUGS = new Set(['network-consultancy', 'business-continuity-and-network-resilience', 'firewall-and-network-security', 'managed-network-support', 'managed-wireless-lan', 'network-design-and-deployment', 'network-installations', 'network-support', 'remote-working-solutions']);
  async function loadStaticPageContent(slug) {
    const response = await fetch(slug === 'home' ? '/' : `/${slug}`);
    if (!response.ok) return {};
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const text = (selector, root = doc) => root.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim() || '';
    const slides = [...doc.querySelectorAll('.hero__slide')].map((slide) => ({ heading: text('.hero__title', slide), paragraph: text('.hero__sub', slide), buttonText: text('.hero__btn', slide), buttonUrl: slide.querySelector('.hero__btn')?.getAttribute('href') || '', imageUrl: slide.querySelector('video source, img')?.getAttribute('src') || '', imageAlt: slide.querySelector('img')?.alt || '' }));
    const cards = [...doc.querySelectorAll('.svc-card')].map((card) => ({ heading: text('.svc-card__label', card), paragraph: text('.svc-card__desc', card), imageAlt: card.querySelector('img')?.alt || '' }));
    const faqs = [...doc.querySelectorAll('.faq-q, .nd-faq__item span')].map((node, index) => ({ question: node.textContent.replace(/\s+/g, ' ').trim(), answer: doc.querySelectorAll('.faq-answer, .nd-faq__panel')[index]?.textContent.replace(/\s+/g, ' ').trim() || '', headingTag: 'h3' }));
    const testimonials = [...doc.querySelectorAll('.nd-t-card, .ab-test-card')].map((card) => ({ quote: text('blockquote, .nd-t-card__quote, .ab-test-card__quote', card), name: text('.nd-t-card__name, .ab-test-card__name', card), role: text('.nd-t-card__role, .ab-test-card__role', card), imageAlt: card.querySelector('img')?.alt || '' })).filter((item) => item.quote || item.name);
    const content = { heroSlides: slides, cards, faqs, testimonials };
    if (slug === 'home') {
      content.introduction = { heading: text('.main-services__title'), paragraph: text('.main-services__intro') };
      content.contactCta = { heading: text('.nd-contact__title'), paragraph: text('.nd-contact__intro'), buttonText: text('.nd-contact__cta'), buttonUrl: doc.querySelector('.nd-contact__cta')?.getAttribute('href') || '' };
      const highlightPoints = [...doc.querySelectorAll('.nd-highlight__copy ul li')].map((node) => node.textContent.replace(/\s+/g, ' ').trim());
      content.highlight = { heading: text('.nd-highlight__copy h2'), paragraph: text('.nd-highlight__copy p'), point1: highlightPoints[0] || '', point2: highlightPoints[1] || '', point3: highlightPoints[2] || '' };
      content.expertCards = [...doc.querySelectorAll('.nd-figma-card')].map((card) => ({ heading: text('.nd-figma-card__title', card), leadHeading: text('.nd-figma-card__lead', card), paragraph: text('.nd-figma-card__text', card), imageAlt: card.querySelector('img')?.alt || '' }));
      content.managedSlides = [
        { heading: 'Managed Network\nSecurity', intro: 'When it comes to enhancing your business\'s IT infrastructure, Network Consultancy builds a custom roadmap that ensures zero disruption to your daily operations. From your initial infrastructure design to enabling live threat monitoring and daily network management, our reliable UK engineering team will handle your entire network ecosystem seamlessly.', pointsText: '24/7 Firewall Administration and Intrusion Detection\nRegular Software and Firmware Updates\nAI-Driven Threat Intelligence & Monitoring\nContinuous compliance with UK GDPR, the Data Protection Act 2018, ISO 27001, Cyber Essentials, and broader cybersecurity standards' },
        { heading: 'Network Consultancy\nServices', intro: 'Our network consultants provide specialised guidance across your core setups:', pointsText: 'Cisco Hardware Consultancy: We configure and deploy your physical routers and switches.\nMicrosoft 365 Readiness: We audit your infrastructure to ensure secure cloud access.\nManaged Wireless LAN: We engineer high-performance wireless networks with no coverage gaps.\nRemote Access & VPNs: We implement reliable connectivity for your hybrid team.' },
        { heading: 'Network Consultancy\nServices', intro: 'Our Network Consultancy services are for businesses that need assistance scaling without experiencing severe office network lag. We step in to resolve long-standing internet dropouts and stop you from wasting hours chasing unresponsive vendors. Need a stronger, future-ready infrastructure with expert network consultancy? Conduct a thorough evaluation of your current network environment with our experts.', pointsText: '' }
      ];
    } else if (slug === 'about') {
      content.introduction = { heading: text('.ab-intro__title'), paragraph: text('.ab-intro p') };
      content.contactCta = { heading: text('.nd-contact__title'), paragraph: text('.nd-contact__intro'), buttonText: text('.nd-contact__cta'), buttonUrl: doc.querySelector('.nd-contact__cta')?.getAttribute('href') || '' };
    } else if (slug === 'services') {
      const heroCta = doc.querySelector('.svcs-hero__cta');
      content.heroSlides = [{ heading: text('.svcs-hero__title'), paragraph: text('.svcs-hero__sub'), buttonText: text('.svcs-hero__cta'), buttonUrl: heroCta?.getAttribute('href') || '', imageUrl: '', imageAlt: '' }];
      content.servicesList = [...doc.querySelectorAll('.svl-overview__list-item')].map((btn) => ({ title: btn.dataset.title || btn.textContent.trim(), copy: btn.dataset.copy || '', imageUrl: btn.dataset.img || '', imageAlt: btn.dataset.alt || '', href: btn.dataset.href || '' }));
      const ctaBtn = doc.querySelector('.svc-cta-band__btn');
      content.contactCta = { heading: '', paragraph: text('.svc-cta-band__text'), buttonText: text('.svc-cta-band__btn'), buttonUrl: ctaBtn?.getAttribute('href') || '' };
      // window.PAGE_FAQ lives only in an inline script, not the static DOM, so pull it out of the script text.
      const faqScript = [...doc.querySelectorAll('script:not([src])')].map((node) => node.textContent).find((text) => text.includes('window.PAGE_FAQ'));
      const faqMatch = faqScript && faqScript.match(/window\.PAGE_FAQ\s*=\s*(\[[\s\S]*?\]);/);
      if (faqMatch) {
        try {
          const faqItems = new Function(`return ${faqMatch[1]};`)();
          content.faqs = faqItems.map((item) => ({ question: item.question || '', answer: item.answer || '', headingTag: 'h3' }));
        } catch { /* leave faqs unset if the inline array can't be parsed */ }
      }
      // window.PAGE_TESTIMONIALS (page-specific override) or the shared default list in js/cms.js is used at runtime; neither is in the static DOM.
      try {
        const testimonialsScript = [...doc.querySelectorAll('script:not([src])')].map((node) => node.textContent).find((text) => text.includes('window.PAGE_TESTIMONIALS'));
        const overrideMatch = testimonialsScript && testimonialsScript.match(/window\.PAGE_TESTIMONIALS\s*=\s*(\[[\s\S]*?\]);/);
        let testimonialItems = null;
        if (overrideMatch) {
          testimonialItems = new Function(`return ${overrideMatch[1]};`)();
        } else {
          const cmsJsResponse = await fetch('/js/cms.js');
          if (cmsJsResponse.ok) {
            const cmsJsText = await cmsJsResponse.text();
            const sharedMatch = cmsJsText.match(/var TESTIMONIALS\s*=\s*(\[[\s\S]*?\]);/);
            if (sharedMatch) testimonialItems = new Function(`return ${sharedMatch[1]};`)();
          }
        }
        if (testimonialItems) content.testimonials = testimonialItems.map((item) => ({ quote: item.quote || '', name: item.name || '', role: item.role || '', imageAlt: '' }));
      } catch { /* leave testimonials unset if the source can't be parsed */ }
    } else if (SERVICE_DETAIL_SLUGS.has(slug)) {
      const heroCta = doc.querySelector('.page-hero__cta-btn');
      content.heroSlides = [{ heading: text('.nc-hero__title'), paragraph: text('.nc-hero__sub'), buttonText: text('.page-hero__cta-btn'), buttonUrl: heroCta?.getAttribute('href') || '', imageUrl: '', imageAlt: '' }];

      content.keySolutionAreasIntro = { heading: text('#ksa-h'), paragraph: text('#ksa-h ~ p') };
      // network-installations defines its tabs via a shared initKsa('ksa', 'ksa', [...]) call instead of `var data = [...]`.
      const ksaData = extractArrayLiteral(doc, "getElementById('ksa')", /var data\s*=\s*(\[[\s\S]*?\]);/)
        || extractArrayLiteral(doc, "initKsa('ksa',", /initKsa\('ksa',\s*'ksa',\s*(\[[\s\S]*?\])\);/)
        || [];
      content.keySolutionAreas = [...doc.querySelectorAll('#ksa .ksa__tab')].map((tab, index) => ({ title: tab.textContent.replace(/\s+/g, ' ').trim(), description: ksaData[index]?.desc || '', imageUrl: ksaData[index]?.img || '' }));

      const wwsImage = doc.querySelector('.wws__media img');
      content.whoWeServe = { heading: text('#wws-h'), paragraph: text('#wws-h ~ p'), imageUrl: wwsImage?.getAttribute('src') || '', imageAlt: wwsImage?.alt || '', tilesText: [...doc.querySelectorAll('.wws__item')].map((node) => node.textContent.replace(/\s+/g, ' ').trim()).join('\n') };

      content.businessImpactIntro = { heading: text('#biz-h'), paragraph: text('#biz-h ~ p') };
      const bizData = extractArrayLiteral(doc, "getElementById('biz')", /var slides\s*=\s*(\[[\s\S]*?\]);/) || [];
      content.businessImpact = bizData.map((item) => ({ title: item.title || '', description: item.desc || '' }));

      // Why choose us appears as either two paragraphs (network-consultancy) or a bullet list (firewall, network-support) — never both. Other pages have neither.
      if (doc.querySelector('.whyc__list')) {
        content.whyChooseUsList = { heading: text('#whyc-h'), itemsText: [...doc.querySelectorAll('.whyc__list li')].map((node) => node.textContent.replace(/\s+/g, ' ').trim()).join('\n') };
      } else if (doc.querySelector('.whyc__content p')) {
        const whycParagraphs = [...doc.querySelectorAll('.whyc__content p')];
        const whycImage = doc.querySelector('.whyc__media img');
        content.whyChooseUs = { heading: text('#whyc-h'), paragraph1: whycParagraphs[0]?.textContent.replace(/\s+/g, ' ').trim() || '', paragraph2: whycParagraphs[1]?.textContent.replace(/\s+/g, ' ').trim() || '', imageUrl: whycImage?.getAttribute('src') || '', imageAlt: whycImage?.alt || '' };
      }

      // firewall replaces this section with a differently-structured "Common Firewall & Network Security Issues" block — not part of the shared schema yet.
      if (doc.querySelector('#probs-h')) {
        content.commonIssues = { heading: text('#probs-h'), paragraph: text('#probs-h ~ p'), itemsText: [...doc.querySelectorAll('.prob__label')].map((node) => node.textContent.replace(/\s+/g, ' ').trim()).join('\n') };
      }

      const ctaBtn = doc.querySelector('.svc-cta-band__btn');
      content.contactCta = { heading: '', paragraph: text('.svc-cta-band__text'), buttonText: text('.svc-cta-band__btn'), buttonUrl: ctaBtn?.getAttribute('href') || '' };

      const faqItemsRaw = extractArrayLiteral(doc, 'window.PAGE_FAQ', /window\.PAGE_FAQ\s*=\s*(\[[\s\S]*?\]);/);
      if (faqItemsRaw) content.faqs = faqItemsRaw.map((item) => ({ question: item.question || '', answer: item.answer || '', headingTag: 'h3' }));

      const testimonialsRaw = extractArrayLiteral(doc, 'window.PAGE_TESTIMONIALS', /window\.PAGE_TESTIMONIALS\s*=\s*(\[[\s\S]*?\]);/);
      if (testimonialsRaw) content.testimonials = testimonialsRaw.map((item) => ({ quote: item.quote || '', name: item.name || '', role: item.role || '', imageAlt: '' }));
    } else {
      content.introduction = { heading: text('.ctu-title'), paragraph: text('.ctu-intro') };
      content.contactCta = { heading: text('.ctf-title'), paragraph: text('.ctf-copy'), buttonText: '', buttonUrl: '' };
    }
    return content;
  }
  function setPreviewLinkDisplay(url) {
    const wrapper = document.getElementById('page-preview-link-persistent');
    const anchor = document.getElementById('page-preview-link-persistent-anchor');
    if (!wrapper || !anchor) return;
    if (!url) { wrapper.hidden = true; return; }
    anchor.href = url;
    anchor.textContent = url;
    wrapper.hidden = false;
  }
  document.getElementById('copy-page-preview-link-persistent')?.addEventListener('click', async () => { const url = document.getElementById('page-preview-link-persistent-anchor')?.href; if (url) { await navigator.clipboard.writeText(url).catch(() => {}); setPageStatus('Preview link copied.'); } });
  async function openPage(slug) {
    let data;
    try {
      data = await api(`/api/cms/page?slug=${encodeURIComponent(slug)}`);
    } catch (error) {
      const fallback = pages.find((page) => page.slug === slug) || { slug, label: slug, path: '/' };
      currentPage = { ...fallback, slug, draft: null, published: null };
      document.getElementById('page-form-heading').textContent = `Edit: ${fallback.label}`;
      // The page/migration API call failed (e.g. DB migration not applied yet), but the static page itself still exists — show its real content instead of a blank form.
      const staticFallback = await loadStaticPageContent(slug);
      setPageFormContent({ content: staticFallback });
      elements.pageForm.hidden = false;
      setupPageSectionAccordions();
      elements.pagePublish.disabled = true;
      if (elements.pagePreviewLink) elements.pagePreviewLink.disabled = true;
      setPreviewLinkDisplay(null);
      setPageStatus('Showing the page\'s existing content. Apply the CMS database migration before saving changes.');
      renderPages();
      return;
    }
    currentPage = { ...data.page, slug };
    let content = data.page.draft?.content || data.page.published?.content || {};
    const importedContent = content.content || {};
    const isPopulated = (value) => Array.isArray(value) ? value.some(isPopulated) : value && typeof value === 'object' ? Object.values(value).some(isPopulated) : Boolean(value);
    // Backfill per key (not per page) so a draft with real edits in some sections but only blank placeholders in others (e.g. saved before a section had an importer) still gets those specific sections re-imported.
    const staticFallback = await loadStaticPageContent(slug);
    const mergedContent = {};
    new Set([...Object.keys(staticFallback), ...Object.keys(importedContent)]).forEach((key) => {
      mergedContent[key] = isPopulated(importedContent[key]) ? importedContent[key] : (staticFallback[key] !== undefined ? staticFallback[key] : importedContent[key]);
    });
    content = { ...content, content: mergedContent };
    document.getElementById('page-form-heading').textContent = `Edit: ${data.page.label}`;
    setPageFormContent(content);
    elements.pageForm.hidden = false;
    setupPageSectionAccordions();
    elements.pagePublish.disabled = cmsUser?.role !== 'reviewer' || !data.page.draft;
    if (elements.pagePreviewLink) elements.pagePreviewLink.disabled = !data.page.draft;
    setPreviewLinkDisplay(data.page.previewUrl);
    setPageStatus(data.page.draft ? 'Draft loaded. Save changes or publish when ready.' : 'No draft exists yet. Save changes to create one.');
    renderPages();
  }
  function pageFormContent() {
    const content = { ...Object.fromEntries([...document.querySelectorAll('#page-blocks [data-block-key]')].map((block) => [block.dataset.blockKey, block.innerText.trim()])), ...repeaterContent() };
    return { content, 'seo.title': elements.pageForm.elements.seoTitle.value.trim(), 'seo.description': elements.pageForm.elements.seoDescription.value.trim(), 'seo.ogTitle': elements.pageForm.elements.ogTitle.value.trim(), 'seo.ogDescription': elements.pageForm.elements.ogDescription.value.trim(), 'seo.schemaMarkup': elements.pageForm.elements.schemaMarkup.value.trim() };
  }
  async function savePageDraft() {
    if (!currentPage) return;
    await api(`/api/cms/page?slug=${encodeURIComponent(currentPage.slug)}`, { method: 'POST', body: JSON.stringify({ content: pageFormContent() }) });
    setPageStatus('Page draft saved. Review it on staging before publishing.');
    await refreshPages();
    await openPage(currentPage.slug);
  }
  async function generatePreviewLink() {
    if (!currentPage) return;
    try {
      setPageStatus('Saving latest changes...');
      // Save on-screen edits first so the preview reflects the current form content, not a stale revision.
      await api(`/api/cms/page?slug=${encodeURIComponent(currentPage.slug)}`, { method: 'POST', body: JSON.stringify({ content: pageFormContent() }) });
      setPageStatus('Creating preview link...');
      const data = await api('/api/cms/preview-link', { method: 'POST', body: JSON.stringify({ slug: currentPage.slug }) });
      elements.pagePreviewInput.value = data.previewUrl;
      await navigator.clipboard.writeText(data.previewUrl).catch(() => {});
      setPreviewLinkDisplay(data.previewUrl);
      setPageStatus(`Preview link created. It expires in ${data.expiresInDays} days.`);
      elements.pagePreviewDialog.showModal();
    } catch (error) { setPageStatus(error.message); }
  }
  async function publishPage() {
    if (!currentPage) return;
    await api(`/api/cms/page?slug=${encodeURIComponent(currentPage.slug)}`, { method: 'POST', body: JSON.stringify({ action: 'publish' }) });
    setPageStatus('Page published to live.');
    await refreshPages();
    await openPage(currentPage.slug);
  }
  function showBootstrap(message) {
    elements.workspace.hidden = true;
    elements.setup.hidden = false;
    elements.setupMessage.innerHTML = `${escapeHtml(message)} <button class="cms-button cms-button--primary" id="cms-bootstrap" type="button">Start CMS and import existing blogs</button>`;
    document.getElementById('cms-bootstrap').addEventListener('click', async () => {
      const button = document.getElementById('cms-bootstrap');
      button.disabled = true;
      button.textContent = 'Starting CMS...';
      try {
        await api('/api/cms/bootstrap', { method: 'POST', body: '{}' });
        elements.setup.hidden = true;
        elements.workspace.hidden = false;
        await refreshPosts();
      } catch (error) {
        button.disabled = false;
        button.textContent = error.message;
      }
    });
  }
  function updatePublishingControls(post) {
    const hasOpenedPost = Boolean(post?.publicSlug);
    elements.publishLive.disabled = !(cmsUser?.role === 'reviewer' && hasOpenedPost);
  }
  function isEditableDraft(post) {
    return ['draft', 'changes_requested'].includes(post?.status);
  }
  function closeEditor() { currentPost = null; elements.form.reset(); articleEditor.innerHTML = ''; articleEditorSelection = null; clearValidationErrors(); renderFeaturedImage('', ''); elements.editor.hidden = true; updatePublishingControls(null); elements.saveStatus.textContent = ''; document.getElementById('cms-lifecycle-actions').hidden = true; renderPosts(); }
  function resetEditor() { currentPost = null; elements.form.reset(); articleEditor.innerHTML = ''; articleEditorSelection = null; clearValidationErrors(); renderFeaturedImage('', ''); elements.editor.hidden = false; updatePublishingControls(null); document.getElementById('editor-heading').textContent = 'New article'; elements.saveStatus.textContent = ''; }
  async function openPost(slug) {
    const data = await api(`/api/cms/posts/${encodeURIComponent(slug)}`); currentPost = data.post; elements.editor.hidden = false;
    document.getElementById('editor-heading').textContent = `Edit: ${data.post.title}`;
    ['title', 'excerpt', 'category', 'articleHtml', 'featuredImageAlt', 'featuredImageUrl', 'seoTitle', 'seoDescription', 'schemaMarkup'].forEach((name) => { elements.form.elements[name].value = data.post[name] || ''; });
    articleEditor.innerHTML = data.post.articleHtml || '';
    articleEditorSelection = null;
    elements.form.elements.publishedAt.value = data.post.publishedAt ? data.post.publishedAt.slice(0, 10) : '';
    elements.form.elements.isFeatured.checked = Boolean(data.post.isFeatured);
    elements.form.elements.featuredRank.value = data.post.featuredRank || '';
    elements.form.elements.publicSlug.value = data.post.publicSlug; elements.form.elements.publicSlug.readOnly = false;
    renderFeaturedImage(data.post.featuredImageUrl, data.post.featuredImageAlt);
    updatePublishingControls(data.post);
    clearValidationErrors();
    document.getElementById('editor-state').textContent = isEditableDraft(data.post) ? 'This is an editable draft. Save changes before publishing.' : 'This is the current published version. Save changes to create an editable draft.';
    document.getElementById('cms-lifecycle-actions').hidden = false;
    renderPosts();
  }
  async function uploadFeatureImage(file) {
    if (!file) return elements.form.elements.featuredImageUrl.value;
    if (file.size > 3 * 1024 * 1024) throw new Error('Feature images must be 3 MB or smaller.');
    const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
    const result = await api('/api/cms/media', { method: 'POST', body: JSON.stringify({ filename: file.name, contentType: file.type, data, altText: elements.form.elements.featuredImageAlt.value }) });
    return result.media.blobUrl;
  }
  async function uploadArticleImage(file) {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) throw new Error('Article images must be 3 MB or smaller.');
    const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
    const altText = window.prompt('Describe this image for readers using a screen reader.', '') || '';
    const result = await api('/api/cms/media', { method: 'POST', body: JSON.stringify({ filename: file.name, contentType: file.type, data, altText }) });
    insertArticleHtml(`<img src="${escapeHtml(result.media.blobUrl)}" alt="${escapeHtml(altText)}">`);
  }
  async function saveCurrentDraft() {
    syncArticleEditor();
    const payload = Object.fromEntries(new FormData(elements.form));
    payload.isFeatured = elements.form.elements.isFeatured.checked;
    payload.featuredImageUrl = await uploadFeatureImage(elements.form.elements.featuredImage.files[0]);
    if (currentPost && !isEditableDraft(currentPost)) {
      const created = await api(`/api/cms/posts/${encodeURIComponent(currentPost.publicSlug)}`, { method: 'POST', body: '{}' });
      currentPost = { ...currentPost, revisionId: created.revision.id, status: 'draft' };
    }
    if (currentPost) {
      await api(`/api/cms/posts/${encodeURIComponent(currentPost.publicSlug)}`, { method: 'PATCH', body: JSON.stringify({ ...payload, revisionId: currentPost.revisionId }) });
      currentPost.publicSlug = payload.publicSlug;
      return;
    }
    const created = await api('/api/cms/posts', { method: 'POST', body: JSON.stringify(payload) });
    currentPost = { publicSlug: payload.publicSlug, revisionId: created.revision.id, status: 'draft' };
    updatePublishingControls(currentPost);
  }
  elements.newPost.addEventListener('click', () => { resetEditor(); document.getElementById('cms-lifecycle-actions').hidden = true; renderPosts(); }); elements.search.addEventListener('input', renderPosts);
  elements.articlesButton?.addEventListener('click', showArticles);
  elements.pagesButton?.addEventListener('click', () => { showPages(); refreshPages(); });
  document.getElementById('back-to-articles-button')?.addEventListener('click', showArticles);
  elements.pagesList?.addEventListener('click', (event) => { const button = event.target.closest('[data-page-slug]'); if (button) openPage(button.dataset.pageSlug).catch((error) => { setPageStatus(error.message); }); });
  elements.pageForm?.addEventListener('submit', (event) => { event.preventDefault(); savePageDraft().catch((error) => { setPageStatus(error.message); }); });
  elements.pagePublish?.addEventListener('click', () => publishPage().catch((error) => { setPageStatus(error.message); }));
  elements.pagePreviewLink?.addEventListener('click', () => generatePreviewLink());
  document.getElementById('close-page-preview-link')?.addEventListener('click', () => elements.pagePreviewDialog.close());
  document.getElementById('copy-page-preview-link')?.addEventListener('click', async () => { await navigator.clipboard.writeText(elements.pagePreviewInput.value).catch(() => {}); setPageStatus('Preview link copied.'); });
  document.getElementById('close-editor-button').addEventListener('click', closeEditor);
  articleEditor.addEventListener('input', syncArticleEditor);
  articleEditor.addEventListener('keyup', rememberArticleEditorSelection);
  articleEditor.addEventListener('mouseup', rememberArticleEditorSelection);
  document.querySelectorAll('[data-editor-command]').forEach((button) => {
    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('click', () => { restoreArticleEditorSelection(); document.execCommand(button.dataset.editorCommand, false); syncArticleEditor(); rememberArticleEditorSelection(); });
  });
  document.getElementById('article-block-format').addEventListener('change', (event) => { restoreArticleEditorSelection(); document.execCommand('formatBlock', false, event.target.value); syncArticleEditor(); rememberArticleEditorSelection(); });
  document.querySelector('[data-editor-action="link"]').addEventListener('click', () => {
    const url = window.prompt('Enter the link URL.', 'https://');
    if (!url) return;
    restoreArticleEditorSelection(); document.execCommand('createLink', false, url); syncArticleEditor(); rememberArticleEditorSelection();
  });
  document.querySelector('[data-editor-action="image"]').addEventListener('click', () => articleEditorImage.click());
  document.querySelector('[data-editor-action="cta"]').addEventListener('click', () => {
    const label = window.prompt('CTA button label.', 'Contact us');
    const url = window.prompt('CTA button URL.', 'https://');
    if (!label || !url) return;
    insertArticleHtml(`<a class="article-cta" href="${escapeHtml(url)}">${escapeHtml(label)}</a>`);
  });
  articleEditorImage.addEventListener('change', async () => { try { await uploadArticleImage(articleEditorImage.files[0]); } catch (error) { elements.saveStatus.textContent = error.message; } finally { articleEditorImage.value = ''; } });
  articleEditor.addEventListener('dragover', (event) => event.preventDefault());
  articleEditor.addEventListener('drop', async (event) => { event.preventDefault(); try { await uploadArticleImage([...event.dataTransfer.files].find((file) => file.type.startsWith('image/'))); } catch (error) { elements.saveStatus.textContent = error.message; } });
  elements.form.elements.featuredImage.addEventListener('change', () => { const file = elements.form.elements.featuredImage.files[0]; if (file) renderFeaturedImage(URL.createObjectURL(file), elements.form.elements.featuredImageAlt.value); });
  document.getElementById('remove-featured-image').addEventListener('click', () => { elements.form.elements.featuredImage.value = ''; elements.form.elements.featuredImageUrl.value = ''; renderFeaturedImage('', ''); elements.saveStatus.textContent = 'Choose a replacement image before saving.'; });
  function requestArticleDeletion(slug) { if (!slug) return; pendingDeletionSlug = slug; deleteArticleDialog.showModal(); }
  elements.list.addEventListener('click', (event) => { const actionButton = event.target.closest('[data-action]'); if (!actionButton) return; const { action, slug } = actionButton.dataset; if (action === 'edit') openPost(slug).catch((error) => alert(error.message)); else if (action === 'delete_post') requestArticleDeletion(slug); });
  document.getElementById('preview-button').addEventListener('click', () => { syncArticleEditor(); const form = new FormData(elements.form); elements.previewContent.innerHTML = `<h1>${escapeHtml(form.get('title'))}</h1>${form.get('featuredImageUrl') ? `<img src="${escapeHtml(form.get('featuredImageUrl'))}" alt="${escapeHtml(form.get('featuredImageAlt'))}">` : ''}${safePreviewHtml(form.get('articleHtml'))}`; elements.preview.showModal(); });
  document.getElementById('close-preview-button').addEventListener('click', () => elements.preview.close());
  elements.form.addEventListener('submit', async (event) => { event.preventDefault(); clearValidationErrors(); try { elements.saveStatus.textContent = 'Saving...'; await saveCurrentDraft(); elements.saveStatus.textContent = 'Draft saved. Review it with Preview, then publish live.'; await refreshPosts(); } catch (error) { elements.saveStatus.textContent = error.message; showValidationErrors(error); } });
  function showPublishResult(title, message, url) {
    document.getElementById('publish-result-title').textContent = title;
    document.getElementById('publish-result-message').textContent = message;
    const link = document.getElementById('publish-result-link');
    link.href = url || '/';
    link.hidden = !url;
    document.getElementById('publish-result-dialog').showModal();
  }
  async function publishCurrentArticle() {
    if (!currentPost) return;
    try {
      elements.saveStatus.textContent = 'Publishing live...';
      if (!isEditableDraft(currentPost) && currentPost.status !== 'approved') await saveCurrentDraft();
      if (currentPost.status !== 'approved') await api(`/api/cms/revisions/${currentPost.revisionId}/workflow`, { method: 'POST', body: JSON.stringify({ action: 'publish_live' }) });
      await api(`/api/cms/revisions/${currentPost.revisionId}/publish`, { method: 'POST', body: '{}' });
      currentPost.status = 'published';
      await refreshPosts();
      updatePublishingControls(currentPost);
      elements.saveStatus.textContent = 'CMS release is published.';
      showPublishResult('Article published', 'Your article is now published on the live website.', `https://network-consultancy.com/resources/blogs/${currentPost.publicSlug}`);
    } catch (error) { elements.saveStatus.textContent = error.message; showPublishResult('Publishing failed', error.message || 'The article was not published. Please try again.', null); }
  }
  elements.publishLive.addEventListener('click', publishCurrentArticle);
  document.getElementById('close-publish-result').addEventListener('click', () => document.getElementById('publish-result-dialog').close());
  async function runLifecycleAction(action, slug) {
    if (!slug) return;
    try {
      elements.saveStatus.textContent = 'Updating article...';
      await api(`/api/cms/posts/${encodeURIComponent(slug)}/lifecycle`, { method: 'POST', body: JSON.stringify({ action }) });
      elements.saveStatus.textContent = 'Article deleted.';
      if (currentPost?.publicSlug === slug) closeEditor();
      await refreshPosts();
    } catch (error) { elements.saveStatus.textContent = error.message; }
  }
  document.getElementById('delete-post-button').addEventListener('click', () => requestArticleDeletion(currentPost?.publicSlug));
  ['close-delete-article', 'cancel-delete-article'].forEach((id) => document.getElementById(id).addEventListener('click', () => { pendingDeletionSlug = null; deleteArticleDialog.close(); }));
  document.getElementById('confirm-delete-article').addEventListener('click', () => { const slug = pendingDeletionSlug; pendingDeletionSlug = null; deleteArticleDialog.close(); runLifecycleAction('delete_post', slug); });

  try {
    const configResponse = await fetch('/api/cms/config');
    if (!configResponse.ok) throw new Error('This preview server does not provide the CMS API yet.');
    const config = await configResponse.json();
    if (!config.configured) { elements.setup.hidden = false; elements.auth.hidden = true; elements.setupMessage.textContent = config.message; setConnection('CMS services not connected', false); return; }
    await loadSupabase();
    const supabase = window.supabase.createClient(config.supabaseUrl, config.publishableKey);
    window.netconSupabase = supabase;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      elements.auth.hidden = false;
      document.getElementById('clerk-sign-in').innerHTML = '<form id="cms-sign-in-form"><h2 id="cms-auth-title">Sign in to continue</h2><p id="cms-auth-copy">Use the editorial account created by your Network Consultancy administrator.</p><label>Company email<input name="email" type="email" autocomplete="email" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button class="cms-button cms-button--primary" id="cms-auth-submit" type="submit">Sign in</button><p id="cms-auth-error" role="alert"></p></form>';
      document.getElementById('cms-sign-in-form').addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const result = await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') }); if (result.error) { document.getElementById('cms-auth-error').textContent = result.error.message; return; } window.location.reload(); });
      setConnection('Sign in required', false); return;
    }
    token = sessionData.session.access_token; elements.auth.hidden = true; elements.workspace.hidden = false; elements.newPost.disabled = false; if (elements.articlesButton) elements.articlesButton.disabled = false; if (elements.pagesButton) elements.pagesButton.disabled = false; setConnection('CMS connected', true);
    if (window.lucide) window.lucide.createIcons();
    try { await refreshPosts(); } catch (error) { if (error.message.includes('not been granted CMS access')) showBootstrap('No CMS role has been assigned to this account yet.'); else throw error; }
  } catch (error) { elements.setup.hidden = false; elements.auth.hidden = true; elements.setupMessage.textContent = error.message || 'The CMS could not be reached.'; setConnection('CMS connection failed', false); }
}());