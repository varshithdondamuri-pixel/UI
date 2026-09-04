import { BoundingBox, CanvasNode } from '../../../types';
import { TypedEventBus } from '../../events/EventBus';
import { SceneGraph } from '../../scene/SceneGraph';
import { UIGenerationSpec } from '../../ai/UIGenerationSpec';
import { GeminiIntentPlanner } from '../../ai/GeminiIntentPlanner';
import { composeGenerationTree } from '../UIComposer';
import { layoutGenerationTree } from '../GenerationLayoutEngine';
import { emitGenerationTree } from '../GenerationEmitter';
import { resolveSectionKey } from '../SectionBuilders';
import { BoxedNode } from '../GenerationTree';
import {
  generationReducer,
  initialGenerationState,
  isBusy,
  isFailure,
  attemptComposition,
  GenerationState,
  GenerationStatus
} from '../../../components/UIIntelligenceProductUI';

// No Gemini, no API key, no model calls — these are literal spec objects, exactly
// what handleExecuteGeneration produces after `await geminiPlanner.planGenerationFromPrompt(...)`.

const ecommerceHomepageSpec: UIGenerationSpec = {
  intent: 'Create a premium ecommerce homepage for a sneaker brand',
  productType: 'ecommerce',
  purpose: 'Sell premium sneakers online',
  pages: ['Home'],
  sections: [
    { type: 'Navbar', purpose: 'Navigation & Branding', order: 1 },
    { type: 'Hero', purpose: 'Primary Value Proposition & CTA', order: 2 },
    { type: 'Features', purpose: 'Product Showcase', order: 3 },
    { type: 'Footer', purpose: 'Footer & Legal Links', order: 4 }
  ],
  components: [],
  layout: { structure: 'responsive_grid', columns: 12, responsive: true },
  visualStyle: { theme: 'dark', mood: 'modern_premium', typography: 'Inter, sans-serif', spacing: 'relaxed', radius: 'rounded_md' },
  content: {
    headings: ['STEP INTO THE FUTURE', 'Featured Collection'],
    labels: ['Men', 'Women', 'Sneakers', 'Collections', 'Cart'],
    ctas: ['SHOP COLLECTION', 'Add to Cart']
  },
  referenceQueries: ['ecommerce', 'product grid', 'sneakers'],
  confidence: 0.96
};

const saasDashboardSpec: UIGenerationSpec = {
  intent: 'Create a SaaS analytics dashboard',
  productType: 'dashboard',
  purpose: 'Monitor revenue and customer metrics',
  pages: ['Dashboard'],
  sections: [
    { type: 'Topbar', purpose: 'App Header', order: 1 },
    { type: 'Sidebar', purpose: 'Primary Navigation', order: 2 },
    { type: 'KPIRow', purpose: 'Key Metrics', order: 3 },
    { type: 'ChartArea', purpose: 'Revenue Trend', order: 4 },
    { type: 'DataTable', purpose: 'Recent Orders', order: 5 }
  ],
  components: [],
  layout: { structure: 'responsive_grid', columns: 12, responsive: true },
  visualStyle: { theme: 'light', mood: 'professional', typography: 'Inter, sans-serif', spacing: 'relaxed', radius: 'rounded_md' },
  content: {
    headings: ['Analytics Overview', 'Revenue & Traffic Performance'],
    labels: ['Dashboard', 'Reports', 'Customers', 'Settings'],
    ctas: ['Export Data', 'Filter Period']
  },
  referenceQueries: ['dashboard', 'sidebar navigation', 'analytics cards'],
  confidence: 0.94
};

const mobileLoginSpec: UIGenerationSpec = {
  intent: 'Create a mobile banking login screen',
  productType: 'form',
  purpose: 'Authenticate returning users',
  pages: ['Login'],
  sections: [
    { type: 'Navbar', purpose: 'Branding', order: 1 },
    { type: 'LoginForm', purpose: 'Sign in to your account', order: 2 }
  ],
  components: [],
  layout: { structure: 'centered', columns: 1, responsive: true },
  visualStyle: { theme: 'dark', mood: 'minimal', typography: 'Inter, sans-serif', spacing: 'relaxed', radius: 'rounded_md' },
  content: {
    headings: ['Welcome Back'],
    labels: [],
    ctas: ['Sign In']
  },
  referenceQueries: ['login', 'auth form'],
  confidence: 0.95
};

