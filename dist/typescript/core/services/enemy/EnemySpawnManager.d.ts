import { IEnemyTemplate } from './EnemyTemplateManager';
import { IEnemyInstance } from './EnemyInstanceFactory';
/**
 * Spawn configuration for enemy groups
 */
export interface ISpawnConfig {
    groupSizeRange: {
        min: number;
        max: number;
    };
    spawnChance: number;
    level?: number;
    modifiers?: IEnemyInstance['modifiers'];
    location?: string;
    spawnConditions?: {
        timeOfDay?: 'day' | 'night' | 'any';
        playerLevel?: {
            min?: number;
            max?: number;
        };
        weather?: string;
    };
}
/**
 * Spawn result data
 */
export interface ISpawnResult {
    success: boolean;
    instances: IEnemyInstance[];
    spawnLocation?: string;
    spawnTime: number;
    spawnConditions?: ISpawnConfig['spawnConditions'];
    actualGroupSize: number;
    templateUsed: string;
}
/**
 * EnemySpawnManager - Single Responsibility: Enemy Group Spawning Logic
 *
 * Manages enemy group spawning with configurable rules and conditions.
 * Handles spawn probability, group sizes, and environmental conditions.
 *
 * SRP Compliance:
 * ✅ Only handles enemy spawning logic and group generation
 * ✅ Does not handle instance creation or template management
 * ✅ Focused purely on spawn mechanics and rules
 */
export declare class EnemySpawnManager {
    private defaultSpawnConfig;
    private spawnHistory;
    private maxHistorySize;
    private spawnCallbacks;
    constructor();
    /**
     * Spawn enemy group from template
     */
    spawnGroup(template: IEnemyTemplate, instanceFactory: any, // EnemyInstanceFactory
    config?: Partial<ISpawnConfig>): ISpawnResult;
    /**
     * Attempt multiple spawns with different templates
     */
    spawnMultipleGroups(templates: IEnemyTemplate[], instanceFactory: any, config?: Partial<ISpawnConfig>): ISpawnResult[];
    /**
     * Spawn with environmental conditions
     */
    spawnWithConditions(template: IEnemyTemplate, instanceFactory: any, conditions: {
        timeOfDay: 'day' | 'night' | 'any';
        playerLevel: number;
        weather?: string;
        location?: string;
    }, config?: Partial<ISpawnConfig>): ISpawnResult;
    /**
     * Spawn random group from template list
     */
    spawnRandomGroup(templates: IEnemyTemplate[], instanceFactory: any, config?: Partial<ISpawnConfig>): ISpawnResult;
    /**
     * Set default spawn configuration
     */
    setDefaultSpawnConfig(config: Partial<ISpawnConfig>): void;
    /**
     * Get default spawn configuration
     */
    getDefaultSpawnConfig(): ISpawnConfig;
    /**
     * Get spawn history
     */
    getSpawnHistory(limit?: number): ISpawnResult[];
    /**
     * Get successful spawns from history
     */
    getSuccessfulSpawns(limit?: number): ISpawnResult[];
    /**
     * Get failed spawns from history
     */
    getFailedSpawns(limit?: number): ISpawnResult[];
    /**
     * Clear spawn history
     */
    clearSpawnHistory(): void;
    /**
     * Set maximum history size
     */
    setMaxHistorySize(size: number): void;
    /**
     * Register spawn event callback
     */
    onSpawn(event: 'success' | 'failed', callback: (result: ISpawnResult) => void): void;
    /**
     * Remove spawn event callback
     */
    removeSpawnCallback(event: 'success' | 'failed', callback: (result: ISpawnResult) => void): boolean;
    /**
     * Clear all spawn callbacks
     */
    clearSpawnCallbacks(): void;
    /**
     * Get spawn statistics
     */
    getSpawnStats(): {
        totalSpawnAttempts: number;
        successfulSpawns: number;
        failedSpawns: number;
        successRate: number;
        averageGroupSize: number;
        templateUsage: Map<string, number>;
        locationUsage: Map<string, number>;
    };
    /**
     * Merge spawn config with defaults
     */
    private mergeConfig;
    /**
     * Calculate group size from template and config
     */
    private calculateGroupSize;
    /**
     * Check if spawn conditions are met
     */
    private checkSpawnConditions;
    /**
     * Add spawn result to history
     */
    private addToHistory;
    /**
     * Trim history to maximum size
     */
    private trimHistory;
    /**
     * Execute spawn event callbacks
     */
    private executeCallbacks;
}
