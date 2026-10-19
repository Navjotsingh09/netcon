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
    publish: document.getElementById('page-publish')
  };

  let supabase;
  let token = '';
  let user = null;
  let pages = [];
  let activeDefinition = null;
  let activeRevision = null;
  let sectionOrder = [];
  let dirty = false;
  let busy = false;
  let isProductionDeployment = false;

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
    ].forEach((button) => { button.disabled = value; });
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

  function readProperty(element, property, preserveLines) {
    if (property === 'textContent') {
      if (!preserveLines) return element.textContent || '';
      const copy = element.cloneNode(true);
      copy.querySelectorAll('br').forEach((lineBreak) => lineBreak.replaceWith('\n'));
      return copy.textContent || '';
    }
    if (property === 'href' || property === 'src') return element.getAttribute(property) || '';
    if (property === 'content' || property === 'placeholder' || property === 'alt') return element.getAttribute(property) || '';
    return '';
  }

  const editableTextTags = new Set(['A', 'BLOCKQUOTE', 'BUTTON', 'EM', 'FIGCAPTION', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'P', 'SMALL', 'SPAN', 'STRONG']);

  function elementPath(element, root) {
    const parts = [];
    let current = element;
    while (current && current !== root) {
      const siblings = [...current.parentElement.children].filter((sibling) => sibling.tagName === current.tagName);
      parts.unshift(`${current.tagName.toLowerCase()}[${siblings.indexOf(current) + 1}]`);
      current = current.parentElement;
    }
    return current === root ? parts.join('/') : null;
  }

  function sectionForElement(element, root) {
    const section = element.closest('section');
    if (!section || !root.contains(section)) return { id: 'page', label: 'Page content' };
    const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
    const id = elementPath(section, root) || 'page';
    return { id, label: heading?.textContent.trim().replace(/\s+/g, ' ').slice(0, 100) || 'Page section' };
  }

  function fieldLabel(element, value, kind) {
    const tag = element.tagName.toLowerCase();
    const excerpt = String(value || '').replace(/\s+/g, ' ').trim().slice(0, 70);
    return `${kind} · ${tag}${excerpt ? ` · ${excerpt}` : ''}`;
  }

  function readDynamicTemplate(template, definition) {
    const root = template.querySelector(`[data-cms-page="${definition.slug}"]`);
    if (!root) throw new Error(`The ${definition.title} template is missing its CMS page root.`);
    const fields = {
      'meta:title': template.title,
      'meta:description': template.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    };
    const sections = new Map();
    const fieldsSchema = [
      { key: 'meta:title', label: 'Search title', section: 'search-metadata', type: 'text', property: 'title', maxLength: 180 },
      { key: 'meta:description', label: 'Search description', section: 'search-metadata', type: 'textarea', property: 'content', maxLength: 360 }
    ];
    sections.set('search-metadata', { id: 'search-metadata', label: 'Search metadata' });

    const walker = template.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const element = node.parentElement;
      if (!editableTextTags.has(element.tagName) || element.closest('form, nav, script, style, svg, template, noscript')) continue;
      const value = node.nodeValue;
      if (!value.trim()) continue;
      const path = elementPath(element, root);
      if (path === null) continue;
      const textNodes = [...element.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE);
      const textIndex = textNodes.indexOf(node);
      const key = `t:${path}#${textIndex}`;
      const section = sectionForElement(element, root);
      sections.set(section.id, section);
      fields[key] = value;
      fieldsSchema.push({
        key,
        label: fieldLabel(element, value, 'Text'),
        section: section.id,
        type: value.length > 90 || ['P', 'LI', 'BLOCKQUOTE'].includes(element.tagName) ? 'textarea' : 'text',
        property: 'textContent',
        maxLength: 5000
      });
    }

    root.querySelectorAll('a[href]').forEach((element) => {
      if (element.closest('form, nav, script, style, svg, template, noscript')) return;
      const path = elementPath(element, root);
      if (path === null) return;
      const key = `u:${path}`;
      const value = element.getAttribute('href') || '';
      const section = sectionForElement(element, root);
      sections.set(section.id, section);
      fields[key] = value;
      fieldsSchema.push({
        key,
        label: fieldLabel(element, element.textContent, 'Link URL'),
        section: section.id,
        type: 'url',
        property: 'href',
        maxLength: 500
      });
    });

    return { fields, sectionOrder: [], fieldsSchema, sections: [...sections.values()] };
  }

  async function readTemplateDefaults(definition) {
    const response = await fetch(definition.path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load the current ${definition.title.toLowerCase()} template.`);
    const html = await response.text();
    const template = new DOMParser().parseFromString(html, 'text/html');
    if (definition.dynamic) return readDynamicTemplate(template, definition);
    const values = {};

    definition.fields.forEach((field) => {
      const attribute = field.property === 'href' || field.property === 'src' ? 'data-cms-url-field' : 'data-cms-field';
      const target = Array.from(template.querySelectorAll(`[${attribute}]`)).find((element) => element.getAttribute(attribute) === field.key);
      if (target) values[field.key] = readProperty(target, field.property, field.preserveLines);
    });
    const order = Array.from(template.querySelectorAll('[data-cms-page] > [data-cms-section]'))
      .map((section) => section.getAttribute('data-cms-section'));
    return { fields: values, sectionOrder: order };
  }

  function buildFields(content) {
    elements.fields.replaceChildren();
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
        if (field.type === 'textarea') {
          input = document.createElement('textarea');
          input.rows = 3;
        } else {
          input = document.createElement('input');
          input.type = field.type === 'url' ? 'url' : 'text';
          input.autocomplete = 'off';
        }
        input.name = field.key;
        input.maxLength = field.maxLength;
        input.value = content.fields?.[field.key] || '';
        input.dataset.fieldKey = field.key;
        input.addEventListener('input', markDirty);
        label.append(input);
        const counter = document.createElement('small');
        counter.textContent = `${input.value.length} / ${field.maxLength} characters`;
        input.addEventListener('input', () => { counter.textContent = `${input.value.length} / ${field.maxLength} characters`; });
        label.append(counter);
        group.append(label);
      });
      elements.fields.append(group);
    });
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
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  }

  function collectContent() {
    const fields = {};
    elements.form.querySelectorAll('[data-field-key]').forEach((input) => {
      fields[input.dataset.fieldKey] = input.value;
    });
    return { fields, sectionOrder: [...sectionOrder] };
  }

  function statusText(revision) {
    if (!revision) return 'Not saved yet';
    return `Revision ${revision.revision_number} · ${revision.status.replaceAll('_', ' ')}`;
  }

  async function openPage(slug) {
    if (dirty && activeDefinition?.slug !== slug && !window.confirm('Discard your unsaved changes and open another page?')) return;
    try {
      setNotice('', '');
      const data = await api(`/api/cms/pages/${encodeURIComponent(slug)}`);
      const nextDefinition = data.definition;
      const nextRevision = data.revision;
      let content = nextRevision?.content;
      const templateDefaults = nextDefinition.dynamic ? await readTemplateDefaults(nextDefinition) : null;
      if (!content) content = templateDefaults || await readTemplateDefaults(nextDefinition);
      else if (templateDefaults) {
        content = {
          ...content,
          fields: { ...templateDefaults.fields, ...(content.fields || {}) },
          sectionOrder: []
        };
      }
      activeDefinition = templateDefaults
        ? { ...nextDefinition, fields: templateDefaults.fieldsSchema, sections: templateDefaults.sections }
        : nextDefinition;
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
      elements.saveStatus.textContent = isProductionDeployment ? 'Page published live.' : 'Page published to staging only.';
    } else if (action === 'publish') {
      activeRevision = { ...activeRevision, status: result.status };
      elements.saveStatus.textContent = 'Page published.';
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

  function applyDraftToDocument(template, definition, content) {
    const fields = content.fields || {};
    if (definition.dynamic) {
      const root = template.querySelector(`[data-cms-page="${definition.slug}"]`);
      if (!root) throw new Error(`The ${definition.title} template is missing its CMS page root.`);
      applyDynamicFields(template, root, fields);
      template.querySelectorAll('script, input[type="hidden"]').forEach((node) => node.remove());
      template.querySelectorAll('*').forEach((element) => {
        Array.from(element.attributes).forEach((attribute) => {
          if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name);
        });
      });
      template.querySelectorAll('form').forEach((form) => {
        form.removeAttribute('action');
        form.querySelectorAll('input, textarea, button, select').forEach((control) => { control.disabled = true; });
      });
      const base = template.createElement('base');
      base.href = `${window.location.origin}/`;
      template.head.prepend(base);
      return `<!doctype html>${template.documentElement.outerHTML}`;
    }
    definition.fields.forEach((field) => {
      const attribute = field.property === 'href' || field.property === 'src' ? 'data-cms-url-field' : 'data-cms-field';
      template.querySelectorAll(`[${attribute}]`).forEach((element) => {
        if (element.getAttribute(attribute) !== field.key) return;
        const value = fields[field.key] || '';
        if (field.type === 'url') {
          const safeUrl = safeCmsUrl(value, field.property);
          if (safeUrl === null) throw new Error(`Use a safe website or contact link for “${field.label}” before previewing.`);
          element.setAttribute(field.property, safeUrl);
          return;
        }
        if (field.property === 'textContent') {
          element.textContent = value;
          if (field.preserveLines) element.style.whiteSpace = 'pre-line';
        } else {
          element.setAttribute(field.property, value);
        }
      });
    });

    const pageRoot = template.querySelector(`[data-cms-page="${definition.slug}"]`);
    const sections = new Map(Array.from(pageRoot?.querySelectorAll(':scope > [data-cms-section]') || [])
      .map((section) => [section.getAttribute('data-cms-section'), section]));
    const slots = [];
    sections.forEach((section) => {
      const marker = template.createComment('page-cms-section');
      section.replaceWith(marker);
      slots.push(marker);
    });
    (content.sectionOrder || []).forEach((id, index) => {
      const section = sections.get(id);
      if (section && slots[index]) slots[index].replaceWith(section);
    });

    template.querySelectorAll('script, input[type="hidden"]').forEach((node) => node.remove());
    template.querySelectorAll('*').forEach((element) => {
      Array.from(element.attributes).forEach((attribute) => {
        if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name);
      });
    });
    template.querySelectorAll('form').forEach((form) => {
      form.removeAttribute('action');
      form.querySelectorAll('input, textarea, button, select').forEach((control) => { control.disabled = true; });
    });
    const base = template.createElement('base');
    base.href = `${window.location.origin}/`;
    template.head.prepend(base);
    return `<!doctype html>${template.documentElement.outerHTML}`;
  }

  function resolveElementPath(root, path) {
    if (!path) return root;
    let current = root;
    for (const part of path.split('/')) {
      const match = /^([a-z][a-z0-9-]*)\[(\d+)\]$/.exec(part);
      if (!match) return null;
      const [, tag, index] = match;
      current = [...current.children].filter((child) => child.tagName.toLowerCase() === tag)[Number(index) - 1];
      if (!current) return null;
    }
    return current;
  }

  function applyDynamicFields(template, root, fields) {
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value !== 'string') return;
      if (key === 'meta:title') {
        template.title = value;
        return;
      }
      if (key === 'meta:description') {
        const description = template.querySelector('meta[name="description"]');
        if (description) description.setAttribute('content', value);
        return;
      }
      const textMatch = /^t:(.*)#(\d+)$/.exec(key);
      if (textMatch) {
        const element = resolveElementPath(root, textMatch[1]);
        const textNodes = element && [...element.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE);
        const textNode = textNodes?.[Number(textMatch[2])];
        if (textNode && editableTextTags.has(element.tagName)) textNode.nodeValue = value;
        return;
      }
      const urlMatch = /^u:(.+)$/.exec(key);
      if (urlMatch) {
        const anchor = resolveElementPath(root, urlMatch[1]);
        if (anchor?.tagName === 'A' && safeCmsUrl(value, 'href') !== null) anchor.setAttribute('href', value);
      }
    });
  }

  function safeCmsUrl(value, property) {
    const candidate = String(value || '').trim();
    if (!candidate) return '';
    if (/[\s\\\u0000-\u001f\u007f]/.test(candidate)) return null;
    if (property === 'href' && /^#/.test(candidate)) return candidate;
    if (property === 'href' && /^tel:/i.test(candidate)) {
      return /^tel:\+?[0-9().-]+(?:;ext=\d+)?$/i.test(candidate) ? candidate : null;
    }
    if (property === 'href' && /^mailto:/i.test(candidate)) {
      try {
        const url = new URL(candidate);
        return url.protocol === 'mailto:' && url.pathname && !url.search && !url.hash ? candidate : null;
      } catch {
        return null;
      }
    }
    if (/^https:\/\//i.test(candidate)) {
      try {
        const url = new URL(candidate);
        return url.protocol === 'https:' && url.hostname && !url.username && !url.password ? candidate : null;
      } catch {
        return null;
      }
    }
    if (candidate.startsWith('/') && !candidate.startsWith('//')) {
      try {
        return new URL(candidate, window.location.origin).origin === window.location.origin ? candidate : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  async function previewDraft() {
    if (!activeDefinition) return;
    const response = await fetch(activeDefinition.path, { cache: 'no-store' });
    if (!response.ok) throw new Error('The page template could not be loaded for preview.');
    const html = await response.text();
    const template = new DOMParser().parseFromString(html, 'text/html');
    elements.previewFrame.srcdoc = applyDraftToDocument(template, activeDefinition, collectContent());
    elements.previewDialog.showModal();
  }

  function bindEvents() {
    elements.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy || !activeDefinition) return;
      setBusy(true);
      try {
        await saveDraft();
      } catch (error) {
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
      try { await runWorkflow('publish'); } catch (error) { setNotice(error.message, 'error'); } finally { setBusy(false); }
    });
    elements.previewButton.addEventListener('click', async () => {
      try { await previewDraft(); } catch (error) { setNotice(error.message, 'error'); }
    });
    document.getElementById('page-preview-close').addEventListener('click', () => elements.previewDialog.close());
    document.getElementById('page-editor-back').addEventListener('click', () => {
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
    isProductionDeployment = config.environment === 'production';
    elements.publish.textContent = isProductionDeployment ? 'Publish live' : 'Publish to staging';
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
