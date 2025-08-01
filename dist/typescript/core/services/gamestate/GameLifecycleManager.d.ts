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
export declare class GameLifecycleManager {
    private initialized;
    private initializationTime;
    private initializationCallbacks;
    private shutdownCallbacks;
    private resetCallbacks;
    private currentPhase;
    constructor();
    /**
     * Initialize the game with provided data
     */
    initializeGame(gameData?: any): boolean;
    /**
     * Reset the game to uninitialized state
     */
    resetGame(): boolean;
    /**
     * Perform a forced reset without callbacks
     */
    forceReset(): void;
    /**
     * Shutdown the game gracefully
     */
    shutdownGame(): boolean;
    /**
     * Check if game is initialized
     */
    isInitialized(): boolean;
    /**
     * Get current lifecycle phase
     */
    getCurrentPhase(): string;
    /**
     * Get initialization time
     */
    getInitializationTime(): Date | null;
    /**
     * Get uptime since initialization
     */
    getUptime(): number | null;
    /**
     * Register initialization callback
     */
    onInitialization(callback: () => void): void;
    /**
     * Register shutdown callback
     */
    onShutdown(callback: () => void): void;
    /**
     * Register reset callback
     */
    onReset(callback: () => void): void;
    /**
     * Remove initialization callback
     */
    removeInitializationCallback(callback: () => void): boolean;
    /**
     * Remove shutdown callback
     */
    removeShutdownCallback(callback: () => void): boolean;
    /**
     * Remove reset callback
     */
    removeResetCallback(callback: () => void): boolean;
    /**
     * Clear all callbacks
     */
    clearAllCallbacks(): void;
    /**
     * Get lifecycle statistics
     */
    getLifecycleStats(): {
        initialized: boolean;
        currentPhase: string;
        initializationTime: Date | null;
        uptime: number | null;
        callbackCounts: {
            initialization: number;
            shutdown: number;
            reset: number;
        };
    };
    /**
     * Check if game is ready for operations
     */
    isReady(): boolean;
    /**
     * Check if game is in transition state
     */
    isInTransition(): boolean;
    /**
     * Wait for initialization to complete
     */
    waitForInitialization(timeout?: number): Promise<boolean>;
    /**
     * Validate current lifecycle state
     */
    validateLifecycleState(): {
        valid: boolean;
        issues: string[];
        phase: string;
    };
    /**
     * Execute an array of callbacks safely
     */
    private executeCallbacks;
}
