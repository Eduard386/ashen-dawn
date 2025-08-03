/**
 * LSP-Compliant Service Base System
 * Demonstrates Liskov Substitution Principle with polymorphic services
 */

/**
 * Service Status Enumeration
 */
export enum ServiceStatus {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error',
  SHUTDOWN = 'shutdown'
}

/**
 * Service Configuration Interface
 */
export interface IServiceConfig {
  /** Service identifier */
  readonly id: string;
  
  /** Service name */
  readonly name: string;
  
  /** Service version */
  readonly version: string;
  
  /** Service dependencies */
  readonly dependencies: string[];
  
  /** Service configuration parameters */
  readonly config: Record<string, any>;
}

/**
 * Service Metrics Interface
 */
export interface IServiceMetrics {
  /** Service uptime in milliseconds */
  readonly uptime: number;
  
  /** Number of operations performed */
  readonly operationCount: number;
  
  /** Average operation time in milliseconds */
  readonly averageOperationTime: number;
  
  /** Memory usage in bytes */
  readonly memoryUsage: number;
  
  /** Error count */
  readonly errorCount: number;
  
  /** Last operation timestamp */
  readonly lastOperationTime: Date;
}

/**
 * Service Health Interface
 */
export interface IServiceHealth {
  /** Overall health status */
  readonly status: ServiceStatus;
  
  /** Health check timestamp */
  readonly timestamp: Date;
  
  /** Detailed health information */
  readonly details: {
    readonly canProcessRequests: boolean;
    readonly dependenciesHealthy: boolean;
    readonly resourcesAvailable: boolean;
    readonly errorRate: number;
  };
  
  /** Health check result message */
  readonly message: string;
}

/**
 * Abstract Base Service Class
 * 
 * LSP Contract:
 * - All subclasses must be substitutable for this base class
 * - Methods must honor the same preconditions and postconditions
 * - Initialization and lifecycle contracts must be preserved
 */
export abstract class ServiceBase {
  protected _status: ServiceStatus = ServiceStatus.UNINITIALIZED;
  protected _config: IServiceConfig;
  protected _initializeTime: Date | null = null;
  protected _operationCount: number = 0;
  protected _errorCount: number = 0;
  protected _operationTimes: number[] = [];
  protected _lastOperationTime: Date | null = null;

  constructor(config: IServiceConfig) {
    // Precondition: config must be valid
    if (!config || !config.id || !config.name) {
      throw new Error('Service configuration must include id and name');
    }
    
    this._config = { ...config };
  }

  /**
   * Initialize the service
   * 
   * LSP Contract:
   * - Precondition: service must not already be initialized
   * - Postcondition: service status is READY or ERROR
   * - Must be idempotent: multiple calls should not cause issues
   */
  public async initialize(): Promise<void> {
    // Honor precondition
    if (this._status === ServiceStatus.READY) {
      return; // Idempotent behavior
    }

    if (this._status === ServiceStatus.INITIALIZING) {
      throw new Error('Service is already initializing');
    }

    this._status = ServiceStatus.INITIALIZING;
    this._initializeTime = new Date();

    try {
      // Template method pattern: subclasses implement specific initialization
      await this.onInitialize();
      
      // Ensure postcondition: status must be READY after successful initialization
      this._status = ServiceStatus.READY;
    } catch (error) {
      this._status = ServiceStatus.ERROR;
      this._errorCount++;
      throw error;
    }
  }

  /**
   * Check if service is ready to handle requests
   * 
   * LSP Contract:
   * - Postcondition: returns true only if status is READY
   * - Pure function: no side effects
   */
  public isReady(): boolean {
    return this._status === ServiceStatus.READY;
  }

  /**
   * Get current service status
   * 
   * LSP Contract:
   * - Postcondition: returns current ServiceStatus
   * - Pure function: no side effects
   */
  public getStatus(): ServiceStatus {
    return this._status;
  }

  /**
   * Get service configuration
   * 
   * LSP Contract:
   * - Postcondition: returns immutable copy of configuration
   * - Pure function: no side effects
   */
  public getConfig(): IServiceConfig {
    return { ...this._config };
  }

  /**
   * Get service metrics
   * 
   * LSP Contract:
   * - Postcondition: returns current service metrics
   * - Pure function: no side effects
   */
  public getMetrics(): IServiceMetrics {
    const now = Date.now();
    const uptime = this._initializeTime ? now - this._initializeTime.getTime() : 0;
    const avgTime = this._operationTimes.length > 0 
      ? this._operationTimes.reduce((a, b) => a + b, 0) / this._operationTimes.length 
      : 0;

    return {
      uptime,
      operationCount: this._operationCount,
      averageOperationTime: avgTime,
      memoryUsage: this.calculateMemoryUsage(),
      errorCount: this._errorCount,
      lastOperationTime: this._lastOperationTime || new Date(0)
    };
  }