const CASES: { name: string; spec: UIGenerationSpec; pageWidth: number }[] = [
  { name: 'ecommerce homepage', spec: ecommerceHomepageSpec, pageWidth: 1200 },
  { name: 'SaaS dashboard', spec: saasDashboardSpec, pageWidth: 1200 },
  { name: 'mobile login', spec: mobileLoginSpec, pageWidth: 375 }
];

const INTERNAL_NAME_DENYLIST = ['ContainerBox', 'FlexRow', 'GenericContainer', 'rect_', 'Rectangle'];

function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.minX < b.maxX && b.minX < a.maxX && a.minY < b.maxY && b.minY < a.maxY;
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function walkAssertions(node: BoxedNode, pageWidth: number, pageHeight: number, caseName: string): void {
  assert(node.box.width > 0, `[${caseName}] node "${node.id}" (${node.role}) has non-positive width: ${node.box.width}`);
  assert(node.box.height > 0, `[${caseName}] node "${node.id}" (${node.role}) has non-positive height: ${node.box.height}`);

  assert(
    node.box.minX >= -0.01 && node.box.minY >= -0.01 && node.box.maxX <= pageWidth + 0.01 && node.box.maxY <= pageHeight + 0.01,
    `[${caseName}] node "${node.id}" (${node.role}) box [${node.box.minX},${node.box.minY},${node.box.maxX},${node.box.maxY}] extends outside page bounds [0,0,${pageWidth},${pageHeight}]`
  );

  for (let i = 0; i < node.children.length; i++) {
    for (let j = i + 1; j < node.children.length; j++) {
      const a = node.children[i];
      const b = node.children[j];
      assert(
        !boxesOverlap(a.box, b.box),
        `[${caseName}] sibling nodes "${a.id}" and "${b.id}" (parent "${node.id}") overlap: ` +
          `[${a.box.minX},${a.box.minY},${a.box.maxX},${a.box.maxY}] vs [${b.box.minX},${b.box.minY},${b.box.maxX},${b.box.maxY}]`
      );
    }
  }

  if (node.kind === 'text') {
    const text = node.text || '';
    assert(text.length > 0, `[${caseName}] text node "${node.id}" (${node.role}) has no text content`);
    assert(text !== node.role, `[${caseName}] text node "${node.id}" leaked its role ("${node.role}") as content`);
    for (const banned of INTERNAL_NAME_DENYLIST) {
      assert(!text.includes(banned), `[${caseName}] text node "${node.id}" contains an internal-looking name: "${text}"`);
    }
  }

  node.children.forEach((child) => walkAssertions(child, pageWidth, pageHeight, caseName));
}

function compositionDepth(node: BoxedNode): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(compositionDepth));
}

/**
 * Checks the emitted CanvasNode graph's parentId/children fields for
 * structural integrity: exactly one root, every non-root parentId resolves,
 * every children entry resolves, no cycles, and depth matches the
 * composition tree exactly (the emitter mirrors it 1:1, including
 * invisible structural wrappers — see GenerationEmitter.ts).
 */
