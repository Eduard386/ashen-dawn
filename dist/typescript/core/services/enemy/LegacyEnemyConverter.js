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
export class LegacyEnemyConverter {
    constructor() {
        this.conversionRules = new Map();
        this.fieldMappings = new Map();
        this.defaultValues = new Map();
        this.initializeDefaultRules();
        this.initializeFieldMappings();
        this.initializeDefaultValues();
    }
    /**
     * Convert legacy enemy data to modern template
     */
    convertToTemplate(legacyData) {
        const result = {
            success: false,
            errors: [],
            warnings: [],
            originalData: legacyData
        };
        try {
            // Validate input data
            const validationErrors = this.validateLegacyData(legacyData);
            if (validationErrors.length > 0) {
                result.errors = validationErrors;
                return result;
            }
            // Perform conversion
            const template = this.performConversion(legacyData, result);
            // Final validation
            if (template && this.validateTemplate(template)) {
                result.success = true;
                result.template = template;
            }
            else {
                result.errors.push('Converted template failed validation');
            }
        }
        catch (error) {
            result.errors.push(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        return result;
    }
    /**
     * Convert multiple legacy enemies
     */
    convertMultiple(legacyDataArray) {
        return legacyDataArray.map(data => this.convertToTemplate(data));
    }
    /**
     * Convert back to legacy format (for compatibility)
     */
    convertToLegacy(template) {
        return {
            name: template.name,
            type: template.type,
            maxLevel: template.maxLevel,
            defence: {
                health: template.defence.health,
                ac: template.defence.armorClass,
                threshold: template.defence.damageThreshold,
                resistance: template.defence.damageResistance
            },
            attack: {
                hit_chance: template.attack.hitChance,
                weapon: template.attack.weapon,
                damage: {
                    min: template.attack.damage.min,
                    max: template.attack.damage.max
                },
                shots: template.attack.shots
            },
            amount: {
                min: template.spawning.min,
                max: template.spawning.max
            },
            experience: template.experienceReward,
            title: template.sprites
        };
    }
    /**
     * Add custom conversion rule
     */
    addConversionRule(fieldName, converter) {
        this.conversionRules.set(fieldName, converter);
    }
    /**
     * Remove conversion rule
     */
    removeConversionRule(fieldName) {
        return this.conversionRules.delete(fieldName);
    }
    /**
     * Add field mapping (legacy field -> modern field)
     */
    addFieldMapping(legacyField, modernField) {
        this.fieldMappings.set(legacyField, modernField);
    }
    /**
     * Set default value for missing fields
     */
    setDefaultValue(fieldName, defaultValue) {
        this.defaultValues.set(fieldName, defaultValue);
    }
    /**
     * Get conversion statistics
     */
    getConversionStats(results) {
        const successful = results.filter(r => r.success);
        const commonErrors = new Map();
        const commonWarnings = new Map();
        results.forEach(result => {
            result.errors.forEach(error => {
                const count = commonErrors.get(error) || 0;
                commonErrors.set(error, count + 1);
            });
            result.warnings.forEach(warning => {
                const count = commonWarnings.get(warning) || 0;
                commonWarnings.set(warning, count + 1);
            });
        });
        return {
            totalAttempted: results.length,
            successful: successful.length,
            failed: results.length - successful.length,
            successRate: results.length > 0 ? successful.length / results.length : 0,
            commonErrors,
            commonWarnings
        };
    }
    /**
     * Validate legacy data structure
     */
    validateLegacyData(data) {
        const errors = [];
        if (!data || typeof data !== 'object') {
            errors.push('Data must be an object');
            return errors;
        }
        // Required fields
        if (!data.name || typeof data.name !== 'string') {
            errors.push('Missing or invalid name field');
        }
        if (!data.type || typeof data.type !== 'string') {
            errors.push('Missing or invalid type field');
        }
        if (typeof data.maxLevel !== 'number' || data.maxLevel < 1) {
            errors.push('Missing or invalid maxLevel field');
        }
        // Defence validation
        if (!data.defence || typeof data.defence !== 'object') {
            errors.push('Missing or invalid defence object');
        }
        else {
            if (typeof data.defence.health !== 'number' || data.defence.health <= 0) {
                errors.push('Invalid defence.health value');
            }
            if (typeof data.defence.ac !== 'number') {
                errors.push('Invalid defence.ac value');
            }
        }
        // Attack validation
        if (!data.attack || typeof data.attack !== 'object') {
            errors.push('Missing or invalid attack object');
        }
        else {
            if (typeof data.attack.hit_chance !== 'number' || data.attack.hit_chance < 0) {
                errors.push('Invalid attack.hit_chance value');
            }
            if (!data.attack.damage || typeof data.attack.damage !== 'object') {
                errors.push('Missing or invalid attack.damage object');
            }
            else {
                if (typeof data.attack.damage.min !== 'number' || typeof data.attack.damage.max !== 'number') {
                    errors.push('Invalid damage min/max values');
                }
                if (data.attack.damage.min > data.attack.damage.max) {
                    errors.push('Damage min cannot be greater than max');
                }
            }
        }
        // Amount validation
        if (!data.amount || typeof data.amount !== 'object') {
            errors.push('Missing or invalid amount object');
        }
        else {
            if (typeof data.amount.min !== 'number' || typeof data.amount.max !== 'number') {
                errors.push('Invalid amount min/max values');
            }
            if (data.amount.min > data.amount.max || data.amount.min < 1) {
                errors.push('Invalid amount range');
            }
        }
        return errors;
    }
    /**
     * Check if data appears to be legacy format
     */
    isLegacyFormat(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        // Check for legacy-specific fields
        const legacyIndicators = [
            'defence.ac', // Legacy uses 'ac' instead of 'armorClass'
            'attack.hit_chance', // Legacy uses 'hit_chance' instead of 'hitChance'
            'amount', // Legacy uses 'amount' instead of 'spawning'
            'title' // Legacy uses 'title' instead of 'sprites'
        ];
        return legacyIndicators.some(indicator => {
            const parts = indicator.split('.');
            let current = data;
            for (const part of parts) {
                if (current && typeof current === 'object' && part in current) {
                    current = current[part];
                }
                else {
                    return false;
                }
            }
            return true;
        });
    }
    // Private helper methods
    /**
     * Initialize default conversion rules
     */
    initializeDefaultRules() {
        // AC -> armorClass conversion
        this.conversionRules.set('defence.ac', (value) => {
            return typeof value === 'number' ? value : 0;
        });
        // hit_chance -> hitChance conversion
        this.conversionRules.set('attack.hit_chance', (value) => {
            return typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 50;
        });
        // title -> sprites conversion
        this.conversionRules.set('title', (value) => {
            if (Array.isArray(value)) {
                return value.filter(item => typeof item === 'string');
            }
            return typeof value === 'string' ? [value] : [];
        });
        // amount -> spawning conversion
        this.conversionRules.set('amount', (value) => {
            if (value && typeof value === 'object' &&
                typeof value.min === 'number' && typeof value.max === 'number') {
                return { min: Math.max(1, value.min), max: Math.max(value.min, value.max) };
            }
            return { min: 1, max: 1 };
        });
    }
    /**
     * Initialize field mappings
     */
    initializeFieldMappings() {
        this.fieldMappings.set('defence.ac', 'defence.armorClass');
        this.fieldMappings.set('attack.hit_chance', 'attack.hitChance');
        this.fieldMappings.set('title', 'sprites');
        this.fieldMappings.set('amount', 'spawning');
    }
    /**
     * Initialize default values
     */
    initializeDefaultValues() {
        this.defaultValues.set('experienceReward', 15);
        this.defaultValues.set('attack.attackSpeed', 1.0);
        this.defaultValues.set('attack.criticalChance', 5);
        this.defaultValues.set('defence.damageThreshold', 0);
        this.defaultValues.set('defence.damageResistance', 0);
    }
    /**
     * Perform the actual conversion
     */
    performConversion(legacyData, result) {
        const template = {
            name: legacyData.name,
            type: legacyData.type,
            maxLevel: legacyData.maxLevel,
            experienceReward: legacyData.experience || this.defaultValues.get('experienceReward'),
            defence: {
                health: legacyData.defence.health,
                armorClass: legacyData.defence.ac,
                damageThreshold: legacyData.defence.threshold || this.defaultValues.get('defence.damageThreshold'),
                damageResistance: legacyData.defence.resistance || this.defaultValues.get('defence.damageResistance')
            },
            attack: {
                hitChance: legacyData.attack.hit_chance,
                weapon: legacyData.attack.weapon,
                damage: {
                    min: legacyData.attack.damage.min,
                    max: legacyData.attack.damage.max
                },
                shots: legacyData.attack.shots,
                attackSpeed: this.defaultValues.get('attack.attackSpeed'),
                criticalChance: this.defaultValues.get('attack.criticalChance')
            },
            spawning: {
                min: legacyData.amount.min,
                max: legacyData.amount.max
            },
            sprites: legacyData.title || []
        };
        // Apply conversion rules
        this.applyConversionRules(template, legacyData, result);
        return template;
    }
    /**
     * Apply custom conversion rules
     */
    applyConversionRules(template, legacyData, result) {
        this.conversionRules.forEach((converter, fieldPath) => {
            try {
                const value = this.getNestedValue(legacyData, fieldPath);
                if (value !== undefined) {
                    const convertedValue = converter(value);
                    this.setNestedValue(template, fieldPath, convertedValue);
                }
            }
            catch (error) {
                result.warnings.push(`Failed to apply conversion rule for ${fieldPath}: ${error}`);
            }
        });
    }
    /**
     * Get nested object value by path
     */
    getNestedValue(obj, path) {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            }
            else {
                return undefined;
            }
        }
        return current;
    }
    /**
     * Set nested object value by path
     */
    setNestedValue(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in current) || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part];
        }
        current[parts[parts.length - 1]] = value;
    }
    /**
     * Validate converted template
     */
    validateTemplate(template) {
        try {
            return template.name && template.name.trim() !== '' &&
                template.type && template.type.trim() !== '' &&
                typeof template.maxLevel === 'number' && template.maxLevel >= 1 &&
                template.defence && template.defence.health > 0 &&
                template.attack && template.attack.hitChance >= 0 &&
                template.spawning && template.spawning.min >= 1 && template.spawning.max >= template.spawning.min;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=LegacyEnemyConverter.js.map