  /**
   * Perform health check
   * 
   * LSP Contract:
   * - Postcondition: returns current health status
   * - May have side effects for health monitoring
   */
  public async healthCheck(): Promise<IServiceHealth> {
    const timestamp = new Date();
    
    try {
      // Template method: subclasses can implement specific health checks
      const customHealth = await this.onHealthCheck();
      
      const details = {
        canProcessRequests: this.isReady(),
        dependenciesHealthy: await this.checkDependencies(),
        resourcesAvailable: await this.checkResources(),
        errorRate: this._operationCount > 0 ? this._errorCount / this._operationCount : 0,
        ...customHealth
      };

      return {
        status: this._status,
        timestamp,
        details,
        message: this.getHealthMessage(details)
      };
    } catch (error) {
      this._errorCount++;
      return {
        status: ServiceStatus.ERROR,
        timestamp,
        details: {
          canProcessRequests: false,
          dependenciesHealthy: false,
          resourcesAvailable: false,
          errorRate: 1
        },
        message: `Health check failed: ${error}`
      };
    }
  }

  /**
   * Shutdown the service
   * 
   * LSP Contract:
   * - Postcondition: service status is SHUTDOWN
   * - Must be idempotent: multiple calls should not cause issues
   */
  public async shutdown(): Promise<void> {
    if (this._status === ServiceStatus.SHUTDOWN) {
      return; // Idempotent behavior
    }

    try {
      // Template method: subclasses implement specific shutdown logic
      await this.onShutdown();
    } catch (error) {
      this._errorCount++;
      // Continue with shutdown even if cleanup fails
    } finally {
      this._status = ServiceStatus.SHUTDOWN;
    }
  }

  /**
   * Record operation metrics
   * Protected method for subclasses to track operations
   * 
   * LSP Contract:
   * - Updates internal metrics consistently
   */
  protected recordOperation(duration: number, success: boolean = true): void {
    this._operationCount++;
    this._lastOperationTime = new Date();
    
    if (success) {
      this._operationTimes.push(duration);
      
      // Keep only last 100 operation times for memory efficiency
      if (this._operationTimes.length > 100) {
        this._operationTimes.shift();
      }
    } else {
      this._errorCount++;
    }
  }

  /**
   * Execute an operation with automatic metrics tracking
   * Protected method for subclasses to use
   * 
   * LSP Contract:
   * - Tracks operation timing and success/failure
   * - Maintains service metrics consistently
   */
  protected async executeOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    if (!this.isReady()) {
      throw new Error(`Service ${this._config.id} is not ready for operations`);
    }

    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      this.recordOperation(duration, true);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordOperation(duration, false);
      throw error;
    }
  }

  /**
   * Abstract method: Service-specific initialization
   * Subclasses must implement their initialization logic
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * Abstract method: Service-specific shutdown
   * Subclasses must implement their shutdown logic
   */
  protected abstract onShutdown(): Promise<void>;

  /**
   * Virtual method: Service-specific health check
   * Subclasses can override for custom health checks
   */
  protected async onHealthCheck(): Promise<Partial<IServiceHealth['details']>> {
    return {};
  }

  /**
   * Virtual method: Check service dependencies
   * Subclasses can override for dependency validation
   */
  protected async checkDependencies(): Promise<boolean> {
    // Base implementation: assume dependencies are healthy
    return true;
  }

  /**
   * Virtual method: Check resource availability
   * Subclasses can override for resource validation
   */
  protected async checkResources(): Promise<boolean> {
    // Base implementation: assume resources are available
    return true;
  }

  /**
   * Virtual method: Calculate memory usage
   * Subclasses can override for accurate memory reporting
   */
  protected calculateMemoryUsage(): number {
    // Base implementation: estimate based on operation count
    return this._operationCount * 1024; // Rough estimate
  }

  /**
   * Generate health message based on details
   * Private method for consistent health reporting
   */
  private getHealthMessage(details: IServiceHealth['details']): string {
    if (details.canProcessRequests && details.dependenciesHealthy && details.resourcesAvailable) {
      return `Service ${this._config.name} is healthy`;
    }
    
    const issues: string[] = [];
    if (!details.canProcessRequests) issues.push('cannot process requests');
    if (!details.dependenciesHealthy) issues.push('dependencies unhealthy');
    if (!details.resourcesAvailable) issues.push('resources unavailable');
    if (details.errorRate > 0.1) issues.push('high error rate');
    
    return `Service ${this._config.name} has issues: ${issues.join(', ')}`;
  }
}

