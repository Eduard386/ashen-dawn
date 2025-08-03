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
export class RegistryFactory<T> implements IRegistryFactory<T> {
  private creators: Map<string, CreatorFunction<T>> = new Map();
  private priorities: Map<string, number> = new Map();
  private descriptions: Map<string, string> = new Map();

  public register(type: string, creator: CreatorFunction<T>): void {
    this.creators.set(type, creator);
  }

  public registerWithOptions(registration: IFactoryRegistration<T>): void {
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

  public unregister(type: string): void {
    this.creators.delete(type);
    this.priorities.delete(type);
    this.descriptions.delete(type);
  }

  public create(...args: any[]): T {
    const type = args[0] as string;
    const creator = this.creators.get(type);
    
    if (!creator) {
      throw new Error(`No creator registered for type: ${type}`);
    }
    
    return creator(...args.slice(1));
  }

  public canCreate(type: string): boolean {
    return this.creators.has(type);
  }

  public isRegistered(type: string): boolean {
    return this.creators.has(type);
  }

  public getSupportedTypes(): string[] {
    return Array.from(this.creators.keys());
  }

  public getDescription(type: string): string | undefined {
    return this.descriptions.get(type);
  }

  public getPriority(type: string): number {
    return this.priorities.get(type) || 0;
  }
}

/**
 * Abstract Factory Implementation
 */
export class AbstractFactory implements IAbstractFactory {
  private factories: Map<string, IFactory<any>> = new Map();

  public getFactory<T>(name: string): IFactory<T> | undefined {
    return this.factories.get(name) as IFactory<T>;
  }

  public registerFactory<T>(name: string, factory: IFactory<T>): void {
    this.factories.set(name, factory);
  }

  public unregisterFactory(name: string): void {
    this.factories.delete(name);
  }

  public getFactoryNames(): string[] {
    return Array.from(this.factories.keys());
  }
}

/**
 * Fluent Factory Builder
 * Provides a fluent interface for factory configuration
 */
export class FactoryBuilder<T> {
  private factory: RegistryFactory<T> = new RegistryFactory<T>();

  public static create<T>(): FactoryBuilder<T> {
    return new FactoryBuilder<T>();
  }

  public register(type: string, creator: CreatorFunction<T>): FactoryBuilder<T> {
    this.factory.register(type, creator);
    return this;
  }

  public registerWithPriority(
    type: string, 
    creator: CreatorFunction<T>, 
    priority: number,
    description?: string
  ): FactoryBuilder<T> {
    this.factory.registerWithOptions({
      type,
      creator,
      priority,
      description
    });
    return this;
  }

  public build(): RegistryFactory<T> {
    return this.factory;
  }
}

/**
 * Singleton Factory Decorator
 * Ensures only one instance is created per type
 */
export class SingletonFactory<T> implements IFactory<T> {
  private instances: Map<string, T> = new Map();
  private wrappedFactory: IFactory<T>;

  constructor(factory: IFactory<T>) {
    this.wrappedFactory = factory;
  }

  public create(...args: any[]): T {
    const type = args[0] as string;
    
    if (!this.instances.has(type)) {
      const instance = this.wrappedFactory.create(...args);
      this.instances.set(type, instance);
    }
    
    return this.instances.get(type)!;
  }

  public canCreate(type: string): boolean {
    return this.wrappedFactory.canCreate(type);
  }

  public getSupportedTypes(): string[] {
    return this.wrappedFactory.getSupportedTypes();
  }

  public clearCache(): void {
    this.instances.clear();
  }

  public clearCacheForType(type: string): void {
    this.instances.delete(type);
  }
}

/**
 * Lazy Factory Decorator
 * Defers creation until explicitly requested
 */
export class LazyFactory<T> implements IFactory<T> {
  private lazyInstances: Map<string, () => T> = new Map();
  private wrappedFactory: IFactory<T>;

  constructor(factory: IFactory<T>) {
    this.wrappedFactory = factory;
  }

  public create(...args: any[]): T {
    const type = args[0] as string;
    
    if (!this.lazyInstances.has(type)) {
      // Store creation function for later execution
      this.lazyInstances.set(type, () => this.wrappedFactory.create(...args));
    }
    
    // Execute creation function
    return this.lazyInstances.get(type)!();
  }

  public canCreate(type: string): boolean {
    return this.wrappedFactory.canCreate(type);
  }

  public getSupportedTypes(): string[] {
    return this.wrappedFactory.getSupportedTypes();
  }
}

/**
 * Factory Extension Manager
 * Manages factory plugins and extensions
 */
export class FactoryExtensionManager {
  private extensionFactories: Map<string, IRegistryFactory<any>> = new Map();
  private extensionPoints: Map<string, string[]> = new Map();

  /**
   * Register an extension factory for a specific extension point
   */
  public registerExtensionFactory<T>(
    extensionPoint: string,
    factory: IRegistryFactory<T>
  ): void {
    this.extensionFactories.set(extensionPoint, factory);
    
    if (!this.extensionPoints.has(extensionPoint)) {
      this.extensionPoints.set(extensionPoint, []);
    }
  }

  /**
   * Register an extension creator for a specific extension point
   */
  public registerExtension<T>(
    extensionPoint: string,
    type: string,
    creator: CreatorFunction<T>,
    priority: number = 0
  ): void {
    let factory = this.extensionFactories.get(extensionPoint) as IRegistryFactory<T>;
    
    if (!factory) {
      factory = new RegistryFactory<T>();
      this.extensionFactories.set(extensionPoint, factory);
      this.extensionPoints.set(extensionPoint, []);
    }

    if ('registerWithOptions' in factory) {
      (factory as RegistryFactory<T>).registerWithOptions({
        type,
        creator,
        priority
      });
    } else {
      factory.register(type, creator);
    }

    const types = this.extensionPoints.get(extensionPoint)!;
    if (!types.includes(type)) {
      types.push(type);
    }
  }

  /**
   * Create an extension instance
   */
  public createExtension<T>(extensionPoint: string, type: string, ...args: any[]): T {
    const factory = this.extensionFactories.get(extensionPoint) as IRegistryFactory<T>;
    
    if (!factory) {
      throw new Error(`No factory registered for extension point: ${extensionPoint}`);
    }
    
    return factory.create(type, ...args);
  }

  /**
   * Get all available extension types for an extension point
   */
  public getAvailableExtensions(extensionPoint: string): string[] {
    return this.extensionPoints.get(extensionPoint) || [];
  }

  /**
   * Check if an extension type is available
   */
  public hasExtension(extensionPoint: string, type: string): boolean {
    const factory = this.extensionFactories.get(extensionPoint);
    return factory ? factory.canCreate(type) : false;
  }

  /**
   * Get all registered extension points
   */
  public getExtensionPoints(): string[] {
    return Array.from(this.extensionPoints.keys());
  }
}
