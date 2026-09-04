import { LayoutBlueprint, BlueprintNode } from '../planning/BlueprintTypes';
import { AccessibilityPlanner } from './AccessibilityPlanner';
import { AnimationPlanner } from './AnimationPlanner';
import { ColorPlanner } from './ColorPlanner';
import { ComponentPlanner } from './ComponentPlanner';
import {
  ColorTokens,
  DesignSystem,
  SpacingSystem,
  ThemeMetadata,
  TypographyScale,
  VisualDesignOption,
  VisualNode
} from './DesignTypes';
import { DesignValidator } from './DesignValidator';
import { ElevationPlanner } from './ElevationPlanner';
import { IconPlanner } from './IconPlanner';
import { IllustrationPlanner } from './IllustrationPlanner';
import { SpacingEngine } from './SpacingEngine';
import { TypographyPlanner } from './TypographyPlanner';

export class VisualModelBuilder {
  private componentPlanner = new ComponentPlanner();
  private colorPlanner = new ColorPlanner();
  private typographyPlanner = new TypographyPlanner();
  private spacingEngine = new SpacingEngine();
  private elevationPlanner = new ElevationPlanner();
  private iconPlanner = new IconPlanner();
  private illustrationPlanner = new IllustrationPlanner();
  private animationPlanner = new AnimationPlanner();
  private accessibilityPlanner = new AccessibilityPlanner();
  private validator = new DesignValidator();

  /**
   * Constructs a single VisualDesignOption (e.g. Option A, Option B, or Option C)
   * from a LayoutBlueprint and specific DesignSystem + ThemeMetadata parameters.
   */
  public buildOption(
    optionId: string,
    optionName: string,
    description: string,
    blueprint: LayoutBlueprint,
    designSystem: DesignSystem,
    theme: ThemeMetadata
  ): VisualDesignOption {
    this.accessibilityPlanner.resetCounters();

    const colorTokens = this.colorPlanner.generateColorTokens(designSystem, theme);
    const typographyScale = this.typographyPlanner.generateTypographyScale(designSystem);
    const spacingSystem = this.spacingEngine.generateSpacingSystem(designSystem);
    const elevationPlan = this.elevationPlanner.generateElevationPlan(designSystem);

    const rootVisualNode = this.convertBlueprintNode(
      blueprint.root,
      designSystem,
      theme,
      colorTokens,
      typographyScale,
      spacingSystem,
      elevationPlan
    );

    const animationPlan = this.animationPlanner.generateOptionAnimationPlan(designSystem);
    const accessibilitySummary = this.accessibilityPlanner.calculateSummary(rootVisualNode);
    const validation = this.validator.validate(rootVisualNode);

    return {
      id: optionId,
      name: optionName,
      description,
      designSystem,
      theme,
      colorTokens,
      typographyScale,
      spacingSystem,
      rootNode: rootVisualNode,
      animationPlan,
      accessibilitySummary,
      validation
    };
  }

