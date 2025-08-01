import { IPlayerCharacter, IInventory } from '../../interfaces/IPlayer.js';
import { IHealthManager } from '../../interfaces/IPlayerSegregated.js';
/**
 * Health Manager - Single Responsibility: Player health and medical items
 * Manages player health, healing, and medical item consumption
 */
export declare class HealthManager implements IHealthManager {
    private playerData;
    constructor(playerData: IPlayerCharacter);
    /**
     * Get current health
     */
    getHealth(): number;
    /**
     * Get maximum health
     */
    getMaxHealth(): number;
    /**
     * Update health to specific value
     */
    updateHealth(newHealth: number): void;
    /**
     * Heal player by amount
     */
    heal(amount: number): number;
    /**
     * Deal damage to player
     */
    takeDamage(damage: number): number;
    /**
     * Check if player is dead
     */
    isDead(): boolean;
    /**
     * Get health percentage (0-100)
     */
    getHealthPercentage(): number;
    /**
     * Use medical item and apply healing
     */
    useMedicalItem(itemType: keyof IInventory['med']): boolean;
    /**
     * Check if medical item is available
     */
    hasMedicalItem(itemType: keyof IInventory['med']): boolean;
    /**
     * Get medical item count
     */
    getMedicalItemCount(itemType: keyof IInventory['med']): number;
    /**
     * Get all medical items
     */
    getAllMedicalItems(): IInventory['med'];
    /**
     * Calculate healing amount for medical item
     */
    private getMedicalItemHealingAmount;
    /**
     * Calculate max health based on level and endurance
     * Formula: 15 + (2 * endurance) + (3 * level)
     */
    static calculateMaxHealth(level: number, endurance?: number): number;
    /**
     * Update max health when level changes
     */
    updateMaxHealth(newLevel: number): void;
}
