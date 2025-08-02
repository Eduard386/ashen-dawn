import { IEnemyTemplate } from './EnemyTemplateManager';

/**
 * Legacy enemy data structure (for reference)
 */
interface ILegacyEnemy {
  name: string;
  type: string;
  maxLevel: number;
  defence: {
    health: number;
    ac: number;
    threshold: number;
    resistance: number;
  };
  attack: {
    hit_chance: number;
    weapon?: string;
    damage: {
      min: number;
      max: number;
    };
    shots: number;
  };
  amount: {
    min: number;
    max: number;
  };
  experience?: number;
  title?: string[];
}

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
export class LegacyEnemyConverter {
  private conversionRules: Map<string, (value: any) => any> = new Map();
  private fieldMappings: Map<string, string> = new Map();
  private defaultValues: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeFieldMappings();
    this.initializeDefaultValues();
  }

  /**
   * Convert legacy enemy data to modern template
   */
  public convertToTemplate(legacyData: any): IConversionResult {
    const result: IConversionResult = {
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
      } else {
        result.errors.push('Converted template failed validation');
      }

    } catch (error) {
      result.errors.push(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Convert multiple legacy enemies
   */
  public convertMultiple(legacyDataArray: any[]): IConversionResult[] {
    return legacyDataArray.map(data => this.convertToTemplate(data));
  }

  /**
   * Convert back to legacy format (for compatibility)
   */
  public convertToLegacy(template: IEnemyTemplate): any {
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
  public addConversionRule(fieldName: string, converter: (value: any) => any): void {
    this.conversionRules.set(fieldName, converter);
  }

  /**
   * Remove conversion rule
   */
  public removeConversionRule(fieldName: string): boolean {
    return this.conversionRules.delete(fieldName);
  }

  /**
   * Add field mapping (legacy field -> modern field)
   */
  public addFieldMapping(legacyField: string, modernField: string): void {
    this.fieldMappings.set(legacyField, modernField);
  }

  /**
   * Set default value for missing fields
   */
  public setDefaultValue(fieldName: string, defaultValue: any): void {
    this.defaultValues.set(fieldName, defaultValue);
  }

  /**
   * Get conversion statistics
   */
  public getConversionStats(results: IConversionResult[]): {
    totalAttempted: number;
    successful: number;
    failed: number;
    successRate: number;
    commonErrors: Map<string, number>;
    commonWarnings: Map<string, number>;
  } {
    const successful = results.filter(r => r.success);
    const commonErrors = new Map<string, number>();
    const commonWarnings = new Map<string, number>();

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
  public validateLegacyData(data: any): string[] {
    const errors: string[] = [];

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
    } else {
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
    } else {
      if (typeof data.attack.hit_chance !== 'number' || data.attack.hit_chance < 0) {
        errors.push('Invalid attack.hit_chance value');
      }
      if (!data.attack.damage || typeof data.attack.damage !== 'object') {
        errors.push('Missing or invalid attack.damage object');
      } else {
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
    } else {
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
  public isLegacyFormat(data: any): boolean {
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
        } else {
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
  private initializeDefaultRules(): void {
    // AC -> armorClass conversion
    this.conversionRules.set('defence.ac', (value: any) => {
      return typeof value === 'number' ? value : 0;
    });

    // hit_chance -> hitChance conversion
    this.conversionRules.set('attack.hit_chance', (value: any) => {
      return typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 50;
    });

    // title -> sprites conversion
    this.conversionRules.set('title', (value: any) => {
      if (Array.isArray(value)) {
        return value.filter(item => typeof item === 'string');
      }
      return typeof value === 'string' ? [value] : [];
    });

    // amount -> spawning conversion
    this.conversionRules.set('amount', (value: any) => {
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
  private initializeFieldMappings(): void {
    this.fieldMappings.set('defence.ac', 'defence.armorClass');
    this.fieldMappings.set('attack.hit_chance', 'attack.hitChance');
    this.fieldMappings.set('title', 'sprites');
    this.fieldMappings.set('amount', 'spawning');
  }

  /**
   * Initialize default values
   */
  private initializeDefaultValues(): void {
    this.defaultValues.set('experienceReward', 15);
    this.defaultValues.set('attack.attackSpeed', 1.0);
    this.defaultValues.set('attack.criticalChance', 5);
    this.defaultValues.set('defence.damageThreshold', 0);
    this.defaultValues.set('defence.damageResistance', 0);
  }

  /**
   * Perform the actual conversion
   */
  private performConversion(legacyData: ILegacyEnemy, result: IConversionResult): IEnemyTemplate {
    const template: IEnemyTemplate = {
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
  private applyConversionRules(template: IEnemyTemplate, legacyData: any, result: IConversionResult): void {
    this.conversionRules.forEach((converter, fieldPath) => {
      try {
        const value = this.getNestedValue(legacyData, fieldPath);
        if (value !== undefined) {
          const convertedValue = converter(value);
          this.setNestedValue(template, fieldPath, convertedValue);
        }
      } catch (error) {
        result.warnings.push(`Failed to apply conversion rule for ${fieldPath}: ${error}`);
      }
    });
  }

  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * Set nested object value by path
   */
  private setNestedValue(obj: any, path: string, value: any): void {
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
  private validateTemplate(template: IEnemyTemplate): boolean {
    try {
      return template.name && template.name.trim() !== '' &&
             template.type && template.type.trim() !== '' &&
             typeof template.maxLevel === 'number' && template.maxLevel >= 1 &&
             template.defence && template.defence.health > 0 &&
             template.attack && template.attack.hitChance >= 0 &&
             template.spawning && template.spawning.min >= 1 && template.spawning.max >= template.spawning.min;
    } catch {
      return false;
    }
  }
}
