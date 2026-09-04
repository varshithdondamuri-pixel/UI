import { ChangeProposal } from './AgentTypes';

export class AgentApprovalManager {
  private pendingProposals: ChangeProposal[] = [];
  private approvedProposals: ChangeProposal[] = [];
  private rejectedProposals: ChangeProposal[] = [];

  public submitProposal(proposal: ChangeProposal): boolean {
    const isMajor = this.isMajorChange(proposal);
    proposal.requiresApproval = isMajor;

    this.pendingProposals.push(proposal);
    return isMajor;
  }

  public approveProposal(changeId: string): ChangeProposal | null {
    const idx = this.pendingProposals.findIndex((p) => p.changeId === changeId);
    if (idx !== -1) {
      const [approved] = this.pendingProposals.splice(idx, 1);
      this.approvedProposals.push(approved);
      return approved;
    }
    return null;
  }

  public rejectProposal(changeId: string): ChangeProposal | null {
    const idx = this.pendingProposals.findIndex((p) => p.changeId === changeId);
    if (idx !== -1) {
      const [rejected] = this.pendingProposals.splice(idx, 1);
      this.rejectedProposals.push(rejected);
      return rejected;
    }
    return null;
  }

  public getPendingProposals(): ChangeProposal[] {
    return [...this.pendingProposals];
  }

  public getApprovedProposals(): ChangeProposal[] {
    return [...this.approvedProposals];
  }

  public getRejectedProposals(): ChangeProposal[] {
    return [...this.rejectedProposals];
  }

  private isMajorChange(proposal: ChangeProposal): boolean {
    const majorTypes = ['Layout Changed', 'Theme Changed', 'Design System Changed', 'Component Removed', 'Navigation Changed'];
    return majorTypes.includes(proposal.changeType) || proposal.risk === 'high';
  }
}
