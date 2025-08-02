import { IEnemyInstance } from './EnemyInstanceFactory';

/**
 * Health status enumeration
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  WOUNDED = 'wounded',
  CRITICAL = 'critical',
  DEAD = 'dead'
}

/**
 * Damage application result
 */
export interface IDamageResult {
  instanceId: string;
  damageTaken: number;
  healthBefore: number;
  healthAfter: number;
  status: HealthStatus;
  wasKilled: boolean;
  timestamp: number;
}

/**
 * Healing application result
 */
export interface IHealingResult {
  instanceId: string;
  healingApplied: number;
  healthBefore: number;
  healthAfter: number;
  wasRevived: boolean;
  timestamp: number;
}

/**
 * EnemyHealthManager - Single Responsibility: Enemy Health State Management
 * 
 * Manages enemy health states, damage application, healing, and status tracking.
 * Handles health calculations, status determination, and health event tracking.
 * 
 * SRP Compliance:
 * ✅ Only handles enemy health state and health-related operations
 * ✅ Does not handle instance creation or spawning logic
 * ✅ Focused purely on health management and calculations
 */
export class EnemyHealthManager {
  private healthHistory: Map<string, Array<IDamageResult | IHealingResult>> = new Map();
  private maxHistoryPerInstance: number = 50;
  private healthCallbacks: Map<string, Array<(result: IDamageResult | IHealingResult) => void>> = new Map();

  constructor() {
    // Empty constructor
  }

  /**
   * Check if enemy instance is alive
   */
  public isAlive(instance: IEnemyInstance): boolean {
    return instance.currentHealth > 0;
  }

  /**
   * Check if enemy instance is dead
   */
  public isDead(instance: IEnemyInstance): boolean {
    return instance.currentHealth <= 0;
  }

  /**
   * Get health status of enemy instance
   */
  public getHealthStatus(instance: IEnemyInstance): HealthStatus {
    if (instance.currentHealth <= 0) {
      return HealthStatus.DEAD;
    }

    const healthPercentage = this.getHealthPercentage(instance);
    
    if (healthPercentage >= 75) {
      return HealthStatus.HEALTHY;
    } else if (healthPercentage >= 25) {
      return HealthStatus.WOUNDED;
    } else {
      return HealthStatus.CRITICAL;
    }
  }

  /**
   * Get health percentage (0-100)
   */
  public getHealthPercentage(instance: IEnemyInstance): number {
    if (instance.maxHealth <= 0) {
      return 0;
    }
    return Math.round((instance.currentHealth / instance.maxHealth) * 100);
  }

  /**
   * Apply damage to enemy instance
   */
  public applyDamage(instance: IEnemyInstance, damage: number, options?: {
    ignoreArmor?: boolean;
    damageType?: string;
    source?: string;
  }): IDamageResult {
    const healthBefore = instance.currentHealth;
    let finalDamage = Math.max(0, damage);

    // Apply damage
    instance.currentHealth = Math.max(0, instance.currentHealth - finalDamage);
    
    const healthAfter = instance.currentHealth;
    const wasKilled = healthBefore > 0 && healthAfter <= 0;
    const status = this.getHealthStatus(instance);

    const result: IDamageResult = {
      instanceId: instance.id,
      damageTaken: finalDamage,
      healthBefore,
      healthAfter,
      status,
      wasKilled,
      timestamp: Date.now()
    };

    this.addToHistory(instance.id, result);
    this.executeCallbacks('damage', result);

    return result;
  }

  /**
   * Apply healing to enemy instance
   */
  public applyHealing(instance: IEnemyInstance, healing: number, options?: {
    allowOverheal?: boolean;
    healingType?: string;
    source?: string;
  }): IHealingResult {
    const healthBefore = instance.currentHealth;
    const wasRevived = instance.currentHealth <= 0;
    
    let finalHealing = Math.max(0, healing);
    const maxAllowedHealth = options?.allowOverheal ? instance.maxHealth * 1.5 : instance.maxHealth;
    
    instance.currentHealth = Math.min(maxAllowedHealth, instance.currentHealth + finalHealing);
    
    const healthAfter = instance.currentHealth;
    const actualHealing = healthAfter - healthBefore;

    const result: IHealingResult = {
      instanceId: instance.id,
      healingApplied: actualHealing,
      healthBefore,
      healthAfter,
      wasRevived,
      timestamp: Date.now()
    };

    this.addToHistory(instance.id, result);
    this.executeCallbacks('healing', result);

    return result;
  }

  /**
   * Set health directly
   */
  public setHealth(instance: IEnemyInstance, newHealth: number, enforceMax: boolean = true): void {
    const maxHealth = enforceMax ? instance.maxHealth : Number.MAX_SAFE_INTEGER;
    instance.currentHealth = Math.max(0, Math.min(maxHealth, newHealth));
  }

  /**
   * Restore to full health
   */
  public restoreFullHealth(instance: IEnemyInstance): IHealingResult {
    const healingNeeded = instance.maxHealth - instance.currentHealth;
    return this.applyHealing(instance, healingNeeded);
  }

  /**
   * Kill enemy instance instantly
   */
  public kill(instance: IEnemyInstance): IDamageResult {
    const lethalDamage = instance.currentHealth;
    return this.applyDamage(instance, lethalDamage);
  }

  /**
   * Revive enemy instance
   */
  public revive(instance: IEnemyInstance, healthPercentage: number = 25): IHealingResult {
    const targetHealth = Math.floor(instance.maxHealth * (healthPercentage / 100));
    const healingNeeded = targetHealth;
    
    instance.currentHealth = 0; // Ensure we start from dead
    return this.applyHealing(instance, healingNeeded);
  }

