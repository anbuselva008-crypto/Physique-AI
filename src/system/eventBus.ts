import { SystemEvent, SystemEventHandler, SystemEventPayloadMap, SystemEventType } from './types';

/**
 * SystemEventBus
 * Central pub/sub event system allowing engines to publish and subscribe
 * to system events without tight direct coupling.
 */
export class SystemEventBus {
  private handlers: Map<SystemEventType, Set<SystemEventHandler<any>>> = new Map();
  private eventHistory: SystemEvent[] = [];
  private maxHistorySize: number = 100;

  constructor() {
    // Initialize handler maps
    const eventTypes: SystemEventType[] = [
      'PROFILE_UPDATED',
      'CHECKIN_COMPLETED',
      'WORKOUT_COMPLETED',
      'MEAL_LOGGED',
      'PHOTO_UPLOADED',
      'MONTH_FINISHED',
      'GOAL_UPDATED',
      'RECOVERY_CHANGED',
      'MEMORY_UPDATED',
      'ROADMAP_UPDATED',
    ];

    eventTypes.forEach((type) => {
      this.handlers.set(type, new Set());
    });
  }

  /**
   * Subscribe to a system event type.
   */
  public on<T extends SystemEventType>(
    type: T,
    handler: SystemEventHandler<T>
  ): () => void {
    const handlerSet = this.handlers.get(type);
    if (handlerSet) {
      handlerSet.add(handler);
    }

    // Return unsubscribe function
    return () => {
      this.off(type, handler);
    };
  }

  /**
   * Unsubscribe from a system event type.
   */
  public off<T extends SystemEventType>(
    type: T,
    handler: SystemEventHandler<T>
  ): void {
    const handlerSet = this.handlers.get(type);
    if (handlerSet) {
      handlerSet.delete(handler);
    }
  }

  /**
   * Emit a typed system event to all subscribers.
   */
  public async emit<T extends SystemEventType>(
    type: T,
    payload: SystemEventPayloadMap[T]
  ): Promise<SystemEvent<T>> {
    const event: SystemEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
    };

    // Store in event history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    const handlerSet = this.handlers.get(type);
    if (handlerSet && handlerSet.size > 0) {
      const promises = Array.from(handlerSet).map((handler) => {
        try {
          return Promise.resolve(handler(event));
        } catch (error) {
          console.error(`[EventBus] Error executing handler for ${type}:`, error);
          return Promise.resolve();
        }
      });
      await Promise.all(promises);
    }

    return event;
  }

  /**
   * Returns recent event history for diagnostics or audit logs.
   */
  public getHistory(limit: number = 20): SystemEvent[] {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clears event history.
   */
  public clearHistory(): void {
    this.eventHistory = [];
  }
}

export const eventBus = new SystemEventBus();
