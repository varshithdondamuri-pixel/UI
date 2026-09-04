import { DesignSystem, DesignSystemType } from './DesignTypes';

export class DesignSystemEngine {
  private systems: Map<DesignSystemType, DesignSystem> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.systems.set('minimal', {
      id: 'minimal',
      name: 'Minimal',
      description: 'Ultra-clean layout focused on typography, whitespace, and high clarity.',
      structuralRules: {
        borderRadiusScale: { xs: '0px', sm: '2px', md: '4px', lg: '8px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 1, medium: 1, thick: 2 },
        shadowScale: {
          0: 'none',
          1: '0 1px 2px rgba(0,0,0,0.05)',
          2: '0 2px 4px rgba(0,0,0,0.08)',
          3: '0 4px 8px rgba(0,0,0,0.1)',
          4: '0 8px 16px rgba(0,0,0,0.12)',
          5: '0 16px 24px rgba(0,0,0,0.14)'
        },
        defaultGlassmorphism: false,
        useVibrantGradients: false,
        compactness: 'comfortable',
        typographyScaleRatio: 1.25 // Major Third
      }
    });

    this.systems.set('modern-saas', {
      id: 'modern-saas',
      name: 'Modern SaaS',
      description: 'Sleek, product-focused visual language with rounded corners and subtle shadows.',
      structuralRules: {
        borderRadiusScale: { xs: '4px', sm: '6px', md: '10px', lg: '16px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 1, medium: 1, thick: 2 },
        shadowScale: {
          0: 'none',
          1: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
          2: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
          3: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          4: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          5: '0 25px 50px -12px rgba(0,0,0,0.25)'
        },
        defaultGlassmorphism: false,
        useVibrantGradients: true,
        compactness: 'comfortable',
        typographyScaleRatio: 1.25
      }
    });

    this.systems.set('enterprise', {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'High-density information layout with structured borders and conservative tones.',
      structuralRules: {
        borderRadiusScale: { xs: '2px', sm: '4px', md: '6px', lg: '8px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 1, medium: 2, thick: 3 },
        shadowScale: {
          0: 'none',
          1: '0 1px 2px rgba(0,0,0,0.06)',
          2: '0 2px 4px rgba(0,0,0,0.08)',
          3: '0 4px 6px rgba(0,0,0,0.1)',
          4: '0 6px 12px rgba(0,0,0,0.12)',
          5: '0 10px 20px rgba(0,0,0,0.15)'
        },
        defaultGlassmorphism: false,
        useVibrantGradients: false,
        compactness: 'compact',
        typographyScaleRatio: 1.2 // Minor Third
      }
    });

    this.systems.set('apple-inspired', {
      id: 'apple-inspired',
      name: 'Apple Inspired',
      description: 'Fluid, continuous curves, refined typography, and glass backdrop filters.',
      structuralRules: {
        borderRadiusScale: { xs: '6px', sm: '10px', md: '16px', lg: '24px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 1, medium: 1, thick: 2 },
        shadowScale: {
          0: 'none',
          1: '0 2px 8px rgba(0,0,0,0.08)',
          2: '0 4px 16px rgba(0,0,0,0.12)',
          3: '0 8px 24px rgba(0,0,0,0.16)',
          4: '0 16px 36px rgba(0,0,0,0.2)',
          5: '0 24px 48px rgba(0,0,0,0.25)'
        },
        defaultGlassmorphism: true,
        useVibrantGradients: false,
        compactness: 'spacious',
        typographyScaleRatio: 1.25
      }
    });

    this.systems.set('stripe-inspired', {
      id: 'stripe-inspired',
      name: 'Stripe Inspired',
      description: 'Rich vibrant gradients, crisp multi-layered elevation, and high visual contrast.',
      structuralRules: {
        borderRadiusScale: { xs: '4px', sm: '8px', md: '12px', lg: '20px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 1, medium: 1, thick: 2 },
        shadowScale: {
          0: 'none',
          1: '0 2px 5px rgba(50,50,93,0.1), 0 1px 1px rgba(0,0,0,0.07)',
          2: '0 6px 12px -2px rgba(50,50,93,0.15), 0 3px 7px -3px rgba(0,0,0,0.12)',
          3: '0 13px 27px -5px rgba(50,50,93,0.2), 0 8px 16px -8px rgba(0,0,0,0.15)',
          4: '0 30px 60px -12px rgba(50,50,93,0.25), 0 18px 36px -18px rgba(0,0,0,0.2)',
          5: '0 50px 100px -20px rgba(50,50,93,0.3), 0 30px 60px -30px rgba(0,0,0,0.25)'
        },
        defaultGlassmorphism: false,
        useVibrantGradients: true,
        compactness: 'comfortable',
        typographyScaleRatio: 1.333 // Perfect Fourth
      }
    });

    this.systems.set('linear-inspired', {
      id: 'linear-inspired',
      name: 'Linear Inspired',
      description: 'Dark-first precision interface with sharp focus rings and subtle borders.',
      structuralRules: {
        borderRadiusScale: { xs: '2px', sm: '4px', md: '8px', lg: '12px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 1, medium: 1, thick: 2 },
        shadowScale: {
          0: 'none',
          1: '0 1px 2px rgba(0,0,0,0.3)',
          2: '0 4px 12px rgba(0,0,0,0.4)',
          3: '0 8px 24px rgba(0,0,0,0.5)',
          4: '0 16px 32px rgba(0,0,0,0.6)',
          5: '0 24px 48px rgba(0,0,0,0.7)'
        },
        defaultGlassmorphism: true,
        useVibrantGradients: false,
        compactness: 'compact',
        typographyScaleRatio: 1.2
      }
    });

    this.systems.set('dashboard', {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Card-centric analytics framework built for high metric density.',
      structuralRules: {
        borderRadiusScale: { xs: '4px', sm: '6px', md: '10px', lg: '14px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 1, medium: 1, thick: 2 },
        shadowScale: {
          0: 'none',
          1: '0 1px 3px rgba(0,0,0,0.05)',
          2: '0 3px 6px rgba(0,0,0,0.08)',
          3: '0 6px 12px rgba(0,0,0,0.1)',
          4: '0 12px 24px rgba(0,0,0,0.12)',
          5: '0 20px 32px rgba(0,0,0,0.15)'
        },
        defaultGlassmorphism: false,
        useVibrantGradients: false,
        compactness: 'compact',
        typographyScaleRatio: 1.2
      }
    });

    this.systems.set('mobile-first', {
      id: 'mobile-first',
      name: 'Mobile First',
      description: 'Touch-optimized layout with exaggerated target padding and rounded elements.',
      structuralRules: {
        borderRadiusScale: { xs: '6px', sm: '12px', md: '18px', lg: '24px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 1, medium: 2, thick: 3 },
        shadowScale: {
          0: 'none',
          1: '0 2px 4px rgba(0,0,0,0.08)',
          2: '0 4px 8px rgba(0,0,0,0.1)',
          3: '0 8px 16px rgba(0,0,0,0.12)',
          4: '0 12px 24px rgba(0,0,0,0.15)',
          5: '0 20px 40px rgba(0,0,0,0.2)'
        },
        defaultGlassmorphism: false,
        useVibrantGradients: true,
        compactness: 'spacious',
        typographyScaleRatio: 1.25
      }
    });

    this.systems.set('glass', {
      id: 'glass',
      name: 'Glassmorphism',
      description: 'Layered translucent surfaces with glowing specular borders and blur effects.',
      structuralRules: {
        borderRadiusScale: { xs: '8px', sm: '12px', md: '20px', lg: '28px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 1, medium: 1, thick: 2 },
        shadowScale: {
          0: 'none',
          1: '0 4px 12px rgba(0,0,0,0.1)',
          2: '0 8px 24px rgba(0,0,0,0.15)',
          3: '0 16px 36px rgba(0,0,0,0.2)',
          4: '0 24px 48px rgba(0,0,0,0.25)',
          5: '0 32px 64px rgba(0,0,0,0.3)'
        },
        defaultGlassmorphism: true,
        useVibrantGradients: true,
        compactness: 'spacious',
        typographyScaleRatio: 1.25
      }
    });

    this.systems.set('neobrutalist', {
      id: 'neobrutalist',
      name: 'Neobrutalist',
      description: 'Bold black outlines, hard offset drop shadows, and high contrast color blocks.',
      structuralRules: {
        borderRadiusScale: { xs: '0px', sm: '2px', md: '4px', lg: '8px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 2, medium: 3, thick: 4 },
        shadowScale: {
          0: 'none',
          1: '2px 2px 0px #000000',
          2: '4px 4px 0px #000000',
          3: '6px 6px 0px #000000',
          4: '8px 8px 0px #000000',
          5: '12px 12px 0px #000000'
        },
        defaultGlassmorphism: false,
        useVibrantGradients: false,
        compactness: 'comfortable',
        typographyScaleRatio: 1.333
      }
    });

    this.systems.set('material', {
      id: 'material',
      name: 'Material',
      description: 'Tactile surface elevation, rounded pills, and explicit layered shadows.',
      structuralRules: {
        borderRadiusScale: { xs: '4px', sm: '8px', md: '12px', lg: '28px', full: '9999px' },
        borderWidthScale: { none: 0, thin: 1, medium: 1, thick: 2 },
        shadowScale: {
          0: 'none',
          1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
          3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
          4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
          5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)'
        },
        defaultGlassmorphism: false,
        useVibrantGradients: false,
        compactness: 'comfortable',
        typographyScaleRatio: 1.25
      }
    });
  }

  public getDesignSystem(id: DesignSystemType): DesignSystem {
    return this.systems.get(id) || this.systems.get('modern-saas')!;
  }

  public getAllDesignSystems(): DesignSystem[] {
    return Array.from(this.systems.values());
  }
}
