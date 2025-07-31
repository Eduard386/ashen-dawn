import { IWeapon } from '../interfaces/IWeapon.js';
import { SkillType, AmmoType } from '../types/GameTypes';
/**
 * Weapon Service - Manages weapon data and operations
 * Provides centralized weapon definitions and utility functions
 */
export declare class WeaponService {
    private static instance;
    private weapons;
    private constructor();
    static getInstance(): WeaponService;
    /**
     * Get weapon by name
     */
    getWeapon(name: string): IWeapon | null;
    /**
     * Get all weapons
     */
    getAllWeapons(): IWeapon[];
    /**
     * Get weapons by skill type
     */
    getWeaponsBySkill(skill: SkillType): IWeapon[];
    /**
     * Get weapons by ammo type
     */
    getWeaponsByAmmoType(ammoType: AmmoType): IWeapon[];
    /**
     * Check if weapon is ranged
     */
    isRangedWeapon(weaponName: string): boolean;
    /**
     * Check if weapon is melee
     */
    isMeleeWeapon(weaponName: string): boolean;
    /**
     * Get weapon damage range as string
     */
    getDamageRangeString(weaponName: string): string;
    /**
     * Calculate average damage for weapon
     */
    getAverageDamage(weaponName: string): number;
    /**
     * Convert legacy weapon name to standardized format
     */
    convertLegacyName(legacyName: string): string;
    /**
     * Initialize weapon database
     */
    private initializeWeapons;
}
