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
    selectStrategy(strategies: IStrategy<TInput, TOutput>[], input: TInput): IStrategy<TInput, TOutput> | undefined;
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
export declare enum ChainExecutionMode {
    /** Execute first applicable strategy only */
    FIRST_MATCH = "first_match",
    /** Execute all applicable strategies in order */
    ALL_APPLICABLE = "all_applicable",
    /** Execute until one strategy succeeds */
    UNTIL_SUCCESS = "until_success",
    /** Execute strategies based on priority */
    PRIORITY_ORDER = "priority_order"
}
/**
 * Abstract Strategy Base Class
 */
export declare abstract class AbstractStrategy<TInput = any, TOutput = any> implements IStrategy<TInput, TOutput> {
    readonly name: string;
    readonly description: string;
    readonly priority: number;
    protected metadata: Record<string, any>;
    constructor(name: string, description: string, priority?: number, metadata?: Record<string, any>);
    abstract execute(input: TInput): TOutput | Promise<TOutput>;
    canHandle(input: TInput): boolean;
    getMetadata(): Record<string, any>;
    protected setMetadata(key: string, value: any): void;
}
/**
 * Strategy Context Implementation
 */
export declare class StrategyContext<TInput = any, TOutput = any> implements IStrategyContext<TInput, TOutput> {
    private strategies;
    private strategySelector;
    constructor(selector?: IStrategySelector<TInput, TOutput>);
    addStrategy(strategy: IStrategy<TInput, TOutput>): void;
    removeStrategy(strategyName: string): void;
    execute(input: TInput): Promise<TOutput>;
    executeWith(strategyName: string, input: TInput): Promise<TOutput>;
    getStrategies(): IStrategy<TInput, TOutput>[];
    getApplicableStrategies(input: TInput): IStrategy<TInput, TOutput>[];
    setStrategySelector(selector: IStrategySelector<TInput, TOutput>): void;
}
/**
 * Priority-based Strategy Selector
 */
export declare class PriorityStrategySelector<TInput = any, TOutput = any> implements IStrategySelector<TInput, TOutput> {
    selectStrategy(strategies: IStrategy<TInput, TOutput>[], input: TInput): IStrategy<TInput, TOutput> | undefined;
}
/**
 * Random Strategy Selector
 */
export declare class RandomStrategySelector<TInput = any, TOutput = any> implements IStrategySelector<TInput, TOutput> {
    selectStrategy(strategies: IStrategy<TInput, TOutput>[], input: TInput): IStrategy<TInput, TOutput> | undefined;
}
/**
 * Weighted Strategy Selector
 */
export declare class WeightedStrategySelector<TInput = any, TOutput = any> implements IStrategySelector<TInput, TOutput> {
    selectStrategy(strategies: IStrategy<TInput, TOutput>[], input: TInput): IStrategy<TInput, TOutput> | undefined;
}
/**
 * Strategy Chain Implementation
 */
export declare class StrategyChain<TInput = any, TOutput = any> implements IStrategyChain<TInput, TOutput> {
    private strategies;
    private executionMode;
    addStrategy(strategy: IStrategy<TInput, TOutput>): IStrategyChain<TInput, TOutput>;
    setExecutionMode(mode: ChainExecutionMode): void;
    execute(input: TInput): Promise<TOutput>;
    private executeUntilSuccess;
    private executeAll;
}
/**
 * Strategy Registry
 * Central registry for managing strategies across the application
 */
export declare class StrategyRegistry {
    private contexts;
    private chains;
    /**
     * Register a strategy context for a domain
     */
    registerContext<TInput, TOutput>(domain: string, context: IStrategyContext<TInput, TOutput>): void;
    /**
     * Get strategy context for a domain
     */
    getContext<TInput, TOutput>(domain: string): IStrategyContext<TInput, TOutput> | undefined;
    /**
     * Register a strategy to a domain
     */
    registerStrategy<TInput, TOutput>(domain: string, strategy: IStrategy<TInput, TOutput>): void;
    /**
     * Register a strategy chain for a domain
     */
    registerChain<TInput, TOutput>(domain: string, chain: IStrategyChain<TInput, TOutput>): void;
    /**
     * Get strategy chain for a domain
     */
    getChain<TInput, TOutput>(domain: string): IStrategyChain<TInput, TOutput> | undefined;
    /**
     * Execute strategy in a domain
     */
    executeStrategy<TInput, TOutput>(domain: string, input: TInput): Promise<TOutput>;
    /**
     * Get all registered domains
     */
    getDomains(): string[];
}
