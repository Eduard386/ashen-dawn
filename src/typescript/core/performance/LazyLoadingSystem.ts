/**
 * Lazy Loading System - Advanced performance optimization
 * Implements intelligent asset loading, memory management, and performance monitoring
 */

export interface LazyLoadConfig {
  maxConcurrentLoads: number;
  preloadDistance: number;
  unloadDistance: number;
  memoryThreshold: number; // MB
  enableProfiling: boolean;
}

export interface LoadableResource {
  id: string;
  type: 'image' | 'audio' | 'data' | 'scene';
  path: string;
  priority: number;
  estimatedSize: number; // bytes
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

export class LazyLoadingSystem {
  private resources: Map<string, LoadableResource> = new Map();
  private loadQueue: LoadableResource[] = [];
  private activeLoads: Set<string> = new Set();
  private loadedResources: Set<string> = new Set();
  private config: LazyLoadConfig;
  private metrics: PerformanceMetrics;
  
  // Performance tracking
  private memoryUsage = 0;
  private loadStartTimes: Map<string, number> = new Map();
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor(config: Partial<LazyLoadConfig> = {}) {
    this.config = {
      maxConcurrentLoads: 3,
      preloadDistance: 2,
      unloadDistance: 5,
      memoryThreshold: 512, // 512MB
      enableProfiling: false,
      ...config
    };

    this.metrics = {
      totalMemoryUsage: 0,
      loadTimes: new Map(),
      accessCounts: new Map(),
      cacheHitRatio: 0,
      averageLoadTime: 0
    };

    this.initializeSystem();
  }

  /**
   * Initialize the lazy loading system
   */
  private initializeSystem(): void {
    if (this.config.enableProfiling) {
      this.setupPerformanceMonitoring();
    }
    
    // Setup memory monitoring
    this.setupMemoryMonitoring();
    
    console.log('🚀 Lazy Loading System initialized with config:', this.config);
  }

  /**
   * Register a resource for lazy loading
   */
  public registerResource(resource: Omit<LoadableResource, 'loaded' | 'lastAccessed'>): void {
    const fullResource: LoadableResource = {
      ...resource,
      loaded: false,
      lastAccessed: 0
    };

    this.resources.set(resource.id, fullResource);
    
    if (this.config.enableProfiling) {
      console.log(`📝 Registered resource: ${resource.id} (${resource.type})`);
    }
  }

  /**
   * Request a resource with intelligent loading
   */
  public async requestResource(id: string, priority: number = 0): Promise<boolean> {
    const resource = this.resources.get(id);
    if (!resource) {
      console.warn(`⚠️ Resource not found: ${id}`);
      return false;
    }

    // Update access tracking
    resource.lastAccessed = Date.now();
    this.updateAccessCount(id);

    // If already loaded, return immediately
    if (resource.loaded) {
      this.cacheHits++;
      this.updateCacheHitRatio();
      return true;
    }

    this.cacheMisses++;
    this.updateCacheHitRatio();

    // Add to load queue with priority
    resource.priority = Math.max(resource.priority, priority);
    this.addToLoadQueue(resource);

    // Process the queue
    await this.processLoadQueue();

    return resource.loaded;
  }

  /**
   * Preload resources based on current context
   */
  public async preloadArea(centerX: number, centerY: number): Promise<void> {
    const nearbyResources = this.findNearbyResources(centerX, centerY);
    
    for (const resource of nearbyResources) {
      if (!resource.loaded && !this.activeLoads.has(resource.id)) {
        await this.requestResource(resource.id, 100); // Lower priority for preloading
      }
    }
  }

  /**
   * Unload distant resources to free memory
   */
  public unloadDistantResources(centerX: number, centerY: number): void {
    const distantResources = this.findDistantResources(centerX, centerY);
    
    for (const resource of distantResources) {
      if (resource.loaded) {
        this.unloadResource(resource.id);
      }
    }
  }

