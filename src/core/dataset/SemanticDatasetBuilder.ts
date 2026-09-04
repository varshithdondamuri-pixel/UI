import { SemanticSample } from './DatasetTypes';

export class SemanticDatasetBuilder {
  public buildSample(
    semanticTree: any,
    canvasObjects: any[] = []
  ): SemanticSample {
    const rootConfidence = semanticTree?.confidence ?? 0.85;
    const recognizedShapes = semanticTree?.children ? this.extractShapes(semanticTree) : [];
    const textAssociations = semanticTree ? this.extractTextAssociations(semanticTree) : [];
    const spatialRelationships = semanticTree?.relationships || [];
    const layoutStructures = semanticTree ? this.extractLayoutStructures(semanticTree) : [];

    return {
      canvasObjects: canvasObjects || [],
      recognizedShapes,
      textAssociations,
      spatialRelationships,
      layoutStructures,
      semanticTree: semanticTree || null,
      recognitionConfidence: Number(rootConfidence.toFixed(2))
    };
  }

  private extractShapes(node: any): any[] {
    const results: any[] = [];
    if (!node) return results;
    results.push({
      id: node.id,
      type: node.type,
      confidence: node.confidence,
      bounds: node.bounds
    });
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        results.push(...this.extractShapes(child));
      }
    }
    return results;
  }

  private extractTextAssociations(node: any): any[] {
    const results: any[] = [];
    if (!node) return results;
    if (node.metadata?.label || node.text) {
      results.push({
        nodeId: node.id,
        label: node.metadata?.label || node.text,
        type: node.type
      });
    }
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        results.push(...this.extractTextAssociations(child));
      }
    }
    return results;
  }

  private extractLayoutStructures(node: any): any[] {
    const structures: any[] = [];
    if (!node) return structures;
    if (['container', 'grid', 'flex_row', 'flex_column', 'card', 'header', 'sidebar'].includes(node.type)) {
      structures.push({
        id: node.id,
        layoutType: node.type,
        childCount: node.children?.length || 0
      });
    }
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        structures.push(...this.extractLayoutStructures(child));
      }
    }
    return structures;
  }
}
