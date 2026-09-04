import { ChangeProposal } from './AgentTypes';

export interface ValidationCheckResult {
  isValid: boolean;
  score: number;
  regressionRisk: 'none' | 'low' | 'medium' | 'high';
  errors: string[];
  warnings: string[];
}

export class AgentChangeValidator {
  public validateProposal(proposal: ChangeProposal, _currentModel: any): ValidationCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let regressionRisk: ValidationCheckResult['regressionRisk'] = 'none';

    if (!proposal.target || !proposal.changeType) {
      errors.push('Proposal missing target or changeType.');
    }

    if (proposal.risk === 'high') {
      regressionRisk = 'medium';
      warnings.push('Major layout structural change proposed.');
    }

    // Static token validation
    if (proposal.changeType === 'Color Changed' && proposal.after) {
      if (!/^#([0-9a-fA-F]{3}){1,2}$/.test(proposal.after) && !proposal.after.startsWith('rgba')) {
        warnings.push('Color token format is custom or non-standard hex.');
      }
    }

    return {
      isValid: errors.length === 0,
      score: errors.length === 0 ? 95 : 40,
      regressionRisk,
      errors,
      warnings
    };
  }
}
