/**
 * Core Extension Framework
 * Orchestrates plugins, events, factories, and strategies
 */
import { PluginManager, BasePlugin } from './PluginSystem';
import { EventBus } from './EventSystem';
import { FactoryExtensionManager, RegistryFactory } from './FactorySystem';
import { StrategyRegistry, StrategyContext } from './StrategySystem';
/**
 * Extension Point Types
 */
export var ExtensionPointType;
(function (ExtensionPointType) {
    ExtensionPointType["PLUGIN"] = "plugin";
    ExtensionPointType["STRATEGY"] = "strategy";
    ExtensionPointType["FACTORY"] = "factory";
    ExtensionPointType["EVENT_LISTENER"] = "event_listener";
    ExtensionPointType["SERVICE"] = "service";
    ExtensionPointType["CUSTOM"] = "custom";
})(ExtensionPointType || (ExtensionPointType = {}));
/**
 * Extension Manager Implementation
 */
export class ExtensionManager {
    constructor() {
        this.extensionPoints = new Map();
        this.extensions = new Map();
        this.initialized = false;
        this.pluginManager = new PluginManager();
        this.eventBus = new EventBus();
        this.factoryManager = new FactoryExtensionManager();
        this.strategyRegistry = new StrategyRegistry();
        this.setupCoreExtensionPoints();
    }
    getPluginManager() {
        return this.pluginManager;
    }
    getEventBus() {
        return this.eventBus;
    }
    getFactoryManager() {
        return this.factoryManager;
    }
    getStrategyRegistry() {
        return this.strategyRegistry;
    }
    registerExtensionPoint(extensionPoint) {
        if (this.extensionPoints.has(extensionPoint.id)) {
            throw new Error(`Extension point ${extensionPoint.id} is already registered`);
        }
        this.extensionPoints.set(extensionPoint.id, extensionPoint);
        this.extensions.set(extensionPoint.id, []);
        // Emit extension point registered event
        this.eventBus.dispatch('extension.point.registered', { extensionPoint }, 'ExtensionManager');
    }
    registerExtension(registration) {
        const extensionPoint = this.extensionPoints.get(registration.extensionPointId);
        if (!extensionPoint) {
            throw new Error(`Extension point ${registration.extensionPointId} not found`);
        }
        // Route to appropriate system based on extension point type
        switch (extensionPoint.type) {
            case ExtensionPointType.PLUGIN:
                this.registerPluginExtension(registration);
                break;
            case ExtensionPointType.STRATEGY:
                this.registerStrategyExtension(registration);
                break;
            case ExtensionPointType.FACTORY:
                this.registerFactoryExtension(registration);
                break;
            case ExtensionPointType.EVENT_LISTENER:
                this.registerEventListenerExtension(registration);
                break;
            default:
                this.registerGenericExtension(registration);
                break;
        }
        // Emit extension registered event
        this.eventBus.dispatch('extension.registered', { registration }, 'ExtensionManager');
    }
    getExtensions(extensionPointId) {
        return this.extensions.get(extensionPointId) || [];
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        // Initialize plugins
        await this.pluginManager.initializeAll();
        // Emit system initialized event
        await this.eventBus.dispatch('extension.system.initialized', { manager: this }, 'ExtensionManager');
        this.initialized = true;
    }
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        // Emit system shutdown event
        await this.eventBus.dispatch('extension.system.shutdown', { manager: this }, 'ExtensionManager');
        // Shutdown plugins
        await this.pluginManager.destroyAll();
        this.initialized = false;
    }
    isInitialized() {
        return this.initialized;
    }
    getExtensionPoints() {
        return Array.from(this.extensionPoints.values());
    }
    hasExtensionPoint(id) {
        return this.extensionPoints.has(id);
    }
    setupCoreExtensionPoints() {
        // Core extension points that are always available
        const corePoints = [
            {
                id: 'core.services',
                name: 'Core Services',
                description: 'Extension point for core game services',
                contract: 'IService',
                type: ExtensionPointType.SERVICE
            },
            {
                id: 'combat.strategies',
                name: 'Combat Strategies',
                description: 'Extension point for combat action strategies',
                contract: 'ICombatStrategy',
                type: ExtensionPointType.STRATEGY
            },
            {
                id: 'world.generators',
                name: 'World Generators',
                description: 'Extension point for world generation strategies',
                contract: 'IWorldGenerator',
                type: ExtensionPointType.STRATEGY
            },
            {
                id: 'ui.renderers',
                name: 'UI Renderers',
                description: 'Extension point for UI rendering strategies',
                contract: 'IUIRenderer',
                type: ExtensionPointType.STRATEGY
            },
            {
                id: 'entity.factories',
                name: 'Entity Factories',
                description: 'Extension point for entity creation factories',
                contract: 'IEntityFactory',
                type: ExtensionPointType.FACTORY
            },
            {
                id: 'data.loaders',
                name: 'Data Loaders',
                description: 'Extension point for data loading plugins',
                contract: 'IDataLoader',
                type: ExtensionPointType.PLUGIN
            },
            {
                id: 'event.handlers',
                name: 'Event Handlers',
                description: 'Extension point for custom event handlers',
                contract: 'IEventListener',
                type: ExtensionPointType.EVENT_LISTENER
            }
        ];
        for (const point of corePoints) {
            this.extensionPoints.set(point.id, point);
            this.extensions.set(point.id, []);
        }
    }
    registerPluginExtension(registration) {
        const plugin = registration.implementation;
        const config = registration.config;
        this.pluginManager.register(plugin, config);
        const extensions = this.extensions.get(registration.extensionPointId);
        extensions.push(plugin);
    }
    registerStrategyExtension(registration) {
        const strategy = registration.implementation;
        const domain = registration.config?.domain || registration.extensionPointId;
        this.strategyRegistry.registerStrategy(domain, strategy);
        const extensions = this.extensions.get(registration.extensionPointId);
        extensions.push(strategy);
    }
    registerFactoryExtension(registration) {
        const factory = registration.implementation;
        const extensionPoint = registration.extensionPointId;
        this.factoryManager.registerExtensionFactory(extensionPoint, factory);
        const extensions = this.extensions.get(registration.extensionPointId);
        extensions.push(factory);
    }
    registerEventListenerExtension(registration) {
        const listener = registration.implementation;
        this.eventBus.subscribe(listener);
        const extensions = this.extensions.get(registration.extensionPointId);
        extensions.push(listener);
    }
    registerGenericExtension(registration) {
        const extensions = this.extensions.get(registration.extensionPointId);
        extensions.push(registration.implementation);
    }
}
/**
 * Global Extension Manager Instance
 */
