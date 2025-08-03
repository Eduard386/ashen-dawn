/**
 * Polymorphic Processors
 * Demonstrates LSP compliance through polymorphic processing of base classes
 */
import { ServiceStatus } from '../services/LSPServiceBase';
/**
 * Abstract Polymorphic Processor Base
 *
 * LSP Contract:
 * - All subclasses must be substitutable for this base
 * - Processing behavior must be consistent across implementations
 * - Error handling must follow the same patterns
 */
export class PolymorphicProcessor {
    constructor() {
        this.processedCount = 0;
        this.errorCount = 0;
        this.startTime = 0;
    }
    /**
     * Process a collection of items polymorphically
     *
     * LSP Contract:
     * - Precondition: items array must not be null
     * - Postcondition: returns valid IProcessingResult
     * - Must handle all subtypes of T consistently
     */
    async processCollection(items, options = {}) {
        // Precondition validation
        if (!items) {
            throw new Error('Items collection cannot be null');
        }
        this.processedCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
        const itemResults = [];
        const errors = [];
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
            }
            else {
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
                        }
                        else {
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
        }
        catch (error) {
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
    async processItem(item, index, options) {
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
        }
        catch (error) {
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
     * Virtual method: Get item identifier for logging/debugging
     */
    getItemIdentifier(item) {
        if (item && typeof item === 'object' && 'id' in item) {
            return String(item.id);
        }
        return String(item);
    }
    /**
     * Utility method: Chunk array for parallel processing
     */
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
    /**
     * Get processing statistics
     */
    getStatistics() {
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
export class CombatEntityProcessor extends PolymorphicProcessor {
    async onProcessItem(entity, index, options) {
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
    getItemIdentifier(entity) {
        return `${entity.getName()} (${entity.constructor.name})`;
    }
    /**
     * Combat-specific processing: simulate battle round
     */
    async simulateBattleRound(entities, options = {}) {
        const battleProcessor = async (entity, index) => {
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
        }
        finally {
            this.onProcessItem = originalOnProcessItem;
        }
    }
}
/**
 * Service Processor
 * Processes any ServiceBase subclass polymorphically
 */
export class ServiceProcessor extends PolymorphicProcessor {
    async onProcessItem(service, index, options) {
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
    getItemIdentifier(service) {
        const config = service.getConfig();
        return `${config.name} (${config.id})`;
    }
    /**
     * Service-specific processing: initialize all services
     */
    async initializeServices(services, options = {}) {
        const initProcessor = async (service, index) => {
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
            }
            catch (error) {
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
        }
        finally {
            this.onProcessItem = originalOnProcessItem;
        }
    }
    /**
     * Service-specific processing: health check all services
     */
    async performHealthChecks(services, options = {}) {
        const healthProcessor = async (service, index) => {
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
        }
        finally {
            this.onProcessItem = originalOnProcessItem;
        }
    }
}
/**
 * Asset Processor
 * Processes any Asset subclass polymorphically
 */
export class AssetProcessor extends PolymorphicProcessor {
    async onProcessItem(asset, index, options) {
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
    getItemIdentifier(asset) {
        const metadata = asset.getMetadata();
        return `${metadata.id} (${metadata.type})`;
    }
    /**
     * Asset-specific processing: load all assets
     */
    async loadAssets(assets, options = {}) {
        const loadProcessor = async (asset, index) => {
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
            }
            catch (error) {
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
        }
        finally {
            this.onProcessItem = originalOnProcessItem;
        }
    }
    /**
     * Asset-specific processing: validate all assets
     */
    async validateAssets(assets, options = {}) {
        const validateProcessor = async (asset, index) => {
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
            }
            catch (error) {
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
        }
        finally {
            this.onProcessItem = originalOnProcessItem;
        }
    }
}
/**
 * Universal Polymorphic Processor
 * Can process any type of object with a common interface
 */
export class UniversalProcessor extends PolymorphicProcessor {
    constructor(processor) {
        super();
        this.customProcessor = processor;
    }
    async onProcessItem(item, index, options) {
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
    static createCombatProcessor() {
        return new CombatEntityProcessor();
    }
    /**
     * Create a service processor
     */
    static createServiceProcessor() {
        return new ServiceProcessor();
    }
    /**
     * Create an asset processor
     */
    static createAssetProcessor() {
        return new AssetProcessor();
    }
    /**
     * Create a universal processor with custom logic
     */
    static createUniversalProcessor(processor) {
        return new UniversalProcessor(processor);
    }
    /**
     * Auto-detect processor type based on array contents
     */
    static createAutoProcessor(items) {
        if (items.length === 0) {
            throw new Error('Cannot determine processor type for empty array');
        }
        const firstItem = items[0];
        // Check if it's a CombatEntity
        if (firstItem && typeof firstItem === 'object' && 'attack' in firstItem && 'isAlive' in firstItem) {
            return new CombatEntityProcessor();
        }
        // Check if it's a ServiceBase
        if (firstItem && typeof firstItem === 'object' && 'initialize' in firstItem && 'getStatus' in firstItem) {
            return new ServiceProcessor();
        }
        // Check if it's an Asset
        if (firstItem && typeof firstItem === 'object' && 'load' in firstItem && 'getMetadata' in firstItem) {
            return new AssetProcessor();
        }
        // Fall back to universal processor
        return new UniversalProcessor((item) => Promise.resolve(item));
    }
}
//# sourceMappingURL=PolymorphicProcessors.js.map