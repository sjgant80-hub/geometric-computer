import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PHI, KAPPA, SPINE, SEAM, resonance, drive, torusTrajectory,
  stabilityOfWinding, windingOf, stability, coexist, onSeam,
} from '../kernel/eth.mjs';

// --- the seed's load-bearing equation: κ = 1/φ is the fixed point of f(x)=1−x² ------
test('κ is the fixed point of the stability map (κ²+κ=1)', () => {
  assert.ok(Math.abs(KAPPA - 0.6180339887) < 1e-9);
  assert.ok(Math.abs((1 - KAPPA * KAPPA) - KAPPA) < 1e-12); // f(κ)=κ
  assert.ok(Math.abs((KAPPA * KAPPA + KAPPA) - 1) < 1e-12);
});

// --- resonance (the closure / commensurability measure) ------------------------------
test('resonance: golden low, rational/integer high, hostile → max', () => {
  assert.equal(resonance(PHI), 1);            // φ = [1;1,1,…] the least resonant
  assert.equal(resonance(1 / PHI), 1);
  assert.ok(resonance(1.5) >= 10);            // 3/2 exact rational → maximally resonant
  assert.ok(resonance(2) >= 10);             // integer winding → maximally resonant
  assert.equal(resonance(NaN), 20);           // total: hostile → max, no throw
  assert.equal(resonance('nope'), 20);
});

// --- drive: golden → the κ self-reference point (d=1); resonant → escape drive -------
test('drive maps golden→1 (κ point) and resonant→>2 (escape)', () => {
  assert.ok(Math.abs(drive(PHI) - 1) < 1e-9);
  assert.ok(drive(1.5) > 2);
});

// --- the trajectory is total and bounded (never NaN/Infinity out) --------------------
test('torusTrajectory is finite and the right length', () => {
  const s = torusTrajectory(1);
  assert.equal(s.length, 200);
  assert.ok(s.every(Number.isFinite));
  assert.ok(torusTrajectory(5).every(Number.isFinite));  // escaping drive stays finite-valued
  assert.ok(torusTrajectory(NaN).every(Number.isFinite));
});

// --- THE STABILITY VERDICT ----------------------------------------------------------
test('a golden winding is a STABLE mode; a rational one is not; empty is starved', () => {
  const g = stabilityOfWinding(PHI);
  assert.equal(g.stable, true);
  assert.equal(g.class, 'stable');
  assert.ok(g.deficit < 1e-6);                // φ sits exactly at the κ self-reference point
  assert.equal(stabilityOfWinding(1.5).stable, false);
  assert.equal(stabilityOfWinding(1.5).class, 'overloaded');   // resonant → escaped
  assert.equal(stabilityOfWinding(0).class, 'starved');        // dead/empty mode
  assert.equal(stabilityOfWinding(NaN).stable, false);         // total
});

// --- THE ACCEPTANCE GATE (the empirical why — golden stable, resonance cancels) ------
// If this ever stops discriminating, the L2 engine is decoration, not physics.
test('ETH discriminates: golden windings hold, low-order rationals cancel', () => {
  const nobles = [PHI, PHI - 1, PHI + 1, 1 / PHI, 2 * PHI, PHI * PHI, PHI + 2];
  const rationals = [3 / 2, 5 / 3, 2, 7 / 4, 4 / 3, 5 / 2, 8 / 5, 9 / 7];
  const nobleStable = nobles.filter((w) => stabilityOfWinding(w).stable).length;
  const rationalStable = rationals.filter((w) => stabilityOfWinding(w).stable).length;
  // random-real baseline, deterministic LCG
  let rng = 42; const rand = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280; };
  let base = 0; const T = 3000;
  for (let i = 0; i < T; i++) if (stabilityOfWinding(1 + rand() * 3).stable) base++;
  assert.ok(nobleStable >= 5, `nobles stable ${nobleStable}/7`);       // golden holds
  assert.equal(rationalStable, 0, `rationals stable ${rationalStable}`); // resonance cancels
  assert.ok(base / T < 0.1, `random baseline ${base / T}`);            // and it beats random
  assert.ok(nobleStable / nobles.length > 5 * (base / T));             // by a wide margin
});

// --- windingOf: fold-signature → its characteristic winding --------------------------
test('windingOf takes the dominant-component ratio (Fibonacci → φ)', () => {
  assert.ok(Math.abs(windingOf([8, 5, 3, 2]) - 1.6) < 1e-9);   // 8/5 ≈ φ
  assert.equal(windingOf(PHI), PHI);                            // a number is the winding itself
  assert.equal(windingOf('nope'), 0);                          // hostile → 0 (→ starved)
  assert.equal(windingOf([1]), 0);                             // too few components → 0
  assert.equal(windingOf([]), 0);
});

test('stability on a whole fold-signature: golden-shaped holds, flat does not', () => {
  assert.equal(stability([PHI ** 3, PHI ** 2, PHI, 1]).stable, true);
  assert.equal(stability([2, 1, 1, 1]).stable, false);         // 2/1 rational → resonant
  assert.equal(stability(null).class, 'starved');              // total
});

// --- coexistence: golden-angle packing (irrational separation) -----------------------
test('coexist iff the winding separation is maximally irrational', () => {
  assert.equal(coexist(PHI, 2 * PHI), true);   // gap = φ (golden) → non-destructive
  assert.equal(coexist(1.5, 2.5), false);      // gap = 1 (integer, same torus phase) → collide
  assert.equal(coexist(1.5, 3.0), false);      // gap = 1.5 (rational) → beat/cancel
  assert.equal(coexist(0, PHI), false);        // a dead mode coexists with nothing
});

// --- boundary kills (pin the exact edges the mutation gate probes) -------------------
test('torus trajectory length guards, coexist edge, windingOf component edges', () => {
  assert.equal(torusTrajectory(1, 2).length, 200);        // steps not > 2 → default (> not >=)
  assert.equal(torusTrajectory(1, 2.5).length, 200);      // non-integer steps → default (&& not ||)
  assert.equal(torusTrajectory(1, 50).length, 50);        // a valid step count is honoured
  assert.equal(torusTrajectory(5).length, 200);           // an ESCAPED trajectory stays full length (< not <=)
  assert.equal(coexist(1 + Math.SQRT2, 1), true);         // gap resonance is exactly 2 → coexists (<= not <)
  assert.ok(Math.abs(windingOf([8, 5]) - 1.6) < 1e-9);            // exactly 2 components → used (< not <=)
  assert.ok(Math.abs(windingOf([5, Infinity, 3]) - 5 / 3) < 1e-9); // non-finite component filtered out (&& not ||)
  assert.equal(stabilityOfWinding('3').class, 'overloaded');        // numeric string coerces to a winding (num === path)
});

// --- the seam: M11 = 23×89 = 2047, the one recursive-spine closure failure -----------
test('onSeam flags the 23×89 break, nothing else', () => {
  assert.equal(SEAM, 2047);
  assert.equal(onSeam(23), true);
  assert.equal(onSeam(89), true);
  assert.equal(onSeam(7), false);              // a spine prime, not on the seam
  assert.equal(onSeam(1), false);              // trivial divisor excluded
  assert.equal(onSeam(NaN), false);            // total
});
