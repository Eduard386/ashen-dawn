import { IWeapon } from '../../interfaces/IWeapon.js';
/**
 * Legacy Weapon Converter - Single Responsibility: Legacy Data Conversion
 *
 * Responsible ONLY for:
 * - Converting legacy weapon names to modern format
 * - Handling legacy weapon data structures
 * - Legacy compatibility and migration
 *
 * NOT responsible for:
 * - Weapon storage/retrieval
 * - Damage calculations
 * - Weapon classification
 * - Complex queries
 */
export declare class LegacyWeaponConverter {
    private conversionHistory;
    private legacyNameMap;
    /**
     * Convert legacy weapon name to standardized format
     */
    convertLegacyName(legacyName: string): string;
    /**
     * Convert multiple legacy names at once
     */
    convertLegacyNames(legacyNames: string[]): Map<string, string>;
    /**
     * Check if a name appears to be in legacy format
     */
    isLegacyFormat(weaponName: string): boolean;
    /**
     * Convert legacy weapon data structure to modern format
     */
    convertLegacyWeaponData(legacyData: any): IWeapon | null;
    /**
     * Convert multiple legacy weapon data structures
     */
    convertLegacyWeaponArray(legacyArray: any[]): {
        converted: IWeapon[];
        failed: number;
        errors: string[];
    };
    /**
     * Get reverse mapping (modern to legacy)
     */
    getModernToLegacyName(modernName: string): string | null;
    /**
     * Add custom legacy mapping
     */
    addLegacyMapping(legacyName: string, modernName: string): void;
    /**
     * Remove legacy mapping
     */
    removeLegacyMapping(legacyName: string): boolean;
    /**
     * Get all legacy mappings
     */
    getAllLegacyMappings(): Record<string, string>;
    /**
     * Get conversion statistics
     */
    getConversionStats(): {
        totalConversions: number;
        nameConversions: number;
        dataConversions: number;
        conversionHistory: Array<{
            originalName: string;
            convertedName: string;
            conversionType: 'name' | 'data';
            timestamp: number;
        }>;
        mostConvertedWeapons: Array<{
            name: string;
            count: number;
        }>;
    };
    /**
     * Clear conversion history
     */
    clearConversionHistory(): void;
    /**
     * Automatic name conversion fallback
     */
    private automaticNameConversion;
    /**
     * Convert legacy skill names
     */
    private convertLegacySkill;
    /**
     * Convert legacy ammo types
     */
    private convertLegacyAmmoType;
    /**
     * Convert legacy cooldown values
     */
    private convertLegacyCooldown;
    /**
     * Convert legacy damage structures
     */
    private convertLegacyDamage;
    /**
     * Convert legacy clip size values
     */
    private convertLegacyClipSize;
    /**
     * Validate converted weapon structure
     */
    private validateConvertedWeapon;
    /**
     * Record conversion for statistics
     */
    private recordConversion;
}
