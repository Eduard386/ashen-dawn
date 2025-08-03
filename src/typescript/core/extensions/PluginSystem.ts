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
export abstract class BasePlugin implements IPlugin {
  public readonly id: string;
  public readonly name: string;
  public readonly version: string;
  public readonly description: string;
  public readonly dependencies: string[];
  
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor(
    id: string,
    name: string,
    version: string,
    description: string,
    dependencies: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.description = description;
    this.dependencies = dependencies;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    await this.onInitialize();
    this.initialized = true;
  }

  public async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    await this.onDestroy();
    this.initialized = false;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  /** Override this method to implement plugin-specific initialization */
  protected abstract onInitialize(): void | Promise<void>;

  /** Override this method to implement plugin-specific cleanup */
  protected abstract onDestroy(): void | Promise<void>;
}

/**
 * Plugin Manager
 * Concrete implementation of plugin registry
 */
export class PluginManager implements IPluginRegistry {
  private plugins: Map<string, IPlugin> = new Map();
  private configs: Map<string, IPluginConfig> = new Map();
  private dependencyGraph: Map<string, string[]> = new Map();

  public register(plugin: IPlugin, config?: IPluginConfig): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }

    this.plugins.set(plugin.id, plugin);
    
    if (config) {
      this.configs.set(plugin.id, config);
    }

    this.dependencyGraph.set(plugin.id, plugin.dependencies);
  }

  public unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.destroy();
    }
    
    this.plugins.delete(pluginId);
    this.configs.delete(pluginId);
    this.dependencyGraph.delete(pluginId);
  }

  public getPlugin<T extends IPlugin>(pluginId: string): T | undefined {
    return this.plugins.get(pluginId) as T;
  }

  public getPluginsByType<T extends IPlugin>(type: new (...args: any[]) => T): T[] {
    const result: T[] = [];
    for (const plugin of this.plugins.values()) {
      if (plugin instanceof type) {
        result.push(plugin as T);
      }
    }
    return result;
  }

  public async initializeAll(): Promise<void> {
    const initOrder = this.resolveInitializationOrder();
    
    for (const pluginId of initOrder) {
      const plugin = this.plugins.get(pluginId);
      if (plugin && plugin.isEnabled()) {
        await plugin.initialize();
      }
    }
  }

  public async destroyAll(): Promise<void> {
    // Destroy in reverse order
    const initOrder = this.resolveInitializationOrder();
    
    for (let i = initOrder.length - 1; i >= 0; i--) {
      const plugin = this.plugins.get(initOrder[i]);
      if (plugin) {
        await plugin.destroy();
      }
    }
  }

  public getRegisteredPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  public hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  public setPluginEnabled(pluginId: string, enabled: boolean): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.setEnabled(enabled);
    }
  }

  /**
   * Resolve plugin initialization order based on dependencies
   * Uses topological sort to handle dependencies
   */
  private resolveInitializationOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (pluginId: string) => {
      if (visiting.has(pluginId)) {
        throw new Error(`Circular dependency detected involving plugin: ${pluginId}`);
      }
      
      if (visited.has(pluginId)) {
        return;
      }

      visiting.add(pluginId);
      
      const dependencies = this.dependencyGraph.get(pluginId) || [];
      for (const depId of dependencies) {
        if (!this.plugins.has(depId)) {
          throw new Error(`Plugin ${pluginId} depends on ${depId}, but ${depId} is not registered`);
        }
        visit(depId);
      }

      visiting.delete(pluginId);
      visited.add(pluginId);
      result.push(pluginId);
    };

    for (const pluginId of this.plugins.keys()) {
      visit(pluginId);
    }

    return result;
  }
}
