/**
 * Core Extension Framework
 * Orchestrates plugins, events, factories, and strategies
 */

import { 
  IPlugin, 
  IPluginRegistry, 
  PluginManager, 
  BasePlugin,
  IPluginConfig 
} from './PluginSystem';

import { 
  IEventBus, 
  EventBus, 
  IEvent, 
  BaseEvent, 
  IEventListener,
  EventTypes 
} from './EventSystem';

import { 
  IFactory, 
  IRegistryFactory, 
  FactoryExtensionManager,
  AbstractFactory,
  RegistryFactory 
} from './FactorySystem';

import { 
  IStrategy, 
  IStrategyContext, 
  StrategyRegistry,
  StrategyContext 
} from './StrategySystem';

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
export enum ExtensionPointType {
  PLUGIN = 'plugin',
  STRATEGY = 'strategy',
  FACTORY = 'factory',
  EVENT_LISTENER = 'event_listener',
  SERVICE = 'service',
  CUSTOM = 'custom'
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
export class ExtensionManager implements IExtensionManager {
  private pluginManager: PluginManager;
  private eventBus: EventBus;
  private factoryManager: FactoryExtensionManager;
  private strategyRegistry: StrategyRegistry;
  
  private extensionPoints: Map<string, IExtensionPoint> = new Map();
  private extensions: Map<string, any[]> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.pluginManager = new PluginManager();
    this.eventBus = new EventBus();
    this.factoryManager = new FactoryExtensionManager();
    this.strategyRegistry = new StrategyRegistry();
    
    this.setupCoreExtensionPoints();
  }

  public getPluginManager(): IPluginRegistry {
    return this.pluginManager;
  }

  public getEventBus(): IEventBus {
    return this.eventBus;
  }

  public getFactoryManager(): FactoryExtensionManager {
    return this.factoryManager;
  }

  public getStrategyRegistry(): StrategyRegistry {
    return this.strategyRegistry;
  }

  public registerExtensionPoint(extensionPoint: IExtensionPoint): void {
    if (this.extensionPoints.has(extensionPoint.id)) {
      throw new Error(`Extension point ${extensionPoint.id} is already registered`);
    }
    
    this.extensionPoints.set(extensionPoint.id, extensionPoint);
    this.extensions.set(extensionPoint.id, []);
    
    // Emit extension point registered event
    this.eventBus.dispatch(
      'extension.point.registered',
      { extensionPoint },
      'ExtensionManager'
    );
  }

  public registerExtension(registration: IExtensionRegistration): void {
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
    this.eventBus.dispatch(
      'extension.registered',
      { registration },
      'ExtensionManager'
    );
  }

  public getExtensions(extensionPointId: string): any[] {
    return this.extensions.get(extensionPointId) || [];
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    // Initialize plugins
    await this.pluginManager.initializeAll();
    
    // Emit system initialized event
    await this.eventBus.dispatch(
      'extension.system.initialized',
      { manager: this },
      'ExtensionManager'
    );
    
    this.initialized = true;
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    // Emit system shutdown event
    await this.eventBus.dispatch(
      'extension.system.shutdown',
      { manager: this },
      'ExtensionManager'
    );
    
    // Shutdown plugins
    await this.pluginManager.destroyAll();
    
    this.initialized = false;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getExtensionPoints(): IExtensionPoint[] {
    return Array.from(this.extensionPoints.values());
  }

  public hasExtensionPoint(id: string): boolean {
    return this.extensionPoints.has(id);
  }

  private setupCoreExtensionPoints(): void {
    // Core extension points that are always available
    const corePoints: IExtensionPoint[] = [
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

  private registerPluginExtension(registration: IExtensionRegistration): void {
    const plugin = registration.implementation as IPlugin;
    const config = registration.config as IPluginConfig;
    
    this.pluginManager.register(plugin, config);
    
    const extensions = this.extensions.get(registration.extensionPointId)!;
    extensions.push(plugin);
  }

  private registerStrategyExtension(registration: IExtensionRegistration): void {
    const strategy = registration.implementation as IStrategy;
    const domain = registration.config?.domain || registration.extensionPointId;
    
    this.strategyRegistry.registerStrategy(domain, strategy);
    
    const extensions = this.extensions.get(registration.extensionPointId)!;
    extensions.push(strategy);
  }

  private registerFactoryExtension(registration: IExtensionRegistration): void {
    const factory = registration.implementation as IFactory<any>;
    const extensionPoint = registration.extensionPointId;
    
    this.factoryManager.registerExtensionFactory(extensionPoint, factory as IRegistryFactory<any>);
    
    const extensions = this.extensions.get(registration.extensionPointId)!;
    extensions.push(factory);
  }

  private registerEventListenerExtension(registration: IExtensionRegistration): void {
    const listener = registration.implementation as IEventListener;
    
    this.eventBus.subscribe(listener);
    
    const extensions = this.extensions.get(registration.extensionPointId)!;
    extensions.push(listener);
  }

  private registerGenericExtension(registration: IExtensionRegistration): void {
    const extensions = this.extensions.get(registration.extensionPointId)!;
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
export function Extension(extensionPointId: string, config?: Record<string, any>) {
  return function(target: any) {
    // Register the extension when the class is defined
    const registration: IExtensionRegistration = {
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
export function Plugin(id: string, config?: Partial<IPluginConfig>) {
  return Extension('core.plugins', { id, ...config });
}

/**
 * Strategy Decorator
 * Simplified strategy registration
 */
export function Strategy(domain: string, priority: number = 0) {
  return Extension('strategies', { domain, priority });
}

/**
 * Factory Decorator
 * Simplified factory registration
 */
export function Factory(extensionPoint: string) {
  return Extension(extensionPoint);
}

/**
 * Extension Helper Functions
 */
export class ExtensionHelpers {
  /**
   * Create a simple plugin from a configuration object
   */
  static createSimplePlugin(
    id: string,
    name: string,
    version: string,
    initFn?: () => void | Promise<void>,
    destroyFn?: () => void | Promise<void>
  ): IPlugin {
    return new SimplePlugin(id, name, version, initFn, destroyFn);
  }

  /**
   * Create a strategy context with default selector
   */
  static createStrategyContext<TInput, TOutput>(): IStrategyContext<TInput, TOutput> {
    return new StrategyContext<TInput, TOutput>();
  }

  /**
   * Create a registry factory
   */
  static createRegistryFactory<T>(): IRegistryFactory<T> {
    return new RegistryFactory<T>();
  }
}

/**
 * Simple Plugin Implementation
 */
class SimplePlugin extends BasePlugin {
  private initFn?: () => void | Promise<void>;
  private destroyFn?: () => void | Promise<void>;

  constructor(
    id: string,
    name: string,
    version: string,
    initFn?: () => void | Promise<void>,
    destroyFn?: () => void | Promise<void>
  ) {
    super(id, name, version, `Simple plugin: ${name}`);
    this.initFn = initFn;
    this.destroyFn = destroyFn;
  }

  protected async onInitialize(): Promise<void> {
    if (this.initFn) {
      await this.initFn();
    }
  }

  protected async onDestroy(): Promise<void> {
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
