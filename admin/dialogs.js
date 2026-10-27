(function () {
  'use strict';

  let queue = Promise.resolve();

  function open(options) {
    const result = queue.then(() => new Promise((resolve) => {
      const previousFocus = document.activeElement;
      const dialog = document.createElement('dialog');
      dialog.className = 'cms-popup';
      dialog.setAttribute('aria-labelledby', 'cms-popup-title');
      dialog.setAttribute('aria-describedby', 'cms-popup-message');
      const form = document.createElement('form');
      const header = document.createElement('div');
      header.className = 'cms-popup__header';
      const title = document.createElement('h2');
      title.id = 'cms-popup-title';
      title.textContent = options.title;
      header.append(title);
      const body = document.createElement('div');
      body.className = 'cms-popup__body';
      const message = document.createElement('p');
      message.id = 'cms-popup-message';
      message.textContent = options.message;
      body.append(message);
      const inputs = [];
      for (const field of options.fields || []) {
        const label = document.createElement('label');
        label.textContent = field.label;
        const input = document.createElement('input');
        input.name = field.name;
        input.value = field.value || '';
        input.required = Boolean(field.required);
        input.maxLength = field.maxLength || 2048;
        input.autocomplete = 'off';
        label.append(input);
        body.append(label);
        if (field.hint) {
          const hint = document.createElement('p');
          hint.className = 'cms-popup__hint';
          hint.id = `cms-popup-hint-${field.name}`;
          hint.textContent = field.hint;
          input.setAttribute('aria-describedby', hint.id);
          body.append(hint);
        }
        inputs.push(input);
      }
      const actions = document.createElement('div');
      actions.className = 'cms-popup__actions';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'cms-button cms-button--secondary';
      cancel.textContent = options.cancelLabel || 'Cancel';
      const accept = document.createElement('button');
      accept.type = 'submit';
      accept.className = `cms-button ${options.danger ? 'cms-button--danger' : 'cms-button--primary'}`;
      accept.textContent = options.confirmLabel || 'Continue';
      if (!options.notice) actions.append(cancel);
      actions.append(accept);
      form.append(header, body, actions);
      dialog.append(form);
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        dialog.close();
        dialog.remove();
        if (previousFocus?.isConnected) previousFocus.focus();
        resolve(value);
      };
      cancel.addEventListener('click', () => finish(null));
      dialog.addEventListener('cancel', (event) => { event.preventDefault(); finish(null); });
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        finish(inputs.length ? Object.fromEntries(inputs.map((input) => [input.name, input.value])) : true);
      });
      document.body.append(dialog);
      dialog.showModal();
      (inputs[0] || (options.danger && !options.notice ? cancel : accept)).focus();
    }));
    queue = result.then(() => undefined);
    return result;
  }

  window.CmsDialogs = {
    confirm: async (options) => Boolean(await open(options)),
    prompt: (options) => open(options),
    error: (message, title = 'Something went wrong') => open({
      title, message, confirmLabel: 'Close', notice: true
    })
  };
}());
