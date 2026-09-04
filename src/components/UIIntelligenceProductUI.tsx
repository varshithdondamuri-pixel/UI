import React, { useReducer, useRef } from 'react';
import { Sparkles, PenLine, ImageUp } from 'lucide-react';
import { useCore } from '../hooks/useCore';
import { CanvasNode } from '../types';
import { SceneGraph } from '../core/scene/SceneGraph';
import { UICompositionEngine } from '../core/planning/UICompositionEngine';
import { composeGenerationTree } from '../core/planning/UIComposer';
import { layoutGenerationTree } from '../core/planning/GenerationLayoutEngine';
import { emitGenerationTree } from '../core/planning/GenerationEmitter';
import { GeminiIntentPlanner } from '../core/ai/GeminiIntentPlanner';
import { UIGenerationSpec } from '../core/ai/UIGenerationSpec';

interface UIIntelligenceProductUIProps {
  onOpenCanvas: () => void;
}

const PAGE_DIMENSIONS = { width: 1200, height: 800 };
const PLANNING_TIMEOUT_MS = 15000;

// ---------------------------------------------------------------------------
// Generation state machine
//
// idle -> planning -> composing -> rendering -> ready
//            \___________\___________\-> {stage}_failed
//
// One reducer is the only place a transition happens. Every action carries
// the requestId it belongs to; the reducer drops any action whose requestId
// doesn't match the request it's currently tracking, which is what makes a
// superseded (stale) request's result get discarded instead of rendered —
// this holds regardless of why two requests exist (fast retype, a second
// click that slipped past the busy guard, network reordering, etc).
// ---------------------------------------------------------------------------

export type GenerationSource = 'prompt' | 'image';
export type GenerationStage = 'planning' | 'composing' | 'rendering';
export type GenerationStatus = 'idle' | GenerationStage | 'ready' | 'planning_failed' | 'composing_failed' | 'rendering_failed';

export interface GenerationState {
  status: GenerationStatus;
  requestId: string | null;
  source: GenerationSource | null;
  input: string | null;
  message: string | null;
  nodeCount: number | null;
  /** Spec from a successful planning stage, kept so a composing/rendering retry can skip re-planning. */
  spec: UIGenerationSpec | null;
}

export const initialGenerationState: GenerationState = {
  status: 'idle',
  requestId: null,
  source: null,
  input: null,
  message: null,
  nodeCount: null,
  spec: null
};

export type GenerationAction =
  | { type: 'START'; requestId: string; source: GenerationSource; input: string }
  | { type: 'ENTER_COMPOSING'; requestId: string; spec: UIGenerationSpec }
  | { type: 'ENTER_RENDERING'; requestId: string }
  | { type: 'SUCCEEDED'; requestId: string; nodeCount: number }
  | { type: 'FAILED'; requestId: string; stage: GenerationStage; message: string }
  | { type: 'RESET' };

export function generationReducer(state: GenerationState, action: GenerationAction): GenerationState {
  switch (action.type) {
    case 'START':
      // A fresh request always wins immediately and becomes the one every
      // later action is checked against — this is the "changing the active
      // input invalidates any in-flight request" rule, enforced here rather
      // than by the caller remembering to do it.
      return {
        status: 'planning',
        requestId: action.requestId,
        source: action.source,
        input: action.input,
        message: null,
        nodeCount: null,
        spec: null
      };
    case 'ENTER_COMPOSING':
      if (action.requestId !== state.requestId) return state;
      return { ...state, status: 'composing', spec: action.spec };
    case 'ENTER_RENDERING':
      if (action.requestId !== state.requestId) return state;
      return { ...state, status: 'rendering' };
    case 'SUCCEEDED':
      if (action.requestId !== state.requestId) return state;
      return { ...state, status: 'ready', nodeCount: action.nodeCount, message: null };
    case 'FAILED':
      if (action.requestId !== state.requestId) return state;
      return { ...state, status: `${action.stage}_failed`, message: action.message, nodeCount: null };
    case 'RESET':
      return initialGenerationState;
    default:
      return state;
  }
}

export function isBusy(status: GenerationStatus): boolean {
  return status === 'planning' || status === 'composing' || status === 'rendering';
}

export function isFailure(status: GenerationStatus): boolean {
  return status === 'planning_failed' || status === 'composing_failed' || status === 'rendering_failed';
}

export function failureStage(status: GenerationStatus): GenerationStage | null {
  if (status === 'planning_failed') return 'planning';
  if (status === 'composing_failed') return 'composing';
  if (status === 'rendering_failed') return 'rendering';
  return null;
}

