/**
 * Advanced Caching System - High-performance caching with multiple strategies
 * Implements LRU, LFU, time-based, and intelligent caching strategies
 */
export interface CacheConfig {
    maxSize: number;
    maxMemory: number;
    defaultTTL: number;
    strategy: 'LRU' | 'LFU' | 'FIFO' | 'ADAPTIVE';
    enableCompression: boolean;
    enablePersistence: boolean;
    statsInterval: number;
}
export interface CacheEntry<T> {
    key: string;
    value: T;
    size: number;
    accessCount: number;
    lastAccessed: number;
    created: number;
    ttl?: number;
    compressed?: boolean;
    metadata?: any;
}
export interface CacheStats {
    totalEntries: number;
    totalMemory: number;
    hitCount: number;
    missCount: number;
    hitRatio: number;
    averageAccessTime: number;
    evictionCount: number;
    compressionRatio: number;
}
export declare class AdvancedCache<T = any> {
    private cache;
    private accessOrder;
    private config;
    private stats;
    private accessTimes;
    private lastCleanup;
    private evictionCount;
    constructor(config?: Partial<CacheConfig>);
    /**
     * Initialize cache system
     */
    private initializeCache;
    /**
     * Store value in cache
     */
    set(key: string, value: T, ttl?: number): void;
    /**
     * Get value from cache
     */
    get(key: string): T | null;
    /**
     * Check if key exists (without affecting access)
     */
    has(key: string): boolean;
    /**
     * Delete entry from cache
     */
    delete(key: string): boolean;
    /**
     * Clear entire cache
     */
    clear(): void;
    /**
     * Get multiple values efficiently
     */
    getMultiple(keys: string[]): Map<string, T | null>;
    /**
     * Set multiple values efficiently
     */
    setMultiple(entries: Map<string, T>, ttl?: number): void;
    /**
     * Ensure cache has capacity for new entry
     */
    private ensureCapacity;
    /**
     * Evict entry based on strategy
     */
    private evictEntry;
    /**
     * Find least recently used key
     */
    private findLRUKey;
    /**
     * Find least frequently used key
     */
    private findLFUKey;
    /**
     * Find oldest key (FIFO)
     */
    private findOldestKey;
    /**
     * Adaptive eviction strategy
     */
    private findAdaptiveKey;
    /**
     * Update access order for LRU
     */
    private updateAccessOrder;
    /**
     * Remove from access order
     */
    private removeFromAccessOrder;
    /**
     * Check if entry is expired
     */
    private isExpired;
    /**
     * Calculate entry size
     */
    private calculateSize;
    /**
     * Compress value (placeholder implementation)
     */
    private compress;
    /**
     * Decompress value (placeholder implementation)
     */
    private decompress;
    /**
     * Record access time for performance tracking
     */
    private recordAccessTime;
    /**
     * Update hit ratio
     */
    private updateHitRatio;
    /**
     * Update statistics
     */
    private updateStats;
    /**
     * Perform periodic cleanup
     */
    private performCleanup;
    /**
     * Load cache from persistence (placeholder)
     */
    private loadFromPersistence;
    /**
     * Persist entry (placeholder)
     */
    private persistEntry;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Get cache status
     */
    getStatus(): {
        entries: number;
        memoryUsage: string;
        hitRatio: string;
        averageAccessTime: string;
        evictions: number;
        strategy: "LRU" | "LFU" | "FIFO" | "ADAPTIVE";
    };
    /**
     * Export cache data for debugging
     */
    exportData(): any;
}
/**
 * Multi-Level Cache System
 */
export declare class MultiLevelCache<T = any> {
    private l1Cache;
    private l2Cache;
    private stats;
    constructor(l1Config?: Partial<CacheConfig>, l2Config?: Partial<CacheConfig>);
    /**
     * Get value from multi-level cache
     */
    get(key: string): T | null;
    /**
     * Set value in multi-level cache
     */
    set(key: string, value: T, ttl?: number): void;
    /**
     * Get multi-level cache statistics
     */
    getStats(): {
        l1: CacheStats;
        l2: CacheStats;
        combined: {
            l1HitRatio: number;
            l2HitRatio: number;
            missRatio: number;
            totalHitRatio: number;
        };
    };
}
export declare const globalAssetCache: AdvancedCache<any>;
export declare const globalDataCache: MultiLevelCache<any>;
