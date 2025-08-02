import { IWeapon } from '../../interfaces/IWeapon.js';
import { SkillType, AmmoType } from '../../types/GameTypes.js';
import { WeaponRegistry } from './WeaponRegistry.js';
import { WeaponQueryEngine } from './WeaponQueryEngine.js';
import { WeaponClassifier, WeaponClassification } from './WeaponClassifier.js';
import { WeaponDamageCalculator, DamageComparison, WeaponDamageStats } from './WeaponDamageCalculator.js';
import { LegacyWeaponConverter } from './LegacyWeaponConverter.js';
import { WeaponDatabaseLoader } from './WeaponDatabaseLoader.js';
/**
 * Modern Weapon Service - Single Responsibility: Weapon System Orchestration
 *
 * Responsible ONLY for:
 * - Coordinating weapon system components
 * - Providing unified weapon system interface
 * - Managing component initialization and lifecycle
 *
 * NOT responsible for:
 * - Direct weapon storage (delegated to registry)
 * - Complex queries (delegated to query engine)
 * - Damage calculations (delegated to calculator)
 * - Classification logic (delegated to classifier)
 * - Legacy conversion (delegated to converter)
 * - Data loading (delegated to loader)
 */
export declare class ModernWeaponService {
    private static instance;
    private initialized;
    private weaponRegistry;
    private queryEngine;
    private classifier;
    private damageCalculator;
    private legacyConverter;
    private databaseLoader;
    private constructor();
    static getInstance(): ModernWeaponService;
    /**
     * Initialize the weapon service with default data
     */
    initializeService(): Promise<void>;
    /**
     * Check if service is initialized
     */
    isInitialized(): boolean;
    /**
     * Get weapon by name
     */
    getWeapon(name: string): IWeapon | null;
    /**
     * Get all weapons
     */
    getAllWeapons(): IWeapon[];
    /**
     * Check if weapon exists
     */
    hasWeapon(name: string): boolean;
    /**
     * Register new weapon
     */
    registerWeapon(weapon: IWeapon): void;
    /**
     * Get weapons by skill type
     */
    getWeaponsBySkill(skill: SkillType): IWeapon[];
    /**
     * Get weapons by ammo type
     */
    getWeaponsByAmmoType(ammoType: AmmoType): IWeapon[];
    /**
     * Search weapons by name
     */
    searchWeapons(pattern: string): IWeapon[];
    /**
     * Get top weapons by criteria
     */
    getTopWeapons(count: number, sortBy?: 'damage' | 'critical' | 'speed'): IWeapon[];
    /**
     * Check if weapon is ranged
     */
    isRangedWeapon(weaponName: string): boolean;
    /**
     * Check if weapon is melee
     */
    isMeleeWeapon(weaponName: string): boolean;
    /**
     * Get weapon classification
     */
    getWeaponClassification(weaponName: string): WeaponClassification;
    /**
     * Check if weapon is automatic
     */
    isAutomaticWeapon(weaponName: string): boolean;
    /**
     * Get weapon damage range as string
     */
    getDamageRangeString(weaponName: string): string;
    /**
     * Calculate average damage for weapon
     */
    getAverageDamage(weaponName: string): number;
    /**
     * Calculate damage per second
     */
    getDamagePerSecond(weaponName: string): number;
    /**
     * Compare damage between weapons
     */
    compareDamage(weapon1: string, weapon2: string): DamageComparison;
    /**
     * Get all weapon damage statistics
     */
    getAllWeaponDamageStats(): WeaponDamageStats[];
    /**
     * Convert legacy weapon name to standardized format
     */
    convertLegacyName(legacyName: string): string;
    /**
     * Check if name is in legacy format
     */
    isLegacyFormat(weaponName: string): boolean;
    /**
     * Convert legacy weapon data
     */
    convertLegacyWeaponData(legacyData: any): IWeapon | null;
    /**
     * Get comprehensive system status
     */
    getSystemStatus(): {
        initialized: boolean;
        weaponCount: number;
        components: {
            registry: boolean;
            queryEngine: boolean;
            classifier: boolean;
            damageCalculator: boolean;
            legacyConverter: boolean;
            databaseLoader: boolean;
        };
        statistics: {
            registrationStats: any;
            queryStats: any;
            classificationStats: any;
            calculationStats: any;
            conversionStats: any;
            loadingStats: any;
        };
    };
    /**
     * Validate all components are working correctly
     */
    validateAllComponents(): boolean;
    /**
     * Get individual component instances (for advanced usage)
     */
    getWeaponRegistry(): WeaponRegistry;
    getQueryEngine(): WeaponQueryEngine;
    getClassifier(): WeaponClassifier;
    getDamageCalculator(): WeaponDamageCalculator;
    getLegacyConverter(): LegacyWeaponConverter;
    getDatabaseLoader(): WeaponDatabaseLoader;
    /**
     * Reset the entire weapon system
     */
    resetSystem(): void;
    /**
     * Export weapon system data for backup
     */
    exportSystemData(): {
        weapons: Record<string, IWeapon>;
        statistics: any;
        timestamp: number;
    };
    /**
     * Import weapon system data from backup
     */
    importSystemData(data: {
        weapons: Record<string, IWeapon>;
        statistics?: any;
        timestamp?: number;
    }): {
        imported: number;
        failed: number;
        errors: string[];
    };
}
