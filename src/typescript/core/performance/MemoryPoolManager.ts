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

export class ObjectPool<T extends PoolableObject> {
  private available: T[] = [];
  private active: Set<T> = new Set();
  private factory: () => T;
  private config: PoolConfig;
  private stats: PoolStats;
  
  // Performance tracking
  private creationCount = 0;
  private reuseCount = 0;
  private peakUsage = 0;
  private lastShrinkTime = 0;

  constructor(
    factory: () => T,
    config: Partial<PoolConfig> = {}
  ) {
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
  private initializePool(): void {
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
  public acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
      this.reuseCount++;
      this.stats.totalReused++;
    } else {
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
  public release(obj: T): void {
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
  private createNewObject(): T {
    const obj = this.factory();
    this.creationCount++;
    this.stats.totalCreated++;
    return obj;
  }

  /**
   * Get total pool size
   */
  private getTotalSize(): number {
    return this.available.length + this.active.size;
  }

  /**
   * Update pool statistics
   */
  private updateStats(): void {
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
  private setupAutoShrink(): void {
    setInterval(() => {
      this.considerShrinking();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Consider shrinking the pool if usage is low
   */
  private considerShrinking(): void {
    const now = Date.now();
    if (now - this.lastShrinkTime < 60000) return; // Don't shrink more than once per minute

    const usageRatio = this.active.size / this.getTotalSize();
    
    if (usageRatio < this.config.shrinkThreshold && this.available.length > this.config.initialSize) {
      const targetSize = Math.max(
        this.config.initialSize,
        Math.ceil(this.active.size / this.config.shrinkThreshold)
      );
      
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
  public grow(additionalSize: number): void {
    const newSize = Math.min(
      this.getTotalSize() + additionalSize,
      this.config.maxSize
    );
    
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
  public clear(): void {
    this.available.length = 0;
    console.log('🧹 Pool cleared');
  }

  /**
   * Get pool statistics
   */
  public getStats(): PoolStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Get pool status summary
   */
  public getStatus() {
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
  private pools: Map<string, ObjectPool<any>> = new Map();
  private globalStats = {
    totalPools: 0,
    totalObjects: 0,
    totalMemory: 0
  };

  /**
   * Register a new object pool
   */
  public registerPool<T extends PoolableObject>(
    name: string,
    factory: () => T,
    config?: Partial<PoolConfig>
  ): ObjectPool<T> {
    const pool = new ObjectPool(factory, config);
    this.pools.set(name, pool);
    this.globalStats.totalPools++;
    
    console.log(`🏊 Registered pool: ${name}`);
    return pool;
  }

  /**
   * Get a pool by name
   */
  public getPool<T extends PoolableObject>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name);
  }

  /**
   * Get global statistics
   */
  public getGlobalStats() {
    this.updateGlobalStats();
    return { ...this.globalStats };
  }

  /**
   * Update global statistics
   */
  private updateGlobalStats(): void {
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
  public getAllPoolStatus() {
    const status: Record<string, any> = {};
    
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
  public cleanup(): void {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
    console.log('🧹 All pools cleaned up');
  }
}

// Example poolable objects for common game entities

export class PooledBullet implements PoolableObject {
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public damage = 0;
  public active = false;
  private inUse = false;

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.damage = 0;
    this.active = false;
    this.inUse = false;
  }

  isInUse(): boolean {
    return this.inUse;
  }

  markInUse(): void {
    this.inUse = true;
    this.active = true;
  }

  markAvailable(): void {
    this.inUse = false;
    this.active = false;
  }

  initialize(x: number, y: number, vx: number, vy: number, damage: number): void {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
  }
}

export class PooledParticle implements PoolableObject {
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public life = 0;
  public maxLife = 0;
  public color = '#ffffff';
  public size = 1;
  private inUse = false;

  reset(): void {
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

  isInUse(): boolean {
    return this.inUse;
  }

  markInUse(): void {
    this.inUse = true;
  }

  markAvailable(): void {
    this.inUse = false;
  }

  initialize(x: number, y: number, vx: number, vy: number, life: number, color: string, size: number): void {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
  }

  update(deltaTime: number): boolean {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.life -= deltaTime;
    return this.life > 0;
  }
}

// Global pool manager instance
export const globalPoolManager = new PoolManager();