function verifyHierarchy(nodes: CanvasNode[], boxed: BoxedNode, caseName: string): void {
  const byId = new Map(nodes.map((n) => [n.uuid, n]));

  const roots = nodes.filter((n) => n.parentId === null);
  assert(roots.length === 1, `[${caseName}] expected exactly one root (parentId === null), found ${roots.length}`);
  const root = roots[0];

  for (const node of nodes) {
    if (node.uuid === root.uuid) continue;
    assert(
      node.parentId !== null && byId.has(node.parentId),
      `[${caseName}] node "${node.metadata.semanticLabel}" (${node.uuid}) has a parentId that does not resolve to an emitted node: ${node.parentId}`
    );
  }

  for (const node of nodes) {
    for (const childId of node.children) {
      assert(
        byId.has(childId),
        `[${caseName}] node "${node.metadata.semanticLabel}" (${node.uuid}) lists a child id that does not exist: ${childId}`
      );
    }
  }

  // No cycles: a bounded pre-order walk from the root must reach every node
  // exactly once. If there's a cycle, either this throws on a revisit or it
  // never terminates within nodes.length steps.
  const visited = new Set<string>();
  let emittedDepth = 0;
  const walkCanvas = (uuid: string, depth: number) => {
    assert(!visited.has(uuid), `[${caseName}] cycle detected: node ${uuid} reached twice while walking children`);
    visited.add(uuid);
    emittedDepth = Math.max(emittedDepth, depth);
    const node = byId.get(uuid)!;
    for (const childId of node.children) walkCanvas(childId, depth + 1);
  };
  walkCanvas(root.uuid, 1);
  assert(visited.size === nodes.length, `[${caseName}] ${nodes.length - visited.size} emitted node(s) are unreachable from the root via children`);

  const treeDepth = compositionDepth(boxed);
  assert(
    emittedDepth === treeDepth,
    `[${caseName}] emitted hierarchy depth (${emittedDepth}) does not match composition tree depth (${treeDepth})`
  );
}

/** Structural signature ignoring uuids/timestamps, for determinism comparison across two emission runs. */
function structuralSignature(nodes: CanvasNode[]): any {
  const byId = new Map(nodes.map((n) => [n.uuid, n]));
  const root = nodes.find((n) => n.parentId === null)!;
  const describe = (uuid: string): any => {
    const n = byId.get(uuid)!;
    return {
      kind: n.kind,
      role: n.metadata.semanticLabel,
      text: n.text ?? null,
      position: n.position,
      size: n.size,
      fill: n.fill,
      stroke: n.stroke,
      strokeWidth: n.strokeWidth,
      visibility: n.visibility,
      children: n.children.map(describe)
    };
  };
  return describe(root.uuid);
}

export function runGenerationPipelineTest(): { success: boolean; results: any[] } {
  const results: any[] = [];

  for (const { name, spec, pageWidth } of CASES) {
    const tree = composeGenerationTree(spec);
    assert(tree.children.length > 0, `[${name}] composed tree is empty`);

    const boxed = layoutGenerationTree(tree, pageWidth);
    const pageHeight = boxed.box.height;

    walkAssertions(boxed, pageWidth, pageHeight, name);

    // Same spec in -> byte-identical tree out, every time. No Date.now(),
    // no Math.random(), no iteration-order dependence anywhere in
    // compose/layout. (UUIDs are assigned at emit time, not here, so this
    // pure pre-emission tree is exactly what "byte-identical output" means.)
    const rerunBoxed = layoutGenerationTree(composeGenerationTree(spec), pageWidth);
    assert(
      JSON.stringify(boxed) === JSON.stringify(rerunBoxed),
      `[${name}] composeGenerationTree + layoutGenerationTree produced different output on a second run for the same spec`
    );

    const eventBus = new TypedEventBus();
    const sceneGraph = new SceneGraph(eventBus);
    const emitted = emitGenerationTree(sceneGraph, boxed);
    const nodeIds = emitted.map((n) => n.uuid);

    assert(nodeIds.length > 0, `[${name}] emitting produced 0 SceneGraph node ids`);
    assert(new Set(nodeIds).size === nodeIds.length, `[${name}] emitted duplicate SceneGraph node ids`);

    verifyHierarchy(emitted, boxed, name);

    // Determinism of the emitted structure itself, not just the pre-emission
    // tree: uuids differ run to run (real randomness, expected), but the
    // shape/roles/boxes/styles/visibility of the emitted graph must not.
    const eventBus2 = new TypedEventBus();
    const sceneGraph2 = new SceneGraph(eventBus2);
    const emitted2 = emitGenerationTree(sceneGraph2, layoutGenerationTree(composeGenerationTree(spec), pageWidth));
    assert(
      JSON.stringify(structuralSignature(emitted)) === JSON.stringify(structuralSignature(emitted2)),
      `[${name}] emitted hierarchy structure differs between two runs of the same spec`
    );

    results.push({ name, sectionCount: tree.children.length, nodeCount: nodeIds.length, pageWidth, pageHeight });
  }

  return { success: true, results };
}

// ---------------------------------------------------------------------------
// Generation state machine (Task 4)
// ---------------------------------------------------------------------------

