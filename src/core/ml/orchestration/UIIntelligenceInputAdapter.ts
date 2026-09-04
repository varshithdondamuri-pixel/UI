import { UIMLOrchestrationRequest } from './UIMLOrchestratorTypes';

export interface CanvasElement {
  id?: string;
  type?: string;
  bounds?: { x: number; y: number; width: number; height: number };
  styles?: Record<string, any>;
  children?: CanvasElement[];
  [key: string]: any;
}

export interface ViewportBounds {
  width: number;
  height: number;
}

export class UIIntelligenceInputAdapter {
  /**
   * Extract standardized UI representation from Canvas elements and viewport bounds
   */
  public static extractUIRepresentationFromCanvas(
    elements: CanvasElement[],
    viewport?: ViewportBounds,
    styleContext?: Record<string, any>
  ): UIMLOrchestrationRequest {
    const safeElements = Array.isArray(elements) ? elements : [];
    const safeViewport = viewport || { width: 1200, height: 800 };

    const components = safeElements.map((el) => ({
      id: el.id || `node_${Math.random().toString(36).substr(2, 9)}`,
      type: el.type || 'GenericContainer',
      bounds: el.bounds || { x: 0, y: 0, width: 100, height: 100 }
    }));

    return {
      inputContext: {
        elements: components,
        components,
        geometry: {
          viewportWidth: safeViewport.width,
          viewportHeight: safeViewport.height,
          elementCount: components.length
        },
        viewport: safeViewport,
        styleContext: styleContext || { darkTheme: false, colorPalette: ['#ffffff', '#000000'] },
        structure: {
          treeDepth: 2,
          rootNodes: components.length
        }
      }
    };
  }

  /**
   * Extract standardized UI representation from DOM node elements
   */
  public static extractUIRepresentationFromDOM(
    domNode: any,
    viewport?: ViewportBounds
  ): UIMLOrchestrationRequest {
    const safeViewport = viewport || { width: 1200, height: 800 };
    if (!domNode) {
      return {
        inputContext: {
          elements: [],
          viewport: safeViewport,
          domTree: 'unavailable'
        }
      };
    }

    return {
      inputContext: {
        elements: [
          {
            id: domNode.id || 'dom_root',
            type: domNode.tagName || 'DIV',
            bounds: { x: 0, y: 0, width: safeViewport.width, height: safeViewport.height }
          }
        ],
        domTree: {
          tagName: domNode.tagName || 'DIV',
          className: domNode.className || ''
        },
        viewport: safeViewport,
        geometry: { width: safeViewport.width, height: safeViewport.height }
      }
    };
  }
}
