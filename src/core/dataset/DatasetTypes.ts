export type DatasetCategory =
  | 'ui_understanding'
  | 'semantic_understanding'
  | 'intent_understanding'
  | 'layout'
  | 'components'
  | 'responsive'
  | 'typography'
  | 'colors'
  | 'spacing'
  | 'ux'
  | 'accessibility'
  | 'animation'
  | 'visual_design'
  | 'design_system'
  | 'industry'
  | 'design_style'
  | 'trend'
  | 'preference'
  | 'iteration'
  | 'quality'
  | 'code_generation'
  | 'code_repair';

export type IndustryLabel =
  | 'SaaS'
  | 'AI'
  | 'Fintech'
  | 'Healthcare'
  | 'Education'
  | 'E-commerce'
  | 'Travel'
  | 'Food'
  | 'Social'
  | 'Productivity'
  | 'Developer Tools'
  | 'Media'
  | 'Portfolio'
  | 'Agency'
  | 'Enterprise'
  | 'Other';

export type DesignStyleLabel =
  | 'Minimal'
  | 'Modern SaaS'
  | 'Enterprise'
  | 'Editorial'
  | 'Luxury'
  | 'Playful'
  | 'Brutalist'
  | 'Neobrutalist'
  | 'Glass'
  | 'Dark'
  | 'Light'
  | 'Material'
  | 'Apple-inspired'
  | 'Dashboard'
  | 'Bento'
  | 'Experimental'
  | 'Other';

export interface ProvenanceData {
  sourceType: 'first_party' | 'third_party' | 'synthetic' | 'external';
  sourceDataset: string;
  sourceDatasetVersion: string;
  sourceUrl?: string;
  license: string;
  licenseUrl?: string;
  collectionDate: string;
  transformationVersion: string;
  sampleOrigin: string;
}

export interface TrendData {
  trendSignal: string;
  dateObserved: string;
  source: string;
  style: DesignStyleLabel;
  industry: IndustryLabel;
  qualityScore: number;
  accessibilityScore: number;
  uxScore: number;
  userPreferenceScore: number;
}

export interface SketchSample {
  sceneGraphReference: string;
  canvasObjects: any[];
  objectTypes: string[];
  positions: { x: number; y: number }[];
  sizes: { width: number; height: number }[];
  relationships: any[];
  text: string[];
  drawingOrder: string[];
  viewport: { x: number; y: number; zoom: number };
  zoom: number;
  selectedObjects: string[];
  userCreatedObjects: string[];
  agentCreatedObjects: string[];
}

export interface SemanticSample {
  canvasObjects: any[];
  recognizedShapes: any[];
  textAssociations: any[];
  spatialRelationships: any[];
  layoutStructures: any[];
  semanticTree: any;
  recognitionConfidence: number;
}

export interface IntentSample {
  semanticTree: any;
  intentTree: any;
  purpose: string;
  priority: string;
  possibleVariants: string[];
  ambiguityCandidates: any[];
  confidence: number;
}

export interface BlueprintSample {
  intentTree: any;
  candidateBlueprintVariants: any[];
  structuralStrategies: string[];
  rankingScores: Record<string, number>;
  selectedBlueprint: any;
  rejectedBlueprints: any[];
  selectionReason: string;
}

export interface VisualDesignSample {
  blueprint: any;
  designSystem: any;
  theme: any;
  colors: string[];
  typography: any;
  spacing: any;
  components: any[];
  elevation: any;
  icons: string[];
  illustrations: string[];
  animation: any;
  accessibility: any;
  selectedOption: any;
  rejectedOptions: any[];
  visualEvaluation: any;
}

export interface DesignPreferenceExample {
  request: string;
  target: string;
  changeType: string;
  before: any;
  after: any;
  outcome: string;
  approval: boolean;
  qualityDelta: number;
}

export interface PreferenceSample {
  alternatives: any[];
  selection: any;
  reason: string;
  qualityScores: Record<string, number>;
  userChanges: any[];
  finalOutcome: string;
  preferenceExamples?: DesignPreferenceExample[];
}

export interface IterationSample {
  beforeDesign: any;
  userRequest: string;
  proposedChange: any;
  aiRecommendation: any;
  mlRecommendation: any;
  knowledgeRecommendation: any;
  userApproval: boolean;
  userModification: any;
  afterDesign: any;
  qualityBefore: number;
  qualityAfter: number;
}

export interface QualitySample {
  visualQuality: number;
  uxQuality: number;
  accessibility: number;
  responsiveQuality: number;
  typography: number;
  spacing: number;
  hierarchy: number;
  consistency: number;
  codeQuality: number;
  overallQuality: number;
  humanFeedback: string;
  machineEvaluation: any;
  finalRating: number;
}

export interface FullDesignSample {
  sampleId: string;
  datasetVersion: string;
  prompt: string;
  sketch: SketchSample;
  semanticTree: SemanticSample;
  intentTree: IntentSample;
  blueprintVariants: BlueprintSample;
  selectedBlueprint: any;
  visualDesignOptions: VisualDesignSample;
  selectedVisualDesign: any;
  knowledgeBundle: any;
  mlPredictionBundle: any;
  aiDecision: any;
  renderTree: any;
  codeGenerationReference: any;
  userSelections: any;
  userChanges: any;
  feedback: any;
  evaluation: QualitySample;
  finalDesign: any;
  provenance: ProvenanceData;
  qualityScore: number;
  createdAt: string | number;
  trainingDataAllowed: boolean;
  category: DatasetCategory;
  industry?: IndustryLabel;
  style?: DesignStyleLabel;
  preferenceExamples?: DesignPreferenceExample[];
  sessionId?: string;
  isDuplicate?: boolean;
  duplicateOfSampleId?: string;
}

export interface ProprietaryDatasetProvider {
  samplesByCategory(category: DatasetCategory): FullDesignSample[];
  samplesByIndustry(industry: IndustryLabel): FullDesignSample[];
  samplesByStyle(style: DesignStyleLabel): FullDesignSample[];
  samplesByTask(task: string): FullDesignSample[];
  samplesByQuality(minQuality: number): FullDesignSample[];
  samplesByVersion(version: string): FullDesignSample[];
  trainingSplit(): FullDesignSample[];
  validationSplit(): FullDesignSample[];
  testSplit(): FullDesignSample[];
}

export interface DatasetSplits {
  train: FullDesignSample[];
  validation: FullDesignSample[];
  test: FullDesignSample[];
}

export interface ExternalDatasetImportConfig {
  sourceName: string; // 'RICO' | 'Screen2Words' | 'WebSight' | 'WebUI' | 'WebCode2M' | 'DesignBench'
  sourceVersion: string;
  sourceUrl?: string;
  license: string;
  licenseUrl?: string;
  isEvaluationOnly?: boolean;
}
