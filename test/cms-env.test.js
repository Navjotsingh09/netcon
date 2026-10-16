import assert from 'node:assert/strict';
import test from 'node:test';
import { requiredEnv } from '../lib/cms/env.js';

test('required environment values are trimmed and missing values fail explicitly', () => {
  const name = 'NETCON_TEST_REQUIRED_ENV';
  const original = process.env[name];
  try {
    process.env[name] = '  configured-value\n';
    assert.equal(requiredEnv(name), 'configured-value');
    process.env[name] = '   ';
    assert.throws(() => requiredEnv(name), new RegExp(`Missing required environment variable: ${name}`));
  } finally {
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});
