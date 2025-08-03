/**
 * Strategy Pattern Infrastructure
 * Provides flexible algorithm selection and extension
 */

/**
 * Base Strategy Interface
 */
export interface IStrategy<TInput = any, TOutput = any> {
  /** Strategy identifier */
  readonly name: string;
  
  /** Strategy description */
  readonly description: string;
  
  /** Strategy priority (higher numbers take precedence) */
  readonly priority: number;
  
  /** Execute the strategy */
  execute(input: TInput): TOutput | Promise<TOutput>;
  
  /** Check if strategy can handle the input */
  canHandle(input: TInput): boolean;
  
  /** Get strategy metadata */
  getMetadata(): Record<string, any>;
}

/**
 * Strategy Context Interface
 * Manages strategy selection and execution
 */
export interface IStrategyContext<TInput = any, TOutput = any> {
  /** Add a strategy */
  addStrategy(strategy: IStrategy<TInput, TOutput>): void;
  
  /** Remove a strategy */
  removeStrategy(strategyName: string): void;
  
  /** Execute using the best available strategy */
  execute(input: TInput): TOutput | Promise<TOutput>;
  
  /** Execute using a specific strategy */
  executeWith(strategyName: string, input: TInput): TOutput | Promise<TOutput>;
  
  /** Get all available strategies */
  getStrategies(): IStrategy<TInput, TOutput>[];
  
  /** Get strategies that can handle specific input */
  getApplicableStrategies(input: TInput): IStrategy<TInput, TOutput>[];
  
  /** Set default strategy selection logic */
  setStrategySelector(selector: IStrategySelector<TInput, TOutput>): void;
}

/**
 * Strategy Selector Interface
 * Defines how strategies are selected
 */
export interface IStrategySelector<TInput = any, TOutput = any> {
  /** Select the best strategy for given input */
  selectStrategy(
    strategies: IStrategy<TInput, TOutput>[], 
    input: TInput
  ): IStrategy<TInput, TOutput> | undefined;
}

/**
 * Strategy Chain Interface
 * Allows chaining multiple strategies
 */
export interface IStrategyChain<TInput = any, TOutput = any> {
  /** Add strategy to chain */
  addStrategy(strategy: IStrategy<TInput, TOutput>): IStrategyChain<TInput, TOutput>;
  
  /** Execute the chain */
  execute(input: TInput): TOutput | Promise<TOutput>;
  
  /** Set chain execution mode */
  setExecutionMode(mode: ChainExecutionMode): void;
}

/**
 * Chain Execution Modes
 */
export enum ChainExecutionMode {
  /** Execute first applicable strategy only */
  FIRST_MATCH = 'first_match',
  
  /** Execute all applicable strategies in order */
  ALL_APPLICABLE = 'all_applicable',
  
  /** Execute until one strategy succeeds */
  UNTIL_SUCCESS = 'until_success',
  
  /** Execute strategies based on priority */
  PRIORITY_ORDER = 'priority_order'
}

/**
 * Abstract Strategy Base Class
 */
export abstract class AbstractStrategy<TInput = any, TOutput = any> implements IStrategy<TInput, TOutput> {
  public readonly name: string;
  public readonly description: string;
  public readonly priority: number;
  protected metadata: Record<string, any>;

  constructor(name: string, description: string, priority: number = 0, metadata: Record<string, any> = {}) {
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.metadata = metadata;
  }

  public abstract execute(input: TInput): TOutput | Promise<TOutput>;

  public canHandle(input: TInput): boolean {
    // Default implementation - override for specific logic
    return true;
  }

  public getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  protected setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }
}

/**
 * Strategy Context Implementation
 */
export class StrategyContext<TInput = any, TOutput = any> implements IStrategyContext<TInput, TOutput> {
  private strategies: Map<string, IStrategy<TInput, TOutput>> = new Map();
  private strategySelector: IStrategySelector<TInput, TOutput>;

  constructor(selector?: IStrategySelector<TInput, TOutput>) {
    this.strategySelector = selector || new PriorityStrategySelector<TInput, TOutput>();
  }

