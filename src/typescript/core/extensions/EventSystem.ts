/**
 * Event System Interfaces for Plugin Communication
 * Provides decoupled communication between plugins and core systems
 */

/**
 * Base Event Interface
 */
export interface IEvent {
  /** Event type identifier */
  readonly type: string;
  
  /** Event data payload */
  readonly data: any;
  
  /** Timestamp when event was created */
  readonly timestamp: number;
  
  /** Event source identifier */
  readonly source: string;
  
  /** Whether event can be cancelled */
  readonly cancellable: boolean;
  
  /** Whether event has been cancelled */
  isCancelled(): boolean;
  
  /** Cancel the event (if cancellable) */
  cancel(): void;
}

/**
 * Event Listener Interface
 */
export interface IEventListener {
  /** Handle an event */
  handleEvent(event: IEvent): void | Promise<void>;
  
  /** Get event types this listener is interested in */
  getEventTypes(): string[];
  
  /** Priority for event handling (higher numbers execute first) */
  getPriority(): number;
}

/**
 * Event Bus Interface
 * Central event distribution system
 */
export interface IEventBus {
  /** Subscribe to events */
  subscribe(listener: IEventListener): void;
  
  /** Subscribe to specific event types */
  subscribeToTypes(listener: IEventListener, eventTypes: string[]): void;
  
  /** Unsubscribe from events */
  unsubscribe(listener: IEventListener): void;
  
  /** Emit an event */
  emit(event: IEvent): Promise<void>;
  
  /** Emit an event synchronously */
  emitSync(event: IEvent): void;
  
  /** Create and emit an event */
  dispatch(type: string, data: any, source: string, cancellable?: boolean): Promise<void>;
  
  /** Get all registered listeners */
  getListeners(): IEventListener[];
  
  /** Get listeners for specific event type */
  getListenersForType(eventType: string): IEventListener[];
}

/**
 * Base Event Implementation
 */
export class BaseEvent implements IEvent {
  public readonly type: string;
  public readonly data: any;
  public readonly timestamp: number;
  public readonly source: string;
  public readonly cancellable: boolean;
  
  private cancelled: boolean = false;

  constructor(type: string, data: any, source: string, cancellable: boolean = false) {
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
    this.source = source;
    this.cancellable = cancellable;
  }

  public isCancelled(): boolean {
    return this.cancelled;
  }

  public cancel(): void {
    if (this.cancellable) {
      this.cancelled = true;
    } else {
      throw new Error(`Event ${this.type} is not cancellable`);
    }
  }
}

/**
 * Abstract Event Listener Base Class
 */
export abstract class AbstractEventListener implements IEventListener {
  protected eventTypes: string[];
  protected priority: number;

  constructor(eventTypes: string[], priority: number = 0) {
    this.eventTypes = eventTypes;
    this.priority = priority;
  }

  public abstract handleEvent(event: IEvent): void | Promise<void>;

  public getEventTypes(): string[] {
    return [...this.eventTypes];
  }

  public getPriority(): number {
    return this.priority;
  }
}

/**
 * Event Bus Implementation
 */
export class EventBus implements IEventBus {
  private listeners: IEventListener[] = [];
  private typeListeners: Map<string, IEventListener[]> = new Map();

  public subscribe(listener: IEventListener): void {
    this.listeners.push(listener);
    
    // Index by event types for faster lookup
    for (const eventType of listener.getEventTypes()) {
      if (!this.typeListeners.has(eventType)) {
        this.typeListeners.set(eventType, []);
      }
      this.typeListeners.get(eventType)!.push(listener);
    }
    
    // Sort by priority
    this.sortListenersByPriority();
  }

  public subscribeToTypes(listener: IEventListener, eventTypes: string[]): void {
    // Create a wrapper listener for specific types
    const wrapperListener = new FilteredEventListener(listener, eventTypes);
    this.subscribe(wrapperListener);
  }

  public unsubscribe(listener: IEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }

    // Remove from type-specific listeners
    for (const eventType of listener.getEventTypes()) {
      const typeListeners = this.typeListeners.get(eventType);
      if (typeListeners) {
        const typeIndex = typeListeners.indexOf(listener);
        if (typeIndex > -1) {
          typeListeners.splice(typeIndex, 1);
        }
        
        if (typeListeners.length === 0) {
          this.typeListeners.delete(eventType);
        }
      }
    }
  }

  public async emit(event: IEvent): Promise<void> {
    const listeners = this.getListenersForType(event.type);
    
    for (const listener of listeners) {
      if (event.isCancelled()) {
        break;
      }
      
      try {
        await listener.handleEvent(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    }
  }

  public emitSync(event: IEvent): void {
    const listeners = this.getListenersForType(event.type);
    
    for (const listener of listeners) {
      if (event.isCancelled()) {
        break;
      }
      
      try {
        listener.handleEvent(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    }
  }

  public async dispatch(type: string, data: any, source: string, cancellable: boolean = false): Promise<void> {
    const event = new BaseEvent(type, data, source, cancellable);
    await this.emit(event);
  }

  public getListeners(): IEventListener[] {
    return [...this.listeners];
  }

  public getListenersForType(eventType: string): IEventListener[] {
    return this.typeListeners.get(eventType) || [];
  }

  private sortListenersByPriority(): void {
    this.listeners.sort((a, b) => b.getPriority() - a.getPriority());
    
    for (const typeListeners of this.typeListeners.values()) {
      typeListeners.sort((a, b) => b.getPriority() - a.getPriority());
    }
  }
}

/**
 * Filtered Event Listener Wrapper
 * Allows subscribing to specific event types only
 */
class FilteredEventListener implements IEventListener {
  private wrappedListener: IEventListener;
  private allowedTypes: Set<string>;

  constructor(listener: IEventListener, allowedTypes: string[]) {
    this.wrappedListener = listener;
    this.allowedTypes = new Set(allowedTypes);
  }

  public handleEvent(event: IEvent): void | Promise<void> {
    if (this.allowedTypes.has(event.type)) {
      return this.wrappedListener.handleEvent(event);
    }
  }

  public getEventTypes(): string[] {
    return Array.from(this.allowedTypes);
  }

  public getPriority(): number {
    return this.wrappedListener.getPriority();
  }
}

/**
 * Common Event Types
 */
export const EventTypes = {
  // Game Events
  GAME_STARTED: 'game.started',
  GAME_PAUSED: 'game.paused',
  GAME_RESUMED: 'game.resumed',
  GAME_ENDED: 'game.ended',
  
  // Player Events
  PLAYER_CREATED: 'player.created',
  PLAYER_STATS_CHANGED: 'player.stats.changed',
  PLAYER_HEALTH_CHANGED: 'player.health.changed',
  PLAYER_LEVEL_UP: 'player.level.up',
  PLAYER_DIED: 'player.died',
  
  // Combat Events
  COMBAT_STARTED: 'combat.started',
  COMBAT_ENDED: 'combat.ended',
  COMBAT_ACTION: 'combat.action',
  COMBAT_DAMAGE: 'combat.damage',
  COMBAT_HEAL: 'combat.heal',
  
  // World Events
  LOCATION_ENTERED: 'world.location.entered',
  LOCATION_EXITED: 'world.location.exited',
  ENCOUNTER_TRIGGERED: 'world.encounter.triggered',
  
  // UI Events
  UI_SCREEN_CHANGED: 'ui.screen.changed',
  UI_DIALOG_OPENED: 'ui.dialog.opened',
  UI_DIALOG_CLOSED: 'ui.dialog.closed',
  
  // Custom Plugin Events
  PLUGIN_EVENT_PREFIX: 'plugin.'
} as const;
