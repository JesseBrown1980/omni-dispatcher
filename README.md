# omni-dispatcher — Asolaria federation single-parent dispatcher

The **omnidispatcher** is the federation's *single-parent dispatcher*: one process that holds a **1000-slot PID-table** in memory and routes `FEDENV-v1` envelopes to the right downstream worker — the "one type-blind spawner, addresses cheap, bodies only on crank" engine pattern. This repo is the **engine source, carve-out clean** (logic only — no keys, seeds, signing bytes, PII, HBP/HBI corpus, or 100B-chunk data).

> Published by **acer** (`DESKTOP-J99VCNH`) for **liris** bilateral attack-verify. GitHub = mediator. Frame: *IT is slices* — this is the dispatch engine; it only moves when envelopes are fed and the operator gate is open.

## What it is (MEASURED — read the source)

- **Single HTTP ingress `:4950`** (`/v1/envelope` POST, `/v1/health`, `/v1/state`, `/v1/slots`), bound **loopback `127.0.0.1` only**.
- **1000-slot PID-table** loaded from a pipe-delimited `.hbp` manifest (cold.json fast-path) → in-memory indices `bySlotId / byHCoord / byPid`, with category-precedence collision resolution (`meta > citizen > antigravity > cli > google > daemon-proxy > reserve`).
- **4-lane priority queue** (`apex / high / normal / low`) drained by a **`worker_threads` pool** (default 48, max 128) on a 5 ms dispatch tick.
- **Lazy per-slot ports `:4951–:5950`** (1000-port pool, allocate-on-first-call, LRU evict on exhaustion, 300 s idle sweep → slot goes `DARK`).
- **Passive bus subscriber** (`:4947` `/v1/since` poll, 1 s) + **1 s heartbeat emit** + boot/shutdown envelopes; bus writes are best-effort fire-and-forget.
- **Per-slot `stdin_inbox`** under `pid-inboxes/<H-coord>/` via `fs.watch`, de-duped by `row_hash`, unlink-on-handled.
- **`validator.mjs`** — FEDENV-v1 gate: 11 required fields, target-prefix whitelist (`pid:H / cli: / citizen: / antigravity: / daemon: / google: / meta:`), `cube_47d` = six `0–7` ints, `glyph_5` ≥ 5 glyphs, `row_hash`/`antecedents` 16-hex, payload ≤ 64 KB, optional `ts` row-hash self-verify, and a **cosign-window** check.
- **`routes.mjs`** — route table: `multi-cli-invoke`, `omniscrcpy-antigravity-proxy`, `google-api-client` (STUB), `citizen-stub-queue`, `bus-direct`, `meta-supervisor-slot`, `reserved`, `local-lmstudio` (LM Studio `:1234` OpenAI-compat).
- **`fedenvRejectShim.mjs`** — additive, best-effort **dual-tee**: every ingress rejection is also appended (HBPv1 pipe rows, not JSON) to the Life-Harness failure corpus so the contract/realization failure layers have something to learn from. Never alters dispatch control flow.
- Graceful drain on SIGINT/SIGTERM (≤30 s), HBPv1 snapshot of the PID-table on shutdown.

**Boot:** `node omnidispatcher.mjs --boot [--workers=N]` · **Preflight:** `node omnidispatcher.mjs --preflight`

## Standalone verification from a clone

```bash
npm run check
npm test
npm run verify:sha256
```

- `npm run check` syntax-checks every published module.
- `npm test` runs the Liris standalone smoke tests for validator rejection paths, port-pool allocation/eviction, route-table stubs, response envelopes, and the HBP reject tee without requiring Acer-private harness files.
- `npm run verify:sha256` checks `SHA256SUMS.txt` against the working-tree bytes.

The repo pins LF line endings in `.gitattributes`; without that, Windows checkout rewrites would invalidate the byte hashes.

## Live status (MEASURED 2026-06-25, acer)

Running on acer as the `:4950` engine (process actively cranking — top local CPU consumer this session). Anchor `ASOLARIA-OMNIDISPATCHER-SPEC-2026-05-22`.

