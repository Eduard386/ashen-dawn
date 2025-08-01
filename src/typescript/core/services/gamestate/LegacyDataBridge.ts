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
export class LegacyDataBridge {
  private defaultGameData: any;
  private conversionRules: Map<string, (value: any) => any> = new Map();

  constructor() {
    this.initializeDefaultData();
    this.initializeConversionRules();
  }

  /**
   * Convert modern data to legacy format
   */
  public convertToLegacy(modernData: any): any {
    if (!modernData) {
      return this.getDefaultLegacyData();
    }

    try {
      const legacyData = this.deepClone(this.defaultGameData);

      // Map modern fields to legacy fields
      if (modernData.health !== undefined) {
        legacyData.health = modernData.health;
      }

      if (modernData.experience !== undefined) {
        legacyData.experience = modernData.experience;
      }

      if (modernData.level !== undefined) {
        legacyData.levelCount = modernData.level;
      }

      if (modernData.skills) {
        legacyData.skills = { ...modernData.skills };
      }

      if (modernData.currentWeapon) {
        legacyData.current_weapon = modernData.currentWeapon;
      }

      if (modernData.currentArmor) {
        legacyData.current_armor = modernData.currentArmor;
      }

      if (modernData.weapons) {
        legacyData.weapons = [...modernData.weapons];
      }

      if (modernData.medical) {
        legacyData.med = { ...modernData.medical };
      }

      if (modernData.ammunition) {
        legacyData.ammo = { ...modernData.ammunition };
      }

      if (modernData.enemies) {
        legacyData.enemiesToCreate = [...modernData.enemies];
      }

      if (modernData.loot) {
        legacyData.levelLoot = [...modernData.loot];
      }

      if (modernData.armorLoot) {
        legacyData.armorLoot = modernData.armorLoot;
      }

      return legacyData;
    } catch (error) {
      console.error('Failed to convert to legacy format:', error);
      return this.getDefaultLegacyData();
    }
  }

  /**
   * Convert legacy data to modern format
   */
  public convertFromLegacy(legacyData: any): any {
    if (!legacyData) {
      return this.getDefaultModernData();
    }

    try {
      const modernData: any = {};

      // Map legacy fields to modern fields
      modernData.health = legacyData.health || 30;
      modernData.experience = legacyData.experience || 0;
      modernData.level = legacyData.levelCount || 1;

      // Skills conversion
      modernData.skills = this.convertSkills(legacyData.skills);

      // Equipment conversion
      modernData.currentWeapon = legacyData.current_weapon || 'Baseball bat';
      modernData.currentArmor = legacyData.current_armor || 'Leather Jacket';
      modernData.weapons = legacyData.weapons || ['Baseball bat', '9mm pistol'];

      // Medical items conversion
      modernData.medical = this.convertMedicalItems(legacyData.med);

      // Ammunition conversion
      modernData.ammunition = this.convertAmmunition(legacyData.ammo);

      // Game state conversion
      modernData.enemies = legacyData.enemiesToCreate || [];
      modernData.loot = legacyData.levelLoot || [];
      modernData.armorLoot = legacyData.armorLoot || null;

      return modernData;
    } catch (error) {
      console.error('Failed to convert from legacy format:', error);
      return this.getDefaultModernData();
    }
  }

