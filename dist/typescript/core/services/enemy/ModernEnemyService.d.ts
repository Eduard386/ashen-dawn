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
export declare class ModernEnemyService {
    private static instance;
    private readonly templateManager;
    private readonly instanceFactory;
    private readonly spawnManager;
    private readonly healthManager;
    private readonly legacyConverter;
    private readonly spriteManager;
    private initialized;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): ModernEnemyService;
    /**
     * Initialize enemy service with default data
     */
    initializeService(): Promise<void>;
    /**
     * Check if service is initialized
     */
    isInitialized(): boolean;
    /**
     * Get enemy template by name
     */
    getEnemyTemplate(name: string): IEnemyTemplate | null;
    /**
     * Get all enemy templates
     */
    getAllEnemyTemplates(): IEnemyTemplate[];
    /**
     * Get templates by type
     */
    getEnemiesByType(type: string): IEnemyTemplate[];
    /**
     * Get random enemy template
     */
    getRandomEnemyTemplate(type?: string): IEnemyTemplate | null;
    /**
     * Register new enemy template
     */
    registerEnemyTemplate(template: IEnemyTemplate): boolean;
    /**
     * Create enemy instance from template
     */
    createEnemyInstance(templateName: string, options?: {
        level?: number;
        healthVariation?: {
            min: number;
            max: number;
        };
        modifiers?: IEnemyInstance['modifiers'];
    }): IEnemyInstance | null;
    /**
     * Create multiple enemy instances
     */
    createEnemyInstances(templateName: string, count: number, options?: {
        level?: number;
        healthVariation?: {
            min: number;
            max: number;
        };
        modifiers?: IEnemyInstance['modifiers'];
    }): IEnemyInstance[];
    /**
     * Create elite enemy instance
     */
    createEliteEnemyInstance(templateName: string): IEnemyInstance | null;
    /**
     * Spawn enemy group
     */
    spawnEnemyGroup(templateName: string, config?: Partial<ISpawnConfig>): ISpawnResult;
    /**
     * Spawn random enemy group
     */
    spawnRandomEnemyGroup(type?: string, config?: Partial<ISpawnConfig>): ISpawnResult;
    /**
     * Spawn enemy group with environmental conditions
     */
    spawnEnemyGroupWithConditions(templateName: string, conditions: {
        timeOfDay: 'day' | 'night' | 'any';
        playerLevel: number;
        weather?: string;
        location?: string;
    }, config?: Partial<ISpawnConfig>): ISpawnResult;
    /**
     * Check if enemy is alive
     */
    isAlive(instance: IEnemyInstance): boolean;
    /**
     * Apply damage to enemy
     */
    applyDamage(instance: IEnemyInstance, damage: number, options?: {
        ignoreArmor?: boolean;
        damageType?: string;
        source?: string;
    }): IDamageResult;
    /**
     * Apply healing to enemy
     */
    applyHealing(instance: IEnemyInstance, healing: number, options?: {
        allowOverheal?: boolean;
        healingType?: string;
        source?: string;
    }): IHealingResult;
    /**
     * Get health status
     */
    getHealthStatus(instance: IEnemyInstance): HealthStatus;
    /**
     * Get health percentage
     */
    getHealthPercentage(instance: IEnemyInstance): number;
    /**
     * Kill enemy instantly
     */
    killEnemy(instance: IEnemyInstance): IDamageResult;
    /**
     * Get sprite for enemy instance
     */
    getEnemySprite(instance: IEnemyInstance, strategy?: SpriteSelectionStrategy): ISpriteSelectionResult;
    /**
     * Get random sprite for template
     */
    getRandomSprite(templateName: string): ISpriteSelectionResult;
    /**
     * Convert legacy enemy data
     */
    convertLegacyEnemy(legacyData: any): IConversionResult;
    /**
     * Convert template back to legacy format
     */
    convertToLegacyFormat(template: IEnemyTemplate): any;
    /**
     * Load legacy enemy data
     */
    loadLegacyEnemyData(legacyDataArray: any[]): {
        successful: IEnemyTemplate[];
        failed: IConversionResult[];
    };
    /**
     * Get template manager component
     */
    getTemplateManager(): EnemyTemplateManager;
    /**
     * Get instance factory component
     */
    getInstanceFactory(): EnemyInstanceFactory;
    /**
     * Get spawn manager component
     */
    getSpawnManager(): EnemySpawnManager;
    /**
     * Get health manager component
     */
    getHealthManager(): EnemyHealthManager;
    /**
     * Get legacy converter component
     */
    getLegacyConverter(): LegacyEnemyConverter;
    /**
     * Get sprite manager component
     */
    getSpriteManager(): EnemySpriteManager;
    /**
     * Get comprehensive system status
     */
    getSystemStatus(): {
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
    };
    /**
     * Validate all components
     */
    validateAllComponents(): boolean;
    /**
     * Reset all components
     */
    resetAllComponents(): void;
    /**
     * Load default enemy templates from legacy data
     */
    private loadDefaultEnemyTemplates;
    /**
     * Configure default settings for all components
     */
    private configureDefaultSettings;
}
