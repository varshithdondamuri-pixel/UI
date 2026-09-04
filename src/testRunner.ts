import { runGeminiUIIntegrationTest } from './core/ai/__tests__/GeminiUIIntegration.test.js';

async function main() {
  console.log('Executing Gemini UI Integration Suite...');
  const res = await runGeminiUIIntegrationTest();
  console.log('INTEGRATION_TEST_SUCCESS:', JSON.stringify(res, null, 2));
}

main().catch((err) => {
  console.error('INTEGRATION_TEST_FAILED:', err);
  process.exit(1);
});
