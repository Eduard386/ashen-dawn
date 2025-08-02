import { IWeapon } from '../../interfaces/IWeapon.js';
import { WeaponRegistry } from './WeaponRegistry.js';
/**
 * Weapon Database Loader - Single Responsibility: Weapon Data Initialization
 *
 * Responsible ONLY for:
 * - Loading default weapon definitions
 * - Initializing weapon database
 * - Managing weapon data sources
 *
 * NOT responsible for:
 * - Weapon storage/retrieval (handled by registry)
 * - Damage calculations
 * - Weapon classification
 * - Complex queries
 */
export declare class WeaponDatabaseLoader {
    private weaponRegistry;
    private loadingHistory;
    constructor(weaponRegistry: WeaponRegistry);
    /**
     * Load default weapon database
     */
    loadDefaultWeapons(): {
        loaded: number;
        failed: number;
        errors: string[];
    };
    /**
     * Load weapons from array
     */
    loadWeaponArray(weapons: IWeapon[], source?: string): {
        loaded: number;
        failed: number;
        errors: string[];
    };
    /**
     * Load weapons from JSON data
     */
    loadWeaponsFromJSON(jsonData: string, source?: string): {
        loaded: number;
        failed: number;
        errors: string[];
    };
    /**
     * Load weapons from object map
     */
    loadWeaponsFromMap(weaponMap: Record<string, IWeapon>, source?: string): {
        loaded: number;
        failed: number;
        errors: string[];
    };
    /**
     * Reload default weapons (clear and reload)
     */
    reloadDefaultWeapons(): {
        loaded: number;
        failed: number;
        errors: string[];
    };
    /**
     * Get loading statistics
     */
    getLoadingStats(): {
        totalLoadOperations: number;
        totalWeaponsLoaded: number;
        loadingHistory: Array<{
            loadType: string;
            weaponCount: number;
            timestamp: number;
            source: string;
        }>;
        sourceBreakdown: Map<string, number>;
        averageWeaponsPerLoad: number;
        lastLoadOperation: any;
    };
    /**
     * Clear loading history
     */
    clearLoadingHistory(): void;
    /**
     * Get default weapon data definitions
     */
    private getDefaultWeaponData;
    /**
     * Record loading operation for statistics
     */
    private recordLoading;
}
