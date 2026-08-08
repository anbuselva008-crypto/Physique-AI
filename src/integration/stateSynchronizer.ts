import { eventBus } from '../system/eventBus';
import { SystemEventType } from '../system/types';

export type StateChangeListener = () => void;

/**
 * StateSynchronizer
 * Central listener & synchronizer between event bus, underlying storage/services,
 * and UI state subscribers. Ensures that whenever any domain action occurs,
 * subscribed UI listeners receive automatic reactive updates.
 */
export class StateSynchronizer {
  private listeners: Set<StateChangeListener> = new Set();
  private isSubscribedToEventBus: boolean = false;

  constructor() {
    this.setupEventBusListeners();
  }

  /**
   * Connects to system event bus to trigger state sync on relevant domain events.
   */
  private setupEventBusListeners(): void {
    if (this.isSubscribedToEventBus) return;

    const domainEvents: SystemEventType[] = [
      'PROFILE_UPDATED',
      'CHECKIN_COMPLETED',
      'WORKOUT_COMPLETED',
      'MEAL_LOGGED',
      'PHOTO_UPLOADED',
      'RECOVERY_CHANGED',
      'GOAL_UPDATED',
      'ROADMAP_UPDATED',
      'MEMORY_UPDATED',
      'MONTH_FINISHED',
    ];

    domainEvents.forEach((event) => {
      eventBus.on(event, () => {
        this.notifySubscribers();
      });
    });

    this.isSubscribedToEventBus = true;
  }

  /**
   * Registers a subscriber callback to be notified of state updates.
   */
  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifies all subscribed listeners.
   */
  public notifySubscribers(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('StateSynchronizer error during listener notification:', e);
      }
    });
  }

  /**
   * Manually triggers a complete application state re-synchronization.
   */
  public syncAllState(): void {
    this.notifySubscribers();
  }
}

export const stateSynchronizer = new StateSynchronizer();
