import { AIProvider } from './AIProvider';
import { AIContext, AIPrompt, AIProviderResponse, AIRequestOptions } from './AITypes';

export class RetryEngine {
  public async executeWithRetry(
    provider: AIProvider,
    prompt: AIPrompt,
    context: AIContext,
    options: AIRequestOptions = {}
  ): Promise<{ response: AIProviderResponse; retryAttempts: number }> {
    const maxRetries = options.retryAttempts ?? 2;
    const timeoutMs = options.timeoutMs ?? 10000;
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const responsePromise = provider.sendRequest(prompt, context, options);

        // Timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
        });

        const response = await Promise.race([responsePromise, timeoutPromise]);

        if (response.status === 'error') {
          throw new Error(response.errorMessage || 'Provider returned error status');
        }

        return { response, retryAttempts: attempt };
      } catch (err: any) {
        lastError = err;
        attempt++;

        if (attempt <= maxRetries) {
          // Exponential backoff with jitter
          const delay = Math.pow(2, attempt) * 100 + Math.random() * 50;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error(`Provider execution failed after ${maxRetries} retries.`);
  }
}
