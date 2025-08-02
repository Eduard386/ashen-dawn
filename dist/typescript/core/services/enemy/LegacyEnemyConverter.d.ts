import { IEnemyTemplate } from './EnemyTemplateManager';
/**
 * Conversion result with validation info
 */
export interface IConversionResult {
    success: boolean;
    template?: IEnemyTemplate;
    errors: string[];
    warnings: string[];
    originalData?: any;
}
/**
 * LegacyEnemyConverter - Single Responsibility: Legacy Data Format Conversion
 *
 * Converts legacy enemy data structures to modern IEnemyTemplate format.
 * Handles data validation, field mapping, and conversion error reporting.
 *
 * SRP Compliance:
 * ✅ Only handles legacy to modern data format conversion
 * ✅ Does not handle template storage or instance creation
 * ✅ Focused purely on data transformation and validation
 */
export declare class LegacyEnemyConverter {
    private conversionRules;
    private fieldMappings;
    private defaultValues;
    constructor();
    /**
     * Convert legacy enemy data to modern template
     */
    convertToTemplate(legacyData: any): IConversionResult;
    /**
     * Convert multiple legacy enemies
     */
    convertMultiple(legacyDataArray: any[]): IConversionResult[];
    /**
     * Convert back to legacy format (for compatibility)
     */
    convertToLegacy(template: IEnemyTemplate): any;
    /**
     * Add custom conversion rule
     */
    addConversionRule(fieldName: string, converter: (value: any) => any): void;
    /**
     * Remove conversion rule
     */
    removeConversionRule(fieldName: string): boolean;
    /**
     * Add field mapping (legacy field -> modern field)
     */
    addFieldMapping(legacyField: string, modernField: string): void;
    /**
     * Set default value for missing fields
     */
    setDefaultValue(fieldName: string, defaultValue: any): void;
    /**
     * Get conversion statistics
     */
    getConversionStats(results: IConversionResult[]): {
        totalAttempted: number;
        successful: number;
        failed: number;
        successRate: number;
        commonErrors: Map<string, number>;
        commonWarnings: Map<string, number>;
    };
    /**
     * Validate legacy data structure
     */
    validateLegacyData(data: any): string[];
    /**
     * Check if data appears to be legacy format
     */
    isLegacyFormat(data: any): boolean;
    /**
     * Initialize default conversion rules
     */
    private initializeDefaultRules;
    /**
     * Initialize field mappings
     */
    private initializeFieldMappings;
    /**
     * Initialize default values
     */
    private initializeDefaultValues;
    /**
     * Perform the actual conversion
     */
    private performConversion;
    /**
     * Apply custom conversion rules
     */
    private applyConversionRules;
    /**
     * Get nested object value by path
     */
    private getNestedValue;
    /**
     * Set nested object value by path
     */
    private setNestedValue;
    /**
     * Validate converted template
     */
    private validateTemplate;
}