export const GlobalExtensionManager = new ExtensionManager();
/**
 * Extension Decorator
 * Provides declarative extension registration
 */
export function Extension(extensionPointId, config) {
    return function (target) {
        // Register the extension when the class is defined
        const registration = {
            extensionPointId,
            extensionId: target.name || target.constructor.name,
            implementation: new target(),
            config
        };
        GlobalExtensionManager.registerExtension(registration);
        return target;
    };
}
/**
 * Plugin Decorator
 * Simplified plugin registration
 */
export function Plugin(id, config) {
    return Extension('core.plugins', { id, ...config });
}
/**
 * Strategy Decorator
 * Simplified strategy registration
 */
export function Strategy(domain, priority = 0) {
    return Extension('strategies', { domain, priority });
}
/**
 * Factory Decorator
 * Simplified factory registration
 */
export function Factory(extensionPoint) {
    return Extension(extensionPoint);
}
/**
 * Extension Helper Functions
 */
export class ExtensionHelpers {
    /**
     * Create a simple plugin from a configuration object
     */
    static createSimplePlugin(id, name, version, initFn, destroyFn) {
        return new SimplePlugin(id, name, version, initFn, destroyFn);
    }
    /**
     * Create a strategy context with default selector
     */
    static createStrategyContext() {
        return new StrategyContext();
    }
    /**
     * Create a registry factory
     */
    static createRegistryFactory() {
        return new RegistryFactory();
    }
}
/**
 * Simple Plugin Implementation
 */
class SimplePlugin extends BasePlugin {
    constructor(id, name, version, initFn, destroyFn) {
        super(id, name, version, `Simple plugin: ${name}`);
        this.initFn = initFn;
        this.destroyFn = destroyFn;
    }
    async onInitialize() {
        if (this.initFn) {
            await this.initFn();
        }
    }
    async onDestroy() {
        if (this.destroyFn) {
            await this.destroyFn();
        }
    }
}
// Export everything for easy access
export * from './PluginSystem';
export * from './EventSystem';
export * from './FactorySystem';
export * from './StrategySystem';
//# sourceMappingURL=ExtensionManager.js.map