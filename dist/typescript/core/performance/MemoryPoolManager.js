/**
 * Memory Pool Management System - Advanced performance optimization
 * Implements object pooling to reduce garbage collection pressure
 */
export class ObjectPool {
    constructor(factory, config = {}) {
        this.available = [];
        this.active = new Set();
        // Performance tracking
        this.creationCount = 0;
        this.reuseCount = 0;
        this.peakUsage = 0;
        this.lastShrinkTime = 0;
        this.factory = factory;
        this.config = {
            initialSize: 10,
            maxSize: 100,
            growthFactor: 1.5,
            enableStats: true,
            autoShrink: true,
            shrinkThreshold: 0.25, // Shrink if usage < 25%
            ...config
        };
        this.stats = {
            totalCreated: 0,
            totalReused: 0,
            currentActive: 0,
            currentAvailable: 0,
            peakUsage: 0,
            hitRatio: 0,
            memoryFootprint: 0
        };
        this.initializePool();
    }
    /**
     * Initialize the pool with initial objects
     */
    initializePool() {
        for (let i = 0; i < this.config.initialSize; i++) {
            const obj = this.createNewObject();
            this.available.push(obj);
        }
        if (this.config.autoShrink) {
            this.setupAutoShrink();
        }
        console.log(`🏊 Object pool initialized with ${this.config.initialSize} objects`);
    }
    /**
     * Get an object from the pool
     */
    acquire() {
        let obj;
        if (this.available.length > 0) {
            obj = this.available.pop();
            this.reuseCount++;
            this.stats.totalReused++;
        }
        else {
            if (this.getTotalSize() >= this.config.maxSize) {
                console.warn('⚠️ Pool size limit reached, creating temporary object');
            }
            obj = this.createNewObject();
        }
        obj.markInUse();
        this.active.add(obj);
        // Update peak usage
        if (this.active.size > this.peakUsage) {
            this.peakUsage = this.active.size;
            this.stats.peakUsage = this.peakUsage;
        }
        this.updateStats();
        return obj;
    }
    /**
     * Return an object to the pool
     */
    release(obj) {
        if (!this.active.has(obj)) {
            console.warn('⚠️ Attempting to release object not from this pool');
            return;
        }
        obj.reset();
        obj.markAvailable();
        this.active.delete(obj);
        // Only keep it if we're not over capacity
        if (this.available.length < this.config.maxSize) {
            this.available.push(obj);
        }
        this.updateStats();
    }
    /**
     * Create a new object and track creation
     */
    createNewObject() {
        const obj = this.factory();
        this.creationCount++;
        this.stats.totalCreated++;
        return obj;
    }
    /**
     * Get total pool size
     */
    getTotalSize() {
        return this.available.length + this.active.size;
    }
    /**
     * Update pool statistics
     */
    updateStats() {
        this.stats.currentActive = this.active.size;
        this.stats.currentAvailable = this.available.length;
        const total = this.stats.totalCreated + this.stats.totalReused;
        this.stats.hitRatio = total > 0 ? this.stats.totalReused / total : 0;
        // Estimate memory footprint (rough calculation)
        this.stats.memoryFootprint = this.getTotalSize() * 1024; // Assume 1KB per object
    }
    /**
     * Setup automatic pool shrinking
     */
    setupAutoShrink() {
        setInterval(() => {
            this.considerShrinking();
        }, 30000); // Check every 30 seconds
    }
    /**
     * Consider shrinking the pool if usage is low
     */
    considerShrinking() {
        const now = Date.now();
        if (now - this.lastShrinkTime < 60000)
            return; // Don't shrink more than once per minute
        const usageRatio = this.active.size / this.getTotalSize();
        if (usageRatio < this.config.shrinkThreshold && this.available.length > this.config.initialSize) {
            const targetSize = Math.max(this.config.initialSize, Math.ceil(this.active.size / this.config.shrinkThreshold));
            const currentAvailable = this.available.length;
            const newAvailable = Math.max(0, targetSize - this.active.size);
            const toRemove = Math.max(0, currentAvailable - newAvailable);
            if (toRemove > 0) {
                this.available.splice(0, toRemove);
                this.lastShrinkTime = now;
                if (this.config.enableStats) {
                    console.log(`📉 Pool shrunk by ${toRemove} objects (usage: ${(usageRatio * 100).toFixed(1)}%)`);
                }
            }
        }
    }
    /**
     * Force pool growth
     */
    grow(additionalSize) {
        const newSize = Math.min(this.getTotalSize() + additionalSize, this.config.maxSize);
        const toCreate = newSize - this.getTotalSize();
        for (let i = 0; i < toCreate; i++) {
            const obj = this.createNewObject();
            this.available.push(obj);
        }
        if (this.config.enableStats) {
            console.log(`📈 Pool grown by ${toCreate} objects`);
        }
    }
    /**
     * Clear all available objects
     */
    clear() {
        this.available.length = 0;
        console.log('🧹 Pool cleared');
    }
    /**
     * Get pool statistics
     */
    getStats() {
        this.updateStats();
        return { ...this.stats };
    }
    /**
     * Get pool status summary
     */
    getStatus() {
        return {
            active: this.active.size,
            available: this.available.length,
            total: this.getTotalSize(),
            hitRatio: `${(this.stats.hitRatio * 100).toFixed(1)}%`,
            peakUsage: this.peakUsage,
            memoryFootprint: `${(this.stats.memoryFootprint / 1024).toFixed(2)}KB`
        };
    }
}
/**
 * Pool Manager - Manages multiple object pools
 */
