/**
 * Polymorphic Processors
 * Demonstrates LSP compliance through polymorphic processing of base classes
 */

import { CombatEntity, ICombatResult } from '../combat/LSPCombatSystem';
import { ServiceBase, IServiceMetrics, ServiceStatus } from '../services/LSPServiceBase';
import { Asset, IAssetLoadResult, AssetStatus } from '../assets/LSPAssetSystem';

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
export abstract class PolymorphicProcessor<T> {
  protected processedCount: number = 0;
  protected errorCount: number = 0;
  protected startTime: number = 0;

  /**
   * Process a collection of items polymorphically
   * 
   * LSP Contract:
   * - Precondition: items array must not be null
   * - Postcondition: returns valid IProcessingResult
   * - Must handle all subtypes of T consistently
   */
  public async processCollection(
    items: T[],
    options: IProcessingOptions = {}
  ): Promise<IProcessingResult> {
    // Precondition validation
    if (!items) {
      throw new Error('Items collection cannot be null');
    }

    this.processedCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
    
    const itemResults: any[] = [];
    const errors: string[] = [];
    const continueOnError = options.continueOnError ?? true;
    const concurrency = options.concurrency ?? 1;

    try {
      if (concurrency === 1) {
        // Sequential processing
        for (let i = 0; i < items.length; i++) {
          const result = await this.processItem(items[i], i, options);
          itemResults.push(result);
          
          if (options.onProgress) {
            options.onProgress((i + 1) / items.length, i + 1, items.length);
          }
        }
      } else {
        // Parallel processing
        const chunks = this.chunkArray(items, concurrency);
        for (const chunk of chunks) {
          const promises = chunk.map((item, localIndex) => {
            const globalIndex = items.indexOf(item);
            return this.processItem(item, globalIndex, options);
          });
          
          const chunkResults = await Promise.allSettled(promises);
          chunkResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              itemResults.push(result.value);
            } else {
              const error = `Item ${chunk[index]} failed: ${result.reason}`;
              errors.push(error);
              this.errorCount++;
              
              if (options.onError) {
                options.onError(new Error(result.reason), chunk[index], index);
              }
              
              if (!continueOnError) {
                throw new Error(error);
              }
            }
          });
        }
      }

    } catch (error) {
      if (!continueOnError) {
        throw error;
      }
      errors.push(error instanceof Error ? error.message : String(error));
    }

    const duration = Date.now() - this.startTime;
    
    // Ensure postcondition: valid result
    return {
      success: this.errorCount === 0,
      itemsProcessed: this.processedCount,
      itemsFailed: this.errorCount,
      duration,
      timestamp: new Date(),
      itemResults,
      errors,
      metadata: {
        concurrency,
        totalItems: items.length,
        processingRate: this.processedCount / (duration / 1000),
        ...options.metadata
      }
    };
  }

  /**
   * Process a single item
   * Abstract method that subclasses must implement
   * 
   * LSP Contract:
   * - Must handle all subtypes of T
   * - Must maintain consistent error handling
   * - Must update processing statistics
   */
  protected async processItem(
    item: T,
    index: number,
    options: IProcessingOptions
  ): Promise<any> {
    const itemStartTime = Date.now();
    
    try {
      // Template method: subclasses implement specific processing
      const result = await this.onProcessItem(item, index, options);
      
      this.processedCount++;
      
      return {
        index,
        success: true,
        result,
        duration: Date.now() - itemStartTime,
        item: this.getItemIdentifier(item)
      };
      
    } catch (error) {
      this.errorCount++;
      
      const errorResult = {
        index,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - itemStartTime,
        item: this.getItemIdentifier(item)
      };
      
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error(String(error)), item, index);
      }
      
      if (!options.continueOnError) {
        throw error;
      }
      
      return errorResult;
    }
  }

  /**
   * Abstract method: Item-specific processing logic
   */
  protected abstract onProcessItem(
    item: T,
    index: number,
    options: IProcessingOptions
  ): Promise<any>;

  /**
   * Virtual method: Get item identifier for logging/debugging
   */
  protected getItemIdentifier(item: T): string {
    if (item && typeof item === 'object' && 'id' in item) {
      return String((item as any).id);
    }
    return String(item);
  }

  /**
   * Utility method: Chunk array for parallel processing
   */
  protected chunkArray<U>(array: U[], chunkSize: number): U[][] {
    const chunks: U[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get processing statistics
   */
  public getStatistics(): {
    processedCount: number;
    errorCount: number;
    successRate: number;
    elapsedTime: number;
  } {
    return {
      processedCount: this.processedCount,
      errorCount: this.errorCount,
      successRate: this.processedCount / (this.processedCount + this.errorCount) || 0,
      elapsedTime: this.startTime > 0 ? Date.now() - this.startTime : 0
    };
  }
}

/**
 * Combat Entity Processor
 * Processes any CombatEntity subclass polymorphically
 */
export class CombatEntityProcessor extends PolymorphicProcessor<CombatEntity> {
  protected async onProcessItem(
    entity: CombatEntity,
    index: number,
    options: IProcessingOptions
  ): Promise<any> {
    // Polymorphic processing: works with any CombatEntity subclass
    const status = entity.getStatus();
    const isAlive = entity.isAlive();
    
    // Apply effects or operations based on entity state
    if (isAlive && status.canAct) {
      // Example: Apply a healing effect
      const healResult = entity.heal(10);
      
      return {
        entityName: entity.getName(),
        entityType: entity.constructor.name,
        initialHealth: status.health,
        finalHealth: entity.getStatus().health,
        healResult,
        wasProcessed: true
      };
    }
    
    return {
      entityName: entity.getName(),
      entityType: entity.constructor.name,
      health: status.health,
      canAct: status.canAct,
      wasProcessed: false,
      reason: 'Entity cannot act or is dead'
    };
  }

  protected getItemIdentifier(entity: CombatEntity): string {
    return `${entity.getName()} (${entity.constructor.name})`;
  }

  /**
   * Combat-specific processing: simulate battle round
   */
  public async simulateBattleRound(
    entities: CombatEntity[],
    options: IProcessingOptions = {}
  ): Promise<IProcessingResult> {
    const battleProcessor = async (entity: CombatEntity, index: number): Promise<any> => {
      if (!entity.isAlive()) {
        return {
          entityName: entity.getName(),
          action: 'dead',
          result: null
        };
      }

      // Find a random target (excluding self)
      const potentialTargets = entities.filter(e => e !== entity && e.isAlive());
      if (potentialTargets.length === 0) {
        return {
          entityName: entity.getName(),
          action: 'no_targets',
          result: null
        };
      }

      const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
      const attackResult = entity.attack(target);

      return {
        entityName: entity.getName(),
        action: 'attack',
        target: target.getName(),
        result: attackResult
      };
    };

    // Override the processing method for this specific operation
    const originalOnProcessItem = this.onProcessItem;
    this.onProcessItem = battleProcessor;
    
    try {
      return await this.processCollection(entities, options);
    } finally {
      this.onProcessItem = originalOnProcessItem;
    }
  }
}

/**
 * Service Processor
 * Processes any ServiceBase subclass polymorphically
 */
export class ServiceProcessor extends PolymorphicProcessor<ServiceBase> {
  protected async onProcessItem(
    service: ServiceBase,
    index: number,
    options: IProcessingOptions
  ): Promise<any> {
    // Polymorphic processing: works with any ServiceBase subclass
    const config = service.getConfig();
    const status = service.getStatus();
    const metrics = service.getMetrics();
    const health = await service.healthCheck();

    return {
      serviceId: config.id,
      serviceName: config.name,
      serviceType: service.constructor.name,
      status,
      health: health.status,
      metrics: {
        uptime: metrics.uptime,
        operationCount: metrics.operationCount,
        errorCount: metrics.errorCount,
        averageOperationTime: metrics.averageOperationTime
      },
      isHealthy: health.details.canProcessRequests && 
                 health.details.dependenciesHealthy && 
                 health.details.resourcesAvailable
    };
  }

  protected getItemIdentifier(service: ServiceBase): string {
    const config = service.getConfig();
    return `${config.name} (${config.id})`;
  }

  /**
   * Service-specific processing: initialize all services
   */
  public async initializeServices(
    services: ServiceBase[],
    options: IProcessingOptions = {}
  ): Promise<IProcessingResult> {
    const initProcessor = async (service: ServiceBase, index: number): Promise<any> => {
      const config = service.getConfig();
      
      if (service.getStatus() === ServiceStatus.READY) {
        return {
          serviceId: config.id,
          action: 'already_initialized',
          result: 'success'
        };
      }

      try {
        await service.initialize();
        return {
          serviceId: config.id,
          action: 'initialize',
          result: 'success',
          status: service.getStatus()
        };
      } catch (error) {
        return {
          serviceId: config.id,
          action: 'initialize',
          result: 'error',
          error: error instanceof Error ? error.message : String(error),
          status: service.getStatus()
        };
      }
    };

    const originalOnProcessItem = this.onProcessItem;
    this.onProcessItem = initProcessor;
    
    try {
      return await this.processCollection(services, options);
    } finally {
      this.onProcessItem = originalOnProcessItem;
    }
  }

  /**
   * Service-specific processing: health check all services
   */
  public async performHealthChecks(
    services: ServiceBase[],
    options: IProcessingOptions = {}
  ): Promise<IProcessingResult> {
    const healthProcessor = async (service: ServiceBase, index: number): Promise<any> => {
      const config = service.getConfig();
      const health = await service.healthCheck();
      
      return {
        serviceId: config.id,
        serviceName: config.name,
        action: 'health_check',
        healthStatus: health.status,
        canProcessRequests: health.details.canProcessRequests,
        dependenciesHealthy: health.details.dependenciesHealthy,
        resourcesAvailable: health.details.resourcesAvailable,
        errorRate: health.details.errorRate,
        message: health.message,
        timestamp: health.timestamp
      };
    };

    const originalOnProcessItem = this.onProcessItem;
    this.onProcessItem = healthProcessor;
    
    try {
      return await this.processCollection(services, options);
    } finally {
      this.onProcessItem = originalOnProcessItem;
    }
  }
}

/**
 * Asset Processor
 * Processes any Asset subclass polymorphically
 */
export class AssetProcessor extends PolymorphicProcessor<Asset> {
  protected async onProcessItem(
    asset: Asset,
    index: number,
    options: IProcessingOptions
  ): Promise<any> {
    // Polymorphic processing: works with any Asset subclass
    const metadata = asset.getMetadata();
    const status = asset.getStatus();
    const size = asset.getSize();

    return {
      assetId: metadata.id,
      assetPath: metadata.path,
      assetType: metadata.type,
      assetClass: asset.constructor.name,
      status,
      size,
      isLoaded: asset.isLoaded(),
      lastLoadResult: asset.getLoadResult(),
      priority: metadata.priority,
      tags: metadata.tags
    };
  }

  protected getItemIdentifier(asset: Asset): string {
    const metadata = asset.getMetadata();
    return `${metadata.id} (${metadata.type})`;
  }

  /**
   * Asset-specific processing: load all assets
   */
  public async loadAssets(
    assets: Asset[],
    options: IProcessingOptions = {}
  ): Promise<IProcessingResult> {
    const loadProcessor = async (asset: Asset, index: number): Promise<any> => {
      const metadata = asset.getMetadata();
      
      if (asset.isLoaded()) {
        return {
          assetId: metadata.id,
          action: 'already_loaded',
          result: 'success',
          size: asset.getSize()
        };
      }

      try {
        const loadResult = await asset.load({
          timeout: options.itemTimeout,
          onProgress: (progress) => {
            if (options.onProgress) {
              // Report individual asset progress within overall progress
              const overallProgress = (index + progress) / assets.length;
              options.onProgress(overallProgress, index, assets.length);
            }
          }
        });

        return {
          assetId: metadata.id,
          action: 'load',
          result: 'success',
          loadResult,
          size: asset.getSize(),
          duration: loadResult.duration
        };
      } catch (error) {
        return {
          assetId: metadata.id,
          action: 'load',
          result: 'error',
          error: error instanceof Error ? error.message : String(error),
          size: 0
        };
      }
    };

    const originalOnProcessItem = this.onProcessItem;
    this.onProcessItem = loadProcessor;
    
    try {
      return await this.processCollection(assets, options);
    } finally {
      this.onProcessItem = originalOnProcessItem;
    }
  }

  /**
   * Asset-specific processing: validate all assets
   */
  public async validateAssets(
    assets: Asset[],
    options: IProcessingOptions = {}
  ): Promise<IProcessingResult> {
    const validateProcessor = async (asset: Asset, index: number): Promise<any> => {
      const metadata = asset.getMetadata();
      
      if (!asset.isLoaded()) {
        return {
          assetId: metadata.id,
          action: 'validate',
          result: 'skipped',
          reason: 'Asset not loaded'
        };
      }

      try {
        const isValid = asset.validate();
        
        return {
          assetId: metadata.id,
          action: 'validate',
          result: isValid ? 'valid' : 'invalid',
          isValid,
          size: asset.getSize(),
          type: metadata.type
        };
      } catch (error) {
        return {
          assetId: metadata.id,
          action: 'validate',
          result: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    };

    const originalOnProcessItem = this.onProcessItem;
    this.onProcessItem = validateProcessor;
    
    try {
      return await this.processCollection(assets, options);
    } finally {
      this.onProcessItem = originalOnProcessItem;
    }
  }
}

/**
 * Universal Polymorphic Processor
 * Can process any type of object with a common interface
 */
export class UniversalProcessor<T> extends PolymorphicProcessor<T> {
  private customProcessor: (item: T, index: number, options: IProcessingOptions) => Promise<any>;

  constructor(processor: (item: T, index: number, options: IProcessingOptions) => Promise<any>) {
    super();
    this.customProcessor = processor;
  }

  protected async onProcessItem(
    item: T,
    index: number,
    options: IProcessingOptions
  ): Promise<any> {
    return await this.customProcessor(item, index, options);
  }
}

/**
 * Polymorphic Processor Factory
 * Creates appropriate processors for different types
 */
export class ProcessorFactory {
  /**
   * Create a combat entity processor
   */
  static createCombatProcessor(): CombatEntityProcessor {
    return new CombatEntityProcessor();
  }

  /**
   * Create a service processor
   */
  static createServiceProcessor(): ServiceProcessor {
    return new ServiceProcessor();
  }

  /**
   * Create an asset processor
   */
  static createAssetProcessor(): AssetProcessor {
    return new AssetProcessor();
  }

  /**
   * Create a universal processor with custom logic
   */
  static createUniversalProcessor<T>(
    processor: (item: T, index: number, options: IProcessingOptions) => Promise<any>
  ): UniversalProcessor<T> {
    return new UniversalProcessor(processor);
  }

  /**
   * Auto-detect processor type based on array contents
   */
  static createAutoProcessor<T>(items: T[]): PolymorphicProcessor<T> {
    if (items.length === 0) {
      throw new Error('Cannot determine processor type for empty array');
    }

    const firstItem = items[0];
    
    // Check if it's a CombatEntity
    if (firstItem && typeof firstItem === 'object' && 'attack' in firstItem && 'isAlive' in firstItem) {
      return new CombatEntityProcessor() as any;
    }
    
    // Check if it's a ServiceBase
    if (firstItem && typeof firstItem === 'object' && 'initialize' in firstItem && 'getStatus' in firstItem) {
      return new ServiceProcessor() as any;
    }
    
    // Check if it's an Asset
    if (firstItem && typeof firstItem === 'object' && 'load' in firstItem && 'getMetadata' in firstItem) {
      return new AssetProcessor() as any;
    }
    
    // Fall back to universal processor
    return new UniversalProcessor((item: T) => Promise.resolve(item));
  }
}
