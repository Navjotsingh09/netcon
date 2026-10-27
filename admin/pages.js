(async function () {
  'use strict';

  const elements = {
    sessionStatus: document.getElementById('pages-session-status'),
    signOut: document.getElementById('pages-sign-out'),
    notice: document.getElementById('pages-notice'),
    auth: document.getElementById('pages-auth'),
    workspace: document.getElementById('pages-workspace'),
    pageList: document.getElementById('page-list'),
    editor: document.getElementById('page-editor'),
    editorTitle: document.getElementById('page-editor-title'),
    editorState: document.getElementById('page-editor-state'),
    form: document.getElementById('page-form'),
    fields: document.getElementById('page-fields'),
    sectionOrder: document.getElementById('page-section-order'),
    saveStatus: document.getElementById('page-save-status'),
    saveButton: document.querySelector('#page-form button[type="submit"]'),
    previewButton: document.getElementById('page-preview'),
    previewDialog: document.getElementById('page-preview-dialog'),
    previewFrame: document.getElementById('page-preview-frame'),
    reviewNotes: document.getElementById('page-review-notes'),
    reviewNotesPanel: document.getElementById('page-review-notes-panel'),
    submitReview: document.getElementById('page-submit-review'),
    requestChanges: document.getElementById('page-request-changes'),
    approve: document.getElementById('page-approve'),
    workflowHelp: document.getElementById('page-workflow-help'),
    publish: document.getElementById('page-publish')
  };
  const maxImageUploadBytes = 3 * 1024 * 1024;
  const allowedImageTypes = new Set(['image/avif', 'image/jpeg', 'image/png', 'image/webp']);

  let supabase;
  let token = '';
  let user = null;
  let pages = [];
  let activeDefinition = null;
  let activeRevision = null;
  let sectionOrder = [];
  let dirty = false;
  let busy = false;
  let uploadsInProgress = 0;

  function setNotice(message, tone) {
    elements.notice.textContent = message;
    elements.notice.dataset.tone = tone || '';
    elements.notice.hidden = !message;
  }

  function setBusy(value) {
    busy = value;
    [
      elements.saveButton,
      elements.previewButton,
      elements.submitReview,
      elements.requestChanges,
      elements.approve,
      elements.publish
    ].forEach((button) => { button.disabled = value || uploadsInProgress > 0; });
  }

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = String(value ?? '');
    return node.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  async function loadSupabase() {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.109.0';
      script.onload = resolve;
      script.onerror = () => reject(new Error('The sign-in service could not be loaded.'));
      document.head.appendChild(script);
    });
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
    const data = response.status === 204 ? {} : await response.json();
    if (!response.ok) {
      const error = new Error(data.error || 'The CMS request failed.');
      error.fields = data.fields || {};
      throw error;
    }
    return data;
  }

  function showWorkflowActions() {
    const status = activeRevision?.status || 'not_started';
    const reviewer = user?.role === 'reviewer';
    const canReviewOwn = activeRevision?.created_by === user?.id;
    elements.submitReview.hidden = !['draft', 'changes_requested'].includes(status);
    elements.requestChanges.hidden = !(reviewer && status === 'in_review' && !canReviewOwn);
    elements.approve.hidden = !(reviewer && status === 'in_review' && !canReviewOwn);
    elements.publish.hidden = !(reviewer && status === 'approved');
    elements.saveButton.hidden = status === 'published' && !dirty;
    elements.reviewNotesPanel.hidden = !(reviewer && status === 'in_review' && !canReviewOwn);
    elements.workflowHelp.textContent = status === 'in_review'
      ? canReviewOwn
        ? 'Waiting for a different reviewer. You cannot approve your own revision.'
        : reviewer
          ? 'Preview this saved revision, then approve it. Saving edits creates a new draft.'
          : 'Waiting for a reviewer. A separate account with the reviewer role must open this page to approve it.'
      : status === 'approved'
        ? reviewer
          ? 'This revision is approved. Publishing updates every website using this CMS database, including live when staging and live share it.'
          : 'This revision is approved. A reviewer must publish it.'
        : 'Save your draft and send it for review. A different reviewer must approve it before publication.';
    elements.previewButton.disabled = false;
  }

  function renderPageList() {
    elements.pageList.replaceChildren();
    pages.forEach((page) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pages-list__item';
      button.dataset.pageSlug = page.slug;
      button.setAttribute('aria-current', page.slug === activeDefinition?.slug ? 'page' : 'false');
      const title = document.createElement('strong');
      title.textContent = page.title;
      const status = document.createElement('span');
      status.className = 'pages-list__status';
      status.textContent = page.status.replaceAll('_', ' ');
      button.append(title, status);
      button.addEventListener('click', () => openPage(page.slug));
      elements.pageList.append(button);
    });
  }

  function buildFields(content) {
    elements.fields.replaceChildren();
    let imageFieldIndex = 0;
    activeDefinition.sections.forEach((section) => {
      const fields = activeDefinition.fields.filter((field) => field.section === section.id);
      if (!fields.length) return;
      const group = document.createElement('fieldset');
      group.className = 'pages-field-group';
      const legend = document.createElement('legend');
      legend.textContent = section.label;
      group.append(legend);

      fields.forEach((field) => {
        const label = document.createElement('label');
        label.className = 'pages-field';
        label.textContent = field.label;
        let input;
        if (field.type === 'select') {
          input = document.createElement('select');
          for (const value of field.options) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            input.append(option);
          }
        } else if (field.type === 'textarea') {
          input = document.createElement('textarea');
          input.rows = field.key === 'meta:schema' ? 10 : 3;
        } else {
          input = document.createElement('input');
          input.type = field.type === 'url' ? 'url' : 'text';
          input.autocomplete = 'off';
        }
        input.name = field.key;
        if (field.type !== 'select') input.maxLength = field.maxLength;
        input.value = content.fields?.[field.key] || '';
        input.dataset.fieldKey = field.key;
        input.addEventListener('input', markDirty);
        label.append(input);
        const counter = document.createElement('small');
        counter.textContent = `${input.value.length} / ${field.maxLength} characters`;
        input.addEventListener('input', () => { counter.textContent = `${input.value.length} / ${field.maxLength} characters`; });
        label.append(counter);
        group.append(label);
        if (field.key.startsWith('src:')) {
          addImageUploadControl(field, group, imageFieldIndex);
          imageFieldIndex += 1;
        }
      });
      elements.fields.append(group);
    });
  }

  function addImageUploadControl(field, group, index) {
    const container = document.createElement('div');
    container.className = 'pages-image-upload';

    const label = document.createElement('label');
    label.htmlFor = `page-image-file-${index}`;
    label.textContent = 'Choose a replacement image';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = label.htmlFor;
    fileInput.accept = '.avif,.jpg,.jpeg,.png,.webp,image/avif,image/jpeg,image/png,image/webp';
    fileInput.setAttribute('aria-label', `Choose a replacement image for ${field.label}`);

    const uploadButton = document.createElement('button');
    uploadButton.className = 'cms-button cms-button--secondary';
    uploadButton.type = 'button';
    uploadButton.textContent = 'Upload image';
    uploadButton.disabled = true;

    const status = document.createElement('p');
    status.className = 'pages-image-upload__status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      uploadButton.disabled = !file;
      status.dataset.tone = '';
      status.textContent = file ? `${file.name} is ready to upload.` : '';
    });

    uploadButton.addEventListener('click', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      if (busy || uploadsInProgress) {
        status.dataset.tone = 'error';
        status.textContent = 'Finish the current CMS action before uploading another image.';
        return;
      }
      if (!allowedImageTypes.has(file.type)) {
        status.dataset.tone = 'error';
        status.textContent = 'Choose a JPEG, PNG, WebP, or AVIF image.';
        return;
      }
      if (!file.size || file.size > maxImageUploadBytes) {
        status.dataset.tone = 'error';
        status.textContent = 'Image uploads must be larger than 0 bytes and no larger than 3 MB.';
        return;
      }

      uploadsInProgress += 1;
      setBusy(busy);
      uploadButton.disabled = true;
      fileInput.disabled = true;
      status.dataset.tone = '';
      status.textContent = 'Uploading image…';
      try {
        const encodedData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result !== 'string') {
              reject(new Error('The selected image could not be read.'));
              return;
            }
            resolve(reader.result.split(',')[1] || '');
          };
          reader.onerror = () => reject(reader.error || new Error('The selected image could not be read.'));
          reader.readAsDataURL(file);
        });
        const altKey = field.key.replace(/^src:/, 'alt:');
        const altField = [...elements.fields.querySelectorAll('[data-field-key]')]
          .find((input) => input.dataset.fieldKey === altKey);
        const result = await api('/api/cms/media', {
          method: 'POST',
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            data: encodedData,
            altText: altField?.value || ''
          })
        });
        const imageUrl = result.media?.blobUrl;
        if (!imageUrl) throw new Error('The upload completed without returning an image URL.');
        const urlField = [...elements.fields.querySelectorAll('[data-field-key]')]
          .find((input) => input.dataset.fieldKey === field.key);
        if (!urlField) throw new Error('The image was uploaded, but its page field is no longer available.');
        urlField.value = imageUrl;
        urlField.dispatchEvent(new Event('input', { bubbles: true }));
        fileInput.value = '';
        status.dataset.tone = 'success';
        status.textContent = 'Image uploaded and added to this draft. Save the draft to keep the change.';
      } catch (error) {
        status.dataset.tone = 'error';
        status.textContent = error.message || 'The image could not be uploaded.';
      } finally {
        uploadsInProgress -= 1;
        setBusy(busy);
        fileInput.disabled = false;
        uploadButton.disabled = !fileInput.files?.length;
      }
    });

    container.append(label, fileInput, uploadButton, status);
    group.append(container);
  }

  function renderSectionOrder() {
    elements.sectionOrder.replaceChildren();
    sectionOrder.forEach((id, index) => {
      const section = activeDefinition.sections.find((item) => item.id === id);
      const row = document.createElement('li');
      const label = document.createElement('span');
      label.className = 'pages-section-order__label';
      label.textContent = section.label;
      const controls = document.createElement('span');
      controls.className = 'pages-section-order__controls';
      [
        { offset: -1, label: `Move ${section.label} up`, text: '↑' },
        { offset: 1, label: `Move ${section.label} down`, text: '↓' }
      ].forEach((control) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = control.text;
        button.setAttribute('aria-label', control.label);
        button.disabled = index + control.offset < 0 || index + control.offset >= sectionOrder.length;
        button.addEventListener('click', () => {
          const nextIndex = index + control.offset;
          [sectionOrder[index], sectionOrder[nextIndex]] = [sectionOrder[nextIndex], sectionOrder[index]];
          renderSectionOrder();
          markDirty();
        });
        controls.append(button);
      });
      row.append(label, controls);
      elements.sectionOrder.append(row);
    });
  }

  function markDirty() {
    dirty = true;
    elements.saveStatus.textContent = 'Unsaved changes';
    elements.previewButton.disabled = false;
    showWorkflowActions();
    window.addEventListener('beforeunload', preventLeave);
  }

  function preventLeave(event) {
    if (!dirty && !uploadsInProgress) return;
    event.preventDefault();
    event.returnValue = '';
  }

  function collectContent() {
    const fields = {};
    elements.form.querySelectorAll('[data-field-key]').forEach((input) => {
      fields[input.dataset.fieldKey] = input.value;
    });
    if (activeDefinition.slug === 'home' && !activeDefinition.dynamic) {
      fields['home.seo.title'] = fields['meta:title'];
      fields['home.seo.description'] = fields['meta:description'];
    }
    return { fields, sectionOrder: [...sectionOrder] };
  }

  function statusText(revision) {
    if (!revision) return 'Not saved yet';
    return `Revision ${revision.revision_number} · ${revision.status.replaceAll('_', ' ')}`;
  }

  async function openPage(slug) {
    if (uploadsInProgress) {
      setNotice('Wait for the image upload to finish before opening another page.', 'warning');
      return;
    }
    if (dirty && activeDefinition?.slug !== slug && !window.confirm('Discard your unsaved changes and open another page?')) return;
    try {
      setNotice('', '');
      const data = await api(`/api/cms/pages/${encodeURIComponent(slug)}`);
      const nextDefinition = data.definition;
      const nextRevision = data.revision;
      let content = nextRevision?.content;
      const templateDefaults = data.templateDefaults;
      if (!templateDefaults) throw new Error('The page template fields are unavailable. Check that the CMS server and editor are on the same release.');
      if (!content) content = templateDefaults;
      else {
        const savedFields = content.fields || {};
        content = {
          ...content,
          fields: { ...templateDefaults.fields, ...savedFields },
          sectionOrder: content.sectionOrder || templateDefaults.sectionOrder
        };
        if (nextDefinition.slug === 'home') {
          for (const key of ['title', 'description']) {
            if (!(`meta:${key}` in savedFields) && `home.seo.${key}` in savedFields) {
              content.fields[`meta:${key}`] = savedFields[`home.seo.${key}`];
            }
          }
        }
      }
      activeDefinition = {
        ...nextDefinition,
        fields: templateDefaults.fieldsSchema.filter((field) => !['home.seo.title', 'home.seo.description'].includes(field.key)),
        sections: templateDefaults.sections
      };
      activeRevision = nextRevision;
      sectionOrder = [...(content.sectionOrder || activeDefinition.sections.map((section) => section.id))];
      elements.sectionOrder.closest('.pages-order-panel').hidden = Boolean(activeDefinition.dynamic);
      elements.editorTitle.textContent = activeDefinition.title;
      elements.editorState.textContent = statusText(activeRevision);
      buildFields(content);
      renderSectionOrder();
      dirty = false;
      elements.saveStatus.textContent = '';
      elements.editor.hidden = false;
      renderPageList();
      showWorkflowActions();
      if (templateDefaults.warnings?.length) setNotice(templateDefaults.warnings.join(' '), 'warning');
    } catch (error) {
      setNotice(error.message || 'That page could not be opened.', 'error');
    }
  }

  async function saveDraft() {
    const content = collectContent();
    const data = await api(`/api/cms/pages/${encodeURIComponent(activeDefinition.slug)}`, {
      method: 'POST',
      body: JSON.stringify(content)
    });
    activeRevision = data.revision;
    dirty = false;
    window.removeEventListener('beforeunload', preventLeave);
    elements.editorState.textContent = statusText(activeRevision);
    elements.saveStatus.textContent = 'Draft saved';
    showWorkflowActions();
    await refreshPages();
    return activeRevision;
  }

  async function refreshPages() {
    const data = await api('/api/cms/pages');
    user = data.user;
    pages = data.pages;
    renderPageList();
  }

  async function runWorkflow(action) {
    if (dirty) {
      if (action !== 'submit_for_review') {
        throw new Error('Save your changes as a draft first. Review actions apply only to the saved revision.');
      }
      await saveDraft();
    }
    if (!activeRevision?.id) throw new Error('Save this page before continuing.');
    const body = { action, revisionId: activeRevision.id, reviewerNotes: elements.reviewNotes.value };
    const result = await api(`/api/cms/pages/${encodeURIComponent(activeDefinition.slug)}/workflow`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    if (action === 'publish_live') {
      const publication = await api(`/api/cms/pages/${encodeURIComponent(activeDefinition.slug)}/workflow`, {
        method: 'POST',
        body: JSON.stringify({ action: 'publish', revisionId: result.revision.id })
      });
      activeRevision = { ...activeRevision, status: publication.status };
      elements.saveStatus.textContent = 'Page published to websites using this CMS database.';
    } else if (action === 'publish') {
      activeRevision = { ...activeRevision, status: result.status };
      elements.saveStatus.textContent = 'Page published to websites using this CMS database.';
    } else {
      activeRevision = { ...activeRevision, ...result.revision };
      elements.saveStatus.textContent = `Page ${result.revision.status.replaceAll('_', ' ')}.`;
    }
    elements.editorState.textContent = statusText(activeRevision);
    elements.reviewNotes.value = '';
    dirty = false;
    window.removeEventListener('beforeunload', preventLeave);
    showWorkflowActions();
    await refreshPages();
  }

  async function previewDraft() {
    if (!activeDefinition) return;
    const response = await fetch(`/api/cms/pages/${encodeURIComponent(activeDefinition.slug)}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(collectContent())
    });
    if (!response.ok) {
      const data = await response.json();
      showFieldErrors(data.fields || {});
      throw new Error(data.error || 'The page preview could not be generated.');
    }
    elements.previewFrame.srcdoc = await response.text();
    elements.previewFrame.title = `Preview of ${activeDefinition.title}`;
    elements.previewDialog.showModal();
  }

  function showFieldErrors(fields) {
    elements.form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
    for (const [key, message] of Object.entries(fields)) {
      const input = [...elements.form.querySelectorAll('[data-field-key]')].find((field) => field.dataset.fieldKey === key);
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.setCustomValidity?.(message);
        input.addEventListener('input', () => input.setCustomValidity?.(''), { once: true });
      }
    }
    elements.form.querySelector('[aria-invalid="true"]')?.focus();
  }

  function bindEvents() {
    elements.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy || !activeDefinition) return;
      setBusy(true);
      try {
        await saveDraft();
      } catch (error) {
        showFieldErrors(error.fields || {});
        setNotice(error.message, 'error');
      } finally {
        setBusy(false);
      }
    });
    elements.submitReview.addEventListener('click', async () => {
      setBusy(true);
      try { await runWorkflow('submit_for_review'); } catch (error) { setNotice(error.message, 'error'); } finally { setBusy(false); }
    });
    elements.requestChanges.addEventListener('click', async () => {
      setBusy(true);
      try { await runWorkflow('request_changes'); } catch (error) { setNotice(error.message, 'error'); } finally { setBusy(false); }
    });
    elements.approve.addEventListener('click', async () => {
      setBusy(true);
      try { await runWorkflow('approve'); } catch (error) { setNotice(error.message, 'error'); } finally { setBusy(false); }
    });
    elements.publish.addEventListener('click', async () => {
      if (!window.confirm(`Publish the approved revision of "${activeDefinition.title}"? This updates every website using this CMS database. If staging and live share the database, BOTH will change. Public caches may take several minutes to refresh.`)) return;
      setBusy(true);
      try { await runWorkflow('publish'); } catch (error) { setNotice(error.message, 'error'); } finally { setBusy(false); }
    });
    elements.previewButton.addEventListener('click', async () => {
      try { await previewDraft(); } catch (error) { setNotice(error.message, 'error'); }
    });
    document.getElementById('page-preview-close').addEventListener('click', () => elements.previewDialog.close());
    document.getElementById('page-editor-back').addEventListener('click', () => {
      if (uploadsInProgress) {
        setNotice('Wait for the image upload to finish before leaving this page.', 'warning');
        return;
      }
      if (dirty && !window.confirm('Discard your unsaved changes and return to the page list?')) return;
      dirty = false;
      window.removeEventListener('beforeunload', preventLeave);
      elements.editor.hidden = true;
      activeDefinition = null;
      renderPageList();
    });
    elements.signOut.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.assign('/admin');
    });
    window.addEventListener('beforeunload', preventLeave);
  }

  try {
    const configResponse = await fetch('/api/cms/config');
    if (!configResponse.ok) throw new Error('This deployment does not provide the CMS configuration.');
    const config = await configResponse.json();
    if (!config.configured) throw new Error(config.message || 'The CMS is not configured on this deployment.');
    elements.publish.textContent = 'Publish approved page';
    await loadSupabase();
    supabase = window.supabase.createClient(config.supabaseUrl, config.publishableKey);
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      elements.auth.hidden = false;
      elements.sessionStatus.textContent = 'Sign in required';
      return;
    }
    token = data.session.access_token;
    elements.signOut.hidden = false;
    elements.workspace.hidden = false;
    elements.sessionStatus.textContent = 'Connecting to CMS';
    bindEvents();
    await refreshPages();
    elements.sessionStatus.textContent = `${user.display_name} · ${user.role}`;
    elements.pagePreview = document.getElementById('page-preview');
  } catch (error) {
    elements.sessionStatus.textContent = 'CMS connection failed';
    setNotice(error.message || 'The Pages editor could not connect.', 'error');
  }
}());
