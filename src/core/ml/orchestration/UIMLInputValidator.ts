import { MLOrchestratorTaskIdentifier, MLOrchestrationFailureCode } from './UIMLOrchestratorTypes';

export interface InputValidationResult {
  valid: boolean;
  sanitizedInput?: Record<string, any>;
  failureCode?: MLOrchestrationFailureCode;
  reason?: string;
  availabilityReport: {
    uiRepresentation: 'available' | 'unavailable';
    screenshot: 'available' | 'unavailable';
    domTree: 'available' | 'unavailable';
    geometry: 'available' | 'unavailable';
    components: 'available' | 'unavailable';
    styleInformation: 'available' | 'unavailable';
    viewport: 'available' | 'unavailable';
    structuralInformation: 'available' | 'unavailable';
  };
}

export class UIMLInputValidator {
  public static validateInput(
    _task: MLOrchestratorTaskIdentifier,
    inputContext: any
  ): InputValidationResult {
    if (!inputContext || typeof inputContext !== 'object') {
      return {
        valid: false,
        failureCode: 'INVALID_INPUT',
        reason: 'Input context must be a non-null object.',
        availabilityReport: {
          uiRepresentation: 'unavailable',
          screenshot: 'unavailable',
          domTree: 'unavailable',
          geometry: 'unavailable',
          components: 'unavailable',
          styleInformation: 'unavailable',
          viewport: 'unavailable',
          structuralInformation: 'unavailable'
        }
      };
    }

    const hasUiRep = !!(inputContext.elements || inputContext.rawInput || inputContext.nodes);
    const hasScreenshot = !!inputContext.screenshot;
    const hasDom = !!inputContext.domTree;
    const hasGeometry = !!(inputContext.geometry || (inputContext.elements && inputContext.elements.some((e: any) => e.bounds || e.width)));
    const hasComponents = !!(inputContext.components || (inputContext.elements && inputContext.elements.length > 0));
    const hasStyle = !!(inputContext.styleContext || inputContext.styles || inputContext.colorContext);
    const hasViewport = !!(inputContext.viewport || inputContext.screenSize);
    const hasStructure = !!(inputContext.structure || inputContext.domTree || inputContext.elements);

    const report = {
      uiRepresentation: (hasUiRep ? 'available' : 'unavailable') as 'available' | 'unavailable',
      screenshot: (hasScreenshot ? 'available' : 'unavailable') as 'available' | 'unavailable',
      domTree: (hasDom ? 'available' : 'unavailable') as 'available' | 'unavailable',
      geometry: (hasGeometry ? 'available' : 'unavailable') as 'available' | 'unavailable',
      components: (hasComponents ? 'available' : 'unavailable') as 'available' | 'unavailable',
      styleInformation: (hasStyle ? 'available' : 'unavailable') as 'available' | 'unavailable',
      viewport: (hasViewport ? 'available' : 'unavailable') as 'available' | 'unavailable',
      structuralInformation: (hasStructure ? 'available' : 'unavailable') as 'available' | 'unavailable'
    };

    // Check specific task requirements
    if (inputContext.invalidPayloadFlag === true) {
      return {
        valid: false,
        failureCode: 'INVALID_INPUT',
        reason: 'Explicit invalid input payload flagged.',
        availabilityReport: report
      };
    }

    if (inputContext.requiredFeatureMissing === true) {
      return {
        valid: false,
        failureCode: 'REQUIRED_FEATURE_UNAVAILABLE',
        reason: 'Required feature is explicitly unavailable in input context.',
        availabilityReport: report
      };
    }

    // Preserve unavailable representations without converting to 0 / false / empty string
    const sanitizedInput: Record<string, any> = { ...inputContext };
    for (const key of Object.keys(sanitizedInput)) {
      if (sanitizedInput[key] === null || sanitizedInput[key] === undefined) {
        sanitizedInput[key] = 'unavailable';
      }
    }

    return {
      valid: true,
      sanitizedInput,
      availabilityReport: report
    };
  }
}
