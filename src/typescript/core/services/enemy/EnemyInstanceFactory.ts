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
export class EnemyInstanceFactory {
  private healthVariationRange: { min: number; max: number } = { min: 0.8, max: 1.0 };
  private levelVariationEnabled: boolean = true;
  private instanceCounter: number = 0;

  constructor() {
    // Empty constructor - configuration via setters
  }

  /**
   * Create enemy instance from template
   */
  public createInstance(template: IEnemyTemplate, options?: {
    level?: number;
    healthVariation?: { min: number; max: number };
    modifiers?: IEnemyInstance['modifiers'];
    id?: string;
  }): IEnemyInstance {
    const level = options?.level || this.generateRandomLevel(template.maxLevel);
    const healthVariation = options?.healthVariation || this.healthVariationRange;
    
    // Calculate health with variation
    const baseHealth = template.defence.health;
    const variationMultiplier = this.randomBetween(healthVariation.min, healthVariation.max);
    const scaledHealth = Math.floor(baseHealth * this.getLevelHealthMultiplier(level));
    const finalMaxHealth = Math.floor(scaledHealth * variationMultiplier);

    // Generate unique ID
    const instanceId = options?.id || this.generateInstanceId(template.name);

    return {
      id: instanceId,
      templateName: template.name,
      currentHealth: finalMaxHealth,
      maxHealth: finalMaxHealth,
      level: level,
      createdAt: Date.now(),
      modifiers: options?.modifiers || {}
    };
  }

  /**
   * Create multiple instances from template
   */
  public createInstances(template: IEnemyTemplate, count: number, options?: {
    level?: number;
    healthVariation?: { min: number; max: number };
    modifiers?: IEnemyInstance['modifiers'];
  }): IEnemyInstance[] {
    const instances: IEnemyInstance[] = [];

    for (let i = 0; i < count; i++) {
      const instance = this.createInstance(template, options);
      instances.push(instance);
    }

    return instances;
  }

  /**
   * Create instance with specific health
   */
  public createInstanceWithHealth(template: IEnemyTemplate, currentHealth: number, maxHealth?: number): IEnemyInstance {
    const finalMaxHealth = maxHealth || template.defence.health;
    const clampedCurrentHealth = Math.max(0, Math.min(currentHealth, finalMaxHealth));

    return {
      id: this.generateInstanceId(template.name),
      templateName: template.name,
      currentHealth: clampedCurrentHealth,
      maxHealth: finalMaxHealth,
      level: template.maxLevel,
      createdAt: Date.now(),
      modifiers: {}
    };
  }

  /**
   * Create elite instance (stronger variant)
   */
  public createEliteInstance(template: IEnemyTemplate): IEnemyInstance {
    const eliteLevel = Math.min(template.maxLevel + 2, 10); // Cap at level 10
    const eliteModifiers: IEnemyInstance['modifiers'] = {
      healthBonus: 0.5, // +50% health
      damageBonus: 0.3, // +30% damage
      hitChanceBonus: 10, // +10% hit chance
      experienceMultiplier: 1.5 // +50% experience
    };

    return this.createInstance(template, {
      level: eliteLevel,
      healthVariation: { min: 1.0, max: 1.2 }, // Elite always has good health
      modifiers: eliteModifiers
    });
  }

  /**
   * Create weak instance (weaker variant)
   */
  public createWeakInstance(template: IEnemyTemplate): IEnemyInstance {
    const weakLevel = Math.max(template.maxLevel - 1, 1); // Min level 1
    const weakModifiers: IEnemyInstance['modifiers'] = {
      healthBonus: -0.3, // -30% health
      damageBonus: -0.2, // -20% damage
      hitChanceBonus: -10, // -10% hit chance
      experienceMultiplier: 0.7 // -30% experience
    };

    return this.createInstance(template, {
      level: weakLevel,
      healthVariation: { min: 0.5, max: 0.8 }, // Weak always has poor health
      modifiers: weakModifiers
    });
  }

  /**
   * Set health variation range
   */
  public setHealthVariationRange(min: number, max: number): void {
    if (min < 0 || max < 0 || min > max) {
      console.error('Invalid health variation range');
      return;
    }

    this.healthVariationRange = { min, max };
  }

  /**
   * Get current health variation range
   */
  public getHealthVariationRange(): { min: number; max: number } {
    return { ...this.healthVariationRange };
  }

  /**
   * Enable/disable level variation
   */
  public setLevelVariationEnabled(enabled: boolean): void {
    this.levelVariationEnabled = enabled;
  }

  /**
   * Check if level variation is enabled
   */
  public isLevelVariationEnabled(): boolean {
    return this.levelVariationEnabled;
  }

  /**
   * Get instance creation statistics
   */
  public getCreationStats(): {
    totalInstancesCreated: number;
    healthVariationRange: { min: number; max: number };
    levelVariationEnabled: boolean;
  } {
    return {
      totalInstancesCreated: this.instanceCounter,
      healthVariationRange: this.getHealthVariationRange(),
      levelVariationEnabled: this.levelVariationEnabled
    };
  }

  /**
   * Reset creation counter
   */
  public resetCreationCounter(): void {
    this.instanceCounter = 0;
  }

  /**
   * Clone existing instance
   */
  public cloneInstance(instance: IEnemyInstance): IEnemyInstance {
    return {
      id: this.generateInstanceId(instance.templateName),
      templateName: instance.templateName,
      currentHealth: instance.maxHealth, // Clone with full health
      maxHealth: instance.maxHealth,
      level: instance.level,
      createdAt: Date.now(),
      modifiers: instance.modifiers ? { ...instance.modifiers } : {}
    };
  }

  /**
   * Validate instance data
   */
  public validateInstance(instance: IEnemyInstance): boolean {
    if (!instance || typeof instance !== 'object') {
      return false;
    }

    if (!instance.id || typeof instance.id !== 'string') {
      return false;
    }

    if (!instance.templateName || typeof instance.templateName !== 'string') {
      return false;
    }

    if (typeof instance.currentHealth !== 'number' || instance.currentHealth < 0) {
      return false;
    }

    if (typeof instance.maxHealth !== 'number' || instance.maxHealth <= 0) {
      return false;
    }

    if (instance.currentHealth > instance.maxHealth) {
      return false;
    }

    if (typeof instance.level !== 'number' || instance.level < 1) {
      return false;
    }

    return true;
  }

  // Private helper methods

  /**
   * Generate unique instance ID
   */
  private generateInstanceId(templateName: string): string {
    this.instanceCounter++;
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${templateName}_${timestamp}_${random}_${this.instanceCounter}`;
  }

  /**
   * Generate random level
   */
  private generateRandomLevel(maxLevel: number): number {
    if (!this.levelVariationEnabled) {
      return maxLevel;
    }

    // 70% chance for max level, 30% for lower levels
    if (Math.random() < 0.7) {
      return maxLevel;
    }

    return Math.max(1, maxLevel - Math.floor(Math.random() * 2));
  }

  /**
   * Get level-based health multiplier
   */
  private getLevelHealthMultiplier(level: number): number {
    // Each level above 1 adds 10% health
    return 1 + (level - 1) * 0.1;
  }

  /**
   * Generate random number between min and max
   */
  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
