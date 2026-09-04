import {
  DatasetCategory,
  DesignStyleLabel,
  FullDesignSample,
  IndustryLabel
} from './DatasetTypes';
import { sanitizeSampleData, sanitizeText } from './DatasetSchema';
import { ProvenanceTracker } from './ProvenanceTracker';
import { SketchDatasetBuilder } from './SketchDatasetBuilder';
import { SemanticDatasetBuilder } from './SemanticDatasetBuilder';
import { IntentDatasetBuilder } from './IntentDatasetBuilder';
import { BlueprintDatasetBuilder } from './BlueprintDatasetBuilder';
import { VisualDesignDatasetBuilder } from './VisualDesignDatasetBuilder';
import { PreferenceDatasetBuilder } from './PreferenceDatasetBuilder';
import { IterationDatasetBuilder } from './IterationDatasetBuilder';
import { QualityDatasetBuilder } from './QualityDatasetBuilder';

export interface WorkflowSampleInput {
  sampleId?: string;
  datasetVersion?: string;
  prompt: string;
  nodes?: any[];
  viewport?: { x: number; y: number; zoom: number };
  selectedNodeIds?: string[];
  semanticTree?: any;
  intentTree?: any;
  blueprintVariants?: any[];
  selectedBlueprint?: any;
  visualDesignModel?: any;
  visualDesignOptions?: any[];
  selectedVisualDesign?: any;
  knowledgeBundle?: any;
  mlPredictionBundle?: any;
  aiDecision?: any;
  renderTree?: any;
  codeGenerationReference?: any;
  userSelections?: any;
  userChanges?: any[];
  feedback?: any;
  evaluationMetrics?: any;
  humanFeedback?: string;
  finalDesign?: any;
  trainingDataAllowed?: boolean;
  category?: DatasetCategory;
  industry?: IndustryLabel;
  style?: DesignStyleLabel;
  sessionId?: string;
}

export class DatasetSampleBuilder {
  private provenanceTracker: ProvenanceTracker;
  private sketchBuilder: SketchDatasetBuilder;
  private semanticBuilder: SemanticDatasetBuilder;
  private intentBuilder: IntentDatasetBuilder;
  private blueprintBuilder: BlueprintDatasetBuilder;
  private visualDesignBuilder: VisualDesignDatasetBuilder;
  private preferenceBuilder: PreferenceDatasetBuilder;
  private iterationBuilder: IterationDatasetBuilder;
  private qualityBuilder: QualityDatasetBuilder;

  constructor(defaultVersion: string = 'v0.1') {
    this.provenanceTracker = new ProvenanceTracker(defaultVersion);
    this.sketchBuilder = new SketchDatasetBuilder();
    this.semanticBuilder = new SemanticDatasetBuilder();
    this.intentBuilder = new IntentDatasetBuilder();
    this.blueprintBuilder = new BlueprintDatasetBuilder();
    this.visualDesignBuilder = new VisualDesignDatasetBuilder();
    this.preferenceBuilder = new PreferenceDatasetBuilder();
    this.iterationBuilder = new IterationDatasetBuilder();
    this.qualityBuilder = new QualityDatasetBuilder();
  }

  public buildFullDesignSample(input: WorkflowSampleInput): FullDesignSample {
    const sampleId = input.sampleId || `sample_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const datasetVersion = input.datasetVersion || 'v0.1';
    const sanitizedPrompt = sanitizeText(input.prompt);

    const sketch = this.sketchBuilder.buildSample(
      input.nodes || [],
      input.viewport || { x: 0, y: 0, zoom: 1 },
      input.selectedNodeIds || []
    );

    const semanticTree = this.semanticBuilder.buildSample(input.semanticTree, input.nodes || []);
    const intentTree = this.intentBuilder.buildSample(input.semanticTree, input.intentTree);
    const blueprintVariants = this.blueprintBuilder.buildSample(
      input.intentTree,
      input.blueprintVariants || [],
      input.selectedBlueprint
    );

    const visualDesignOptions = this.visualDesignBuilder.buildSample(
      input.selectedBlueprint,
      input.visualDesignModel,
      input.visualDesignOptions || [],
      input.selectedVisualDesign
    );

    const evaluation = this.qualityBuilder.buildSample(
      input.evaluationMetrics || {},
      input.humanFeedback || 'High quality design sample',
      null
    );

    const provenance = this.provenanceTracker.createFirstPartyProvenance(datasetVersion);

    const fullSample: FullDesignSample = {
      sampleId,
      datasetVersion,
      prompt: sanitizedPrompt,
      sketch,
      semanticTree,
      intentTree,
      blueprintVariants,
      selectedBlueprint: input.selectedBlueprint || null,
      visualDesignOptions,
      selectedVisualDesign: input.selectedVisualDesign || input.visualDesignModel || null,
      knowledgeBundle: input.knowledgeBundle || null,
      mlPredictionBundle: input.mlPredictionBundle || null,
      aiDecision: input.aiDecision || null,
      renderTree: input.renderTree || null,
      codeGenerationReference: input.codeGenerationReference || null,
      userSelections: input.userSelections || null,
      userChanges: input.userChanges || [],
      feedback: input.feedback || null,
      evaluation,
      finalDesign: input.finalDesign || input.visualDesignModel || null,
      provenance,
      qualityScore: evaluation.overallQuality,
      createdAt: new Date().toISOString(),
      trainingDataAllowed: input.trainingDataAllowed ?? true,
      category: input.category || 'ui_understanding',
      industry: input.industry,
      style: input.style,
      sessionId: input.sessionId || `session_${Date.now()}`
    };

    return sanitizeSampleData(fullSample);
  }

  public getSubBuilders() {
    return {
      sketch: this.sketchBuilder,
      semantic: this.semanticBuilder,
      intent: this.intentBuilder,
      blueprint: this.blueprintBuilder,
      visualDesign: this.visualDesignBuilder,
      preference: this.preferenceBuilder,
      iteration: this.iterationBuilder,
      quality: this.qualityBuilder
    };
  }
}
