import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
/**
 * Legacy Player Converter - Single Responsibility: Legacy format conversion
 * Converts between legacy JavaScript format and modern TypeScript interfaces
 */
export declare class LegacyPlayerConverter {
    /**
     * Convert legacy player data to modern TypeScript format
     */
    convertFromLegacy(legacyData: any): IPlayerCharacter;
    /**
     * Convert modern player data to legacy format
     */
    convertToLegacy(playerData: IPlayerCharacter): any;
    /**
     * Convert legacy skills format to modern interface
     */
    private convertLegacySkills;
    /**
     * Convert legacy inventory format to modern interface
     */
    private convertLegacyInventory;
    /**
     * Convert legacy weapon names to modern format
     */
    private convertWeaponName;
    /**
     * Convert modern weapon names back to legacy format
     */
    private convertWeaponNameToLegacy;
    /**
     * Convert legacy armor names to modern format
     */
    private convertArmorName;
    /**
     * Convert modern armor names back to legacy format
     */
    private convertArmorNameToLegacy;
    /**
     * Calculate max health based on level
     */
    private calculateMaxHealth;
    /**
     * Validate legacy data structure
     */
    validateLegacyData(legacyData: any): boolean;
    /**
     * Get default legacy data structure
     */
    getDefaultLegacyData(): any;
}
