export type AgentActionKind =
  | 'UNDERSTAND_SKETCH'
  | 'PROPOSE_DESIGN'
  | 'GENERATE_ALTERNATIVES'
  | 'APPROVE_CHANGE'
  | 'REJECT_CHANGE'
  | 'APPLY_CHANGE'
  | 'REGENERATE'
  | 'GENERATE_CODE'
  | 'UNDO'
  | 'REDO';

export interface AgentAction {
  id: string;
  kind: AgentActionKind;
  payload: any;
  timestamp: number;
}

export class AgentActionFactory {
  public static createAction(kind: AgentActionKind, payload: any = {}): AgentAction {
    return {
      id: 'act_' + Math.random().toString(36).substring(2, 9),
      kind,
      payload,
      timestamp: Date.now()
    };
  }
}
