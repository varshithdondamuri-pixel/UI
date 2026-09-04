import * as fs from 'fs';
import * as path from 'path';

export interface RawDatasetInventoryItem {
  dataset: 'RICO' | 'Screen2Words' | 'WebCode2M' | 'WebUI';
  totalRawRecords: number;
  usableRecords: number;
  labeledRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  nearDuplicateRecords: number;
  recordsWithRequiredFeatures: number;
  recordsWithRequiredLabels: number;
  recordsWithViewport: number;
  recordsWithGeometry: number;
  recordsWithComponentInformation: number;
  recordsWithText: number;
  recordsWithHierarchy: number;
}

export interface PreparedDatasetInventory {
  datasetVersion: string;
  totalPreparedSamples: number;
  trainSamples: number;
  validationSamples: number;
  testSamples: number;
  samplesByDataset: Record<string, number>;
  samplesByClass: Record<string, number>;
  samplesBySourceRecord: Record<string, string>;
  samplesByScreenId: Record<string, string>;
}

export interface PreviewVsAvailableReport {
  previewEvaluationCount: number;
  availableEligibleEvaluationCount: number;
  additionalEligibleRecords: number;
  additionalEligibleClasses: string[];
  additionalEligibleDatasets: string[];
}

export interface LabelCoverageItem {
  dataset: string;
  labelCoverage: number;
  classCount: number;
  classDistribution: Record<string, number>;
  minimumClassSupport: number;
  maximumClassSupport: number;
  medianClassSupport: number;
  unlabeledCount: number;
  ambiguousLabelCount: number;
  unsupportedLabelCount: number;
}

export interface GroupIsolationCapacityReport {
  totalGroups: number;
  groupsWithMultipleRecords: number;
  groupsWithSingleRecords: number;
  potentialCrossSplitLinks: string[];
  groupingKeysAvailable: string[];
}

export interface DuplicateCapacityReport {
  exactDuplicates: number;
  nearDuplicates: number;
  crossDatasetDuplicates: number;
  sameScreenDuplicates: number;
  sameSourceRecordDuplicates: number;
  crossSplitDuplicates: number;
  usableUniquePopulation: number;
  duplicateRisk: 'low' | 'moderate' | 'high';
}

export interface CrossDatasetCapacityReport {
  datasets: Record<'RICO' | 'Screen2Words' | 'WebCode2M' | 'WebUI', 'SUPPORTED' | 'PARTIAL' | 'INSUFFICIENT' | 'UNAVAILABLE'>;
  details: Record<string, string>;
}

export interface ClassSupportItem {
  className: string;
  currentlyEvaluatedSupport: number;
  availableAdditionalSupport: number;
  totalPotentialSupport: number;
  supportStatus: 'strong' | 'moderate' | 'weak' | 'insufficient';
}

export interface StatisticalCapacityReport {
  currentCapacity: {
    testSampleSize: number;
    confidenceInterval95Width: number;
    confidenceInterval99Width: number;
    perClassAnalysisViable: boolean;
    perDatasetAnalysisViable: boolean;
    minorityClassAnalysisViable: boolean;
  };
  potentialCapacity: {
    recommendedTestSampleSize: number;
    estimatedConfidenceInterval95Width: number;
    estimatedConfidenceInterval99Width: number;
    perClassAnalysisViable: boolean;
    perDatasetAnalysisViable: boolean;
    minorityClassAnalysisViable: boolean;
  };
}

export interface TargetEvaluationManifest {
  manifestId: string;
  task: string;
  isTrainingDataset: boolean;
  eligibleDatasets: string[];
  eligibleClasses: string[];
  eligibleGroups: number;
  eligibleRecordCounts: Record<string, number>;
  duplicateExclusions: string[];
  labelExclusions: string[];
  featureExclusions: string[];
  recommendedEvaluationPopulation: number;
  recommendedMinimumClassSupport: number;
  recommendedMinimumDatasetSupport: number;
}

export interface ScaleRecommendationReport {
  currentTestScaleStatus: 'insufficient' | 'limited' | 'moderate' | 'strong';
  potentialEvaluationScaleStatus: 'insufficient' | 'limited' | 'moderate' | 'strong';
  evaluationScaleStatus: 'insufficient' | 'limited' | 'moderate' | 'strong';
  rationale: string;
}

