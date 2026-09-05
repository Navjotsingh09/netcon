(async function () {
  'use strict';

  const elements = {
    auth: document.getElementById('cms-auth'), setup: document.getElementById('cms-setup'),
    setupMessage: document.getElementById('cms-setup-message'), workspace: document.getElementById('cms-workspace'),
    session: document.getElementById('cms-session'), connection: document.getElementById('cms-connection'),
    newPost: document.getElementById('new-post-button'), editor: document.getElementById('editor-panel'),
    form: document.getElementById('article-form'), list: document.getElementById('post-list'), search: document.getElementById('post-search'),
    preview: document.getElementById('preview-dialog'), previewContent: document.getElementById('preview-content'),
    saveStatus: document.getElementById('save-status'), publishLive: document.getElementById('publish-live-button')
  };
  let token = ''; let cmsUser = null; let posts = []; let currentPost = null;
  const articleEditor = document.getElementById('article-editor');
  const articleHtmlField = document.querySelector('[name="articleHtml"]');
  const articleEditorImage = document.getElementById('article-editor-image');
  let articleEditorSelection = null;

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
    const visible = posts.filter((post) => `${post.title} ${post.publicSlug} ${post.category}`.toLowerCase().includes(query));
    elements.list.innerHTML = visible.map((post) => {
      const label = (post.archivedAt ? 'archived' : (post.status || 'draft')).replace(/_/g, ' ');
      const rowClass = `${currentPost?.publicSlug === post.publicSlug ? 'is-selected' : ''}${post.archivedAt ? ' is-archived' : ''}`.trim();
      const slug = encodeURIComponent(post.publicSlug);
      const actions = [`<a class="cms-article-action" href="/resources/blogs/${slug}" target="_blank" rel="noopener" aria-label="View ${escapeHtml(post.title || 'article')}" title="View published article"><i data-lucide="external-link"></i></a>`, `<button class="cms-article-action" data-action="edit" data-slug="${escapeHtml(post.publicSlug)}" type="button" aria-label="Edit ${escapeHtml(post.title || 'article')}" title="Edit article"><i data-lucide="pencil"></i></button>`];
      if (cmsUser?.role === 'reviewer' && !post.archivedAt) actions.push(`<button class="cms-article-action cms-article-action--danger" data-action="archive" data-slug="${escapeHtml(post.publicSlug)}" type="button" aria-label="Archive ${escapeHtml(post.title || 'article')}" title="Archive article"><i data-lucide="archive"></i></button>`);
      if (cmsUser?.role === 'reviewer' && isEditableDraft(post)) actions.push(`<button class="cms-article-action cms-article-action--danger" data-action="delete_draft" data-slug="${escapeHtml(post.publicSlug)}" type="button" aria-label="Delete draft for ${escapeHtml(post.title || 'article')}" title="Delete editable draft"><i data-lucide="trash-2"></i></button>`);
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
  elements.list.addEventListener('click', (event) => { const actionButton = event.target.closest('[data-action]'); if (!actionButton) return; const { action, slug } = actionButton.dataset; if (action === 'edit') openPost(slug).catch((error) => alert(error.message)); else if (action === 'archive') runLifecycleAction('archive', 'Archive this article? It will be removed from CMS editorial listings.', slug); else if (action === 'delete_draft') runLifecycleAction('delete_draft', 'Delete this editable draft? The current published version will remain unchanged.', slug); });
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
  async function runLifecycleAction(action, question, slug = currentPost?.publicSlug) {
    if (!slug || !window.confirm(question)) return;
    try {
      elements.saveStatus.textContent = 'Updating article...';
      await api(`/api/cms/posts/${encodeURIComponent(slug)}/lifecycle`, { method: 'POST', body: JSON.stringify({ action }) });
      elements.saveStatus.textContent = action === 'archive' ? 'Article archived.' : 'Editable draft deleted.';
      if (action === 'archive' && currentPost?.publicSlug === slug) closeEditor();
      await refreshPosts();
    } catch (error) { elements.saveStatus.textContent = error.message; }
  }
  document.getElementById('archive-post-button').addEventListener('click', () => runLifecycleAction('archive', 'Archive this article? It will be removed from CMS editorial listings.'));
  document.getElementById('delete-post-button').addEventListener('click', () => runLifecycleAction('delete_draft', 'Delete this editable draft? The current published version will remain unchanged.'));

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
    token = sessionData.session.access_token; elements.auth.hidden = true; elements.workspace.hidden = false; elements.newPost.disabled = false; setConnection('CMS connected', true);
    if (window.lucide) window.lucide.createIcons();
    try { await refreshPosts(); } catch (error) { if (error.message.includes('not been granted CMS access')) showBootstrap('No CMS role has been assigned to this account yet.'); else throw error; }
  } catch (error) { elements.setup.hidden = false; elements.auth.hidden = true; elements.setupMessage.textContent = error.message || 'The CMS could not be reached.'; setConnection('CMS connection failed', false); }
}());