  /**
   * Validate legacy data structure
   */
  public validateLegacyData(data: any): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Data is not a valid object');
      return { valid: false, errors, warnings };
    }

    // Required fields
    const requiredFields = ['health', 'experience', 'skills'];
    requiredFields.forEach(field => {
      if (data[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Health validation
    if (typeof data.health !== 'number' || data.health < 0) {
      errors.push('Health must be a non-negative number');
    }

    // Experience validation
    if (typeof data.experience !== 'number' || data.experience < 0) {
      errors.push('Experience must be a non-negative number');
    }

    // Skills validation
    if (data.skills && typeof data.skills === 'object') {
      const skillNames = Object.keys(data.skills);
      if (skillNames.length === 0) {
        warnings.push('No skills defined');
      }

      skillNames.forEach(skill => {
        if (typeof data.skills[skill] !== 'number') {
          errors.push(`Skill '${skill}' must be a number`);
        }
      });
    } else if (data.skills !== undefined) {
      errors.push('Skills must be an object');
    }

    // Weapons validation
    if (data.weapons && !Array.isArray(data.weapons)) {
      errors.push('Weapons must be an array');
    }

    // Medical items validation
    if (data.med && typeof data.med !== 'object') {
      errors.push('Medical items must be an object');
    }

    // Ammunition validation
    if (data.ammo && typeof data.ammo !== 'object') {
      errors.push('Ammunition must be an object');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate modern data structure
   */
  public validateModernData(data: any): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Data is not a valid object');
      return { valid: false, errors, warnings };
    }

    // Required fields for modern format
    const requiredFields = ['health', 'experience', 'skills'];
    requiredFields.forEach(field => {
      if (data[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate data types
    if (data.health !== undefined && (typeof data.health !== 'number' || data.health < 0)) {
      errors.push('Health must be a non-negative number');
    }

    if (data.experience !== undefined && (typeof data.experience !== 'number' || data.experience < 0)) {
      errors.push('Experience must be a non-negative number');
    }

    if (data.level !== undefined && (typeof data.level !== 'number' || data.level < 1)) {
      errors.push('Level must be a positive number');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get default legacy data
   */
  public getDefaultLegacyData(): any {
    return this.deepClone(this.defaultGameData);
  }

  /**
   * Get default modern data
   */
  public getDefaultModernData(): any {
    return this.convertFromLegacy(this.defaultGameData);
  }

  /**
   * Update default data template
   */
  public updateDefaultData(newDefaults: any): void {
    if (this.validateLegacyData(newDefaults).valid) {
      this.defaultGameData = this.deepClone(newDefaults);
    } else {
      console.error('Invalid default data provided');
    }
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
   * Get conversion statistics
   */
  public getConversionStats(): {
    defaultDataSize: number;
    conversionRulesCount: number;
    availableRules: string[];
  } {
    return {
      defaultDataSize: JSON.stringify(this.defaultGameData).length,
      conversionRulesCount: this.conversionRules.size,
      availableRules: Array.from(this.conversionRules.keys())
    };
  }

  /**
   * Compare legacy and modern data
   */
  public compareFormats(legacyData: any, modernData: any): {
    identical: boolean;
    differences: string[];
    legacyOnly: string[];
    modernOnly: string[];
  } {
    const differences: string[] = [];
    const legacyOnly: string[] = [];
    const modernOnly: string[] = [];

    // Convert modern back to legacy for comparison
    const convertedLegacy = this.convertToLegacy(modernData);

    // Compare key sets
    const legacyKeys = new Set(Object.keys(legacyData || {}));
    const convertedKeys = new Set(Object.keys(convertedLegacy));

    legacyKeys.forEach(key => {
      if (!convertedKeys.has(key)) {
        legacyOnly.push(key);
      }
    });

    convertedKeys.forEach(key => {
      if (!legacyKeys.has(key)) {
        modernOnly.push(key);
      }
    });

    // Compare values for common keys
    const commonKeys = Array.from(legacyKeys).filter(key => convertedKeys.has(key));
    commonKeys.forEach(key => {
      if (JSON.stringify(legacyData[key]) !== JSON.stringify(convertedLegacy[key])) {
        differences.push(`${key}: ${JSON.stringify(legacyData[key])} vs ${JSON.stringify(convertedLegacy[key])}`);
      }
    });

    return {
      identical: differences.length === 0 && legacyOnly.length === 0 && modernOnly.length === 0,
      differences,
      legacyOnly,
      modernOnly
    };
  }

  // Private helper methods

  /**
   * Initialize default game data
   */
  private initializeDefaultData(): void {
    this.defaultGameData = {
      levelCount: 1,
      health: 30,
      experience: 0,
      skills: {
        small_guns: 75,
        big_guns: 75,
        energy_weapons: 75,
        melee_weapons: 75,
        pyrotechnics: 75,
        lockpick: 75,
        science: 75,
        repair: 75,
        medicine: 75,
        barter: 75,
        speech: 75,
        surviving: 75
      },
      current_weapon: 'Baseball bat',
      current_armor: 'Leather Jacket',
      weapons: ['Baseball bat', '9mm pistol'],
      med: {
        first_aid_kit: 0,
        jet: 0,
        buffout: 0,
        mentats: 0,
        psycho: 0
      },
      ammo: {
        mm_9: 500,
        magnum_44: 12,
        mm_12: 0,
        mm_5_45: 0,
        energy_cell: 0,
        frag_grenade: 0
      },
      enemiesToCreate: [],
      levelLoot: [],
      armorLoot: null
    };
  }

  /**
   * Initialize conversion rules
   */
  private initializeConversionRules(): void {
    // Add standard conversion rules
    this.conversionRules.set('health', (value) => Math.max(0, Number(value) || 0));
    this.conversionRules.set('experience', (value) => Math.max(0, Number(value) || 0));
    this.conversionRules.set('level', (value) => Math.max(1, Number(value) || 1));
  }

  /**
   * Convert skills object
   */
  private convertSkills(skills: any): any {
    if (!skills || typeof skills !== 'object') {
      return { ...this.defaultGameData.skills };
    }

    const convertedSkills = { ...this.defaultGameData.skills };
    Object.keys(skills).forEach(skill => {
      if (typeof skills[skill] === 'number') {
        convertedSkills[skill] = skills[skill];
      }
    });

    return convertedSkills;
  }

  /**
   * Convert medical items
   */
  private convertMedicalItems(med: any): any {
    if (!med || typeof med !== 'object') {
      return { ...this.defaultGameData.med };
    }

    const convertedMed = { ...this.defaultGameData.med };
    Object.keys(med).forEach(item => {
      if (typeof med[item] === 'number') {
        convertedMed[item] = med[item];
      }
    });

    return convertedMed;
  }

  /**
   * Convert ammunition
   */
  private convertAmmunition(ammo: any): any {
    if (!ammo || typeof ammo !== 'object') {
      return { ...this.defaultGameData.ammo };
    }

    const convertedAmmo = { ...this.defaultGameData.ammo };
    Object.keys(ammo).forEach(ammoType => {
      if (typeof ammo[ammoType] === 'number') {
        convertedAmmo[ammoType] = ammo[ammoType];
      }
    });

    return convertedAmmo;
  }

  /**
   * Deep clone an object
   */
  private deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }
}