/**
 * Example: Modern Combat Service Implementation
 * Demonstrates LSP compliance with ServiceBase
 */
export class ModernCombatServiceLSP extends ServiceBase {
  private combatInstances: Map<string, any> = new Map();
  private combatRules: any[] = [];

  constructor() {
    super({
      id: 'combat-service',
      name: 'Modern Combat Service',
      version: '1.0.0',
      dependencies: ['player-service', 'enemy-service'],
      config: {
        maxCombatInstances: 10,
        combatTimeout: 300000, // 5 minutes
      }
    });
  }

  protected async onInitialize(): Promise<void> {
    // Combat service specific initialization
    await this.loadCombatRules();
    await this.initializeCombatEngine();
    
    // Setup periodic cleanup
    setInterval(() => this.cleanupExpiredCombats(), 60000);
  }

  protected async onShutdown(): Promise<void> {
    // Combat service specific shutdown
    this.combatInstances.clear();
    this.combatRules = [];
  }

  protected async onHealthCheck(): Promise<Partial<IServiceHealth['details']>> {
    return {
      canProcessRequests: this.combatInstances.size < this._config.config.maxCombatInstances
    };
  }

  protected async checkResources(): Promise<boolean> {
    // Check if we have capacity for more combat instances
    return this.combatInstances.size < this._config.config.maxCombatInstances;
  }

  protected calculateMemoryUsage(): number {
    // More accurate memory calculation for combat service
    const baseMemory = super.calculateMemoryUsage();
    const combatMemory = this.combatInstances.size * 10240; // 10KB per combat
    const rulesMemory = this.combatRules.length * 1024; // 1KB per rule
    
    return baseMemory + combatMemory + rulesMemory;
  }

  // Combat service specific methods (additional capabilities allowed by LSP)
  public async startCombat(combatId: string, participants: any[]): Promise<any> {
    return this.executeOperation(async () => {
      if (this.combatInstances.has(combatId)) {
        throw new Error(`Combat ${combatId} already exists`);
      }
      
      const combat = {
        id: combatId,
        participants,
        startTime: new Date(),
        status: 'active'
      };
      
      this.combatInstances.set(combatId, combat);
      return combat;
    }, 'startCombat');
  }

  public async endCombat(combatId: string): Promise<void> {
    return this.executeOperation(async () => {
      this.combatInstances.delete(combatId);
    }, 'endCombat');
  }

  public getCombatCount(): number {
    return this.combatInstances.size;
  }

  private async loadCombatRules(): Promise<void> {
    // Simulate loading combat rules
    this.combatRules = [
      { id: 'basic-attack', damage: 'strength * 1.0' },
      { id: 'critical-hit', damage: 'strength * 1.5', chance: 'agility * 0.01' }
    ];
  }

  private async initializeCombatEngine(): Promise<void> {
    // Simulate combat engine initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private cleanupExpiredCombats(): void {
    const now = Date.now();
    const timeout = this._config.config.combatTimeout;
    
    for (const [id, combat] of this.combatInstances.entries()) {
      if (now - combat.startTime.getTime() > timeout) {
        this.combatInstances.delete(id);
      }
    }
  }
}

/**
 * Example: Modern Player Service Implementation
 * Demonstrates LSP compliance with ServiceBase
 */
export class ModernPlayerServiceLSP extends ServiceBase {
  private players: Map<string, any> = new Map();
  private sessionData: Map<string, any> = new Map();

  constructor() {
    super({
      id: 'player-service',
      name: 'Modern Player Service',
      version: '1.0.0',
      dependencies: ['data-service'],
      config: {
        maxPlayers: 1000,
        sessionTimeout: 1800000, // 30 minutes
      }
    });
  }

  protected async onInitialize(): Promise<void> {
    // Player service specific initialization
    await this.loadPlayerDatabase();
    await this.initializeSessionManager();
    
    // Setup session cleanup
    setInterval(() => this.cleanupExpiredSessions(), 300000); // 5 minutes
  }

  protected async onShutdown(): Promise<void> {
    // Player service specific shutdown
    await this.saveAllPlayerData();
    this.players.clear();
    this.sessionData.clear();
  }

  protected async onHealthCheck(): Promise<Partial<IServiceHealth['details']>> {
    return {
      canProcessRequests: this.players.size < this._config.config.maxPlayers
    };
  }

  protected async checkResources(): Promise<boolean> {
    return this.players.size < this._config.config.maxPlayers;
  }

  protected calculateMemoryUsage(): number {
    const baseMemory = super.calculateMemoryUsage();
    const playerMemory = this.players.size * 5120; // 5KB per player
    const sessionMemory = this.sessionData.size * 2048; // 2KB per session
    
    return baseMemory + playerMemory + sessionMemory;
  }