/** One plain sentence per failure — no internal codes, no stack traces. Those go to the console. */
export function humanErrorFor(stage: GenerationStage, timedOut: boolean): string {
  if (timedOut) return 'This is taking longer than expected. Try again.';
  switch (stage) {
    case 'planning':
      return "Couldn't understand that request. Try describing the page you want to build.";
    case 'composing':
      return "Couldn't turn that into a layout. Try again or rephrase your request.";
    case 'rendering':
      return "The UI couldn't be rendered. Try again.";
  }
}

let requestCounter = 0;
export function nextRequestId(): string {
  requestCounter += 1;
  return `gen_${Date.now()}_${requestCounter}`;
}

class StageError extends Error {
  constructor(public stage: GenerationStage, public cause: unknown, public timedOut = false) {
    super(cause instanceof Error ? cause.message : String(cause));
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new StageError('planning', new Error(`timed out after ${ms}ms`), true)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Compose -> layout -> emit for a resolved spec. Deliberately does not touch
 * SceneGraph.clear()/addNode() — it only ever calls SceneGraph.createNode(),
 * a pure factory. That's what makes "clear the scene graph only once a new
 * composition has successfully produced nodes" possible: this can throw at
 * any point and the live scene is provably untouched, because nothing here
 * can touch it. Exported so canvas-safety can be tested directly (call this
 * with a spec engineered to fail and assert the SceneGraph the caller
 * separately manages is unchanged), without depending on React.
 */
export function attemptComposition(spec: UIGenerationSpec, sceneGraph: SceneGraph, pageWidth: number): CanvasNode[] {
  const tree = composeGenerationTree(spec);
  const boxedTree = layoutGenerationTree(tree, pageWidth);
  return emitGenerationTree(sceneGraph, boxedTree);
}

export const UIIntelligenceProductUI: React.FC<UIIntelligenceProductUIProps> = ({ onOpenCanvas }) => {
  const [promptText, setPromptText] = React.useState('');
  const [generation, dispatch] = useReducer(generationReducer, initialGenerationState);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronous guards. React state updates are batched/deferred, so a rapid
  // double-click (or Enter immediately followed by a click) can call the
  // start function twice before a re-render ever reflects `isBusy`. Refs
  // mutate immediately, so this is the actual fix for that race, not just a
  // UI disabled-state that happens to usually be fast enough.
  const busyRef = useRef(false);
  const activeRequestIdRef = useRef<string | null>(null);

  const { sceneGraph, viewportEngine } = useCore();
  const [geminiPlanner] = React.useState(() => new GeminiIntentPlanner());
  const [compositionEngine] = React.useState(() => new UICompositionEngine());
  const didAutoGenerate = useRef(false);

  const fitViewportToScene = () => {
    const nodes = sceneGraph.getNodes();
    if (nodes.length === 0 || !viewportEngine) return;
    const bounds = nodes.map((n: CanvasNode) => {
      const w = n.size?.width ?? 100;
      const h = n.size?.height ?? 100;
      const minX = n.position?.x ?? 0;
      const minY = n.position?.y ?? 0;
      return { minX, minY, maxX: minX + w, maxY: minY + h, width: w, height: h };
    });
    viewportEngine.fitToScreen(bounds, { width: 1100, height: 460 });
  };

  /**
   * Shared by both the prompt and the screenshot paths — they used to be
   * two independent flows racing on the same booleans; now they share one
   * busy guard and one reducer, so one can no longer stomp the other's
   * result onto the canvas.
   */
  const startGeneration = (source: GenerationSource, input: string, run: (requestId: string) => Promise<void>, switchToCanvas: boolean) => {
    if (busyRef.current) return; // a generation is already in flight — this is the duplicate-request guard
    busyRef.current = true;

    const requestId = nextRequestId();
    activeRequestIdRef.current = requestId;
    dispatch({ type: 'START', requestId, source, input });

    run(requestId)
      .then(() => {
        if (activeRequestIdRef.current !== requestId) return; // superseded while running
        if (switchToCanvas) onOpenCanvas();
      })
      .catch((err) => {
        if (activeRequestIdRef.current !== requestId) return; // superseded — don't surface a stale error either
        const stageErr = err instanceof StageError ? err : new StageError('planning', err);
        console.error(`Generation failed at stage "${stageErr.stage}":`, stageErr.cause);
        dispatch({ type: 'FAILED', requestId, stage: stageErr.stage, message: humanErrorFor(stageErr.stage, stageErr.timedOut) });
      })
      .finally(() => {
        busyRef.current = false;
      });
  };

  const runPromptGeneration = async (requestId: string, promptInput: string) => {
    let spec: UIGenerationSpec;
    try {
      spec = await withTimeout(geminiPlanner.planGenerationFromPrompt(promptInput), PLANNING_TIMEOUT_MS);
    } catch (err) {
      throw err instanceof StageError ? err : new StageError('planning', err);
    }
    if (activeRequestIdRef.current !== requestId) return; // a newer request took over while we were planning

    dispatch({ type: 'ENTER_COMPOSING', requestId, spec });

    let nodesToAdd: CanvasNode[];
    try {
      nodesToAdd = attemptComposition(spec, sceneGraph, PAGE_DIMENSIONS.width);
    } catch (err) {
      // composeGenerationTree/layoutGenerationTree/emitGenerationTree never
      // touch the live scene graph (see attemptComposition) — whatever
      // canvas existed before this call is still exactly what's there.
      throw new StageError('composing', err);
    }
    if (activeRequestIdRef.current !== requestId) return;

    dispatch({ type: 'ENTER_RENDERING', requestId });

    // Only now — everything above succeeded — do we touch the live scene.
    sceneGraph.clear();
    nodesToAdd.forEach((node) => sceneGraph.addNode(node));
    fitViewportToScene();

    dispatch({ type: 'SUCCEEDED', requestId, nodeCount: nodesToAdd.length });
  };

  const runImageGeneration = async (requestId: string, file: File) => {
    const previewUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new StageError('planning', new Error('Could not read the selected file.')));
      reader.readAsDataURL(file);
    });
    if (activeRequestIdRef.current !== requestId) return;

