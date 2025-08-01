/**
 * LegacyDataBridge - Single Responsibility: Legacy Format Conversion
 *
 * Handles conversion between modern TypeScript data structures and legacy JavaScript formats.
 * Provides bidirectional data conversion, validation, and compatibility layer.
 *
 * SRP Compliance:
 * ✅ Only handles data format conversion and compatibility
 * ✅ Does not handle game logic or persistence
 * ✅ Focused purely on legacy/modern format translation
 */
export declare class LegacyDataBridge {
    private defaultGameData;
    private conversionRules;
    constructor();
    /**
     * Convert modern data to legacy format
     */
    convertToLegacy(modernData: any): any;
    /**
     * Convert legacy data to modern format
     */
    convertFromLegacy(legacyData: any): any;
    /**
     * Validate legacy data structure
     */
    validateLegacyData(data: any): {
        valid: boolean;
        errors: string[];
        warnings: string[];
    };
    /**
     * Validate modern data structure
     */
    validateModernData(data: any): {
        valid: boolean;
        errors: string[];
        warnings: string[];
    };
    /**
     * Get default legacy data
     */
    getDefaultLegacyData(): any;
    /**
     * Get default modern data
     */
    getDefaultModernData(): any;
    /**
     * Update default data template
     */
    updateDefaultData(newDefaults: any): void;
    /**
     * Add custom conversion rule
     */
    addConversionRule(fieldName: string, converter: (value: any) => any): void;
    /**
     * Remove conversion rule
     */
    removeConversionRule(fieldName: string): boolean;
    /**
     * Get conversion statistics
     */
    getConversionStats(): {
        defaultDataSize: number;
        conversionRulesCount: number;
        availableRules: string[];
    };
    /**
     * Compare legacy and modern data
     */
    compareFormats(legacyData: any, modernData: any): {
        identical: boolean;
        differences: string[];
        legacyOnly: string[];
        modernOnly: string[];
    };
    /**
     * Initialize default game data
     */
    private initializeDefaultData;
    /**
     * Initialize conversion rules
     */
    private initializeConversionRules;
    /**
     * Convert skills object
     */
    private convertSkills;
    /**
     * Convert medical items
     */
    private convertMedicalItems;
    /**
     * Convert ammunition
     */
    private convertAmmunition;
    /**
     * Deep clone an object
     */
    private deepClone;
}