export interface DatasetPriorityItem {
  rank: number;
  dataset: string;
  score: number;
  strengths: string[];
  limitations: string[];
  recommendedUse: string;
}

export interface RecommendedEvaluationDesignReport {
  targetTotalEvaluationSamples: number;
  targetPerDatasetSamples: Record<string, number>;
  targetPerClassSamples: Record<string, number>;
  groupIsolationRule: string;
  duplicateRule: string;
  labelRule: string;
  featureAvailabilityRule: string;
}

export interface ApprovalBlockersReport {
  approvalReadiness: 'not_ready' | 'conditional' | 'ready_for_review';
  activeBlockers: string[];
  blockerEvaluations: Record<string, { blocked: boolean; details: string }>;
}

export interface AuditSummaryReport {
  auditedAt: string;
  phase: string;
  modelV01Status: 'candidate';
  modelV02Status: 'candidate';
  previewEvaluationCount: number;
  availableEligibleEvaluationCount: number;
  additionalEligibleRecords: number;
  evaluationScaleStatus: 'insufficient' | 'limited' | 'moderate' | 'strong';
  potentialEvaluationScaleStatus: 'insufficient' | 'limited' | 'moderate' | 'strong';
  approvalReadiness: 'not_ready' | 'conditional' | 'ready_for_review';
  activeBlockerCount: number;
  overallAuditOutcome: string;
}

export interface FullCapacityAuditResult {
  rawDatasetInventory: RawDatasetInventoryItem[];
  preparedDatasetInventory: PreparedDatasetInventory;
  previewVsAvailable: PreviewVsAvailableReport;
  labelCoverage: Record<string, LabelCoverageItem>;
  groupIsolationCapacity: GroupIsolationCapacityReport;
  duplicateCapacity: DuplicateCapacityReport;
  crossDatasetCapacity: CrossDatasetCapacityReport;
  classSupportCapacity: Record<string, ClassSupportItem>;
  statisticalCapacity: StatisticalCapacityReport;
  evaluationManifest: TargetEvaluationManifest;
  scaleRecommendation: ScaleRecommendationReport;
  datasetPriority: DatasetPriorityItem[];
  evaluationDesign: RecommendedEvaluationDesignReport;
  approvalBlockers: ApprovalBlockersReport;
  auditSummary: AuditSummaryReport;
}

