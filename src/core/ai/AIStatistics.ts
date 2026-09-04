import { AIStats } from './AITypes';

export class AIStatistics {
  private stats: AIStats = {
    promptCount: 0,
    latencyMsTotal: 0,
    averageLatencyMs: 0,
    providerUsage: {},
    validationFailures: 0,
    retryCount: 0,
    fallbackCount: 0,
    totalTokens: 0,
    averageTokens: 0,
    averageContextSize: 0
  };

  private contextSizeTotal: number = 0;

  public recordRequest(
    providerId: string,
    latencyMs: number,
    tokens: number,
    contextSize: number,
    isFallback: boolean = false,
    retries: number = 0,
    isValidationFailure: boolean = false
  ): void {
    this.stats.promptCount += 1;
    this.stats.latencyMsTotal += latencyMs;
    this.stats.averageLatencyMs = Math.round(this.stats.latencyMsTotal / this.stats.promptCount);

    this.stats.providerUsage[providerId] = (this.stats.providerUsage[providerId] || 0) + 1;

    this.stats.totalTokens += tokens;
    this.stats.averageTokens = Math.round(this.stats.totalTokens / this.stats.promptCount);

    this.contextSizeTotal += contextSize;
    this.stats.averageContextSize = Math.round(this.contextSizeTotal / this.stats.promptCount);

    if (isFallback) this.stats.fallbackCount += 1;
    if (retries > 0) this.stats.retryCount += retries;
    if (isValidationFailure) this.stats.validationFailures += 1;
  }

  public getStats(): AIStats {
    return {
      ...this.stats,
      providerUsage: { ...this.stats.providerUsage }
    };
  }

  public reset(): void {
    this.stats = {
      promptCount: 0,
      latencyMsTotal: 0,
      averageLatencyMs: 0,
      providerUsage: {},
      validationFailures: 0,
      retryCount: 0,
      fallbackCount: 0,
      totalTokens: 0,
      averageTokens: 0,
      averageContextSize: 0
    };
    this.contextSizeTotal = 0;
  }
}
