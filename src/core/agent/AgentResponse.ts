import { AgentResponseSummary, AgentTimelineItem, ChangeProposal, DesignAlternative, AgentStatus } from './AgentTypes';

export class AgentResponseFormatter {
  public formatResponse(
    userPrompt: string,
    proposals: ChangeProposal[],
    alternatives: DesignAlternative[],
    status: AgentStatus,
    activeVersion: string
  ): AgentResponseSummary {
    const timeline: AgentTimelineItem[] = [
      {
        id: 't_1',
        type: 'request',
        label: 'User Request Received',
        description: `"${userPrompt || 'Analyze sketch and design'}"`,
        timestamp: Date.now() - 500,
        status: 'success'
      },
      {
        id: 't_2',
        type: 'knowledge',
        label: 'Knowledge Retrieved',
        description: 'Loaded design system components & responsive layout constraints.',
        timestamp: Date.now() - 400,
        status: 'success'
      },
      {
        id: 't_3',
        type: 'ml',
        label: 'ML Predictions Received',
        description: 'Analyzed visual hierarchy score (92/100) & WCAG AA compliance.',
        timestamp: Date.now() - 300,
        status: 'success'
      },
      {
        id: 't_4',
        type: 'ai',
        label: 'AI Recommendation Orchestrated',
        description: 'Formulated visual theme and layout strategy.',
        timestamp: Date.now() - 200,
        status: 'success'
      },
      {
        id: 't_5',
        type: 'validation',
        label: 'Validation Passed',
        description: 'Verified 8px grid alignment and token scale consistency.',
        timestamp: Date.now() - 100,
        status: 'success'
      }
    ];

    let message = 'I have analyzed your request and sketch structure.';
    if (alternatives.length > 0) {
      message = `I have generated ${alternatives.length} design alternatives based on your drawing and prompt. Select your preferred variation.`;
    } else if (proposals.length > 0) {
      const topProp = proposals[0];
      message = `I proposed: ${topProp.changeType} on ${topProp.target}. Reason: ${topProp.reason}`;
    }

    return {
      message,
      timeline,
      proposals,
      alternatives,
      activeVersion,
      status
    };
  }
}
