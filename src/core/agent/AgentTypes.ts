export type AgentStatus =
  | 'idle'
  | 'understanding'
  | 'planning'
  | 'designing'
  | 'comparing'
  | 'awaiting_approval'
  | 'applying'
  | 'validating'
  | 'rendering'
  | 'completed'
  | 'failed';

export type AgentIntentType =
  | 'CREATE_DESIGN'
  | 'UNDERSTAND_SKETCH'
  | 'IMPROVE_DESIGN'
  | 'CHANGE_LAYOUT'
  | 'CHANGE_STYLE'
  | 'CHANGE_COLOR'
  | 'CHANGE_TYPOGRAPHY'
  | 'CHANGE_COMPONENT'
  | 'CHANGE_SPACING'
  | 'CHANGE_RESPONSIVE'
  | 'CHANGE_ACCESSIBILITY'
  | 'GENERATE_VARIANTS'
  | 'COMPARE_VARIANTS'
  | 'SELECT_VARIANT'
  | 'REJECT_VARIANT'
  | 'UNDO_AGENT_CHANGE'
  | 'REGENERATE'
  | 'GENERATE_CODE'
  | 'ASK_QUESTION';

export type ChangeSource = 'USER' | 'KNOWLEDGE' | 'ML' | 'AI' | 'DETERMINISTIC_RULE' | 'COMBINED';

export interface ChangeProposal {
  changeId: string;
  target: string;
  changeType: string;
  before: any;
  after: any;
  reason: string;
  confidence: number;
  source: ChangeSource;
  risk: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
  timestamp: number;
}

export interface DesignVersion {
  version: string;
  parentVersion: string | null;
  changeSummary: string;
  author: 'USER' | 'AGENT';
  source: ChangeSource;
  timestamp: number;
  approvedChanges: ChangeProposal[];
  rejectedChanges: ChangeProposal[];
  modelSnapshot?: any;
}

export interface DesignAlternative {
  variantId: string;
  strategy: string;
  visualOption: any;
  predictionScore: number;
  qualityScore: number;
  accessibilityScore: number;
  trendScore: number;
  overallScore: number;
  rationale: string;
}

export interface AgentTimelineItem {
  id: string;
  type: string;
  label: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

export interface AgentResponseSummary {
  message: string;
  timeline: AgentTimelineItem[];
  proposals: ChangeProposal[];
  alternatives: DesignAlternative[];
  activeVersion: string;
  status: AgentStatus;
}
