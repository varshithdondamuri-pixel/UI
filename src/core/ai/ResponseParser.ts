import { ParsedAIResponse } from './AITypes';

export class ResponseParser {
  public parseResponse(rawText: string, defaultIntent: string = 'Dashboard'): ParsedAIResponse {
    let cleanJsonText = rawText.trim();

    // Strip markdown code fences if present (e.g. ```json ... ```)
    if (cleanJsonText.startsWith('```')) {
      cleanJsonText = cleanJsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanJsonText);

      return {
        suggestedLayoutVariantId: parsed.suggestedLayoutVariantId || 'default-variant',
        colorPalette: parsed.colorPalette ? {
          primary: parsed.colorPalette.primary || '#3B82F6',
          secondary: parsed.colorPalette.secondary || '#1E293B',
          background: parsed.colorPalette.background || '#FFFFFF',
          surface: parsed.colorPalette.surface || '#F8FAFC',
          text: parsed.colorPalette.text || '#0F172A',
          accent: parsed.colorPalette.accent || '#F59E0B'
        } : undefined,
        typography: parsed.typography ? {
          fontFamily: parsed.typography.fontFamily || 'Inter, sans-serif',
          headingFont: parsed.typography.headingFont || parsed.typography.fontFamily || 'Inter, sans-serif',
          bodyFont: parsed.typography.bodyFont || parsed.typography.fontFamily || 'Inter, sans-serif'
        } : undefined,
        suggestedComponents: Array.isArray(parsed.suggestedComponents)
          ? parsed.suggestedComponents.map((c: any) => ({
              type: String(c.type || 'Container'),
              label: String(c.label || 'Component'),
              position: c.position ? { x: Number(c.position.x || 0), y: Number(c.position.y || 0) } : undefined,
              size: c.size ? { width: Number(c.size.width || 100), height: Number(c.size.height || 40) } : undefined
            }))
          : [],
        reasoningText: parsed.reasoningText || 'AI generated structured design recommendation.',
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.9,
        rawJson: parsed
      };
    } catch (err) {
      // Fallback parsing for plain text responses
      return {
        suggestedLayoutVariantId: 'default-variant',
        colorPalette: {
          primary: '#3B82F6',
          secondary: '#1E293B',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          text: '#0F172A',
          accent: '#F59E0B'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          headingFont: 'Inter, sans-serif',
          bodyFont: 'Inter, sans-serif'
        },
        suggestedComponents: [
          { type: 'Header', label: `${defaultIntent} Header`, position: { x: 0, y: 0 }, size: { width: 800, height: 60 } }
        ],
        reasoningText: rawText.length > 200 ? rawText.substring(0, 200) + '...' : rawText,
        confidenceScore: 0.7,
        rawJson: null
      };
    }
  }
}
