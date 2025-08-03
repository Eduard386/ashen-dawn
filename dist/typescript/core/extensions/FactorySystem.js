/**
 * Factory Pattern Interfaces and Implementations
 * Provides extensible creation patterns for game objects
 */
/**
 * Registry Factory Implementation
 */
export class RegistryFactory {
    constructor() {
        this.creators = new Map();
        this.priorities = new Map();
        this.descriptions = new Map();
    }
    register(type, creator) {
        this.creators.set(type, creator);
    }
    registerWithOptions(registration) {
        const existingPriority = this.priorities.get(registration.type) || 0;
        const newPriority = registration.priority || 0;
        if (newPriority >= existingPriority) {
            this.creators.set(registration.type, registration.creator);
            this.priorities.set(registration.type, newPriority);
            if (registration.description) {
                this.descriptions.set(registration.type, registration.description);
            }
        }
    }
    unregister(type) {
        this.creators.delete(type);
        this.priorities.delete(type);
        this.descriptions.delete(type);
    }
    create(...args) {
        const type = args[0];
        const creator = this.creators.get(type);
        if (!creator) {
            throw new Error(`No creator registered for type: ${type}`);
        }
        return creator(...args.slice(1));
    }
    canCreate(type) {
        return this.creators.has(type);
    }
    isRegistered(type) {
        return this.creators.has(type);
    }
    getSupportedTypes() {
        return Array.from(this.creators.keys());
    }
    getDescription(type) {
        return this.descriptions.get(type);
    }
    getPriority(type) {
        return this.priorities.get(type) || 0;
    }
}
/**
 * Abstract Factory Implementation
 */
export class AbstractFactory {
    constructor() {
        this.factories = new Map();
    }
    getFactory(name) {
        return this.factories.get(name);
    }
    registerFactory(name, factory) {
        this.factories.set(name, factory);
    }
    unregisterFactory(name) {
        this.factories.delete(name);
    }
    getFactoryNames() {
        return Array.from(this.factories.keys());
    }
}
/**
 * Fluent Factory Builder
 * Provides a fluent interface for factory configuration
 */
export class FactoryBuilder {
    constructor() {
        this.factory = new RegistryFactory();
    }
    static create() {
        return new FactoryBuilder();
    }
    register(type, creator) {
        this.factory.register(type, creator);
        return this;
    }
    registerWithPriority(type, creator, priority, description) {
        this.factory.registerWithOptions({
            type,
            creator,
            priority,
            description
        });
        return this;
    }
    build() {
        return this.factory;
    }
}
/**
 * Singleton Factory Decorator
 * Ensures only one instance is created per type
 */
export class SingletonFactory {
    constructor(factory) {
        this.instances = new Map();
        this.wrappedFactory = factory;
    }
    create(...args) {
        const type = args[0];
        if (!this.instances.has(type)) {
            const instance = this.wrappedFactory.create(...args);
            this.instances.set(type, instance);
        }
        return this.instances.get(type);
    }
    canCreate(type) {
        return this.wrappedFactory.canCreate(type);
    }
    getSupportedTypes() {
        return this.wrappedFactory.getSupportedTypes();
    }
    clearCache() {
        this.instances.clear();
    }
    clearCacheForType(type) {
        this.instances.delete(type);
    }
}
/**
 * Lazy Factory Decorator
 * Defers creation until explicitly requested
 */
export class LazyFactory {
    constructor(factory) {
        this.lazyInstances = new Map();
        this.wrappedFactory = factory;
    }
    create(...args) {
        const type = args[0];
        if (!this.lazyInstances.has(type)) {
            // Store creation function for later execution
            this.lazyInstances.set(type, () => this.wrappedFactory.create(...args));
        }
        // Execute creation function
        return this.lazyInstances.get(type)();
    }
    canCreate(type) {
        return this.wrappedFactory.canCreate(type);
    }
    getSupportedTypes() {
        return this.wrappedFactory.getSupportedTypes();
    }
}
/**
 * Factory Extension Manager
 * Manages factory plugins and extensions
 */
export class FactoryExtensionManager {
    constructor() {
        this.extensionFactories = new Map();
        this.extensionPoints = new Map();
    }
    /**
     * Register an extension factory for a specific extension point
     */
    registerExtensionFactory(extensionPoint, factory) {
        this.extensionFactories.set(extensionPoint, factory);
        if (!this.extensionPoints.has(extensionPoint)) {
            this.extensionPoints.set(extensionPoint, []);
        }
    }
    /**
     * Register an extension creator for a specific extension point
     */
    registerExtension(extensionPoint, type, creator, priority = 0) {
        let factory = this.extensionFactories.get(extensionPoint);
        if (!factory) {
            factory = new RegistryFactory();
            this.extensionFactories.set(extensionPoint, factory);
            this.extensionPoints.set(extensionPoint, []);
        }
        if ('registerWithOptions' in factory) {
            factory.registerWithOptions({
                type,
                creator,
                priority
            });
        }
        else {
            factory.register(type, creator);
        }
        const types = this.extensionPoints.get(extensionPoint);
        if (!types.includes(type)) {
            types.push(type);
        }
    }
    /**
     * Create an extension instance
     */
    createExtension(extensionPoint, type, ...args) {
        const factory = this.extensionFactories.get(extensionPoint);
        if (!factory) {
            throw new Error(`No factory registered for extension point: ${extensionPoint}`);
        }
        return factory.create(type, ...args);
    }
    /**
     * Get all available extension types for an extension point
     */
    getAvailableExtensions(extensionPoint) {
        return this.extensionPoints.get(extensionPoint) || [];
    }
    /**
     * Check if an extension type is available
     */
    hasExtension(extensionPoint, type) {
        const factory = this.extensionFactories.get(extensionPoint);
        return factory ? factory.canCreate(type) : false;
    }
    /**
     * Get all registered extension points
     */
    getExtensionPoints() {
        return Array.from(this.extensionPoints.keys());
    }
}
//# sourceMappingURL=FactorySystem.js.map