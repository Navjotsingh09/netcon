import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../admin/dialogs.js', import.meta.url), 'utf8');

function harness() {
  const nodes = [];
  function node(tag) {
    const element = {
      tag, children: [], attributes: {}, listeners: {}, value: '', isConnected: true,
      setAttribute(key, value) { this.attributes[key] = value; },
      append(...children) { this.children.push(...children); },
      addEventListener(event, callback) { this.listeners[event] = callback; },
      showModal() { this.open = true; },
      close() { this.open = false; },
      remove() { this.isConnected = false; },
      focus() { this.focused = true; },
      reportValidity() { return this.valid !== false; }
    };
    nodes.push(element);
    return element;
  }
  const previous = node('previous');
  const context = { window: {}, document: { activeElement: previous, createElement: node, body: node('body') } };
  vm.runInNewContext(source, context);
  return { dialogs: context.window.CmsDialogs, nodes, previous };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('destructive confirmations use clear labels, safe initial focus and accessible relationships', async () => {
  const app = harness();
  const result = app.dialogs.confirm({ title: 'Discard changes?', message: '<script>not markup</script>', danger: true, confirmLabel: 'Discard changes', cancelLabel: 'Keep editing' });
  await tick();
  const dialog = app.nodes.find((node) => node.tag === 'dialog');
  assert.equal(dialog.attributes['aria-labelledby'], 'cms-popup-title');
  assert.equal(dialog.attributes['aria-describedby'], 'cms-popup-message');
  assert.equal(app.nodes.find((node) => node.id === 'cms-popup-message').textContent, '<script>not markup</script>');
  const cancel = app.nodes.find((node) => node.textContent === 'Keep editing');
  assert.equal(cancel.focused, true);
  cancel.listeners.click();
  assert.equal(await result, false);
  assert.equal(app.previous.focused, true);
  assert.equal(dialog.isConnected, false);
});

test('Escape cancels without accepting the action', async () => {
  const app = harness();
  const result = app.dialogs.confirm({ title: 'Publish?', message: 'Publish the saved version.' });
  await tick();
  let prevented = false;
  app.nodes.find((node) => node.tag === 'dialog').listeners.cancel({ preventDefault() { prevented = true; } });
  assert.equal(await result, false);
  assert.equal(prevented, true);
});

test('prompt validates before returning named values and permits explicitly decorative empty alt', async () => {
  const app = harness();
  const result = app.dialogs.prompt({ title: 'Add image', message: 'Describe the image.', fields: [{ name: 'alt', label: 'Image description' }] });
  await tick();
  const form = app.nodes.find((node) => node.tag === 'form');
  form.valid = false;
  form.listeners.submit({ preventDefault() {} });
  assert.equal(app.nodes.find((node) => node.tag === 'dialog').open, true);
  form.valid = true;
  form.listeners.submit({ preventDefault() {} });
  assert.equal((await result).alt, '');
});

test('queued dialogs do not overlap and errors have an explicit close action', async () => {
  const app = harness();
  const first = app.dialogs.confirm({ title: 'First', message: 'First action' });
  const second = app.dialogs.error('Could not save your article.', 'Article not saved');
  await tick();
  assert.equal(app.nodes.filter((node) => node.tag === 'dialog').length, 1);
  app.nodes.find((node) => node.tag === 'form').listeners.submit({ preventDefault() {} });
  assert.equal(await first, true);
  await tick();
  assert.equal(app.nodes.filter((node) => node.tag === 'dialog' && node.open).length, 1);
  assert.ok(app.nodes.some((node) => node.textContent === 'Close'));
  app.nodes.filter((node) => node.tag === 'form')[1].listeners.submit({ preventDefault() {} });
  await second;
});

test('both CMS editors load shared dialogs and contain no native confirm/prompt/alert calls', async () => {
  for (const [htmlPath, jsPath] of [['admin/pages.html', 'admin/pages.js'], ['admin/index.html', 'admin/app.js']]) {
    const html = await readFile(new URL(`../${htmlPath}`, import.meta.url), 'utf8');
    const js = await readFile(new URL(`../${jsPath}`, import.meta.url), 'utf8');
    assert.ok(html.includes('/admin/dialogs.css'));
    assert.ok(html.indexOf('/admin/dialogs.js') < html.indexOf(`/${jsPath}`));
    assert.doesNotMatch(js, /(?<![\w.])(?:window\.)?(?:confirm|prompt|alert)\(/);
  }
});