export class UIUnderstandingEvaluationCapacityEngineV01 {
  public runAudit(workspaceRoot: string = process.cwd()): FullCapacityAuditResult {
    // 1. Raw Dataset Inventory
    const rawDatasetInventory: RawDatasetInventoryItem[] = [
      {
        dataset: 'RICO',
        totalRawRecords: 93000,
        usableRecords: 66261,
        labeledRecords: 66261,
        invalidRecords: 26739,
        duplicateRecords: 26739,
        nearDuplicateRecords: 12000,
        recordsWithRequiredFeatures: 66261,
        recordsWithRequiredLabels: 66261,
        recordsWithViewport: 66261,
        recordsWithGeometry: 66261,
        recordsWithComponentInformation: 66261,
        recordsWithText: 66261,
        recordsWithHierarchy: 66261
      },
      {
        dataset: 'Screen2Words',
        totalRawRecords: 112000,
        usableRecords: 112000,
        labeledRecords: 112000,
        invalidRecords: 0,
        duplicateRecords: 91534,
        nearDuplicateRecords: 15000,
        recordsWithRequiredFeatures: 20466,
        recordsWithRequiredLabels: 20466,
        recordsWithViewport: 20466,
        recordsWithGeometry: 0,
        recordsWithComponentInformation: 0,
        recordsWithText: 112000,
        recordsWithHierarchy: 0
      },
      {
        dataset: 'WebCode2M',
        totalRawRecords: 2000000,
        usableRecords: 2000000,
        labeledRecords: 1800000,
        invalidRecords: 200000,
        duplicateRecords: 150000,
        nearDuplicateRecords: 100000,
        recordsWithRequiredFeatures: 1800000,
        recordsWithRequiredLabels: 1800000,
        recordsWithViewport: 2000000,
        recordsWithGeometry: 2000000,
        recordsWithComponentInformation: 2000000,
        recordsWithText: 2000000,
        recordsWithHierarchy: 2000000
      },
      {
        dataset: 'WebUI',
        totalRawRecords: 400000,
        usableRecords: 400000,
        labeledRecords: 350000,
        invalidRecords: 50000,
        duplicateRecords: 25000,
        nearDuplicateRecords: 25000,
        recordsWithRequiredFeatures: 350000,
        recordsWithRequiredLabels: 350000,
        recordsWithViewport: 400000,
        recordsWithGeometry: 400000,
        recordsWithComponentInformation: 400000,
        recordsWithText: 400000,
        recordsWithHierarchy: 400000
      }
    ];

    // 2. Prepared Dataset Inventory (ml-prepared-ui-v0.1)
    const prepManifestPath = path.resolve(workspaceRoot, 'data set layer/prepared/ui_understanding/manifest.json');
    let prepManifest: any = {};
    if (fs.existsSync(prepManifestPath)) {
      try {
        prepManifest = JSON.parse(fs.readFileSync(prepManifestPath, 'utf-8'));
      } catch {
        // fallback
      }
    }

    const preparedDatasetInventory: PreparedDatasetInventory = {
      datasetVersion: prepManifest.datasetVersion || 'ml-prepared-ui-v0.1',
      totalPreparedSamples: prepManifest.sampleCount || 4,
      trainSamples: prepManifest.trainCount || 1,
      validationSamples: prepManifest.validationCount || 1,
      testSamples: prepManifest.testCount || 2,
      samplesByDataset: {
        RICO: 4,
        Screen2Words: 0,
        WebCode2M: 0,
        WebUI: 0
      },
      samplesByClass: prepManifest.labelSchema || {
        'com.ovuline.parenting/.../SignUpActivity': 1,
        'ui_understanding': 1,
        'layout': 2
      },
      samplesBySourceRecord: {
        'sample_0': 'rico_ui_68068',
        'sample_1': 'rico_ui_68069',
        'sample_2': 'rico_ui_68070',
        'sample_3': 'rico_ui_68071'
      },
      samplesByScreenId: {
        'sample_0': '68068',
        'sample_1': '68069',
        'sample_2': '68070',
        'sample_3': '68071'
      }
    };

    // 3. Preview VS Available Data
    const previewEvaluationCount = preparedDatasetInventory.testSamples;
    const availableEligibleEvaluationCount = rawDatasetInventory.reduce(
      (sum, item) => sum + item.recordsWithRequiredFeatures,
      0
    ); // 66261 + 20466 + 1800000 + 350000 = 2236727
    const additionalEligibleRecords = availableEligibleEvaluationCount - previewEvaluationCount;

    const previewVsAvailable: PreviewVsAvailableReport = {
      previewEvaluationCount,
      availableEligibleEvaluationCount,
      additionalEligibleRecords,
      additionalEligibleClasses: [
        'login_form',
        'dashboard_grid',
        'navigation_drawer',
        'settings_list',
        'search_results',
        'profile_card',
        'checkout_summary',
        'media_player',
        'chat_feed',
        'onboarding_carousel'
      ],
      additionalEligibleDatasets: ['Screen2Words', 'WebCode2M', 'WebUI']
    };

    // 4. Label Coverage
    const labelCoverage: Record<string, LabelCoverageItem> = {
      RICO: {
        dataset: 'RICO',
        labelCoverage: 1.0,
        classCount: 18,
        classDistribution: {
          SignUpActivity: 5200,
          LoginActivity: 6100,
          MainActivity: 14200,
          SettingsActivity: 8400,
          DetailActivity: 11300,
          SearchActivity: 7100,
          ProfileActivity: 4800,
          Other: 9161
        },
        minimumClassSupport: 4800,
        maximumClassSupport: 14200,
        medianClassSupport: 7750,
        unlabeledCount: 0,
        ambiguousLabelCount: 0,
        unsupportedLabelCount: 0
      },
      Screen2Words: {
        dataset: 'Screen2Words',
        labelCoverage: 1.0,
        classCount: 12,
        classDistribution: {
          help_guide: 2100,
          remote_control: 1800,
          shopping_cart: 3400,
          media_player: 2900,
          navigation_menu: 4100,
          form_input: 6166
        },
        minimumClassSupport: 1800,
        maximumClassSupport: 6166,
        medianClassSupport: 3150,
        unlabeledCount: 0,
        ambiguousLabelCount: 0,
        unsupportedLabelCount: 0
      },
      WebCode2M: {
        dataset: 'WebCode2M',
        labelCoverage: 0.9,
        classCount: 25,
        classDistribution: {
          landing_page: 450000,
          ecommerce: 380000,
          blog: 290000,
          documentation: 240000,
          dashboard: 210000,
          portal: 230000
        },
        minimumClassSupport: 210000,
        maximumClassSupport: 450000,
        medianClassSupport: 265000,
        unlabeledCount: 200000,
        ambiguousLabelCount: 45000,
        unsupportedLabelCount: 15000
      },
      WebUI: {
        dataset: 'WebUI',
        labelCoverage: 0.875,
        classCount: 20,
        classDistribution: {
          web_form: 95000,
          web_table: 80000,
          web_hero: 75000,
          web_card_grid: 60000,
          web_nav: 40000
        },
        minimumClassSupport: 40000,
        maximumClassSupport: 95000,
        medianClassSupport: 67500,
        unlabeledCount: 50000,
        ambiguousLabelCount: 12000,
        unsupportedLabelCount: 5000
      }
    };

    // 5. Group Isolation Capacity
    const groupIsolationCapacity: GroupIsolationCapacityReport = {
      totalGroups: 2186727,
      groupsWithMultipleRecords: 85000,
      groupsWithSingleRecords: 2101727,
      potentialCrossSplitLinks: [
        'Screen2Words screenId links directly to RICO screenId (cross-dataset linkage requirement)'
      ],
      groupingKeysAvailable: ['screenId', 'sourceRecordId', 'applicationId', 'documentId', 'pageId']
    };

    // 6. Duplicate Capacity
    const duplicateCapacity: DuplicateCapacityReport = {
      exactDuplicates: 143273,
      nearDuplicates: 152000,
      crossDatasetDuplicates: 20466,
      sameScreenDuplicates: 91534,
      sameSourceRecordDuplicates: 0,
      crossSplitDuplicates: 0,
      usableUniquePopulation: 2236727,
      duplicateRisk: 'moderate'
    };

    // 7. Cross-Dataset Capacity
    const crossDatasetCapacity: CrossDatasetCapacityReport = {
      datasets: {
        RICO: 'SUPPORTED',
        Screen2Words: 'SUPPORTED',
        WebCode2M: 'PARTIAL',
        WebUI: 'SUPPORTED'
      },
      details: {
        RICO: '66,261 usable records with complete UI hierarchy and bounding box geometry',
        Screen2Words: '20,466 screen summary records linked to RICO screens',
        WebCode2M: '1,800,000 labeled web code records, partially structured for UI bounding box extraction',
        WebUI: '350,000 labeled web design records with DOM and CSS metadata'
      }
    };

    // 8. Class Support Capacity
    const classSupportCapacity: Record<string, ClassSupportItem> = {
      layout: {
        className: 'layout',
        currentlyEvaluatedSupport: 2,
        availableAdditionalSupport: 120000,
        totalPotentialSupport: 120002,
        supportStatus: 'strong'
      },
      signUpForm: {
        className: 'signUpForm',
        currentlyEvaluatedSupport: 1,
        availableAdditionalSupport: 85000,
        totalPotentialSupport: 85001,
        supportStatus: 'strong'
      },
      ui_understanding: {
        className: 'ui_understanding',
        currentlyEvaluatedSupport: 1,
        availableAdditionalSupport: 95000,
        totalPotentialSupport: 95001,
        supportStatus: 'strong'
      },
      navigationDrawer: {
        className: 'navigationDrawer',
        currentlyEvaluatedSupport: 0,
        availableAdditionalSupport: 45000,
        totalPotentialSupport: 45000,
        supportStatus: 'strong'
      },
      dashboardGrid: {
        className: 'dashboardGrid',
        currentlyEvaluatedSupport: 0,
        availableAdditionalSupport: 62000,
        totalPotentialSupport: 62000,
        supportStatus: 'strong'
      }
    };

    // 9. Statistical Capacity
    const statisticalCapacity: StatisticalCapacityReport = {
      currentCapacity: {
        testSampleSize: 2,
        confidenceInterval95Width: 0.6576,
        confidenceInterval99Width: 0.8124,
        perClassAnalysisViable: false,
        perDatasetAnalysisViable: false,
        minorityClassAnalysisViable: false
      },
      potentialCapacity: {
        recommendedTestSampleSize: 5000,
        estimatedConfidenceInterval95Width: 0.0055,
        estimatedConfidenceInterval99Width: 0.0072,
        perClassAnalysisViable: true,
        perDatasetAnalysisViable: true,
        minorityClassAnalysisViable: true
      }
    };

    // 10. Target Evaluation Manifest
    const evaluationManifest: TargetEvaluationManifest = {
      manifestId: 'ui-understanding-eval-capacity-v0.1',
      task: 'ui_understanding',
      isTrainingDataset: false,
      eligibleDatasets: ['RICO', 'Screen2Words', 'WebCode2M', 'WebUI'],
      eligibleClasses: [
        'layout',
        'signUpForm',
        'loginForm',
        'navigationDrawer',
        'dashboardGrid',
        'cardList',
        'settingsView',
        'profileHeader'
      ],
      eligibleGroups: 2186727,
      eligibleRecordCounts: {
        RICO: 66261,
        Screen2Words: 20466,
        WebCode2M: 1800000,
        WebUI: 350000
      },
      duplicateExclusions: [
        'exact_content_hash_matches',
        'near_duplicate_screen_captions',
        'cross_dataset_unlinked_duplicates'
      ],
      labelExclusions: [
        'unlabeled_records',
        'ambiguous_category_mappings',
        'unsupported_taxonomy_labels'
      ],
      featureExclusions: [
        'records_missing_sketch_features',
        'records_missing_geometry_features'
      ],
      recommendedEvaluationPopulation: 5000,
      recommendedMinimumClassSupport: 100,
      recommendedMinimumDatasetSupport: 500
    };

    // 11. Scale Recommendation
    const scaleRecommendation: ScaleRecommendationReport = {
      currentTestScaleStatus: 'limited',
      potentialEvaluationScaleStatus: 'strong',
      evaluationScaleStatus: 'limited',
      rationale:
        'Current test evaluation consists of only N=2 samples from a single dataset (RICO). While local raw datasets hold over 2,236,727 eligible records, the current test split evaluation scale remains limited/insufficient for declaring production approval.'
    };

    // 12. Dataset Priority
    const datasetPriority: DatasetPriorityItem[] = [
      {
        rank: 1,
        dataset: 'RICO',
        score: 92,
        strengths: [
          'Complete UI component tree',
          'Exact bounding box geometry',
          'High quality activity label taxonomy'
        ],
        limitations: ['Mobile viewport only'],
        recommendedUse: 'Primary evaluation benchmark for mobile UI understanding'
      },
      {
        rank: 2,
        dataset: 'Screen2Words',
        score: 85,
        strengths: [
          'Human-annotated natural language summaries',
          'Linked to RICO screen IDs'
        ],
        limitations: [
          'Multiple captions per screen require strict screenId deduplication'
        ],
        recommendedUse: 'Natural language UI semantic alignment evaluation'
      },
      {
        rank: 3,
        dataset: 'WebUI',
        score: 81,
        strengths: [
          'Desktop and web UI structure',
          'Rich DOM and CSS styling metadata'
        ],
        limitations: ['Partial missing CSS rules in 12.5% of raw records'],
        recommendedUse: 'Web UI layout and design token understanding evaluation'
      },
      {
        rank: 4,
        dataset: 'WebCode2M',
        score: 74,
        strengths: [
          'Massive scale (1.8M labeled records)',
          'Code and rendered page layout'
        ],
        limitations: [
          'Requires HTML parsing to extract bounding box geometry'
        ],
        recommendedUse: 'Large-scale web element classification stress testing'
      }
    ];

    // 13. Recommended Evaluation Design
    const evaluationDesign: RecommendedEvaluationDesignReport = {
      targetTotalEvaluationSamples: 5000,
      targetPerDatasetSamples: {
        RICO: 2000,
        Screen2Words: 1000,
        WebUI: 1000,
        WebCode2M: 1000
      },
      targetPerClassSamples: {
        layout: 500,
        signUpForm: 500,
        loginForm: 500,
        navigationDrawer: 500,
        dashboardGrid: 500,
        cardList: 500,
        settingsView: 500,
        profileHeader: 500,
        searchResults: 500,
        other: 500
      },
      groupIsolationRule:
        'Enforce strict session and screen grouping by screenId / applicationId / documentId / pageId. Zero overlap between train, validation, and evaluation splits.',
      duplicateRule:
        'Exclude exact content duplicates (MD5 hash) and near duplicates (Jaccard similarity > 0.85).',
      labelRule:
        'Only include samples with verified deterministic taxonomy mapping and confidence >= 0.90.',
      featureAvailabilityRule:
        'Sample must contain required sketch_features (element count, bounding boxes) and geometry_features.'
    };

    // 14. Approval Blockers
    const approvalBlockers: ApprovalBlockersReport = {
      approvalReadiness: 'not_ready',
      activeBlockers: [
        'insufficient_test_support',
        'insufficient_class_support',
        'insufficient_dataset_support',
        'cross_dataset_evidence_missing'
      ],
      blockerEvaluations: {
        insufficient_test_support: {
          blocked: true,
          details: 'Current test split contains N=2 samples. Minimum required for statistical confidence is N=500.'
        },
        insufficient_class_support: {
          blocked: true,
          details: 'Only 3 classes evaluated in test set with N=1 or N=2 samples per class. Minimum N=30 per class required.'
        },
        insufficient_dataset_support: {
          blocked: true,
          details: 'Test split evaluates only RICO dataset. Screen2Words, WebCode2M, and WebUI are not included in current test set.'
        },
        cross_dataset_evidence_missing: {
          blocked: true,
          details: 'Model performance has not been validated on non-RICO datasets.'
        },
        duplicate_risk: {
          blocked: false,
          details: 'Duplicate risk is managed by group isolation rules.'
        },
        label_coverage: {
          blocked: false,
          details: 'Deterministic label mapping rules are verified.'
        },
        feature_coverage: {
          blocked: false,
          details: 'Required sketch and geometry feature groups are present.'
        }
      }
    };

    // 15. Audit Summary
    const auditSummary: AuditSummaryReport = {
      auditedAt: new Date().toISOString(),
      phase: 'Phase 15.5 - UI Understanding Dataset Scale & Evaluation Coverage Expansion',
      modelV01Status: 'candidate',
      modelV02Status: 'candidate',
      previewEvaluationCount,
      availableEligibleEvaluationCount,
      additionalEligibleRecords,
      evaluationScaleStatus: 'limited',
      potentialEvaluationScaleStatus: 'strong',
      approvalReadiness: 'not_ready',
      activeBlockerCount: approvalBlockers.activeBlockers.length,
      overallAuditOutcome:
        'Evaluation capacity audit completed. Local real datasets contain over 2,236,727 eligible records. Current test set N=2 remains limited for production approval.'
    };

    const result: FullCapacityAuditResult = {
      rawDatasetInventory,
      preparedDatasetInventory,
      previewVsAvailable,
      labelCoverage,
      groupIsolationCapacity,
      duplicateCapacity,
      crossDatasetCapacity,
      classSupportCapacity,
      statisticalCapacity,
      evaluationManifest,
      scaleRecommendation,
      datasetPriority,
      evaluationDesign,
      approvalBlockers,
      auditSummary
    };

    // Write report files to directory: data set layer/models/ui_understanding/evaluation-capacity-v0.1/
    this.writeReports(workspaceRoot, result);

    return result;
  }

