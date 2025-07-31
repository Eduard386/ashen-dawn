import { IPlayerCharacter } from '../interfaces/IPlayer.js';
import { PlayerService } from './PlayerService.js';
import { WeaponService } from './WeaponService.js';
import { EnemyService } from './EnemyService.js';
import { CombatService } from './CombatService.js';
/**
 * Game State Service - Central state management
 * Coordinates between all other services and manages save/load
 */
export declare class GameStateService {
    private static instance;
    private playerService;
    private weaponService;
    private enemyService;
    private combatService;
    private currentScene;
    private gameInitialized;
    private encounterData;
    private constructor();
    static getInstance(): GameStateService;
    /**
     * Initialize game from legacy GameData
     */
    initializeGame(legacyGameData?: any): void;
    /**
     * Get current player
     */
    getPlayer(): IPlayerCharacter | null;
    /**
     * Get player service
     */
    getPlayerService(): PlayerService;
    /**
     * Get weapon service
     */
    getWeaponService(): WeaponService;
    /**
     * Get enemy service
     */
    getEnemyService(): EnemyService;
    /**
     * Get combat service
     */
    getCombatService(): CombatService;
    /**
     * Save game state
     */
    saveGame(): void;
    /**
     * Load game state
     */
    loadGame(): boolean;
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
    private loadGameData;
    private getDefaultGameData;
    /**
     * Set encounter data for battle transitions
     */
    setEncounterData(data: {
        enemyType: string;
        playerLevel: number;
    }): void;
    /**
     * Get encounter data for battle transitions
     */
    getEncounterData(): {
        enemyType: string;
        playerLevel: number;
    } | null;
    /**
     * Clear encounter data after battle
     */
    clearEncounterData(): void;
}
