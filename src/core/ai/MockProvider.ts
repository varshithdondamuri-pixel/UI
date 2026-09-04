import { AIProvider } from './AIProvider';
import { AIContext, AIPrompt, AIProviderCapabilities, AIProviderConfig, AIProviderResponse, AIRequestOptions } from './AITypes';

export class MockProvider implements AIProvider {
  public id = 'mock-provider';
  public name = 'Mock Provider (Offline / Fast)';
  public config: AIProviderConfig;
  public capabilities: AIProviderCapabilities;

  constructor() {
    this.capabilities = {
      supportsMultimodal: true,
      supportsStreaming: false,
      supportsReasoning: true,
      supportsJsonOutput: true,
      maxTokenLimit: 16384
    };

    this.config = {
      id: this.id,
      name: this.name,
      type: 'mock',
      modelName: 'mock-v1',
      capabilities: this.capabilities
    };
  }

  public isAvailable(): boolean {
    return true;
  }

  public async sendRequest(
    prompt: AIPrompt,
    context: AIContext,
    _options?: AIRequestOptions
  ): Promise<AIProviderResponse> {
    const startTime = Date.now();
    const requestId = `req_mock_${startTime}_${Math.random().toString(36).substring(2, 7)}`;

    // Build intelligent mock response based on prompt & context
    const intentType = context.intentTree?.root.type || 'Dashboard';
    const primaryColor = context.constraints.brandColor || '#3B82F6';

    const mockJsonResponse = {
      suggestedLayoutVariantId: context.blueprint?.id || 'variant-modern',
      colorPalette: {
        primary: primaryColor,
        secondary: '#1E293B',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#0F172A',
        accent: '#F59E0B'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif'
      },
      suggestedComponents: [
        { type: 'Header', label: `${intentType} Title`, position: { x: 20, y: 20 }, size: { width: 300, height: 40 } },
        { type: 'Card', label: 'Summary Metrics', position: { x: 20, y: 80 }, size: { width: 340, height: 180 } },
        { type: 'Button', label: 'Primary Action', position: { x: 20, y: 280 }, size: { width: 140, height: 44 } }
      ],
      reasoningText: `Synthesized layout for ${intentType} using optimal visual hierarchy, WCAG AA accessibility contrast, and responsive spacing.`,
      confidenceScore: 0.94
    };

    const latencyMs = Math.floor(Math.random() * 80) + 40;
    await new Promise((resolve) => setTimeout(resolve, latencyMs));

    const promptTokens = Math.floor(prompt.formattedPrompt.length / 4);
    const completionTokens = Math.floor(JSON.stringify(mockJsonResponse).length / 4);

    return {
      requestId,
      providerId: this.id,
      rawResponse: JSON.stringify(mockJsonResponse, null, 2),
      parsedResponse: mockJsonResponse,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      latencyMs: Date.now() - startTime,
      timestamp: Date.now(),
      status: 'success'
    };
  }
}
