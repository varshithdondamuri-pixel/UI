import { VisualDesignModel, VisualNode } from '../design/DesignTypes';
import { RenderNode } from './RenderNode';
import { RenderTree } from './RenderTree';
import { ViewportMode } from './RenderingTypes';

export class RenderTreeBuilder {
  /**
   * Constructs an optimized RenderTree from a VisualDesignModel for a specified ViewportMode.
   * Purely read-only on VisualDesignModel.
   */
  public buildRenderTree(model: VisualDesignModel, viewportMode: ViewportMode): RenderTree {
    const activeOption = model.activeOption || model;

    let targetWidth = 1200;
    if (viewportMode === 'tablet') targetWidth = 768;
    if (viewportMode === 'mobile') targetWidth = 375;

    const rootRenderNode = this.convertVisualNode(
      activeOption.rootNode,
      viewportMode,
      targetWidth,
      0,
      0,
      0
    );

    let totalNodeCount = 0;
    let visibleNodeCount = 0;

    const countNodes = (node: RenderNode) => {
      totalNodeCount++;
      if (node.visibility) visibleNodeCount++;
      if (node.children) node.children.forEach(countNodes);
    };

    countNodes(rootRenderNode);

    return {
      root: rootRenderNode,
      viewportMode,
      totalNodeCount,
      visibleNodeCount,
      timestamp: Date.now()
    };
  }

  private convertVisualNode(
    vNode: VisualNode,
    viewportMode: ViewportMode,
    containerWidth: number,
    offsetX: number,
    offsetY: number,
    depth: number
  ): RenderNode {
    const resp = vNode.responsiveRules || {};
    let nodeWidth = containerWidth;
    let visibility = true;

    // Apply responsive rule constraints
    if (viewportMode === 'mobile') {
      if (resp.mobile?.visibility === false) visibility = false;
      if (resp.mobile?.columns === 1) {
        nodeWidth = containerWidth - (vNode.margin.left + vNode.margin.right);
      }
    } else if (viewportMode === 'tablet') {
      if (resp.tablet?.visibility === false) visibility = false;
    }

    const bounds = {
      minX: offsetX,
      minY: offsetY,
      maxX: offsetX + nodeWidth,
      maxY: offsetY + vNode.bounds.height,
      width: Math.max(20, nodeWidth),
      height: Math.max(20, vNode.bounds.height)
    };

    const styleReference = {
      colorTokens: vNode.foreground ? { text: vNode.foreground.color, textMuted: vNode.foreground.mutedColor || '' } as any : {} as any,
      borderRadius: vNode.borderRadius,
      border: vNode.border,
      background: vNode.background,
      foreground: vNode.foreground,
      shadow: vNode.shadow,
      elevation: vNode.elevation,
      designTokens: vNode.designTokens
    };

    const textReference = {
      content: vNode.componentType,
      typography: vNode.typography
    };

    const iconReference = { icon: vNode.icon };
    const illustrationReference = { illustration: vNode.illustration };
    const animationReference = { animation: vNode.animation };

    let childOffsetY = offsetY + vNode.padding.top;
    const childWidth = Math.max(20, bounds.width - (vNode.padding.left + vNode.padding.right));

    const childrenRenderNodes = vNode.children
      ? vNode.children.map((childVNode) => {
          const childNode = this.convertVisualNode(
            childVNode,
            viewportMode,
            childWidth,
            offsetX + vNode.padding.left,
            childOffsetY,
            depth + 1
          );
          childOffsetY += childNode.bounds.height + (vNode.spacing.gap || 12);
          return childNode;
        })
      : [];

    return {
      id: `rnode-${vNode.id}`,
      componentType: vNode.componentType,
      bounds,
      transform: { x: offsetX, y: offsetY, scaleX: 1, scaleY: 1, rotation: 0 },
      styleReference,
      layoutReference: vNode.layoutReference || vNode.id,
      textReference,
      iconReference,
      illustrationReference,
      animationReference,
      children: childrenRenderNodes,
      visibility,
      opacity: visibility ? 1.0 : 0.0,
      clipping: true,
      zIndex: vNode.elevation || depth
    };
  }
}