  /**
   * Get health history for instance
   */
  public getHealthHistory(instanceId: string): Array<IDamageResult | IHealingResult> {
    return [...(this.healthHistory.get(instanceId) || [])];
  }

  /**
   * Get damage history for instance
   */
  public getDamageHistory(instanceId: string): IDamageResult[] {
    const history = this.healthHistory.get(instanceId) || [];
    return history.filter(entry => 'damageTaken' in entry) as IDamageResult[];
  }

  /**
   * Get healing history for instance
   */
  public getHealingHistory(instanceId: string): IHealingResult[] {
    const history = this.healthHistory.get(instanceId) || [];
    return history.filter(entry => 'healingApplied' in entry) as IHealingResult[];
  }

  /**
   * Clear health history for instance
   */
  public clearHealthHistory(instanceId: string): void {
    this.healthHistory.delete(instanceId);
  }

  /**
   * Clear all health history
   */
  public clearAllHealthHistory(): void {
    this.healthHistory.clear();
  }

  /**
   * Set maximum history entries per instance
   */
  public setMaxHistoryPerInstance(maxEntries: number): void {
    if (maxEntries < 1) {
      console.error('Max history entries must be at least 1');
      return;
    }

    this.maxHistoryPerInstance = maxEntries;
    this.trimAllHistories();
  }

  /**
   * Register health event callback
   */
  public onHealthEvent(event: 'damage' | 'healing', callback: (result: IDamageResult | IHealingResult) => void): void {
    if (!this.healthCallbacks.has(event)) {
      this.healthCallbacks.set(event, []);
    }
    this.healthCallbacks.get(event)!.push(callback);
  }

  /**
   * Remove health event callback
   */
  public removeHealthCallback(event: 'damage' | 'healing', callback: (result: IDamageResult | IHealingResult) => void): boolean {
    const callbacks = this.healthCallbacks.get(event);
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
   * Clear all health callbacks
   */
  public clearHealthCallbacks(): void {
    this.healthCallbacks.clear();
  }

  /**
   * Get health statistics for instance
   */
  public getHealthStats(instanceId: string): {
    totalDamageTaken: number;
    totalHealingReceived: number;
    timesKilled: number;
    timesRevived: number;
    averageDamagePerHit: number;
    averageHealingPerApplication: number;
    currentStatus: HealthStatus | null;
  } {
    const history = this.healthHistory.get(instanceId) || [];
    const damageEntries = history.filter(entry => 'damageTaken' in entry) as IDamageResult[];
    const healingEntries = history.filter(entry => 'healingApplied' in entry) as IHealingResult[];

    const totalDamage = damageEntries.reduce((sum, entry) => sum + entry.damageTaken, 0);
    const totalHealing = healingEntries.reduce((sum, entry) => sum + entry.healingApplied, 0);
    const timesKilled = damageEntries.filter(entry => entry.wasKilled).length;
    const timesRevived = healingEntries.filter(entry => entry.wasRevived).length;

    return {
      totalDamageTaken: totalDamage,
      totalHealingReceived: totalHealing,
      timesKilled,
      timesRevived,
      averageDamagePerHit: damageEntries.length > 0 ? totalDamage / damageEntries.length : 0,
      averageHealingPerApplication: healingEntries.length > 0 ? totalHealing / healingEntries.length : 0,
      currentStatus: damageEntries.length > 0 ? damageEntries[damageEntries.length - 1].status : null
    };
  }

  /**
   * Get overall health manager statistics
   */
  public getManagerStats(): {
    totalInstancesTracked: number;
    totalHealthEvents: number;
    averageEventsPerInstance: number;
    maxHistoryPerInstance: number;
  } {
    const instanceCount = this.healthHistory.size;
    let totalEvents = 0;

    this.healthHistory.forEach(history => {
      totalEvents += history.length;
    });

    return {
      totalInstancesTracked: instanceCount,
      totalHealthEvents: totalEvents,
      averageEventsPerInstance: instanceCount > 0 ? totalEvents / instanceCount : 0,
      maxHistoryPerInstance: this.maxHistoryPerInstance
    };
  }

  /**
   * Validate instance health state
   */
  public validateHealthState(instance: IEnemyInstance): boolean {
    if (instance.currentHealth < 0) {
      return false;
    }

    if (instance.maxHealth <= 0) {
      return false;
    }

    if (instance.currentHealth > instance.maxHealth * 2) {
      // Allow some overheal but not excessive
      return false;
    }

    return true;
  }

  // Private helper methods

  /**
   * Add entry to health history
   */
  private addToHistory(instanceId: string, entry: IDamageResult | IHealingResult): void {
    if (!this.healthHistory.has(instanceId)) {
      this.healthHistory.set(instanceId, []);
    }

    const history = this.healthHistory.get(instanceId)!;
    history.push(entry);

    // Trim if necessary
    if (history.length > this.maxHistoryPerInstance) {
      history.shift();
    }
  }

  /**
   * Trim all histories to max size
   */
  private trimAllHistories(): void {
    this.healthHistory.forEach(history => {
      while (history.length > this.maxHistoryPerInstance) {
        history.shift();
      }
    });
  }

  /**
   * Execute health event callbacks
   */
  private executeCallbacks(event: 'damage' | 'healing', result: IDamageResult | IHealingResult): void {
    const callbacks = this.healthCallbacks.get(event);
    if (!callbacks) {
      return;
    }

    callbacks.forEach((callback, index) => {
      try {
        callback(result);
      } catch (error) {
        console.error(`Health ${event} callback ${index} failed:`, error);
      }
    });
  }
}
