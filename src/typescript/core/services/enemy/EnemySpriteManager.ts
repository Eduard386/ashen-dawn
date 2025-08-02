import { IEnemyTemplate } from './EnemyTemplateManager';
import { IEnemyInstance } from './EnemyInstanceFactory';

/**
 * Sprite selection strategy
 */
export enum SpriteSelectionStrategy {
  RANDOM = 'random',
  SEQUENTIAL = 'sequential',
  WEIGHTED = 'weighted',
  CONDITIONAL = 'conditional'
}

/**
 * Sprite metadata
 */
export interface ISpriteMetadata {
  name: string;
  path: string;
  weight?: number;
  conditions?: {
    healthRange?: { min: number; max: number };
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
export class EnemySpriteManager {
  private spriteMetadata: Map<string, ISpriteMetadata> = new Map();
  private defaultStrategy: SpriteSelectionStrategy = SpriteSelectionStrategy.RANDOM;
  private spriteHistory: Map<string, ISpriteSelectionResult[]> = new Map();
  private maxHistoryPerInstance: number = 20;
  private sequentialCounters: Map<string, number> = new Map();

  constructor() {
    // Empty constructor
  }

  /**
   * Get sprite for enemy template
   */
  public getSpriteForTemplate(
    template: IEnemyTemplate, 
    strategy?: SpriteSelectionStrategy
  ): ISpriteSelectionResult {
    const usedStrategy = strategy || this.defaultStrategy;
    
    if (template.sprites.length === 0) {
      return {
        spriteName: template.name,
        strategy: usedStrategy,
        timestamp: Date.now(),
        templateName: template.name
      };
    }

    const selectedSprite = this.selectSprite(template.sprites, usedStrategy, template);

    const result: ISpriteSelectionResult = {
      spriteName: selectedSprite,
      strategy: usedStrategy,
      timestamp: Date.now(),
      templateName: template.name
    };

    const metadata = this.spriteMetadata.get(selectedSprite);
    if (metadata) {
      result.spritePath = metadata.path;
    }

    return result;
  }

  /**
   * Get sprite for enemy instance
   */
  public getSpriteForInstance(
    instance: IEnemyInstance,
    template: IEnemyTemplate,
    strategy?: SpriteSelectionStrategy
  ): ISpriteSelectionResult {
    const usedStrategy = strategy || this.defaultStrategy;
    
    if (template.sprites.length === 0) {
      return {
        spriteName: template.name,
        strategy: usedStrategy,
        timestamp: Date.now(),
        instanceId: instance.id,
        templateName: template.name
      };
    }

    // Filter sprites based on instance conditions
    const validSprites = this.filterSpritesByConditions(template.sprites, instance);
    const selectedSprite = this.selectSprite(validSprites.length > 0 ? validSprites : template.sprites, usedStrategy, template, instance);

    const result: ISpriteSelectionResult = {
      spriteName: selectedSprite,
      strategy: usedStrategy,
      timestamp: Date.now(),
      instanceId: instance.id,
      templateName: template.name
    };

    const metadata = this.spriteMetadata.get(selectedSprite);
    if (metadata) {
      result.spritePath = metadata.path;
    }

    this.addToHistory(instance.id, result);

    return result;
  }

  /**
   * Register sprite metadata
   */
  public registerSpriteMetadata(spriteName: string, metadata: ISpriteMetadata): void {
    this.spriteMetadata.set(spriteName, metadata);
  }

  /**
   * Get sprite metadata
   */
  public getSpriteMetadata(spriteName: string): ISpriteMetadata | null {
    return this.spriteMetadata.get(spriteName) || null;
  }

  /**
   * Remove sprite metadata
   */
  public removeSpriteMetadata(spriteName: string): boolean {
    return this.spriteMetadata.delete(spriteName);
  }

  /**
   * Set default selection strategy
   */
  public setDefaultStrategy(strategy: SpriteSelectionStrategy): void {
    this.defaultStrategy = strategy;
  }

  /**
   * Get default selection strategy
   */
  public getDefaultStrategy(): SpriteSelectionStrategy {
    return this.defaultStrategy;
  }

  /**
   * Get sprite selection history for instance
   */
  public getSpriteHistory(instanceId: string): ISpriteSelectionResult[] {
    return [...(this.spriteHistory.get(instanceId) || [])];
  }

  /**
   * Get last selected sprite for instance
   */
  public getLastSprite(instanceId: string): ISpriteSelectionResult | null {
    const history = this.spriteHistory.get(instanceId);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  /**
   * Clear sprite history for instance
   */
  public clearSpriteHistory(instanceId: string): void {
    this.spriteHistory.delete(instanceId);
    this.sequentialCounters.delete(instanceId);
  }

  /**
   * Clear all sprite history
   */
  public clearAllSpriteHistory(): void {
    this.spriteHistory.clear();
    this.sequentialCounters.clear();
  }

  /**
   * Get sprite variations for a sprite
   */
  public getSpriteVariations(spriteName: string): string[] {
    const metadata = this.spriteMetadata.get(spriteName);
    return metadata?.variations || [];
  }

  /**
   * Check if sprite has variations
   */
  public hasSpriteVariations(spriteName: string): boolean {
    const variations = this.getSpriteVariations(spriteName);
    return variations.length > 0;
  }

  /**
   * Get random sprite variation
   */
  public getRandomVariation(spriteName: string): string {
    const variations = this.getSpriteVariations(spriteName);
    if (variations.length === 0) {
      return spriteName;
    }
    
    const randomIndex = Math.floor(Math.random() * variations.length);
    return variations[randomIndex];
  }

  /**
   * Get sprite statistics
   */
  public getSpriteStats(): {
    totalSpritesRegistered: number;
    totalInstancesTracked: number;
    totalSelections: number;
    strategyUsage: Map<SpriteSelectionStrategy, number>;
    popularSprites: Map<string, number>;
  } {
    const strategyUsage = new Map<SpriteSelectionStrategy, number>();
    const popularSprites = new Map<string, number>();
    let totalSelections = 0;

    this.spriteHistory.forEach(history => {
      history.forEach(selection => {
        totalSelections++;
        
        // Strategy usage
        const currentStrategyCount = strategyUsage.get(selection.strategy) || 0;
        strategyUsage.set(selection.strategy, currentStrategyCount + 1);
        
        // Popular sprites
        const currentSpriteCount = popularSprites.get(selection.spriteName) || 0;
        popularSprites.set(selection.spriteName, currentSpriteCount + 1);
      });
    });

    return {
      totalSpritesRegistered: this.spriteMetadata.size,
      totalInstancesTracked: this.spriteHistory.size,
      totalSelections,
      strategyUsage,
      popularSprites
    };
  }

  /**
   * Validate sprite list for template
   */
  public validateSpriteList(sprites: string[]): {
    valid: boolean;
    missingMetadata: string[];
    invalidPaths: string[];
  } {
    const missingMetadata: string[] = [];
    const invalidPaths: string[] = [];

    sprites.forEach(spriteName => {
      const metadata = this.spriteMetadata.get(spriteName);
      if (!metadata) {
        missingMetadata.push(spriteName);
      } else if (!metadata.path || metadata.path.trim() === '') {
        invalidPaths.push(spriteName);
      }
    });

    return {
      valid: missingMetadata.length === 0 && invalidPaths.length === 0,
      missingMetadata,
      invalidPaths
    };
  }

  /**
   * Get sprites by type
   */
  public getSpritesByType(type: string): string[] {
    const sprites: string[] = [];
    
    this.spriteMetadata.forEach((metadata, spriteName) => {
      if (metadata.conditions?.type?.includes(type)) {
        sprites.push(spriteName);
      }
    });

    return sprites;
  }

  /**
   * Set max history per instance
   */
  public setMaxHistoryPerInstance(maxEntries: number): void {
    if (maxEntries < 1) {
      console.error('Max history entries must be at least 1');
      return;
    }

    this.maxHistoryPerInstance = maxEntries;
    this.trimAllHistories();
  }

  // Private helper methods

  /**
   * Select sprite using specified strategy
   */
  private selectSprite(
    sprites: string[], 
    strategy: SpriteSelectionStrategy, 
    template: IEnemyTemplate,
    instance?: IEnemyInstance
  ): string {
    if (sprites.length === 0) {
      return template.name;
    }

    if (sprites.length === 1) {
      return sprites[0];
    }

    switch (strategy) {
      case SpriteSelectionStrategy.RANDOM:
        return this.selectRandomSprite(sprites);
        
      case SpriteSelectionStrategy.SEQUENTIAL:
        return this.selectSequentialSprite(sprites, instance?.id || template.name);
        
      case SpriteSelectionStrategy.WEIGHTED:
        return this.selectWeightedSprite(sprites);
        
      case SpriteSelectionStrategy.CONDITIONAL:
        return this.selectConditionalSprite(sprites, instance);
        
      default:
        return this.selectRandomSprite(sprites);
    }
  }

  /**
   * Select random sprite
   */
  private selectRandomSprite(sprites: string[]): string {
    const randomIndex = Math.floor(Math.random() * sprites.length);
    return sprites[randomIndex];
  }

  /**
   * Select sprite sequentially
   */
  private selectSequentialSprite(sprites: string[], key: string): string {
    const currentIndex = this.sequentialCounters.get(key) || 0;
    const sprite = sprites[currentIndex % sprites.length];
    this.sequentialCounters.set(key, currentIndex + 1);
    return sprite;
  }

  /**
   * Select sprite based on weights
   */
  private selectWeightedSprite(sprites: string[]): string {
    const weights: number[] = [];
    let totalWeight = 0;

    sprites.forEach(spriteName => {
      const metadata = this.spriteMetadata.get(spriteName);
      const weight = metadata?.weight || 1;
      weights.push(weight);
      totalWeight += weight;
    });

    if (totalWeight === 0) {
      return this.selectRandomSprite(sprites);
    }

    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < sprites.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return sprites[i];
      }
    }

    return sprites[sprites.length - 1];
  }

  /**
   * Select sprite based on conditions
   */
  private selectConditionalSprite(sprites: string[], instance?: IEnemyInstance): string {
    if (!instance) {
      return this.selectRandomSprite(sprites);
    }

    const validSprites = this.filterSpritesByConditions(sprites, instance);
    return validSprites.length > 0 ? this.selectRandomSprite(validSprites) : this.selectRandomSprite(sprites);
  }

  /**
   * Filter sprites by instance conditions
   */
  private filterSpritesByConditions(sprites: string[], instance: IEnemyInstance): string[] {
    return sprites.filter(spriteName => {
      const metadata = this.spriteMetadata.get(spriteName);
      if (!metadata?.conditions) {
        return true;
      }

      // Health range check
      if (metadata.conditions.healthRange) {
        const healthPercentage = (instance.currentHealth / instance.maxHealth) * 100;
        const range = metadata.conditions.healthRange;
        if (healthPercentage < range.min || healthPercentage > range.max) {
          return false;
        }
      }

      // Level check
      if (metadata.conditions.level && !metadata.conditions.level.includes(instance.level)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Add selection to history
   */
  private addToHistory(instanceId: string, result: ISpriteSelectionResult): void {
    if (!this.spriteHistory.has(instanceId)) {
      this.spriteHistory.set(instanceId, []);
    }

    const history = this.spriteHistory.get(instanceId)!;
    history.push(result);

    // Trim if necessary
    if (history.length > this.maxHistoryPerInstance) {
      history.shift();
    }
  }

  /**
   * Trim all histories to max size
   */
  private trimAllHistories(): void {
    this.spriteHistory.forEach(history => {
      while (history.length > this.maxHistoryPerInstance) {
        history.shift();
      }
    });
  }
}
