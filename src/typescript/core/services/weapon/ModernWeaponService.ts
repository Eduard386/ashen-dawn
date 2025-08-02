import { IWeapon } from '../../interfaces/IWeapon.js';
import { SkillType, AmmoType } from '../../types/GameTypes.js';
import { WeaponRegistry } from './WeaponRegistry.js';
import { WeaponQueryEngine } from './WeaponQueryEngine.js';
import { WeaponClassifier, WeaponClassification } from './WeaponClassifier.js';
import { WeaponDamageCalculator, DamageComparison, WeaponDamageStats } from './WeaponDamageCalculator.js';
import { LegacyWeaponConverter } from './LegacyWeaponConverter.js';
import { WeaponDatabaseLoader } from './WeaponDatabaseLoader.js';

/**
 * Modern Weapon Service - Single Responsibility: Weapon System Orchestration
 * 
 * Responsible ONLY for:
 * - Coordinating weapon system components
 * - Providing unified weapon system interface
 * - Managing component initialization and lifecycle
 * 
 * NOT responsible for:
 * - Direct weapon storage (delegated to registry)
 * - Complex queries (delegated to query engine)
 * - Damage calculations (delegated to calculator)
 * - Classification logic (delegated to classifier)
 * - Legacy conversion (delegated to converter)
 * - Data loading (delegated to loader)
 */
export class ModernWeaponService {
  private static instance: ModernWeaponService;
  private initialized: boolean = false;

  // SRP-compliant components
  private weaponRegistry: WeaponRegistry;
  private queryEngine: WeaponQueryEngine;
  private classifier: WeaponClassifier;
  private damageCalculator: WeaponDamageCalculator;
  private legacyConverter: LegacyWeaponConverter;
  private databaseLoader: WeaponDatabaseLoader;

  private constructor() {
    // Initialize components with dependency injection
    this.weaponRegistry = new WeaponRegistry();
    this.queryEngine = new WeaponQueryEngine(this.weaponRegistry);
    this.classifier = new WeaponClassifier(this.weaponRegistry);
    this.damageCalculator = new WeaponDamageCalculator(this.weaponRegistry);
    this.legacyConverter = new LegacyWeaponConverter();
    this.databaseLoader = new WeaponDatabaseLoader(this.weaponRegistry);
  }

  public static getInstance(): ModernWeaponService {
    if (!ModernWeaponService.instance) {
      ModernWeaponService.instance = new ModernWeaponService();
    }
    return ModernWeaponService.instance;
  }

  /**
   * Initialize the weapon service with default data
   */
  public async initializeService(): Promise<void> {
    if (this.initialized) {
      console.log('Weapon service already initialized');
      return;
    }

    try {
      // Load default weapons using the database loader
      const loadResult = this.databaseLoader.loadDefaultWeapons();
      
      if (loadResult.loaded > 0) {
        this.initialized = true;
        console.log(`Weapon service initialized successfully with ${loadResult.loaded} weapons`);
        
        if (loadResult.failed > 0) {
          console.warn(`${loadResult.failed} weapons failed to load:`, loadResult.errors);
        }
      } else {
        throw new Error('Failed to load any weapons');
      }
    } catch (error) {
      console.error('Failed to initialize weapon service:', error);
      throw error;
    }
  }

  /**
   * Check if service is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  // === WEAPON REGISTRY OPERATIONS ===
  
  /**
   * Get weapon by name
   */
  public getWeapon(name: string): IWeapon | null {
    return this.weaponRegistry.getWeapon(name);
  }

  /**
   * Get all weapons
   */
  public getAllWeapons(): IWeapon[] {
    return this.weaponRegistry.getAllWeapons();
  }

  /**
   * Check if weapon exists
   */
  public hasWeapon(name: string): boolean {
    return this.weaponRegistry.hasWeapon(name);
  }

  /**
   * Register new weapon
   */
  public registerWeapon(weapon: IWeapon): void {
    this.weaponRegistry.registerWeapon(weapon);
  }

  // === WEAPON QUERY OPERATIONS ===

  /**
   * Get weapons by skill type
   */
  public getWeaponsBySkill(skill: SkillType): IWeapon[] {
    return this.queryEngine.getWeaponsBySkill(skill);
  }

  /**
   * Get weapons by ammo type
   */
  public getWeaponsByAmmoType(ammoType: AmmoType): IWeapon[] {
    return this.queryEngine.getWeaponsByAmmoType(ammoType);
  }

  /**
   * Search weapons by name
   */
  public searchWeapons(pattern: string): IWeapon[] {
    return this.queryEngine.searchWeaponsByName(pattern);
  }

  /**
   * Get top weapons by criteria
   */
  public getTopWeapons(count: number, sortBy: 'damage' | 'critical' | 'speed' = 'damage'): IWeapon[] {
    return this.queryEngine.getTopWeapons(count, sortBy);
  }

  // === WEAPON CLASSIFICATION OPERATIONS ===

  /**
   * Check if weapon is ranged
   */
  public isRangedWeapon(weaponName: string): boolean {
    return this.classifier.isRangedWeapon(weaponName);
  }

  /**
   * Check if weapon is melee
   */
  public isMeleeWeapon(weaponName: string): boolean {
    return this.classifier.isMeleeWeapon(weaponName);
  }

  /**
   * Get weapon classification
   */
  public getWeaponClassification(weaponName: string): WeaponClassification {
    return this.classifier.getWeaponClassification(weaponName);
  }

  /**
   * Check if weapon is automatic
   */
  public isAutomaticWeapon(weaponName: string): boolean {
    return this.classifier.isAutomaticWeapon(weaponName);
  }

