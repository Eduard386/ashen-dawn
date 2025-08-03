/**
 * Performance Optimization System - Central Export
 * Advanced performance optimization components for the game engine
 */

// Lazy Loading System
export {
  LazyLoadingSystem,
  type LazyLoadConfig,
  type LoadableResource,
  type PerformanceMetrics as LazyLoadingMetrics
} from './LazyLoadingSystem';

// Memory Pool Management
export {
  ObjectPool,
  PoolManager,
  PooledBullet,
  PooledParticle,
  globalPoolManager,
  type PoolableObject,
  type PoolConfig,
  type PoolStats
} from './MemoryPoolManager';

// Advanced Caching
export {
  AdvancedCache,
  MultiLevelCache,
  globalAssetCache,
  globalDataCache,
  type CacheConfig,
  type CacheEntry,
  type CacheStats
} from './AdvancedCaching';

// Performance Profiler
export {
  PerformanceProfiler,
  globalProfiler,
  type PerformanceConfig,
  type PerformanceMetrics,
  type ProfilerSample,
  type PerformanceReport,
  type PerformanceAlert
} from './PerformanceProfiler';

// Import all components for internal use
import { LazyLoadingSystem } from './LazyLoadingSystem';
import { PoolManager, PooledBullet, PooledParticle, globalPoolManager } from './MemoryPoolManager';
import { PerformanceProfiler, globalProfiler, type PerformanceAlert } from './PerformanceProfiler';
import { globalAssetCache, globalDataCache } from './AdvancedCaching';

/**
 * Performance Optimization Manager
 * Centralized manager for all performance systems
 */
export class PerformanceOptimizationManager {
  private lazyLoader: LazyLoadingSystem;
  private poolManager: PoolManager;
  private profiler: PerformanceProfiler;
  private isInitialized = false;

  constructor() {
    this.lazyLoader = new LazyLoadingSystem({
      maxConcurrentLoads: 4,
      preloadDistance: 3,
      memoryThreshold: 256,
      enableProfiling: true
    });

    this.poolManager = globalPoolManager;
    this.profiler = globalProfiler;

    this.initialize();
  }

  /**
   * Initialize all performance systems
   */
  private initialize(): void {
    if (this.isInitialized) return;

    // Setup object pools for common game entities
    this.setupObjectPools();

    // Configure performance monitoring
    this.setupPerformanceMonitoring();

    // Register common assets for lazy loading
    this.setupLazyLoading();

    this.isInitialized = true;
    console.log('🚀 Performance Optimization Manager initialized');
  }

  /**
   * Setup object pools for common game entities
   */
  private setupObjectPools(): void {
    // Bullet pool
    this.poolManager.registerPool('bullets', () => new PooledBullet(), {
      initialSize: 50,
      maxSize: 200,
      enableStats: true
    });

    // Particle pool
    this.poolManager.registerPool('particles', () => new PooledParticle(), {
      initialSize: 100,
      maxSize: 500,
      enableStats: true
    });

    console.log('🏊 Object pools configured');
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    this.profiler.onAlert((alert) => {
      console.warn(`⚠️ Performance Alert [${alert.severity}]: ${alert.message}`);
      
      // Auto-optimize based on alerts
      this.handlePerformanceAlert(alert);
    });

    this.profiler.start();
    console.log('📊 Performance monitoring started');
  }

  /**
   * Setup lazy loading for common resources
   */
  private setupLazyLoading(): void {
    // Register common game assets
    const commonAssets = [
      { id: 'player_sprites', type: 'image' as const, path: 'assets/images/player/', priority: 1000, estimatedSize: 2048000 },
      { id: 'enemy_sprites', type: 'image' as const, path: 'assets/images/enemies/', priority: 800, estimatedSize: 4096000 },
      { id: 'weapon_sprites', type: 'image' as const, path: 'assets/images/weapons/', priority: 600, estimatedSize: 1024000 },
      { id: 'ui_elements', type: 'image' as const, path: 'assets/images/ui/', priority: 900, estimatedSize: 512000 },
      { id: 'background_music', type: 'audio' as const, path: 'assets/sounds/', priority: 200, estimatedSize: 8192000 },
      { id: 'sound_effects', type: 'audio' as const, path: 'assets/sounds/effects/', priority: 400, estimatedSize: 2048000 }
    ];

    for (const asset of commonAssets) {
      this.lazyLoader.registerResource(asset);
    }

    console.log('💤 Lazy loading configured for common assets');
  }

