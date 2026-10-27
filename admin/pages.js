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
    previewPanel: document.getElementById('page-preview-panel'),
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
  let sessionInvalid = false;
  let expiryTimer;
  let expiryWarningTimer;
  let editing = true;
  let retainedFields = {};
  let savedContent = null;
  let publishedRevisionId = null;
  let previewRequest = 0;
  let historyRows = [];
  let historySlug = '';
  let historyRequest = 0;
  const advancedKeys = new Set(['meta:canonical', 'meta:robots', 'meta:schema', 'meta:redirect', 'meta:redirectStatus']);
  const editableFields = document.getElementById('page-editable-fields');
  const newDraftButton = document.getElementById('page-new-draft');
  const sectionNav = document.getElementById('page-section-nav');

  function recoveryKey() {
    return `netcon-page-draft:${user?.id}:${activeDefinition?.slug}`;
  }

  function preserveDraft() {
    if (!dirty || !activeDefinition || !user) return;
    try {
      sessionStorage.setItem(recoveryKey(), JSON.stringify({
        content: collectContent(), revisionId: activeRevision?.id || null, savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('CMS draft recovery could not be stored', error);
      setNotice('This browser could not store a recovery copy. Keep this tab open and copy your edits before signing in again.', 'error');
    }
  }

  function clearRecovery() {
    try { sessionStorage.removeItem(recoveryKey()); return true; }
    catch (error) {
      console.error('CMS draft recovery cleanup failed', error);
      setNotice('The browser recovery copy could not be removed. It may be offered again when reopening this page.', 'warning');
      return false;
    }
  }

  function lockSession(message) {
    preserveDraft();
    sessionInvalid = true;
    token = '';
    clearTimeout(expiryTimer);
    clearTimeout(expiryWarningTimer);
    elements.sessionStatus.textContent = 'Sign in required';
    elements.signOut.hidden = true;
    elements.auth.hidden = false;
    document.getElementById('pages-sign-in-again').hidden = false;
    editableFields.disabled = true;
    setBusy(busy);
    setNotice(message || 'Your session expired. Unsaved fields are kept in this tab. Sign in again above to continue.', 'error');
    document.getElementById('pages-sign-in').querySelector('[name="email"]')?.focus();
  }

  function useSession(session) {
    token = session.access_token;
    sessionInvalid = false;
    elements.auth.hidden = true;
    document.getElementById('pages-sign-in-again').hidden = true;
    elements.signOut.hidden = false;
    clearTimeout(expiryTimer);
    clearTimeout(expiryWarningTimer);
    if (session.expires_at) {
      const remaining = session.expires_at * 1000 - Date.now();
      expiryWarningTimer = setTimeout(() => setNotice('Your session expires within five minutes unless renewed automatically. Unsaved edits are kept in this tab.', 'warning'), Math.max(0, remaining - 300000));
      expiryTimer = setTimeout(() => lockSession(), Math.max(0, remaining));
    }
    editableFields.disabled = !editing;
    setBusy(busy);
  }

  function setNotice(message, tone) {
    elements.notice.textContent = message;
    elements.notice.dataset.tone = tone || '';
    elements.notice.hidden = !message;
  }

  function setBusy(value) {
    busy = value;
    editableFields.disabled = value || sessionInvalid || !editing;
    [
      elements.saveButton,
      elements.previewButton,
      elements.submitReview,
      elements.requestChanges,
      elements.approve,
      elements.publish,
      newDraftButton
    ].forEach((button) => { button.disabled = value || uploadsInProgress > 0 || sessionInvalid; });
    elements.sectionOrder.querySelectorAll('button').forEach((button) => {
      button.disabled = value || sessionInvalid || !editing || button.dataset.boundary === 'true';
    });
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
    if (sessionInvalid) throw new Error('Sign in again above to continue. Your unsaved fields are preserved.');
    if (supabase) {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        lockSession();
        throw new Error('Your session expired. Sign in again above.');
      }
      useSession(data.session);
    }
    let response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
    if (response.status === 401 && supabase) {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data.session) {
        useSession(data.session);
        response = await fetch(path, { ...options, headers: { ...options.headers, 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
      }
    }
    const data = options.html && response.ok ? await response.text() : response.status === 204 ? {} : await response.json();
    if (!response.ok) {
      if (response.status === 401 || response.status === 403 && /access|permission|account/i.test(data.error || '')) lockSession(data.error);
      const error = new Error(data.error || 'The CMS request failed.');
      error.fields = data.fields || {};
      throw error;
    }
    return data;
  }

  function showWorkflowActions() {
    const status = activeRevision?.status || 'not_started';
    const reviewer = user?.role === 'reviewer';
    elements.submitReview.hidden = !['draft', 'changes_requested'].includes(status);
    elements.requestChanges.hidden = !(reviewer && status === 'in_review');
    elements.approve.hidden = !(reviewer && ['draft', 'changes_requested', 'in_review'].includes(status));
    elements.publish.hidden = !(reviewer && status === 'approved');
    elements.saveButton.hidden = !editing;
    newDraftButton.hidden = !['published', 'approved', 'in_review'].includes(status) || editing;
    editableFields.disabled = sessionInvalid || !editing;
    elements.reviewNotesPanel.hidden = !(reviewer && ['draft', 'changes_requested', 'in_review'].includes(status));
    elements.workflowHelp.textContent = status === 'published'
      ? 'This revision is published. Choose Edit (new draft) to make changes without altering the live revision.'
      : status === 'in_review'
      ? reviewer
          ? 'Preview this saved revision, then approve it. Saving edits creates a new draft.'
          : 'Waiting for a reviewer. An account with the reviewer role must open this page to approve it.'
      : status === 'approved'
        ? reviewer
          ? 'This revision is approved. Publishing updates every website using this CMS database, including live when staging and live share it.'
          : 'This revision is approved. A reviewer must publish it.'
        : reviewer
          ? 'Save your draft, preview it, then approve and publish. Reviewers may approve their own revisions.'
          : 'Save your draft and send it for review. A reviewer must approve it before publication.';
    elements.previewButton.disabled = false;
    setBusy(busy);
  }

  function renderPageList() {
    elements.pageList.replaceChildren();
    const search = document.getElementById('page-search').value.trim().toLowerCase();
    const filter = document.getElementById('page-status-filter').value;
    const matches = pages.filter((page) => `${page.title} ${page.path}`.toLowerCase().includes(search) && (!filter || page.status === filter));
    document.getElementById('page-list-count').textContent = `${matches.length} of ${pages.length} pages`;
    const groups = new Map();
    matches.forEach((page) => {
      const family = /^\/(services|solutions|industries|resources|case-studies)(?:\/|\.|$)/.exec(page.path)?.[1] || 'core';
      if (!groups.has(family)) {
        const group = document.createElement('section');
        const heading = document.createElement('h3');
        heading.textContent = family === 'core' ? 'Main pages' : family.replaceAll('-', ' ');
        group.append(heading);
        groups.set(family, group);
        elements.pageList.append(group);
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pages-list__item';
      button.dataset.pageSlug = page.slug;
      button.setAttribute('aria-current', page.slug === activeDefinition?.slug ? 'page' : 'false');
      const title = document.createElement('strong');
      title.textContent = page.title;
      const status = document.createElement('span');
      status.className = 'pages-list__status';
      status.dataset.status = page.status;
      status.textContent = page.status.replaceAll('_', ' ');
      button.append(title, status);
      button.addEventListener('click', () => openPage(page.slug));
      groups.get(family).append(button);
    });
    const options = document.getElementById('page-link-options');
    options.replaceChildren();
    pages.forEach((page) => {
      const option = document.createElement('option');
      option.value = page.path.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
      option.label = page.title;
      options.append(option);
    });
  }

  function buildFields(content) {
    elements.fields.replaceChildren();
    sectionNav.replaceChildren();
    retainedFields = { ...content.fields };
    let imageFieldIndex = 0;
    activeDefinition.sections.forEach((section, sectionIndex) => {
      const fields = activeDefinition.fields.filter((field) => field.section === section.id);
      if (!fields.length) return;
      const group = document.createElement('details');
      group.className = 'pages-field-group';
      group.id = `page-group-${sectionIndex}`;
      group.open = sectionIndex === 0;
      const legend = document.createElement('summary');
      legend.textContent = `${section.label} (${sectionIndex + 1})`;
      group.append(legend);
      const jump = document.createElement('a');
      jump.href = `#${group.id}`;
      jump.textContent = legend.textContent;
      jump.addEventListener('click', () => { group.open = true; });
      sectionNav.append(jump);
      const advanced = document.createElement('details');
      advanced.className = 'pages-advanced';
      const advancedTitle = document.createElement('summary');
      advancedTitle.textContent = 'Advanced SEO and redirects (reviewers only)';
      advanced.append(advancedTitle);

      fields.forEach((field) => {
        if (field.decorative) return;
        const parent = advancedKeys.has(field.key) ? advanced : group;
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
        input.id = `page-field-${sectionIndex}-${field.key.replace(/[^a-z0-9]/gi, '-')}`;
        if (field.type !== 'select') input.maxLength = field.maxLength;
        input.value = content.fields?.[field.key] || '';
        input.dataset.fieldKey = field.key;
        input.disabled = advancedKeys.has(field.key) && user?.role !== 'reviewer';
        if (field.key.startsWith('u:') || field.key === 'meta:redirect') input.setAttribute('list', 'page-link-options');
        input.addEventListener('input', markDirty);
        label.append(input);
        if (field.type !== 'select') {
          const counter = document.createElement('small');
          const update = () => {
            counter.hidden = input.value.length < field.maxLength * .8;
            counter.textContent = `${input.value.length} / ${field.maxLength} characters`;
          };
          update();
          input.addEventListener('input', update);
          label.append(counter);
        }
        parent.append(label);
        const suggestedCopy = input.value.replace(/Terms of Conditions/g, 'Terms and Conditions').replace(/Chat customer services/g, 'Call customer services');
        if (suggestedCopy !== input.value && field.key.startsWith('t:')) {
          const correction = document.createElement('button');
          correction.type = 'button';
          correction.className = 'cms-button cms-button--secondary';
          correction.textContent = `Use clearer wording: ${suggestedCopy.trim()}`;
          correction.addEventListener('click', () => {
            input.value = suggestedCopy;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            correction.hidden = true;
          });
          parent.append(correction);
        }
        if (field.key.startsWith('alt:')) {
          const hint = document.createElement('small');
          hint.textContent = 'Describe informative images accurately. Leave blank only if decorative; do not guess a person’s identity.';
          label.append(hint);
          const decorative = document.createElement('button');
          decorative.type = 'button';
          decorative.className = 'cms-button cms-button--secondary';
          decorative.textContent = 'Mark as decorative (empty alt text)';
          decorative.addEventListener('click', () => { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); setNotice('Image marked decorative in this draft. Ensure it conveys no essential information.', 'warning'); });
          parent.append(decorative);
        }
        if (field.key === 'meta:redirectStatus') {
          const destination = fields.find((item) => item.key === 'meta:redirect');
          input.disabled ||= !content.fields[destination?.key];
          group.addEventListener('input', () => {
            input.disabled = user?.role !== 'reviewer' || !elements.form.querySelector('[data-field-key="meta:redirect"]')?.value;
          });
        }
        if (field.key.startsWith('src:')) {
          addImageUploadControl(field, group, imageFieldIndex);
          imageFieldIndex += 1;
        }
      });
      if (advanced.children.length > 1) group.append(advanced);
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

    const thumbnail = document.createElement('img');
    thumbnail.className = 'pages-image-thumbnail';
    thumbnail.loading = 'lazy';
    thumbnail.alt = 'Current draft image';
    const urlField = [...elements.fields.querySelectorAll('[data-field-key]'), ...group.querySelectorAll('[data-field-key]')]
      .find((input) => input.dataset.fieldKey === field.key);
    const updateThumbnail = () => {
      const value = urlField?.value || '';
      if (/^(https:\/\/|\/(?!\/))/.test(value)) { thumbnail.src = value; thumbnail.hidden = false; }
      else { thumbnail.removeAttribute('src'); thumbnail.hidden = true; }
    };
    updateThumbnail();
    urlField?.addEventListener('input', updateThumbnail);
    const status = document.createElement('p');
    status.className = 'pages-image-upload__status';
    status.id = `page-image-status-${index}`;
    status.textContent = 'Choose a file to enable Upload image. JPEG, PNG, WebP or AVIF; up to 3 MB. Uploads become public immediately, before saving or publishing.';
    fileInput.setAttribute('aria-describedby', status.id);
    uploadButton.setAttribute('aria-describedby', status.id);
    thumbnail.addEventListener('error', () => {
      thumbnail.hidden = true;
      status.textContent = 'The current image could not be loaded. Check its URL or upload a replacement.';
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      uploadButton.disabled = !file;
      status.dataset.tone = '';
      status.textContent = file ? `${file.name} is ready to upload. Uploading makes this file public immediately.` : 'Choose a file to enable Upload image. Files become public immediately.';
    });

    uploadButton.addEventListener('click', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      if (busy || uploadsInProgress || sessionInvalid) {
        status.dataset.tone = 'error';
        status.textContent = 'Finish the current CMS action before uploading another image.';
        setNotice(status.textContent, 'warning');
        return;
      }
      if (!allowedImageTypes.has(file.type)) {
        status.dataset.tone = 'error';
        status.textContent = 'Choose a JPEG, PNG, WebP, or AVIF image.';
        setNotice(status.textContent, 'error');
        return;
      }
      if (!file.size || file.size > maxImageUploadBytes) {
        status.dataset.tone = 'error';
        status.textContent = 'Image uploads must be larger than 0 bytes and no larger than 3 MB.';
        setNotice(status.textContent, 'error');
        return;
      }

      uploadsInProgress += 1;
      setBusy(busy);
      uploadButton.disabled = true;
      fileInput.disabled = true;
      status.dataset.tone = '';
      status.textContent = 'Uploading image…';
      setNotice(status.textContent);
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
        setNotice(status.textContent, 'success');
      } catch (error) {
        status.dataset.tone = 'error';
        status.textContent = error.message || 'The image could not be uploaded.';
        setNotice(status.textContent, 'error');
      } finally {
        uploadsInProgress -= 1;
        setBusy(busy);
        fileInput.disabled = false;
        uploadButton.disabled = !fileInput.files?.length;
      }
    });

    container.append(thumbnail, label, fileInput, uploadButton, status);
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
        button.dataset.boundary = String(index + control.offset < 0 || index + control.offset >= sectionOrder.length);
        button.disabled = button.dataset.boundary === 'true' || !editing || sessionInvalid || busy;
        button.addEventListener('click', () => {
          if (!editing || sessionInvalid || busy) return;
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
    preserveDraft();
    if (!elements.previewPanel.hidden) document.getElementById('page-preview-title').textContent = 'Draft preview (out of date — refresh preview)';
  }

  function preventLeave(event) {
    if (!dirty && !uploadsInProgress) return;
    event.preventDefault();
    event.returnValue = '';
  }

  function collectContent() {
    const fields = { ...retainedFields };
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
    const publishedState = publishedRevisionId === revision.id ? 'Published: this revision'
      : publishedRevisionId ? 'Published: another saved revision' : 'Published: original template';
    return `Revision ${revision.revision_number} · ${revision.status.replaceAll('_', ' ')} · ${publishedState}`;
  }

  async function openPage(slug) {
    if (uploadsInProgress) {
      setNotice('Wait for the image upload to finish before opening another page.', 'warning');
      return;
    }
    if (busy || sessionInvalid) return;
    if (dirty && !await window.CmsDialogs.confirm({ title: 'Leave without saving?', message: 'Your latest changes have not been saved. Opening another page will discard them.', confirmLabel: 'Discard changes', cancelLabel: 'Keep editing', danger: true })) return;
    const previousKey = activeDefinition && user ? recoveryKey() : null;
    setBusy(true);
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
      if (previousKey && dirty) clearRecovery();
      activeDefinition = {
        ...nextDefinition,
        fields: templateDefaults.fieldsSchema.filter((field) => !['home.seo.title', 'home.seo.description'].includes(field.key)),
        sections: templateDefaults.sections
      };
      activeRevision = nextRevision;
      user = data.user;
      publishedRevisionId = data.publishedRevisionId || null;
      savedContent = structuredClone(content);
      editing = !nextRevision || ['draft', 'changes_requested'].includes(nextRevision.status);
      elements.previewPanel.hidden = true;
      elements.editor.classList.remove('pages-editor--preview');
      previewRequest++;
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
      document.getElementById('page-live-link').href = `https://network-consultancy.com${nextDefinition.path}`;
      try {
        const stored = sessionStorage.getItem(recoveryKey());
        if (stored) {
          const recovery = JSON.parse(stored);
          if (await window.CmsDialogs.confirm({ title: 'Restore your unsaved changes?', message: `This tab has a recovery copy from ${new Date(recovery.savedAt).toLocaleString()}.${recovery.revisionId !== (activeRevision?.id || null) ? ' A newer version has been saved since then. Compare your recovered changes before saving.' : ''}`, confirmLabel: 'Restore changes', cancelLabel: 'Use saved version' })) {
            const recovered = { ...content, fields: { ...content.fields } };
            const allowed = new Set(activeDefinition.fields.map((field) => field.key));
            const stale = Object.keys(recovery.content?.fields || {}).filter((key) => !allowed.has(key) && !key.startsWith('home.seo.'));
            for (const field of activeDefinition.fields) {
              const value = recovery.content?.fields?.[field.key];
              if (typeof value === 'string' && (!advancedKeys.has(field.key) || user.role === 'reviewer')) recovered.fields[field.key] = value;
            }
            editing = true;
            if (Array.isArray(recovery.content?.sectionOrder) &&
                recovery.content.sectionOrder.length === sectionOrder.length &&
                new Set(recovery.content.sectionOrder).size === sectionOrder.length &&
                recovery.content.sectionOrder.every((id) => sectionOrder.includes(id))) {
              sectionOrder = [...recovery.content.sectionOrder];
              renderSectionOrder();
            }
            buildFields(recovered);
            markDirty();
            if (stale.length) setNotice(`${stale.length} old fields no longer exist in this template and could not be restored. Review the recovered draft before saving.`, 'warning');
          } else clearRecovery();
        }
      } catch (error) {
        console.error('CMS draft recovery failed', error);
        setNotice('The browser recovery copy could not be restored. Your server-saved revision is still available.', 'warning');
      }
      if (templateDefaults.warnings?.length) setNotice(templateDefaults.warnings.join(' '), 'warning');
    } catch (error) {
      setNotice(error.message || 'That page could not be opened.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    if (sessionInvalid) throw new Error('Sign in before saving. Your edits are preserved.');
    await checkChangedLinks();
    await confirmAdvancedChanges();
    const content = collectContent();
    const data = await api(`/api/cms/pages/${encodeURIComponent(activeDefinition.slug)}`, {
      method: 'POST',
      body: JSON.stringify(content)
    });
    activeRevision = data.revision;
    savedContent = structuredClone(content);
    editing = true;
    renderSectionOrder();
    const recoveryCleared = clearRecovery();
    dirty = false;
    window.removeEventListener('beforeunload', preventLeave);
    elements.editorState.textContent = statusText(activeRevision);
    elements.saveStatus.textContent = recoveryCleared ? 'Draft saved' : 'Draft saved. The browser recovery copy could not be removed.';
    setNotice(elements.saveStatus.textContent, recoveryCleared ? 'success' : 'warning');
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
    if (['approve', 'publish', 'submit_for_review'].includes(action)) {
      const warnings = contentWarnings();
      if (warnings.length && !await window.CmsDialogs.confirm({ title: 'Check this page before continuing', message: `${warnings.map((warning) => `• ${warning}`).join('\n\n')}\n\nThese checks apply to the saved version of this page.`, confirmLabel: 'Continue with saved page', cancelLabel: 'Go back and check' })) return;
      await confirmAdvancedChanges();
    }
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
      publishedRevisionId = activeRevision.id;
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
    setNotice(elements.saveStatus.textContent, 'success');
    await refreshPages();
    editing = !['approved', 'published', 'in_review'].includes(activeRevision.status);
    showWorkflowActions();
  }

  async function previewDraft() {
    if (!activeDefinition) return;
    const requestId = ++previewRequest;
    const slug = activeDefinition.slug;
    const html = await api(`/api/cms/pages/${encodeURIComponent(slug)}/preview`, {
      method: 'POST',
      html: true,
      body: JSON.stringify(collectContent())
    });
    if (requestId !== previewRequest || activeDefinition?.slug !== slug) return;
    elements.previewFrame.srcdoc = html;
    elements.previewFrame.title = `Preview of ${activeDefinition.title}`;
    elements.previewPanel.hidden = false;
    document.getElementById('page-preview-title').textContent = 'Draft preview';
    elements.editor.classList.add('pages-editor--preview');
  }

  function showFieldErrors(fields) {
    elements.form.querySelectorAll('.pages-field-error').forEach((node) => node.remove());
    elements.form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
    for (const [key, message] of Object.entries(fields)) {
      const input = [...elements.form.querySelectorAll('[data-field-key]')].find((field) => field.dataset.fieldKey === key);
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.setCustomValidity?.(message);
        input.addEventListener('input', () => input.setCustomValidity?.(''), { once: true });
        const error = document.createElement('small');
        error.id = `${input.id}-error`;
        error.className = 'pages-field-error';
        error.textContent = message;
        input.setAttribute('aria-describedby', error.id);
        input.parentElement.append(error);
      }
    }
    const firstInvalid = elements.form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) focusField(firstInvalid.dataset.fieldKey);
  }

  function focusField(key) {
    const input = [...elements.form.querySelectorAll('[data-field-key]')].find((item) => item.dataset.fieldKey === key);
    if (!input) return;
    for (let parent = input.parentElement; parent && parent !== elements.form; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
    if (!editing) {
      setNotice('Choose Edit (new draft) before changing this saved revision.', 'warning');
      newDraftButton.focus();
      return;
    }
    input.scrollIntoView({ block: 'center', behavior: 'smooth' });
    input.focus({ preventScroll: true });
  }

  function contentWarnings() {
    const fields = collectContent().fields;
    const warnings = [];
    const headings = Object.entries(fields).filter(([key]) => key.startsWith('heading:'));
    if (headings.length && headings.filter(([, level]) => level === 'h1').length !== 1) warnings.push('Use one main H1 heading. This page currently has zero or multiple H1 headings.');
    let previous = 0;
    for (const [, level] of headings) {
      const current = Number(level.slice(1));
      if (previous && current > previous + 1) { warnings.push('Heading levels skip a level. Check the heading structure in preview.'); break; }
      previous = current;
    }
    if (Object.entries(fields).some(([key, value]) => key.startsWith('alt:') && !value.trim())) warnings.push('Some images have empty alt text. Confirm they are decorative or add accurate descriptions.');
    if (fields['meta:robots']?.includes('noindex')) warnings.push('Search engines will be asked NOT to index this page.');
    if (fields['meta:redirect']) warnings.push(`This page will redirect to ${fields['meta:redirect']} instead of displaying its content.`);
    return warnings;
  }

  async function confirmAdvancedChanges() {
    const fields = collectContent().fields;
    if (fields['meta:schema']) {
      try { JSON.parse(fields['meta:schema']); }
      catch { showFieldErrors({ 'meta:schema': 'Enter valid JSON-LD.' }); throw new Error('Structured data must be valid JSON before continuing.'); }
    }
    const changes = [...advancedKeys].filter((key) => fields[key] !== savedContent?.fields?.[key]);
    if (changes.length && !await window.CmsDialogs.confirm({ title: 'Save changes to search and redirect settings?', message: `You changed:\n${changes.map((key) => activeDefinition.fields.find((field) => field.key === key)?.label || key).join('\n')}\n\nA redirect sends visitors to another page. Turning off search indexing asks search engines to hide this page. Clearing structured data removes information used by search engines.\n\nThese changes will affect the website only after you publish.`, confirmLabel: 'Save these settings', cancelLabel: 'Keep editing' })) {
      throw new Error('Advanced setting changes were not confirmed. Your edits remain unsaved.');
    }
  }

  async function checkChangedLinks() {
    const warnings = [];
    const normalize = (path) => path.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const knownPaths = new Set(pages.map((page) => normalize(page.path)));
    const links = [...new Set(Object.entries(collectContent().fields)
      .filter(([key, value]) => key.startsWith('u:') && value !== savedContent?.fields?.[key] &&
        (/^\/(?!\/)/.test(value) || /^https:\/\/(?:www\.)?network-consultancy\.com(?:\/|$)/i.test(value)))
      .map(([, value]) => { const url = new URL(value, 'https://network-consultancy.com'); return url.pathname + url.search; }))];
    for (const path of links) {
      if (knownPaths.has(normalize(path.split('?')[0]))) continue;
      const response = await fetch(path, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
      if (!response.ok) warnings.push(`Internal link ${path} returned HTTP ${response.status}.`);
    }
    if (warnings.length && !await window.CmsDialogs.confirm({ title: 'Some links could not be opened', message: `${warnings.join('\n')}\n\nVisitors may not be able to open these links. You can go back to fix them or save the draft anyway.`, confirmLabel: 'Save draft anyway', cancelLabel: 'Check links' })) throw new Error('Draft not saved. Check the internal links, then try again.');
  }

  function attachPreviewSelection() {
    const preview = elements.previewFrame.contentDocument;
    if (!preview) return;
    const style = preview.createElement('style');
    style.textContent = '[data-page-editor-fields]{outline:1px dashed #0982c5;cursor:pointer}[data-page-editor-fields]:focus{outline:3px solid #0982c5}';
    preview.head.append(style);
    preview.querySelectorAll('[data-page-editor-fields]').forEach((node) => {
      node.tabIndex = 0;
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', `Edit ${node.textContent?.trim().slice(0, 60) || 'image or page block'}`);
    });
    const select = (event) => {
      const node = event.target.closest('[data-page-editor-fields]');
      if (!node) { if (event.target.closest('a,form')) event.preventDefault(); return; }
      event.preventDefault();
      const keys = JSON.parse(node.getAttribute('data-page-editor-fields'));
      const key = keys.find((key) => key.startsWith('t:')) || keys.find((key) => key.startsWith('src:')) || keys[0];
      focusField(key);
    };
    preview.addEventListener('click', select);
    preview.addEventListener('keydown', (event) => { if (['Enter', ' '].includes(event.key)) select(event); });
    preview.addEventListener('submit', (event) => event.preventDefault());
  }

  async function loadHistory(more = false) {
    const slug = activeDefinition.slug;
    const requestId = ++historyRequest;
    if (!more) { historyRows = []; historySlug = slug; }
    const cursor = more ? `&before=${historyRows.at(-1).revision_number}` : '';
    const data = await api(`/api/cms/pages/${encodeURIComponent(slug)}?view=history${cursor}`);
    if (requestId !== historyRequest || historySlug !== slug || activeDefinition?.slug !== slug) return;
    historyRows.push(...data.revisions);
    const list = document.getElementById('page-history-list');
    list.replaceChildren();
    const from = document.getElementById('page-compare-from');
    const to = document.getElementById('page-compare-to');
    const selectedFrom = from.value;
    const selectedTo = to.value;
    from.replaceChildren();
    to.replaceChildren();
    const current = document.createElement('option');
    current.value = '';
    current.textContent = 'Current editor values';
    to.append(current);
    historyRows.forEach((revision) => {
      const row = document.createElement('p');
      const actor = revision.created_by === user.id ? 'you' : revision.createdByName || revision.created_by || 'unknown author';
      row.textContent = `Revision ${revision.revision_number} · ${revision.status.replaceAll('_', ' ')}${revision.id === data.publishedRevisionId ? ' · CURRENTLY LIVE' : ''} · ${new Date(revision.updated_at).toLocaleString()} · author: ${actor}${revision.reviewed_by ? ` · reviewer: ${revision.reviewedByName || revision.reviewed_by}` : ''}${revision.reviewer_notes ? ` · Notes: ${revision.reviewer_notes}` : ''}`;
      list.append(row);
      for (const select of [from, to]) {
        const option = document.createElement('option');
        option.value = revision.id;
        option.textContent = `Revision ${revision.revision_number} · ${revision.status}`;
        select.append(option);
      }
    });
    if (!historyRows.length) list.textContent = 'No saved revisions yet.';
    from.value = historyRows.some((row) => row.id === selectedFrom) ? selectedFrom
      : historyRows.find((row) => row.id === data.publishedRevisionId)?.id || historyRows[0]?.id || '';
    to.value = historyRows.some((row) => row.id === selectedTo) ? selectedTo : '';
    if (!more) document.getElementById('page-diff').replaceChildren();
    document.getElementById('page-history-more').hidden = !data.hasMore;
    document.getElementById('page-history-dialog').showModal();
  }

  async function compareRevisions() {
    const slug = activeDefinition.slug;
    const fromId = document.getElementById('page-compare-from').value;
    const toId = document.getElementById('page-compare-to').value;
    if (!fromId) throw new Error('Save a revision before comparing history.');
    const [from, to] = await Promise.all([
      api(`/api/cms/pages/${encodeURIComponent(slug)}?revision=${encodeURIComponent(fromId)}`),
      toId ? api(`/api/cms/pages/${encodeURIComponent(slug)}?revision=${encodeURIComponent(toId)}`) : Promise.resolve({ revision: { content: collectContent() } })
    ]);
    if (activeDefinition?.slug !== slug) return;
    const output = document.getElementById('page-diff');
    output.replaceChildren();
    const before = from.revision.content.fields;
    const after = to.revision.content.fields;
    let count = 0;
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
      if (before[key] === after[key]) continue;
      count++;
      const article = document.createElement('article');
      const title = document.createElement('h3');
      const field = activeDefinition.fields.find((field) => field.key === key);
      const section = activeDefinition.sections.find((section) => section.id === field?.section);
      title.textContent = field ? `${section?.label || 'Page'} · ${field.label}` : key;
      const oldValue = document.createElement('pre');
      oldValue.textContent = `Before:\n${before[key] ?? '(not set)'}`;
      const newValue = document.createElement('pre');
      newValue.textContent = `After:\n${after[key] ?? '(not set)'}`;
      article.append(title, oldValue, newValue);
      output.append(article);
    }
    if (JSON.stringify(from.revision.content.sectionOrder) !== JSON.stringify(to.revision.content.sectionOrder)) {
      const order = document.createElement('pre');
      const labels = (ids) => (ids || []).map((id) => activeDefinition.sections.find((section) => section.id === id)?.label || id).join(' → ');
      order.textContent = `Section order changed:\nBefore: ${labels(from.revision.content.sectionOrder)}\nAfter: ${labels(to.revision.content.sectionOrder)}`;
      output.append(order);
      count++;
    }
    if (!count) output.textContent = 'No changes between these versions.';
    output.focus();
  }

  function bindEvents() {
    document.getElementById('pages-sign-in-again').addEventListener('click', () => {
      document.getElementById('pages-sign-in').scrollIntoView({ block: 'center' });
      document.getElementById('pages-sign-in').querySelector('[name="email"]').focus();
    });
    document.getElementById('page-search').addEventListener('input', renderPageList);
    document.getElementById('page-status-filter').addEventListener('change', renderPageList);
    elements.previewFrame.addEventListener('load', attachPreviewSelection);
    document.getElementById('page-preview-width').addEventListener('change', (event) => {
      elements.previewFrame.style.width = event.target.value;
    });
    document.getElementById('page-history').addEventListener('click', async () => {
      try { await loadHistory(); } catch (error) { setNotice(error.message, 'error'); }
    });
    document.getElementById('page-history-more').addEventListener('click', async () => {
      try { await loadHistory(true); } catch (error) { setNotice(error.message, 'error'); }
    });
    document.getElementById('page-history-close').addEventListener('click', () => document.getElementById('page-history-dialog').close());
    document.getElementById('page-compare').addEventListener('click', async () => {
      try { await compareRevisions(); } catch (error) { setNotice(error.message, 'error'); }
    });
    newDraftButton.addEventListener('click', () => {
      if (sessionInvalid || busy) return;
      editing = true;
      showWorkflowActions();
      elements.saveStatus.textContent = 'Editing a new draft. The approved or published revision stays unchanged until you save and publish.';
      elements.form.querySelector('[data-field-key]:not(:disabled)')?.focus();
    });
    document.getElementById('pages-sign-in').addEventListener('submit', async (event) => {
      event.preventDefault();
      const signInForm = event.currentTarget;
      const form = new FormData(signInForm);
      const button = signInForm.querySelector('button');
      button.disabled = true;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
        if (error) throw error;
        if (user && data.user.id !== user.supabase_user_id) {
          preserveDraft();
          dirty = false;
          window.removeEventListener('beforeunload', preventLeave);
          window.location.reload();
          return;
        }
        useSession(data.session);
        await refreshPages();
        elements.workspace.hidden = false;
        elements.sessionStatus.textContent = `${user.display_name} · ${user.role}`;
        if (activeDefinition) showWorkflowActions();
        setNotice('Signed in. Your unsaved fields are still here.', 'success');
        signInForm.reset();
      } catch (error) { lockSession(error.message); }
      finally { button.disabled = false; }
    });
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
      setBusy(true);
      try {
        if (!await window.CmsDialogs.confirm({ title: 'Publish this page?', message: `You are about to publish the approved version of "${activeDefinition.title}".\n\nThis changes the live website and staging because they use the same content database. Visitors may need a few minutes to see the update.`, confirmLabel: 'Publish page', cancelLabel: 'Not yet' })) return;
        await runWorkflow('publish');
      } catch (error) { setNotice(error.message, 'error'); } finally { setBusy(false); }
    });
    elements.previewButton.addEventListener('click', async () => {
      try { await previewDraft(); } catch (error) { setNotice(error.message, 'error'); }
    });
    document.getElementById('page-preview-close').addEventListener('click', () => {
      elements.previewPanel.hidden = true;
      elements.editor.classList.remove('pages-editor--preview');
      previewRequest++;
    });
    document.getElementById('page-editor-back').addEventListener('click', async () => {
      if (busy) return;
      if (uploadsInProgress) {
        setNotice('Wait for the image upload to finish before leaving this page.', 'warning');
        return;
      }
      if (dirty && !await window.CmsDialogs.confirm({ title: 'Close without saving?', message: 'Your latest changes have not been saved. Closing this page will discard them.', confirmLabel: 'Discard changes', cancelLabel: 'Keep editing', danger: true })) return;
      clearRecovery();
      dirty = false;
      window.removeEventListener('beforeunload', preventLeave);
      elements.editor.hidden = true;
      activeDefinition = null;
      renderPageList();
    });
    elements.signOut.addEventListener('click', async () => {
      if (busy) { setNotice('Wait for the current CMS action to finish before signing out.', 'warning'); return; }
      if (uploadsInProgress) { setNotice('Wait for your image upload to finish before signing out.', 'warning'); return; }
      if (dirty && !await window.CmsDialogs.confirm({ title: 'Sign out with unsaved changes?', message: 'Your changes are not saved to the website. A recovery copy will stay in this browser tab so you can continue after signing back in with the same account. Keep this tab open.', confirmLabel: 'Sign out', cancelLabel: 'Keep editing' })) return;
      preserveDraft();
      const { error } = await supabase.auth.signOut();
      if (error) { setNotice(error.message, 'error'); return; }
      lockSession('Signed out. Sign in here to return to the same editor.');
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
    bindEvents();
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) { lockSession(); return; }
      if (user?.supabase_user_id && session.user.id !== user.supabase_user_id) {
        preserveDraft();
        dirty = false;
        window.removeEventListener('beforeunload', preventLeave);
        window.location.reload();
        return;
      }
      useSession(session);
    });
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      lockSession('Sign in to edit website pages. Pages and Blog use the same CMS session.');
      return;
    }
    useSession(data.session);
    elements.workspace.hidden = false;
    elements.sessionStatus.textContent = 'Connecting to CMS';
    await refreshPages();
    elements.sessionStatus.textContent = `${user.display_name} · ${user.role}`;
    elements.pagePreview = document.getElementById('page-preview');
  } catch (error) {
    elements.sessionStatus.textContent = 'CMS connection failed';
    setNotice(error.message || 'The Pages editor could not connect.', 'error');
  }
}());
