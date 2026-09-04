import { ToolKind, CoreEvent, GridSettings } from '../../types';
import { TypedEventBus } from '../events/EventBus';
import { ITool, InteractionEvent } from './ITool';
import { SceneGraph } from '../scene/SceneGraph';
import { HistoryEngine } from '../history/HistoryEngine';
import { SelectionEngine } from '../selection/SelectionEngine';
import { ViewportEngine } from '../viewport/ViewportEngine';
import { SelectTool } from './SelectTool';
import { RectTool } from './RectTool';
import { CircleTool } from './CircleTool';
import { LineTool } from './LineTool';
import { ArrowTool } from './ArrowTool';
import { PenTool } from './PenTool';
import { TextTool } from './TextTool';

export class ToolManager {
  private tools: Map<ToolKind, ITool> = new Map();
  private activeToolKind: ToolKind = 'select';
  private eventBus: TypedEventBus;
  private defaultStyle = { stroke: '#3b82f6', fill: 'transparent', strokeWidth: 2 };
  private gridSettings: GridSettings = { visible: true, snap: false, size: 20 };

  constructor(
    sceneGraph: SceneGraph,
    selectionEngine: SelectionEngine,
    historyEngine: HistoryEngine,
    viewportEngine: ViewportEngine,
    eventBus: TypedEventBus
  ) {
    this.eventBus = eventBus;

    const getGrid = () => this.gridSettings;
    const getStyle = () => ({ ...this.defaultStyle });
    const getZoom = () => viewportEngine.getViewport().zoom;

    this.tools.set('select', new SelectTool(sceneGraph, selectionEngine, historyEngine, getGrid, getZoom));
    this.tools.set('rectangle', new RectTool(sceneGraph, historyEngine, getGrid, getStyle));
    this.tools.set('circle', new CircleTool(sceneGraph, historyEngine, getGrid, getStyle));
    this.tools.set('line', new LineTool(sceneGraph, historyEngine, getGrid, getStyle));
    this.tools.set('arrow', new ArrowTool(sceneGraph, historyEngine, getGrid, getStyle));
    this.tools.set('pen', new PenTool(sceneGraph, historyEngine, getGrid, getStyle));
    this.tools.set('text', new TextTool(sceneGraph, historyEngine, selectionEngine, getGrid, getStyle));
  }

  public getActiveTool(): ITool {
    return this.tools.get(this.activeToolKind) || this.tools.get('select')!;
  }

  public getActiveToolKind(): ToolKind {
    return this.activeToolKind;
  }

  public setTool(kind: ToolKind): void {
    if (this.activeToolKind !== kind) {
      this.getActiveTool().deactivate();
      this.activeToolKind = kind;
      this.eventBus.emit(CoreEvent.TOOL_CHANGED, { tool: kind });
    }
  }

  public setGridSettings(settings: Partial<GridSettings>): void {
    this.gridSettings = { ...this.gridSettings, ...settings };
    this.eventBus.emit(CoreEvent.GRID_CHANGED, { grid: { ...this.gridSettings } });
  }

  public getGridSettings(): GridSettings {
    return { ...this.gridSettings };
  }

  public setDefaultStyle(style: Partial<{ stroke: string; fill: string; strokeWidth: number }>): void {
    this.defaultStyle = { ...this.defaultStyle, ...style };
  }

  public getDefaultStyle(): { stroke: string; fill: string; strokeWidth: number } {
    return { ...this.defaultStyle };
  }

  public onPointerDown(e: InteractionEvent): void {
    this.getActiveTool().onPointerDown(e);
  }

  public onPointerMove(e: InteractionEvent): void {
    this.getActiveTool().onPointerMove(e);
  }

  public onPointerUp(e: InteractionEvent): void {
    this.getActiveTool().onPointerUp(e);
  }

  public cancel(): void {
    this.getActiveTool().cancel();
  }
}
