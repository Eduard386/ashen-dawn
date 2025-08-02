import { IEnemyInstance } from './EnemyInstanceFactory';
/**
 * Health status enumeration
 */
export declare enum HealthStatus {
    HEALTHY = "healthy",
    WOUNDED = "wounded",
    CRITICAL = "critical",
    DEAD = "dead"
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
export declare class EnemyHealthManager {
    private healthHistory;
    private maxHistoryPerInstance;
    private healthCallbacks;
    constructor();
    /**
     * Check if enemy instance is alive
     */
    isAlive(instance: IEnemyInstance): boolean;
    /**
     * Check if enemy instance is dead
     */
    isDead(instance: IEnemyInstance): boolean;
    /**
     * Get health status of enemy instance
     */
    getHealthStatus(instance: IEnemyInstance): HealthStatus;
    /**
     * Get health percentage (0-100)
     */
    getHealthPercentage(instance: IEnemyInstance): number;
    /**
     * Apply damage to enemy instance
     */
    applyDamage(instance: IEnemyInstance, damage: number, options?: {
        ignoreArmor?: boolean;
        damageType?: string;
        source?: string;
    }): IDamageResult;
    /**
     * Apply healing to enemy instance
     */
    applyHealing(instance: IEnemyInstance, healing: number, options?: {
        allowOverheal?: boolean;
        healingType?: string;
        source?: string;
    }): IHealingResult;
    /**
     * Set health directly
     */
    setHealth(instance: IEnemyInstance, newHealth: number, enforceMax?: boolean): void;
    /**
     * Restore to full health
     */
    restoreFullHealth(instance: IEnemyInstance): IHealingResult;
    /**
     * Kill enemy instance instantly
     */
    kill(instance: IEnemyInstance): IDamageResult;
    /**
     * Revive enemy instance
     */
    revive(instance: IEnemyInstance, healthPercentage?: number): IHealingResult;
    /**
     * Get health history for instance
     */
    getHealthHistory(instanceId: string): Array<IDamageResult | IHealingResult>;
    /**
     * Get damage history for instance
     */
    getDamageHistory(instanceId: string): IDamageResult[];
    /**
     * Get healing history for instance
     */
    getHealingHistory(instanceId: string): IHealingResult[];
    /**
     * Clear health history for instance
     */
    clearHealthHistory(instanceId: string): void;
    /**
     * Clear all health history
     */
    clearAllHealthHistory(): void;
    /**
     * Set maximum history entries per instance
     */
    setMaxHistoryPerInstance(maxEntries: number): void;
    /**
     * Register health event callback
     */
    onHealthEvent(event: 'damage' | 'healing', callback: (result: IDamageResult | IHealingResult) => void): void;
    /**
     * Remove health event callback
     */
    removeHealthCallback(event: 'damage' | 'healing', callback: (result: IDamageResult | IHealingResult) => void): boolean;
    /**
     * Clear all health callbacks
     */
    clearHealthCallbacks(): void;
    /**
     * Get health statistics for instance
     */
    getHealthStats(instanceId: string): {
        totalDamageTaken: number;
        totalHealingReceived: number;
        timesKilled: number;
        timesRevived: number;
        averageDamagePerHit: number;
        averageHealingPerApplication: number;
        currentStatus: HealthStatus | null;
    };
    /**
     * Get overall health manager statistics
     */
    getManagerStats(): {
        totalInstancesTracked: number;
        totalHealthEvents: number;
        averageEventsPerInstance: number;
        maxHistoryPerInstance: number;
    };
    /**
     * Validate instance health state
     */
    validateHealthState(instance: IEnemyInstance): boolean;
    /**
     * Add entry to health history
     */
    private addToHistory;
    /**
     * Trim all histories to max size
     */
    private trimAllHistories;
    /**
     * Execute health event callbacks
     */
    private executeCallbacks;
}
