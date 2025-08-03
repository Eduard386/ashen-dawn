/**
 * Performance Optimization System - Central Export
 * Advanced performance optimization components for the game engine
 */
export { LazyLoadingSystem, type LazyLoadConfig, type LoadableResource, type PerformanceMetrics as LazyLoadingMetrics } from './LazyLoadingSystem';
export { ObjectPool, PoolManager, PooledBullet, PooledParticle, globalPoolManager, type PoolableObject, type PoolConfig, type PoolStats } from './MemoryPoolManager';
export { AdvancedCache, MultiLevelCache, globalAssetCache, globalDataCache, type CacheConfig, type CacheEntry, type CacheStats } from './AdvancedCaching';
export { PerformanceProfiler, globalProfiler, type PerformanceConfig, type PerformanceMetrics, type ProfilerSample, type PerformanceReport, type PerformanceAlert } from './PerformanceProfiler';
/**
 * Performance Optimization Manager
 * Centralized manager for all performance systems
 */
export declare class PerformanceOptimizationManager {
    private lazyLoader;
    private poolManager;
    private profiler;
    private isInitialized;
    constructor();
    /**
     * Initialize all performance systems
     */
    private initialize;
    /**
     * Setup object pools for common game entities
     */
    private setupObjectPools;
    /**
     * Setup performance monitoring
     */
    private setupPerformanceMonitoring;
    /**
     * Setup lazy loading for common resources
     */
    private setupLazyLoading;
    /**
     * Handle performance alerts with automatic optimization
     */
    private handlePerformanceAlert;
    /**
     * Optimize for better FPS
     */
    private optimizeForFPS;
    /**
     * Optimize memory usage
     */
    private optimizeMemoryUsage;
    /**
     * Optimize frame time
     */
    private optimizeFrameTime;
    /**
     * Get comprehensive performance status
     */
    getPerformanceStatus(): {
        system: string;
        initialized: boolean;
        lazyLoading: {
            totalResources: number;
            loadedResources: number;
            queuedResources: number;
            activeLoads: number;
            memoryUsage: string;
            cacheHitRatio: string;
        };
        objectPools: {
            pools: Record<string, any>;
            global: {
                totalPools: number;
                totalObjects: number;
                totalMemory: number;
            };
        };
        caching: {
            assetCache: {
                entries: number;
                memoryUsage: string;
                hitRatio: string;
                averageAccessTime: string;
                evictions: number;
                strategy: "LRU" | "LFU" | "FIFO" | "ADAPTIVE";
            };
            dataCache: {
                l1: import("./AdvancedCaching").CacheStats;
                l2: import("./AdvancedCaching").CacheStats;
                combined: {
                    l1HitRatio: number;
                    l2HitRatio: number;
                    missRatio: number;
                    totalHitRatio: number;
                };
            };
        };
        profiler: {
            isRunning: boolean;
            samples: number;
            currentFPS: string;
            uptime: number;
            memoryUsage: any;
        };
        recommendations: string[];
    };
    /**
     * Generate performance recommendations
     */
    private generateRecommendations;
    /**
     * Force optimization cycle
     */
    forceOptimization(): void;
    /**
     * Preload assets for upcoming scene
     */
    preloadForScene(sceneName: string): Promise<void>;
    /**
     * Get assets required for a specific scene
     */
    private getSceneAssets;
    /**
     * Cleanup and shutdown performance systems
     */
    shutdown(): void;
}
export declare const globalPerformanceManager: PerformanceOptimizationManager;
