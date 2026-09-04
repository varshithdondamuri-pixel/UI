import React from 'react';
import {
  MousePointer,
  Pencil,
  Square,
  Circle as CircleIcon,
  Minus,
  MoveUpRight,
  Type,
  Undo2,
  Redo2
} from 'lucide-react';
import { useActiveTool, useHistoryState, useCore } from '../hooks/useCore';
import { ToolKind } from '../types';

export const Toolbar: React.FC = () => {
  const [activeTool, setTool] = useActiveTool();
  const { canUndo, canRedo } = useHistoryState();
  const { historyEngine } = useCore();

  const toolItems: { kind: ToolKind; label: string; icon: React.ReactNode }[] = [
    { kind: 'select', label: 'Select (V)', icon: <MousePointer size={18} /> },
    { kind: 'pen', label: 'Freehand Pen (P)', icon: <Pencil size={18} /> },
    { kind: 'rectangle', label: 'Rectangle (R)', icon: <Square size={18} /> },
    { kind: 'circle', label: 'Circle (C)', icon: <CircleIcon size={18} /> },
    { kind: 'line', label: 'Straight Line (L)', icon: <Minus size={18} /> },
    { kind: 'arrow', label: 'Arrow (A)', icon: <MoveUpRight size={18} /> },
    { kind: 'text', label: 'Text Label (T)', icon: <Type size={18} /> }
  ];

  return (
    <div className="toolbar-panel">
      <div className="tool-group">
        {toolItems.map((item) => (
          <button
            key={item.kind}
            className={`tool-button ${activeTool === item.kind ? 'active' : ''}`}
            onClick={() => setTool(item.kind)}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>

      <div className="toolbar-divider" />

      <div className="tool-group">
        <button
          className="tool-button"
          disabled={!canUndo}
          onClick={() => historyEngine.undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>
        <button
          className="tool-button"
          disabled={!canRedo}
          onClick={() => historyEngine.redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={18} />
        </button>
      </div>
    </div>
  );
};
