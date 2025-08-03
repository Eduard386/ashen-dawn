/**
 * Memory Pool Management System - Advanced performance optimization
 * Implements object pooling to reduce garbage collection pressure
 */
export interface PoolableObject {
    reset(): void;
    isInUse(): boolean;
    markInUse(): void;
    markAvailable(): void;
}
export interface PoolConfig {
    initialSize: number;
    maxSize: number;
    growthFactor: number;
    enableStats: boolean;
    autoShrink: boolean;
    shrinkThreshold: number;
}
export interface PoolStats {
    totalCreated: number;
    totalReused: number;
    currentActive: number;
    currentAvailable: number;
    peakUsage: number;
    hitRatio: number;
    memoryFootprint: number;
}
export declare class ObjectPool<T extends PoolableObject> {
    private available;
    private active;
    private factory;
    private config;
    private stats;
    private creationCount;
    private reuseCount;
    private peakUsage;
    private lastShrinkTime;
    constructor(factory: () => T, config?: Partial<PoolConfig>);
    /**
     * Initialize the pool with initial objects
     */
    private initializePool;
    /**
     * Get an object from the pool
     */
    acquire(): T;
    /**
     * Return an object to the pool
     */
    release(obj: T): void;
    /**
     * Create a new object and track creation
     */
    private createNewObject;
    /**
     * Get total pool size
     */
    private getTotalSize;
    /**
     * Update pool statistics
     */
    private updateStats;
    /**
     * Setup automatic pool shrinking
     */
    private setupAutoShrink;
    /**
     * Consider shrinking the pool if usage is low
     */
    private considerShrinking;
    /**
     * Force pool growth
     */
    grow(additionalSize: number): void;
    /**
     * Clear all available objects
     */
    clear(): void;
    /**
     * Get pool statistics
     */
    getStats(): PoolStats;
    /**
     * Get pool status summary
     */
    getStatus(): {
        active: number;
        available: number;
        total: number;
        hitRatio: string;
        peakUsage: number;
        memoryFootprint: string;
    };
}
/**
 * Pool Manager - Manages multiple object pools
 */
export declare class PoolManager {
    private pools;
    private globalStats;
    /**
     * Register a new object pool
     */
    registerPool<T extends PoolableObject>(name: string, factory: () => T, config?: Partial<PoolConfig>): ObjectPool<T>;
    /**
     * Get a pool by name
     */
    getPool<T extends PoolableObject>(name: string): ObjectPool<T> | undefined;
    /**
     * Get global statistics
     */
    getGlobalStats(): {
        totalPools: number;
        totalObjects: number;
        totalMemory: number;
    };
    /**
     * Update global statistics
     */
    private updateGlobalStats;
    /**
     * Get status of all pools
     */
    getAllPoolStatus(): {
        pools: Record<string, any>;
        global: {
            totalPools: number;
            totalObjects: number;
            totalMemory: number;
        };
    };
    /**
     * Cleanup all pools
     */
    cleanup(): void;
}
export declare class PooledBullet implements PoolableObject {
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
    active: boolean;
    private inUse;
    reset(): void;
    isInUse(): boolean;
    markInUse(): void;
    markAvailable(): void;
    initialize(x: number, y: number, vx: number, vy: number, damage: number): void;
}
export declare class PooledParticle implements PoolableObject {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    private inUse;
    reset(): void;
    isInUse(): boolean;
    markInUse(): void;
    markAvailable(): void;
    initialize(x: number, y: number, vx: number, vy: number, life: number, color: string, size: number): void;
    update(deltaTime: number): boolean;
}
export declare const globalPoolManager: PoolManager;
