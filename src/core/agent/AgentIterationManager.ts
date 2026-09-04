import { ChangeProposal, DesignVersion } from './AgentTypes';

export class AgentIterationManager {
  private versionHistory: DesignVersion[] = [];
  private currentVersionIndex: number = -1;

  constructor() {
    this.createInitialVersion();
  }

  public createInitialVersion(): DesignVersion {
    const initial: DesignVersion = {
      version: 'v1.0.0',
      parentVersion: null,
      changeSummary: 'Initial sketch design state',
      author: 'USER',
      source: 'USER',
      timestamp: Date.now(),
      approvedChanges: [],
      rejectedChanges: []
    };

    this.versionHistory = [initial];
    this.currentVersionIndex = 0;
    return initial;
  }

  public commitIteration(
    summary: string,
    approvedChanges: ChangeProposal[],
    rejectedChanges: ChangeProposal[],
    author: 'USER' | 'AGENT' = 'AGENT',
    modelSnapshot?: any
  ): DesignVersion {
    const current = this.getCurrentVersion();
    const parentVersion = current ? current.version : null;

    const parts = (parentVersion || 'v1.0.0').replace('v', '').split('.').map(Number);
    const newVersionStr = `v${parts[0]}.${parts[1] + 1}.${parts[2]}`;

    const newVersion: DesignVersion = {
      version: newVersionStr,
      parentVersion,
      changeSummary: summary,
      author,
      source: 'COMBINED',
      timestamp: Date.now(),
      approvedChanges,
      rejectedChanges,
      modelSnapshot
    };

    // If committed after undoing back in history, prune forward history
    if (this.currentVersionIndex < this.versionHistory.length - 1) {
      this.versionHistory = this.versionHistory.slice(0, this.currentVersionIndex + 1);
    }

    this.versionHistory.push(newVersion);
    this.currentVersionIndex = this.versionHistory.length - 1;

    return newVersion;
  }

  public getCurrentVersion(): DesignVersion | null {
    if (this.currentVersionIndex >= 0 && this.currentVersionIndex < this.versionHistory.length) {
      return this.versionHistory[this.currentVersionIndex];
    }
    return null;
  }

  public getAllVersions(): DesignVersion[] {
    return [...this.versionHistory];
  }

  public canUndo(): boolean {
    return this.currentVersionIndex > 0;
  }

  public canRedo(): boolean {
    return this.currentVersionIndex < this.versionHistory.length - 1;
  }

  public undoVersion(): DesignVersion | null {
    if (this.canUndo()) {
      this.currentVersionIndex--;
      return this.getCurrentVersion();
    }
    return null;
  }

  public redoVersion(): DesignVersion | null {
    if (this.canRedo()) {
      this.currentVersionIndex++;
      return this.getCurrentVersion();
    }
    return null;
  }
}