  public addStrategy(strategy: IStrategy<TInput, TOutput>): void {
    this.strategies.set(strategy.name, strategy);
  }

  public removeStrategy(strategyName: string): void {
    this.strategies.delete(strategyName);
  }

  public async execute(input: TInput): Promise<TOutput> {
    const applicableStrategies = this.getApplicableStrategies(input);
    const selectedStrategy = this.strategySelector.selectStrategy(applicableStrategies, input);
    
    if (!selectedStrategy) {
      throw new Error('No applicable strategy found for input');
    }
    
    return await selectedStrategy.execute(input);
  }

  public async executeWith(strategyName: string, input: TInput): Promise<TOutput> {
    const strategy = this.strategies.get(strategyName);
    
    if (!strategy) {
      throw new Error(`Strategy '${strategyName}' not found`);
    }
    
    if (!strategy.canHandle(input)) {
      throw new Error(`Strategy '${strategyName}' cannot handle the provided input`);
    }
    
    return await strategy.execute(input);
  }

  public getStrategies(): IStrategy<TInput, TOutput>[] {
    return Array.from(this.strategies.values());
  }

  public getApplicableStrategies(input: TInput): IStrategy<TInput, TOutput>[] {
    return Array.from(this.strategies.values()).filter(strategy => strategy.canHandle(input));
  }

  public setStrategySelector(selector: IStrategySelector<TInput, TOutput>): void {
    this.strategySelector = selector;
  }
}

/**
 * Priority-based Strategy Selector
 */
export class PriorityStrategySelector<TInput = any, TOutput = any> implements IStrategySelector<TInput, TOutput> {
  public selectStrategy(
    strategies: IStrategy<TInput, TOutput>[], 
    input: TInput
  ): IStrategy<TInput, TOutput> | undefined {
    if (strategies.length === 0) {
      return undefined;
    }
    
    // Sort by priority (highest first) and select the first one
    return strategies.sort((a, b) => b.priority - a.priority)[0];
  }
}

/**
 * Random Strategy Selector
 */
export class RandomStrategySelector<TInput = any, TOutput = any> implements IStrategySelector<TInput, TOutput> {
  public selectStrategy(
    strategies: IStrategy<TInput, TOutput>[], 
    input: TInput
  ): IStrategy<TInput, TOutput> | undefined {
    if (strategies.length === 0) {
      return undefined;
    }
    
    const randomIndex = Math.floor(Math.random() * strategies.length);
    return strategies[randomIndex];
  }
}

/**
 * Weighted Strategy Selector
 */
export class WeightedStrategySelector<TInput = any, TOutput = any> implements IStrategySelector<TInput, TOutput> {
  public selectStrategy(
    strategies: IStrategy<TInput, TOutput>[], 
    input: TInput
  ): IStrategy<TInput, TOutput> | undefined {
    if (strategies.length === 0) {
      return undefined;
    }
    
    // Use priority as weight
    const totalWeight = strategies.reduce((sum, strategy) => sum + Math.max(1, strategy.priority), 0);
    let random = Math.random() * totalWeight;
    
    for (const strategy of strategies) {
      random -= Math.max(1, strategy.priority);
      if (random <= 0) {
        return strategy;
      }
    }
    
    return strategies[strategies.length - 1];
  }
}

/**
 * Strategy Chain Implementation
 */
export class StrategyChain<TInput = any, TOutput = any> implements IStrategyChain<TInput, TOutput> {
  private strategies: IStrategy<TInput, TOutput>[] = [];
  private executionMode: ChainExecutionMode = ChainExecutionMode.FIRST_MATCH;

  public addStrategy(strategy: IStrategy<TInput, TOutput>): IStrategyChain<TInput, TOutput> {
    this.strategies.push(strategy);
    return this;
  }

  public setExecutionMode(mode: ChainExecutionMode): void {
    this.executionMode = mode;
  }

