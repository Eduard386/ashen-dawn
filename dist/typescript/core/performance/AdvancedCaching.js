/**
 * Advanced Caching System - High-performance caching with multiple strategies
 * Implements LRU, LFU, time-based, and intelligent caching strategies
 */
export class AdvancedCache {
    constructor(config = {}) {
        this.cache = new Map();
        this.accessOrder = []; // For LRU
        // Performance tracking
        this.accessTimes = [];
        this.lastCleanup = Date.now();
        this.evictionCount = 0;
        this.config = {
            maxSize: 1000,
            maxMemory: 100 * 1024 * 1024, // 100MB
            defaultTTL: 5 * 60 * 1000, // 5 minutes
            strategy: 'ADAPTIVE',
            enableCompression: false,
            enablePersistence: false,
            statsInterval: 10000,
            ...config
        };
        this.stats = {
            totalEntries: 0,
            totalMemory: 0,
            hitCount: 0,
            missCount: 0,
            hitRatio: 0,
            averageAccessTime: 0,
            evictionCount: 0,
            compressionRatio: 0
        };
        this.initializeCache();
    }
    /**
     * Initialize cache system
     */
    initializeCache() {
        // Setup periodic cleanup
        setInterval(() => {
            this.performCleanup();
        }, this.config.statsInterval);
        // Setup stats collection
        setInterval(() => {
            this.updateStats();
        }, this.config.statsInterval);
        if (this.config.enablePersistence) {
            this.loadFromPersistence();
        }
        console.log('🗄️ Advanced cache initialized with strategy:', this.config.strategy);
    }
    /**
     * Store value in cache
     */
    set(key, value, ttl) {
        const startTime = performance.now();
        // Remove existing entry if present
        if (this.cache.has(key)) {
            this.delete(key);
        }
        // Calculate entry size
        const size = this.calculateSize(value);
        // Check if we need to make space
        this.ensureCapacity(size);
        // Create cache entry
        const entry = {
            key,
            value: this.config.enableCompression ? this.compress(value) : value,
            size,
            accessCount: 0,
            lastAccessed: Date.now(),
            created: Date.now(),
            ttl: ttl || this.config.defaultTTL,
            compressed: this.config.enableCompression,
            metadata: {}
        };
        // Store entry
        this.cache.set(key, entry);
        this.updateAccessOrder(key);
        // Update stats
        this.stats.totalEntries = this.cache.size;
        this.stats.totalMemory += size;
        const accessTime = performance.now() - startTime;
        this.recordAccessTime(accessTime);
        if (this.config.enablePersistence) {
            this.persistEntry(entry);
        }
    }
    /**
     * Get value from cache
     */
    get(key) {
        const startTime = performance.now();
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.missCount++;
            this.updateHitRatio();
            return null;
        }
        // Check TTL
        if (this.isExpired(entry)) {
            this.delete(key);
            this.stats.missCount++;
            this.updateHitRatio();
            return null;
        }
        // Update access tracking
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        this.updateAccessOrder(key);
        this.stats.hitCount++;
        this.updateHitRatio();
        const accessTime = performance.now() - startTime;
        this.recordAccessTime(accessTime);
        // Return decompressed value if needed
        return entry.compressed ? this.decompress(entry.value) : entry.value;
    }
    /**
     * Check if key exists (without affecting access)
     */
    has(key) {
        const entry = this.cache.get(key);
        return entry !== undefined && !this.isExpired(entry);
    }
    /**
     * Delete entry from cache
     */
    delete(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        this.stats.totalMemory -= entry.size;
        this.stats.totalEntries = this.cache.size;
        return true;
    }
    /**
     * Clear entire cache
     */
    clear() {
        this.cache.clear();
        this.accessOrder = [];
        this.stats.totalEntries = 0;
        this.stats.totalMemory = 0;
    }
    /**
     * Get multiple values efficiently
     */
    getMultiple(keys) {
        const result = new Map();
        for (const key of keys) {
            result.set(key, this.get(key));
        }
        return result;
    }
    /**
     * Set multiple values efficiently
     */
    setMultiple(entries, ttl) {
        for (const [key, value] of entries) {
            this.set(key, value, ttl);
        }
    }
    /**
     * Ensure cache has capacity for new entry
     */
    ensureCapacity(newEntrySize) {
        // Check memory constraint
        while (this.stats.totalMemory + newEntrySize > this.config.maxMemory && this.cache.size > 0) {
            this.evictEntry();
        }
        // Check size constraint
        while (this.cache.size >= this.config.maxSize) {
            this.evictEntry();
        }
    }
    /**
     * Evict entry based on strategy
     */
    evictEntry() {
        let keyToEvict = null;
        switch (this.config.strategy) {
            case 'LRU':
                keyToEvict = this.findLRUKey();
                break;
            case 'LFU':
                keyToEvict = this.findLFUKey();
                break;
            case 'FIFO':
                keyToEvict = this.findOldestKey();
                break;
            case 'ADAPTIVE':
                keyToEvict = this.findAdaptiveKey();
                break;
        }
        if (keyToEvict) {
            this.delete(keyToEvict);
            this.evictionCount++;
            this.stats.evictionCount = this.evictionCount;
        }
    }
    /**
     * Find least recently used key
     */
    findLRUKey() {
        return this.accessOrder.length > 0 ? this.accessOrder[0] : null;
    }
    /**
     * Find least frequently used key
     */
    findLFUKey() {
        let minAccessCount = Infinity;
        let lfuKey = null;
        for (const [key, entry] of this.cache) {
            if (entry.accessCount < minAccessCount) {
                minAccessCount = entry.accessCount;
                lfuKey = key;
            }
        }
        return lfuKey;
    }
    /**
     * Find oldest key (FIFO)
     */
    findOldestKey() {
        let oldestTime = Infinity;
        let oldestKey = null;
        for (const [key, entry] of this.cache) {
            if (entry.created < oldestTime) {
                oldestTime = entry.created;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    /**
     * Adaptive eviction strategy
     */
    findAdaptiveKey() {
        // Combine multiple factors for intelligent eviction
        let bestScore = -1;
        let bestKey = null;
        const now = Date.now();
        for (const [key, entry] of this.cache) {
            // Calculate composite score (lower is better for eviction)
            const accessRecency = (now - entry.lastAccessed) / 1000; // seconds
            const accessFrequency = entry.accessCount;
            const age = (now - entry.created) / 1000; // seconds
            const size = entry.size;
            // Weighted score (higher means more likely to evict)
            const score = (accessRecency * 0.4) + (age * 0.3) - (accessFrequency * 0.2) + (size * 0.1);
            if (score > bestScore) {
                bestScore = score;
                bestKey = key;
            }
        }
        return bestKey;
    }
    /**
     * Update access order for LRU
     */
    updateAccessOrder(key) {
        this.removeFromAccessOrder(key);
        this.accessOrder.push(key);
    }
    /**
     * Remove from access order
     */
    removeFromAccessOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
    }
    /**
     * Check if entry is expired
     */
    isExpired(entry) {
        if (!entry.ttl)
            return false;
        return Date.now() - entry.created > entry.ttl;
    }
    /**
     * Calculate entry size
     */
    calculateSize(value) {
        if (typeof value === 'string') {
            return value.length * 2; // UTF-16
        }
        else if (value instanceof ArrayBuffer) {
            return value.byteLength;
        }
        else {
            // Rough estimation for objects
            return JSON.stringify(value).length * 2;
        }
    }
    /**
     * Compress value (placeholder implementation)
     */
    compress(value) {
        // In a real implementation, use LZ4, gzip, or similar
        return value;
    }
    /**
     * Decompress value (placeholder implementation)
     */
    decompress(value) {
        // In a real implementation, decompress the value
        return value;
    }
    /**
     * Record access time for performance tracking
     */
    recordAccessTime(time) {
        this.accessTimes.push(time);
        if (this.accessTimes.length > 1000) {
            this.accessTimes = this.accessTimes.slice(-500); // Keep last 500
        }
    }
    /**
     * Update hit ratio
     */
    updateHitRatio() {
        const total = this.stats.hitCount + this.stats.missCount;
        this.stats.hitRatio = total > 0 ? this.stats.hitCount / total : 0;
    }
    /**
     * Update statistics
     */
    updateStats() {
        this.stats.totalEntries = this.cache.size;
        // Calculate average access time
        if (this.accessTimes.length > 0) {
            this.stats.averageAccessTime = this.accessTimes.reduce((a, b) => a + b, 0) / this.accessTimes.length;
        }
        // Update total memory
        let totalMemory = 0;
        for (const entry of this.cache.values()) {
            totalMemory += entry.size;
        }
        this.stats.totalMemory = totalMemory;
    }
    /**
     * Perform periodic cleanup
     */
    performCleanup() {
        const now = Date.now();
        const expiredKeys = [];
        // Find expired entries
        for (const [key, entry] of this.cache) {
            if (this.isExpired(entry)) {
                expiredKeys.push(key);
            }
        }
        // Remove expired entries
        for (const key of expiredKeys) {
            this.delete(key);
        }
        this.lastCleanup = now;
        if (expiredKeys.length > 0) {
            console.log(`🧹 Cache cleanup: removed ${expiredKeys.length} expired entries`);
        }
    }
    /**
     * Load cache from persistence (placeholder)
     */
    loadFromPersistence() {
        // In a real implementation, load from localStorage, IndexedDB, etc.
        console.log('📥 Loading cache from persistence (placeholder)');
    }
    /**
     * Persist entry (placeholder)
     */
    persistEntry(entry) {
        // In a real implementation, persist to localStorage, IndexedDB, etc.
    }
    /**
     * Get cache statistics
     */
    getStats() {
        this.updateStats();
        return { ...this.stats };
    }
    /**
     * Get cache status
     */
    getStatus() {
        return {
            entries: this.cache.size,
            memoryUsage: `${(this.stats.totalMemory / 1024 / 1024).toFixed(2)}MB`,
            hitRatio: `${(this.stats.hitRatio * 100).toFixed(1)}%`,
            averageAccessTime: `${this.stats.averageAccessTime.toFixed(2)}ms`,
            evictions: this.evictionCount,
            strategy: this.config.strategy
        };
    }
    /**
     * Export cache data for debugging
     */
    exportData() {
        const data = {};
        for (const [key, entry] of this.cache) {
            data[key] = {
                size: entry.size,
                accessCount: entry.accessCount,
                lastAccessed: new Date(entry.lastAccessed).toISOString(),
                created: new Date(entry.created).toISOString(),
                ttl: entry.ttl
            };
        }
        return data;
    }
}
/**
 * Multi-Level Cache System
 */
export class MultiLevelCache {
    constructor(l1Config = {}, l2Config = {}) {
        this.stats = {
            l1Hits: 0,
            l2Hits: 0,
            misses: 0
        };
        this.l1Cache = new AdvancedCache({
            maxSize: 100,
            maxMemory: 10 * 1024 * 1024, // 10MB
            strategy: 'LRU',
            ...l1Config
        });
        this.l2Cache = new AdvancedCache({
            maxSize: 1000,
            maxMemory: 100 * 1024 * 1024, // 100MB
            strategy: 'ADAPTIVE',
            ...l2Config
        });
        console.log('🏗️ Multi-level cache system initialized');
    }
    /**
     * Get value from multi-level cache
     */
    get(key) {
        // Try L1 cache first
        let value = this.l1Cache.get(key);
        if (value !== null) {
            this.stats.l1Hits++;
            return value;
        }
        // Try L2 cache
        value = this.l2Cache.get(key);
        if (value !== null) {
            this.stats.l2Hits++;
            // Promote to L1 cache
            this.l1Cache.set(key, value);
            return value;
        }
        this.stats.misses++;
        return null;
    }
    /**
     * Set value in multi-level cache
     */
    set(key, value, ttl) {
        this.l1Cache.set(key, value, ttl);
        this.l2Cache.set(key, value, ttl);
    }
    /**
     * Get multi-level cache statistics
     */
    getStats() {
        const total = this.stats.l1Hits + this.stats.l2Hits + this.stats.misses;
        return {
            l1: this.l1Cache.getStats(),
            l2: this.l2Cache.getStats(),
            combined: {
                l1HitRatio: total > 0 ? this.stats.l1Hits / total : 0,
                l2HitRatio: total > 0 ? this.stats.l2Hits / total : 0,
                missRatio: total > 0 ? this.stats.misses / total : 0,
                totalHitRatio: total > 0 ? (this.stats.l1Hits + this.stats.l2Hits) / total : 0
            }
        };
    }
}
// Global cache instances
export const globalAssetCache = new AdvancedCache({
    maxSize: 500,
    maxMemory: 50 * 1024 * 1024, // 50MB
    strategy: 'LRU',
    enablePersistence: true
});
export const globalDataCache = new MultiLevelCache({ maxSize: 50, strategy: 'LRU' }, // L1: Fast access
{ maxSize: 500, strategy: 'ADAPTIVE' } // L2: Larger storage
);
//# sourceMappingURL=AdvancedCaching.js.map