  /**
   * Add resource to priority-based load queue
   */
  private addToLoadQueue(resource: LoadableResource): void {
    // Remove if already in queue
    this.loadQueue = this.loadQueue.filter(r => r.id !== resource.id);
    
    // Insert based on priority
    const insertIndex = this.loadQueue.findIndex(r => r.priority < resource.priority);
    if (insertIndex === -1) {
      this.loadQueue.push(resource);
    } else {
      this.loadQueue.splice(insertIndex, 0, resource);
    }
  }

  /**
   * Process the load queue with concurrency control
   */
  private async processLoadQueue(): Promise<void> {
    const loadingPromises: Promise<void>[] = [];
    
    while (this.loadQueue.length > 0 && this.activeLoads.size < this.config.maxConcurrentLoads) {
      const resource = this.loadQueue.shift();
      if (!resource || resource.loaded) continue;

      // Collect the promise to wait for completion
      const loadingPromise = this.loadResource(resource);
      loadingPromises.push(loadingPromise);
    }
    
    // Wait for all started loads to complete
    if (loadingPromises.length > 0) {
      await Promise.all(loadingPromises);
    }
  }

  /**
   * Load a single resource
   */
  private async loadResource(resource: LoadableResource): Promise<void> {
    if (this.activeLoads.has(resource.id)) return;

    this.activeLoads.add(resource.id);
    this.loadStartTimes.set(resource.id, Date.now());

    try {
      // Check memory before loading
      if (!this.checkMemoryConstraints(resource.estimatedSize)) {
        await this.freeMemory(resource.estimatedSize);
      }

      // Load dependencies first
      if (resource.dependencies) {
        await this.loadDependencies(resource.dependencies);
      }

      // Actual loading logic based on type
      await this.performLoad(resource);

      // Mark as loaded and update memory usage
      resource.loaded = true;
      this.loadedResources.add(resource.id);
      this.memoryUsage += resource.estimatedSize;
      
      // Update metrics immediately
      this.metrics.totalMemoryUsage = this.memoryUsage;

      // Record performance metrics
      const loadTime = Date.now() - this.loadStartTimes.get(resource.id)!;
      this.metrics.loadTimes.set(resource.id, loadTime);
      this.updateAverageLoadTime();

      if (this.config.enableProfiling) {
        console.log(`✅ Loaded resource: ${resource.id} in ${loadTime}ms`);
      }

    } catch (error) {
      console.error(`❌ Failed to load resource: ${resource.id}`, error);
    } finally {
      this.activeLoads.delete(resource.id);
      this.loadStartTimes.delete(resource.id);
    }
  }

