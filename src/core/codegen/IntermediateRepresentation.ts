import { VisualDesignModel, VisualNode } from '../design/DesignTypes';
import { RenderTree } from '../rendering/RenderTree';
import { IRNode, IRTree } from './CodeGenerationTypes';

export class IntermediateRepresentationBuilder {
  public buildIR(
    visualModel: VisualDesignModel | null,
    renderTree: RenderTree | null
  ): IRTree {
    const timestamp = Date.now();
    let totalNodes = 0;
    const componentTypesSet = new Set<string>();

    const rootVisualNode = visualModel?.activeOption?.rootNode || visualModel?.rootNode;

    let rootIRNode: IRNode;

    if (rootVisualNode) {
      rootIRNode = this.convertVisualNodeToIRNode(rootVisualNode, componentTypesSet);
      totalNodes = this.countNodes(rootIRNode);
    } else if (renderTree && renderTree.root) {
      rootIRNode = {
        id: renderTree.root.id,
        componentType: renderTree.root.componentType || 'Container',
        name: 'AppLayout',
        props: { title: 'Generated Application' },
        children: [],
        layout: {
          bounds: renderTree.root.bounds || { minX: 0, minY: 0, maxX: 1200, maxY: 800, width: 1200, height: 800 },
          direction: 'vertical',
          gap: 16,
          padding: { top: 16, right: 16, bottom: 16, left: 16 }
        },
        styles: { backgroundColor: '#FFFFFF' },
        tailwindClasses: ['min-h-screen', 'bg-white', 'text-slate-900'],
        tokens: { primary: '#3B82F6', font: 'Inter, sans-serif' },
        responsiveRules: { desktop: { direction: 'flex-col' } },
        accessibility: { ariaRole: 'main', semanticTag: 'main' }
      };
      totalNodes = 1;
      componentTypesSet.add(rootIRNode.componentType);
    } else {
      // Default fallback IR Page
      rootIRNode = this.createDefaultIRPage();
      totalNodes = this.countNodes(rootIRNode);
      componentTypesSet.add('Page').add('Navbar').add('Hero').add('FeatureGrid').add('Footer');
    }

    return {
      id: `ir_tree_${timestamp}`,
      root: rootIRNode,
      totalNodeCount: totalNodes,
      componentTypes: Array.from(componentTypesSet),
      timestamp
    };
  }

  private convertVisualNodeToIRNode(node: VisualNode, componentTypesSet: Set<string>): IRNode {
    const normalizedType = this.sanitizeComponentName(node.componentType);
    componentTypesSet.add(normalizedType);

    const semanticTag = this.getSemanticTagForType(normalizedType);
    const ariaRole = this.getAriaRoleForType(normalizedType);

    const children = (node.children || []).map((child) =>
      this.convertVisualNodeToIRNode(child, componentTypesSet)
    );

    const tailwindClasses = this.buildTailwindClasses(node, normalizedType);

    return {
      id: node.id || `node_${Math.random().toString(36).substring(2, 7)}`,
      componentType: normalizedType,
      name: `${normalizedType}Component`,
      props: {
        label: node.icon?.suggestedName || node.componentType,
        elevation: node.elevation || 0
      },
      children,
      layout: {
        bounds: node.bounds || { minX: 0, minY: 0, maxX: 400, maxY: 100, width: 400, height: 100 },
        direction: 'vertical',
        gap: node.spacing?.gap || 16,
        padding: node.padding || { top: 16, right: 16, bottom: 16, left: 16 }
      },
      styles: {
        backgroundColor: node.background?.color || '#FFFFFF',
        color: node.foreground?.color || '#0F172A',
        borderRadius: String(node.borderRadius || '8px')
      },
      tailwindClasses,
      tokens: {
        primary: node.background?.color || '#3B82F6',
        text: node.foreground?.color || '#0F172A'
      },
      responsiveRules: {
        desktop: { display: 'flex', flexDirection: 'column' },
        mobile: { display: 'flex', flexDirection: 'column' }
      },
      accessibility: {
        ariaRole: node.accessibility?.ariaRole || ariaRole,
        ariaLabel: node.accessibility?.ariaLabel || `${normalizedType} Section`,
        semanticTag
      },
      sourceVisualNode: node
    };
  }

  private sanitizeComponentName(type: string): string {
    if (!type) return 'Card';
    const clean = type.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean) return 'Card';
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  private getSemanticTagForType(type: string): string {
    const map: Record<string, string> = {
      Navbar: 'nav',
      Header: 'header',
      Hero: 'section',
      FeatureGrid: 'section',
      Card: 'article',
      Sidebar: 'aside',
      Footer: 'footer',
      Button: 'button',
      Input: 'input',
      Modal: 'dialog',
      Table: 'table'
    };
    return map[type] || 'div';
  }

  private getAriaRoleForType(type: string): string {
    const map: Record<string, string> = {
      Navbar: 'navigation',
      Header: 'banner',
      Hero: 'region',
      Sidebar: 'complementary',
      Footer: 'contentinfo',
      Button: 'button',
      Input: 'textbox',
      Modal: 'dialog'
    };
    return map[type] || 'region';
  }

