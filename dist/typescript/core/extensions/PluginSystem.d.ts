/**
 * Base Plugin Interface
 * Defines the contract for all plugins in the system
 */
export interface IPlugin {
    /** Unique identifier for the plugin */
    readonly id: string;
    /** Human-readable name of the plugin */
    readonly name: string;
    /** Plugin version */
    readonly version: string;
    /** Plugin description */
    readonly description: string;
    /** Plugin dependencies (other plugin IDs) */
    readonly dependencies: string[];
    /** Initialize the plugin */
    initialize(): void | Promise<void>;
    /** Cleanup plugin resources */
    destroy(): void | Promise<void>;
    /** Check if plugin is enabled */
    isEnabled(): boolean;
    /** Enable/disable the plugin */
    setEnabled(enabled: boolean): void;
}
/**
 * Plugin Configuration Interface
 */
export interface IPluginConfig {
    /** Plugin ID */
    id: string;
    /** Whether plugin is enabled by default */
    enabled: boolean;
    /** Plugin-specific configuration */
    config: Record<string, any>;
    /** Load priority (lower numbers load first) */
    priority: number;
}
/**
 * Plugin Registry Interface
 * Manages plugin lifecycle and dependencies
 */
export interface IPluginRegistry {
    /** Register a plugin */
    register(plugin: IPlugin, config?: IPluginConfig): void;
    /** Unregister a plugin */
    unregister(pluginId: string): void;
    /** Get a registered plugin */
    getPlugin<T extends IPlugin>(pluginId: string): T | undefined;
    /** Get all plugins of a specific type */
    getPluginsByType<T extends IPlugin>(type: new (...args: any[]) => T): T[];
    /** Initialize all plugins in dependency order */
    initializeAll(): Promise<void>;
    /** Destroy all plugins */
    destroyAll(): Promise<void>;
    /** Get list of all registered plugin IDs */
    getRegisteredPlugins(): string[];
    /** Check if a plugin is registered */
    hasPlugin(pluginId: string): boolean;
    /** Enable/disable a plugin */
    setPluginEnabled(pluginId: string, enabled: boolean): void;
}
/**
 * Abstract Base Plugin Class
 * Provides common plugin functionality
 */
export declare abstract class BasePlugin implements IPlugin {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly description: string;
    readonly dependencies: string[];
    private enabled;
    private initialized;
    constructor(id: string, name: string, version: string, description: string, dependencies?: string[]);
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    isInitialized(): boolean;
    /** Override this method to implement plugin-specific initialization */
    protected abstract onInitialize(): void | Promise<void>;
    /** Override this method to implement plugin-specific cleanup */
    protected abstract onDestroy(): void | Promise<void>;
}
/**
 * Plugin Manager
 * Concrete implementation of plugin registry
 */
export declare class PluginManager implements IPluginRegistry {
    private plugins;
    private configs;
    private dependencyGraph;
    register(plugin: IPlugin, config?: IPluginConfig): void;
    unregister(pluginId: string): void;
    getPlugin<T extends IPlugin>(pluginId: string): T | undefined;
    getPluginsByType<T extends IPlugin>(type: new (...args: any[]) => T): T[];
    initializeAll(): Promise<void>;
    destroyAll(): Promise<void>;
    getRegisteredPlugins(): string[];
    hasPlugin(pluginId: string): boolean;
    setPluginEnabled(pluginId: string, enabled: boolean): void;
    /**
     * Resolve plugin initialization order based on dependencies
     * Uses topological sort to handle dependencies
     */
    private resolveInitializationOrder;
}
