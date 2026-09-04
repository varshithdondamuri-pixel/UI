import { BlueprintNode } from '../planning/BlueprintTypes';

export class ComponentPlanner {
  /**
   * Maps a raw BlueprintNode into a high-level UI component type classification.
   * Examples: Navbar, Hero, Button, Card, Feature Grid, Pricing Card, Sidebar, Footer, Input, Search, Avatar, Modal, Table, Chart Placeholder, Container, Section.
   */
  public determineComponentType(node: BlueprintNode): string {
    const rawType = (node.type || '').toLowerCase();
    const childrenCount = node.children ? node.children.length : 0;

    if (rawType.includes('nav') || rawType.includes('header')) {
      return 'Navbar';
    }
    if (rawType.includes('hero')) {
      return 'Hero';
    }
    if (rawType.includes('sidebar')) {
      return 'Sidebar';
    }
    if (rawType.includes('footer')) {
      return 'Footer';
    }
    if (rawType.includes('pricing')) {
      return 'Pricing Card';
    }
    if (rawType.includes('feature') || rawType.includes('grid')) {
      return 'Feature Grid';
    }
    if (rawType.includes('card')) {
      return 'Card';
    }
    if (rawType.includes('button') || rawType === 'action') {
      return 'Button';
    }
    if (rawType.includes('input') || rawType.includes('form') || rawType === 'text-field') {
      return 'Input';
    }
    if (rawType.includes('search')) {
      return 'Search';
    }
    if (rawType.includes('avatar') || rawType.includes('profile')) {
      return 'Avatar';
    }
    if (rawType.includes('modal') || rawType.includes('dialog')) {
      return 'Modal';
    }
    if (rawType.includes('table') || rawType.includes('data-grid')) {
      return 'Table';
    }
    if (rawType.includes('chart') || rawType.includes('graph')) {
      return 'Chart Placeholder';
    }

    // Heuristics based on grid and children structure
    if (
      (node.gridRules.gridType === 'responsive_grid' ||
        node.gridRules.gridType === 'three_column' ||
        node.gridRules.gridType === 'four_column') &&
      childrenCount >= 2
    ) {
      return 'Feature Grid';
    }
    if (node.gridRules.gridType === 'split_layout' && childrenCount >= 2) {
      return 'Sidebar';
    }
    if (node.hierarchyLevel === 1) {
      return 'Section';
    }

    return childrenCount > 0 ? 'Container' : 'Card';
  }
}
