import { RenderNode } from './RenderNode';
import { ViewportMode } from './RenderingTypes';

export interface RenderTree {
  root: RenderNode;
  viewportMode: ViewportMode;
  totalNodeCount: number;
  visibleNodeCount: number;
  timestamp: number;
}
