/**
 * Polymorphic Processors
 * Demonstrates LSP compliance through polymorphic processing of base classes
 */
import { CombatEntity } from '../combat/LSPCombatSystem';
import { ServiceBase } from '../services/LSPServiceBase';
import { Asset } from '../assets/LSPAssetSystem';
/**
 * Processing Result Interface
 */
export interface IProcessingResult {
    /** Processing success status */
    readonly success: boolean;
    /** Number of items processed */
    readonly itemsProcessed: number;
    /** Number of items that failed processing */
    readonly itemsFailed: number;
    /** Processing duration in milliseconds */
    readonly duration: number;
    /** Processing timestamp */
    readonly timestamp: Date;
    /** Detailed results for each item */
    readonly itemResults: any[];
    /** Error messages if any */
    readonly errors: string[];
    /** Processing metadata */
    readonly metadata: Record<string, any>;
}
/**
 * Processing Options Interface
 */
export interface IProcessingOptions {
    /** Continue processing on individual item failures */
    readonly continueOnError?: boolean;
    /** Maximum processing time per item */
    readonly itemTimeout?: number;
    /** Progress callback */
    readonly onProgress?: (progress: number, current: number, total: number) => void;
    /** Error callback */
    readonly onError?: (error: Error, item: any, index: number) => void;
    /** Parallel processing concurrency */
    readonly concurrency?: number;
    /** Custom processing metadata */
    readonly metadata?: Record<string, any>;
}
/**
 * Abstract Polymorphic Processor Base
 *
 * LSP Contract:
 * - All subclasses must be substitutable for this base
 * - Processing behavior must be consistent across implementations
 * - Error handling must follow the same patterns
 */
export declare abstract class PolymorphicProcessor<T> {
    protected processedCount: number;
    protected errorCount: number;
    protected startTime: number;
    /**
     * Process a collection of items polymorphically
     *
     * LSP Contract:
     * - Precondition: items array must not be null
     * - Postcondition: returns valid IProcessingResult
     * - Must handle all subtypes of T consistently
     */
    processCollection(items: T[], options?: IProcessingOptions): Promise<IProcessingResult>;
    /**
     * Process a single item
     * Abstract method that subclasses must implement
     *
     * LSP Contract:
     * - Must handle all subtypes of T
     * - Must maintain consistent error handling
     * - Must update processing statistics
     */
    protected processItem(item: T, index: number, options: IProcessingOptions): Promise<any>;
    /**
     * Abstract method: Item-specific processing logic
     */
    protected abstract onProcessItem(item: T, index: number, options: IProcessingOptions): Promise<any>;
    /**
     * Virtual method: Get item identifier for logging/debugging
     */
    protected getItemIdentifier(item: T): string;
    /**
     * Utility method: Chunk array for parallel processing
     */
    protected chunkArray<U>(array: U[], chunkSize: number): U[][];
    /**
     * Get processing statistics
     */
    getStatistics(): {
        processedCount: number;
        errorCount: number;
        successRate: number;
        elapsedTime: number;
    };
}
/**
 * Combat Entity Processor
 * Processes any CombatEntity subclass polymorphically
 */
export declare class CombatEntityProcessor extends PolymorphicProcessor<CombatEntity> {
    protected onProcessItem(entity: CombatEntity, index: number, options: IProcessingOptions): Promise<any>;
    protected getItemIdentifier(entity: CombatEntity): string;
    /**
     * Combat-specific processing: simulate battle round
     */
    simulateBattleRound(entities: CombatEntity[], options?: IProcessingOptions): Promise<IProcessingResult>;
}
/**
 * Service Processor
 * Processes any ServiceBase subclass polymorphically
 */
export declare class ServiceProcessor extends PolymorphicProcessor<ServiceBase> {
    protected onProcessItem(service: ServiceBase, index: number, options: IProcessingOptions): Promise<any>;
    protected getItemIdentifier(service: ServiceBase): string;
    /**
     * Service-specific processing: initialize all services
     */
    initializeServices(services: ServiceBase[], options?: IProcessingOptions): Promise<IProcessingResult>;
    /**
     * Service-specific processing: health check all services
     */
    performHealthChecks(services: ServiceBase[], options?: IProcessingOptions): Promise<IProcessingResult>;
}
/**
 * Asset Processor
 * Processes any Asset subclass polymorphically
 */
export declare class AssetProcessor extends PolymorphicProcessor<Asset> {
    protected onProcessItem(asset: Asset, index: number, options: IProcessingOptions): Promise<any>;
    protected getItemIdentifier(asset: Asset): string;
    /**
     * Asset-specific processing: load all assets
     */
    loadAssets(assets: Asset[], options?: IProcessingOptions): Promise<IProcessingResult>;
    /**
     * Asset-specific processing: validate all assets
     */
    validateAssets(assets: Asset[], options?: IProcessingOptions): Promise<IProcessingResult>;
}
/**
 * Universal Polymorphic Processor
 * Can process any type of object with a common interface
 */
export declare class UniversalProcessor<T> extends PolymorphicProcessor<T> {
    private customProcessor;
    constructor(processor: (item: T, index: number, options: IProcessingOptions) => Promise<any>);
    protected onProcessItem(item: T, index: number, options: IProcessingOptions): Promise<any>;
}
/**
 * Polymorphic Processor Factory
 * Creates appropriate processors for different types
 */
export declare class ProcessorFactory {
    /**
     * Create a combat entity processor
     */
    static createCombatProcessor(): CombatEntityProcessor;
    /**
     * Create a service processor
     */
    static createServiceProcessor(): ServiceProcessor;
    /**
     * Create an asset processor
     */
    static createAssetProcessor(): AssetProcessor;
    /**
     * Create a universal processor with custom logic
     */
    static createUniversalProcessor<T>(processor: (item: T, index: number, options: IProcessingOptions) => Promise<any>): UniversalProcessor<T>;
    /**
     * Auto-detect processor type based on array contents
     */
    static createAutoProcessor<T>(items: T[]): PolymorphicProcessor<T>;
}