  /**
   * Handle performance alerts with automatic optimization
   */
  private handlePerformanceAlert(alert: PerformanceAlert): void {
    switch (alert.type) {
      case 'low_fps':
        this.optimizeForFPS();
        break;
      case 'high_memory':
        this.optimizeMemoryUsage();
        break;
      case 'frame_time':
        this.optimizeFrameTime();
        break;
    }
  }

  /**
   * Optimize for better FPS
   */
  private optimizeForFPS(): void {
    // Reduce visual quality
    console.log('🎯 Optimizing for FPS...');
    
    // Trigger garbage collection
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }

    // Free unused pool objects
    const bulletPool = this.poolManager.getPool('bullets');
    const particlePool = this.poolManager.getPool('particles');
    
    if (bulletPool) bulletPool.clear();
    if (particlePool) particlePool.clear();
  }

  /**
   * Optimize memory usage
   */
  private optimizeMemoryUsage(): void {
    console.log('💾 Optimizing memory usage...');
    
    // Clear caches
    globalAssetCache.clear();
    // Note: MultiLevelCache doesn't expose l1Cache publicly, so we use the public interface
    
    // Clean up pools
    this.poolManager.cleanup();
  }

  /**
   * Optimize frame time
   */
  private optimizeFrameTime(): void {
    console.log('⏱️ Optimizing frame time...');
    
    // Reduce concurrent operations
    // This would be implemented based on specific game systems
  }

  /**
   * Get comprehensive performance status
   */
  public getPerformanceStatus() {
    return {
      system: 'Performance Optimization Manager',
      initialized: this.isInitialized,
      lazyLoading: this.lazyLoader.getStatus(),
      objectPools: this.poolManager.getAllPoolStatus(),
      caching: {
        assetCache: globalAssetCache.getStatus(),
        dataCache: globalDataCache.getStats()
      },
      profiler: this.profiler.getStatus(),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const currentMetrics = this.profiler.getCurrentMetrics();

    if (currentMetrics.fps < 45) {
      recommendations.push('Consider enabling object pooling for frequently created objects');
    }

    if (currentMetrics.memoryUsage > 200 * 1024 * 1024) {
      recommendations.push('Enable aggressive caching and lazy loading for assets');
    }

    if (currentMetrics.frameTime > 25) {
      recommendations.push('Profile game loop for performance bottlenecks');
    }

    const poolStatus = this.poolManager.getAllPoolStatus();
    for (const [poolName, status] of Object.entries(poolStatus.pools)) {
      if (parseFloat(status.hitRatio) < 50) {
        recommendations.push(`Increase initial size for ${poolName} pool (low hit ratio: ${status.hitRatio})`);
      }
    }

    return recommendations;
  }

  /**
   * Force optimization cycle
   */
  public forceOptimization(): void {
    console.log('🔧 Running forced optimization cycle...');
    
    this.optimizeMemoryUsage();
    this.optimizeForFPS();
    
    // Trigger profiler report
    const report = this.profiler.stop();
    console.log('📊 Optimization complete. Health score:', report.healthScore);
    
    // Restart profiler
    this.profiler.start();
  }

  /**
   * Preload assets for upcoming scene
   */
  public async preloadForScene(sceneName: string): Promise<void> {
    console.log(`🎬 Preloading assets for scene: ${sceneName}`);
    
    // Scene-specific preloading logic
    const sceneAssets = this.getSceneAssets(sceneName);
    
    // Use Promise.all with individual timeout for each request
    const promises = sceneAssets.map(assetId => 
      Promise.race([
        this.lazyLoader.requestResource(assetId, 500),
        new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout per asset
      ])
    );
    
    await Promise.all(promises);
  }

  /**
   * Get assets required for a specific scene
   */
  private getSceneAssets(sceneName: string): string[] {
    const sceneAssetMap: Record<string, string[]> = {
      'battle': ['player_sprites', 'enemy_sprites', 'weapon_sprites', 'sound_effects'],
      'menu': ['ui_elements', 'background_music'],
      'world': ['player_sprites', 'ui_elements'],
      'inventory': ['ui_elements', 'weapon_sprites']
    };

    return sceneAssetMap[sceneName] || [];
  }

  /**
   * Cleanup and shutdown performance systems
   */
  public shutdown(): void {
    this.profiler.stop();
    this.poolManager.cleanup();
    globalAssetCache.clear();
    
    console.log('🔄 Performance Optimization Manager shut down');
  }
}

// Global performance manager instance
export const globalPerformanceManager = new PerformanceOptimizationManager();
