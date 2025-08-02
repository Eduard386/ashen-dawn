import { IWeapon } from '../../interfaces/IWeapon.js';
/**
 * Weapon Registry - Single Responsibility: Weapon Storage and Retrieval
 *
 * Responsible ONLY for:
 * - Storing weapon definitions
 * - Retrieving weapons by name
 * - Managing weapon database state
 *
 * NOT responsible for:
 * - Weapon classification logic
 * - Damage calculations
 * - Legacy data conversion
 * - Complex querying/filtering
 */
export declare class WeaponRegistry {
    private weapons;
    private registrationHistory;
    /**
     * Register a weapon in the registry
     */
    registerWeapon(weapon: IWeapon): void;
    /**
     * Register multiple weapons at once
     */
    registerWeapons(weapons: IWeapon[]): void;
    /**
     * Get weapon by name
     */
    getWeapon(name: string): IWeapon | null;
    /**
     * Check if weapon exists in registry
     */
    hasWeapon(name: string): boolean;
    /**
     * Get all weapon names
     */
    getWeaponNames(): string[];
    /**
     * Get all weapons (as copies)
     */
    getAllWeapons(): IWeapon[];
    /**
     * Remove weapon from registry
     */
    removeWeapon(name: string): boolean;
    /**
     * Clear all weapons
     */
    clearWeapons(): void;
    /**
     * Get weapon count
     */
    getWeaponCount(): number;
    /**
     * Validate weapon data structure
     */
    validateWeapon(weapon: IWeapon): boolean;
    /**
     * Get registration statistics
     */
    getRegistrationStats(): {
        totalWeapons: number;
        registrationHistory: Array<{
            name: string;
            timestamp: number;
        }>;
        oldestRegistration: number | null;
        newestRegistration: number | null;
    };
    /**
     * Export weapons for backup/serialization
     */
    exportWeapons(): Record<string, IWeapon>;
    /**
     * Import weapons from backup/serialization
     */
    importWeapons(weaponData: Record<string, IWeapon>): {
        imported: number;
        failed: number;
        errors: string[];
    };
}
