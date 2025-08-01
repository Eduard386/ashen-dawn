import { ServiceRegistry } from './ServiceRegistry.js';
import { StatePersistence } from './StatePersistence.js';
import { GameLifecycleManager } from './GameLifecycleManager.js';
import { SceneNavigationManager } from './SceneNavigationManager.js';
import { LegacyDataBridge } from './LegacyDataBridge.js';
import { EncounterManager } from './EncounterManager.js';
/**
 * ModernGameStateService - Single Responsibility: Game State Orchestration
 *
 * Orchestrates all game state management components using composition.
 * Provides a unified interface while delegating to specialized SRP-compliant components.
 *
 * SRP Compliance:
 * ✅ Only handles orchestration and coordination
 * ✅ Does not implement specific business logic
 * ✅ Focused purely on composing and coordinating specialized components
 */
export class ModernGameStateService {
    constructor() {
        // Initialize all specialized components
        this.serviceRegistry = new ServiceRegistry();
        this.statePersistence = new StatePersistence();
        this.lifecycleManager = new GameLifecycleManager();
        this.sceneNavigation = new SceneNavigationManager();
        this.legacyBridge = new LegacyDataBridge();
        this.encounterManager = new EncounterManager();
        this.setupComponentIntegration();
    }
    static getInstance() {
        if (!ModernGameStateService.instance) {
            ModernGameStateService.instance = new ModernGameStateService();
        }
        return ModernGameStateService.instance;
    }
    // ======== GAME LIFECYCLE OPERATIONS ========
    /**
     * Initialize game from legacy GameData
     */
    initializeGame(legacyGameData) {
        try {
            // Load from storage if no data provided
            const gameData = legacyGameData || this.statePersistence.loadGameData() || this.legacyBridge.getDefaultLegacyData();
            // Validate and convert legacy data
            const validationResult = this.legacyBridge.validateLegacyData(gameData);
            if (!validationResult.valid) {
                console.warn('Invalid legacy data, using defaults:', validationResult.errors);
            }
            // Initialize lifecycle
            this.lifecycleManager.initializeGame(gameData);
            // Initialize player through service registry
            const playerService = this.serviceRegistry.getPlayerService();
            playerService.initializeFromLegacy(gameData);
            console.log('Game initialized with TypeScript services');
        }
        catch (error) {
            console.error('Game initialization failed:', error);
            throw error;
        }
    }
    /**
     * Reset game to default state
     */
    resetGame() {
        // Clear all persistent data
        this.statePersistence.deleteSaveData();
        // Reset lifecycle
        this.lifecycleManager.resetGame();
        // Reinitialize with defaults
        this.initializeGame(this.legacyBridge.getDefaultLegacyData());
        console.log('Game reset to default state');
    }
    /**
     * Force reset without reinitializing (for testing)
     */
    forceReset() {
        this.statePersistence.clearAllData();
        this.lifecycleManager.forceReset();
        this.serviceRegistry.reinitialize();
        this.sceneNavigation.resetNavigation();
        this.encounterManager.clearEncounterData();
    }
    /**
     * Check if game is initialized
     */
    isInitialized() {
        return this.lifecycleManager.isInitialized();
    }
    // ======== SAVE/LOAD OPERATIONS ========
    /**
     * Save game state
     */
    saveGame() {
        const player = this.getPlayer();
        if (!player) {
            console.error('Cannot save game: no player data');
            return;
        }
        // Convert to legacy format for compatibility
        const playerService = this.serviceRegistry.getPlayerService();
        const legacyData = playerService.toLegacyFormat();
        if (legacyData) {
            const success = this.statePersistence.saveGameData(legacyData);
            if (success) {
                console.log('Game saved successfully');
            }
        }
    }
    /**
     * Load game state
     */
    loadGame() {
        try {
            const savedData = this.statePersistence.loadGameData();
            if (savedData) {
                const playerService = this.serviceRegistry.getPlayerService();
                playerService.initializeFromLegacy(savedData);
                console.log('Game loaded successfully');
                return true;
            }
        }
        catch (error) {
            console.error('Failed to load game:', error);
        }
        return false;
    }
    // ======== SERVICE ACCESS ========
    /**
     * Get current player
     */
    getPlayer() {
        const playerService = this.serviceRegistry.getPlayerService();
        return playerService.getPlayer();
    }
    /**
     * Get player service
     */
    getPlayerService() {
        return this.serviceRegistry.getPlayerService();
    }
    /**
     * Get weapon service
     */
    getWeaponService() {
        return this.serviceRegistry.getWeaponService();
    }
    /**
     * Get enemy service
     */
    getEnemyService() {
        return this.serviceRegistry.getEnemyService();
    }
    /**
     * Get combat service
     */
    getCombatService() {
        return this.serviceRegistry.getCombatService();
    }
    // ======== SCENE NAVIGATION ========
    /**
     * Set current scene
     */
    setCurrentScene(sceneName) {
        this.sceneNavigation.setCurrentScene(sceneName);
    }
    /**
     * Get current scene
     */
    getCurrentScene() {
        return this.sceneNavigation.getCurrentScene();
    }
    // ======== LEGACY COMPATIBILITY ========
    /**
     * Bridge method: Get legacy format for compatibility
     */
    getLegacyGameData() {
        const playerService = this.serviceRegistry.getPlayerService();
        return playerService.toLegacyFormat();
    }
    /**
     * Bridge method: Update from legacy format
     */
    updateFromLegacy(legacyData) {
        const playerService = this.serviceRegistry.getPlayerService();
        playerService.initializeFromLegacy(legacyData);
    }
    // ======== ENCOUNTER MANAGEMENT ========
    /**
     * Set encounter data for battle transitions
     */
    setEncounterData(data) {
        this.encounterManager.setEncounterData(data);
    }
    /**
     * Get encounter data for battle transitions
     */
    getEncounterData() {
        return this.encounterManager.getEncounterData();
    }
    /**
     * Clear encounter data after battle
     */
    clearEncounterData() {
        this.encounterManager.clearEncounterData();
    }
    // ======== COMPONENT ACCESS FOR ADVANCED USAGE ========
    /**
     * Get service registry component
     */
    getServiceRegistry() {
        return this.serviceRegistry;
    }
    /**
     * Get state persistence component
     */
    getStatePersistence() {
        return this.statePersistence;
    }
    /**
     * Get lifecycle manager component
     */
    getLifecycleManager() {
        return this.lifecycleManager;
    }
    /**
     * Get scene navigation component
     */
    getSceneNavigation() {
        return this.sceneNavigation;
    }
    /**
     * Get legacy data bridge component
     */
    getLegacyBridge() {
        return this.legacyBridge;
    }
    /**
     * Get encounter manager component
     */
    getEncounterManager() {
        return this.encounterManager;
    }
    // ======== SYSTEM DIAGNOSTICS ========
    /**
     * Get comprehensive system status
     */
    getSystemStatus() {
        return {
            initialized: this.isInitialized(),
            currentScene: this.getCurrentScene(),
            hasActiveEncounter: this.encounterManager.hasActiveEncounter(),
            saveDataExists: this.statePersistence.hasSaveData(),
            serviceValidation: this.serviceRegistry.validateServices(),
            lifecycleStatus: this.lifecycleManager.getLifecycleStats(),
            navigationStatus: this.sceneNavigation.getNavigationStats(),
            encounterStatus: this.encounterManager.getEncounterStats()
        };
    }
    /**
     * Validate all components
     */
    validateAllComponents() {
        const issues = [];
        const componentStatus = {
            serviceRegistry: true,
            lifecycle: true,
            navigation: true,
            persistence: true
        };
        // Validate service registry
        const serviceValidation = this.serviceRegistry.validateServices();
        if (!serviceValidation.valid) {
            componentStatus.serviceRegistry = false;
            issues.push(`Service Registry: ${serviceValidation.missing.join(', ')}`);
        }
        // Validate lifecycle state
        const lifecycleValidation = this.lifecycleManager.validateLifecycleState();
        if (!lifecycleValidation.valid) {
            componentStatus.lifecycle = false;
            issues.push(`Lifecycle: ${lifecycleValidation.issues.join(', ')}`);
        }
        // Validate navigation state
        const navigationValidation = this.sceneNavigation.validateNavigationState();
        if (!navigationValidation.valid) {
            componentStatus.navigation = false;
            issues.push(`Navigation: ${navigationValidation.issues.join(', ')}`);
        }
        // Check persistence functionality
        try {
            this.statePersistence.getSaveDataInfo();
        }
        catch (error) {
            componentStatus.persistence = false;
            issues.push(`Persistence: ${error}`);
        }
        return {
            valid: issues.length === 0,
            componentStatus,
            issues
        };
    }
    // ======== PRIVATE SETUP METHODS ========
    /**
     * Setup integration between components
     */
    setupComponentIntegration() {
        // Set up lifecycle callbacks
        this.lifecycleManager.onInitialization(() => {
            console.log('Game lifecycle: Initialization callback executed');
        });
        this.lifecycleManager.onReset(() => {
            this.sceneNavigation.resetNavigation();
            this.encounterManager.clearEncounterData();
            console.log('Game lifecycle: Reset callback executed');
        });
        // Set up scene transition callbacks
        this.sceneNavigation.onSceneTransition('before', (fromScene, toScene) => {
            console.log(`Scene transition: ${fromScene} -> ${toScene}`);
        });
        // Set up encounter callbacks
        this.encounterManager.onEncounter('before', (encounter) => {
            console.log(`Encounter starting: ${encounter.enemyType} (Level ${encounter.playerLevel})`);
        });
        this.encounterManager.onEncounter('after', (encounter) => {
            console.log(`Encounter completed: ${encounter.enemyType}`);
        });
    }
}
//# sourceMappingURL=ModernGameStateService.js.map