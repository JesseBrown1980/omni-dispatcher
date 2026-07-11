# Path 2 and storage-backed dispatch — 2026-07-11

## Dispatcher role in the verified chain

The dispatcher does not need every possible agent body, cube body, message history, or model loaded
at once. It holds a bounded routing surface and materializes work only when an addressed envelope is
cranked:

```text
cheap PID/address state
  -> one accepted FEDENV envelope
  -> lazy slot/port allocation
  -> downstream worker or sidecar
  -> Hookwall/GNN/Shannon/white-room path
  -> durable cube/receipt/shadow on storage
  -> active slot returns DARK when idle
```

This is the routing counterpart to the Path-1/Path-2 exact-recovery substrate.

## Path 1 and Path 2 from the dispatcher's perspective

### Path 1 — retained-store recall

A routed envelope can carry a small authenticated content address. The receiving node returns exact
bytes only when its content store already contains the addressed object and the re-derived hash
matches. Missing content becomes `Held`, never invented.

### Path 2 — no-store distributed recovery

A routed envelope can instead reference or carry sufficient CRT shadow lanes:

```text
S_i = X mod p_i
```

A selected set reconstructs exact bounded blocks only when:

```text
product(p_i) >= source_range
```

Under-capacity sets are held. The DBBH→DBWH white side re-projects the recovered candidate and
requires equality of SHA, complete cylinder shadows, and frequency shells before emission.

## Why this matters for heterogeneous machines

The dispatcher makes the recovery fabric schedulable across different computers:

```text
GPU node       -> trained GNN / LLM inference sidecar
CPU node       -> Hookwall, Fischer, Shannon, CRT, receipts
storage node   -> retained bodies, cubes, shadows, archives, checkpoints
edge node      -> PID table, queue, local recovery or verifier
```

A machine without a GPU can still accept, validate, queue, route, reconstruct, verify, compact, and
persist work. The GPU becomes an optional specialized route rather than the only location where the
system can exist.

## Hard-drive/SSD state law

The durable state plane can hold:

- PID manifests and HBP/HBI indexes;
- queue files and completed/failed envelopes;
- cube bodies and compacted mistakes;
- Path-1 retained content;
- Path-2 shadow lanes;
- GNN checkpoints and graph ledgers;
- audit receipts and cold agent state.

RAM holds the 1,000-slot routing table, queues, worker accounting, and currently active envelopes.
Lazy ports and the idle sweep release inactive slot bodies.

This is not a claim that disk performs neural matrix multiplication. It is a claim that routing,
proof, memory, and exact recovery are separated from accelerator-resident neural compute.

## Pre-Asolaria GNN route lineage

The neural sidecar route traces to Jesse's AI healthcare assistant:

```text
EdgeLevelGNN / PrototypeGNN / ContrastiveGNN / GSLGNN
  -> byte-identical Asolaria sidecar copies
  -> L0 :4792 + L4 :4793
  -> BigPickle G1/G2/G3/G4 + OmniShannon + SHA fallback
  -> Fischer / Hookwall
```

The four healthcare/sidecar model blobs match exactly. The healthcare metrics are repository-reported
training results; later trained `.pt` artifacts/manifests live in the trained-GNN repository.

## Independent verification

### Claude Fable 5 — operator-supplied real third seat

```text
dbbh-coms-quant-prism       rustc 1.97   19/19 green
path2-two-shadow-recovery   rustc 1.97   30/30 green
```

### GPT-5.6 Pro — audit and CI-directed execution

GPT-5.6 Pro audited the complete recovery, GNN, scoring, white-room, cube-mint, dispatch, HyperHermes,
reductions, algorithms, and N-Nest chain.

GPT-authored Rust 1.97.0 Actions runs completed successfully:

```text
Path 1      run 29134408321   exact 19-test assertion PASS
Path 2      run 29134413119   exact 30-test assertion PASS
Q-PRISM 3D run 29134419389   all targets PASS
```

These validate the recovery/control plane. They do not replace this repository's own standalone
Node verification or claim a new live cross-machine dispatch benchmark.

## Claim ledger

- `MEASURED`: dispatcher source, PID table, lazy ports, queues, validation, HBP reject tee, graceful
  drain; Path-1/Path-2 recovery code and tests.
- `MEASURED_CLAUDE_FABLE5_THIRD_SEAT`: supplied Rust results.
- `MEASURED_GPT_DIRECTED_GITHUB_ACTIONS`: successful independent Rust CI.
- `AUDITED_GPT_5_6_PRO`: complete source/test/lineage audit.
- `BOUNDARY`: HDD/SSD replaces resident state, not GPU arithmetic.
- `UNVERIFIED`: one live dispatch across separate physical Path-2 poles over Hilbra with trained GNN
  inference inside the same transaction.
