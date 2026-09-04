import { AIContext, AIProviderResponse, NormalizedAIResponse, ParsedAIResponse } from './AITypes';

export class FallbackEngine {
  public generateFallbackResponse(
    context: AIContext,
    errorMessage: string = 'Provider execution failed'
  ): { response: AIProviderResponse; parsed: ParsedAIResponse; normalized: NormalizedAIResponse } {
    const timestamp = Date.now();
    const requestId = `fallback_req_${timestamp}`;

    // Utilize Knowledge Platform records & ML Predictions if available
    const fallbackCategory = context.knowledgeBundle?.intent || 'Dashboard';
    const fallbackBrandColor = context.constraints.brandColor || '#3B82F6';

    const fallbackParsed: ParsedAIResponse = {
      suggestedLayoutVariantId: context.blueprint?.id || 'variant-deterministic-fallback',
      colorPalette: {
        primary: fallbackBrandColor,
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
        { type: 'Header', label: `${fallbackCategory} Navigation`, position: { x: 0, y: 0 }, size: { width: 1000, height: 60 } },
        { type: 'Card', label: 'Primary Content Panel', position: { x: 20, y: 80 }, size: { width: 960, height: 500 } }
      ],
      reasoningText: `Fallback Engine: Generated deterministic recommendations using Knowledge Platform & ML heuristics due to AI provider failure (${errorMessage}).`,
      confidenceScore: 0.85
    };

    const fallbackNormalized: NormalizedAIResponse = {
      ...fallbackParsed,
      colorPalette: fallbackParsed.colorPalette!,
      typography: fallbackParsed.typography!,
      normalizedComponents: fallbackParsed.suggestedComponents!.map((c) => ({
        type: c.type,
        label: c.label,
        bounds: {
          x: c.position?.x || 0,
          y: c.position?.y || 0,
          width: c.size?.width || 200,
          height: c.size?.height || 50
        }
      })),
      normalizedColors: { ...fallbackParsed.colorPalette! },
      normalizedSpacing: 8
    };

    const rawResponse = JSON.stringify(fallbackParsed, null, 2);

    const response: AIProviderResponse = {
      requestId,
      providerId: 'fallback-engine',
      rawResponse,
      parsedResponse: fallbackParsed,
      promptTokens: 0,
      completionTokens: Math.floor(rawResponse.length / 4),
      totalTokens: Math.floor(rawResponse.length / 4),
      latencyMs: 10,
      timestamp,
      status: 'fallback',
      errorMessage
    };

    return { response, parsed: fallbackParsed, normalized: fallbackNormalized };
  }
}
