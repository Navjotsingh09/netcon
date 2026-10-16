(async function () {
  'use strict';

  const elements = {
    auth: document.getElementById('cms-auth'), setup: document.getElementById('cms-setup'),
    setupMessage: document.getElementById('cms-setup-message'), workspace: document.getElementById('cms-workspace'),
    session: document.getElementById('cms-session'), connection: document.getElementById('cms-connection'),
    newPost: document.getElementById('new-post-button'), editor: document.getElementById('editor-panel'),
    form: document.getElementById('article-form'), list: document.getElementById('post-list'), search: document.getElementById('post-search'),
    statusFilter: document.getElementById('status-filter'), categoryFilter: document.getElementById('category-filter'),
    preview: document.getElementById('preview-dialog'), previewContent: document.getElementById('preview-content'),
    saveStatus: document.getElementById('save-status'), publishLive: document.getElementById('publish-live-button')
  };
  let token = ''; let cmsUser = null; let posts = []; let currentPost = null; let editorDirty = false; let autosaveRunning = false; let isProductionDeployment = false;
  const articleEditor = document.getElementById('article-editor');
  const articleHtmlField = document.querySelector('[name="articleHtml"]');
  const articleEditorImage = document.getElementById('article-editor-image');
  const deleteArticleDialog = document.getElementById('delete-article-dialog');
  let articleEditorSelection = null;
  let pendingDeletionSlug = null;
  const localDraftKey = 'netcon-cms-editor-recovery';
  const onboardingKey = 'netcon-cms-onboarding-dismissed';

  function escapeHtml(value) { const node = document.createElement('div'); node.textContent = value || ''; return node.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function syncArticleEditor() { articleHtmlField.value = articleEditor.innerHTML.trim(); }
  function updateSeoPreview() {
    const title = elements.form.elements.seoTitle.value || elements.form.elements.title.value || 'Article title';
    const description = elements.form.elements.seoDescription.value || elements.form.elements.excerpt.value || 'Your article description will appear here.';
    const titleCount = title.length;
    const descriptionCount = elements.form.elements.seoDescription.value.length;
    document.getElementById('seo-title-count').textContent = `${titleCount} / 60 recommended`;
    document.getElementById('seo-description-count').textContent = `${descriptionCount} / 155 recommended`;
    document.getElementById('search-preview-title').textContent = title;
    document.getElementById('search-preview-slug').textContent = elements.form.elements.publicSlug.value || 'article-slug';
    document.getElementById('search-preview-description').textContent = description;
  }
  function setEditorDirty(dirty) {
    editorDirty = dirty;
    if (dirty) {
      const fields = Object.fromEntries(new FormData(elements.form));
      fields.isFeatured = elements.form.elements.isFeatured.checked;
      fields.articleHtml = articleEditor.innerHTML.trim();
      localStorage.setItem(localDraftKey, JSON.stringify({ publicSlug: currentPost?.publicSlug || '', fields }));
      elements.saveStatus.textContent = 'Unsaved changes';
    } else {
      localStorage.removeItem(localDraftKey);
    }
  }
  function markOnboardingUsed() {
    localStorage.setItem(onboardingKey, 'true');
    document.querySelector('.cms-onboarding').hidden = true;
  }
  function rememberArticleEditorSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount && articleEditor.contains(selection.anchorNode)) articleEditorSelection = selection.getRangeAt(0).cloneRange();
  }
  function restoreArticleEditorSelection() {
    articleEditor.focus();
    if (!articleEditorSelection) return;
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(articleEditorSelection);
  }
  function insertArticleHtml(html) { restoreArticleEditorSelection(); document.execCommand('insertHTML', false, html); syncArticleEditor(); rememberArticleEditorSelection(); setEditorDirty(true); }
  function loadSupabase() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.109.0';
      script.onload = resolve;
      script.onerror = () => reject(new Error('The Supabase sign-in library could not be loaded.'));
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
  const fieldLabels = {
    title: 'Article title', publicSlug: 'Public URL slug', category: 'Category', publishedAt: 'Publication date',
    featuredImage: 'Featured image', featuredImageUrl: 'Featured image', featuredImageAlt: 'Image alternative text',
    excerpt: 'Excerpt', articleHtml: 'Article content', seoTitle: 'SEO title', seoDescription: 'SEO description', schemaMarkup: 'Schema markup'
  };
  const hiddenFieldTabs = { featuredImageUrl: 'media', articleHtml: 'content' };
  let slugEditedManually = false;
  function slugify(value) {
    return String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120).replace(/-+$/, '');
  }
  function ensureCategoryOption(value) {
    const select = elements.form.elements.category;
    const normalized = String(value || '').trim();
    if (normalized && ![...select.options].some((option) => option.value === normalized)) select.add(new Option(normalized, normalized));
    return normalized;
  }
  function tabForField(field) {
    if (!field) return null;
    return hiddenFieldTabs[field.name] || field.closest('[data-editor-group]')?.dataset.editorGroup || null;
  }
  function focusField(field) {
    const tab = tabForField(field);
    if (tab) selectEditorTab(tab);
    if (field.name === 'articleHtml') articleEditor.focus();
    else if (field.name === 'featuredImageUrl') elements.form.elements.featuredImage.focus();
    else field.focus();
  }
  function validateFormBeforeSave() {
    syncArticleEditor();
    const invalidFields = [...elements.form.elements].filter((field) => field.willValidate && !field.checkValidity());
    if (!invalidFields.length) return true;
    document.getElementById('validation-errors').textContent = invalidFields
      .map((field) => `${fieldLabels[field.name] || field.name}: ${field.name === 'articleHtml' ? 'Article content is required.' : field.validationMessage}`).join(' ');
    focusField(invalidFields[0]);
    if (invalidFields[0].name !== 'articleHtml') invalidFields[0].reportValidity();
    return false;
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
      if (field && field.type !== 'hidden') field.setCustomValidity(message);
      return `${fieldLabels[fieldName] || fieldName}: ${message}`;
    });
    document.getElementById('validation-errors').textContent = messages.length ? messages.join(' ') : error.message;
    const firstField = Object.keys(fields).map((fieldName) => elements.form.elements[fieldName]).find(Boolean);
    if (firstField) focusField(firstField);
  }
  async function api(path, options = {}) {
    const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || 'CMS request failed.');
      error.fields = data.fields || {};
      throw error;
    }
    return data;
  }
  function renderPosts() {
    const query = elements.search.value.trim().toLowerCase();
    const status = elements.statusFilter.value;
    const category = elements.categoryFilter.value;
    const visible = posts.filter((post) => {
      const matchesQuery = `${post.title} ${post.publicSlug} ${post.category}`.toLowerCase().includes(query);
      const matchesStatus = !status || (status === 'archived' ? Boolean(post.archivedAt) : !post.archivedAt && post.status === status);
      return matchesQuery && matchesStatus && (!category || post.category === category);
    });
    const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))].sort();
    categories.forEach(ensureCategoryOption);
    elements.categoryFilter.innerHTML = '<option value="">All categories</option>' + categories.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('');
    elements.categoryFilter.value = category;
    elements.list.innerHTML = visible.length ? `<div class="cms-table-wrap"><table class="cms-post-table"><thead><tr><th scope="col">Article</th><th scope="col">Status</th><th scope="col">Category</th><th scope="col">Updated</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead><tbody>${visible.map((post) => {
      const label = (post.archivedAt ? 'archived' : (post.status || 'draft')).replace(/_/g, ' ');
      const slug = encodeURIComponent(post.publicSlug);
      const actions = [`<a class="cms-article-action" href="/resources/blogs/${slug}" target="_blank" rel="noopener" aria-label="View ${escapeHtml(post.title || 'article')}" title="View published article"><i data-lucide="external-link"></i></a>`, `<button class="cms-article-action" data-action="edit" data-slug="${escapeHtml(post.publicSlug)}" type="button" aria-label="Edit ${escapeHtml(post.title || 'article')}" title="Edit article"><i data-lucide="pencil"></i></button>`];
      if (cmsUser?.role === 'reviewer') {
        const lifecycleAction = post.archivedAt ? 'unarchive_post' : 'archive_post';
        const lifecycleLabel = post.archivedAt ? 'Restore article' : 'Archive article';
        actions.push(`<details class="cms-row-menu"><summary class="cms-article-action" aria-label="More actions for ${escapeHtml(post.title || 'article')}" title="More actions"><i data-lucide="ellipsis"></i></summary><div class="cms-row-menu__items"><button type="button" data-action="${lifecycleAction}" data-slug="${escapeHtml(post.publicSlug)}">${lifecycleLabel}</button><button type="button" data-action="delete_post" data-slug="${escapeHtml(post.publicSlug)}">Delete article</button></div></details>`);
      }
      const thumbnail = post.featuredImageUrl ? `<img src="${escapeHtml(post.featuredImageUrl)}" alt="" loading="lazy">` : '<span class="cms-post-thumbnail--empty" aria-hidden="true"></span>';
      return `<tr class="${post.archivedAt ? 'is-archived' : ''}${currentPost?.publicSlug === post.publicSlug ? ' is-selected' : ''}"><td><div class="cms-post-title">${thumbnail}<div><strong>${escapeHtml(post.title || 'Untitled article')}</strong><a href="/resources/blogs/${slug}" target="_blank" rel="noopener">/resources/blogs/${escapeHtml(post.publicSlug)}</a></div></div></td><td><span class="cms-status" data-status="${escapeHtml(label)}">${escapeHtml(label)}</span>${post.featuredImageUrl && !post.featuredImageAlt?.trim() ? '<small class="cms-attention">Missing image alt text</small>' : ''}</td><td>${escapeHtml(post.category || '—')}</td><td><time datetime="${post.updatedAt || ''}">${post.updatedAt ? new Date(post.updatedAt).toLocaleDateString('en-GB') : 'Not saved'}</time></td><td><div class="cms-article-actions" aria-label="Article actions">${actions.join('')}</div></td></tr>`;
    }).join('')}</tbody></table></div>` : '<p class="cms-article-list__empty">No articles match these filters.</p>';
    const countElementIds = { published: 'published-count', draft: 'draft-count', in_review: 'review-count', scheduled: 'scheduled-count' };
    Object.entries(countElementIds).forEach(([status, id]) => { document.getElementById(id).textContent = posts.filter((post) => !post.archivedAt && post.status === status).length; });
    const attention = posts.filter((post) => !post.archivedAt && (
      post.status === 'in_review' || post.status === 'scheduled' || (post.featuredImageUrl && !post.featuredImageAlt?.trim())
    ));
    document.getElementById('attention-list').innerHTML = attention.length
      ? attention.map((post) => {
        const issue = post.status === 'in_review' ? 'Waiting for review' : post.status === 'scheduled' ? 'Scheduled' : 'Missing image alt text';
        return `<li><button type="button" data-attention-slug="${escapeHtml(post.publicSlug)}"><strong>${escapeHtml(post.title || 'Untitled article')}</strong><span>${issue}</span></button></li>`;
      }).join('')
      : '<li class="cms-attention-empty">No articles need attention.</li>';
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
    const activeTab = document.querySelector('[data-editor-tab].is-active')?.dataset.editorTab;
    panel.hidden = activeTab !== 'media';
  }
  async function refreshPosts() {
    const data = await api('/api/cms/posts'); cmsUser = data.user; posts = data.posts; renderPosts();
    document.querySelector('.cms-onboarding').hidden = localStorage.getItem(onboardingKey) === 'true';
    elements.session.innerHTML = `<span class="cms-connection">${escapeHtml(cmsUser.display_name)} · ${escapeHtml(cmsUser.role)}</span><button class="cms-button cms-button--secondary" id="sign-out" type="button">Sign out</button>`;
    document.getElementById('sign-out').addEventListener('click', async () => { await window.netconSupabase.auth.signOut(); window.location.reload(); });
  }
  async function restoreLocalDraft() {
    const saved = localStorage.getItem(localDraftKey);
    if (!saved) return;
    const recovery = JSON.parse(saved);
    if (!recovery.publicSlug || !posts.some((post) => post.publicSlug === recovery.publicSlug)) return;
    if (!window.confirm('An unsaved local copy of this article was found. Restore it?')) {
      localStorage.removeItem(localDraftKey);
      return;
    }
    const fields = recovery.fields || {};
    await openPost(recovery.publicSlug);
    Object.entries(fields).forEach(([name, value]) => {
      const field = elements.form.elements[name];
      if (field && field.type !== 'file' && field.type !== 'checkbox') field.value = value || '';
    });
    elements.form.elements.isFeatured.checked = Boolean(fields.isFeatured);
    articleEditor.innerHTML = fields.articleHtml || '';
    syncArticleEditor();
    updateSeoPreview();
    setEditorDirty(true);
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
        await restoreLocalDraft();
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
  function canLeaveEditor() { return !editorDirty || window.confirm('You have unsaved changes. Leave this article and discard them?'); }
  function closeEditor() { if (!canLeaveEditor()) return; currentPost = null; elements.form.reset(); articleEditor.innerHTML = ''; articleEditorSelection = null; clearValidationErrors(); renderFeaturedImage('', ''); elements.editor.hidden = true; elements.workspace.classList.remove('is-editing'); document.body.classList.remove('cms-editor-open'); updatePublishingControls(null); elements.saveStatus.textContent = ''; setEditorDirty(false); document.getElementById('cms-lifecycle-actions').hidden = true; renderPosts(); }
  function resetEditor() {
    if (!canLeaveEditor()) return;
    markOnboardingUsed();
    currentPost = null; slugEditedManually = false; elements.form.reset(); articleEditor.innerHTML = ''; articleEditorSelection = null; clearValidationErrors(); renderFeaturedImage('', ''); elements.editor.hidden = false; elements.workspace.classList.add('is-editing'); document.body.classList.add('cms-editor-open'); selectEditorTab('content'); updatePublishingControls(null); document.getElementById('editor-heading').textContent = 'New article'; elements.saveStatus.textContent = '';
    const recovery = JSON.parse(localStorage.getItem(localDraftKey) || 'null');
    if (recovery && !recovery.publicSlug && window.confirm('A locally saved unsaved article was found. Restore it?')) {
      Object.entries(recovery.fields || {}).forEach(([name, value]) => { const field = elements.form.elements[name]; if (field && field.type !== 'file' && field.type !== 'checkbox') field.value = value || ''; });
      elements.form.elements.isFeatured.checked = Boolean(recovery.fields.isFeatured);
      articleEditor.innerHTML = recovery.fields.articleHtml || '';
      slugEditedManually = Boolean(recovery.fields.publicSlug) && recovery.fields.publicSlug !== slugify(recovery.fields.title);
      setEditorDirty(true);
    }
    updateSeoPreview();
  }
  async function openPost(slug) {
    if (!canLeaveEditor()) return;
    markOnboardingUsed();
    const data = await api(`/api/cms/posts/${encodeURIComponent(slug)}`); currentPost = data.post; elements.editor.hidden = false;
    elements.workspace.classList.add('is-editing'); document.body.classList.add('cms-editor-open'); selectEditorTab('content');
    document.getElementById('editor-heading').textContent = `Edit: ${data.post.title}`;
    data.post.category = ensureCategoryOption(data.post.category);
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
    document.getElementById('cms-lifecycle-actions').hidden = cmsUser?.role !== 'reviewer';
    document.getElementById('archive-post-button').textContent = data.post.archivedAt ? 'Restore article' : 'Archive article';
    setEditorDirty(false);
    updateSeoPreview();
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
    const selectedFeatureImage = elements.form.elements.featuredImage.files[0];
    payload.featuredImageUrl = await uploadFeatureImage(selectedFeatureImage);
    if (selectedFeatureImage) {
      elements.form.elements.featuredImageUrl.value = payload.featuredImageUrl;
      elements.form.elements.featuredImage.value = '';
      renderFeaturedImage(payload.featuredImageUrl, elements.form.elements.featuredImageAlt.value);
    }
    if (currentPost && !isEditableDraft(currentPost)) {
      const created = await api(`/api/cms/posts/${encodeURIComponent(currentPost.publicSlug)}`, { method: 'POST', body: '{}' });
      currentPost = { ...currentPost, revisionId: created.revision.id, status: 'draft' };
    }
    if (currentPost) {
      await api(`/api/cms/posts/${encodeURIComponent(currentPost.publicSlug)}`, { method: 'PATCH', body: JSON.stringify({ ...payload, revisionId: currentPost.revisionId }) });
      currentPost.publicSlug = payload.publicSlug;
      setEditorDirty(false);
      return;
    }
    const created = await api('/api/cms/posts', { method: 'POST', body: JSON.stringify(payload) });
    currentPost = { publicSlug: payload.publicSlug, revisionId: created.revision.id, status: 'draft' };
    setEditorDirty(false);
    document.getElementById('cms-lifecycle-actions').hidden = cmsUser?.role !== 'reviewer';
    updatePublishingControls(currentPost);
  }
  elements.newPost.addEventListener('click', () => { resetEditor(); document.getElementById('cms-lifecycle-actions').hidden = true; renderPosts(); }); elements.search.addEventListener('input', renderPosts);
  elements.statusFilter.addEventListener('change', renderPosts);
  elements.categoryFilter.addEventListener('change', renderPosts);
  function selectEditorTab(group) {
    const tab = document.querySelector(`[data-editor-tab="${group}"]`);
    document.querySelectorAll('[data-editor-tab]').forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    document.getElementById('article-tab-panel').setAttribute('aria-labelledby', tab.id);
    document.querySelectorAll('[data-editor-group]').forEach((field) => {
      const noFeaturedImage = field.id === 'featured-image-panel'
        && !elements.form.elements.featuredImageUrl.value
        && !elements.form.elements.featuredImage.files.length;
      field.hidden = field.dataset.editorGroup !== group || noFeaturedImage;
    });
  }
  document.querySelectorAll('[data-editor-tab]').forEach((tab) => {
    tab.addEventListener('click', () => selectEditorTab(tab.dataset.editorTab));
    tab.addEventListener('keydown', (event) => {
      const tabs = [...document.querySelectorAll('[data-editor-tab]')];
      const index = tabs.indexOf(tab);
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
          : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault();
      selectEditorTab(tabs[next].dataset.editorTab);
      tabs[next].focus();
    });
  });
  document.querySelectorAll('.cms-stats article').forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    const activate = () => {
      const label = card.querySelector('small').textContent;
      elements.statusFilter.value = ({ Published: 'published', Drafts: 'draft', 'In review': 'in_review', Scheduled: 'scheduled' })[label] || '';
      renderPosts();
      document.getElementById('articles-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
  });
  elements.form.elements.publicSlug.addEventListener('input', () => { slugEditedManually = Boolean(elements.form.elements.publicSlug.value.trim()); });
  elements.form.elements.title.addEventListener('input', () => {
    if (!currentPost && !slugEditedManually) elements.form.elements.publicSlug.value = slugify(elements.form.elements.title.value);
  });
  elements.form.addEventListener('input', (event) => { updateSeoPreview(); if (!event.target.matches('[type="file"]')) setEditorDirty(true); });
  elements.form.addEventListener('change', () => { updateSeoPreview(); setEditorDirty(true); });
  articleEditor.addEventListener('input', () => { syncArticleEditor(); setEditorDirty(true); });
  document.getElementById('close-editor-button').addEventListener('click', closeEditor);
  articleEditor.addEventListener('input', syncArticleEditor);
  articleEditor.addEventListener('keyup', rememberArticleEditorSelection);
  articleEditor.addEventListener('mouseup', rememberArticleEditorSelection);
  document.querySelectorAll('[data-editor-command]').forEach((button) => {
    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('click', () => { restoreArticleEditorSelection(); document.execCommand(button.dataset.editorCommand, false); syncArticleEditor(); rememberArticleEditorSelection(); setEditorDirty(true); });
  });
  document.getElementById('article-block-format').addEventListener('change', (event) => { restoreArticleEditorSelection(); document.execCommand('formatBlock', false, event.target.value); syncArticleEditor(); rememberArticleEditorSelection(); setEditorDirty(true); });
  document.querySelector('[data-editor-action="link"]').addEventListener('click', () => {
    const url = window.prompt('Enter the link URL.', 'https://');
    if (!url) return;
    restoreArticleEditorSelection(); document.execCommand('createLink', false, url); syncArticleEditor(); rememberArticleEditorSelection(); setEditorDirty(true);
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
  elements.form.elements.featuredImage.addEventListener('change', () => { const file = elements.form.elements.featuredImage.files[0]; if (file) renderFeaturedImage(URL.createObjectURL(file), elements.form.elements.featuredImageAlt.value); setEditorDirty(true); });
  document.getElementById('remove-featured-image').addEventListener('click', () => { elements.form.elements.featuredImage.value = ''; elements.form.elements.featuredImageUrl.value = ''; renderFeaturedImage('', ''); elements.saveStatus.textContent = 'Choose a replacement image before publishing.'; setEditorDirty(true); });
  function requestArticleDeletion(slug) { if (!slug) return; pendingDeletionSlug = slug; deleteArticleDialog.showModal(); }
  elements.list.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    const { action, slug } = actionButton.dataset;
    if (action === 'edit') openPost(slug).catch((error) => alert(error.message));
    else if (action === 'delete_post') requestArticleDeletion(slug);
    else if (action === 'archive_post' || action === 'unarchive_post') runLifecycleAction(action, slug);
  });
  document.getElementById('attention-list').addEventListener('click', (event) => {
    const item = event.target.closest('[data-attention-slug]');
    if (item) openPost(item.dataset.attentionSlug).catch((error) => alert(error.message));
  });
  document.getElementById('preview-button').addEventListener('click', () => { syncArticleEditor(); const form = new FormData(elements.form); elements.previewContent.innerHTML = `<h1>${escapeHtml(form.get('title'))}</h1>${form.get('featuredImageUrl') ? `<img src="${escapeHtml(form.get('featuredImageUrl'))}" alt="${escapeHtml(form.get('featuredImageAlt'))}">` : ''}${safePreviewHtml(form.get('articleHtml'))}`; elements.preview.showModal(); });
  document.querySelectorAll('[data-preview-width]').forEach((button) => button.addEventListener('click', () => {
    elements.previewContent.style.width = button.dataset.previewWidth;
    elements.previewContent.style.maxWidth = '100%';
    document.querySelectorAll('[data-preview-width]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  }));
  elements.form.elements.featuredImageAlt.addEventListener('input', () => { const image = document.getElementById('featured-image-preview'); if (!elements.editor.hidden) image.alt = elements.form.elements.featuredImageAlt.value; });
  document.getElementById('close-preview-button').addEventListener('click', () => elements.preview.close());
  elements.form.addEventListener('submit', async (event) => { event.preventDefault(); clearValidationErrors(); if (!validateFormBeforeSave()) { elements.saveStatus.textContent = 'Fix the highlighted fields before saving.'; return; } try { elements.saveStatus.textContent = 'Saving...'; await saveCurrentDraft(); elements.saveStatus.textContent = `Saved just now · Draft saved`; await refreshPosts(); } catch (error) { elements.saveStatus.textContent = error.message; showValidationErrors(error); } });
  window.addEventListener('beforeunload', (event) => { if (editorDirty) { event.preventDefault(); event.returnValue = ''; } });
  window.setInterval(async () => {
    if (!editorDirty || autosaveRunning || elements.editor.hidden || !elements.form.checkValidity()) return;
    autosaveRunning = true;
    try {
      elements.saveStatus.textContent = 'Saving draft…';
      await saveCurrentDraft();
      elements.saveStatus.textContent = `Saved at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
      await refreshPosts();
    } catch (error) {
      elements.saveStatus.textContent = `Autosave failed: ${error.message}`;
    } finally {
      autosaveRunning = false;
    }
  }, 30000);
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
      elements.saveStatus.textContent = isProductionDeployment ? 'Publishing live...' : 'Publishing to staging...';
      if (editorDirty || (!isEditableDraft(currentPost) && currentPost.status !== 'approved')) await saveCurrentDraft();
      if (currentPost.status !== 'approved') await api(`/api/cms/revisions/${currentPost.revisionId}/workflow`, { method: 'POST', body: JSON.stringify({ action: 'publish_live' }) });
      await api(`/api/cms/revisions/${currentPost.revisionId}/publish`, { method: 'POST', body: '{}' });
      currentPost.status = 'published';
      await refreshPosts();
      updatePublishingControls(currentPost);
      elements.saveStatus.textContent = isProductionDeployment ? 'Article published live.' : 'Article published to staging.';
      const articleUrl = new URL(`/resources/blogs/${encodeURIComponent(currentPost.publicSlug)}`, window.location.origin).toString();
      showPublishResult(
        isProductionDeployment ? 'Article published' : 'Article published to staging',
        isProductionDeployment
          ? 'Your article is now published on the live website.'
          : 'Your article is published on staging only. The live website has not changed.',
        articleUrl
      );
    } catch (error) { elements.saveStatus.textContent = error.message; showPublishResult('Publishing failed', error.message || 'The article was not published. Please try again.', null); }
  }
  elements.publishLive.addEventListener('click', publishCurrentArticle);
  document.getElementById('close-publish-result').addEventListener('click', () => document.getElementById('publish-result-dialog').close());
  async function runLifecycleAction(action, slug) {
    if (!slug) return;
    if (currentPost?.publicSlug === slug && editorDirty) {
      if (!canLeaveEditor()) return;
      setEditorDirty(false);
    }
    try {
      elements.saveStatus.textContent = 'Updating article...';
      await api(`/api/cms/posts/${encodeURIComponent(slug)}/lifecycle`, { method: 'POST', body: JSON.stringify({ action }) });
      elements.saveStatus.textContent = ({ archive_post: 'Article archived.', unarchive_post: 'Article restored.', delete_post: 'Article deleted.' })[action];
      if (currentPost?.publicSlug === slug) {
        setEditorDirty(false);
        currentPost = null;
        elements.editor.hidden = true;
        elements.workspace.classList.remove('is-editing');
        document.body.classList.remove('cms-editor-open');
        document.getElementById('cms-lifecycle-actions').hidden = true;
        updatePublishingControls(null);
      }
      await refreshPosts();
    } catch (error) { elements.saveStatus.textContent = error.message; }
  }
  document.getElementById('archive-post-button').addEventListener('click', () => runLifecycleAction(currentPost?.archivedAt ? 'unarchive_post' : 'archive_post', currentPost?.publicSlug));
  ['close-delete-article', 'cancel-delete-article'].forEach((id) => document.getElementById(id).addEventListener('click', () => { pendingDeletionSlug = null; deleteArticleDialog.close(); }));
  document.getElementById('confirm-delete-article').addEventListener('click', () => { const slug = pendingDeletionSlug; pendingDeletionSlug = null; deleteArticleDialog.close(); runLifecycleAction('delete_post', slug); });

  try {
    const configResponse = await fetch('/api/cms/config');
    if (!configResponse.ok) throw new Error('This preview server does not provide the CMS API yet.');
    const config = await configResponse.json();
    if (!config.configured) { elements.setup.hidden = false; elements.auth.hidden = true; elements.setupMessage.textContent = config.message; setConnection('CMS services not connected', false); return; }
    isProductionDeployment = config.environment === 'production';
    elements.publishLive.textContent = isProductionDeployment ? 'Publish live' : 'Publish to staging';
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
    token = sessionData.session.access_token; elements.auth.hidden = true; elements.workspace.hidden = false; elements.newPost.disabled = false; setConnection('CMS connected', true);
    if (window.lucide) window.lucide.createIcons();
    try {
      await refreshPosts();
      await restoreLocalDraft();
    } catch (error) {
      if (error.message.includes('not been granted CMS access')) showBootstrap('No CMS role has been assigned to this account yet.');
      else throw error;
    }
  } catch (error) { elements.setup.hidden = false; elements.auth.hidden = true; elements.setupMessage.textContent = error.message || 'The CMS could not be reached.'; setConnection('CMS connection failed', false); }
}());