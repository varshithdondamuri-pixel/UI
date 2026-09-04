import {
  IntentCandidate,
  IntentNode,
  IntentPriority,
  IntentTree,
  SemanticNode,
  SemanticTree
} from './RecognitionTypes';

export class IntentTreeBuilder {
  /**
   * Transforms a Semantic Tree ("What did the user draw?")
   * into an Intent Tree ("What is the user trying to build?").
   * Completely independent from SemanticTreeBuilder.
   */
  public buildIntentTree(semanticTree: SemanticTree): IntentTree {
    let intentNodeCounter = 1;

    const convertSemanticToIntentNode = (semNode: SemanticNode): IntentNode => {
      let intentType = 'content_block';
      let purpose = 'Display general layout content';
      let priority: IntentPriority = 'medium';
      let confidence = semNode.confidence;
      let possibleVariants: string[] = ['Standard Boxed', 'Full Width'];
      let candidates: IntentCandidate[] = [];

      switch (semNode.type) {
        case 'page':
          intentType = 'landing_page';
          purpose = 'Full page layout container';
          priority = 'critical';
          confidence = 0.95;
          possibleVariants = ['Single Page Scroll', 'Multi-page Shell', 'Dashboard Layout'];
          candidates = [
            { type: 'landing_page', confidence: 0.95, reason: 'Top-level container with multiple sub-sections' },
            { type: 'dashboard_app', confidence: 0.72, reason: 'Structured multi-panel layout' },
            { type: 'web_application', confidence: 0.65, reason: 'Generic interactive web interface' }
          ];
          break;

        case 'navbar':
          intentType = 'navigation_header';
          purpose = 'Navigation';
          priority = 'critical';
          confidence = semNode.confidence;
          possibleVariants = ['Sticky Top', 'Floating Pill', 'Standard Full-width', 'Transparent Overlay'];
          candidates = [
            { type: 'navigation_header', confidence: semNode.confidence, reason: 'Horizontal bar at top of layout' },
            { type: 'top_notification_banner', confidence: Math.max(0.4, semNode.confidence - 0.25), reason: 'Wide top banner bar' }
          ];
          break;

        case 'hero':
          intentType = 'hero_section';
          purpose = 'Introduce Product';
          priority = 'high';
          confidence = semNode.confidence;
          possibleVariants = ['Centered', 'Split', 'Image Left', 'Image Right', 'Video Background'];
          candidates = [
            { type: 'hero_section', confidence: semNode.confidence, reason: 'Prominent top visual section' },
            { type: 'welcome_banner', confidence: Math.max(0.4, semNode.confidence - 0.18), reason: 'Large introductory banner' }
          ];
          break;

        case 'card_grid':
          intentType = 'feature_grid';
          purpose = 'Present Features';
          priority = 'high';
          confidence = semNode.confidence;
          possibleVariants = ['2 Column', '3 Column', '4 Column', 'Carousel', 'Cards'];
          candidates = [
            { type: 'feature_grid', confidence: semNode.confidence, reason: 'Array of structured cards' },
            { type: 'pricing_section', confidence: Math.max(0.4, semNode.confidence - 0.1), reason: 'Multi-column comparisons' },
            { type: 'gallery', confidence: Math.max(0.4, semNode.confidence - 0.25), reason: 'Grid of media or images' }
          ];
          break;

        case 'card':
          intentType = 'content_card';
          purpose = 'Highlight specific content unit';
          priority = 'medium';
          confidence = semNode.confidence;
          possibleVariants = ['Standard Card', 'Elevated Shadow', 'Bordered Minimal', 'Interactive Hover'];
          candidates = [
            { type: 'content_card', confidence: semNode.confidence, reason: 'Self-contained content box' },
            { type: 'pricing_card', confidence: Math.max(0.4, semNode.confidence - 0.15), reason: 'Container with text/button' }
          ];
          break;

        case 'button':
          intentType = 'call_to_action';
          purpose = 'Drive User Action';
          priority = 'high';
          confidence = semNode.confidence;
          possibleVariants = ['Primary Solid', 'Outline Pill', 'Ghost', 'Icon Button'];
          candidates = [
            { type: 'call_to_action', confidence: semNode.confidence, reason: 'Shape associated with actionable text' },
            { type: 'form_submit', confidence: Math.max(0.4, semNode.confidence - 0.14), reason: 'Clickable input action' }
          ];
          break;

        case 'heading_section':
          intentType = 'section_header';
          purpose = 'Introduce section topic';
          priority = 'medium';
          confidence = semNode.confidence;
          possibleVariants = ['Left Aligned', 'Centered Title + Subtitle', 'Badge + Title'];
          candidates = [
            { type: 'section_header', confidence: semNode.confidence, reason: 'Text positioned above content section' },
            { type: 'title_banner', confidence: Math.max(0.4, semNode.confidence - 0.15), reason: 'Heading block' }
          ];
          break;

        case 'sidebar':
          intentType = 'sidebar_navigation';
          purpose = 'Secondary Navigation';
          priority = 'medium';
          confidence = semNode.confidence;
          possibleVariants = ['Left', 'Right', 'Collapsed', 'Expanded'];
          candidates = [
            { type: 'sidebar_navigation', confidence: semNode.confidence, reason: 'Tall vertical side panel' },
            { type: 'filter_panel', confidence: Math.max(0.4, semNode.confidence - 0.15), reason: 'Side filter options' }
          ];
          break;

        case 'footer':
          intentType = 'footer_section';
          purpose = 'Secondary Navigation';
          priority = 'low';
          confidence = semNode.confidence;
          possibleVariants = ['Simple Bar', 'Multi-column Links', 'Fat Footer with Form'];
          candidates = [
            { type: 'footer_section', confidence: semNode.confidence, reason: 'Wide section at layout bottom' },
            { type: 'bottom_bar', confidence: Math.max(0.4, semNode.confidence - 0.18), reason: 'Bottom copyright bar' }
          ];
          break;

        case 'text_block':
          intentType = 'text_content';
          purpose = 'Display textual information';
          priority = 'low';
          confidence = semNode.confidence;
          possibleVariants = ['Body Text', 'Lead Paragraph', 'Caption'];
          candidates = [
            { type: 'text_content', confidence: semNode.confidence, reason: 'Raw text node' }
          ];
          break;

        default:
          intentType = 'content_block';
          purpose = 'Generic content container';
          priority = 'low';
          confidence = semNode.confidence;
          possibleVariants = ['Default Container', 'Bordered Panel'];
          candidates = [
            { type: 'content_block', confidence: semNode.confidence, reason: 'Unclassified geometric shape' }
          ];
          break;
      }

      // Convert child semantic nodes recursively
      const childIntentNodes = (semNode.children || []).map((child) =>
        convertSemanticToIntentNode(child)
      );

      return {
        id: `intent-${intentNodeCounter++}-${semNode.id}`,
        type: intentType,
        purpose,
        priority,
        confidence: Math.round(confidence * 100) / 100,
        possibleVariants,
        candidates: candidates.map((c) => ({
          ...c,
          confidence: Math.round(c.confidence * 100) / 100
        })),
        children: childIntentNodes,
        sourceSemanticNodes: [semNode.id, ...semNode.sourceNodes],
        metadata: {
          originalSemanticType: semNode.type,
          ...semNode.metadata
        }
      };
    };

    const rootIntentNode = convertSemanticToIntentNode(semanticTree.root);

    const countIntentNodes = (node: IntentNode): number => {
      return 1 + node.children.reduce((sum, child) => sum + countIntentNodes(child), 0);
    };

    return {
      root: rootIntentNode,
      timestamp: Date.now(),
      totalNodeCount: countIntentNodes(rootIntentNode)
    };
  }
}
