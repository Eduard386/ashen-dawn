import { IEnemyTemplate } from './EnemyTemplateManager';
import { IEnemyInstance } from './EnemyInstanceFactory';
/**
 * Sprite selection strategy
 */
export declare enum SpriteSelectionStrategy {
    RANDOM = "random",
    SEQUENTIAL = "sequential",
    WEIGHTED = "weighted",
    CONDITIONAL = "conditional"
}
/**
 * Sprite metadata
 */
export interface ISpriteMetadata {
    name: string;
    path: string;
    weight?: number;
    conditions?: {
        healthRange?: {
            min: number;
            max: number;
        };
        level?: number[];
        type?: string[];
    };
    variations?: string[];
}
/**
 * Sprite selection result
 */
export interface ISpriteSelectionResult {
    spriteName: string;
    spritePath?: string;
    strategy: SpriteSelectionStrategy;
    timestamp: number;
    instanceId?: string;
    templateName?: string;
}
/**
 * EnemySpriteManager - Single Responsibility: Enemy Sprite Management
 *
 * Manages enemy sprite selection, sprite metadata, and sprite variation logic.
 * Handles different selection strategies and conditional sprite display.
 *
 * SRP Compliance:
 * ✅ Only handles enemy sprite selection and sprite-related logic
 * ✅ Does not handle instance creation or health management
 * ✅ Focused purely on visual representation and sprite management
 */
export declare class EnemySpriteManager {
    private spriteMetadata;
    private defaultStrategy;
    private spriteHistory;
    private maxHistoryPerInstance;
    private sequentialCounters;
    constructor();
    /**
     * Get sprite for enemy template
     */
    getSpriteForTemplate(template: IEnemyTemplate, strategy?: SpriteSelectionStrategy): ISpriteSelectionResult;
    /**
     * Get sprite for enemy instance
     */
    getSpriteForInstance(instance: IEnemyInstance, template: IEnemyTemplate, strategy?: SpriteSelectionStrategy): ISpriteSelectionResult;
    /**
     * Register sprite metadata
     */
    registerSpriteMetadata(spriteName: string, metadata: ISpriteMetadata): void;
    /**
     * Get sprite metadata
     */
    getSpriteMetadata(spriteName: string): ISpriteMetadata | null;
    /**
     * Remove sprite metadata
     */
    removeSpriteMetadata(spriteName: string): boolean;
    /**
     * Set default selection strategy
     */
    setDefaultStrategy(strategy: SpriteSelectionStrategy): void;
    /**
     * Get default selection strategy
     */
    getDefaultStrategy(): SpriteSelectionStrategy;
    /**
     * Get sprite selection history for instance
     */
    getSpriteHistory(instanceId: string): ISpriteSelectionResult[];
    /**
     * Get last selected sprite for instance
     */
    getLastSprite(instanceId: string): ISpriteSelectionResult | null;
    /**
     * Clear sprite history for instance
     */
    clearSpriteHistory(instanceId: string): void;
    /**
     * Clear all sprite history
     */
    clearAllSpriteHistory(): void;
    /**
     * Get sprite variations for a sprite
     */
    getSpriteVariations(spriteName: string): string[];
    /**
     * Check if sprite has variations
     */
    hasSpriteVariations(spriteName: string): boolean;
    /**
     * Get random sprite variation
     */
    getRandomVariation(spriteName: string): string;
    /**
     * Get sprite statistics
     */
    getSpriteStats(): {
        totalSpritesRegistered: number;
        totalInstancesTracked: number;
        totalSelections: number;
        strategyUsage: Map<SpriteSelectionStrategy, number>;
        popularSprites: Map<string, number>;
    };
    /**
     * Validate sprite list for template
     */
    validateSpriteList(sprites: string[]): {
        valid: boolean;
        missingMetadata: string[];
        invalidPaths: string[];
    };
    /**
     * Get sprites by type
     */
    getSpritesByType(type: string): string[];
    /**
     * Set max history per instance
     */
    setMaxHistoryPerInstance(maxEntries: number): void;
    /**
     * Select sprite using specified strategy
     */
    private selectSprite;
    /**
     * Select random sprite
     */
    private selectRandomSprite;
    /**
     * Select sprite sequentially
     */
    private selectSequentialSprite;
    /**
     * Select sprite based on weights
     */
    private selectWeightedSprite;
    /**
     * Select sprite based on conditions
     */
    private selectConditionalSprite;
    /**
     * Filter sprites by instance conditions
     */
    private filterSpritesByConditions;
    /**
     * Add selection to history
     */
    private addToHistory;
    /**
     * Trim all histories to max size
     */
    private trimAllHistories;
}