    const { width: imageWidth } = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width || PAGE_DIMENSIONS.width, height: img.height || PAGE_DIMENSIONS.height });
      img.onerror = () => resolve({ width: PAGE_DIMENSIONS.width, height: PAGE_DIMENSIONS.height });
      img.src = previewUrl;
    });
    if (activeRequestIdRef.current !== requestId) return;

    let spec: UIGenerationSpec;
    try {
      spec = await withTimeout(geminiPlanner.planGenerationFromImage(previewUrl, file.name), PLANNING_TIMEOUT_MS);
    } catch (err) {
      throw err instanceof StageError ? err : new StageError('planning', err);
    }
    if (activeRequestIdRef.current !== requestId) return;

    dispatch({ type: 'ENTER_COMPOSING', requestId, spec });

    const elements = [
      { id: 'img_header', type: 'Header', bounds: { x: 40, y: 20, width: imageWidth - 80, height: 75 } },
      { id: 'img_hero', type: 'HeroBanner', bounds: { x: 40, y: 110, width: imageWidth - 80, height: 260 } },
      { id: 'img_card1', type: 'CardContainer', bounds: { x: 40, y: 390, width: 350, height: 250 } },
      { id: 'img_card2', type: 'CardContainer', bounds: { x: 425, y: 390, width: 350, height: 250 } }
    ];

    // UICompositionEngine.composeAndPopulateCanvas clears+populates in one
    // call (unlike attemptComposition above), so unlike the prompt path we
    // can't build first and swap in atomically here — this is a pre-existing
    // property of that engine, not something this task touches.
    let createdCount: number;
    try {
      dispatch({ type: 'ENTER_RENDERING', requestId });
      const createdNodes = compositionEngine.composeAndPopulateCanvas(sceneGraph, { uiGenerationSpec: spec, reconstructImageElements: elements });
      createdCount = createdNodes.length;
    } catch (err) {
      throw new StageError('rendering', err);
    }
    if (activeRequestIdRef.current !== requestId) return;

    fitViewportToScene();
    dispatch({ type: 'SUCCEEDED', requestId, nodeCount: createdCount });
  };

  // Initial load: auto-generate a starting page once, without switching to
  // canvas mode, exactly as before.
  React.useEffect(() => {
    if (didAutoGenerate.current) return;
    didAutoGenerate.current = true;
    if (sceneGraph.getNodes().length === 0) {
      startGeneration('prompt', 'Create a modern landing page for an AI product', (id) => runPromptGeneration(id, 'Create a modern landing page for an AI product'), false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canGenerate = !isBusy(generation.status) && promptText.trim().length > 0;

  const handlePromptChange = (value: string) => {
    setPromptText(value);
    // Editing the prompt invalidates any in-flight request and clears a
    // stale ready/error status left over from the previous input — it does
    // NOT touch the canvas, which stays exactly as the last successful
    // generation left it until a new one actually succeeds.
    //
    // RESET is dispatched unconditionally, not gated on the current
    // `generation.status` — that status is a value from this render's
    // closure, and if this fires in the same batch as a just-started
    // generation's own dispatch (type quickly right after clicking
    // Generate), the closure can still read the *previous* render's status
    // and wrongly skip the reset. The reducer's RESET is idempotent, so
    // always dispatching it costs nothing when already idle.
    activeRequestIdRef.current = null;
    busyRef.current = false;
    dispatch({ type: 'RESET' });
  };

  const handleGenerateClick = () => {
    if (!canGenerate) return;
    startGeneration('prompt', promptText, (id) => runPromptGeneration(id, promptText), true);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    activeRequestIdRef.current = null;
    busyRef.current = false;
    startGeneration('image', file.name, (id) => runImageGeneration(id, file), true);
  };

  const handleRetry = () => {
    const stage = failureStage(generation.status);
    // Retry from the failed stage, not from scratch, where that's
    // meaningful: a composing/rendering failure already has a spec from a
    // successful planning call, so retrying re-runs composition on that
    // same spec instead of re-asking Gemini.
    if ((stage === 'composing' || stage === 'rendering') && generation.spec) {
      const spec = generation.spec;
      const input = generation.input || promptText;
      startGeneration(
        generation.source || 'prompt',
        input,
        async (requestId) => {
          dispatch({ type: 'ENTER_COMPOSING', requestId, spec });
          let nodesToAdd: CanvasNode[];
          try {
            nodesToAdd = attemptComposition(spec, sceneGraph, PAGE_DIMENSIONS.width);
          } catch (err) {
            throw new StageError('composing', err);
          }
          if (activeRequestIdRef.current !== requestId) return;
          dispatch({ type: 'ENTER_RENDERING', requestId });
          sceneGraph.clear();
          nodesToAdd.forEach((node) => sceneGraph.addNode(node));
          fitViewportToScene();
          dispatch({ type: 'SUCCEEDED', requestId, nodeCount: nodesToAdd.length });
        },
        true
      );
      return;
    }
    // planning_failed (or no cached spec) — nothing meaningful to skip, start over.
    handleGenerateClick();
  };

  const iconButtonStyle: React.CSSProperties = {
    width: '58px',
    height: '58px',
    flexShrink: 0,
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  };

  return (
    <div
      className="ui-intelligence-full-page"
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'radial-gradient(circle at 20% -10%, #132038 0%, #090d16 45%, #06080f 100%)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Logo / brand — the rest of the identity comes later */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '28px 32px 8px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(56, 189, 248, 0.35)',
            flexShrink: 0
          }}
        >
          <Sparkles size={20} color="#ffffff" />
        </div>
        <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.3px' }}>UI INTELLIGENCE</span>
      </header>

      {/* Prompt bar + AI generate / draw-canvas / upload-screenshot actions */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '760px', width: '100%', margin: '0 auto', padding: '48px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px' }}>
          <input
            type="text"
            value={promptText}
            onChange={(e) => handlePromptChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateClick();
            }}
            placeholder="Describe the UI you want to build..."
            style={{
              flex: 1,
              minWidth: 0,
              background: 'rgba(15, 23, 42, 0.9)',
              border: '2px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '16px',
              padding: '0 20px',
              height: '58px',
              color: '#f8fafc',
              fontSize: '15px',
              outline: 'none',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)'
            }}
          />

          <button
            onClick={handleGenerateClick}
            disabled={!canGenerate}
            title="Generate with AI"
            style={{
              width: '58px',
              height: '58px',
              flexShrink: 0,
              borderRadius: '16px',
              border: 'none',
              background: canGenerate ? 'linear-gradient(135deg, #38bdf8, #6366f1)' : 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canGenerate ? 'pointer' : 'not-allowed',
              boxShadow: canGenerate ? '0 8px 22px rgba(56, 189, 248, 0.35)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={20} color={canGenerate ? '#ffffff' : '#64748b'} />
          </button>

          <button onClick={onOpenCanvas} title="Draw it yourself" style={iconButtonStyle}>
            <PenLine size={20} color="#94a3b8" />
          </button>

          <button onClick={() => fileInputRef.current?.click()} title="Upload a screenshot" style={iconButtonStyle}>
            <ImageUp size={20} color="#94a3b8" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleScreenshotUpload} style={{ display: 'none' }} />
        </div>

        {isBusy(generation.status) && (
          <div style={{ marginTop: '14px', fontSize: '13px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#38bdf8',
                animation: 'pulse 1.2s ease-in-out infinite'
              }}
            />
            Generating your UI…
          </div>
        )}

        {isFailure(generation.status) && generation.message && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '13px',
              color: '#f87171'
            }}
          >
            <span>{generation.message}</span>
            <button
              onClick={handleRetry}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Body intentionally empty for now — content goes here later */}
        <div style={{ flex: 1 }} />
      </main>
    </div>
  );
};
