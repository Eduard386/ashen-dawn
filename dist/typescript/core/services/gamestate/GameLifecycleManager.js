/**
 * GameLifecycleManager - Single Responsibility: Game Initialization and Lifecycle
 *
 * Manages the game initialization process, reset operations, and lifecycle state tracking.
 * Coordinates game startup, shutdown, and reset procedures.
 *
 * SRP Compliance:
 * ✅ Only handles game lifecycle management
 * ✅ Does not handle persistence or service management
 * ✅ Focused purely on initialization, reset, and lifecycle state
 */
export class GameLifecycleManager {
    constructor() {
        this.initialized = false;
        this.initializationTime = null;
        this.initializationCallbacks = [];
        this.shutdownCallbacks = [];
        this.resetCallbacks = [];
        this.currentPhase = 'uninitialized';
        // Empty constructor - initialization happens explicitly
    }
    /**
     * Initialize the game with provided data
     */
    initializeGame(gameData) {
        if (this.initialized) {
            console.warn('Game already initialized');
            return false;
        }
        try {
            this.currentPhase = 'initializing';
            console.log('Starting game initialization...');
            // Execute initialization callbacks
            this.executeCallbacks(this.initializationCallbacks);
            // Mark as initialized
            this.initialized = true;
            this.initializationTime = new Date();
            this.currentPhase = 'ready';
            console.log('Game initialization completed successfully');
            return true;
        }
        catch (error) {
            console.error('Game initialization failed:', error);
            this.currentPhase = 'uninitialized';
            return false;
        }
    }
    /**
     * Reset the game to uninitialized state
     */
    resetGame() {
        try {
            console.log('Starting game reset...');
            this.currentPhase = 'resetting';
            // Execute reset callbacks
            this.executeCallbacks(this.resetCallbacks);
            // Reset state
            this.initialized = false;
            this.initializationTime = null;
            this.currentPhase = 'uninitialized';
            console.log('Game reset completed successfully');
            return true;
        }
        catch (error) {
            console.error('Game reset failed:', error);
            return false;
        }
    }
    /**
     * Perform a forced reset without callbacks
     */
    forceReset() {
        console.log('Performing forced game reset...');
        this.initialized = false;
        this.initializationTime = null;
        this.currentPhase = 'uninitialized';
        console.log('Forced reset completed');
    }
    /**
     * Shutdown the game gracefully
     */
    shutdownGame() {
        try {
            console.log('Starting game shutdown...');
            this.currentPhase = 'shutdown';
            // Execute shutdown callbacks
            this.executeCallbacks(this.shutdownCallbacks);
            // Reset state
            this.initialized = false;
            this.initializationTime = null;
            console.log('Game shutdown completed successfully');
            return true;
        }
        catch (error) {
            console.error('Game shutdown failed:', error);
            return false;
        }
    }
    /**
     * Check if game is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Get current lifecycle phase
     */
    getCurrentPhase() {
        return this.currentPhase;
    }
    /**
     * Get initialization time
     */
    getInitializationTime() {
        return this.initializationTime;
    }
    /**
     * Get uptime since initialization
     */
    getUptime() {
        if (!this.initializationTime) {
            return null;
        }
        return Date.now() - this.initializationTime.getTime();
    }
    /**
     * Register initialization callback
     */
    onInitialization(callback) {
        this.initializationCallbacks.push(callback);
    }
    /**
     * Register shutdown callback
     */
    onShutdown(callback) {
        this.shutdownCallbacks.push(callback);
    }
    /**
     * Register reset callback
     */
    onReset(callback) {
        this.resetCallbacks.push(callback);
    }
    /**
     * Remove initialization callback
     */
    removeInitializationCallback(callback) {
        const index = this.initializationCallbacks.indexOf(callback);
        if (index > -1) {
            this.initializationCallbacks.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Remove shutdown callback
     */
    removeShutdownCallback(callback) {
        const index = this.shutdownCallbacks.indexOf(callback);
        if (index > -1) {
            this.shutdownCallbacks.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Remove reset callback
     */
    removeResetCallback(callback) {
        const index = this.resetCallbacks.indexOf(callback);
        if (index > -1) {
            this.resetCallbacks.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Clear all callbacks
     */
    clearAllCallbacks() {
        this.initializationCallbacks = [];
        this.shutdownCallbacks = [];
        this.resetCallbacks = [];
    }
    /**
     * Get lifecycle statistics
     */
    getLifecycleStats() {
        return {
            initialized: this.initialized,
            currentPhase: this.currentPhase,
            initializationTime: this.initializationTime,
            uptime: this.getUptime(),
            callbackCounts: {
                initialization: this.initializationCallbacks.length,
                shutdown: this.shutdownCallbacks.length,
                reset: this.resetCallbacks.length
            }
        };
    }
    /**
     * Check if game is ready for operations
     */
    isReady() {
        return this.initialized && this.currentPhase === 'ready';
    }
    /**
     * Check if game is in transition state
     */
    isInTransition() {
        return ['initializing', 'resetting', 'shutdown'].includes(this.currentPhase);
    }
    /**
     * Wait for initialization to complete
     */
    async waitForInitialization(timeout = 5000) {
        if (this.isReady()) {
            return true;
        }
        return new Promise((resolve) => {
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (this.isReady()) {
                    clearInterval(checkInterval);
                    resolve(true);
                }
                else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    resolve(false);
                }
            }, 100);
        });
    }
    /**
     * Validate current lifecycle state
     */
    validateLifecycleState() {
        const issues = [];
        // Check for inconsistent state
        if (this.initialized && this.currentPhase === 'uninitialized') {
            issues.push('Initialized flag is true but phase is uninitialized');
        }
        if (!this.initialized && this.currentPhase === 'ready') {
            issues.push('Phase is ready but initialized flag is false');
        }
        if (this.initialized && !this.initializationTime) {
            issues.push('Initialized but no initialization time recorded');
        }
        return {
            valid: issues.length === 0,
            issues,
            phase: this.currentPhase
        };
    }
    // Private helper methods
    /**
     * Execute an array of callbacks safely
     */
    executeCallbacks(callbacks) {
        callbacks.forEach((callback, index) => {
            try {
                callback();
            }
            catch (error) {
                console.error(`Callback ${index} failed:`, error);
            }
        });
    }
}
//# sourceMappingURL=GameLifecycleManager.js.map