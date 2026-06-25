import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { validate, priorityOf, COSIGN_WINDOW_V3 } from './validator.mjs';
import { PortPool } from './port-pool.mjs';
import { resolveRoute, routeGoogle, routeReserved, buildResponseEnvelope } from './routes.mjs';
import { rejectPath, teeReject } from './fedenvRejectShim.mjs';

function rowHash(env) {
  return createHash('sha256')
    .update(`FEDENV|${env.caller_pid}${env.verb}${env.payload}${env.ts}`)
    .digest('hex')
    .slice(0, 16);
}

function baseEnvelope(extra = {}) {
  const env = {
    caller_pid: 'AGT-LIRIS-SMOKE-H0001',
    target: 'cli:auditor:opencode/big-pickle',
    verb: 'inspect',
    payload: 'hello',
    back_address: 'outbox/AGT-LIRIS-SMOKE-H0001',
    cube_47d: '1-2-3-4-5-6',
    glyph_5: 'abcde',
    cosign_token: COSIGN_WINDOW_V3,
    ttl_seconds: 300,
    antecedents: '0000000000000000',
    ts: '2026-06-25T00:00:00.000Z',
    row_hash: 'pending',
    ...extra,
  };
  env.row_hash = extra.row_hash ?? rowHash(env);
  return env;
}

test('validator accepts a well-shaped FEDENV-v1 envelope and lane priority', () => {
  const env = baseEnvelope({ priority: 'high' });
  assert.deepEqual(validate(env), { ok: true });
  assert.equal(priorityOf(env), 'high');
  assert.equal(priorityOf({}), 'normal');
});

test('validator rejects malformed, oversized, stale, and forged envelopes', () => {
  assert.equal(validate({ ...baseEnvelope(), target: 'bad:target' }).reason, 'EVT-FEDENV-REJECTED-UNRESOLVABLE-TARGET');
  assert.equal(validate({ ...baseEnvelope(), payload: 'x'.repeat((64 * 1024) + 1) }).reason, 'EVT-FEDENV-REJECTED-PAYLOAD-TOO-LARGE');
  assert.equal(validate({ ...baseEnvelope(), cosign_token: 'STALE-WINDOW-2024' }).reason, 'EVT-FEDENV-REJECTED-EXPIRED-COSIGN');
  assert.equal(validate({ ...baseEnvelope(), cube_47d: '1-2-3' }).reason, 'EVT-FEDENV-REJECTED-MALFORMED');
  assert.equal(validate({ ...baseEnvelope(), row_hash: 'ffffffffffffffff' }).reason, 'EVT-FEDENV-REJECTED-ROW-HASH-MISMATCH');
});

test('port pool allocates, reuses, sweeps, and evicts deterministically', () => {
  const pool = new PortPool({ start: 6000, end: 6001, idleMs: 10 });
  assert.equal(pool.allocate('a'), 6000);
  assert.equal(pool.allocate('a'), 6000);
  assert.equal(pool.allocate('b'), 6001);
  assert.equal(pool.allocate('c'), null);
  assert.deepEqual(pool.evictLRU(1), ['a']);
  assert.equal(pool.allocate('c'), 6000);
  assert.equal(pool.release('b'), true);
  assert.equal(pool.allocate('d'), 6001);
  assert.deepEqual(pool.sweep(Date.now() + 20).sort(), ['c', 'd']);
});

test('route table has explicit stub and reserved behavior', async () => {
  assert.equal(resolveRoute({ downstream_route: 'google-api-client' }), routeGoogle);
  assert.equal(resolveRoute({ downstream_route: 'reserved' }), routeReserved);
  assert.equal(resolveRoute({ downstream_route: 'missing' }), null);
  const google = await routeGoogle(baseEnvelope({ target: 'google:drive' }), { name: 'drive' });
  assert.equal(google.ok, false);
  assert.equal(google.stub, true);
  const reserved = await routeReserved(baseEnvelope(), { slot_id: 42 });
  assert.equal(reserved.reason, 'EVT-FEDENV-REJECTED-RESERVED-SLOT');
});

test('response envelope and reject tee stay HBP-shaped and side-effect bounded', async () => {
  const env = baseEnvelope();
  const resp = buildResponseEnvelope(env, { ok: true, exit: 0, stdout: 'ok', stderr: '' }, {
    pid: 'AGT-DISPATCHER-H0002',
    cube_47d: '0-0-0-0-0-0',
    glyph_5: 'vwxyz',
  });
  assert.equal(resp.verb, 'respond');
  assert.equal(resp.antecedents, env.row_hash);
  assert.match(resp.row_hash, /^[0-9a-f]{16}$/);

  const dir = await mkdtemp(path.join(tmpdir(), 'omni-dispatcher-smoke-'));
  process.env.BH_FEDENV_REJECT_PATH = path.join(dir, 'rejects.hbp');
  assert.equal(rejectPath(), process.env.BH_FEDENV_REJECT_PATH);
  teeReject('ingress', 'EVT-FEDENV-REJECTED-SMOKE', 'a|b\nc', env);
  const row = await readFile(process.env.BH_FEDENV_REJECT_PATH, 'utf8');
  assert.match(row, /^EVT-FEDENV-REJECTED\|/);
  assert.match(row, /detail=a%7Cb c/);
  assert.match(row, /sha16=[0-9a-f]{16}/);
  await rm(dir, { recursive: true, force: true });
  delete process.env.BH_FEDENV_REJECT_PATH;
});

