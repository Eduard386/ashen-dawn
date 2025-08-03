/**
 * Lazy Loading System - Advanced performance optimization
 * Implements intelligent asset loading, memory management, and performance monitoring
 */
export interface LazyLoadConfig {
    maxConcurrentLoads: number;
    preloadDistance: number;
    unloadDistance: number;
    memoryThreshold: number;
    enableProfiling: boolean;
}
export interface LoadableResource {
    id: string;
    type: 'image' | 'audio' | 'data' | 'scene';
    path: string;
    priority: number;
    estimatedSize: number;
    dependencies?: string[];
    loaded: boolean;
    lastAccessed: number;
}
export interface PerformanceMetrics {
    totalMemoryUsage: number;
    loadTimes: Map<string, number>;
    accessCounts: Map<string, number>;
    cacheHitRatio: number;
    averageLoadTime: number;
}
export declare class LazyLoadingSystem {
    private resources;
    private loadQueue;
    private activeLoads;
    private loadedResources;
    private config;
    private metrics;
    private memoryUsage;
    private loadStartTimes;
    private cacheHits;
    private cacheMisses;
    constructor(config?: Partial<LazyLoadConfig>);
    /**
     * Initialize the lazy loading system
     */
    private initializeSystem;
    /**
     * Register a resource for lazy loading
     */
    registerResource(resource: Omit<LoadableResource, 'loaded' | 'lastAccessed'>): void;
    /**
     * Request a resource with intelligent loading
     */
    requestResource(id: string, priority?: number): Promise<boolean>;
    /**
     * Preload resources based on current context
     */
    preloadArea(centerX: number, centerY: number): Promise<void>;
    /**
     * Unload distant resources to free memory
     */
    unloadDistantResources(centerX: number, centerY: number): void;
    /**
     * Add resource to priority-based load queue
     */
    private addToLoadQueue;
    /**
     * Process the load queue with concurrency control
     */
    private processLoadQueue;
    /**
     * Load a single resource
     */
    private loadResource;
    /**
     * Perform the actual loading based on resource type
     */
    private performLoad;
    /**
     * Load resource dependencies
     */
    private loadDependencies;
    /**
     * Unload a resource to free memory
     */
    private unloadResource;
    /**
     * Check if memory constraints allow loading
     */
    private checkMemoryConstraints;
    /**
     * Free memory by unloading least recently used resources
     */
    private freeMemory;
    /**
     * Find nearby resources for preloading
     */
    private findNearbyResources;
    /**
     * Find distant resources for unloading
     */
    private findDistantResources;
    /**
     * Update access count tracking
     */
    private updateAccessCount;
    /**
     * Update cache hit ratio
     */
    private updateCacheHitRatio;
    /**
     * Update average load time
     */
    private updateAverageLoadTime;
    /**
     * Setup performance monitoring
     */
    private setupPerformanceMonitoring;
    /**
     * Setup memory monitoring
     */
    private setupMemoryMonitoring;
    /**
     * Trigger memory cleanup
     */
    private triggerMemoryCleanup;
    /**
     * Get current performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Get system status
     */
    getStatus(): {
        totalResources: number;
        loadedResources: number;
        queuedResources: number;
        activeLoads: number;
        memoryUsage: string;
        cacheHitRatio: string;
    };
}
