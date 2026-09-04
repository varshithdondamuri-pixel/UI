import { TypedEventBus } from '../events/EventBus';
import { AIEvents } from './AIEvents';
import { AIProviderRegistry } from './AIProviderRegistry';
import { ContextBuilder, ContextBuilderInput } from './ContextBuilder';
import { PromptBuilder } from './PromptBuilder';
import { ConversationMemory } from './ConversationMemory';
import { ReasoningPipeline } from './ReasoningPipeline';
import { ResponseParser } from './ResponseParser';
import { ResponseNormalizer } from './ResponseNormalizer';
import { ResponseValidator } from './ResponseValidator';
import { ConstraintValidator } from './ConstraintValidator';
import { DesignDecisionEngine } from './DesignDecisionEngine';
import { FallbackEngine } from './FallbackEngine';
import { RetryEngine } from './RetryEngine';
import { AIStatistics } from './AIStatistics';
import {
  AIContext,
  AIPrompt,
  AIProviderResponse,
  AIOrchestrationResult,
  AIRequestOptions,
  AIStats
} from './AITypes';

export interface AIOrchestratorOptions extends AIRequestOptions {
  providerId?: string;
}

export class AIOrchestrator {
  private eventBus: TypedEventBus;
  private providerRegistry: AIProviderRegistry;
  private contextBuilder: ContextBuilder;
  private promptBuilder: PromptBuilder;
  private conversationMemory: ConversationMemory;
  private reasoningPipeline: ReasoningPipeline;
  private responseParser: ResponseParser;
  private responseNormalizer: ResponseNormalizer;
  private responseValidator: ResponseValidator;
  private constraintValidator: ConstraintValidator;
  private decisionEngine: DesignDecisionEngine;
  private fallbackEngine: FallbackEngine;
  private retryEngine: RetryEngine;
  private statistics: AIStatistics;

  private lastResult: AIOrchestrationResult | null = null;
  private isProcessing: boolean = false;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
    this.providerRegistry = new AIProviderRegistry();
    this.contextBuilder = new ContextBuilder();
    this.promptBuilder = new PromptBuilder();
    this.conversationMemory = new ConversationMemory();
    this.reasoningPipeline = new ReasoningPipeline();
    this.responseParser = new ResponseParser();
    this.responseNormalizer = new ResponseNormalizer();
    this.responseValidator = new ResponseValidator();
    this.constraintValidator = new ConstraintValidator();
    this.decisionEngine = new DesignDecisionEngine();
    this.fallbackEngine = new FallbackEngine();
    this.retryEngine = new RetryEngine();
    this.statistics = new AIStatistics();
  }

  public async orchestrate(
    input: ContextBuilderInput,
    options: AIOrchestratorOptions = {}
  ): Promise<AIOrchestrationResult> {
    const startTime = Date.now();
    this.isProcessing = true;

    if (options.providerId) {
      this.setActiveProvider(options.providerId);
    }

    const provider = this.providerRegistry.getActiveProvider();
    const requestId = `ai_req_${startTime}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Context Building
    const context: AIContext = this.contextBuilder.buildContext(input);

    // 2. Prompt Building
    const prompt: AIPrompt = this.promptBuilder.buildPrompt(context);

    // Emit AI_REQUEST_STARTED
    this.eventBus.emit(AIEvents.REQUEST_STARTED, {
      requestId,
      providerId: provider.id,
      timestamp: startTime
    });

    let rawResponse: AIProviderResponse;
    let usedFallback = false;
    let retryAttemptsCount = 0;

    try {
      // 3. Reasoning & Execution with Retry Engine
      const reasoningOutcome = await this.reasoningPipeline.executePipeline(
        context,
        prompt,
        async () => {
          const { response, retryAttempts } = await this.retryEngine.executeWithRetry(
            provider,
            prompt,
            context,
            options
          );
          retryAttemptsCount = retryAttempts;
          return response;
        }
      );
      rawResponse = reasoningOutcome.response;
    } catch (err: any) {
      // Execute Fallback Engine if AI provider calls fail
      usedFallback = true;
      const fallbackOutcome = this.fallbackEngine.generateFallbackResponse(
        context,
        err?.message || 'Provider execution failed'
      );
      rawResponse = fallbackOutcome.response;
    }

    this.eventBus.emit(AIEvents.REQUEST_FINISHED, {
      requestId,
      response: rawResponse,
      timestamp: Date.now()
    });

    // 4. Response Parsing & Normalization
    const parsed = rawResponse.parsedResponse || this.responseParser.parseResponse(rawResponse.rawResponse);
    const normalized = this.responseNormalizer.normalizeResponse(parsed);

    // 5. Validation
    this.eventBus.emit(AIEvents.VALIDATION_STARTED, { requestId, timestamp: Date.now() });

    const validation = this.responseValidator.validateResponse(normalized, context);
    const constraintValidation = this.constraintValidator.validateConstraints(normalized, context);

    this.eventBus.emit(AIEvents.VALIDATION_FINISHED, {
      requestId,
      validation,
      timestamp: Date.now()
    });

    // 6. Design Decision Engine
    const decisionResult = this.decisionEngine.produceDecision(
      context,
      normalized,
      validation,
      constraintValidation
    );

    this.eventBus.emit(AIEvents.DECISION_CREATED, {
      decision: decisionResult.decision,
      timestamp: Date.now()
    });

    // 7. Telemetry & Statistics
    this.statistics.recordRequest(
      provider.id,
      rawResponse.latencyMs,
      rawResponse.totalTokens,
      prompt.formattedPrompt.length,
      usedFallback,
      retryAttemptsCount,
      !validation.isValid
    );

    // 8. Memory Logging
    this.conversationMemory.addTurn(
      context.userPrompt,
      context,
      prompt.formattedPrompt,
      rawResponse,
      decisionResult.decision
    );

    const result: AIOrchestrationResult = {
      requestId,
      providerId: provider.id,
      context,
      prompt,
      response: rawResponse,
      reasoning: {
        stages: [],
        totalExecutionTimeMs: Date.now() - startTime,
        summary: 'Completed AI Orchestration pipeline.'
      },
      parsedResponse: parsed,
      normalizedResponse: normalized,
      validation,
      constraintValidation,
      decisionResult,
      usedFallback,
      executionTimeMs: Date.now() - startTime
    };

    this.lastResult = result;
    this.isProcessing = false;

    return result;
  }

  public getProviderRegistry(): AIProviderRegistry {
    return this.providerRegistry;
  }

  public setActiveProvider(providerId: string): boolean {
    const success = this.providerRegistry.setActiveProvider(providerId);
    if (success) {
      const active = this.providerRegistry.getActiveProvider();
      this.eventBus.emit(AIEvents.PROVIDER_CHANGED, {
        providerId: active.id,
        providerName: active.name
      });
    }
    return success;
  }

  public getConversationMemory(): ConversationMemory {
    return this.conversationMemory;
  }

  public getStats(): AIStats {
    return this.statistics.getStats();
  }

  public getLastResult(): AIOrchestrationResult | null {
    return this.lastResult;
  }

  public getIsProcessing(): boolean {
    return this.isProcessing;
  }
}