  private convertBlueprintNode(
    bpNode: BlueprintNode,
    designSystem: DesignSystem,
    theme: ThemeMetadata,
    colorTokens: ColorTokens,
    typographyScale: TypographyScale,
    spacingSystem: SpacingSystem,
    elevationPlan: any
  ): VisualNode {
    const componentType = this.componentPlanner.determineComponentType(bpNode);
    const elevation = this.elevationPlanner.determineElevation(componentType, bpNode.hierarchyLevel);
    const elevationMeta = elevationPlan.levels[elevation] || elevationPlan.levels[0];

    const icon = this.iconPlanner.planIcon(componentType, designSystem);
    const illustration = this.illustrationPlanner.planIllustration(componentType);
    const animation = this.animationPlanner.planAnimation(componentType, designSystem);

    // Padding & spacing resolution
    const pad = bpNode.spacingRules.contentPadding || { top: 16, right: 16, bottom: 16, left: 16 };
    const padding = {
      top: pad.top,
      right: pad.right,
      bottom: pad.bottom,
      left: pad.left
    };
    const margin = spacingSystem.margins;
    const spacing = {
      sectionSpacing: bpNode.spacingRules.sectionSpacing || spacingSystem.sectionSpacing,
      internalSpacing: bpNode.spacingRules.internalSpacing || spacingSystem.componentSpacing,
      gap: bpNode.gridRules.gap || 16
    };

    // Style token calculation
    const isNeobrutalist = designSystem.id === 'neobrutalist';
    const isGlass = designSystem.structuralRules.defaultGlassmorphism;
    const isDark = theme.mode === 'dark';

    const borderRadius =
      componentType === 'Button' || componentType === 'Avatar'
        ? designSystem.structuralRules.borderRadiusScale['full'] || '9999px'
        : designSystem.structuralRules.borderRadiusScale['md'] || '8px';

    const borderWidth =
      isNeobrutalist ? 3 : bpNode.hierarchyLevel === 1 ? 0 : designSystem.structuralRules.borderWidthScale['thin'] || 1;
    const borderStyle = isNeobrutalist ? 'solid' : 'solid';
    const borderColor = isNeobrutalist ? '#000000' : colorTokens.border;

    // Background calculation
    let bgType: 'solid' | 'gradient' | 'glass' = 'solid';
    let bgColor = colorTokens.surface;
    let bgGradient: string | undefined = undefined;
    let backdropFilter: string | undefined = elevationMeta.backdropFilter;

    if (componentType === 'Hero' && designSystem.structuralRules.useVibrantGradients) {
      bgType = 'gradient';
      bgGradient = isDark
        ? `linear-gradient(135deg, ${colorTokens.surface} 0%, ${colorTokens.primary}22 100%)`
        : `linear-gradient(135deg, ${colorTokens.surface} 0%, ${colorTokens.primary}15 100%)`;
    } else if (isGlass && (componentType === 'Card' || componentType === 'Navbar' || componentType === 'Modal')) {
      bgType = 'glass';
      bgColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.65)';
      backdropFilter = 'blur(16px)';
    } else if (componentType === 'Button') {
      bgColor = colorTokens.primary;
    } else if (bpNode.hierarchyLevel === 1) {
      bgColor = colorTokens.background;
    }

    // Foreground & typography calculation
    const fgColor = componentType === 'Button' ? '#ffffff' : colorTokens.text;
    const mutedColor = colorTokens.textMuted;

    let typographyStyle = typographyScale.styles.bodyScale[1]; // Body
    if (componentType === 'Hero') {
      typographyStyle = typographyScale.styles.display;
    } else if (bpNode.hierarchyLevel === 1) {
      typographyStyle = typographyScale.styles.headingScale[0]; // H1
    } else if (bpNode.hierarchyLevel === 2) {
      typographyStyle = typographyScale.styles.headingScale[1]; // H2
    } else if (componentType === 'Button') {
      typographyStyle = typographyScale.styles.buttonText;
    } else if (componentType === 'Caption') {
      typographyStyle = typographyScale.styles.caption;
    }

    const accessibility = this.accessibilityPlanner.planNodeAccessibility(
      componentType,
      { width: bpNode.constraints.preferredWidth || 300, height: 100 },
      colorTokens
    );

    const designTokens: Record<string, string | number> = {
      '--node-bg': bgColor,
      '--node-fg': fgColor,
      '--node-border': borderColor,
      '--node-radius': borderRadius,
      '--node-shadow': elevationMeta.shadow,
      '--node-elevation': elevation
    };

    const childrenVisualNodes = bpNode.children
      ? bpNode.children.map((childBp) =>
          this.convertBlueprintNode(
            childBp,
            designSystem,
            theme,
            colorTokens,
            typographyScale,
            spacingSystem,
            elevationPlan
          )
        )
      : [];

    return {
      id: `vnode-${bpNode.id}`,
      componentType,
      layoutReference: bpNode.id,
      bounds: {
        minX: 0,
        minY: 0,
        maxX: bpNode.constraints.preferredWidth || 300,
        maxY: 100,
        width: bpNode.constraints.preferredWidth || 300,
        height: 100
      },
      spacing,
      padding,
      margin,
      borderRadius,
      border: {
        width: borderWidth,
        style: borderStyle,
        color: borderColor
      },
      background: {
        type: bgType,
        color: bgColor,
        gradient: bgGradient,
        backdropFilter
      },
      foreground: {
        color: fgColor,
        mutedColor
      },
      typography: typographyStyle,
      icon,
      illustration,
      shadow: elevationMeta.shadow,
      elevation,
      animation,
      responsiveRules: bpNode.responsiveRules,
      accessibility,
      designTokens,
      children: childrenVisualNodes,
      confidence: bpNode.confidence || 0.9
    };
  }
}
