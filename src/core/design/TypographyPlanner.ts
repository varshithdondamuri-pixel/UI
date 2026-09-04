import { DesignSystem, TypographyScale } from './DesignTypes';

export class TypographyPlanner {
  /**
   * Generates a complete typographic scale with font families, size ratios, line heights,
   * letter spacing, and hierarchy definitions based on the active DesignSystem.
   */
  public generateTypographyScale(designSystem: DesignSystem): TypographyScale {
    const ratio = designSystem.structuralRules.typographyScaleRatio || 1.25;
    const baseSize = 16; // 16px baseline

    // Compute sizes using modular scale ratio
    const bodySize = baseSize;
    const bodyLgSize = Math.round(baseSize * 1.125);
    const h4Size = Math.round(baseSize * ratio);
    const h3Size = Math.round(baseSize * Math.pow(ratio, 2));
    const h2Size = Math.round(baseSize * Math.pow(ratio, 3));
    const h1Size = Math.round(baseSize * Math.pow(ratio, 4));
    const displaySize = Math.round(baseSize * Math.pow(ratio, 5));
    const captionSize = Math.round(baseSize * 0.75);
    const buttonSize = Math.round(baseSize * 0.875);

    // Font stack selection (System / Web standard, no commercial fonts)
    let fontFamilyHeadings = "'Inter', system-ui, -apple-system, sans-serif";
    let fontFamilyBody = "'Inter', system-ui, -apple-system, sans-serif";

    if (designSystem.id === 'apple-inspired') {
      fontFamilyHeadings = "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif";
      fontFamilyBody = "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif";
    } else if (designSystem.id === 'neobrutalist') {
      fontFamilyHeadings = "'Space Grotesk', 'Impact', sans-serif";
      fontFamilyBody = "'JetBrains Mono', 'Courier New', monospace";
    } else if (designSystem.id === 'material') {
      fontFamilyHeadings = "'Roboto', 'Helvetica', sans-serif";
      fontFamilyBody = "'Roboto', 'Helvetica', sans-serif";
    }

    return {
      baseSize,
      scaleRatio: ratio,
      fontFamilyHeadings,
      fontFamilyBody,
      styles: {
        display: {
          fontSize: `${displaySize}px`,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          hierarchy: 'display'
        },
        headingScale: [
          {
            fontSize: `${h1Size}px`,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            hierarchy: 'h1'
          },
          {
            fontSize: `${h2Size}px`,
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-0.015em',
            hierarchy: 'h2'
          },
          {
            fontSize: `${h3Size}px`,
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            hierarchy: 'h3'
          },
          {
            fontSize: `${h4Size}px`,
            fontWeight: 600,
            lineHeight: 1.35,
            letterSpacing: '0em',
            hierarchy: 'h4'
          }
        ],
        bodyScale: [
          {
            fontSize: `${bodyLgSize}px`,
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0em',
            hierarchy: 'body-lg'
          },
          {
            fontSize: `${bodySize}px`,
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0em',
            hierarchy: 'body'
          }
        ],
        buttonText: {
          fontSize: `${buttonSize}px`,
          fontWeight: 600,
          lineHeight: 1.4,
          letterSpacing: '0.01em',
          hierarchy: 'button'
        },
        caption: {
          fontSize: `${captionSize}px`,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: '0.02em',
          hierarchy: 'caption'
        }
      }
    };
  }
}
