import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { ServiceRegistry } from './ServiceRegistry.js';
import { StatePersistence } from './StatePersistence.js';
import { GameLifecycleManager } from './GameLifecycleManager.js';
import { SceneNavigationManager } from './SceneNavigationManager.js';
import { LegacyDataBridge } from './LegacyDataBridge.js';
import { EncounterManager, EncounterData } from './EncounterManager.js';
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
export declare class ModernGameStateService {
    private static instance;
    private serviceRegistry;
    private statePersistence;
    private lifecycleManager;
    private sceneNavigation;
    private legacyBridge;
    private encounterManager;
    private constructor();
    static getInstance(): ModernGameStateService;
    /**
     * Initialize game from legacy GameData
     */
    initializeGame(legacyGameData?: any): void;
    /**
     * Reset game to default state
     */
    resetGame(): void;
    /**
     * Force reset without reinitializing (for testing)
     */
    forceReset(): void;
    /**
     * Check if game is initialized
     */
    isInitialized(): boolean;
    /**
     * Save game state
     */
    saveGame(): void;
    /**
     * Load game state
     */
    loadGame(): boolean;
    /**
     * Get current player
     */
    getPlayer(): IPlayerCharacter | null;
    /**
     * Get player service
     */
    getPlayerService(): import("../PlayerService.js").PlayerService;
    /**
     * Get weapon service
     */
    getWeaponService(): import("../WeaponService.js").WeaponService;
    /**
     * Get enemy service
     */
    getEnemyService(): import("../EnemyService.js").EnemyService;
    /**
     * Get combat service
     */
    getCombatService(): import("../CombatService.js").CombatService;
    /**
     * Set current scene
     */
    setCurrentScene(sceneName: string): void;
    /**
     * Get current scene
     */
    getCurrentScene(): string;
    /**
     * Bridge method: Get legacy format for compatibility
     */
    getLegacyGameData(): any;
    /**
     * Bridge method: Update from legacy format
     */
    updateFromLegacy(legacyData: any): void;
    /**
     * Set encounter data for battle transitions
     */
    setEncounterData(data: EncounterData): void;
    /**
     * Get encounter data for battle transitions
     */
    getEncounterData(): EncounterData | null;
    /**
     * Clear encounter data after battle
     */
    clearEncounterData(): void;
    /**
     * Get service registry component
     */
    getServiceRegistry(): ServiceRegistry;
    /**
     * Get state persistence component
     */
    getStatePersistence(): StatePersistence;
    /**
     * Get lifecycle manager component
     */
    getLifecycleManager(): GameLifecycleManager;
    /**
     * Get scene navigation component
     */
    getSceneNavigation(): SceneNavigationManager;
    /**
     * Get legacy data bridge component
     */
    getLegacyBridge(): LegacyDataBridge;
    /**
     * Get encounter manager component
     */
    getEncounterManager(): EncounterManager;
    /**
     * Get comprehensive system status
     */
    getSystemStatus(): {
        initialized: boolean;
        currentScene: string;
        hasActiveEncounter: boolean;
        saveDataExists: boolean;
        serviceValidation: any;
        lifecycleStatus: any;
        navigationStatus: any;
        encounterStatus: any;
    };
    /**
     * Validate all components
     */
    validateAllComponents(): {
        valid: boolean;
        componentStatus: {
            serviceRegistry: boolean;
            lifecycle: boolean;
            navigation: boolean;
            persistence: boolean;
        };
        issues: string[];
    };
    /**
     * Setup integration between components
     */
    private setupComponentIntegration;
}
