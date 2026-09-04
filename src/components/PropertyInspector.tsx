import React from 'react';
import { useSelectedNode, useCore } from '../hooks/useCore';
import { Trash2 } from 'lucide-react';
import { UpdateNodeCommand } from '../core/history/commands';
import { LayerControls } from './LayerControls';

export const PropertyInspector: React.FC = () => {
  const selectedNode = useSelectedNode();
  const { sceneGraph, historyEngine, selectionEngine, toolManager } = useCore();

  if (!selectedNode) {
    return (
      <div className="inspector-panel empty">
        <div className="empty-state">
          <p className="empty-title">No object selected</p>
          <p className="empty-subtitle">Select an object on the canvas to inspect its properties.</p>
        </div>
      </div>
    );
  }

  const updateProp = (updates: Partial<typeof selectedNode>) => {
    historyEngine.execute(
      new UpdateNodeCommand(sceneGraph, selectedNode.uuid, selectedNode, updates)
    );
    // Sync active style defaults
    toolManager.setDefaultStyle({
      stroke: updates.stroke ?? selectedNode.stroke,
      fill: updates.fill ?? selectedNode.fill,
      strokeWidth: updates.strokeWidth ?? selectedNode.strokeWidth
    });
  };

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <span className="node-type-badge">
          {selectedNode.metadata?.semanticLabel || selectedNode.kind.toUpperCase()}
        </span>
        <button
          className="delete-button"
          onClick={() => selectionEngine.deleteSelected()}
          title="Delete Object (Delete / Backspace)"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="inspector-section">
        <label className="section-title">Transform</label>
        <div className="input-grid">
          <div className="input-field">
            <span className="field-label">X</span>
            <input
              type="number"
              value={Math.round(selectedNode.position.x)}
              onChange={(e) =>
                updateProp({ position: { ...selectedNode.position, x: Number(e.target.value) } })
              }
            />
          </div>
          <div className="input-field">
            <span className="field-label">Y</span>
            <input
              type="number"
              value={Math.round(selectedNode.position.y)}
              onChange={(e) =>
                updateProp({ position: { ...selectedNode.position, y: Number(e.target.value) } })
              }
            />
          </div>
          <div className="input-field">
            <span className="field-label">W</span>
            <input
              type="number"
              min={1}
              value={Math.round(selectedNode.size.width)}
              onChange={(e) =>
                updateProp({ size: { ...selectedNode.size, width: Math.max(1, Number(e.target.value)) } })
              }
            />
          </div>
          <div className="input-field">
            <span className="field-label">H</span>
            <input
              type="number"
              min={1}
              value={Math.round(selectedNode.size.height)}
              onChange={(e) =>
                updateProp({ size: { ...selectedNode.size, height: Math.max(1, Number(e.target.value)) } })
              }
            />
          </div>
        </div>

        <div className="input-row single">
          <span className="field-label">Rotation</span>
          <input
            type="number"
            value={Math.round(selectedNode.rotation)}
            onChange={(e) => updateProp({ rotation: Number(e.target.value) % 360 })}
          />
          <span className="field-unit">°</span>
        </div>
      </div>

      <div className="inspector-section">
        <label className="section-title">Appearance</label>

        <div className="input-row">
          <span className="field-label">Stroke</span>
          <div className="color-picker-wrapper">
            <input
              type="color"
              value={selectedNode.stroke}
              onChange={(e) => updateProp({ stroke: e.target.value })}
            />
            <span className="color-hex">{selectedNode.stroke}</span>
          </div>
        </div>

        <div className="input-row">
          <span className="field-label">Fill</span>
          <div className="color-picker-wrapper">
            <input
              type="color"
              value={selectedNode.fill === 'transparent' ? '#000000' : selectedNode.fill}
              onChange={(e) => updateProp({ fill: e.target.value })}
            />
            <button
              className={`transparent-toggle ${selectedNode.fill === 'transparent' ? 'active' : ''}`}
              onClick={() =>
                updateProp({ fill: selectedNode.fill === 'transparent' ? '#3b82f6' : 'transparent' })
              }
            >
              Transparent
            </button>
          </div>
        </div>

        <div className="input-row">
          <span className="field-label">Stroke Width</span>
          <input
            type="range"
            min={1}
            max={20}
            value={selectedNode.strokeWidth}
            onChange={(e) => updateProp({ strokeWidth: Number(e.target.value) })}
          />
          <span className="field-unit">{selectedNode.strokeWidth}px</span>
        </div>
      </div>

      {selectedNode.kind === 'text' && (
        <div className="inspector-section">
          <label className="section-title">Text Content</label>
          <input
            type="text"
            className="text-input"
            value={selectedNode.text || ''}
            onChange={(e) => updateProp({ text: e.target.value })}
          />
        </div>
      )}

      <div className="inspector-section">
        <label className="section-title">Layer Order</label>
        <LayerControls />
      </div>
    </div>
  );
};
