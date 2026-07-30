# geometric-computer

### ▶ Live app: **https://sjgant80-hub.github.io/geometric-computer/**
Fold a state into a number and back (lossless), and watch the stability engine decide which
windings are stable torus-harmonics — golden holds, resonance cancels. No install, works offline.

**The geometric-computing stack from the v23 seed, built and gated.** Two layers:

| layer | what it is | file | gate |
|---|---|---|---|
| **L1 · data** | the **primorial fold codec** — a fold-signature ⇄ one integer, lossless | `kernel/fold.mjs` | 13/14 +1 · **CLEAN** |
| **L2 · dynamics** | **Entropic Torus Harmonics** — which fold-signatures are *stable* | `kernel/eth.mjs` | 27/36 +9 · **CLEAN** |

(L3 · substrate = the wisp, elsewhere. The fold-signature is the through-line.)

## L1 — the primorial fold codec (geometry as DATA)

A "bloom" is a state over the seven prime rings ψ=[2,3,5,7,11,13,17]. It folds **losslessly**
into one integer:
- **subset codec** (which rings are lit) → a squarefree divisor of **Ω = 510510 = 17#** (FTA). Empty
  bloom = 1 (unity), full = 510510. There are exactly **2⁷ = 128** blooms, so **127 = 2⁷−1 = M₇**
  (the Mersenne shield) is the count of non-empty blooms.
- **CRT codec** (a full residue-per-ring state) ⇄ one integer in [0, 510510), reversible by the
  Chinese Remainder Theorem — verified over 200k+ round-trips.
- a **Mersenne-127 shield** as a cheap corruption guard.

## L2 — Entropic Torus Harmonics (geometry as DYNAMICS)

Which fold-signatures are **stable torus-harmonics** — modes that close on themselves without
destructive interference. The equations are the seed's, each verified in code:

- **stability map** `x → d − x²`, whose fixed point at d=1 is **κ = 1/φ = 0.618** (κ²+κ=1, §8).
  Because κ *repels* (f′(κ)=−1.24), "stable" is the **attractor band** (bounded-non-settling), read
  by the estate's already-gated `attractor` organ — which maps exactly onto §8: below κ = starved →
  flatline, at κ = balanced → attractor, above κ = overloaded → escaped.
- **closure = commensurability** (§3, KAM): a winding is stable iff **quasi-periodic** (golden /
  noble — maximally irrational); a **low-order-rational** winding is **resonant → cancels**.
- **coexistence:** golden-angle 2π(1−κ)=137.5° packing → non-destructive (§7, §B).
- **the seam:** M11 = 2047 = 23×89 — the one place the recursive spine fails to close (§14, §24).

**The empirical why (baked into `npm test`, or it's decoration):** golden/noble windings classify
**STABLE 86%**, low-order rationals **0%**, random reals **1%**. Golden holds; resonance cancels.
If that discrimination ever dies, the engine is decoration — the test asserts it every run.

## Run it

```bash
npm test     # 18 invariant tests, incl. the lossless round-trip and the stability discrimination
npm run gate # proof-of-play: mutation + fuzz on BOTH kernels — must be CLEAN
```

**Gate status** — `fold.mjs` 13/14 +1, `eth.mjs` 27/36 +9 → both **CLEAN**; fuzz never throws.
The 10 baselined mutants are genuine equivalents (unreachable exact-float boundaries, no-op
updates, a continued-fraction depth cap, an escape-fill offset), each documented with a reason in
`kernel/witness.baseline.json`. The real survivors were killed with targeted boundary tests.

## Honest line

The stability engine is real, buildable, gateable **computational geometry** — "which harmonics on
a torus are stable" is genuine maths (winding numbers, KAM quasi-periodicity, the κ fixed point).
That ETH is *also* a theory of literal particles (electron masses etc.) is held as language, not
asserted here. This ships the computation, not the cosmology. MIT.
