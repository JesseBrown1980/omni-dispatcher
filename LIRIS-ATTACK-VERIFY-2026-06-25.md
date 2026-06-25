# LIRIS Attack-Verify - omni-dispatcher

**Date:** 2026-06-25  
**Vantage:** liris (`C:/tmp/omni-dispatcher-fresh-verify`)  
**Target repo:** `JesseBrown1980/omni-dispatcher`  
**Acer publish commit verified:** `f0acdb2`  
**Liris hardening commit:** `f5f1b74`  

## Verdict

`MEASURED_LIRIS`: the repo now contains real omnidispatcher source code, not statements only:

- `omnidispatcher.mjs`
- `worker.mjs`
- `routes.mjs`
- `validator.mjs`
- `port-pool.mjs`
- `fedenvRejectShim.mjs`
- `fedenvRejectShim.test.mjs`
- `package.json`

`MEASURED_LIRIS`: Liris added clone-safe verification without changing dispatcher logic:

- `.gitattributes` pins LF bytes so SHA verification survives Windows clones.
- `smoke.test.mjs` provides standalone tests that do not need Acer-private harness files.
- `tools/verify-sha256.mjs` verifies `SHA256SUMS.txt` from a clone.
- `README.md` now documents the exact clone-safe check path.

## Checks

Run from a fresh clone of `main` at `f5f1b74`:

```text
npm run check          PASS
npm test               PASS - 5/5 smoke tests
npm run verify:sha256  PASS
```

Smoke coverage:

- FEDENV validator accepts a well-shaped envelope.
- Validator rejects bad target, oversized payload, stale cosign window, malformed cube, and bad `ts` row hash.
- Port pool allocates, reuses, sweeps, and evicts deterministically.
- Route table exposes explicit stub/reserved behavior.
- Response envelopes and HBP reject tee remain shape-safe and side-effect bounded.

## Honest Boundaries

- `fedenvRejectShim.test.mjs` is Acer-harness-dependent and is not standalone. This is documented; clone-safe testing uses `smoke.test.mjs`.
- The private 1000-slot HBP manifest is excluded by design. `omnidispatcher.mjs --preflight` can fail closed on a clone because the private manifest is absent.
- `ADMIN-OVERRIDE-OP-JESSE` is a soft structural gate in the published code, not a cryptographic secret. Runtime authority still belongs to loopback binding plus cosign/vote/quorum gates.
- Package `engines` still targets Node `>=20.11.0 <21`, matching the live-generation expectation. Liris verified syntax/tests under Node `24.13.1`; official runtime parity with Acer's Node generation remains Acer-owned.
- This receipt verifies repository bytes and clone-safe behavior. It does not claim live cutover, live Acer `:4950` parity, or Host-8 retirement.

## Conclusion

`ACCEPT_WITH_BOUNDARIES`: GitHub now carries the real omnidispatcher source plus clone-safe verification. Liris can download, hash-check, test, and attack the dispatcher logic without needing private Acer data.

