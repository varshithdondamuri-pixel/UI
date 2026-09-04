import { MLOrchestratorTaskIdentifier, MLOrchestrationFailureCode } from './UIMLOrchestratorTypes';

export class UIMLFeatureSchemaResolver {
  private static readonly SCHEMA_MAPPING: Record<MLOrchestratorTaskIdentifier, string> = {
    ui_understanding: 'ui-understanding-features-v0.2',
    layout_prediction: 'layout-prediction-features-v0.2',
    component_recommendation: 'component-recommendation-features-v0.2',
    visual_style_recommendation: 'visual-style-features-v0.2'
  };

  public static getExpectedSchema(task: MLOrchestratorTaskIdentifier): string {
    return this.SCHEMA_MAPPING[task];
  }

  public static getAllSchemas(): Record<MLOrchestratorTaskIdentifier, string> {
    return { ...this.SCHEMA_MAPPING };
  }

  public static resolveSchema(
    task: MLOrchestratorTaskIdentifier,
    requestedSchema?: string
  ): { valid: boolean; schemaId: string; expectedSchema: string; failureCode?: MLOrchestrationFailureCode; reason?: string } {
    const expected = this.getExpectedSchema(task);
    if (!requestedSchema) {
      return { valid: true, schemaId: expected, expectedSchema: expected };
    }

    if (requestedSchema !== expected) {
      return {
        valid: false,
        schemaId: requestedSchema,
        expectedSchema: expected,
        failureCode: 'FEATURE_SCHEMA_MISMATCH',
        reason: `Feature schema mismatch for task '${task}': requested '${requestedSchema}', expected '${expected}'.`
      };
    }

    return { valid: true, schemaId: expected, expectedSchema: expected };
  }
}
