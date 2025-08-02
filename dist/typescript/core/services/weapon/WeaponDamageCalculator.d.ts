import { WeaponRegistry } from './WeaponRegistry.js';
/**
 * Damage Calculator - Single Responsibility: Weapon Damage Calculations
 *
 * Responsible ONLY for:
 * - Calculating weapon damage values
 * - Damage range analysis
 * - Damage statistics and comparisons
 *
 * NOT responsible for:
 * - Weapon storage/retrieval
 * - Weapon classification
 * - Complex queries
 * - Data conversion
 */
export declare class WeaponDamageCalculator {
    private weaponRegistry;
    private calculationHistory;
    constructor(weaponRegistry: WeaponRegistry);
    /**
     * Get weapon damage range as string
     */
    getDamageRangeString(weaponName: string): string;
    /**
     * Calculate average damage for weapon
     */
    getAverageDamage(weaponName: string): number;
    /**
     * Calculate minimum damage for weapon
     */
    getMinimumDamage(weaponName: string): number;
    /**
     * Calculate maximum damage for weapon
     */
    getMaximumDamage(weaponName: string): number;
    /**
     * Calculate damage per shot considering multiple shots
     */
    getDamagePerShot(weaponName: string): number;
    /**
     * Calculate damage per second (DPS)
     */
    getDamagePerSecond(weaponName: string): number;
    /**
     * Calculate expected damage with critical hits
     */
    getExpectedDamageWithCriticals(weaponName: string, criticalMultiplier?: number): number;
    /**
     * Calculate damage range (max - min)
     */
    getDamageVariance(weaponName: string): number;
    /**
     * Calculate damage efficiency (damage per cooldown ratio)
     */
    getDamageEfficiency(weaponName: string): number;
    /**
     * Compare damage between two weapons
     */
    compareDamage(weaponName1: string, weaponName2: string): DamageComparison;
    /**
     * Get damage statistics for all weapons
     */
    getAllWeaponDamageStats(): WeaponDamageStats[];
    /**
     * Find weapons with highest damage in category
     */
    getHighestDamageWeapons(count?: number): WeaponDamageStats[];
    /**
     * Find weapons with highest DPS
     */
    getHighestDPSWeapons(count?: number): WeaponDamageStats[];
    /**
     * Find most efficient weapons (best damage per cooldown)
     */
    getMostEfficientWeapons(count?: number): WeaponDamageStats[];
    /**
     * Get calculation statistics
     */
    getCalculationStats(): {
        totalCalculations: number;
        calculationTypeBreakdown: Map<string, number>;
        weaponCalculationCount: Map<string, number>;
        averageCalculationsPerWeapon: number;
        mostCalculatedWeapon: string | null;
    };
    /**
     * Clear calculation history
     */
    clearCalculationHistory(): void;
    /**
     * Record calculation for statistics
     */
    private recordCalculation;
}
/**
 * Damage Comparison Result Interface
 */
export interface DamageComparison {
    weapon1: string;
    weapon2: string;
    valid: boolean;
    avgDamage1: number;
    avgDamage2: number;
    dps1: number;
    dps2: number;
    winner: 'weapon1' | 'weapon2' | 'tie' | 'neither';
    damageDifference: number;
    dpsDifference: number;
}
/**
 * Weapon Damage Statistics Interface
 */
export interface WeaponDamageStats {
    weaponName: string;
    minDamage: number;
    maxDamage: number;
    avgDamage: number;
    damagePerShot: number;
    dps: number;
    damageVariance: number;
    efficiency: number;
    expectedWithCrits: number;
}
