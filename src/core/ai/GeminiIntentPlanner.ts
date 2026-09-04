import { GeminiProvider } from './GeminiProvider';
import { UIGenerationSpec, createDefaultUIGenerationSpec } from './UIGenerationSpec';

/**
 * Section list used when a response carries no `sections` of its own (the
 * simulated GeminiProvider path always hits this, since its canned response
 * has no sections field). Keyed by productType so the fallback stops handing
 * every request the same generic [Navbar, Hero, ContentGrid] regardless of
 * what was actually asked for — productType is already detected correctly
 * from prompt keywords before this runs, it just wasn't being used here.
 * Each `type` string here must resolve in SectionBuilders.resolveSectionKey.
 */
function fallbackSectionsForProductType(
  productType: UIGenerationSpec['productType']
): { type: string; purpose: string }[] {
  switch (productType) {
    case 'dashboard':
      return [
        { type: 'Sidebar', purpose: 'Primary Navigation' },
        { type: 'Topbar', purpose: 'Page Header' },
        { type: 'KpiRow', purpose: 'Key Metrics' },
        { type: 'ChartArea', purpose: 'Trend Chart' },
        { type: 'DataTable', purpose: 'Records Table' }
      ];
    case 'ecommerce':
      return [
        { type: 'Navbar', purpose: 'Navigation' },
        { type: 'Hero', purpose: 'Hero Banner' },
        { type: 'ProductGrid', purpose: 'Product Listing' },
        { type: 'Cta', purpose: 'Call To Action' },
        { type: 'Footer', purpose: 'Footer' }
      ];
    case 'landing_page':
    case 'website':
      return [
        { type: 'Navbar', purpose: 'Navigation' },
        { type: 'Hero', purpose: 'Hero Banner' },
        { type: 'Features', purpose: 'Feature Highlights' },
        { type: 'Cta', purpose: 'Call To Action' },
        { type: 'Footer', purpose: 'Footer' }
      ];
    case 'mobile_app':
    case 'form':
      return [{ type: 'LoginForm', purpose: 'Login' }];
    default:
      return [
        { type: 'Navbar', purpose: 'Navigation' },
        { type: 'Hero', purpose: 'Hero Banner' },
        { type: 'ContentGrid', purpose: 'Content' }
      ];
  }
}

export class GeminiIntentPlanner {
  private provider: GeminiProvider;

  constructor(apiKey?: string) {
    this.provider = new GeminiProvider(apiKey);
  }

  /**
   * Natural Language Prompt -> Gemini Intent Understanding -> UIGenerationSpec
   */
  public async planGenerationFromPrompt(promptText: string): Promise<UIGenerationSpec> {
    const text = promptText.trim().toLowerCase();

    // Determine target product type from prompt keywords
    let targetType: UIGenerationSpec['productType'] = 'website';
    if (text.includes('dashboard') || text.includes('analytics') || text.includes('metrics')) {
      targetType = 'dashboard';
    } else if (text.includes('ecommerce') || text.includes('store') || text.includes('shop') || text.includes('sneaker')) {
      targetType = 'ecommerce';
    } else if (text.includes('login') || text.includes('auth') || text.includes('signup') || text.includes('form')) {
      targetType = 'form';
    } else if (text.includes('mobile') || text.includes('app')) {
      targetType = 'mobile_app';
    } else if (text.includes('landing') || text.includes('saas')) {
      targetType = 'landing_page';
    }

    // Formulate system prompt requesting JSON UIGenerationSpec from Gemini
    const formattedPrompt = `System: You are an autonomous UI Intent Planning AI. 
Convert the user prompt into a structured JSON UIGenerationSpec contract.
Do not invent fake dataset citations. Output valid JSON adhering to UIGenerationSpec structure.

User Request: "${promptText}"
Target Product Type: "${targetType}"`;

    try {
      const response = await this.provider.sendRequest(
        {
          systemDirective: 'UI Intent Planner',
          userDirective: promptText,
          sections: [],
          formattedPrompt,
          estimatedTokens: Math.floor(formattedPrompt.length / 4),
          compressed: false
        },
        {
          userPrompt: promptText,
          sketch: { nodeCount: 0, shapes: [], hasRelationships: false },
          semanticTree: null,
          intentTree: null,
          blueprint: null,
          visualDesignModel: null,
          knowledgeBundle: null,
          predictionBundle: null,
          accessibility: { wcagTargetLevel: 'AA', minTouchSize: 44, colorContrastRatio: 4.5 },
          constraints: { responsive: true, maxDepth: 4, maxComponents: 20, brandColor: '#38bdf8' },
          timestamp: Date.now()
        }
      );

      if (response.status === 'success' && response.parsedResponse) {
        const spec = this.parseAndValidateSpec(response.parsedResponse, promptText, targetType);
        return spec;
      }
    } catch (err) {
      console.warn('Gemini intent planning failed safely, falling back to default spec:', err);
    }

    return this.buildRichFallbackSpec(promptText, targetType);
  }

