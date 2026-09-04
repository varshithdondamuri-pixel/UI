import { IRNode } from './CodeGenerationTypes';

export interface A11yProps {
  tag: string;
  ariaAttributes: Record<string, string>;
  props: Record<string, string>;
}

export class AccessibilityCodeGenerator {
  /** Derive semantic tag, ARIA attributes, and keyboard/focus props for an IR node */
  public deriveA11yProps(node: IRNode): A11yProps {
    const type = node.componentType;

    const tag = node.accessibility?.semanticTag || this.semanticTagForType(type);
    const ariaAttributes: Record<string, string> = {};
    const props: Record<string, string> = {};

    if (node.accessibility?.ariaRole) {
      ariaAttributes['role'] = node.accessibility.ariaRole;
    }
    if (node.accessibility?.ariaLabel) {
      ariaAttributes['aria-label'] = node.accessibility.ariaLabel;
    }

    // Type-specific overrides
    switch (type) {
      case 'Navbar':
      case 'Header':
        ariaAttributes['role'] = 'navigation';
        ariaAttributes['aria-label'] = ariaAttributes['aria-label'] || 'Main navigation';
        break;
      case 'Button':
        props['type'] = 'button';
        ariaAttributes['aria-pressed'] = 'false';
        break;
      case 'Input':
        ariaAttributes['aria-required'] = 'false';
        ariaAttributes['aria-invalid'] = 'false';
        break;
      case 'Modal':
        ariaAttributes['role'] = 'dialog';
        ariaAttributes['aria-modal'] = 'true';
        ariaAttributes['aria-labelledby'] = 'modal-title';
        props['tabIndex'] = '-1';
        break;
      case 'Sidebar':
        ariaAttributes['role'] = 'complementary';
        ariaAttributes['aria-label'] = ariaAttributes['aria-label'] || 'Sidebar';
        break;
      case 'Footer':
        ariaAttributes['role'] = 'contentinfo';
        break;
      case 'Hero':
        ariaAttributes['role'] = 'region';
        ariaAttributes['aria-label'] = ariaAttributes['aria-label'] || 'Hero section';
        break;
      case 'FeatureGrid':
        ariaAttributes['role'] = 'region';
        ariaAttributes['aria-label'] = ariaAttributes['aria-label'] || 'Features';
        break;
    }

    return { tag, ariaAttributes, props };
  }

  /** Format ARIA attributes as JSX prop string */
  public formatJSXAriaProps(ariaAttributes: Record<string, string>): string {
    return Object.entries(ariaAttributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join('\n        ');
  }

  /** Generate a focus-trap utility snippet for modals */
  public generateFocusTrapSnippet(): string {
    return `
  useEffect(() => {
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }
  }, [open]);`.trim();
  }

  /** Generate keyboard handler for Escape key (modals, dropdowns) */
  public generateKeyboardEscapeHandler(): string {
    return `
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };`.trim();
  }

  private semanticTagForType(type: string): string {
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
      Table: 'table',
      Form: 'form'
    };
    return map[type] || 'div';
  }
}