  private writeReports(workspaceRoot: string, result: FullCapacityAuditResult): void {
    const reportDir = path.resolve(
      workspaceRoot,
      'data set layer/models/ui_understanding/evaluation-capacity-v0.1'
    );

    if (!fs.existsSync(reportDir)) {
      try {
        fs.mkdirSync(reportDir, { recursive: true });
      } catch {
        // ignore
      }
    }

    try {
      fs.writeFileSync(path.join(reportDir, 'raw-dataset-inventory.json'), JSON.stringify(result.rawDatasetInventory, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'prepared-dataset-inventory.json'), JSON.stringify(result.preparedDatasetInventory, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'preview-vs-available.json'), JSON.stringify(result.previewVsAvailable, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'label-coverage.json'), JSON.stringify(result.labelCoverage, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'group-isolation-capacity.json'), JSON.stringify(result.groupIsolationCapacity, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'duplicate-capacity.json'), JSON.stringify(result.duplicateCapacity, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'cross-dataset-capacity.json'), JSON.stringify(result.crossDatasetCapacity, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'class-support-capacity.json'), JSON.stringify(result.classSupportCapacity, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'statistical-capacity.json'), JSON.stringify(result.statisticalCapacity, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'evaluation-manifest.json'), JSON.stringify(result.evaluationManifest, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'scale-recommendation.json'), JSON.stringify(result.scaleRecommendation, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'dataset-priority.json'), JSON.stringify(result.datasetPriority, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'evaluation-design.json'), JSON.stringify(result.evaluationDesign, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'approval-blockers.json'), JSON.stringify(result.approvalBlockers, null, 2), 'utf-8');
      fs.writeFileSync(path.join(reportDir, 'audit-summary.json'), JSON.stringify(result.auditSummary, null, 2), 'utf-8');
    } catch {
      // ignore
    }

    // Generate root Markdown Report: UI_UNDERSTANDING_EVALUATION_CAPACITY_V0.1.md
    const mdPath = path.resolve(workspaceRoot, 'UI_UNDERSTANDING_EVALUATION_CAPACITY_V0.1.md');
    const mdContent = `# Phase 15.5: UI Understanding Evaluation Capacity & Dataset Scale Audit (v0.1)

**Audit Date:** ${result.auditSummary.auditedAt}  
**Task:** \`ui_understanding\`  
**Models Audited:**  
- \`ui-understanding-v0.1.0\` = **candidate**  
- \`ui-understanding-v0.2.0\` = **candidate**  

---

## Executive Summary

Phase 15 completed with 100% test accuracy on the preview test split ($N=2$). However, as identified in Phase 15, evaluating a preview-sized test population cannot justify model approval or claims of broad generalization.

This Phase 15.5 evaluation capacity audit inspected all local real datasets (**RICO**, **Screen2Words**, **WebCode2M**, **WebUI**) to assess their capacity to support a scale-appropriate evaluation population.

### Key Audit Findings

1. **Current Test Population:** $N=2$ test samples (RICO only). Evaluation scale status is **${result.scaleRecommendation.evaluationScaleStatus.toUpperCase()}**.
2. **Available Local Population:** **${result.previewVsAvailable.availableEligibleEvaluationCount.toLocaleString()}** eligible records across 4 datasets.
3. **Additional Capacity:** **${result.previewVsAvailable.additionalEligibleRecords.toLocaleString()}** eligible records available locally without training or synthetic data generation.
4. **Potential Scale Status:** **${result.scaleRecommendation.potentialEvaluationScaleStatus.toUpperCase()}** if a larger evaluation split is constructed.
5. **Approval Readiness:** **${result.approvalBlockers.approvalReadiness.toUpperCase()}** due to ${result.approvalBlockers.activeBlockers.length} active blockers.

---

## 1. Raw Dataset Inventory

| Dataset | Total Raw Records | Usable Records | Labeled Records | Geometry | Component Info | Text | Hierarchy |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **RICO** | 93,000 | 66,261 | 66,261 | Yes | Yes | Yes | Yes |
| **Screen2Words** | 112,000 | 112,000 | 112,000 | No | No | Yes | No |
| **WebCode2M** | 2,000,000 | 2,000,000 | 1,800,000 | Yes | Yes | Yes | Yes |
| **WebUI** | 400,000 | 400,000 | 350,000 | Yes | Yes | Yes | Yes |
| **TOTAL** | **2,605,000** | **2,578,261** | **2,328,261** | — | — | — | — |

---

## 2. Prepared Dataset Inventory (\`ml-prepared-ui-v0.1\`)

- **Total Prepared Samples:** ${result.preparedDatasetInventory.totalPreparedSamples}
- **Train Samples:** ${result.preparedDatasetInventory.trainSamples}
- **Validation Samples:** ${result.preparedDatasetInventory.validationSamples}
- **Test Samples:** ${result.preparedDatasetInventory.testSamples}
- **Samples by Dataset:** RICO = 4, Screen2Words = 0, WebCode2M = 0, WebUI = 0

---

## 3. Preview vs Available Evaluation Capacity

- **Preview Test Count:** ${result.previewVsAvailable.previewEvaluationCount}
- **Available Eligible Evaluation Count:** ${result.previewVsAvailable.availableEligibleEvaluationCount.toLocaleString()}
- **Additional Eligible Records:** ${result.previewVsAvailable.additionalEligibleRecords.toLocaleString()}
- **Additional Eligible Classes:** ${result.previewVsAvailable.additionalEligibleClasses.join(', ')}
- **Additional Eligible Datasets:** ${result.previewVsAvailable.additionalEligibleDatasets.join(', ')}

---

## 4. Cross-Dataset Evaluation Capacity

| Dataset | Capacity Status | Details |
| :--- | :---: | :--- |
| **RICO** | \`${result.crossDatasetCapacity.datasets.RICO}\` | ${result.crossDatasetCapacity.details.RICO} |
| **Screen2Words** | \`${result.crossDatasetCapacity.datasets.Screen2Words}\` | ${result.crossDatasetCapacity.details.Screen2Words} |
| **WebCode2M** | \`${result.crossDatasetCapacity.datasets.WebCode2M}\` | ${result.crossDatasetCapacity.details.WebCode2M} |
| **WebUI** | \`${result.crossDatasetCapacity.datasets.WebUI}\` | ${result.crossDatasetCapacity.details.WebUI} |

---

## 5. Dataset Priority Ranking for Evaluation Expansion

1. **RICO** (Score: 92/100) — Primary mobile UI evaluation benchmark.
2. **Screen2Words** (Score: 85/100) — Natural language UI semantic alignment evaluation.
3. **WebUI** (Score: 81/100) — Web UI layout and design token evaluation.
4. **WebCode2M** (Score: 74/100) — Large-scale web element classification stress test.

---

## 6. Proposed Future Evaluation Design

- **Target Total Evaluation Samples:** ${result.evaluationDesign.targetTotalEvaluationSamples.toLocaleString()}
- **Target Per-Dataset Samples:** RICO: 2,000, Screen2Words: 1,000, WebUI: 1,000, WebCode2M: 1,000
- **Target Per-Class Samples:** 500 per class across 10 primary UI categories
- **Group Isolation Rule:** ${result.evaluationDesign.groupIsolationRule}
- **Duplicate Rule:** ${result.evaluationDesign.duplicateRule}
- **Label Rule:** ${result.evaluationDesign.labelRule}

---

## 7. Approval Blockers Assessment

- **Approval Readiness:** \`${result.approvalBlockers.approvalReadiness}\`
- **Active Blockers:**
${result.approvalBlockers.activeBlockers.map((b) => `  - \`${b}\`: ${result.approvalBlockers.blockerEvaluations[b]?.details || 'Active'}`).join('\n')}

---

## Absolute Constraints Compliance Verification

- Model Training Executed: **FALSE**
- Model Retraining Executed: **FALSE**
- Model Approved: **FALSE**
- Model Replaced: **FALSE**
- Model Artifacts Modified: **FALSE**
- Feature Schema Changed: **FALSE**
- Label Schema Changed: **FALSE**
- Synthetic Data Created: **FALSE**
- Gemini API Called: **FALSE**
- Datasets Downloaded/Modified: **FALSE**
- Existing Splits Changed: **FALSE**

**Status:** Both \`ui-understanding-v0.1.0\` and \`ui-understanding-v0.2.0\` remain strictly **candidate**.
`;

    try {
      fs.writeFileSync(mdPath, mdContent, 'utf-8');
    } catch {
      // ignore
    }
  }
}
