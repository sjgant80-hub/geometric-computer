// run-gate.mjs — proof-of-play for the geometric-computing stack: L1 (fold.mjs, the primorial
// codec) + L2 (eth.mjs, the torus-harmonic stability engine). Mutation-gates the LOGIC of both
// and fuzzes every boundary function — no crafted input may throw, and the invariants (lossless
// round-trip, stability discrimination) actually hold under single-point mutation.
// attractor.mjs is NOT mutation-gated here: it is the estate's already-gated organ (witness 1.0),
// vendored and reused; eth.mjs's tests pin the behaviour it depends on.
import { runMutations, fuzz } from './witness.mjs';
import * as fold from '../kernel/fold.mjs';
import * as eth from '../kernel/eth.mjs';

const TEST = ['node', '--test', 'test/fold.test.mjs', 'test/eth.test.mjs'];
let clean = true;

for (const src of ['kernel/fold.mjs', 'kernel/eth.mjs']) {
  console.log(`── mutation gate (${src}) ─────`);
  const r = runMutations(src, { testCmd: TEST });
  if (r.baselineFailed) { console.log('  BASELINE RED —', r.reason); clean = false; continue; }
  const ig = r.ignored.length ? ` (+${r.ignored.length} baselined)` : '';
  console.log(`  ${src}: ${r.killed}/${r.total} killed  score=${r.score}${ig}  ${r.clean ? 'CLEAN' : 'THEATRE'}`);
  for (const s of r.survived) console.log(`     SURVIVED L${s.line}  ${s.mutation}  | ${s.snippet}`);
  clean = clean && r.clean;
}

console.log('\n── fuzz gate (no crafted fold-signature may crash the stack) ──');
for (const [name, fn] of Object.entries({
  // L1
  'foldSubset':     (x) => fold.foldSubset(x),
  'unfoldSubset':   (x) => fold.unfoldSubset(x),
  'isBloom':        (x) => fold.isBloom(x),
  'foldResidues':   (x) => fold.foldResidues(x),
  'unfoldResidues': (x) => fold.unfoldResidues(x),
  'shield':         (x) => fold.shield(x),
  'verifyShield':   (x) => fold.verifyShield(x),
  // L2
  'resonance':      (x) => eth.resonance(x),
  'drive':          (x) => eth.drive(x),
  'torusTrajectory': (x) => eth.torusTrajectory(x),
  'stabilityOfWinding': (x) => eth.stabilityOfWinding(x),
  'windingOf':      (x) => eth.windingOf(x),
  'stability':      (x) => eth.stability(x),
  'coexist':        (x) => eth.coexist(x, x),
  'onSeam':         (x) => eth.onSeam(x),
})) {
  const f = await fuzz(fn);
  console.log(`  ${name}: ${f.neverThrows ? 'never throws — OK' : 'THREW on ' + f.throwsOn.map((t) => t.input).join(', ')}`);
  clean = clean && f.neverThrows;
}

console.log(clean ? '\n=== ALL CLEAN ===' : '\n=== SURVIVORS / THROWS REMAIN ===');
process.exit(clean ? 0 : 1);