  // === DAMAGE CALCULATION OPERATIONS ===

  /**
   * Get weapon damage range as string
   */
  public getDamageRangeString(weaponName: string): string {
    return this.damageCalculator.getDamageRangeString(weaponName);
  }

  /**
   * Calculate average damage for weapon
   */
  public getAverageDamage(weaponName: string): number {
    return this.damageCalculator.getAverageDamage(weaponName);
  }

  /**
   * Calculate damage per second
   */
  public getDamagePerSecond(weaponName: string): number {
    return this.damageCalculator.getDamagePerSecond(weaponName);
  }

  /**
   * Compare damage between weapons
   */
  public compareDamage(weapon1: string, weapon2: string): DamageComparison {
    return this.damageCalculator.compareDamage(weapon1, weapon2);
  }

  /**
   * Get all weapon damage statistics
   */
  public getAllWeaponDamageStats(): WeaponDamageStats[] {
    return this.damageCalculator.getAllWeaponDamageStats();
  }

  // === LEGACY CONVERSION OPERATIONS ===

  /**
   * Convert legacy weapon name to standardized format
   */
  public convertLegacyName(legacyName: string): string {
    return this.legacyConverter.convertLegacyName(legacyName);
  }

  /**
   * Check if name is in legacy format
   */
  public isLegacyFormat(weaponName: string): boolean {
    return this.legacyConverter.isLegacyFormat(weaponName);
  }

  /**
   * Convert legacy weapon data
   */
  public convertLegacyWeaponData(legacyData: any): IWeapon | null {
    return this.legacyConverter.convertLegacyWeaponData(legacyData);
  }

  // === SYSTEM STATUS AND MANAGEMENT ===

  /**
   * Get comprehensive system status
   */
  public getSystemStatus(): {
    initialized: boolean;
    weaponCount: number;
    components: {
      registry: boolean;
      queryEngine: boolean;
      classifier: boolean;
      damageCalculator: boolean;
      legacyConverter: boolean;
      databaseLoader: boolean;
    };
    statistics: {
      registrationStats: any;
      queryStats: any;
      classificationStats: any;
      calculationStats: any;
      conversionStats: any;
      loadingStats: any;
    };
  } {
    return {
      initialized: this.initialized,
      weaponCount: this.weaponRegistry.getWeaponCount(),
      components: {
        registry: !!this.weaponRegistry,
        queryEngine: !!this.queryEngine,
        classifier: !!this.classifier,
        damageCalculator: !!this.damageCalculator,
        legacyConverter: !!this.legacyConverter,
        databaseLoader: !!this.databaseLoader
      },
      statistics: {
        registrationStats: this.weaponRegistry.getRegistrationStats(),
        queryStats: this.queryEngine.getQueryStats(),
        classificationStats: this.classifier.getClassificationStats(),
        calculationStats: this.damageCalculator.getCalculationStats(),
        conversionStats: this.legacyConverter.getConversionStats(),
        loadingStats: this.databaseLoader.getLoadingStats()
      }
    };
  }

  /**
   * Validate all components are working correctly
   */
  public validateAllComponents(): boolean {
    try {
      // Test each component
      const testWeapon = this.weaponRegistry.getWeapon('9mm_pistol');
      if (!testWeapon) return false;

      const queryResult = this.queryEngine.getWeaponsBySkill('small_guns');
      if (!Array.isArray(queryResult)) return false;

      const classification = this.classifier.getWeaponClassification('9mm_pistol');
      if (!classification.exists) return false;

      const damage = this.damageCalculator.getAverageDamage('9mm_pistol');
      if (damage <= 0) return false;

      const converted = this.legacyConverter.convertLegacyName('9mm pistol');
      if (!converted) return false;

      return true;
    } catch (error) {
      console.error('Component validation failed:', error);
      return false;
    }
  }

  /**
   * Get individual component instances (for advanced usage)
   */
  public getWeaponRegistry(): WeaponRegistry {
    return this.weaponRegistry;
  }

  public getQueryEngine(): WeaponQueryEngine {
    return this.queryEngine;
  }

  public getClassifier(): WeaponClassifier {
    return this.classifier;
  }

  public getDamageCalculator(): WeaponDamageCalculator {
    return this.damageCalculator;
  }

  public getLegacyConverter(): LegacyWeaponConverter {
    return this.legacyConverter;
  }

  public getDatabaseLoader(): WeaponDatabaseLoader {
    return this.databaseLoader;
  }

  /**
   * Reset the entire weapon system
   */
  public resetSystem(): void {
    this.weaponRegistry.clearWeapons();
    this.queryEngine.clearQueryHistory();
    this.classifier.clearCache();
    this.damageCalculator.clearCalculationHistory();
    this.legacyConverter.clearConversionHistory();
    this.databaseLoader.clearLoadingHistory();
    this.initialized = false;
  }

  /**
   * Export weapon system data for backup
   */
  public exportSystemData(): {
    weapons: Record<string, IWeapon>;
    statistics: any;
    timestamp: number;
  } {
    return {
      weapons: this.weaponRegistry.exportWeapons(),
      statistics: this.getSystemStatus().statistics,
      timestamp: Date.now()
    };
  }

  /**
   * Import weapon system data from backup
   */
  public importSystemData(data: {
    weapons: Record<string, IWeapon>;
    statistics?: any;
    timestamp?: number;
  }): {
    imported: number;
    failed: number;
    errors: string[];
  } {
    this.resetSystem();
    return this.weaponRegistry.importWeapons(data.weapons);
  }
}
