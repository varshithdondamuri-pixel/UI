import { IRNode } from './CodeGenerationTypes';

export interface ResponsiveBreakpointMap {
  mobile: string[];
  tablet: string[];
  desktop: string[];
}

export class ResponsiveCodeGenerator {
  /** Map visual responsive rules to Tailwind breakpoint prefixes */
  public buildResponsiveTailwindClasses(node: IRNode): ResponsiveBreakpointMap {
    const result: ResponsiveBreakpointMap = { mobile: [], tablet: [], desktop: [] };

    const rules = node.responsiveRules || {};

    if (rules.mobile) {
      result.mobile = this.mapRulesToTailwind(rules.mobile, '');
    }
    if (rules.tablet) {
      result.tablet = this.mapRulesToTailwind(rules.tablet, 'md:');
    }
    if (rules.desktop) {
      result.desktop = this.mapRulesToTailwind(rules.desktop, 'lg:');
    }

    return result;
  }

  /** Generate combined string of all responsive Tailwind classes for JSX */
  public mergeResponsiveClasses(base: string[], map: ResponsiveBreakpointMap): string {
    const all = [
      ...base,
      ...map.mobile,
      ...map.tablet,
      ...map.desktop
    ];
    return [...new Set(all)].join(' ');
  }

  /** Generate a CSS media query block string */
  public generateMediaQuery(
    breakpoint: 'mobile' | 'tablet' | 'desktop',
    selector: string,
    properties: Record<string, string>
  ): string {
    const bpMap = { mobile: 640, tablet: 768, desktop: 1024 };
    const maxBp = { mobile: 640, tablet: 1023, desktop: 99999 };
    const direction = breakpoint === 'desktop' ? 'min' : 'max';
    const px = direction === 'min' ? bpMap[breakpoint] : maxBp[breakpoint];
    const mq = direction === 'min' ? `(min-width: ${px}px)` : `(max-width: ${px}px)`;

    const propLines = Object.entries(properties)
      .map(([k, v]) => `    ${this.camelToKebab(k)}: ${v};`)
      .join('\n');

    return `@media ${mq} {\n  ${selector} {\n${propLines}\n  }\n}`;
  }

  private mapRulesToTailwind(rules: Record<string, any>, prefix: string): string[] {
    const classes: string[] = [];

    const flexMap: Record<string, string> = {
      'flex-row': 'flex-row',
      'flex-col': 'flex-col',
      row: 'flex-row',
      column: 'flex-col',
      vertical: 'flex-col',
      horizontal: 'flex-row'
    };

    if (rules.display === 'flex' || rules.flexDirection) {
      classes.push(`${prefix}flex`);
      const dir = rules.flexDirection || rules.direction || '';
      if (flexMap[dir]) {
        classes.push(`${prefix}${flexMap[dir]}`);
      }
    }
    if (rules.display === 'grid' || rules.gridColumns) {
      classes.push(`${prefix}grid`);
      if (rules.gridColumns) {
        classes.push(`${prefix}grid-cols-${rules.gridColumns}`);
      }
    }
    if (rules.hidden === true) {
      classes.push(`${prefix}hidden`);
    }
    if (rules.gap) {
      const gapNum = typeof rules.gap === 'number' ? Math.round(rules.gap / 4) : 4;
      classes.push(`${prefix}gap-${gapNum}`);
    }
    if (rules.padding) {
      const pNum = typeof rules.padding === 'number' ? Math.round(rules.padding / 4) : 4;
      classes.push(`${prefix}p-${pNum}`);
    }

    return classes;
  }

  private camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }
}
