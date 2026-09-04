import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Grid, Magnet, Trash2, RotateCcw } from 'lucide-react';
import { useViewport, useGridSettings, useCore } from '../hooks/useCore';
import { getNodeBoundingBox } from '../utils/math';

export const CanvasControls: React.FC = () => {
  const viewport = useViewport();
  const [grid, updateGrid] = useGridSettings();
  const { viewportEngine, sceneGraph, historyEngine } = useCore();

  const handleFitToScreen = () => {
    const nodes = sceneGraph.getNodes();
    const bounds = nodes.map(getNodeBoundingBox);
    const canvas = document.querySelector('.canvas-element');
    if (canvas) {
      viewportEngine.fitToScreen(bounds, { width: canvas.clientWidth, height: canvas.clientHeight });
    }
  };

  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to clear the entire canvas?')) {
      sceneGraph.clear();
      historyEngine.clear();
    }
  };

  return (
    <div className="canvas-controls-panel">
      <div className="control-group">
        <button
          className="control-button"
          onClick={() => viewportEngine.zoomAt({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 1.2)}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <span
          className="zoom-percentage"
          onClick={() => viewportEngine.resetZoom()}
          title="Reset Zoom to 100%"
        >
          {Math.round(viewport.zoom * 100)}%
        </span>
        <button
          className="control-button"
          onClick={() => viewportEngine.zoomAt({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 0.8)}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          className="control-button"
          onClick={() => viewportEngine.resetZoom()}
          title="Reset Zoom (100%)"
        >
          <RotateCcw size={16} />
        </button>
        <button
          className="control-button"
          onClick={handleFitToScreen}
          title="Fit to Screen"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="control-divider" />

      <div className="control-group">
        <button
          className={`control-button ${grid.visible ? 'active' : ''}`}
          onClick={() => updateGrid({ visible: !grid.visible })}
          title="Toggle Grid"
        >
          <Grid size={16} />
        </button>
        <button
          className={`control-button ${grid.snap ? 'active' : ''}`}
          onClick={() => updateGrid({ snap: !grid.snap })}
          title="Toggle Snap to Grid"
        >
          <Magnet size={16} />
        </button>
      </div>

      <div className="control-divider" />

      <div className="control-group">
        <button
          className="control-button danger"
          onClick={handleClearCanvas}
          title="Clear Canvas"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
