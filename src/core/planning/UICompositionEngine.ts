import { CanvasNode } from '../../types';
import { SceneGraph } from '../scene/SceneGraph';
import { DatasetReferenceEngine } from '../dataset/DatasetReferenceEngine';
import { UIIntelligenceAnalysisResult } from '../ml/orchestration/UIIntelligenceService';
import { UIGenerationSpec } from '../ai/UIGenerationSpec';

export type TemplateId =
  | 'Landing Page'
  | 'Dashboard'
  | 'SaaS'
  | 'Ecommerce'
  | 'Login'
  | 'Signup'
  | 'Portfolio'
  | 'Blog'
  | 'Mobile App'
  | 'Admin Panel'
  | 'Pricing'
  | 'Blank Canvas';

export class UICompositionEngine {
  private referenceEngine: DatasetReferenceEngine;

  constructor() {
    this.referenceEngine = new DatasetReferenceEngine();
  }

  /**
   * Main entry point to compose real canvas nodes for a template, prompt, spec, or image reconstruction
   */
  public composeAndPopulateCanvas(
    sceneGraph: SceneGraph,
    options: {
      templateId?: TemplateId;
      promptText?: string;
      uiGenerationSpec?: UIGenerationSpec;
      mlAnalysisResult?: UIIntelligenceAnalysisResult | null;
      reconstructImageElements?: any[];
    }
  ): CanvasNode[] {
    sceneGraph.clear();

    if (options.templateId === 'Blank Canvas') {
      return [];
    }

    let nodes: CanvasNode[] = [];

    if (options.reconstructImageElements && options.reconstructImageElements.length > 0) {
      nodes = this.buildImageReconstructionNodes(sceneGraph, options.reconstructImageElements);
    } else if (options.uiGenerationSpec) {
      nodes = this.buildSpecNodes(sceneGraph, options.uiGenerationSpec);
    } else if (options.templateId) {
      nodes = this.buildTemplateNodes(sceneGraph, options.templateId);
    } else if (options.promptText) {
      nodes = this.buildPromptNodes(sceneGraph, options.promptText);
    } else {
      nodes = this.buildTemplateNodes(sceneGraph, 'Landing Page');
    }

    nodes.forEach((node) => sceneGraph.addNode(node));
    return nodes;
  }

  /**
   * Build canvas nodes based on UIGenerationSpec
   */
  private buildSpecNodes(sceneGraph: SceneGraph, spec: UIGenerationSpec): CanvasNode[] {
    // Search dataset references using spec.referenceQueries
    this.referenceEngine.searchReferencesByQueries(spec.referenceQueries);

    switch (spec.productType) {
      case 'ecommerce':
        return this.createEcommerceTemplate(sceneGraph, spec);
      case 'dashboard':
        return this.createDashboardTemplate(sceneGraph, spec);
      case 'form':
        return this.createLoginTemplate(sceneGraph, spec);
      case 'mobile_app':
        return this.createMobileAppTemplate(sceneGraph, spec);
      case 'landing_page':
      case 'website':
      default:
        return this.createLandingPageTemplate(sceneGraph, spec);
    }
  }

  /**
   * Build realistic canvas nodes for templates
   */
  private buildTemplateNodes(sceneGraph: SceneGraph, templateId: TemplateId): CanvasNode[] {
    switch (templateId) {
      case 'Landing Page':
        return this.createLandingPageTemplate(sceneGraph);
      case 'Dashboard':
        return this.createDashboardTemplate(sceneGraph);
      case 'SaaS':
        return this.createSaaSTemplate(sceneGraph);
      case 'Ecommerce':
        return this.createEcommerceTemplate(sceneGraph);
      case 'Login':
        return this.createLoginTemplate(sceneGraph);
      case 'Signup':
        return this.createSignupTemplate(sceneGraph);
      case 'Portfolio':
        return this.createPortfolioTemplate(sceneGraph);
      case 'Blog':
        return this.createBlogTemplate(sceneGraph);
      case 'Mobile App':
        return this.createMobileAppTemplate(sceneGraph);
      case 'Admin Panel':
        return this.createAdminPanelTemplate(sceneGraph);
      case 'Pricing':
        return this.createPricingTemplate(sceneGraph);
      case 'Blank Canvas':
      default:
        return [];
    }
  }