  private buildTailwindClasses(_node: VisualNode, type: string): string[] {
    const classes: string[] = ['w-full'];

    if (type === 'Navbar' || type === 'Header') {
      classes.push('bg-white', 'dark:bg-slate-900', 'border-b', 'border-slate-200', 'px-6', 'py-4', 'flex', 'items-center', 'justify-between');
    } else if (type === 'Hero') {
      classes.push('py-16', 'px-8', 'bg-gradient-to-r', 'from-blue-600', 'to-indigo-700', 'text-white', 'rounded-2xl', 'shadow-xl');
    } else if (type === 'Card') {
      classes.push('p-6', 'bg-white', 'dark:bg-slate-800', 'rounded-xl', 'shadow-sm', 'hover:shadow-md', 'transition-shadow', 'border', 'border-slate-100');
    } else if (type === 'Button') {
      classes.push('px-5', 'py-2.5', 'bg-blue-600', 'hover:bg-blue-700', 'text-white', 'font-medium', 'rounded-lg', 'shadow-sm', 'transition-colors');
    } else if (type === 'Footer') {
      classes.push('py-8', 'px-6', 'bg-slate-900', 'text-slate-400', 'border-t', 'border-slate-800', 'mt-12');
    } else {
      classes.push('p-4', 'rounded-lg', 'bg-slate-50', 'border', 'border-slate-200');
    }

    return classes;
  }

  private createDefaultIRPage(): IRNode {
    return {
      id: 'ir_root_page',
      componentType: 'Page',
      name: 'MainDashboardPage',
      props: { title: 'Dashboard Application' },
      layout: {
        bounds: { minX: 0, minY: 0, maxX: 1200, maxY: 900, width: 1200, height: 900 },
        direction: 'vertical',
        gap: 24,
        padding: { top: 24, right: 24, bottom: 24, left: 24 }
      },
      styles: { backgroundColor: '#F8FAFC' },
      tailwindClasses: ['min-h-screen', 'bg-slate-50', 'text-slate-900', 'flex', 'flex-col'],
      tokens: { primary: '#3B82F6', background: '#F8FAFC' },
      responsiveRules: { desktop: { display: 'flex', flexDirection: 'column' } },
      accessibility: { ariaRole: 'main', semanticTag: 'main' },
      children: [
        {
          id: 'ir_navbar',
          componentType: 'Navbar',
          name: 'TopNavbar',
          props: { logoText: 'DesignApp AI' },
          children: [],
          layout: { bounds: { minX: 0, minY: 0, maxX: 1200, maxY: 60, width: 1200, height: 60 }, direction: 'horizontal', gap: 16, padding: { top: 12, right: 24, bottom: 12, left: 24 } },
          styles: { backgroundColor: '#FFFFFF' },
          tailwindClasses: ['w-full', 'bg-white', 'border-b', 'border-slate-200', 'px-6', 'py-3', 'flex', 'items-center', 'justify-between'],
          tokens: { primary: '#3B82F6' },
          responsiveRules: {},
          accessibility: { ariaRole: 'navigation', semanticTag: 'nav' }
        },
        {
          id: 'ir_hero',
          componentType: 'Hero',
          name: 'HeroBanner',
          props: { heading: 'Next-Gen Visual Workspace', subtext: 'Intelligent design pipeline with multi-provider AI coordination.' },
          children: [],
          layout: { bounds: { minX: 24, minY: 84, maxX: 1176, maxY: 284, width: 1152, height: 200 }, direction: 'vertical', gap: 16, padding: { top: 32, right: 32, bottom: 32, left: 32 } },
          styles: { backgroundColor: '#2563EB' },
          tailwindClasses: ['py-12', 'px-8', 'bg-gradient-to-r', 'from-blue-600', 'to-indigo-700', 'text-white', 'rounded-2xl', 'shadow-xl'],
          tokens: { primary: '#2563EB' },
          responsiveRules: {},
          accessibility: { ariaRole: 'region', semanticTag: 'section', ariaLabel: 'Hero section' }
        },
        {
          id: 'ir_grid',
          componentType: 'FeatureGrid',
          name: 'MetricsGrid',
          props: { columns: 3 },
          children: [
            {
              id: 'ir_card_1',
              componentType: 'Card',
              name: 'AnalyticsCard',
              props: { title: 'Active Design Models', count: 12 },
              children: [],
              layout: { bounds: { minX: 0, minY: 0, maxX: 360, maxY: 160, width: 360, height: 160 }, direction: 'vertical', gap: 8, padding: { top: 16, right: 16, bottom: 16, left: 16 } },
              styles: { backgroundColor: '#FFFFFF' },
              tailwindClasses: ['p-6', 'bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-slate-100'],
              tokens: { surface: '#FFFFFF' },
              responsiveRules: {},
              accessibility: { ariaRole: 'article', semanticTag: 'article' }
            }
          ],
          layout: { bounds: { minX: 24, minY: 308, maxX: 1176, maxY: 508, width: 1152, height: 200 }, direction: 'horizontal', gap: 16, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
          styles: {},
          tailwindClasses: ['grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6', 'w-full'],
          tokens: {},
          responsiveRules: {},
          accessibility: { ariaRole: 'region', semanticTag: 'section' }
        },
        {
          id: 'ir_footer',
          componentType: 'Footer',
          name: 'MainFooter',
          props: { copyright: '© 2026 AI Orchestration Platform' },
          children: [],
          layout: { bounds: { minX: 0, minY: 720, maxX: 1200, maxY: 800, width: 1200, height: 80 }, direction: 'horizontal', gap: 16, padding: { top: 24, right: 24, bottom: 24, left: 24 } },
          styles: { backgroundColor: '#0F172A' },
          tailwindClasses: ['py-8', 'px-6', 'bg-slate-900', 'text-slate-400', 'border-t', 'border-slate-800', 'mt-auto'],
          tokens: { background: '#0F172A' },
          responsiveRules: {},
          accessibility: { ariaRole: 'contentinfo', semanticTag: 'footer' }
        }
      ]
    };
  }

  private countNodes(node: IRNode): number {
    let count = 1;
    for (const child of node.children || []) {
      count += this.countNodes(child);
    }
    return count;
  }
}
