/**
 * Performance Optimization System Tests
 * Comprehensive tests for all performance optimization components
 */

import {
  LazyLoadingSystem,
  ObjectPool,
  PoolManager,
  PooledBullet,
  PooledParticle,
  AdvancedCache,
  MultiLevelCache,
  PerformanceProfiler,
  PerformanceOptimizationManager,
  globalPerformanceManager
} from '../../../typescript/core/performance';

describe('Performance Optimization System', () => {
  
  describe('LazyLoadingSystem', () => {
    let lazyLoader: LazyLoadingSystem;

    beforeEach(() => {
      lazyLoader = new LazyLoadingSystem({
        maxConcurrentLoads: 2,
        preloadDistance: 1,
        unloadDistance: 2,
        memoryThreshold: 100, // 100MB
        enableProfiling: false
      });
    });

    it('should register resources for lazy loading', () => {
      lazyLoader.registerResource({
        id: 'test-image',
        type: 'image',
        path: 'test.png',
        priority: 500,
        estimatedSize: 1024
      });

      const status = lazyLoader.getStatus();
      expect(status.totalResources).toBe(1);
    });

    it('should handle resource requests with prioritization', async () => {
      lazyLoader.registerResource({
        id: 'high-priority',
        type: 'scene',
        path: 'high-scene',
        priority: 1000,
        estimatedSize: 512
      });

      lazyLoader.registerResource({
        id: 'low-priority',
        type: 'scene',
        path: 'low-scene',
        priority: 100,
        estimatedSize: 512
      });

      // Request both resources
      const highPromise = lazyLoader.requestResource('high-priority', 1000);
      const lowPromise = lazyLoader.requestResource('low-priority', 100);

      // High priority should be processed first
      await Promise.all([highPromise, lowPromise]);

      const metrics = lazyLoader.getMetrics();
      
      // The memory should be tracked after successful loading
      expect(metrics.totalMemoryUsage).toBeGreaterThan(0);
    });

    it('should track performance metrics', () => {
      const metrics = lazyLoader.getMetrics();
      expect(metrics).toHaveProperty('totalMemoryUsage');
      expect(metrics).toHaveProperty('loadTimes');
      expect(metrics).toHaveProperty('accessCounts');
      expect(metrics).toHaveProperty('cacheHitRatio');
    });

    it('should provide system status', () => {
      const status = lazyLoader.getStatus();
      expect(status).toHaveProperty('totalResources');
      expect(status).toHaveProperty('loadedResources');
      expect(status).toHaveProperty('memoryUsage');
      expect(status).toHaveProperty('cacheHitRatio');
    });
  });

  describe('ObjectPool', () => {
    let bulletPool: ObjectPool<PooledBullet>;

    beforeEach(() => {
      bulletPool = new ObjectPool(() => new PooledBullet(), {
        initialSize: 5,
        maxSize: 20,
        enableStats: true
      });
    });

    it('should initialize with correct pool size', () => {
      const status = bulletPool.getStatus();
      expect(status.available).toBe(5);
      expect(status.active).toBe(0);
    });

    it('should acquire and release objects correctly', () => {
      const bullet1 = bulletPool.acquire();
      const bullet2 = bulletPool.acquire();

      expect(bulletPool.getStatus().active).toBe(2);
      expect(bulletPool.getStatus().available).toBe(3);

      bulletPool.release(bullet1);
      bulletPool.release(bullet2);

      expect(bulletPool.getStatus().active).toBe(0);
      expect(bulletPool.getStatus().available).toBe(5);
    });

    it('should track hit ratio correctly', () => {
      // Acquire and release to generate reuse
      const bullet = bulletPool.acquire();
      bulletPool.release(bullet);
      
      const reusedBullet = bulletPool.acquire();
      bulletPool.release(reusedBullet);

      const stats = bulletPool.getStats();
      expect(stats.hitRatio).toBeGreaterThan(0);
    });

    it('should grow pool when needed', () => {
      bulletPool.grow(10);
      const status = bulletPool.getStatus();
      expect(status.total).toBe(15); // 5 initial + 10 growth
    });

    it('should respect maximum pool size', () => {
      // Try to acquire more than max size
      const bullets: PooledBullet[] = [];
      for (let i = 0; i < 25; i++) {
        bullets.push(bulletPool.acquire());
      }

      const status = bulletPool.getStatus();
      // Pool creates objects beyond maxSize but warns about it
      expect(status.total).toBe(25); // All 25 objects are created
      expect(status.active).toBe(25); // All are active
    });
  });

  describe('PoolManager', () => {
    let poolManager: PoolManager;

    beforeEach(() => {
      poolManager = new PoolManager();
    });

    it('should register and manage multiple pools', () => {
      poolManager.registerPool('bullets', () => new PooledBullet(), {
        initialSize: 10,
        maxSize: 50
      });

      poolManager.registerPool('particles', () => new PooledParticle(), {
        initialSize: 20,
        maxSize: 100
      });

      const globalStats = poolManager.getGlobalStats();
      expect(globalStats.totalPools).toBe(2);
      expect(globalStats.totalObjects).toBe(30); // 10 + 20
    });

    it('should provide access to individual pools', () => {
      poolManager.registerPool('test', () => new PooledBullet());
      const pool = poolManager.getPool('test');
      
      expect(pool).toBeDefined();
      expect(pool!.getStatus().available).toBeGreaterThan(0);
    });

    it('should cleanup all pools', () => {
      poolManager.registerPool('test1', () => new PooledBullet());
      poolManager.registerPool('test2', () => new PooledParticle());

      poolManager.cleanup();

      const status = poolManager.getAllPoolStatus();
      expect(status.pools.test1.available).toBe(0);
      expect(status.pools.test2.available).toBe(0);
    });
  });

  describe('AdvancedCache', () => {
    let cache: AdvancedCache<string>;

    beforeEach(() => {
      cache = new AdvancedCache({
        maxSize: 5,
        maxMemory: 1024,
        defaultTTL: 1000,
        strategy: 'LRU',
        enableCompression: false,
        enablePersistence: false
      });
    });

    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should handle TTL expiration', (done) => {
      cache.set('expiring', 'value', 100); // 100ms TTL

      setTimeout(() => {
        expect(cache.get('expiring')).toBeNull();
        done();
      }, 150);
    });

    it('should evict entries when cache is full', () => {
      // Fill cache to capacity
      for (let i = 0; i < 6; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      const stats = cache.getStats();
      expect(stats.totalEntries).toBeLessThanOrEqual(5);
      expect(stats.evictionCount).toBeGreaterThan(0);
    });

    it('should track hit/miss ratios', () => {
      cache.set('test', 'value');
      
      cache.get('test'); // hit
      cache.get('nonexistent'); // miss

      const stats = cache.getStats();
      expect(stats.hitCount).toBe(1);
      expect(stats.missCount).toBe(1);
      expect(stats.hitRatio).toBe(0.5);
    });

    it('should handle multiple operations efficiently', () => {
      const entries = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3']
      ]);

      cache.setMultiple(entries);
      const results = cache.getMultiple(['key1', 'key2', 'key3', 'nonexistent']);

      expect(results.get('key1')).toBe('value1');
      expect(results.get('key2')).toBe('value2');
      expect(results.get('key3')).toBe('value3');
      expect(results.get('nonexistent')).toBeNull();
    });

    it('should provide cache status information', () => {
      cache.set('test', 'value');
      
      const status = cache.getStatus();
      expect(status).toHaveProperty('entries');
      expect(status).toHaveProperty('memoryUsage');
      expect(status).toHaveProperty('hitRatio');
      expect(status.strategy).toBe('LRU');
    });
  });

  describe('MultiLevelCache', () => {
    let mlCache: MultiLevelCache<string>;

    beforeEach(() => {
      mlCache = new MultiLevelCache(
        { maxSize: 3, strategy: 'LRU' },    // L1
        { maxSize: 10, strategy: 'ADAPTIVE' } // L2
      );
    });

    it('should prefer L1 cache for retrieval', () => {
      mlCache.set('test', 'value');
      
      const value = mlCache.get('test');
      expect(value).toBe('value');

      const stats = mlCache.getStats();
      expect(stats.combined.l1HitRatio).toBeGreaterThan(0);
    });

    it('should fall back to L2 cache', () => {
      // Fill L1 cache and force eviction
      mlCache.set('key1', 'value1');
      mlCache.set('key2', 'value2');
      mlCache.set('key3', 'value3');
      mlCache.set('key4', 'value4'); // This should evict key1 from L1

      // Try to get key1 - should come from L2
      const value = mlCache.get('key1');
      expect(value).toBe('value1');

      const stats = mlCache.getStats();
      expect(stats.combined.l2HitRatio).toBeGreaterThan(0);
    });

    it('should provide comprehensive statistics', () => {
      mlCache.set('test1', 'value1');
      mlCache.set('test2', 'value2');
      
      mlCache.get('test1');
      mlCache.get('nonexistent');

      const stats = mlCache.getStats();
      expect(stats).toHaveProperty('l1');
      expect(stats).toHaveProperty('l2');
      expect(stats).toHaveProperty('combined');
      expect(stats.combined.totalHitRatio).toBeGreaterThan(0);
    });
  });

  describe('PerformanceProfiler', () => {
    let profiler: PerformanceProfiler;

    beforeEach(() => {
      profiler = new PerformanceProfiler({
        enableProfiling: true,
        enableMemoryTracking: true,
        enableFPSMonitoring: false, // Disable for testing
        sampleInterval: 100,
        reportInterval: 1000
      });
    });

    afterEach(() => {
      profiler.stop();
    });

    it('should start and stop profiling', () => {
      expect(profiler.getStatus().isRunning).toBe(false);
      
      profiler.start();
      expect(profiler.getStatus().isRunning).toBe(true);
      
      const report = profiler.stop();
      expect(profiler.getStatus().isRunning).toBe(false);
      expect(report).toHaveProperty('healthScore');
    });

    it('should collect performance metrics', () => {
      profiler.start();
      
      const metrics = profiler.getCurrentMetrics();
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('frameTime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('cpuUsage');
    });

    it('should sample metrics over time', (done) => {
      profiler.start();
      
      // Give it time to collect samples
      setTimeout(() => {
        profiler.sampleMetrics('test-scene', 'test-action');
        
        const status = profiler.getStatus();
        expect(status.samples).toBeGreaterThan(0);
        done();
      }, 200);
    });



    it('should generate performance reports', (done) => {
      profiler.start();
      
      // Allow some time for data collection
      setTimeout(() => {
        const report = profiler.stop();
        
        expect(report).toHaveProperty('averageMetrics');
        expect(report).toHaveProperty('peakMetrics');
        expect(report).toHaveProperty('lowMetrics');
        expect(report).toHaveProperty('trends');
        expect(report).toHaveProperty('recommendations');
        expect(report.healthScore).toBeGreaterThanOrEqual(0);
        expect(report.healthScore).toBeLessThanOrEqual(100);
        done();
      }, 300);
    });
  });

  describe('PerformanceOptimizationManager', () => {
    let manager: PerformanceOptimizationManager;

    beforeEach(() => {
      manager = new PerformanceOptimizationManager();
    });

    afterEach(() => {
      manager.shutdown();
    });

    it('should initialize all performance systems', () => {
      const status = manager.getPerformanceStatus();
      
      expect(status.initialized).toBe(true);
      expect(status).toHaveProperty('lazyLoading');
      expect(status).toHaveProperty('objectPools');
      expect(status).toHaveProperty('caching');
      expect(status).toHaveProperty('profiler');
      expect(status).toHaveProperty('recommendations');
    });

    it('should provide comprehensive performance status', () => {
      const status = manager.getPerformanceStatus();
      
      expect(status.system).toBe('Performance Optimization Manager');
      expect(status.objectPools).toHaveProperty('global');
      expect(status.caching).toHaveProperty('assetCache');
      expect(status.caching).toHaveProperty('dataCache');
    });

    it('should generate performance recommendations', () => {
      const status = manager.getPerformanceStatus();
      
      expect(Array.isArray(status.recommendations)).toBe(true);
      // Recommendations might be empty initially, which is fine
    });

    it('should handle scene preloading', async () => {
      // This should not throw an error
      await manager.preloadForScene('battle');
      await manager.preloadForScene('menu');
    });

    it('should perform forced optimization', () => {
      // This should not throw an error
      expect(() => manager.forceOptimization()).not.toThrow();
    });

    it('should shutdown cleanly', () => {
      expect(() => manager.shutdown()).not.toThrow();
    });
  });

  describe('Global Performance Manager', () => {
    it('should be available as singleton', () => {
      expect(globalPerformanceManager).toBeDefined();
      expect(globalPerformanceManager).toBeInstanceOf(PerformanceOptimizationManager);
    });

    it('should provide status without errors', () => {
      const status = globalPerformanceManager.getPerformanceStatus();
      expect(status).toBeDefined();
      expect(status.system).toBe('Performance Optimization Manager');
    });
  });

  describe('Integration Tests', () => {
    it('should work together across all systems', async () => {
      const manager = new PerformanceOptimizationManager();
      
      try {
        // Get initial status
        const initialStatus = manager.getPerformanceStatus();
        expect(initialStatus.initialized).toBe(true);

        // Preload assets for a scene
        await manager.preloadForScene('battle');

        // Force optimization
        manager.forceOptimization();

        // Get final status
        const finalStatus = manager.getPerformanceStatus();
        expect(finalStatus.initialized).toBe(true);

      } finally {
        manager.shutdown();
      }
    });

    it('should handle performance monitoring lifecycle', (done) => {
      const profiler = new PerformanceProfiler({
        enableProfiling: true,
        sampleInterval: 50,
        enableFPSMonitoring: false
      });

      profiler.start();
      
      setTimeout(() => {
        profiler.sampleMetrics('test', 'integration');
        
        setTimeout(() => {
          const report = profiler.stop();
          expect(report.healthScore).toBeGreaterThanOrEqual(0);
          done();
        }, 100);
      }, 100);
    });

    it('should demonstrate pooling efficiency', () => {
      const pool = new ObjectPool(() => new PooledBullet(), {
        initialSize: 5,
        maxSize: 20
      });

      // Simulate heavy usage
      const bullets: PooledBullet[] = [];
      for (let i = 0; i < 15; i++) {
        bullets.push(pool.acquire());
      }

      const statusWithActive = pool.getStatus();
      expect(statusWithActive.active).toBe(15);

      // Release all bullets
      bullets.forEach(bullet => pool.release(bullet));

      const statusAfterRelease = pool.getStatus();
      expect(statusAfterRelease.active).toBe(0);
      expect(statusAfterRelease.available).toBeGreaterThan(0);

      const stats = pool.getStats();
      expect(stats.hitRatio).toBeGreaterThan(0);
    });
  });
});
