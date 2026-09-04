import { MLTaskSample } from '../../dataset/preparation/TaskPreparationTypes';
import { FeatureLabelCorrelation } from './AuditTypes';

export class FeatureLabelCorrelationAnalyzer {
  public analyzeCorrelations(samples: MLTaskSample[]): FeatureLabelCorrelation[] {
    const featureNames = ['canvasObjectCount', 'hasImageScreenshot', 'textListLength', 'viewportWidth', 'elementCount'];
    const results: FeatureLabelCorrelation[] = [];

    for (const feat of featureNames) {
      const valToClassesMap = new Map<string, Set<string>>();
      const valSet = new Set<string>();

      for (const s of samples) {
        let valStr = '0';
        const f = s.inputFeatures || {};

        if (feat === 'canvasObjectCount') valStr = String(f.canvasObjectCount || 0);
        if (feat === 'hasImageScreenshot') valStr = String(Boolean(f.hasImageScreenshot));
        if (feat === 'textListLength') valStr = String(f.textListLength || 0);
        if (feat === 'viewportWidth') valStr = String(f.viewport?.width || 1280);
        if (feat === 'elementCount') valStr = String(s.labels?.elementCount || 1);

        valSet.add(valStr);

        const targetClass = String(s.labels?.rootClass || s.labels?.layoutLabel || s.labels?.primaryComponent || 'other');
        if (!valToClassesMap.has(valStr)) valToClassesMap.set(valStr, new Set());
        valToClassesMap.get(valStr)!.add(targetClass);
      }

      let directMappingCount = 0;
      for (const [_, classSet] of valToClassesMap.entries()) {
        if (classSet.size === 1) {
          directMappingCount++;
        }
      }

      const hasDirectMappingToClass = directMappingCount > 0 && directMappingCount === valSet.size;
      let correlationStatus: FeatureLabelCorrelation['correlationStatus'] = 'normal';
      let notes = 'Feature exhibits normal variation across classes.';

      if (valSet.size <= 2 && samples.length > 5) {
        correlationStatus = 'potential_shortcut';
        notes = 'Low cardinality feature may act as a class decision boundary shortcut.';
      } else if (hasDirectMappingToClass) {
        correlationStatus = 'suspicious';
        notes = 'Feature values map 1-to-1 with specific output classes in sample pool.';
      }

      results.push({
        featureName: feat,
        cardinality: valSet.size,
        hasDirectMappingToClass,
        correlationStatus,
        notes
      });
    }

    return results;
  }
}
