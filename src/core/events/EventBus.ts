import { CoreEvent, CoreEventPayloads } from '../../types';

type EventCallback<K extends CoreEvent> = (payload: CoreEventPayloads[K]) => void;

export class TypedEventBus {
  private listeners: Map<CoreEvent, Set<EventCallback<any>>> = new Map();

  public on<K extends CoreEvent>(event: K, callback: EventCallback<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(callback as EventCallback<any>);

    return () => {
      set.delete(callback as EventCallback<any>);
    };
  }

  public emit<K extends CoreEvent>(event: K, payload: CoreEventPayloads[K]): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((callback) => {
        try {
          callback(payload);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
