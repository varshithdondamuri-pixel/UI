import { runMLPredictionEngineRegressionTest } from './core/ml/__tests__/MLPredictionEngine.test.js';

function main() {
  console.log('Executing MLPredictionEngine Regression Guard...');
  const res = runMLPredictionEngineRegressionTest();
  console.log('MLPREDICTIONENGINE_TEST_SUCCESS:', JSON.stringify(res, null, 2));
}

try {
  main();
} catch (err) {
  console.error('MLPREDICTIONENGINE_TEST_FAILED:', err);
  process.exit(1);
}
