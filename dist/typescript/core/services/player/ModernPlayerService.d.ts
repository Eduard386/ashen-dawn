import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { HealthManager } from './HealthManager.js';
import { ExperienceManager } from './ExperienceManager.js';
import { EquipmentManager } from './EquipmentManager.js';
import { LegacyPlayerConverter } from './LegacyPlayerConverter.js';
/**
 * Modern Player Service - Orchestrates player-related managers
 * Uses composition and delegation to separate concerns following SRP
 */
export declare class ModernPlayerService {
    private static instance;
    private dataManager;
    private healthManager;
    private experienceManager;
    private equipmentManager;
    private legacyConverter;
    private constructor();
    static getInstance(): ModernPlayerService;
    /**
     * Initialize player from legacy data
     */
    initializeFromLegacy(legacyData?: any): IPlayerCharacter;
    /**
     * Get current player data
     */
    getPlayer(): IPlayerCharacter | null;
    /**
     * Get health manager
     */
    getHealthManager(): HealthManager;
    /**
     * Get experience manager
     */
    getExperienceManager(): ExperienceManager;
    /**
     * Get equipment manager
     */
    getEquipmentManager(): EquipmentManager;
    /**
     * Get legacy converter
     */
    getLegacyConverter(): LegacyPlayerConverter;
    /**
     * Update player health (delegates to HealthManager)
     */
    updateHealth(newHealth: number): void;
    /**
     * Add experience (delegates to ExperienceManager)
     */
    addExperience(experience: number): boolean;
    /**
     * Use medical item (delegates to HealthManager)
     */
    useMedicalItem(itemType: keyof IPlayerCharacter['inventory']['med']): boolean;
    /**
     * Switch weapon (delegates to EquipmentManager)
     */
    switchWeapon(weaponName: string): boolean;
    /**
     * Add weapon (delegates to EquipmentManager)
     */
    addWeapon(weaponName: string): void;
    /**
     * Add ammo to inventory
     */
    addAmmo(ammoType: keyof IPlayerCharacter['inventory']['ammo'], amount: number): void;
    /**
     * Use ammo from inventory
     */
    useAmmo(ammoType: keyof IPlayerCharacter['inventory']['ammo'], amount: number): boolean;
    /**
     * Convert to legacy format for saving/compatibility
     */
    toLegacyFormat(): any | null;
    /**
     * Check if player is initialized
     */
    isInitialized(): boolean;
    /**
     * Reset player service
     */
    reset(): void;
    /**
     * Get comprehensive player status
     */
    getPlayerStatus(): {
        isAlive: boolean;
        health: number;
        maxHealth: number;
        level: number;
        experience: number;
        experienceToNext: number;
        currentWeapon: string;
        currentArmor: string;
    } | null;
}