  // Player service specific methods
  public async authenticatePlayer(playerId: string, credentials: any): Promise<any> {
    return this.executeOperation(async () => {
      // Simulate authentication
      const player = this.players.get(playerId);
      if (!player) {
        throw new Error('Player not found');
      }
      
      const sessionId = `session_${Date.now()}_${Math.random()}`;
      this.sessionData.set(sessionId, {
        playerId,
        startTime: new Date(),
        lastActivity: new Date()
      });
      
      return { sessionId, player };
    }, 'authenticatePlayer');
  }

  public getPlayerCount(): number {
    return this.players.size;
  }

  public getSessionCount(): number {
    return this.sessionData.size;
  }

  private async loadPlayerDatabase(): Promise<void> {
    // Simulate loading player data
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async initializeSessionManager(): Promise<void> {
    // Simulate session manager initialization
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async saveAllPlayerData(): Promise<void> {
    // Simulate saving player data
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const timeout = this._config.config.sessionTimeout;
    
    for (const [sessionId, session] of this.sessionData.entries()) {
      if (now - session.lastActivity.getTime() > timeout) {
        this.sessionData.delete(sessionId);
      }
    }
  }
}

/**
 * Example: Modern Asset Service Implementation
 * Demonstrates LSP compliance with ServiceBase
 */
export class ModernAssetServiceLSP extends ServiceBase {
  private loadedAssets: Map<string, any> = new Map();
  private loadingQueue: string[] = [];
  private assetRegistry: Map<string, any> = new Map();

  constructor() {
    super({
      id: 'asset-service',
      name: 'Modern Asset Service',
      version: '1.0.0',
      dependencies: [],
      config: {
        maxCacheSize: 104857600, // 100MB
        preloadCriticalAssets: true
      }
    });
  }

  protected async onInitialize(): Promise<void> {
    // Asset service specific initialization
    await this.loadAssetRegistry();
    
    if (this._config.config.preloadCriticalAssets) {
      await this.preloadCriticalAssets();
    }
  }

  protected async onShutdown(): Promise<void> {
    // Asset service specific shutdown
    this.loadedAssets.clear();
    this.loadingQueue = [];
    this.assetRegistry.clear();
  }

  protected async onHealthCheck(): Promise<Partial<IServiceHealth['details']>> {
    const currentCacheSize = this.getCurrentCacheSize();
    return {
      canProcessRequests: currentCacheSize < this._config.config.maxCacheSize
    };
  }

  protected async checkResources(): Promise<boolean> {
    return this.getCurrentCacheSize() < this._config.config.maxCacheSize;
  }

  protected calculateMemoryUsage(): number {
    return this.getCurrentCacheSize();
  }

  // Asset service specific methods
  public async loadAsset(assetId: string): Promise<any> {
    return this.executeOperation(async () => {
      if (this.loadedAssets.has(assetId)) {
        return this.loadedAssets.get(assetId);
      }
      
      // Simulate asset loading
      const asset = { id: assetId, data: new ArrayBuffer(1024), loadTime: new Date() };
      this.loadedAssets.set(assetId, asset);
      
      return asset;
    }, 'loadAsset');
  }

  public isAssetLoaded(assetId: string): boolean {
    return this.loadedAssets.has(assetId);
  }

  public getLoadedAssetCount(): number {
    return this.loadedAssets.size;
  }

  private getCurrentCacheSize(): number {
    let totalSize = 0;
    for (const asset of this.loadedAssets.values()) {
      totalSize += asset.data.byteLength;
    }
    return totalSize;
  }

  private async loadAssetRegistry(): Promise<void> {
    // Simulate loading asset registry
    this.assetRegistry.set('critical-1', { path: 'assets/critical1.png', size: 2048 });
    this.assetRegistry.set('critical-2', { path: 'assets/critical2.png', size: 1024 });
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async preloadCriticalAssets(): Promise<void> {
    const criticalAssets = Array.from(this.assetRegistry.keys())
      .filter(id => id.startsWith('critical'));
    
    for (const assetId of criticalAssets) {
      // During initialization, we can bypass the ready check
      try {
        const startTime = Date.now();
        const asset = this.assetRegistry.get(assetId);
        if (asset) {
          // Simulate asset loading without the ready check
          await new Promise(resolve => setTimeout(resolve, 10));
          this.loadedAssets.set(assetId, asset);
          
          // Record the operation for metrics
          this.recordOperation(Date.now() - startTime, true);
        }
      } catch (error) {
        // Log error but don't fail initialization
        console.warn(`Failed to preload critical asset ${assetId}:`, error);
      }
    }
  }
}
