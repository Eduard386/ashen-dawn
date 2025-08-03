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
export declare class BaseEvent implements IEvent {
    readonly type: string;
    readonly data: any;
    readonly timestamp: number;
    readonly source: string;
    readonly cancellable: boolean;
    private cancelled;
    constructor(type: string, data: any, source: string, cancellable?: boolean);
    isCancelled(): boolean;
    cancel(): void;
}
/**
 * Abstract Event Listener Base Class
 */
export declare abstract class AbstractEventListener implements IEventListener {
    protected eventTypes: string[];
    protected priority: number;
    constructor(eventTypes: string[], priority?: number);
    abstract handleEvent(event: IEvent): void | Promise<void>;
    getEventTypes(): string[];
    getPriority(): number;
}
/**
 * Event Bus Implementation
 */
export declare class EventBus implements IEventBus {
    private listeners;
    private typeListeners;
    subscribe(listener: IEventListener): void;
    subscribeToTypes(listener: IEventListener, eventTypes: string[]): void;
    unsubscribe(listener: IEventListener): void;
    emit(event: IEvent): Promise<void>;
    emitSync(event: IEvent): void;
    dispatch(type: string, data: any, source: string, cancellable?: boolean): Promise<void>;
    getListeners(): IEventListener[];
    getListenersForType(eventType: string): IEventListener[];
    private sortListenersByPriority;
}
/**
 * Common Event Types
 */
export declare const EventTypes: {
    readonly GAME_STARTED: "game.started";
    readonly GAME_PAUSED: "game.paused";
    readonly GAME_RESUMED: "game.resumed";
    readonly GAME_ENDED: "game.ended";
    readonly PLAYER_CREATED: "player.created";
    readonly PLAYER_STATS_CHANGED: "player.stats.changed";
    readonly PLAYER_HEALTH_CHANGED: "player.health.changed";
    readonly PLAYER_LEVEL_UP: "player.level.up";
    readonly PLAYER_DIED: "player.died";
    readonly COMBAT_STARTED: "combat.started";
    readonly COMBAT_ENDED: "combat.ended";
    readonly COMBAT_ACTION: "combat.action";
    readonly COMBAT_DAMAGE: "combat.damage";
    readonly COMBAT_HEAL: "combat.heal";
    readonly LOCATION_ENTERED: "world.location.entered";
    readonly LOCATION_EXITED: "world.location.exited";
    readonly ENCOUNTER_TRIGGERED: "world.encounter.triggered";
    readonly UI_SCREEN_CHANGED: "ui.screen.changed";
    readonly UI_DIALOG_OPENED: "ui.dialog.opened";
    readonly UI_DIALOG_CLOSED: "ui.dialog.closed";
    readonly PLUGIN_EVENT_PREFIX: "plugin.";
};
