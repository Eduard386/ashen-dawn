import { IWeapon } from '../../interfaces/IWeapon.js';
import { SkillType, AmmoType } from '../../types/GameTypes';
import { WeaponRegistry } from './WeaponRegistry.js';
/**
 * Query Engine - Single Responsibility: Weapon Filtering and Search Operations
 *
 * Responsible ONLY for:
 * - Filtering weapons by various criteria
 * - Complex query operations
 * - Search functionality
 *
 * NOT responsible for:
 * - Weapon storage/retrieval
 * - Damage calculations
 * - Weapon classification logic
 * - Data conversion
 */
export declare class WeaponQueryEngine {
    private weaponRegistry;
    private queryHistory;
    constructor(weaponRegistry: WeaponRegistry);
    /**
     * Get weapons by skill type
     */
    getWeaponsBySkill(skill: SkillType): IWeapon[];
    /**
     * Get weapons by ammo type
     */
    getWeaponsByAmmoType(ammoType: AmmoType): IWeapon[];
    /**
     * Get weapons by damage range
     */
    getWeaponsByDamageRange(minDamage: number, maxDamage: number): IWeapon[];
    /**
     * Get weapons by cooldown range
     */
    getWeaponsByCooldownRange(minCooldown: number, maxCooldown: number): IWeapon[];
    /**
     * Get weapons by critical chance range
     */
    getWeaponsByCriticalChance(minCritical: number, maxCritical?: number): IWeapon[];
    /**
     * Get weapons by clip size range
     */
    getWeaponsByClipSize(minClipSize: number, maxClipSize?: number): IWeapon[];
    /**
     * Search weapons by name pattern
     */
    searchWeaponsByName(pattern: string, caseSensitive?: boolean): IWeapon[];
    /**
     * Get weapons matching multiple criteria
     */
    getWeaponsMatchingCriteria(criteria: {
        skills?: SkillType[];
        ammoTypes?: AmmoType[];
        minDamage?: number;
        maxDamage?: number;
        minCooldown?: number;
        maxCooldown?: number;
        minCritical?: number;
        maxCritical?: number;
    }): IWeapon[];
    /**
     * Get weapons sorted by damage (average)
     */
    getWeaponsSortedByDamage(ascending?: boolean): IWeapon[];
    /**
     * Get weapons sorted by cooldown
     */
    getWeaponsSortedByCooldown(ascending?: boolean): IWeapon[];
    /**
     * Get top N weapons by criteria
     */
    getTopWeapons(count: number, sortBy?: 'damage' | 'critical' | 'speed'): IWeapon[];
    /**
     * Get query statistics
     */
    getQueryStats(): {
        totalQueries: number;
        queryTypeBreakdown: Map<string, number>;
        averageResultCount: number;
        mostRecentQuery: any;
        queryHistory: Array<{
            queryType: string;
            parameters: any;
            resultCount: number;
            timestamp: number;
        }>;
    };
    /**
     * Clear query history
     */
    clearQueryHistory(): void;
    /**
     * Record query execution for statistics
     */
    private recordQuery;
}
