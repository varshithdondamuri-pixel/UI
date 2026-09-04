import { ICommand, CoreEvent } from '../../types';
import { TypedEventBus } from '../events/EventBus';

export class HistoryEngine {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private eventBus: TypedEventBus;
  private maxHistory = 100;

  constructor(eventBus: TypedEventBus) {
    this.eventBus = eventBus;
  }

  public execute(command: ICommand): void {
    command.execute();
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.emitChange();
  }

  public undo(): void {
    if (!this.canUndo()) return;
    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
    this.emitChange();
  }

  public redo(): void {
    if (!this.canRedo()) return;
    const command = this.redoStack.pop()!;
    command.execute();
    this.undoStack.push(command);
    this.emitChange();
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.emitChange();
  }

  private emitChange(): void {
    this.eventBus.emit(CoreEvent.HISTORY_CHANGED, {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }
}
