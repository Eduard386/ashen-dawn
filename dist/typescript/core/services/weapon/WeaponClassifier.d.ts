import { IWeapon } from '../../interfaces/IWeapon.js';
import { AmmoType } from '../../types/GameTypes';
import { WeaponRegistry } from './WeaponRegistry.js';
/**
 * Weapon Classifier - Single Responsibility: Weapon Type Classification
 *
 * Responsible ONLY for:
 * - Classifying weapons by type (ranged/melee)
 * - Weapon characteristic analysis
 * - Type-based categorization
 *
 * NOT responsible for:
 * - Weapon storage/retrieval
 * - Damage calculations
 * - Complex queries
 * - Data conversion
 */
export declare class WeaponClassifier {
    private weaponRegistry;
    private classificationCache;
    private classificationHistory;
    constructor(weaponRegistry: WeaponRegistry);
    /**
     * Check if weapon is ranged
     */
    isRangedWeapon(weaponName: string): boolean;
    /**
     * Check if weapon is melee
     */
    isMeleeWeapon(weaponName: string): boolean;
    /**
     * Check if weapon is automatic (multiple shots per attack)
     */
    isAutomaticWeapon(weaponName: string): boolean;
    /**
     * Check if weapon is single-shot
     */
    isSingleShotWeapon(weaponName: string): boolean;
    /**
     * Check if weapon is explosive
     */
    isExplosiveWeapon(weaponName: string): boolean;
    /**
     * Check if weapon is energy-based
     */
    isEnergyWeapon(weaponName: string): boolean;
    /**
     * Get weapon fire rate category
     */
    getFireRateCategory(weaponName: string): 'very_slow' | 'slow' | 'medium' | 'fast' | 'very_fast' | 'unknown';
    /**
     * Get weapon damage category
     */
    getDamageCategory(weaponName: string): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'unknown';
    /**
     * Get weapon accuracy category based on critical chance
     */
    getAccuracyCategory(weaponName: string): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'unknown';
    /**
     * Get comprehensive weapon classification
     */
    getWeaponClassification(weaponName: string): WeaponClassification;
    /**
     * Get all weapons of a specific classification
     */
    getWeaponsByClassification(filter: Partial<WeaponClassification>): IWeapon[];
    /**
     * Get classification statistics
     */
    getClassificationStats(): {
        totalClassified: number;
        meleeCount: number;
        rangedCount: number;
        automaticCount: number;
        explosiveCount: number;
        energyCount: number;
        fireRateBreakdown: Map<string, number>;
        damageBreakdown: Map<string, number>;
        accuracyBreakdown: Map<string, number>;
        skillBreakdown: Map<string, number>;
        ammoTypeBreakdown: Map<string, number>;
    };
    /**
     * Clear classification cache
     */
    clearCache(): void;
    /**
     * Get classification history
     */
    getClassificationHistory(): Array<{
        weaponName: string;
        classification: WeaponClassification;
        timestamp: number;
    }>;
}
/**
 * Weapon Classification Result Interface
 */
export interface WeaponClassification {
    weaponName: string;
    exists: boolean;
    isMelee: boolean;
    isRanged: boolean;
    isAutomatic: boolean;
    isExplosive: boolean;
    isEnergy: boolean;
    fireRateCategory: 'very_slow' | 'slow' | 'medium' | 'fast' | 'very_fast' | 'unknown';
    damageCategory: 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'unknown';
    accuracyCategory: 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'unknown';
    ammoType: AmmoType | null;
    skillType: string | null;
}
