import { EnemyTemplateManager, IEnemyTemplate } from './EnemyTemplateManager';
import { EnemyInstanceFactory, IEnemyInstance } from './EnemyInstanceFactory';
import { EnemySpawnManager, ISpawnConfig, ISpawnResult } from './EnemySpawnManager';
import { EnemyHealthManager, HealthStatus, IDamageResult, IHealingResult } from './EnemyHealthManager';
import { LegacyEnemyConverter, IConversionResult } from './LegacyEnemyConverter';
import { EnemySpriteManager, SpriteSelectionStrategy, ISpriteSelectionResult } from './EnemySpriteManager';

/**
 * ModernEnemyService - Single Responsibility: Enemy System Orchestration
 * 
 * Orchestrates all enemy-related components using composition over inheritance.
 * Provides a unified interface while maintaining separation of concerns.
 * 
 * SRP Compliance:
 * ✅ Only handles orchestration and coordination of specialized components
 * ✅ Does not implement specific enemy logic directly
 * ✅ Focused purely on component integration and workflow management
 */
export class ModernEnemyService {
  private static instance: ModernEnemyService;
  
  private readonly templateManager: EnemyTemplateManager;
  private readonly instanceFactory: EnemyInstanceFactory;
  private readonly spawnManager: EnemySpawnManager;
  private readonly healthManager: EnemyHealthManager;
  private readonly legacyConverter: LegacyEnemyConverter;
  private readonly spriteManager: EnemySpriteManager;
  
  private initialized: boolean = false;

