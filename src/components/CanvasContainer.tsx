import React, { useEffect, useRef } from 'react';
import { useCore } from '../hooks/useCore';

export const CanvasContainer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { interactionEngine, renderer } = useCore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    interactionEngine.attach(canvas);
    renderer.attach(ctx);

    return () => {
      window.removeEventListener('resize', updateSize);
      renderer.detach();
      interactionEngine.detach();
    };
  }, [interactionEngine, renderer]);

  return (
    <canvas
      ref={canvasRef}
      className="canvas-element"
      onPointerDown={(e) => interactionEngine.handlePointerDown(e)}
      onPointerMove={(e) => interactionEngine.handlePointerMove(e)}
      onPointerUp={(e) => interactionEngine.handlePointerUp(e)}
      onWheel={(e) => interactionEngine.handleWheel(e)}
    />
  );
};
