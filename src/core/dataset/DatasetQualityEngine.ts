import { FullDesignSample } from './DatasetTypes';
import { DatasetValidator } from './DatasetValidator';

export interface DetailedQualityBreakdown {
  completenessScore: number;
  validityScore: number;
  provenanceScore: number;
  consistencyScore: number;
  evaluationConfidenceScore: number;
  humanFeedbackScore: number;
  duplicateRiskScore: number;
  sourceReliabilityScore: number;
  overallScore: number;
}

export class DatasetQualityEngine {
  private validator: DatasetValidator;

  constructor() {
    this.validator = new DatasetValidator();
  }

  public scoreSample(sample: FullDesignSample): DetailedQualityBreakdown {
    const valResult = this.validator.validateSample(sample);

    // 1. Completeness Score (Check presence of key sub-samples)
    let completeness = 0;
    if (sample.prompt) completeness += 15;
    if (sample.sketch?.canvasObjects?.length) completeness += 20;
    if (sample.semanticTree) completeness += 15;
    if (sample.intentTree) completeness += 15;
    if (sample.blueprintVariants) completeness += 10;
    if (sample.visualDesignOptions) completeness += 10;
    if (sample.evaluation) completeness += 15;
    const completenessScore = Math.min(100, completeness);

    // 2. Validity Score
    const validityScore = valResult.isValid ? 100 : Math.max(0, 100 - valResult.errors.length * 25);

    // 3. Provenance Score
    let provenanceScore = 0;
    if (sample.provenance) {
      provenanceScore += sample.provenance.sourceType === 'first_party' ? 50 : 30;
      if (sample.provenance.license === 'proprietary' || sample.provenance.license === 'MIT' || sample.provenance.license === 'CC-BY') provenanceScore += 30;
      if (sample.provenance.collectionDate) provenanceScore += 20;
    }

    // 4. Consistency Score
    let consistencyScore = 90;
    if (sample.userChanges?.length && !sample.finalDesign) {
      consistencyScore -= 30;
    }
    if (sample.sketch?.selectedObjects?.length && !sample.userSelections) {
      consistencyScore -= 10;
    }
    consistencyScore = Math.max(0, consistencyScore);

    // 5. Evaluation Confidence Score
    const evaluationConfidenceScore = sample.evaluation?.finalRating ? Math.min(100, sample.evaluation.finalRating) : 75;

    // 6. Human Feedback Score
    const humanFeedbackScore = sample.evaluation?.humanFeedback && sample.evaluation.humanFeedback.length > 5 ? 95 : 70;

    // 7. Duplicate Risk Score (Higher score = lower risk)
    const duplicateRiskScore = sample.isDuplicate ? 30 : 100;

    // 8. Source Reliability Score
    const sourceReliabilityScore = sample.provenance?.sourceType === 'first_party' ? 100 : 85;

    // Weighted Overall Quality Calculation
    const overallScore = Math.round(
      completenessScore * 0.20 +
      validityScore * 0.20 +
      provenanceScore * 0.15 +
      consistencyScore * 0.10 +
      evaluationConfidenceScore * 0.10 +
      humanFeedbackScore * 0.10 +
      duplicateRiskScore * 0.05 +
      sourceReliabilityScore * 0.10
    );

    return {
      completenessScore,
      validityScore,
      provenanceScore,
      consistencyScore,
      evaluationConfidenceScore,
      humanFeedbackScore,
      duplicateRiskScore,
      sourceReliabilityScore,
      overallScore: Math.max(0, Math.min(100, overallScore))
    };
  }
}