  private constructor() {
    // Initialize all components
    this.templateManager = new EnemyTemplateManager();
    this.instanceFactory = new EnemyInstanceFactory();
    this.spawnManager = new EnemySpawnManager();
    this.healthManager = new EnemyHealthManager();
    this.legacyConverter = new LegacyEnemyConverter();
    this.spriteManager = new EnemySpriteManager();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ModernEnemyService {
    if (!ModernEnemyService.instance) {
      ModernEnemyService.instance = new ModernEnemyService();
    }
    return ModernEnemyService.instance;
  }

  /**
   * Initialize enemy service with default data
   */
  public async initializeService(): Promise<void> {
    if (this.initialized) {
      console.log('Enemy service already initialized');
      return;
    }

    try {
      // Load default enemy templates
      await this.loadDefaultEnemyTemplates();
      
      // Configure default settings
      this.configureDefaultSettings();
      
      this.initialized = true;
      console.log('Enemy service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize enemy service:', error);
      throw error;
    }
  }

  /**
   * Check if service is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  // Template Management Interface

  /**
   * Get enemy template by name
   */
  public getEnemyTemplate(name: string): IEnemyTemplate | null {
    return this.templateManager.getTemplate(name);
  }

  /**
   * Get all enemy templates
   */
  public getAllEnemyTemplates(): IEnemyTemplate[] {
    return this.templateManager.getAllTemplates();
  }

  /**
   * Get templates by type
   */
  public getEnemiesByType(type: string): IEnemyTemplate[] {
    return this.templateManager.getTemplatesByType(type);
  }

  /**
   * Get random enemy template
   */
  public getRandomEnemyTemplate(type?: string): IEnemyTemplate | null {
    return type ? 
      this.templateManager.getRandomTemplateByType(type) : 
      this.templateManager.getRandomTemplate();
  }

  /**
   * Register new enemy template
   */
  public registerEnemyTemplate(template: IEnemyTemplate): boolean {
    if (!this.templateManager.validateTemplate(template)) {
      console.error('Invalid enemy template provided');
      return false;
    }

    this.templateManager.registerTemplate(template);
    return true;
  }

  // Instance Creation Interface

  /**
   * Create enemy instance from template
   */
  public createEnemyInstance(templateName: string, options?: {
    level?: number;
    healthVariation?: { min: number; max: number };
    modifiers?: IEnemyInstance['modifiers'];
  }): IEnemyInstance | null {
    const template = this.templateManager.getTemplate(templateName);
    if (!template) {
      console.error(`Template '${templateName}' not found`);
      return null;
    }

    return this.instanceFactory.createInstance(template, options);
  }

  /**
   * Create multiple enemy instances
   */
  public createEnemyInstances(templateName: string, count: number, options?: {
    level?: number;
    healthVariation?: { min: number; max: number };
    modifiers?: IEnemyInstance['modifiers'];
  }): IEnemyInstance[] {
    const template = this.templateManager.getTemplate(templateName);
    if (!template) {
      console.error(`Template '${templateName}' not found`);
      return [];
    }

    return this.instanceFactory.createInstances(template, count, options);
  }

  /**
   * Create elite enemy instance
   */
  public createEliteEnemyInstance(templateName: string): IEnemyInstance | null {
    const template = this.templateManager.getTemplate(templateName);
    if (!template) {
      console.error(`Template '${templateName}' not found`);
      return null;
    }

    return this.instanceFactory.createEliteInstance(template);
  }

  // Spawn Management Interface

  /**
   * Spawn enemy group
   */
  public spawnEnemyGroup(templateName: string, config?: Partial<ISpawnConfig>): ISpawnResult {
    const template = this.templateManager.getTemplate(templateName);
    if (!template) {
      return {
        success: false,
        instances: [],
        spawnTime: Date.now(),
        actualGroupSize: 0,
        templateUsed: templateName
      };
    }

    return this.spawnManager.spawnGroup(template, this.instanceFactory, config);
  }

  /**
   * Spawn random enemy group
   */
  public spawnRandomEnemyGroup(type?: string, config?: Partial<ISpawnConfig>): ISpawnResult {
    const templates = type ? 
      this.templateManager.getTemplatesByType(type) : 
      this.templateManager.getAllTemplates();

    return this.spawnManager.spawnRandomGroup(templates, this.instanceFactory, config);
  }

  /**
   * Spawn enemy group with environmental conditions
   */
  public spawnEnemyGroupWithConditions(
    templateName: string,
    conditions: {
      timeOfDay: 'day' | 'night' | 'any';
      playerLevel: number;
      weather?: string;
      location?: string;
    },
    config?: Partial<ISpawnConfig>
  ): ISpawnResult {
    const template = this.templateManager.getTemplate(templateName);
    if (!template) {
      return {
        success: false,
        instances: [],
        spawnTime: Date.now(),
        actualGroupSize: 0,
        templateUsed: templateName
      };
    }

    return this.spawnManager.spawnWithConditions(template, this.instanceFactory, conditions, config);
  }

  // Health Management Interface

  /**
   * Check if enemy is alive
   */
  public isAlive(instance: IEnemyInstance): boolean {
    return this.healthManager.isAlive(instance);
  }

  /**
   * Apply damage to enemy
   */
  public applyDamage(instance: IEnemyInstance, damage: number, options?: {
    ignoreArmor?: boolean;
    damageType?: string;
    source?: string;
  }): IDamageResult {
    return this.healthManager.applyDamage(instance, damage, options);
  }

  /**
   * Apply healing to enemy
   */
  public applyHealing(instance: IEnemyInstance, healing: number, options?: {
    allowOverheal?: boolean;
    healingType?: string;
    source?: string;
  }): IHealingResult {
    return this.healthManager.applyHealing(instance, healing, options);
  }

  /**
   * Get health status
   */
  public getHealthStatus(instance: IEnemyInstance): HealthStatus {
    return this.healthManager.getHealthStatus(instance);
  }

  /**
   * Get health percentage
   */
  public getHealthPercentage(instance: IEnemyInstance): number {
    return this.healthManager.getHealthPercentage(instance);
  }

  /**
   * Kill enemy instantly
   */
  public killEnemy(instance: IEnemyInstance): IDamageResult {
    return this.healthManager.kill(instance);
  }

  // Sprite Management Interface

  /**
   * Get sprite for enemy instance
   */
  public getEnemySprite(
    instance: IEnemyInstance,
    strategy?: SpriteSelectionStrategy
  ): ISpriteSelectionResult {
    const template = this.templateManager.getTemplate(instance.templateName);
    if (!template) {
      return {
        spriteName: instance.templateName,
        strategy: strategy || SpriteSelectionStrategy.RANDOM,
        timestamp: Date.now(),
        instanceId: instance.id
      };
    }

    return this.spriteManager.getSpriteForInstance(instance, template, strategy);
  }

  /**
   * Get random sprite for template
   */
  public getRandomSprite(templateName: string): ISpriteSelectionResult {
    const template = this.templateManager.getTemplate(templateName);
    if (!template) {
      return {
        spriteName: templateName,
        strategy: SpriteSelectionStrategy.RANDOM,
        timestamp: Date.now(),
        templateName
      };
    }

    return this.spriteManager.getSpriteForTemplate(template);
  }

  // Legacy Compatibility Interface

  /**
   * Convert legacy enemy data
   */
  public convertLegacyEnemy(legacyData: any): IConversionResult {
    return this.legacyConverter.convertToTemplate(legacyData);
  }

  /**
   * Convert template back to legacy format
   */
  public convertToLegacyFormat(template: IEnemyTemplate): any {
    return this.legacyConverter.convertToLegacy(template);
  }

  /**
   * Load legacy enemy data
   */
  public loadLegacyEnemyData(legacyDataArray: any[]): {
    successful: IEnemyTemplate[];
    failed: IConversionResult[];
  } {
    const results = this.legacyConverter.convertMultiple(legacyDataArray);
    const successful: IEnemyTemplate[] = [];
    const failed: IConversionResult[] = [];

    results.forEach(result => {
      if (result.success && result.template) {
        this.templateManager.registerTemplate(result.template);
        successful.push(result.template);
      } else {
        failed.push(result);
      }
    });

    return { successful, failed };
  }

  // Component Access Interface

  /**
   * Get template manager component
   */
  public getTemplateManager(): EnemyTemplateManager {
    return this.templateManager;
  }

  /**
   * Get instance factory component
   */
  public getInstanceFactory(): EnemyInstanceFactory {
    return this.instanceFactory;
  }

  /**
   * Get spawn manager component
   */
  public getSpawnManager(): EnemySpawnManager {
    return this.spawnManager;
  }

  /**
   * Get health manager component
   */
  public getHealthManager(): EnemyHealthManager {
    return this.healthManager;
  }

  /**
   * Get legacy converter component
   */
  public getLegacyConverter(): LegacyEnemyConverter {
    return this.legacyConverter;
  }

  /**
   * Get sprite manager component
   */
  public getSpriteManager(): EnemySpriteManager {
    return this.spriteManager;
  }

  // System Status Interface

  /**
   * Get comprehensive system status
   */
  public getSystemStatus(): {
    initialized: boolean;
    templates: {
      total: number;
      byType: Map<string, number>;
    };
    instances: {
      totalCreated: number;
    };
    spawning: {
      totalAttempts: number;
      successRate: number;
    };
    sprites: {
      totalRegistered: number;
      totalSelections: number;
    };
    components: {
      templateManager: boolean;
      instanceFactory: boolean;
      spawnManager: boolean;
      healthManager: boolean;
      legacyConverter: boolean;
      spriteManager: boolean;
    };
  } {
    const templateStats = this.templateManager.getTemplateStats();
    const instanceStats = this.instanceFactory.getCreationStats();
    const spawnStats = this.spawnManager.getSpawnStats();
    const spriteStats = this.spriteManager.getSpriteStats();

    return {
      initialized: this.initialized,
      templates: {
        total: templateStats.totalTemplates,
        byType: templateStats.typeBreakdown
      },
      instances: {
        totalCreated: instanceStats.totalInstancesCreated
      },
      spawning: {
        totalAttempts: spawnStats.totalSpawnAttempts,
        successRate: spawnStats.successRate
      },
      sprites: {
        totalRegistered: spriteStats.totalSpritesRegistered,
        totalSelections: spriteStats.totalSelections
      },
      components: {
        templateManager: !!this.templateManager,
        instanceFactory: !!this.instanceFactory,
        spawnManager: !!this.spawnManager,
        healthManager: !!this.healthManager,
        legacyConverter: !!this.legacyConverter,
        spriteManager: !!this.spriteManager
      }
    };
  }

  /**
   * Validate all components
   */
  public validateAllComponents(): boolean {
    try {
      return !!(this.templateManager && 
                this.instanceFactory && 
                this.spawnManager && 
                this.healthManager && 
                this.legacyConverter && 
                this.spriteManager);
    } catch (error) {
      console.error('Component validation failed:', error);
      return false;
    }
  }

  /**
   * Reset all components
   */
  public resetAllComponents(): void {
    this.templateManager.clearTemplates();
    this.instanceFactory.resetCreationCounter();
    this.spawnManager.clearSpawnHistory();
    this.healthManager.clearAllHealthHistory();
    this.spriteManager.clearAllSpriteHistory();
    this.initialized = false;
  }

  // Private helper methods

  /**
   * Load default enemy templates from legacy data
   */
  private async loadDefaultEnemyTemplates(): Promise<void> {
    const defaultEnemyData = [
      {
        maxLevel: 1, name: 'Rat', type: 'creature',
        defence: { health: 6, ac: 6, threshold: 0, resistance: 0 },
        attack: { hit_chance: 40, damage: { min: 2, max: 2 }, shots: 1 },
        amount: { min: 6, max: 10 }, experience: 25, title: ['Rat']
      },
      {
        maxLevel: 1, name: 'Mantis', type: 'creature',
        defence: { health: 25, ac: 13, threshold: 0, resistance: 0.2 },
        attack: { hit_chance: 50, damage: { min: 5, max: 8 }, shots: 1 },
        amount: { min: 1, max: 4 }, experience: 50, title: ['Mantis']
      },
      {
        maxLevel: 1, name: 'Tribe', type: 'human',
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 60, weapon: 'spear', damage: { min: 3, max: 10 }, shots: 1 },
        amount: { min: 2, max: 4 }, experience: 50,
        title: ['Tribe man 1', 'Tribe man 2', 'Tribe man 3', 'Tribe man 4',
               'Tribe woman 1', 'Tribe woman 2']
      },
      {
        maxLevel: 1, name: 'Cannibals', type: 'human',
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 60, weapon: 'knife', damage: { min: 1, max: 6 }, shots: 1 },
        amount: { min: 2, max: 4 }, experience: 50,
        title: ['Cannibal man 1', 'Cannibal man 2', 'Cannibal man 3',
               'Cannibal woman 1', 'Cannibal woman 2']
      },
      {
        maxLevel: 1, name: 'Raiders', type: 'human',
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 60, weapon: '9mm_pistol', damage: { min: 10, max: 24 }, shots: 1 },
        amount: { min: 1, max: 4 }, experience: 75,
        title: [
          'Raider - Leather Jacket - Baseball bat',
          'Raider - Leather Jacket - 44 Magnum revolver',
          'Raider - Leather Jacket - 9mm pistol',
          'Raider - Leather Jacket - 44 Desert Eagle',
          'Raider - Leather Jacket - Laser pistol',
          'Raider - Leather Jacket - SMG',
          'Raider - Leather Jacket - Frag grenade',
          'Raider - Leather Jacket - Combat shotgun',
          'Raider - Leather Armor - Baseball bat',
          'Raider - Leather Armor - 44 Magnum revolver',
          'Raider - Leather Armor - 9mm pistol',
          'Raider - Leather Armor - 44 Desert Eagle',
          'Raider - Leather Armor - Laser pistol',
          'Raider - Leather Armor - SMG',
          'Raider - Leather Armor - Frag grenade',
          'Raider - Leather Armor - Combat shotgun'
        ]
      }
    ];

    const loadResult = this.loadLegacyEnemyData(defaultEnemyData);
    
    if (loadResult.failed.length > 0) {
      console.warn(`Failed to load ${loadResult.failed.length} enemy templates:`, loadResult.failed);
    }

    console.log(`Loaded ${loadResult.successful.length} enemy templates successfully`);
  }

  /**
   * Configure default settings for all components
   */
  private configureDefaultSettings(): void {
    // Configure instance factory
    this.instanceFactory.setHealthVariationRange(0.8, 1.0);
    this.instanceFactory.setLevelVariationEnabled(true);

    // Configure spawn manager
    this.spawnManager.setDefaultSpawnConfig({
      groupSizeRange: { min: 1, max: 3 },
      spawnChance: 0.8,
      spawnConditions: { timeOfDay: 'any' }
    });

    // Configure health manager
    this.healthManager.setMaxHistoryPerInstance(50);

    // Configure sprite manager
    this.spriteManager.setDefaultStrategy(SpriteSelectionStrategy.RANDOM);
    this.spriteManager.setMaxHistoryPerInstance(20);
  }
}