  /**
   * Screenshot Image Upload -> Gemini Visual Understanding -> UIGenerationSpec
   */
  public async planGenerationFromImage(
    imageDataUrl: string,
    fileName?: string
  ): Promise<UIGenerationSpec> {
    const formattedPrompt = `System: You are a visual UI recognition AI. Analyze this uploaded UI screenshot and convert its visible hierarchy, sections, and components into a structured UIGenerationSpec JSON.
File: "${fileName || 'screenshot.png'}"`;

    try {
      const response = await this.provider.sendRequest(
        {
          systemDirective: 'Visual UI Recognition AI',
          userDirective: `Analyze ${fileName || 'screenshot.png'} (${imageDataUrl.slice(0, 30)}...)`,
          sections: [],
          formattedPrompt,
          estimatedTokens: Math.floor(formattedPrompt.length / 4),
          compressed: false
        },
        {
          userPrompt: `Analyze ${fileName || 'screenshot.png'}`,
          sketch: { nodeCount: 0, shapes: [], hasRelationships: false },
          semanticTree: null,
          intentTree: null,
          blueprint: null,
          visualDesignModel: null,
          knowledgeBundle: null,
          predictionBundle: null,
          accessibility: { wcagTargetLevel: 'AA', minTouchSize: 44, colorContrastRatio: 4.5 },
          constraints: { responsive: true, maxDepth: 4, maxComponents: 20, brandColor: '#38bdf8' },
          timestamp: Date.now()
        }
      );

      if (response.status === 'success' && response.parsedResponse) {
        return this.parseAndValidateSpec(response.parsedResponse, `Reconstructed from ${fileName || 'Screenshot'}`, 'website');
      }
    } catch (err) {
      console.warn('Gemini image visual understanding fell back safely:', err);
    }

    return this.buildRichFallbackSpec(`Reconstructed from ${fileName || 'Screenshot'}`, 'website');
  }

  /**
   * Strict JSON Schema & Safety Validation
   */
  public parseAndValidateSpec(
    parsedJson: any,
    prompt: string,
    fallbackType: UIGenerationSpec['productType']
  ): UIGenerationSpec {
    const validTypes: UIGenerationSpec['productType'][] = [
      'website',
      'dashboard',
      'mobile_app',
      'landing_page',
      'ecommerce',
      'form',
      'other'
    ];

    const productType: UIGenerationSpec['productType'] = validTypes.includes(parsedJson.productType)
      ? parsedJson.productType
      : fallbackType;

    const referenceQueries: string[] = Array.isArray(parsedJson.referenceQueries)
      ? parsedJson.referenceQueries.map((q: any) => String(q))
      : [productType, 'hero section', 'navigation bar'];

    return {
      intent: prompt,
      productType,
      purpose: parsedJson.purpose || `Interface generation for ${prompt}`,
      pages: Array.isArray(parsedJson.pages) ? parsedJson.pages : ['Home'],
      sections: Array.isArray(parsedJson.sections)
        ? parsedJson.sections
        : fallbackSectionsForProductType(productType).map((s, idx) => ({ ...s, order: idx + 1 })),
      components: Array.isArray(parsedJson.components) ? parsedJson.components : [
        { type: 'Navbar', purpose: 'Top Bar' },
        { type: 'HeroBanner', purpose: 'Hero Section' }
      ],
      layout: {
        structure: parsedJson.layout?.structure || 'responsive_grid',
        columns: parsedJson.layout?.columns || 12,
        responsive: parsedJson.layout?.responsive ?? true
      },
      visualStyle: {
        theme: parsedJson.visualStyle?.theme || 'dark',
        mood: parsedJson.visualStyle?.mood || 'modern_premium',
        typography: parsedJson.visualStyle?.typography || 'Inter, sans-serif',
        spacing: parsedJson.visualStyle?.spacing || 'relaxed',
        radius: parsedJson.visualStyle?.radius || 'rounded_md'
      },
      content: {
        headings: Array.isArray(parsedJson.content?.headings) ? parsedJson.content.headings : ['Welcome to Next-Gen Platform'],
        labels: Array.isArray(parsedJson.content?.labels) ? parsedJson.content.labels : ['Products', 'Features', 'Pricing'],
        ctas: Array.isArray(parsedJson.content?.ctas) ? parsedJson.content.ctas : ['Get Started', 'Learn More']
      },
      referenceQueries,
      confidence: typeof parsedJson.confidenceScore === 'number' ? parsedJson.confidenceScore : 0.96
    };
  }

  private buildRichFallbackSpec(prompt: string, productType: UIGenerationSpec['productType']): UIGenerationSpec {
    const spec = createDefaultUIGenerationSpec(prompt, productType);

    if (productType === 'ecommerce') {
      spec.content.headings = ['STEP INTO THE FUTURE', 'Featured Collection'];
      spec.content.labels = ['Men', 'Women', 'Sneakers', 'Collections', 'Cart'];
      spec.content.ctas = ['SHOP COLLECTION', 'Add to Cart'];
      spec.referenceQueries = ['ecommerce', 'product grid', 'sneakers', 'hero banner', 'checkout cart'];
    } else if (productType === 'dashboard') {
      spec.content.headings = ['Analytics Overview', 'Revenue & Traffic Performance'];
      spec.content.labels = ['Dashboard', 'Reports', 'Customers', 'Metrics', 'Settings'];
      spec.content.ctas = ['Export Data', 'Filter Period'];
      spec.referenceQueries = ['dashboard', 'sidebar navigation', 'analytics cards', 'data table'];
    } else if (productType === 'form') {
      spec.content.headings = ['Welcome Back', 'Sign in to your account'];
      spec.content.labels = ['Email Address', 'Password', 'Remember Me'];
      spec.content.ctas = ['Sign In', 'Create Account'];
      spec.referenceQueries = ['login', 'auth form', 'signup', 'centered card'];
    }

    return spec;
  }
}