export class PoolManager {
    constructor() {
        this.pools = new Map();
        this.globalStats = {
            totalPools: 0,
            totalObjects: 0,
            totalMemory: 0
        };
    }
    /**
     * Register a new object pool
     */
    registerPool(name, factory, config) {
        const pool = new ObjectPool(factory, config);
        this.pools.set(name, pool);
        this.globalStats.totalPools++;
        console.log(`🏊 Registered pool: ${name}`);
        return pool;
    }
    /**
     * Get a pool by name
     */
    getPool(name) {
        return this.pools.get(name);
    }
    /**
     * Get global statistics
     */
    getGlobalStats() {
        this.updateGlobalStats();
        return { ...this.globalStats };
    }
    /**
     * Update global statistics
     */
    updateGlobalStats() {
        this.globalStats.totalPools = this.pools.size;
        this.globalStats.totalObjects = 0;
        this.globalStats.totalMemory = 0;
        for (const pool of this.pools.values()) {
            const stats = pool.getStats();
            this.globalStats.totalObjects += stats.currentActive + stats.currentAvailable;
            this.globalStats.totalMemory += stats.memoryFootprint;
        }
    }
    /**
     * Get status of all pools
     */
    getAllPoolStatus() {
        const status = {};
        for (const [name, pool] of this.pools.entries()) {
            status[name] = pool.getStatus();
        }
        return {
            pools: status,
            global: this.getGlobalStats()
        };
    }
    /**
     * Cleanup all pools
     */
    cleanup() {
        for (const pool of this.pools.values()) {
            pool.clear();
        }
        console.log('🧹 All pools cleaned up');
    }
}
// Example poolable objects for common game entities
export class PooledBullet {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.damage = 0;
        this.active = false;
        this.inUse = false;
    }
    reset() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.damage = 0;
        this.active = false;
        this.inUse = false;
    }
    isInUse() {
        return this.inUse;
    }
    markInUse() {
        this.inUse = true;
        this.active = true;
    }
    markAvailable() {
        this.inUse = false;
        this.active = false;
    }
    initialize(x, y, vx, vy, damage) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
    }
}
export class PooledParticle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.maxLife = 0;
        this.color = '#ffffff';
        this.size = 1;
        this.inUse = false;
    }
    reset() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.maxLife = 0;
        this.color = '#ffffff';
        this.size = 1;
        this.inUse = false;
    }
    isInUse() {
        return this.inUse;
    }
    markInUse() {
        this.inUse = true;
    }
    markAvailable() {
        this.inUse = false;
    }
    initialize(x, y, vx, vy, life, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
    }
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= deltaTime;
        return this.life > 0;
    }
}
// Global pool manager instance
export const globalPoolManager = new PoolManager();
//# sourceMappingURL=MemoryPoolManager.js.map