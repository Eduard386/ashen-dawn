import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
/**
 * Player Data Manager - Single Responsibility: Core player data management
 * Manages the central player data object and provides access to it
 */
export declare class PlayerDataManager {
    private playerData;
    /**
     * Initialize player data
     */
    initializePlayer(playerData: IPlayerCharacter): void;
    /**
     * Get current player data
     */
    getPlayerData(): IPlayerCharacter | null;
    /**
     * Check if player is initialized
     */
    isInitialized(): boolean;
    /**
     * Update player data
     */
    updatePlayerData(updates: Partial<IPlayerCharacter>): void;
    /**
     * Get player ID
     */
    getPlayerId(): string | null;
    /**
     * Get player level
     */
    getPlayerLevel(): number;
    /**
     * Get player health
     */
    getPlayerHealth(): number;
    /**
     * Get player experience
     */
    getPlayerExperience(): number;
    /**
     * Create a deep copy of player data (for saves/backups)
     */
    clonePlayerData(): IPlayerCharacter | null;
    /**
     * Reset player data
     */
    resetPlayerData(): void;
    /**
     * Validate player data structure
     */
    validatePlayerData(): boolean;
    /**
     * Get player statistics summary
     */
    getPlayerSummary(): {
        id: string;
        level: number;
        health: number;
        maxHealth: number;
        experience: number;
        currentWeapon: string;
        currentArmor: string;
    } | null;
}
