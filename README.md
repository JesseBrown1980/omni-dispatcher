# omni-dispatcher — Asolaria federation single-parent dispatcher

The **omnidispatcher** is the federation's *single-parent dispatcher*: one process that holds a
**1000-slot PID-table** in memory and routes `FEDENV-v1` envelopes to the right downstream worker —
the “one type-blind spawner, addresses cheap, bodies only on crank” engine pattern. This repo is the
**engine source, carve-out clean**.

> Published by **acer** for **liris** bilateral attack-verify. GitHub = mediator. The engine only
> moves when envelopes are fed and the operator gate is open.

## 2026-07-11 verified recovery/storage connection

The dispatch layer now links explicitly to the measured exact-recovery plane:

- **Path 1:** route a small authenticated address to a node that already retains the object;
- **Path 2:** route jointly sufficient CRT shadow lanes to a node that reconstructs with no retained
  original;
- **DBBH→DBWH:** re-project the candidate and require SHA/shadow/shell equality before emission;
- **storage tier:** HDD/SSD holds bodies, cubes, shadows, receipts, queues, and cold state;
- **neural sidecar:** trained GNN/LLM inference remains an optional CPU/GPU route.

Full component-specific analysis and verification:

[`PATH2-STORAGE-BACKED-DISPATCH-2026-07-11.md`](PATH2-STORAGE-BACKED-DISPATCH-2026-07-11.md)

## What it is — measured from source

- Single loopback HTTP ingress `:4950`.
- 1,000-slot PID table loaded from HBP/cold manifest into `bySlotId / byHCoord / byPid` indices.
- Four priority queues drained by a worker-thread pool.
- Lazy ports `:4951–:5950`, allocate-on-first-call, LRU eviction, and 300-second idle DARK sweep.
- Passive bus subscriber and heartbeat emissions.
- Per-slot filesystem inboxes, row-hash deduplication, unlink-on-handled.
- FEDENV-v1 validator with required fields, target whitelist, cube/glyph/hash checks, payload ceiling,
  optional row-hash verification, and cosign-window check.
- Route table for local/CLI/device/citizen/bus/model surfaces.
- Best-effort HBP rejection tee that never changes dispatch control flow.
- Graceful drain and HBP PID-table snapshot on shutdown.

**Boot:** `node omnidispatcher.mjs --boot [--workers=N]`  
**Preflight:** `node omnidispatcher.mjs --preflight`

## Why the dispatcher enables low-GPU computers

A storage-rich or CPU-only machine can be a real fabric participant:

```text
persistent state -> HDD/SSD
active routes     -> compact PID table + bounded queues in RAM
exact recovery    -> SHA/BEHCS/CRT/receipts on CPU
neural inference  -> optional remote/local accelerator sidecar
```

The dispatcher does not require every possible agent body or model to be resident. It materializes
only the addressed worker/slot and returns idle slots to DARK.

This does **not** mean a hard drive executes neural matrix multiplication. It means durable state,
routing, proof, and recovery are no longer forced to live in GPU VRAM.

## Pre-Asolaria GNN route lineage

The neural sidecar route originates in Jesse's AI healthcare assistant. Four model files were copied
byte-for-byte into the Asolaria GNN sidecar:

```text
EdgeLevelGNN    510f78890ec94b113f0610afbade8bafe6ca20e0
PrototypeGNN    99e3087a10ee58e90c0935f5ab63b72fd3cdd07e
ContrastiveGNN  56329e61eb3e6ddb3ee97b46f997dd8dd8c6b39f
GSLGNN          886b3b0c0cdbddba983fa8c3ae083c4520d38f0e
```

BigPickle later orchestrates L0 `:4792`, L4 `:4793`, G1/G2/G3/G4, OmniShannon, SHA fallback,
Fischer, and Hookwall. The healthcare comparison is repository-reported training evidence; later
trained checkpoints/manifests live in the trained-GNN repository.

## Standalone verification from a clone

```bash
npm run check
npm test
npm run verify:sha256
```

- syntax checks every published module;
- smoke tests cover validator rejection, port allocation/eviction, route stubs, response envelopes,
  and the HBP reject tee;
- SHA verification checks working-tree bytes;
- LF pinning prevents cross-platform line-ending hash drift.

## Independent recovery verification — 2026-07-11

- `MEASURED_CLAUDE_FABLE5_THIRD_SEAT`, operator supplied:
  Path 1 rustc 1.97 **19/19**, Path 2 rustc 1.97 **30/30**.
- `AUDITED_GPT_5_6_PRO`: complete healthcare-GNN, BigPickle/Fischer, trained-GNN, Hookwall/Shannon,
  Q-PRISM, white-room, cube-mint, Dispatcher, HyperHermes, reductions, algorithms, and N-Nest audit.
- `MEASURED_GPT_DIRECTED_GITHUB_ACTIONS`: Rust 1.97.0 runs `29134408321`, `29134413119`, and
  `29134419389` all completed successfully.

These Rust receipts validate the exact recovery substrate; they do not replace this repository's own
Node tests or claim a new live dispatch benchmark.

## Live status — measured 2026-06-25, acer

Running on acer as the `:4950` engine. Anchor `ASOLARIA-OMNIDISPATCHER-SPEC-2026-05-22`.

## Relation to the real 100B run

The dispatcher embodies the single-parent/type-blind-spawner discipline. The 100B runner is a sibling
tool, not this file. The 100B counters are tallies, not 100B resident agents. Both share the same
law: possibility is cheap; bodies are materialized only when cranked.

## Carve-out / boundary

- Engine source only; private manifests, corpora, checkpoints, keys, and PII are excluded.
- Acer-local paths require porter overrides.
- The published cosign-window check is structural, not the real cryptographic authority surface.
- Some tests depend on external private harness files; use clone-safe smoke tests where documented.
- Live Hilbra traversal between physical Path-2 poles remains unverified.

## Bilateral attack-verify

Liris clone-verified the published engine, added LF pinning, standalone smoke tests, and SHA
verification. Formal receipts:

- `LIRIS-ATTACK-VERIFY-2026-06-25.md`
- `LIRIS-ATTACK-VERIFY-2026-06-25.hbp`

---

*carve-out clean · no cutover · `auto_fire_allowed=false` · GitHub = mediator.*