  /**
   * Perform the actual loading based on resource type
   */
  private async performLoad(resource: LoadableResource): Promise<void> {
    return new Promise((resolve, reject) => {
      switch (resource.type) {
        case 'image':
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${resource.path}`));
          img.src = resource.path;
          break;

        case 'audio':
          const audio = new Audio();
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => reject(new Error(`Failed to load audio: ${resource.path}`));
          audio.src = resource.path;
          break;

        case 'data':
          fetch(resource.path)
            .then(response => response.ok ? resolve() : reject(new Error(`HTTP ${response.status}`)))
            .catch(reject);
          break;

        case 'scene':
          // Simulate scene loading
          setTimeout(resolve, 100);
          break;

        default:
          reject(new Error(`Unknown resource type: ${resource.type}`));
      }
    });
  }

  /**
   * Load resource dependencies
   */
  private async loadDependencies(dependencies: string[]): Promise<void> {
    const dependencyPromises = dependencies.map(id => this.requestResource(id, 1000));
    await Promise.all(dependencyPromises);
  }

  /**
   * Unload a resource to free memory
   */
  private unloadResource(id: string): void {
    const resource = this.resources.get(id);
    if (!resource || !resource.loaded) return;

    resource.loaded = false;
    this.loadedResources.delete(id);
    this.memoryUsage -= resource.estimatedSize;
    
    // Update metrics immediately
    this.metrics.totalMemoryUsage = this.memoryUsage;

    if (this.config.enableProfiling) {
      console.log(`🗑️ Unloaded resource: ${id}`);
    }
  }

  /**
   * Check if memory constraints allow loading
   */
  private checkMemoryConstraints(estimatedSize: number): boolean {
    const totalAfterLoad = this.memoryUsage + estimatedSize;
    const thresholdBytes = this.config.memoryThreshold * 1024 * 1024;
    return totalAfterLoad <= thresholdBytes;
  }

  /**
   * Free memory by unloading least recently used resources
   */
  private async freeMemory(requiredBytes: number): Promise<void> {
    const resourcesArray = Array.from(this.resources.values())
      .filter(r => r.loaded)
      .sort((a, b) => a.lastAccessed - b.lastAccessed);

    let freedBytes = 0;
    for (const resource of resourcesArray) {
      if (freedBytes >= requiredBytes) break;
      
      this.unloadResource(resource.id);
      freedBytes += resource.estimatedSize;
    }
  }

  /**
   * Find nearby resources for preloading
   */
  private findNearbyResources(centerX: number, centerY: number): LoadableResource[] {
    // Simplified distance calculation - in real game would use actual positions
    return Array.from(this.resources.values())
      .filter(r => !r.loaded)
      .slice(0, this.config.preloadDistance);
  }

  /**
   * Find distant resources for unloading
   */
  private findDistantResources(centerX: number, centerY: number): LoadableResource[] {
    // Simplified distance calculation - in real game would use actual positions
    return Array.from(this.resources.values())
      .filter(r => r.loaded)
      .filter(r => Date.now() - r.lastAccessed > 30000) // Not accessed in 30 seconds
      .slice(0, this.config.unloadDistance);
  }

  /**
   * Update access count tracking
   */
  private updateAccessCount(id: string): void {
    const currentCount = this.metrics.accessCounts.get(id) || 0;
    this.metrics.accessCounts.set(id, currentCount + 1);
  }

  /**
   * Update cache hit ratio
   */
  private updateCacheHitRatio(): void {
    const total = this.cacheHits + this.cacheMisses;
    this.metrics.cacheHitRatio = total > 0 ? this.cacheHits / total : 0;
  }

  /**
   * Update average load time
   */
  private updateAverageLoadTime(): void {
    const times = Array.from(this.metrics.loadTimes.values());
    this.metrics.averageLoadTime = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0;
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    setInterval(() => {
      this.metrics.totalMemoryUsage = this.memoryUsage;
      
      if (this.config.enableProfiling) {
        console.log('📊 Performance Metrics:', {
          memoryUsage: `${(this.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
          cacheHitRatio: `${(this.metrics.cacheHitRatio * 100).toFixed(1)}%`,
          averageLoadTime: `${this.metrics.averageLoadTime.toFixed(1)}ms`,
          activeLoads: this.activeLoads.size,
          loadedResources: this.loadedResources.size
        });
      }
    }, 5000);
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        if (memInfo.usedJSHeapSize > this.config.memoryThreshold * 1024 * 1024 * 0.8) {
          console.warn('⚠️ High memory usage detected, triggering cleanup');
          this.triggerMemoryCleanup();
        }
      }, 10000);
    }
  }

  /**
   * Trigger memory cleanup
   */
  private triggerMemoryCleanup(): void {
    const oldResources = Array.from(this.resources.values())
      .filter(r => r.loaded && Date.now() - r.lastAccessed > 60000)
      .sort((a, b) => a.lastAccessed - b.lastAccessed);

    for (const resource of oldResources.slice(0, 10)) {
      this.unloadResource(resource.id);
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get system status
   */
  public getStatus() {
    return {
      totalResources: this.resources.size,
      loadedResources: this.loadedResources.size,
      queuedResources: this.loadQueue.length,
      activeLoads: this.activeLoads.size,
      memoryUsage: `${(this.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      cacheHitRatio: `${(this.metrics.cacheHitRatio * 100).toFixed(1)}%`
    };
  }
}