  public async execute(input: TInput): Promise<TOutput> {
    const applicableStrategies = this.strategies.filter(strategy => strategy.canHandle(input));
    
    if (applicableStrategies.length === 0) {
      throw new Error('No applicable strategies in chain');
    }

    switch (this.executionMode) {
      case ChainExecutionMode.FIRST_MATCH:
        return await applicableStrategies[0].execute(input);
        
      case ChainExecutionMode.PRIORITY_ORDER:
        const sortedStrategies = applicableStrategies.sort((a, b) => b.priority - a.priority);
        return await sortedStrategies[0].execute(input);
        
      case ChainExecutionMode.UNTIL_SUCCESS:
        return await this.executeUntilSuccess(applicableStrategies, input);
        
      case ChainExecutionMode.ALL_APPLICABLE:
        return await this.executeAll(applicableStrategies, input);
        
      default:
        throw new Error(`Unsupported execution mode: ${this.executionMode}`);
    }
  }

  private async executeUntilSuccess(strategies: IStrategy<TInput, TOutput>[], input: TInput): Promise<TOutput> {
    let lastError: Error | undefined;
    
    for (const strategy of strategies) {
      try {
        return await strategy.execute(input);
      } catch (error) {
        lastError = error as Error;
        continue;
      }
    }
    
    throw lastError || new Error('All strategies failed');
  }

  private async executeAll(strategies: IStrategy<TInput, TOutput>[], input: TInput): Promise<TOutput> {
    const results: TOutput[] = [];
    
    for (const strategy of strategies) {
      try {
        const result = await strategy.execute(input);
        results.push(result);
      } catch (error) {
        console.warn(`Strategy ${strategy.name} failed:`, error);
      }
    }
    
    // Return the last successful result, or throw if none succeeded
    if (results.length === 0) {
      throw new Error('All strategies failed');
    }
    
    return results[results.length - 1];
  }
}

/**
 * Strategy Registry
 * Central registry for managing strategies across the application
 */
export class StrategyRegistry {
  private contexts: Map<string, IStrategyContext<any, any>> = new Map();
  private chains: Map<string, IStrategyChain<any, any>> = new Map();

  /**
   * Register a strategy context for a domain
   */
  public registerContext<TInput, TOutput>(
    domain: string, 
    context: IStrategyContext<TInput, TOutput>
  ): void {
    this.contexts.set(domain, context);
  }

  /**
   * Get strategy context for a domain
   */
  public getContext<TInput, TOutput>(domain: string): IStrategyContext<TInput, TOutput> | undefined {
    return this.contexts.get(domain) as IStrategyContext<TInput, TOutput>;
  }

  /**
   * Register a strategy to a domain
   */
  public registerStrategy<TInput, TOutput>(
    domain: string, 
    strategy: IStrategy<TInput, TOutput>
  ): void {
    let context = this.contexts.get(domain) as IStrategyContext<TInput, TOutput>;
    
    if (!context) {
      context = new StrategyContext<TInput, TOutput>();
      this.contexts.set(domain, context);
    }
    
    context.addStrategy(strategy);
  }

  /**
   * Register a strategy chain for a domain
   */
  public registerChain<TInput, TOutput>(
    domain: string, 
    chain: IStrategyChain<TInput, TOutput>
  ): void {
    this.chains.set(domain, chain);
  }

  /**
   * Get strategy chain for a domain
   */
  public getChain<TInput, TOutput>(domain: string): IStrategyChain<TInput, TOutput> | undefined {
    return this.chains.get(domain) as IStrategyChain<TInput, TOutput>;
  }

  /**
   * Execute strategy in a domain
   */
  public async executeStrategy<TInput, TOutput>(domain: string, input: TInput): Promise<TOutput> {
    const context = this.getContext<TInput, TOutput>(domain);
    
    if (!context) {
      throw new Error(`No strategy context registered for domain: ${domain}`);
    }
    
    return await context.execute(input);
  }

  /**
   * Get all registered domains
   */
  public getDomains(): string[] {
    const contextDomains = Array.from(this.contexts.keys());
    const chainDomains = Array.from(this.chains.keys());
    
    return Array.from(new Set([...contextDomains, ...chainDomains]));
  }
}
