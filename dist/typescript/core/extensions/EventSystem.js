/**
 * Event System Interfaces for Plugin Communication
 * Provides decoupled communication between plugins and core systems
 */
/**
 * Base Event Implementation
 */
export class BaseEvent {
    constructor(type, data, source, cancellable = false) {
        this.cancelled = false;
        this.type = type;
        this.data = data;
        this.timestamp = Date.now();
        this.source = source;
        this.cancellable = cancellable;
    }
    isCancelled() {
        return this.cancelled;
    }
    cancel() {
        if (this.cancellable) {
            this.cancelled = true;
        }
        else {
            throw new Error(`Event ${this.type} is not cancellable`);
        }
    }
}
/**
 * Abstract Event Listener Base Class
 */
export class AbstractEventListener {
    constructor(eventTypes, priority = 0) {
        this.eventTypes = eventTypes;
        this.priority = priority;
    }
    getEventTypes() {
        return [...this.eventTypes];
    }
    getPriority() {
        return this.priority;
    }
}
/**
 * Event Bus Implementation
 */
export class EventBus {
    constructor() {
        this.listeners = [];
        this.typeListeners = new Map();
    }
    subscribe(listener) {
        this.listeners.push(listener);
        // Index by event types for faster lookup
        for (const eventType of listener.getEventTypes()) {
            if (!this.typeListeners.has(eventType)) {
                this.typeListeners.set(eventType, []);
            }
            this.typeListeners.get(eventType).push(listener);
        }
        // Sort by priority
        this.sortListenersByPriority();
    }
    subscribeToTypes(listener, eventTypes) {
        // Create a wrapper listener for specific types
        const wrapperListener = new FilteredEventListener(listener, eventTypes);
        this.subscribe(wrapperListener);
    }
    unsubscribe(listener) {
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
    async emit(event) {
        const listeners = this.getListenersForType(event.type);
        for (const listener of listeners) {
            if (event.isCancelled()) {
                break;
            }
            try {
                await listener.handleEvent(event);
            }
            catch (error) {
                console.error(`Error in event listener for ${event.type}:`, error);
            }
        }
    }
    emitSync(event) {
        const listeners = this.getListenersForType(event.type);
        for (const listener of listeners) {
            if (event.isCancelled()) {
                break;
            }
            try {
                listener.handleEvent(event);
            }
            catch (error) {
                console.error(`Error in event listener for ${event.type}:`, error);
            }
        }
    }
    async dispatch(type, data, source, cancellable = false) {
        const event = new BaseEvent(type, data, source, cancellable);
        await this.emit(event);
    }
    getListeners() {
        return [...this.listeners];
    }
    getListenersForType(eventType) {
        return this.typeListeners.get(eventType) || [];
    }
    sortListenersByPriority() {
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
class FilteredEventListener {
    constructor(listener, allowedTypes) {
        this.wrappedListener = listener;
        this.allowedTypes = new Set(allowedTypes);
    }
    handleEvent(event) {
        if (this.allowedTypes.has(event.type)) {
            return this.wrappedListener.handleEvent(event);
        }
    }
    getEventTypes() {
        return Array.from(this.allowedTypes);
    }
    getPriority() {
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
};
//# sourceMappingURL=EventSystem.js.map