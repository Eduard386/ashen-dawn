/**
 * LSP-Compliant Service Base System
 * Demonstrates Liskov Substitution Principle with polymorphic services
 */
/**
 * Service Status Enumeration
 */
export declare enum ServiceStatus {
    UNINITIALIZED = "uninitialized",
    INITIALIZING = "initializing",
    READY = "ready",
    ERROR = "error",
    SHUTDOWN = "shutdown"
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
export declare abstract class ServiceBase {
    protected _status: ServiceStatus;
    protected _config: IServiceConfig;
    protected _initializeTime: Date | null;
    protected _operationCount: number;
    protected _errorCount: number;
    protected _operationTimes: number[];
    protected _lastOperationTime: Date | null;
    constructor(config: IServiceConfig);
    /**
     * Initialize the service
     *
     * LSP Contract:
     * - Precondition: service must not already be initialized
     * - Postcondition: service status is READY or ERROR
     * - Must be idempotent: multiple calls should not cause issues
     */
    initialize(): Promise<void>;
    /**
     * Check if service is ready to handle requests
     *
     * LSP Contract:
     * - Postcondition: returns true only if status is READY
     * - Pure function: no side effects
     */
    isReady(): boolean;
    /**
     * Get current service status
     *
     * LSP Contract:
     * - Postcondition: returns current ServiceStatus
     * - Pure function: no side effects
     */
    getStatus(): ServiceStatus;
    /**
     * Get service configuration
     *
     * LSP Contract:
     * - Postcondition: returns immutable copy of configuration
     * - Pure function: no side effects
     */
    getConfig(): IServiceConfig;
    /**
     * Get service metrics
     *
     * LSP Contract:
     * - Postcondition: returns current service metrics
     * - Pure function: no side effects
     */
    getMetrics(): IServiceMetrics;
    /**
     * Perform health check
     *
     * LSP Contract:
     * - Postcondition: returns current health status
     * - May have side effects for health monitoring
     */
    healthCheck(): Promise<IServiceHealth>;
    /**
     * Shutdown the service
     *
     * LSP Contract:
     * - Postcondition: service status is SHUTDOWN
     * - Must be idempotent: multiple calls should not cause issues
     */
    shutdown(): Promise<void>;
    /**
     * Record operation metrics
     * Protected method for subclasses to track operations
     *
     * LSP Contract:
     * - Updates internal metrics consistently
     */
    protected recordOperation(duration: number, success?: boolean): void;
    /**
     * Execute an operation with automatic metrics tracking
     * Protected method for subclasses to use
     *
     * LSP Contract:
     * - Tracks operation timing and success/failure
     * - Maintains service metrics consistently
     */
    protected executeOperation<T>(operation: () => Promise<T>, operationName: string): Promise<T>;
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
    protected onHealthCheck(): Promise<Partial<IServiceHealth['details']>>;
    /**
     * Virtual method: Check service dependencies
     * Subclasses can override for dependency validation
     */
    protected checkDependencies(): Promise<boolean>;
    /**
     * Virtual method: Check resource availability
     * Subclasses can override for resource validation
     */
    protected checkResources(): Promise<boolean>;
    /**
     * Virtual method: Calculate memory usage
     * Subclasses can override for accurate memory reporting
     */
    protected calculateMemoryUsage(): number;
    /**
     * Generate health message based on details
     * Private method for consistent health reporting
     */
    private getHealthMessage;
}
/**
 * Example: Modern Combat Service Implementation
 * Demonstrates LSP compliance with ServiceBase
 */
export declare class ModernCombatServiceLSP extends ServiceBase {
    private combatInstances;
    private combatRules;
    constructor();
    protected onInitialize(): Promise<void>;
    protected onShutdown(): Promise<void>;
    protected onHealthCheck(): Promise<Partial<IServiceHealth['details']>>;
    protected checkResources(): Promise<boolean>;
    protected calculateMemoryUsage(): number;
    startCombat(combatId: string, participants: any[]): Promise<any>;
    endCombat(combatId: string): Promise<void>;
    getCombatCount(): number;
    private loadCombatRules;
    private initializeCombatEngine;
    private cleanupExpiredCombats;
}
/**
 * Example: Modern Player Service Implementation
 * Demonstrates LSP compliance with ServiceBase
 */
export declare class ModernPlayerServiceLSP extends ServiceBase {
    private players;
    private sessionData;
    constructor();
    protected onInitialize(): Promise<void>;
    protected onShutdown(): Promise<void>;
    protected onHealthCheck(): Promise<Partial<IServiceHealth['details']>>;
    protected checkResources(): Promise<boolean>;
    protected calculateMemoryUsage(): number;
    authenticatePlayer(playerId: string, credentials: any): Promise<any>;
    getPlayerCount(): number;
    getSessionCount(): number;
    private loadPlayerDatabase;
    private initializeSessionManager;
    private saveAllPlayerData;
    private cleanupExpiredSessions;
}
/**
 * Example: Modern Asset Service Implementation
 * Demonstrates LSP compliance with ServiceBase
 */
export declare class ModernAssetServiceLSP extends ServiceBase {
    private loadedAssets;
    private loadingQueue;
    private assetRegistry;
    constructor();
    protected onInitialize(): Promise<void>;
    protected onShutdown(): Promise<void>;
    protected onHealthCheck(): Promise<Partial<IServiceHealth['details']>>;
    protected checkResources(): Promise<boolean>;
    protected calculateMemoryUsage(): number;
    loadAsset(assetId: string): Promise<any>;
    isAssetLoaded(assetId: string): boolean;
    getLoadedAssetCount(): number;
    private getCurrentCacheSize;
    private loadAssetRegistry;
    private preloadCriticalAssets;
}
