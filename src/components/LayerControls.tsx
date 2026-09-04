import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useCore } from '../hooks/useCore';

export const LayerControls: React.FC = () => {
  const { selectionEngine } = useCore();

  return (
    <div className="layer-controls">
      <button
        className="layer-button"
        onClick={() => selectionEngine.bringForward()}
        title="Bring Forward"
      >
        <ArrowUp size={16} />
        <span>Bring Forward</span>
      </button>
      <button
        className="layer-button"
        onClick={() => selectionEngine.sendBackward()}
        title="Send Backward"
      >
        <ArrowDown size={16} />
        <span>Send Backward</span>
      </button>
    </div>
  );
};
