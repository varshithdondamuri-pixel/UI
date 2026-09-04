export interface StructuredDesignMemory {
  approvedPreferences: string[];
  rejectedPreferences: string[];
  selectedStyles: string[];
  selectedLayouts: string[];
  previousChanges: string[];
  currentConstraints: string[];
  userInstructions: string[];
}

export class AgentMemory {
  private memory: StructuredDesignMemory = {
    approvedPreferences: [],
    rejectedPreferences: [],
    selectedStyles: [],
    selectedLayouts: [],
    previousChanges: [],
    currentConstraints: [],
    userInstructions: []
  };

  public recordInstruction(instruction: string): void {
    const sanitized = this.sanitize(instruction);
    if (sanitized && !this.memory.userInstructions.includes(sanitized)) {
      this.memory.userInstructions.push(sanitized);
    }
  }

  public recordApproval(pref: string): void {
    if (!this.memory.approvedPreferences.includes(pref)) {
      this.memory.approvedPreferences.push(pref);
    }
  }

  public recordRejection(pref: string): void {
    if (!this.memory.rejectedPreferences.includes(pref)) {
      this.memory.rejectedPreferences.push(pref);
    }
  }

  public recordStyleSelection(style: string): void {
    if (!this.memory.selectedStyles.includes(style)) {
      this.memory.selectedStyles.push(style);
    }
  }

  public getMemory(): StructuredDesignMemory {
    return { ...this.memory };
  }

  private sanitize(str?: string): string | undefined {
    if (!str) return undefined;
    return str
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
      .replace(/(password|secret|bearer|token)\s*[:=]\s*\S+/gi, '$1: [REDACTED]');
  }
}
