/**
 * Factory Pattern Interfaces and Implementations
 * Provides extensible creation patterns for game objects
 */
/**
 * Generic Factory Interface
 */
export interface IFactory<T> {
    /** Create an instance of type T */
    create(...args: any[]): T;
    /** Check if factory can create a specific type */
    canCreate(type: string): boolean;
    /** Get supported creation types */
    getSupportedTypes(): string[];
}
/**
 * Registry-Based Factory Interface
 * Allows registration of creation functions
 */
export interface IRegistryFactory<T> extends IFactory<T> {
    /** Register a creator function for a type */
    register(type: string, creator: (...args: any[]) => T): void;
    /** Unregister a creator function */
    unregister(type: string): void;
    /** Check if a type is registered */
    isRegistered(type: string): boolean;
}
/**
 * Abstract Factory Interface
 * Groups related factories together
 */
export interface IAbstractFactory {
    /** Get a specific factory by name */
    getFactory<T>(name: string): IFactory<T> | undefined;
    /** Register a factory */
    registerFactory<T>(name: string, factory: IFactory<T>): void;
    /** Unregister a factory */
    unregisterFactory(name: string): void;
    /** Get all registered factory names */
    getFactoryNames(): string[];
}
/**
 * Creator Function Type
 */
export type CreatorFunction<T> = (...args: any[]) => T;
/**
 * Factory Registration Options
 */
export interface IFactoryRegistration<T> {
    /** Type identifier */
    type: string;
    /** Creator function */
    creator: CreatorFunction<T>;
    /** Priority (higher numbers override lower) */
    priority?: number;
    /** Description of what this creator does */
    description?: string;
}
/**
 * Registry Factory Implementation
 */
export declare class RegistryFactory<T> implements IRegistryFactory<T> {
    private creators;
    private priorities;
    private descriptions;
    register(type: string, creator: CreatorFunction<T>): void;
    registerWithOptions(registration: IFactoryRegistration<T>): void;
    unregister(type: string): void;
    create(...args: any[]): T;
    canCreate(type: string): boolean;
    isRegistered(type: string): boolean;
    getSupportedTypes(): string[];
    getDescription(type: string): string | undefined;
    getPriority(type: string): number;
}
/**
 * Abstract Factory Implementation
 */
export declare class AbstractFactory implements IAbstractFactory {
    private factories;
    getFactory<T>(name: string): IFactory<T> | undefined;
    registerFactory<T>(name: string, factory: IFactory<T>): void;
    unregisterFactory(name: string): void;
    getFactoryNames(): string[];
}
/**
 * Fluent Factory Builder
 * Provides a fluent interface for factory configuration
 */
export declare class FactoryBuilder<T> {
    private factory;
    static create<T>(): FactoryBuilder<T>;
    register(type: string, creator: CreatorFunction<T>): FactoryBuilder<T>;
    registerWithPriority(type: string, creator: CreatorFunction<T>, priority: number, description?: string): FactoryBuilder<T>;
    build(): RegistryFactory<T>;
}
/**
 * Singleton Factory Decorator
 * Ensures only one instance is created per type
 */
export declare class SingletonFactory<T> implements IFactory<T> {
    private instances;
    private wrappedFactory;
    constructor(factory: IFactory<T>);
    create(...args: any[]): T;
    canCreate(type: string): boolean;
    getSupportedTypes(): string[];
    clearCache(): void;
    clearCacheForType(type: string): void;
}
/**
 * Lazy Factory Decorator
 * Defers creation until explicitly requested
 */
export declare class LazyFactory<T> implements IFactory<T> {
    private lazyInstances;
    private wrappedFactory;
    constructor(factory: IFactory<T>);
    create(...args: any[]): T;
    canCreate(type: string): boolean;
    getSupportedTypes(): string[];
}
/**
 * Factory Extension Manager
 * Manages factory plugins and extensions
 */
export declare class FactoryExtensionManager {
    private extensionFactories;
    private extensionPoints;
    /**
     * Register an extension factory for a specific extension point
     */
    registerExtensionFactory<T>(extensionPoint: string, factory: IRegistryFactory<T>): void;
    /**
     * Register an extension creator for a specific extension point
     */
    registerExtension<T>(extensionPoint: string, type: string, creator: CreatorFunction<T>, priority?: number): void;
    /**
     * Create an extension instance
     */
    createExtension<T>(extensionPoint: string, type: string, ...args: any[]): T;
    /**
     * Get all available extension types for an extension point
     */
    getAvailableExtensions(extensionPoint: string): string[];
    /**
     * Check if an extension type is available
     */
    hasExtension(extensionPoint: string, type: string): boolean;
    /**
     * Get all registered extension points
     */
    getExtensionPoints(): string[];
}
