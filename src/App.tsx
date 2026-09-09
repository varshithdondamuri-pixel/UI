import React, { useState, useEffect } from 'react';
import { CoreProvider, useCore } from './hooks/useCore';
import { CanvasContainer } from './components/CanvasContainer';
import { Toolbar } from './components/Toolbar';
import { PropertyInspector } from './components/PropertyInspector';
import { CanvasControls } from './components/CanvasControls';
import { UIIntelligenceProductUI } from './components/UIIntelligenceProductUI';
import { RecognitionDebugPanel } from './components/RecognitionDebugPanel';
import { ToolKind } from './types';
import { ArrowLeft } from 'lucide-react';
import { LogoIcon } from './components/LogoIcon';

const ShortcutHandler: React.FC = () => {
  const { toolManager, historyEngine, selectionEngine } = useCore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          historyEngine.redo();
        } else {
          historyEngine.undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        historyEngine.redo();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectionEngine.deleteSelected();
        return;
      }

      const keyMap: Record<string, ToolKind> = {
        v: 'select',
        p: 'pen',
        r: 'rectangle',
        c: 'circle',
        l: 'line',
        a: 'arrow',
        t: 'text'
      };

      const tool = keyMap[e.key.toLowerCase()];
      if (tool) {
        toolManager.setTool(tool);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toolManager, historyEngine, selectionEngine]);

  return null;
};

export const AppContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<'product_ui' | 'canvas'>('product_ui');
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="app-viewport" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ShortcutHandler />

      {viewMode === 'product_ui' ? (
        <UIIntelligenceProductUI onOpenCanvas={() => setViewMode('canvas')} />
      ) : (
        <>
          {/* Top Banner Navigation back to UI Studio */}
          <div
            style={{
              position: 'fixed',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <button
              onClick={() => setViewMode('product_ui')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to UI Studio</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
              <LogoIcon size={16} />
              <span>UI</span>
            </div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                padding: '4px 8px',
                color: '#94a3b8',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              {showDebug ? 'Hide ML Debug' : 'ML Debug'}
            </button>
          </div>

          <Toolbar />
          <CanvasContainer />
          <PropertyInspector />
          <CanvasControls />
          {showDebug && <RecognitionDebugPanel />}
        </>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CoreProvider>
      <AppContent />
    </CoreProvider>
  );
};

export default App;
