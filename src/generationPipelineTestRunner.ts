import { runGenerationPipelineTest, runGenerationStateMachineTest } from './core/planning/__tests__/GenerationPipeline.test.js';

function main() {
  console.log('Executing UI Generation Pipeline Suite...');
  const res = runGenerationPipelineTest();
  console.log('GENERATION_PIPELINE_TEST_SUCCESS:', JSON.stringify(res, null, 2));

  console.log('Executing Generation State Machine Suite...');
  const stateRes = runGenerationStateMachineTest();
  console.log('GENERATION_STATE_MACHINE_TEST_SUCCESS:', JSON.stringify(stateRes, null, 2));
}

try {
  main();
} catch (err) {
  console.error('GENERATION_PIPELINE_TEST_FAILED:', err);
  process.exit(1);
}
