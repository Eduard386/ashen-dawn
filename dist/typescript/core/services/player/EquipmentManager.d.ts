import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IEquipmentManager } from '../../interfaces/IPlayerSegregated.js';
/**
 * Equipment Manager - Single Responsibility: Player equipment management
 * Manages weapons, armor, and equipment switching
 */
export declare class EquipmentManager implements IEquipmentManager {
    private playerData;
    constructor(playerData: IPlayerCharacter);
    /**
     * Get current weapon
     */
    getCurrentWeapon(): string;
    /**
     * Get current armor
     */
    getCurrentArmor(): string;
    /**
     * Get all owned weapons
     */
    getWeapons(): string[];
    /**
     * Switch to different weapon
     */
    switchWeapon(weaponName: string): boolean;
    /**
     * Equip different armor
     */
    equipArmor(armorName: string): void;
    /**
     * Add weapon to inventory
     */
    addWeapon(weaponName: string): void;
    /**
     * Remove weapon from inventory
     */
    removeWeapon(weaponName: string): boolean;
    /**
     * Check if player has specific weapon
     */
    hasWeapon(weaponName: string): boolean;
    /**
     * Get weapon count
     */
    getWeaponCount(): number;
    /**
     * Check if weapon is currently equipped
     */
    isWeaponEquipped(weaponName: string): boolean;
    /**
     * Get next weapon in inventory (for cycling)
     */
    getNextWeapon(): string | null;
    /**
     * Get previous weapon in inventory (for cycling)
     */
    getPreviousWeapon(): string | null;
    /**
     * Cycle to next weapon
     */
    cycleToNextWeapon(): boolean;
    /**
     * Cycle to previous weapon
     */
    cycleToPreviousWeapon(): boolean;
    /**
     * Get equipment summary
     */
    getEquipmentSummary(): {
        currentWeapon: string;
        currentArmor: string;
        weaponCount: number;
        weapons: string[];
    };
    /**
     * Validate equipment state
     */
    validateEquipment(): boolean;
    /**
     * Sort weapons by name
     */
    sortWeapons(): void;
    /**
     * Clear all equipment (for reset scenarios)
     */
    clearEquipment(): void;
}
