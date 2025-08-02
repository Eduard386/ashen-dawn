import { IEnemyTemplate } from './EnemyTemplateManager';
/**
 * Enemy instance data interface
 */
export interface IEnemyInstance {
    id: string;
    templateName: string;
    currentHealth: number;
    maxHealth: number;
    level: number;
    createdAt: number;
    modifiers?: {
        healthBonus?: number;
        damageBonus?: number;
        hitChanceBonus?: number;
        experienceMultiplier?: number;
    };
}
/**
 * EnemyInstanceFactory - Single Responsibility: Enemy Instance Creation
 *
 * Creates enemy instances from templates with randomization and variations.
 * Handles health variation, level scaling, and unique instance generation.
 *
 * SRP Compliance:
 * ✅ Only handles enemy instance creation from templates
 * ✅ Does not handle template storage or health management
 * ✅ Focused purely on instance generation logic
 */
export declare class EnemyInstanceFactory {
    private healthVariationRange;
    private levelVariationEnabled;
    private instanceCounter;
    constructor();
    /**
     * Create enemy instance from template
     */
    createInstance(template: IEnemyTemplate, options?: {
        level?: number;
        healthVariation?: {
            min: number;
            max: number;
        };
        modifiers?: IEnemyInstance['modifiers'];
        id?: string;
    }): IEnemyInstance;
    /**
     * Create multiple instances from template
     */
    createInstances(template: IEnemyTemplate, count: number, options?: {
        level?: number;
        healthVariation?: {
            min: number;
            max: number;
        };
        modifiers?: IEnemyInstance['modifiers'];
    }): IEnemyInstance[];
    /**
     * Create instance with specific health
     */
    createInstanceWithHealth(template: IEnemyTemplate, currentHealth: number, maxHealth?: number): IEnemyInstance;
    /**
     * Create elite instance (stronger variant)
     */
    createEliteInstance(template: IEnemyTemplate): IEnemyInstance;
    /**
     * Create weak instance (weaker variant)
     */
    createWeakInstance(template: IEnemyTemplate): IEnemyInstance;
    /**
     * Set health variation range
     */
    setHealthVariationRange(min: number, max: number): void;
    /**
     * Get current health variation range
     */
    getHealthVariationRange(): {
        min: number;
        max: number;
    };
    /**
     * Enable/disable level variation
     */
    setLevelVariationEnabled(enabled: boolean): void;
    /**
     * Check if level variation is enabled
     */
    isLevelVariationEnabled(): boolean;
    /**
     * Get instance creation statistics
     */
    getCreationStats(): {
        totalInstancesCreated: number;
        healthVariationRange: {
            min: number;
            max: number;
        };
        levelVariationEnabled: boolean;
    };
    /**
     * Reset creation counter
     */
    resetCreationCounter(): void;
    /**
     * Clone existing instance
     */
    cloneInstance(instance: IEnemyInstance): IEnemyInstance;
    /**
     * Validate instance data
     */
    validateInstance(instance: IEnemyInstance): boolean;
    /**
     * Generate unique instance ID
     */
    private generateInstanceId;
    /**
     * Generate random level
     */
    private generateRandomLevel;
    /**
     * Get level-based health multiplier
     */
    private getLevelHealthMultiplier;
    /**
     * Generate random number between min and max
     */
    private randomBetween;
}
