/**
 * EnemyTemplateManager - Single Responsibility: Enemy Template Storage and Retrieval
 *
 * Manages the storage, retrieval, and organization of enemy templates.
 * Handles template lookup by name, type, and random selection.
 *
 * SRP Compliance:
 * ✅ Only handles enemy template storage and retrieval
 * ✅ Does not handle instance creation or health management
 * ✅ Focused purely on template data management
 */
export declare class EnemyTemplateManager {
    private templates;
    constructor();
    /**
     * Register enemy template
     */
    registerTemplate(template: IEnemyTemplate): void;
    /**
     * Get enemy template by name
     */
    getTemplate(name: string): IEnemyTemplate | null;
    /**
     * Check if template exists
     */
    hasTemplate(name: string): boolean;
    /**
     * Get all registered templates
     */
    getAllTemplates(): IEnemyTemplate[];
    /**
     * Get template names
     */
    getTemplateNames(): string[];
    /**
     * Get templates by type
     */
    getTemplatesByType(type: string): IEnemyTemplate[];
    /**
     * Get random template
     */
    getRandomTemplate(): IEnemyTemplate | null;
    /**
     * Get random template by type
     */
    getRandomTemplateByType(type: string): IEnemyTemplate | null;
    /**
     * Remove template
     */
    removeTemplate(name: string): boolean;
    /**
     * Clear all templates
     */
    clearTemplates(): void;
    /**
     * Get template count
     */
    getTemplateCount(): number;
    /**
     * Get template statistics
     */
    getTemplateStats(): {
        totalTemplates: number;
        typeBreakdown: Map<string, number>;
        maxLevelRange: {
            min: number;
            max: number;
        };
        healthRange: {
            min: number;
            max: number;
        };
    };
    /**
     * Find templates by criteria
     */
    findTemplates(criteria: {
        type?: string;
        minLevel?: number;
        maxLevel?: number;
        minHealth?: number;
        maxHealth?: number;
    }): IEnemyTemplate[];
    /**
     * Validate template data
     */
    validateTemplate(template: IEnemyTemplate): boolean;
}
export interface IEnemyTemplate {
    name: string;
    type: string;
    maxLevel: number;
    experienceReward: number;
    defence: {
        health: number;
        armorClass: number;
        damageThreshold: number;
        damageResistance: number;
    };
    attack: {
        hitChance: number;
        weapon?: string;
        damage: {
            min: number;
            max: number;
        };
        shots: number;
        attackSpeed: number;
        criticalChance: number;
    };
    spawning: {
        min: number;
        max: number;
    };
    sprites: string[];
}
