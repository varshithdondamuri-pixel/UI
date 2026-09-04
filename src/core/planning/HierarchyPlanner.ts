import { IntentNode } from '../recognition/RecognitionTypes';
import { HierarchyLevel } from './BlueprintTypes';

export class HierarchyPlanner {
  /**
   * Assign hierarchy level to a given node based on intent type and parent tree depth.
   */
  public determineHierarchyLevel(node: IntentNode, parentLevel: HierarchyLevel | null = null): HierarchyLevel {
    const type = node.type.toLowerCase();

    // Root page level is 0
    if (type.includes('page') || type.includes('landing_page')) {
      return 0;
    }

    // Top-level macro sections (Navbar, Hero, Header, Footer) -> Level 1
    if (
      type.includes('hero') ||
      type.includes('navbar') ||
      type.includes('header') ||
      type.includes('footer')
    ) {
      return 1;
    }

    // Major content sections (Features, Testimonials, CTA, Grid containers) -> Level 2
    if (
      type.includes('feature') ||
      type.includes('testimonial') ||
      type.includes('cta') ||
      type.includes('card_grid') ||
      type.includes('sidebar') ||
      type.includes('heading_section')
    ) {
      return 2;
    }

    // Child container components (Cards, Containers, Form groups) -> Level 3
    if (type.includes('card') || type.includes('container') || type.includes('group')) {
      return 3;
    }

    // Leaf elements (Buttons, Text blocks, Inputs, Images, Icons) -> Level 4
    if (
      type.includes('button') ||
      type.includes('text') ||
      type.includes('image') ||
      type.includes('icon') ||
      type.includes('input')
    ) {
      return 4;
    }

    // Default fallback based on parent level
    if (parentLevel !== null) {
      const nextLevel = (parentLevel + 1) as HierarchyLevel;
      return nextLevel <= 5 ? nextLevel : 5;
    }

    return 2;
  }
}