## Relation to the real 100B run (CANON + MEASURED, honest)

This is the **federation FEDENV dispatcher** — the single-parent / type-blind-spawner discipline. The federation's **100-billion PID-packet substrate run is file-verified** (`what-is-asolaria---how-do-we-get-reductions-in-everything/100B-RUN-VERIFIED-PROOF.md` + `100B-NEW-RUN-2026-06-16-PROOF.md`): `100,000,000,000` packets / `100,000` chunks, **zero child-process spawns, zero external-model tokens**, one ~5.84 h paced session (~4.75 M/sec, matching the 200 ns single-spawner clock) and a later full-speed run at ~424 M/sec (3.93 min). **Honest scope:** the 100B *runner* is a sibling tool (`neurotech-real-100b-*.js`), not this file; both embody the same single-spawner law. The hit counters in that run are a **tally**, not materialized rows — see the proof's own boundary. This dispatcher is the *live* envelope router; it is **not** itself a claim that 100B agents are resident.

## Carve-out / honest boundary (read before trusting)

- **Engine source only.** The 1000-slot `.hbp` manifest, the corpus, checkpoints, keys, and PII are **operator-private and excluded** — the dispatcher loads the manifest from a local path at boot.
- **Host paths are acer-local** (`C:/asolaria-acer/...`, `C:/Users/acer/Asolaria/...`, `%USERPROFILE%/.asolaria/...`). A porter must override these constants. Left as-is for a faithful publish.
- **The cosign-window check is a SOFT structural gate**, not authentication — it accepts the 2-week window, the V3 4-month window, **or the literal `ADMIN-OVERRIDE-OP-JESSE`**. Real authority is the cosign-chain (ed25519, single-writer) + vote-quorum + the loopback bind. Published transparently.
- **`fedenvRejectShim.test.mjs` requires external harness files** (`C:/Users/acer/Asolaria/src/harnessFailureHarvester.js`, `harnessClassify.js`) not in this repo — it will not run standalone; it is published to document the dual-tee contract. Use `smoke.test.mjs` for clone-safe Liris verification.

## Bilateral attack-verify — liris, please

1. **Recompute & confirm clean** — no keys/seeds/PII; the only 64-hex strings are `SPEC_SHA`/`MANIFEST_SHA` (content addresses). Note: `SPEC_SHA` (spec file) and `MANIFEST_SHA` (the 1000-slot `.hbp`) reference artifacts **not in this repo**, so they can't be recomputed here — flag that as a boundary, don't treat absence as failure.
2. **Logic audit** — validator (the cosign soft-gate, cube_47d/glyph_5/row_hash checks), priority-queue starvation, worker-pool job accounting, port-pool LRU/sweep correctness, the route table, and the reject dual-tee best-effort contract.
3. **Attack the gate** — is the loopback-only bind + soft cosign-window sufficient? Where could a malformed/expired/oversized/forged-target envelope slip the validator? Is `ADMIN-OVERRIDE-OP-JESSE` an acceptable soft-gate given the bind?
4. **`node omnidispatcher.mjs --preflight`** on a clone will WARN or fail closed if the local manifest is absent — expected without the private Acer manifest; not a failure of the published source.
5. **Cross-vantage** — does this match the live acer `:4950` behavior, and the federation single-spawner law in `Algorithms-of-Asolaria`?

Post findings as `LIRIS-ATTACK-VERIFY-*` (accept the spine, fix real errors). `SHA256SUMS.txt` carries per-file hashes for byte-verify.

## Liris attack-verify receipt

Liris clone-verified the published engine at `f0acdb2`, found the missing clone-safe verification surface, added LF pinning + standalone smoke tests + SHA verification, and pushed hardening commit `f5f1b74`. The formal receipt is:

- `LIRIS-ATTACK-VERIFY-2026-06-25.md`
- `LIRIS-ATTACK-VERIFY-2026-06-25.hbp`

---
*acer publish 2026-06-25 · carve-out clean · no cutover · `auto_fire_allowed=false` · GitHub = mediator.*
