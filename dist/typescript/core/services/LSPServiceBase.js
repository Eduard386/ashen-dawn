/**
 * LSP-Compliant Service Base System
 * Demonstrates Liskov Substitution Principle with polymorphic services
 */
/**
 * Service Status Enumeration
 */
export var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["UNINITIALIZED"] = "uninitialized";
    ServiceStatus["INITIALIZING"] = "initializing";
    ServiceStatus["READY"] = "ready";
    ServiceStatus["ERROR"] = "error";
    ServiceStatus["SHUTDOWN"] = "shutdown";
})(ServiceStatus || (ServiceStatus = {}));
/**
 * Abstract Base Service Class
 *
 * LSP Contract:
 * - All subclasses must be substitutable for this base class
 * - Methods must honor the same preconditions and postconditions
 * - Initialization and lifecycle contracts must be preserved
 */
export class ServiceBase {
    constructor(config) {
        this._status = ServiceStatus.UNINITIALIZED;
        this._initializeTime = null;
        this._operationCount = 0;
        this._errorCount = 0;
        this._operationTimes = [];
        this._lastOperationTime = null;
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
    async initialize() {
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
        }
        catch (error) {
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
    isReady() {
        return this._status === ServiceStatus.READY;
    }
    /**
     * Get current service status
     *
     * LSP Contract:
     * - Postcondition: returns current ServiceStatus
     * - Pure function: no side effects
     */
    getStatus() {
        return this._status;
    }
    /**
     * Get service configuration
     *
     * LSP Contract:
     * - Postcondition: returns immutable copy of configuration
     * - Pure function: no side effects
     */
    getConfig() {
        return { ...this._config };
    }
    /**
     * Get service metrics
     *
     * LSP Contract:
     * - Postcondition: returns current service metrics
     * - Pure function: no side effects
     */
    getMetrics() {
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
    async healthCheck() {
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
        }
        catch (error) {
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
    async shutdown() {
        if (this._status === ServiceStatus.SHUTDOWN) {
            return; // Idempotent behavior
        }
        try {
            // Template method: subclasses implement specific shutdown logic
            await this.onShutdown();
        }
        catch (error) {
            this._errorCount++;
            // Continue with shutdown even if cleanup fails
        }
        finally {
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
    recordOperation(duration, success = true) {
        this._operationCount++;
        this._lastOperationTime = new Date();
        if (success) {
            this._operationTimes.push(duration);
            // Keep only last 100 operation times for memory efficiency
            if (this._operationTimes.length > 100) {
                this._operationTimes.shift();
            }
        }
        else {
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
    async executeOperation(operation, operationName) {
        if (!this.isReady()) {
            throw new Error(`Service ${this._config.id} is not ready for operations`);
        }
        const startTime = Date.now();
        try {
            const result = await operation();
            const duration = Date.now() - startTime;
            this.recordOperation(duration, true);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.recordOperation(duration, false);
            throw error;
        }
    }
    /**
     * Virtual method: Service-specific health check
     * Subclasses can override for custom health checks
     */
    async onHealthCheck() {
        return {};
    }
    /**
     * Virtual method: Check service dependencies
     * Subclasses can override for dependency validation
     */
    async checkDependencies() {
        // Base implementation: assume dependencies are healthy
        return true;
    }
    /**
     * Virtual method: Check resource availability
     * Subclasses can override for resource validation
     */
    async checkResources() {
        // Base implementation: assume resources are available
        return true;
    }
    /**
     * Virtual method: Calculate memory usage
     * Subclasses can override for accurate memory reporting
     */
    calculateMemoryUsage() {
        // Base implementation: estimate based on operation count
        return this._operationCount * 1024; // Rough estimate
    }
    /**
     * Generate health message based on details
     * Private method for consistent health reporting
     */
    getHealthMessage(details) {
        if (details.canProcessRequests && details.dependenciesHealthy && details.resourcesAvailable) {
            return `Service ${this._config.name} is healthy`;
        }
        const issues = [];
        if (!details.canProcessRequests)
            issues.push('cannot process requests');
        if (!details.dependenciesHealthy)
            issues.push('dependencies unhealthy');
        if (!details.resourcesAvailable)
            issues.push('resources unavailable');
        if (details.errorRate > 0.1)
            issues.push('high error rate');
        return `Service ${this._config.name} has issues: ${issues.join(', ')}`;
    }
}
/**
 * Example: Modern Combat Service Implementation
 * Demonstrates LSP compliance with ServiceBase
 */
export class ModernCombatServiceLSP extends ServiceBase {
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
        this.combatInstances = new Map();
        this.combatRules = [];
    }
    async onInitialize() {
        // Combat service specific initialization
        await this.loadCombatRules();
        await this.initializeCombatEngine();
        // Setup periodic cleanup
        setInterval(() => this.cleanupExpiredCombats(), 60000);
    }
    async onShutdown() {
        // Combat service specific shutdown
        this.combatInstances.clear();
        this.combatRules = [];
    }
    async onHealthCheck() {
        return {
            canProcessRequests: this.combatInstances.size < this._config.config.maxCombatInstances
        };
    }
    async checkResources() {
        // Check if we have capacity for more combat instances
        return this.combatInstances.size < this._config.config.maxCombatInstances;
    }
    calculateMemoryUsage() {
        // More accurate memory calculation for combat service
        const baseMemory = super.calculateMemoryUsage();
        const combatMemory = this.combatInstances.size * 10240; // 10KB per combat
        const rulesMemory = this.combatRules.length * 1024; // 1KB per rule
        return baseMemory + combatMemory + rulesMemory;
    }
    // Combat service specific methods (additional capabilities allowed by LSP)
    async startCombat(combatId, participants) {
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
    async endCombat(combatId) {
        return this.executeOperation(async () => {
            this.combatInstances.delete(combatId);
        }, 'endCombat');
    }
    getCombatCount() {
        return this.combatInstances.size;
    }
    async loadCombatRules() {
        // Simulate loading combat rules
        this.combatRules = [
            { id: 'basic-attack', damage: 'strength * 1.0' },
            { id: 'critical-hit', damage: 'strength * 1.5', chance: 'agility * 0.01' }
        ];
    }
    async initializeCombatEngine() {
        // Simulate combat engine initialization
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    cleanupExpiredCombats() {
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
        this.players = new Map();
        this.sessionData = new Map();
    }
    async onInitialize() {
        // Player service specific initialization
        await this.loadPlayerDatabase();
        await this.initializeSessionManager();
        // Setup session cleanup
        setInterval(() => this.cleanupExpiredSessions(), 300000); // 5 minutes
    }
    async onShutdown() {
        // Player service specific shutdown
        await this.saveAllPlayerData();
        this.players.clear();
        this.sessionData.clear();
    }
    async onHealthCheck() {
        return {
            canProcessRequests: this.players.size < this._config.config.maxPlayers
        };
    }
    async checkResources() {
        return this.players.size < this._config.config.maxPlayers;
    }
    calculateMemoryUsage() {
        const baseMemory = super.calculateMemoryUsage();
        const playerMemory = this.players.size * 5120; // 5KB per player
        const sessionMemory = this.sessionData.size * 2048; // 2KB per session
        return baseMemory + playerMemory + sessionMemory;
    }
    // Player service specific methods
    async authenticatePlayer(playerId, credentials) {
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
    getPlayerCount() {
        return this.players.size;
    }
    getSessionCount() {
        return this.sessionData.size;
    }
    async loadPlayerDatabase() {
        // Simulate loading player data
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    async initializeSessionManager() {
        // Simulate session manager initialization
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    async saveAllPlayerData() {
        // Simulate saving player data
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    cleanupExpiredSessions() {
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
        this.loadedAssets = new Map();
        this.loadingQueue = [];
        this.assetRegistry = new Map();
    }
    async onInitialize() {
        // Asset service specific initialization
        await this.loadAssetRegistry();
        if (this._config.config.preloadCriticalAssets) {
            await this.preloadCriticalAssets();
        }
    }
    async onShutdown() {
        // Asset service specific shutdown
        this.loadedAssets.clear();
        this.loadingQueue = [];
        this.assetRegistry.clear();
    }
    async onHealthCheck() {
        const currentCacheSize = this.getCurrentCacheSize();
        return {
            canProcessRequests: currentCacheSize < this._config.config.maxCacheSize
        };
    }
    async checkResources() {
        return this.getCurrentCacheSize() < this._config.config.maxCacheSize;
    }
    calculateMemoryUsage() {
        return this.getCurrentCacheSize();
    }
    // Asset service specific methods
    async loadAsset(assetId) {
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
    isAssetLoaded(assetId) {
        return this.loadedAssets.has(assetId);
    }
    getLoadedAssetCount() {
        return this.loadedAssets.size;
    }
    getCurrentCacheSize() {
        let totalSize = 0;
        for (const asset of this.loadedAssets.values()) {
            totalSize += asset.data.byteLength;
        }
        return totalSize;
    }
    async loadAssetRegistry() {
        // Simulate loading asset registry
        this.assetRegistry.set('critical-1', { path: 'assets/critical1.png', size: 2048 });
        this.assetRegistry.set('critical-2', { path: 'assets/critical2.png', size: 1024 });
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    async preloadCriticalAssets() {
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
            }
            catch (error) {
                // Log error but don't fail initialization
                console.warn(`Failed to preload critical asset ${assetId}:`, error);
            }
        }
    }
}
//# sourceMappingURL=LSPServiceBase.js.map