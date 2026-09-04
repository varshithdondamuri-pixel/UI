import { ToolKind, Point, CanvasNode } from '../../types';

export interface InteractionEvent {
  pointerId: number;
  screenPoint: Point;
  worldPoint: Point;
  button: number; // 0=left, 1=middle, 2=right
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export interface ITool {
  id: ToolKind;
  onPointerDown(e: InteractionEvent): void;
  onPointerMove(e: InteractionEvent): void;
  onPointerUp(e: InteractionEvent): void;
  cancel(): void;
  deactivate(): void;
  getPreviewNode?(): CanvasNode | null;
}
