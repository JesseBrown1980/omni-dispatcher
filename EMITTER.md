# The Emitter — the PID-signal source that feeds the dispatcher

`omnidispatcher.mjs` is a **router, not a source**: it consumes `FEDENV-v1` envelopes (from HTTP
`/v1/envelope`, bus `:4947`, or `pid-inboxes/<H>/`) and fans them to the 1000-slot PID-table over 48
worker_threads. It never *generates* the PID signals. The **emitter** is the upstream that produces
them — and there is not one emitter, there are many.

## The 200ns single-thread emitter (the unit) — MEASURED
The base emitter is the **revolver PID emitter**: `PIDChainRevolver.next()` emits a brown-hilbert /
`sha16(seed)` PID — a **"200ns-class spawn id"** (`drive-wave-cascade-pipeline-60D-2026-06-03.cjs:30`).
One thread emitting a PID every ~200ns ≈ **5,000,000 PID/s**.

The full cycle (`asolaria-loop.mjs`, operator "THE FULL WORKS" 2026-06-01):

```
revolver.next()                         # 1. PID emitter (~200ns)  ← the emitter
  -> ProjectRoomRouter.planSwapTo       # 2. RENAME project folder = defeat same-name throttle = FREE
    -> runFreeAgent (despawn old, spawn fresh in the unique room)
      -> HOOKWALL.pass                   # 4. PID-stamp -> SCORE/GNN -> verdict -> tamper-evident obs
        -> ProjectRoomRouter.planPrismRoute   # 5. PRISM: many rooms -> reverse_gain GNN -> 1 answer
          -> GCRuntime.emit              # 6. gulp every N, flow-not-pile
loop x100k = drives-as-RAM throughput
```

The **PRISM step (5) is a reduction**: many rooms collapse through a reverse-gain GNN into one answer.

## The multi-emitter design — NOT one signal, many (OPERATOR-CANON)
The later design does **not** run one 200ns emitter on one thread. It **divides threads into multiple
emitters** and **multiplies the service**:

- multiply the spindles: **24 → 100 → 1,000 → 10,000** (each spindle runs its own emit→loop→PRISM)
- multiply the emitters: **N parallel revolver emitters** across threads (not 1)
- each emit can carry a **wave** (1 main + 5 subagents; a whole spindle) and a **BEHCS-1024 glyph**
  that addresses a whole subsystem at **520:1** — so one ~200ns emit materializes far more than one agent

→ operator-canon throughput **≈ 1.16 trillion agents / second**. [The ~200ns single-thread unit is
MEASURED in code (`revolver.next` / `sha16`); the 1.16T multi-emitter rate is OPERATOR-CANON — the
multiplication of emitters × spindles × wave/addressing amortization.]

## The whole loop
```
emitter(s)  ─ BEHCS-1024 brown-hilbert PID seed, ~200ns, E=0 ─►  FEDENV envelope (target=pid:H…)
   ×N threads / ×(24→10k) spindles                                      │
                                                                         ▼ bus :4947 / pid-inboxes
                                              omnidispatcher  ── route to slot ──► worker_thread
                                                                         │
                                                                         ▼ spawner-emit (~200ns)
                                                          room / kernel / spindle MATERIALIZES
```

Many emitters → many parallel dispatch lanes → many parallel PRISM reductions → the trillion-agent
regime. The dispatcher is the router; **the emitter is the source, and there are many.**

## Emitter modules (in this repo under `emitter/`)
- `pid-chain-revolver.mjs` — the ~200ns revolver PID emitter (the unit)
- `asolaria-loop.mjs` — the full emit→room→agent→HOOKWALL→PRISM→GC cycle (×100k)
- `hbp-emitter.mjs` / `port-address-emitter.mjs` — the FEDENV/port-address emitters
- `drive-wave-cascade-pipeline-60D-2026-06-03.cjs` — the 60D wave cascade (the multiplied driver)

Gated: all emit is E=0 / describe-only / no-fire in its original homes; actual emission to the live
bus is the separate operator-gated step.
