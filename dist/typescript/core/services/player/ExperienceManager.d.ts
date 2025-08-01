import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IExperienceManager } from '../../interfaces/IPlayerSegregated.js';
/**
 * Experience Manager - Single Responsibility: Player experience and leveling
 * Manages experience points, level progression, and level-up logic
 */
export declare class ExperienceManager implements IExperienceManager {
    private playerData;
    constructor(playerData: IPlayerCharacter);
    /**
     * Get current experience
     */
    getExperience(): number;
    /**
     * Get current level
     */
    getCurrentLevel(): number;
    /**
     * Get current level (alias for compatibility)
     */
    getLevel(): number;
    /**
     * Add experience points
     */
    addExperience(amount: number): boolean;
    /**
     * Set experience to specific amount
     */
    setExperience(amount: number): boolean;
    /**
     * Check if player should level up and handle it
     */
    checkForLevelUp(): boolean;
    /**
     * Get experience required for next level
     */
    getExperienceToNextLevel(): number;
    /**
     * Get experience required for specific level
     */
    getRequiredExperience(level: number): number;
    /**
     * Get experience progress to next level (0-1)
     */
    getExperienceProgress(): number;
    /**
     * Check if player can level up
     */
    canLevelUp(): boolean;
    /**
     * Manually trigger level up (for testing or special cases)
     */
    forceLevelUp(): void;
    /**
     * Get maximum achievable level
     */
    getMaxLevel(): number;
    /**
     * Check if player is at max level
     */
    isMaxLevel(): boolean;
    /**
     * Get level-up benefits preview
     */
    getLevelUpBenefits(): {
        newLevel: number;
        healthIncrease: number;
        skillPoints: number;
    };
    /**
     * Private method to handle level up
     */
    private levelUp;
}