  // 1. Landing Page Template
  private createLandingPageTemplate(sceneGraph: SceneGraph, spec?: UIGenerationSpec): CanvasNode[] {
    const nodes: CanvasNode[] = [];
    const mainHeading = spec?.content?.headings?.[0] || 'Build Your Perfect User Experience';
    const subHeading = spec?.content?.headings?.[1] || 'Autonomous AI UI Generation Engine powered by Governed ML Models.';
    const ctaLabel = spec?.content?.ctas?.[0] || 'Get Started';

    // Navbar Container
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 40, y: 20 },
        size: { width: 1120, height: 70 },
        fill: '#1e293b',
        stroke: '#38bdf8',
        strokeWidth: 1,
        metadata: { semanticLabel: 'Navbar Container', userLabel: 'Navbar', confidence: 0.98, notes: null }
      })
    );

    // Hero Section Container
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 40, y: 110 },
        size: { width: 1120, height: 360 },
        fill: '#0f172a',
        stroke: 'rgba(56, 189, 248, 0.3)',
        strokeWidth: 2,
        metadata: { semanticLabel: 'Hero Banner', userLabel: 'Hero Container', confidence: 0.99, notes: null }
      })
    );

    // Hero Heading Text
    nodes.push(
      sceneGraph.createNode({
        kind: 'text',
        position: { x: 80, y: 160 },
        size: { width: 640, height: 60 },
        fill: '#f8fafc',
        stroke: 'transparent',
        text: mainHeading,
        metadata: { semanticLabel: 'Hero Heading', userLabel: mainHeading, confidence: 0.99, notes: null }
      })
    );

    // Hero Subheading Text
    nodes.push(
      sceneGraph.createNode({
        kind: 'text',
        position: { x: 80, y: 230 },
        size: { width: 580, height: 40 },
        fill: '#94a3b8',
        stroke: 'transparent',
        text: subHeading,
        metadata: { semanticLabel: 'Subheading', userLabel: subHeading, confidence: 0.96, notes: null }
      })
    );

    // Primary CTA Button
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 80, y: 290 },
        size: { width: 180, height: 50 },
        fill: '#0ea5e9',
        stroke: '#38bdf8',
        strokeWidth: 2,
        metadata: { semanticLabel: 'Primary Action Button', userLabel: ctaLabel, confidence: 0.98, notes: null }
      })
    );

    // Hero Image Card Illustration
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 740, y: 150 },
        size: { width: 380, height: 280 },
        fill: '#1e1b4b',
        stroke: '#6366f1',
        strokeWidth: 2,
        metadata: { semanticLabel: 'Hero Illustration', userLabel: 'Hero Media Card', confidence: 0.97, notes: null }
      })
    );

    // 3 Feature Cards Row
    [0, 1, 2].forEach((idx) => {
      nodes.push(
        sceneGraph.createNode({
          kind: 'rectangle',
          position: { x: 40 + idx * 385, y: 490 },
          size: { width: 350, height: 200 },
          fill: '#1e293b',
          stroke: 'rgba(255, 255, 255, 0.1)',
          strokeWidth: 1,
          metadata: { semanticLabel: `Feature Card #${idx + 1}`, userLabel: `Feature Card ${idx + 1}`, confidence: 0.95, notes: null }
        })
      );
    });

    return nodes;
  }

  // 2. Dashboard Template
  private createDashboardTemplate(sceneGraph: SceneGraph, spec?: UIGenerationSpec): CanvasNode[] {
    const nodes: CanvasNode[] = [];

    // Sidebar Navigation Container
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 40, y: 20 },
        size: { width: 240, height: 680 },
        fill: '#0f172a',
        stroke: '#38bdf8',
        strokeWidth: 1,
        metadata: { semanticLabel: 'Sidebar Navigation', userLabel: 'Sidebar Nav', confidence: 0.99, notes: null }
      })
    );

    // Top Header Bar
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 300, y: 20 },
        size: { width: 860, height: 70 },
        fill: '#1e293b',
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeWidth: 1,
        metadata: { semanticLabel: 'Top Header', userLabel: 'Top Bar', confidence: 0.98, notes: null }
      })
    );

    // 4 Metric Cards Row
    const metrics = spec?.content?.labels?.length ? spec.content.labels : ['Total Revenue ($84,200)', 'Active Users (14,250)', 'Conversion Rate (4.8%)', 'Growth Score (A+)'];
    metrics.slice(0, 4).forEach((m, idx) => {
      nodes.push(
        sceneGraph.createNode({
          kind: 'rectangle',
          position: { x: 300 + idx * 215, y: 110 },
          size: { width: 200, height: 110 },
          fill: '#1e293b',
          stroke: idx === 0 ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
          strokeWidth: idx === 0 ? 2 : 1,
          metadata: { semanticLabel: `Metric Card #${idx + 1}`, userLabel: m, confidence: 0.96, notes: null }
        })
      );
    });

    // Main Chart Panel
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 300, y: 240 },
        size: { width: 550, height: 460 },
        fill: '#0f172a',
        stroke: '#38bdf8',
        strokeWidth: 2,
        metadata: { semanticLabel: 'Analytics Chart Panel', userLabel: 'Analytics Chart', confidence: 0.98, notes: null }
      })
    );

    // Right Activity List
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 870, y: 240 },
        size: { width: 290, height: 460 },
        fill: '#1e293b',
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeWidth: 1,
        metadata: { semanticLabel: 'Activity Feed Table', userLabel: 'Recent Activity', confidence: 0.94, notes: null }
      })
    );

    return nodes;
  }

  // 3. SaaS Template
  private createSaaSTemplate(sceneGraph: SceneGraph, spec?: UIGenerationSpec): CanvasNode[] {
    return this.createLandingPageTemplate(sceneGraph, spec);
  }

  // 4. Ecommerce Template
  private createEcommerceTemplate(sceneGraph: SceneGraph, spec?: UIGenerationSpec): CanvasNode[] {
    const nodes: CanvasNode[] = [];

    // Store Navbar
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 40, y: 20 },
        size: { width: 1120, height: 75 },
        fill: '#0f172a',
        stroke: '#f472b6',
        strokeWidth: 2,
        metadata: { semanticLabel: 'Store Navbar', userLabel: 'Store Header', confidence: 0.99, notes: null }
      })
    );

    // Ecommerce Hero Banner
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 40, y: 110 },
        size: { width: 1120, height: 260 },
        fill: '#1e1b4b',
        stroke: '#6366f1',
        strokeWidth: 2,
        metadata: { semanticLabel: 'Hero Banner', userLabel: spec?.content?.headings?.[0] || 'Ecommerce Hero', confidence: 0.98, notes: null }
      })
    );

    // 6 Product Cards Grid with realistic product labels and prices
    const products = [
      { name: 'Wireless ANC Headphones', price: 199.99 },
      { name: 'Smart Fitness Watch Series 7', price: 299.99 },
      { name: 'Ultra-Wide 4K Studio Monitor', price: 499.99 },
      { name: 'Ergonomic Mechanical Keyboard', price: 149.99 },
      { name: 'Precision Wireless Mouse', price: 89.99 },
      { name: 'Studio Condenser Microphone', price: 179.99 }
    ];

    products.forEach((prod, idx) => {
      const r = Math.floor(idx / 3);
      const c = idx % 3;
      nodes.push(
        sceneGraph.createNode({
          kind: 'rectangle',
          position: { x: 40 + c * 385, y: 390 + r * 280 },
          size: { width: 350, height: 250 },
          fill: '#0f172a',
          stroke: 'rgba(244, 114, 182, 0.35)',
          strokeWidth: 1,
          metadata: {
            semanticLabel: `Product Card #${idx + 1}`,
            userLabel: `${prod.name} ($${prod.price})`,
            confidence: 0.97,
            notes: null
          }
        })
      );
    });

    return nodes;
  }

  // 5. Login Template
  private createLoginTemplate(sceneGraph: SceneGraph, spec?: UIGenerationSpec): CanvasNode[] {
    const nodes: CanvasNode[] = [];
    const title = spec?.content?.headings?.[0] || 'Centered Auth Container';

    // Centered Login Card
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 380, y: 100 },
        size: { width: 440, height: 500 },
        fill: '#1e293b',
        stroke: '#38bdf8',
        strokeWidth: 2,
        metadata: { semanticLabel: 'Login Card', userLabel: title, confidence: 0.99, notes: null }
      })
    );

    // Email Input Field
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 420, y: 220 },
        size: { width: 360, height: 48 },
        fill: '#0f172a',
        stroke: 'rgba(255, 255, 255, 0.2)',
        strokeWidth: 1,
        metadata: { semanticLabel: 'Email Input Field', userLabel: 'Email Input', confidence: 0.98, notes: null }
      })
    );

    // Password Input Field
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 420, y: 290 },
        size: { width: 360, height: 48 },
        fill: '#0f172a',
        stroke: 'rgba(255, 255, 255, 0.2)',
        strokeWidth: 1,
        metadata: { semanticLabel: 'Password Input Field', userLabel: 'Password Input', confidence: 0.98, notes: null }
      })
    );

    // Sign In Button
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 420, y: 370 },
        size: { width: 360, height: 50 },
        fill: '#0ea5e9',
        stroke: '#38bdf8',
        strokeWidth: 2,
        metadata: { semanticLabel: 'Sign In Action Button', userLabel: 'Submit Button', confidence: 0.99, notes: null }
      })
    );

    return nodes;
  }

  // 6. Signup Template
  private createSignupTemplate(sceneGraph: SceneGraph, spec?: UIGenerationSpec): CanvasNode[] {
    return this.createLoginTemplate(sceneGraph, spec);
  }

  // 7. Portfolio Template
  private createPortfolioTemplate(sceneGraph: SceneGraph, spec?: UIGenerationSpec): CanvasNode[] {
    return this.createLandingPageTemplate(sceneGraph, spec);
  }

  // 8. Blog Template
  private createBlogTemplate(sceneGraph: SceneGraph, spec?: UIGenerationSpec): CanvasNode[] {
    return this.createLandingPageTemplate(sceneGraph, spec);
  }

  // 9. Mobile App Template
  private createMobileAppTemplate(sceneGraph: SceneGraph, spec?: UIGenerationSpec): CanvasNode[] {
    const nodes: CanvasNode[] = [];

    // Mobile Phone Frame
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 410, y: 40 },
        size: { width: 380, height: 680 },
        fill: '#0f172a',
        stroke: '#38bdf8',
        strokeWidth: 3,
        metadata: { semanticLabel: 'Mobile Phone Container', userLabel: 'Mobile Viewport', confidence: 0.99, notes: null }
      })
    );

    // Header Card
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 430, y: 80 },
        size: { width: 340, height: 160 },
        fill: '#1e1b4b',
        stroke: '#6366f1',
        strokeWidth: 1,
        metadata: { semanticLabel: 'Mobile Hero Banner', userLabel: spec?.content?.headings?.[0] || 'Mobile Hero Card', confidence: 0.97, notes: null }
      })
    );

    // 4 App Action Grid Buttons
    [0, 1, 2, 3].forEach((idx) => {
      const row = Math.floor(idx / 2);
      const col = idx % 2;
      nodes.push(
        sceneGraph.createNode({
          kind: 'rectangle',
          position: { x: 430 + col * 175, y: 260 + row * 120 },
          size: { width: 160, height: 100 },
          fill: '#1e293b',
          stroke: 'rgba(255, 255, 255, 0.1)',
          strokeWidth: 1,
          metadata: { semanticLabel: `Action Tile #${idx + 1}`, userLabel: `App Action ${idx + 1}`, confidence: 0.95, notes: null }
        })
      );
    });

    // Bottom Navigation Bar
    nodes.push(
      sceneGraph.createNode({
        kind: 'rectangle',
        position: { x: 430, y: 640 },
        size: { width: 340, height: 60 },
        fill: '#1e293b',
        stroke: '#38bdf8',
        strokeWidth: 1,
        metadata: { semanticLabel: 'Mobile Bottom Navigation', userLabel: 'Bottom Nav', confidence: 0.98, notes: null }
      })
    );

    return nodes;
  }

  // 10. Admin Panel Template
  private createAdminPanelTemplate(sceneGraph: SceneGraph, spec?: UIGenerationSpec): CanvasNode[] {
    return this.createDashboardTemplate(sceneGraph, spec);
  }

  // 11. Pricing Template
  private createPricingTemplate(sceneGraph: SceneGraph, _spec?: UIGenerationSpec): CanvasNode[] {
    const nodes: CanvasNode[] = [];

    // 3 Tier Pricing Cards
    const tiers = ['Basic ($19/mo)', 'Pro ($49/mo Popular)', 'Enterprise ($99/mo)'];
    tiers.forEach((t, idx) => {
      nodes.push(
        sceneGraph.createNode({
          kind: 'rectangle',
          position: { x: 40 + idx * 385, y: 120 },
          size: { width: 350, height: 500 },
          fill: idx === 1 ? '#1e1b4b' : '#1e293b',
          stroke: idx === 1 ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
          strokeWidth: idx === 1 ? 2 : 1,
          metadata: { semanticLabel: `Pricing Card #${idx + 1}`, userLabel: t, confidence: 0.98, notes: null }
        })
      );
    });

    return nodes;
  }

  // Build canvas nodes based on prompt interpretation
  private buildPromptNodes(sceneGraph: SceneGraph, promptText: string): CanvasNode[] {
    const refs = this.referenceEngine.searchReferences(promptText);
    const ref = refs[0];

    if (ref.category === 'Dashboard') {
      return this.createDashboardTemplate(sceneGraph);
    } else if (ref.category === 'Ecommerce') {
      return this.createEcommerceTemplate(sceneGraph);
    } else if (ref.category === 'Login') {
      return this.createLoginTemplate(sceneGraph);
    } else {
      return this.createLandingPageTemplate(sceneGraph);
    }
  }

  // Build canvas nodes from uploaded screenshot image reconstruction
  private buildImageReconstructionNodes(sceneGraph: SceneGraph, elements: any[]): CanvasNode[] {
    const nodes: CanvasNode[] = [];

    elements.forEach((el, idx) => {
      const b = el.bounds || { x: 40, y: 40 + idx * 100, width: 600, height: 80 };
      nodes.push(
        sceneGraph.createNode({
          kind: 'rectangle',
          position: { x: b.x, y: b.y },
          size: { width: Math.max(80, b.width), height: Math.max(40, b.height) },
          fill: idx === 0 ? '#1e293b' : '#0f172a',
          stroke: '#38bdf8',
          strokeWidth: 1,
          metadata: {
            semanticLabel: el.type || 'ReconstructedComponent',
            userLabel: `Image Element #${idx + 1}`,
            confidence: 0.95,
            notes: null
          }
        })
      );
    });

    return nodes;
  }
}
