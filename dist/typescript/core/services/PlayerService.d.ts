import { IPlayerCharacter, IInventory } from '../interfaces/IPlayer.js';
/**
 * Player Service - Manages player character data and operations
 * Bridges between legacy JavaScript GameData and new TypeScript interfaces
 */
export declare class PlayerService {
    private static instance;
    private playerData;
    private constructor();
    static getInstance(): PlayerService;
    /**
     * Initialize player from legacy GameData format
     */
    initializeFromLegacy(legacyData: any): IPlayerCharacter;
    /**
     * Get current player data
     */
    getPlayer(): IPlayerCharacter | null;
    /**
     * Update player health
     */
    updateHealth(newHealth: number): void;
    /**
     * Add experience and handle level up
     */
    addExperience(experience: number): boolean;
    /**
     * Use medical item
     */
    useMedicalItem(itemType: keyof IInventory['med']): boolean;
    /**
     * Add weapon to inventory
     */
    addWeapon(weaponName: string): void;
    /**
     * Switch current weapon
     */
    switchWeapon(weaponName: string): boolean;
    /**
     * Add ammo to inventory
     */
    addAmmo(ammoType: keyof IInventory['ammo'], amount: number): void;
    /**
     * Use ammo from inventory
     */
    useAmmo(ammoType: keyof IInventory['ammo'], amount: number): boolean;
    /**
     * Convert legacy GameData back to legacy format for saving
     */
    toLegacyFormat(): any;
    private calculateMaxHealth;
    private convertLegacySkills;
    private convertLegacyInventory;
    private convertWeaponName;
    private convertArmorName;
    private getRequiredExperience;
    private levelUp;
}
