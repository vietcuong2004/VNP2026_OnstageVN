import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as demoAuth from '../lib/demo-auth.ts';
import { authenticateDemo, DEMO_EMAIL, DEMO_PASSWORD, DEMO_TOKEN, isDemoEnabled, isDemoToken } from '../lib/demo-auth.ts';

test('public demo login is available only in mock mode and never grants admin privileges', () => {
  const original = process.env.NEXT_PUBLIC_PROFILE_SOURCE;
  try {
    process.env.NEXT_PUBLIC_PROFILE_SOURCE = 'api';
    assert.equal(isDemoEnabled(), false);
    assert.equal(authenticateDemo(DEMO_EMAIL, DEMO_PASSWORD), null);
    process.env.NEXT_PUBLIC_PROFILE_SOURCE = 'mock';
    const session = authenticateDemo(' ADMIN@ONSTAGE.COM ', DEMO_PASSWORD);
    assert.equal(session.token, DEMO_TOKEN);
    assert.equal(session.user.type, 'user');
    assert.deepEqual(session.user.capabilities, ['talent', 'brand']);
    assert.equal(authenticateDemo(DEMO_EMAIL, 'incorrect'), null);
    assert.equal(authenticateDemo('other@example.com', DEMO_PASSWORD), null);
    assert.equal(isDemoToken(session.token), true);
    assert.equal(isDemoToken(null), false);
    assert.equal(isDemoToken('real-token'), false);
  } finally {
    if (original === undefined) delete process.env.NEXT_PUBLIC_PROFILE_SOURCE;
    else process.env.NEXT_PUBLIC_PROFILE_SOURCE = original;
  }
});

test('demo API calls never reach the backend and logout clears the local session', async () => {
  const storage = new Map([
    ['onstagevn_auth_token', DEMO_TOKEN],
    ['onstagevn_auth_user', JSON.stringify({ email: DEMO_EMAIL })],
  ]);
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    removeItem: (key) => storage.delete(key),
  };
  const exports = {};
  let requests = 0;
  const source = readFileSync(new URL('../lib/api-client.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  runInNewContext(outputText, {
    exports,
    require: (name) => {
      assert.equal(name, './demo-auth');
      return demoAuth;
    },
    process: { env: {} },
    window: { localStorage, sessionStorage: localStorage, dispatchEvent() {} },
    Event,
    fetch: async () => { requests++; throw new Error('Unexpected backend request'); },
  });
  await assert.rejects(exports.apiJson('/auth/me'), /chỉ xem dữ liệu mẫu/);
  await assert.rejects(exports.apiJson('/my/profile', { method: 'PUT' }), /chỉ xem dữ liệu mẫu/);
  await assert.rejects(exports.apiForm('/my/profile', {}), /chỉ xem dữ liệu mẫu/);
  assert.equal(storage.get('onstagevn_auth_token'), DEMO_TOKEN);
  await exports.logoutCurrentSession();
  assert.equal(storage.has('onstagevn_auth_token'), false);
  assert.equal(storage.has('onstagevn_auth_user'), false);
  assert.equal(requests, 0);
});
