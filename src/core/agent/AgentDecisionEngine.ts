import { AgentContextPayload } from './AgentContext';
import { ChangeProposal } from './AgentTypes';

export class AgentDecisionEngine {
  public formulateProposals(context: AgentContextPayload, intentType: string): ChangeProposal[] {
    const proposals: ChangeProposal[] = [];
    const now = Date.now();

    switch (intentType) {
      case 'CHANGE_STYLE':
      case 'CREATE_DESIGN':
        proposals.push({
          changeId: 'prop_' + Math.random().toString(36).substring(2, 9),
          target: 'Visual Theme & Design System',
          changeType: 'Theme Changed',
          before: context.visualDesignModel?.theme?.name || 'Default Theme',
          after: 'Modern Premium Dark SaaS Theme',
          reason: 'Matches user request for modern, high-contrast visual styling.',
          confidence: 0.94,
          source: 'COMBINED',
          risk: 'medium',
          requiresApproval: true,
          timestamp: now
        });
        break;

      case 'CHANGE_COLOR':
        proposals.push({
          changeId: 'prop_' + Math.random().toString(36).substring(2, 9),
          target: 'Color Palette Tokens',
          changeType: 'Color Changed',
          before: context.visualDesignModel?.colorTokens?.primary || '#3b82f6',
          after: '#6366f1',
          reason: 'Adjusted primary and surface color tokens for enhanced visual hierarchy.',
          confidence: 0.92,
          source: 'AI',
          risk: 'low',
          requiresApproval: false,
          timestamp: now
        });
        break;

      case 'CHANGE_SPACING':
        proposals.push({
          changeId: 'prop_' + Math.random().toString(36).substring(2, 9),
          target: 'Spacing System',
          changeType: 'Spacing Changed',
          before: 'Comfortable (16px base gap)',
          after: 'Compact (12px base gap)',
          reason: 'Increased layout density and card compactness per user instruction.',
          confidence: 0.95,
          source: 'DETERMINISTIC_RULE',
          risk: 'low',
          requiresApproval: false,
          timestamp: now
        });
        break;

      case 'CHANGE_RESPONSIVE':
        proposals.push({
          changeId: 'prop_' + Math.random().toString(36).substring(2, 9),
          target: 'Responsive Rules',
          changeType: 'Responsive Rule Changed',
          before: 'Desktop Grid Layout',
          after: 'Single Column Stack Viewport',
          reason: 'Optimized touch targets and vertical stacking for mobile breakpoint.',
          confidence: 0.96,
          source: 'ML',
          risk: 'low',
          requiresApproval: false,
          timestamp: now
        });
        break;

      case 'CHANGE_LAYOUT':
      default:
        proposals.push({
          changeId: 'prop_' + Math.random().toString(36).substring(2, 9),
          target: 'Layout Grid & Section Alignment',
          changeType: 'Layout Changed',
          before: 'Current Layout Structure',
          after: 'Refined Split Hero Layout with Multi-Column Cards',
          reason: 'Reordered section elements to strengthen primary Call To Action visibility.',
          confidence: 0.88,
          source: 'COMBINED',
          risk: 'high',
          requiresApproval: true,
          timestamp: now
        });
        break;
    }

    return proposals;
  }
}
