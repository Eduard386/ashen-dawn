import { IEnemyTemplate } from './EnemyTemplateManager';
import { IEnemyInstance } from './EnemyInstanceFactory';

/**
 * Spawn configuration for enemy groups
 */
export interface ISpawnConfig {
  groupSizeRange: { min: number; max: number };
  spawnChance: number; // 0-1 probability
  level?: number;
  modifiers?: IEnemyInstance['modifiers'];
  location?: string;
  spawnConditions?: {
    timeOfDay?: 'day' | 'night' | 'any';
    playerLevel?: { min?: number; max?: number };
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
export class EnemySpawnManager {
  private defaultSpawnConfig: ISpawnConfig = {
    groupSizeRange: { min: 1, max: 3 },
    spawnChance: 0.8,
    spawnConditions: {
      timeOfDay: 'any'
    }
  };
  
  private spawnHistory: ISpawnResult[] = [];
  private maxHistorySize: number = 100;
  private spawnCallbacks: Map<string, Array<(result: ISpawnResult) => void>> = new Map();

  constructor() {
    // Empty constructor
  }

  /**
   * Spawn enemy group from template
   */
  public spawnGroup(
    template: IEnemyTemplate, 
    instanceFactory: any, // EnemyInstanceFactory
    config?: Partial<ISpawnConfig>
  ): ISpawnResult {
    const spawnConfig = this.mergeConfig(config);
    
    // Check spawn chance
    if (Math.random() > spawnConfig.spawnChance) {
      const failResult: ISpawnResult = {
        success: false,
        instances: [],
        spawnTime: Date.now(),
        actualGroupSize: 0,
        templateUsed: template.name
      };
      
      this.addToHistory(failResult);
      this.executeCallbacks('failed', failResult);
      return failResult;
    }

    // Determine group size
    const groupSize = this.calculateGroupSize(template, spawnConfig);
    
    // Create instances
    const instances = instanceFactory.createInstances(template, groupSize, {
      level: spawnConfig.level,
      modifiers: spawnConfig.modifiers
    });

    const result: ISpawnResult = {
      success: true,
      instances,
      spawnLocation: spawnConfig.location,
      spawnTime: Date.now(),
      spawnConditions: spawnConfig.spawnConditions,
      actualGroupSize: groupSize,
      templateUsed: template.name
    };

    this.addToHistory(result);
    this.executeCallbacks('success', result);
    
    return result;
  }

  /**
   * Attempt multiple spawns with different templates
   */
  public spawnMultipleGroups(
    templates: IEnemyTemplate[],
    instanceFactory: any,
    config?: Partial<ISpawnConfig>
  ): ISpawnResult[] {
    const results: ISpawnResult[] = [];

    templates.forEach(template => {
      const result = this.spawnGroup(template, instanceFactory, config);
      results.push(result);
    });

    return results;
  }

  /**
   * Spawn with environmental conditions
   */
  public spawnWithConditions(
    template: IEnemyTemplate,
    instanceFactory: any,
    conditions: {
      timeOfDay: 'day' | 'night' | 'any';
      playerLevel: number;
      weather?: string;
      location?: string;
    },
    config?: Partial<ISpawnConfig>
  ): ISpawnResult {
    // Check if conditions allow spawning
    if (!this.checkSpawnConditions(conditions, config?.spawnConditions)) {
      return {
        success: false,
        instances: [],
        spawnTime: Date.now(),
        actualGroupSize: 0,
        templateUsed: template.name
      };
    }

    // Modify spawn config based on conditions
    const modifiedConfig = { ...config };
    modifiedConfig.location = conditions.location;
    modifiedConfig.spawnConditions = {
      timeOfDay: conditions.timeOfDay,
      weather: conditions.weather
    };

    return this.spawnGroup(template, instanceFactory, modifiedConfig);
  }

  /**
   * Spawn random group from template list
   */
  public spawnRandomGroup(
    templates: IEnemyTemplate[],
    instanceFactory: any,
    config?: Partial<ISpawnConfig>
  ): ISpawnResult {
    if (templates.length === 0) {
      return {
        success: false,
        instances: [],
        spawnTime: Date.now(),
        actualGroupSize: 0,
        templateUsed: 'none'
      };
    }

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    return this.spawnGroup(randomTemplate, instanceFactory, config);
  }

  /**
   * Set default spawn configuration
   */
  public setDefaultSpawnConfig(config: Partial<ISpawnConfig>): void {
    this.defaultSpawnConfig = { ...this.defaultSpawnConfig, ...config };
  }

  /**
   * Get default spawn configuration
   */
  public getDefaultSpawnConfig(): ISpawnConfig {
    return { ...this.defaultSpawnConfig };
  }

  /**
   * Get spawn history
   */
  public getSpawnHistory(limit?: number): ISpawnResult[] {
    const history = [...this.spawnHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Get successful spawns from history
   */
  public getSuccessfulSpawns(limit?: number): ISpawnResult[] {
    const successful = this.spawnHistory.filter(result => result.success);
    return limit ? successful.slice(-limit) : successful;
  }

  /**
   * Get failed spawns from history
   */
  public getFailedSpawns(limit?: number): ISpawnResult[] {
    const failed = this.spawnHistory.filter(result => !result.success);
    return limit ? failed.slice(-limit) : failed;
  }

  /**
   * Clear spawn history
   */
  public clearSpawnHistory(): void {
    this.spawnHistory = [];
  }

  /**
   * Set maximum history size
   */
  public setMaxHistorySize(size: number): void {
    if (size < 1) {
      console.error('History size must be at least 1');
      return;
    }

    this.maxHistorySize = size;
    this.trimHistory();
  }

  /**
   * Register spawn event callback
   */
  public onSpawn(event: 'success' | 'failed', callback: (result: ISpawnResult) => void): void {
    if (!this.spawnCallbacks.has(event)) {
      this.spawnCallbacks.set(event, []);
    }
    this.spawnCallbacks.get(event)!.push(callback);
  }

  /**
   * Remove spawn event callback
   */
  public removeSpawnCallback(event: 'success' | 'failed', callback: (result: ISpawnResult) => void): boolean {
    const callbacks = this.spawnCallbacks.get(event);
    if (!callbacks) {
      return false;
    }

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all spawn callbacks
   */
  public clearSpawnCallbacks(): void {
    this.spawnCallbacks.clear();
  }

  /**
   * Get spawn statistics
   */
  public getSpawnStats(): {
    totalSpawnAttempts: number;
    successfulSpawns: number;
    failedSpawns: number;
    successRate: number;
    averageGroupSize: number;
    templateUsage: Map<string, number>;
    locationUsage: Map<string, number>;
  } {
    const totalAttempts = this.spawnHistory.length;
    const successful = this.spawnHistory.filter(result => result.success);
    const templateUsage = new Map<string, number>();
    const locationUsage = new Map<string, number>();

    let totalGroupSize = 0;

    this.spawnHistory.forEach(result => {
      // Template usage
      const currentCount = templateUsage.get(result.templateUsed) || 0;
      templateUsage.set(result.templateUsed, currentCount + 1);

      // Location usage
      if (result.spawnLocation) {
        const currentLocationCount = locationUsage.get(result.spawnLocation) || 0;
        locationUsage.set(result.spawnLocation, currentLocationCount + 1);
      }

      // Group size tracking
      totalGroupSize += result.actualGroupSize;
    });

    return {
      totalSpawnAttempts: totalAttempts,
      successfulSpawns: successful.length,
      failedSpawns: totalAttempts - successful.length,
      successRate: totalAttempts > 0 ? successful.length / totalAttempts : 0,
      averageGroupSize: totalAttempts > 0 ? totalGroupSize / totalAttempts : 0,
      templateUsage,
      locationUsage
    };
  }

  // Private helper methods

  /**
   * Merge spawn config with defaults
   */
  private mergeConfig(config?: Partial<ISpawnConfig>): ISpawnConfig {
    return {
      ...this.defaultSpawnConfig,
      ...config,
      spawnConditions: {
        ...this.defaultSpawnConfig.spawnConditions,
        ...config?.spawnConditions
      }
    };
  }

  /**
   * Calculate group size from template and config
   */
  private calculateGroupSize(template: IEnemyTemplate, config: ISpawnConfig): number {
    // Use config range if provided, otherwise template range
    const min = config.groupSizeRange.min;
    const max = config.groupSizeRange.max;
    
    // Clamp to template limits
    const finalMin = Math.max(min, template.spawning.min);
    const finalMax = Math.min(max, template.spawning.max);
    
    return Math.floor(Math.random() * (finalMax - finalMin + 1)) + finalMin;
  }

  /**
   * Check if spawn conditions are met
   */
  private checkSpawnConditions(
    current: { timeOfDay: string; playerLevel: number; weather?: string },
    required?: ISpawnConfig['spawnConditions']
  ): boolean {
    if (!required) {
      return true;
    }

    // Time of day check
    if (required.timeOfDay && required.timeOfDay !== 'any' && current.timeOfDay !== required.timeOfDay) {
      return false;
    }

    // Player level check
    if (required.playerLevel) {
      if (required.playerLevel.min !== undefined && current.playerLevel < required.playerLevel.min) {
        return false;
      }
      if (required.playerLevel.max !== undefined && current.playerLevel > required.playerLevel.max) {
        return false;
      }
    }

    // Weather check
    if (required.weather && current.weather !== required.weather) {
      return false;
    }

    return true;
  }

  /**
   * Add spawn result to history
   */
  private addToHistory(result: ISpawnResult): void {
    this.spawnHistory.push(result);
    this.trimHistory();
  }

  /**
   * Trim history to maximum size
   */
  private trimHistory(): void {
    while (this.spawnHistory.length > this.maxHistorySize) {
      this.spawnHistory.shift();
    }
  }

  /**
   * Execute spawn event callbacks
   */
  private executeCallbacks(event: 'success' | 'failed', result: ISpawnResult): void {
    const callbacks = this.spawnCallbacks.get(event);
    if (!callbacks) {
      return;
    }

    callbacks.forEach((callback, index) => {
      try {
        callback(result);
      } catch (error) {
        console.error(`Spawn ${event} callback ${index} failed:`, error);
      }
    });
  }
}