const ALL_STATUSES: GenerationStatus[] = [
  'idle',
  'planning',
  'composing',
  'rendering',
  'ready',
  'planning_failed',
  'composing_failed',
  'rendering_failed'
];

export function runGenerationStateMachineTest(): { success: boolean } {
  // Each failure state is reachable from the stage it names, and recoverable via retry (a new START).
  for (const stage of ['planning', 'composing', 'rendering'] as const) {
    let s: GenerationState = generationReducer(initialGenerationState, { type: 'START', requestId: 'r1', source: 'prompt', input: 'x' });
    if (stage !== 'planning') s = generationReducer(s, { type: 'ENTER_COMPOSING', requestId: 'r1', spec: {} as UIGenerationSpec });
    if (stage === 'rendering') s = generationReducer(s, { type: 'ENTER_RENDERING', requestId: 'r1' });

    s = generationReducer(s, { type: 'FAILED', requestId: 'r1', stage, message: 'human readable message' });
    assert(s.status === `${stage}_failed`, `expected status "${stage}_failed" after FAILED(${stage}), got "${s.status}"`);
    assert(s.message === 'human readable message', `[${stage}_failed] message not carried into state`);
    assert(isFailure(s.status), `[${stage}_failed] isFailure() must be true`);
    assert(!isBusy(s.status), `[${stage}_failed] isBusy() must be false — a failure is not "in progress"`);

    // Recovery: a fresh START (what Retry dispatches) moves off the failure state.
    const recovered = generationReducer(s, { type: 'START', requestId: 'r2', source: 'prompt', input: 'x' });
    assert(recovered.status === 'planning', `[${stage}_failed] retry (a new START) did not recover — got "${recovered.status}"`);
    assert(recovered.message === null, `[${stage}_failed] retry did not clear the previous error message`);
  }

  // A stale result (mismatched requestId) is discarded, not rendered, at every transition type.
  {
    const started = generationReducer(initialGenerationState, { type: 'START', requestId: 'r1', source: 'prompt', input: 'x' });

    const afterStaleComposing = generationReducer(started, { type: 'ENTER_COMPOSING', requestId: 'stale', spec: {} as UIGenerationSpec });
    assert(afterStaleComposing.status === 'planning', 'a stale ENTER_COMPOSING (wrong requestId) must not change status');

    const afterStaleSucceeded = generationReducer(started, { type: 'SUCCEEDED', requestId: 'stale', nodeCount: 999 });
    assert(afterStaleSucceeded.status === 'planning', 'a stale SUCCEEDED (wrong requestId) must not flip status to ready');
    assert(afterStaleSucceeded.nodeCount === null, 'a stale SUCCEEDED must not leak its nodeCount into state');

    const afterStaleFailed = generationReducer(started, { type: 'FAILED', requestId: 'stale', stage: 'planning', message: 'nope' });
    assert(afterStaleFailed.status === 'planning', 'a stale FAILED (wrong requestId) must not change status');
  }

  // A second generation started while one is running does not produce two results.
  // (The busyRef synchronous guard in the component prevents this from being dispatched
  // in the first place for the common double-click case — verified live, since a ref
  // guard has no meaningful pure-function form. This checks the deeper guarantee: even
  // if two requests *do* both get started, only the request the reducer is currently
  // tracking can ever reach "ready" — an earlier one's result arriving late is inert.)
  {
    const afterFirstStart = generationReducer(initialGenerationState, { type: 'START', requestId: 'A', source: 'prompt', input: 'first' });
    const afterSecondStart = generationReducer(afterFirstStart, { type: 'START', requestId: 'B', source: 'prompt', input: 'second' });
    assert(afterSecondStart.requestId === 'B', 'the second START must become the authoritative request');

    // Request A's result arrives late — must be dropped, not rendered as "ready".
    const afterStaleFirstResult = generationReducer(afterSecondStart, { type: 'SUCCEEDED', requestId: 'A', nodeCount: 11 });
    assert(afterStaleFirstResult.status !== 'ready', "request A's late result must not produce a ready state");
    assert(afterStaleFirstResult.requestId === 'B', 'state must still be tracking request B, not A');

    // Only B's own result can land.
    const finalState = generationReducer(afterStaleFirstResult, { type: 'SUCCEEDED', requestId: 'B', nodeCount: 22 });
    assert(finalState.status === 'ready' && finalState.nodeCount === 22, "request B's result must be the only one that lands");
  }

  // A failed generation leaves prior canvas nodes intact.
  {
    const eventBus = new TypedEventBus();
    const sceneGraph = new SceneGraph(eventBus);
    const priorNode = sceneGraph.createNode({ kind: 'rectangle', position: { x: 0, y: 0 }, size: { width: 10, height: 10 } });
    sceneGraph.addNode(priorNode);
    const priorSnapshot = JSON.stringify(sceneGraph.getNodes());

    const brokenSpec: UIGenerationSpec = { ...ecommerceHomepageSpec, sections: [{ type: 'totally-unrecognized-section-type', purpose: '', order: 1 }] };
    let threw = false;
    try {
      attemptComposition(brokenSpec, sceneGraph, 1200);
    } catch {
      threw = true;
    }
    assert(threw, 'attemptComposition was expected to throw for a spec with no recognizable sections');
    assert(
      JSON.stringify(sceneGraph.getNodes()) === priorSnapshot,
      'a failed composition must leave every prior canvas node exactly as it was — attemptComposition must never call clear()/addNode()'
    );
  }

  // No state combination outside the model is representable: the four
  // observable categories (idle, busy, ready, failed) are mutually exclusive
  // for every status value the type admits.
  {
    for (const status of ALL_STATUSES) {
      const flags = [status === 'idle', isBusy(status), status === 'ready', isFailure(status)];
      const trueCount = flags.filter(Boolean).length;
      assert(trueCount === 1, `status "${status}" must belong to exactly one of idle/busy/ready/failed — belongs to ${trueCount}`);
    }
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// GeminiIntentPlanner fallback sections (Task 6)
//
// GenerationPipeline's own test above stayed green through the productType-
// blind fallback bug because it calls composeGenerationTree(spec) directly
// with hand-built specs, never exercising GeminiIntentPlanner at all. This
// covers the actual gap: parseAndValidateSpec's fallback branch (taken
// whenever a response carries no `sections`, which is every simulated-
// GeminiProvider response since there's no API key here) must pick a
// section list that (a) actually varies by productType and (b) resolves
// in SectionBuilders' registry. No network call: constructing
// GeminiIntentPlanner only constructs a GeminiProvider instance, and
// parseAndValidateSpec is a pure function over its arguments — sendRequest
// is never invoked.
// ---------------------------------------------------------------------------

export function runGeminiFallbackSectionsTest(): { success: boolean } {
  const planner = new GeminiIntentPlanner();
  const productTypesToCheck: UIGenerationSpec['productType'][] = ['dashboard', 'ecommerce', 'landing_page', 'form'];

  const sectionListsByType = new Map<string, string[]>();

  for (const productType of productTypesToCheck) {
    // An empty parsed response — no `sections` field — is exactly what the
    // simulated GeminiProvider path hands this function, forcing the
    // fallback branch under test.
    const spec = planner.parseAndValidateSpec({}, `test prompt for ${productType}`, productType);

    assert(spec.sections.length > 0, `[${productType}] fallback produced zero sections`);

    spec.sections.forEach((section, idx) => {
      const key = resolveSectionKey(section.type, productType);
      assert(key !== null, `[${productType}] fallback section type "${section.type}" does not resolve in SectionBuilders' registry`);
      assert(section.order === idx + 1, `[${productType}] fallback section "${section.type}" has order ${section.order}, expected ${idx + 1}`);
    });

    sectionListsByType.set(productType, spec.sections.map((s) => s.type));
  }

  // The whole point of the fix: different productTypes must not collapse
  // back onto the same generic section list.
  const seenSignatures = new Set<string>();
  for (const [productType, types] of sectionListsByType) {
    const signature = types.join(',');
    assert(
      !seenSignatures.has(signature),
      `[${productType}] fallback section list ("${signature}") is identical to another productType's — the fallback is still productType-blind`
    );
    seenSignatures.add(signature);
  }

  return { success: true };
}
