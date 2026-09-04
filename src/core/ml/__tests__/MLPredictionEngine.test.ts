import { MLPredictionEngine } from '../MLPredictionEngine';
import { MLModelRegistry } from '../MLModelRegistry';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

/**
 * Regression guard for MODEL_AUDIT_FINDINGS.md Checks 1 and 6:
 * MLPredictionEngine.predict() used to return a hardcoded constant
 * (recommendedStrategy: 'FlexGrid', predictedQualityScore: 88, confidence: 0.90)
 * for every task and every input. It was changed to throw instead, since
 * there is no trained inference path wired. This test exists so that stub
 * cannot silently come back: it currently passes only because predict()
 * throws for two structurally different inputs. If someone reintroduces a
 * constant return value, this test starts failing (either because predict()
 * stops throwing and this test's throw-assertions fail, or — if it throws
 * inconsistently — because the "does not vary" check below catches a
 * constant non-throwing result).
 */
export function runMLPredictionEngineRegressionTest(): { success: boolean } {
  const registry = new MLModelRegistry();
  const engine = new MLPredictionEngine(registry);

  const inputA = { elements: [{ id: 'a', type: 'rectangle', bounds: { x: 0, y: 0, width: 100, height: 50 } }] };
  const inputB = {
    elements: Array.from({ length: 12 }, (_, i) => ({ id: `b${i}`, type: 'text', bounds: { x: i * 10, y: i * 5, width: 200, height: 300 } }))
  };

  let resultA: any;
  let threwA = false;
  try {
    resultA = engine.predict('layout_prediction', inputA);
  } catch (err) {
    threwA = true;
    assert(err instanceof Error && err.message.length > 0, 'predict() must throw a real Error with a message, not an empty/silent failure.');
  }

  let resultB: any;
  let threwB = false;
  try {
    resultB = engine.predict('component_recommendation', inputB);
  } catch (err) {
    threwB = true;
    assert(err instanceof Error && err.message.length > 0, 'predict() must throw a real Error with a message, not an empty/silent failure.');
  }

  assert(threwA, 'predict() did not throw for input A — no trained inference path exists, so a non-throwing call means a fabricated result is being returned again.');
  assert(threwB, 'predict() did not throw for input B — no trained inference path exists, so a non-throwing call means a fabricated result is being returned again.');

  // Belt-and-suspenders: if a future change makes predict() stop throwing,
  // this still catches the specific regression this test is named for —
  // the same constant coming back regardless of input.
  if (!threwA && !threwB) {
    const KNOWN_OLD_CONSTANT = { recommendedStrategy: 'FlexGrid', predictedQualityScore: 88 };
    const stillConstant =
      resultA?.prediction?.recommendedStrategy === KNOWN_OLD_CONSTANT.recommendedStrategy &&
      resultA?.prediction?.predictedQualityScore === KNOWN_OLD_CONSTANT.predictedQualityScore &&
      resultB?.prediction?.recommendedStrategy === KNOWN_OLD_CONSTANT.recommendedStrategy &&
      resultB?.prediction?.predictedQualityScore === KNOWN_OLD_CONSTANT.predictedQualityScore;
    assert(!stillConstant, 'predict() returned the exact old fabricated constant for two structurally different inputs — the stub is back.');
  }

  return { success: true };
}
