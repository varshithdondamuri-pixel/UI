import { DesignVariantComparison } from './FeedbackTypes';

export interface UserSelectionState {
  designId: string;
  selectedBlueprintId?: string;
  selectedVisualOptionId?: string;
  rejectedOptionIds: string[];
  selectedComponents: string[];
  rejectedComponents: string[];
  selectedThemeId?: string;
  selectedStyleId?: string;
  variantComparisons: DesignVariantComparison[];
  timestamp: number;
}

export class SelectionTracker {
  private selectionsMap: Map<string, UserSelectionState> = new Map();
  private totalSelections: number = 0;
  private totalRejections: number = 0;

  public recordBlueprintSelection(designId: string, blueprintId: string): void {
    const state = this.getOrCreateState(designId);
    state.selectedBlueprintId = blueprintId;
    state.timestamp = Date.now();
    this.totalSelections++;
  }

  public recordVisualOptionSelection(designId: string, selectedOptionId: string, rejectedOptionIds: string[] = []): void {
    const state = this.getOrCreateState(designId);
    state.selectedVisualOptionId = selectedOptionId;
    state.rejectedOptionIds = Array.from(new Set([...state.rejectedOptionIds, ...rejectedOptionIds]));
    state.timestamp = Date.now();
    this.totalSelections++;
    this.totalRejections += rejectedOptionIds.length;
  }

  public recordComponentSelection(designId: string, componentId: string, isSelected: boolean): void {
    const state = this.getOrCreateState(designId);
    if (isSelected) {
      if (!state.selectedComponents.includes(componentId)) {
        state.selectedComponents.push(componentId);
        this.totalSelections++;
      }
    } else {
      if (!state.rejectedComponents.includes(componentId)) {
        state.rejectedComponents.push(componentId);
        this.totalRejections++;
      }
    }
    state.timestamp = Date.now();
  }

  public recordThemeSelection(designId: string, themeId: string): void {
    const state = this.getOrCreateState(designId);
    state.selectedThemeId = themeId;
    state.timestamp = Date.now();
    this.totalSelections++;
  }

  public recordStyleSelection(designId: string, styleId: string): void {
    const state = this.getOrCreateState(designId);
    state.selectedStyleId = styleId;
    state.timestamp = Date.now();
    this.totalSelections++;
  }

  public recordVariantComparison(designId: string, comparison: Omit<DesignVariantComparison, 'comparisonId' | 'timestamp'>): DesignVariantComparison {
    const state = this.getOrCreateState(designId);

    const record: DesignVariantComparison = {
      ...comparison,
      comparisonId: 'comp_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };

    state.variantComparisons.push(record);
    state.timestamp = Date.now();

    this.totalSelections++;
    this.totalRejections += comparison.rejectedVariantIds.length;

    return record;
  }

  public getSelectionsForDesign(designId: string): UserSelectionState | null {
    return this.selectionsMap.get(designId) || null;
  }

  public getAllSelections(): UserSelectionState[] {
    return Array.from(this.selectionsMap.values());
  }

  public getTotalSelectionsCount(): number {
    return this.totalSelections;
  }

  public getTotalRejectionsCount(): number {
    return this.totalRejections;
  }

  private getOrCreateState(designId: string): UserSelectionState {
    let state = this.selectionsMap.get(designId);
    if (!state) {
      state = {
        designId,
        rejectedOptionIds: [],
        selectedComponents: [],
        rejectedComponents: [],
        variantComparisons: [],
        timestamp: Date.now()
      };
      this.selectionsMap.set(designId, state);
    }
    return state;
  }
}
