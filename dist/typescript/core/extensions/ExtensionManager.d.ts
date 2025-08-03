/**
 * Core Extension Framework
 * Orchestrates plugins, events, factories, and strategies
 */
import { IPlugin, IPluginRegistry, IPluginConfig } from './PluginSystem';
import { IEventBus } from './EventSystem';
import { IRegistryFactory, FactoryExtensionManager } from './FactorySystem';
import { IStrategyContext, StrategyRegistry } from './StrategySystem';
/**
 * Extension Point Definition
 */
export interface IExtensionPoint {
    /** Extension point identifier */
    readonly id: string;
    /** Human-readable name */
    readonly name: string;
    /** Description of the extension point */
    readonly description: string;
    /** Expected interface or contract */
    readonly contract: string;
    /** Extension point type */
    readonly type: ExtensionPointType;
    /** Configuration schema */
    readonly configSchema?: Record<string, any>;
}
/**
 * Extension Point Types
 */
export declare enum ExtensionPointType {
    PLUGIN = "plugin",
    STRATEGY = "strategy",
    FACTORY = "factory",
    EVENT_LISTENER = "event_listener",
    SERVICE = "service",
    CUSTOM = "custom"
}
/**
 * Extension Registration
 */
export interface IExtensionRegistration {
    /** Extension point ID */
    extensionPointId: string;
    /** Extension ID */
    extensionId: string;
    /** Extension implementation */
    implementation: any;
    /** Extension configuration */
    config?: Record<string, any>;
    /** Extension priority */
    priority?: number;
    /** Extension metadata */
    metadata?: Record<string, any>;
}
/**
 * Core Extension Manager
 * Central coordinator for all extension mechanisms
 */
export interface IExtensionManager {
    /** Plugin management */
    getPluginManager(): IPluginRegistry;
    /** Event system */
    getEventBus(): IEventBus;
    /** Factory system */
    getFactoryManager(): FactoryExtensionManager;
    /** Strategy system */
    getStrategyRegistry(): StrategyRegistry;
    /** Register an extension point */
    registerExtensionPoint(extensionPoint: IExtensionPoint): void;
    /** Register an extension */
    registerExtension(registration: IExtensionRegistration): void;
    /** Get extensions for a point */
    getExtensions(extensionPointId: string): any[];
    /** Initialize the extension system */
    initialize(): Promise<void>;
    /** Shutdown the extension system */
    shutdown(): Promise<void>;
}
/**
 * Extension Manager Implementation
 */
export declare class ExtensionManager implements IExtensionManager {
    private pluginManager;
    private eventBus;
    private factoryManager;
    private strategyRegistry;
    private extensionPoints;
    private extensions;
    private initialized;
    constructor();
    getPluginManager(): IPluginRegistry;
    getEventBus(): IEventBus;
    getFactoryManager(): FactoryExtensionManager;
    getStrategyRegistry(): StrategyRegistry;
    registerExtensionPoint(extensionPoint: IExtensionPoint): void;
    registerExtension(registration: IExtensionRegistration): void;
    getExtensions(extensionPointId: string): any[];
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    isInitialized(): boolean;
    getExtensionPoints(): IExtensionPoint[];
    hasExtensionPoint(id: string): boolean;
    private setupCoreExtensionPoints;
    private registerPluginExtension;
    private registerStrategyExtension;
    private registerFactoryExtension;
    private registerEventListenerExtension;
    private registerGenericExtension;
}
/**
 * Global Extension Manager Instance
 */
export declare const GlobalExtensionManager: ExtensionManager;
/**
 * Extension Decorator
 * Provides declarative extension registration
 */
export declare function Extension(extensionPointId: string, config?: Record<string, any>): (target: any) => any;
/**
 * Plugin Decorator
 * Simplified plugin registration
 */
export declare function Plugin(id: string, config?: Partial<IPluginConfig>): (target: any) => any;
/**
 * Strategy Decorator
 * Simplified strategy registration
 */
export declare function Strategy(domain: string, priority?: number): (target: any) => any;
/**
 * Factory Decorator
 * Simplified factory registration
 */
export declare function Factory(extensionPoint: string): (target: any) => any;
/**
 * Extension Helper Functions
 */
export declare class ExtensionHelpers {
    /**
     * Create a simple plugin from a configuration object
     */
    static createSimplePlugin(id: string, name: string, version: string, initFn?: () => void | Promise<void>, destroyFn?: () => void | Promise<void>): IPlugin;
    /**
     * Create a strategy context with default selector
     */
    static createStrategyContext<TInput, TOutput>(): IStrategyContext<TInput, TOutput>;
    /**
     * Create a registry factory
     */
    static createRegistryFactory<T>(): IRegistryFactory<T>;
}
export * from './PluginSystem';
export * from './EventSystem';
export * from './FactorySystem';
export * from './StrategySystem';
