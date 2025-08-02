/**
 * Health status enumeration
 */
export var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "healthy";
    HealthStatus["WOUNDED"] = "wounded";
    HealthStatus["CRITICAL"] = "critical";
    HealthStatus["DEAD"] = "dead";
})(HealthStatus || (HealthStatus = {}));
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
    constructor() {
        this.healthHistory = new Map();
        this.maxHistoryPerInstance = 50;
        this.healthCallbacks = new Map();
        // Empty constructor
    }
    /**
     * Check if enemy instance is alive
     */
    isAlive(instance) {
        return instance.currentHealth > 0;
    }
    /**
     * Check if enemy instance is dead
     */
    isDead(instance) {
        return instance.currentHealth <= 0;
    }
    /**
     * Get health status of enemy instance
     */
    getHealthStatus(instance) {
        if (instance.currentHealth <= 0) {
            return HealthStatus.DEAD;
        }
        const healthPercentage = this.getHealthPercentage(instance);
        if (healthPercentage >= 75) {
            return HealthStatus.HEALTHY;
        }
        else if (healthPercentage >= 25) {
            return HealthStatus.WOUNDED;
        }
        else {
            return HealthStatus.CRITICAL;
        }
    }
    /**
     * Get health percentage (0-100)
     */
    getHealthPercentage(instance) {
        if (instance.maxHealth <= 0) {
            return 0;
        }
        return Math.round((instance.currentHealth / instance.maxHealth) * 100);
    }
    /**
     * Apply damage to enemy instance
     */
    applyDamage(instance, damage, options) {
        const healthBefore = instance.currentHealth;
        let finalDamage = Math.max(0, damage);
        // Apply damage
        instance.currentHealth = Math.max(0, instance.currentHealth - finalDamage);
        const healthAfter = instance.currentHealth;
        const wasKilled = healthBefore > 0 && healthAfter <= 0;
        const status = this.getHealthStatus(instance);
        const result = {
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
    applyHealing(instance, healing, options) {
        const healthBefore = instance.currentHealth;
        const wasRevived = instance.currentHealth <= 0;
        let finalHealing = Math.max(0, healing);
        const maxAllowedHealth = options?.allowOverheal ? instance.maxHealth * 1.5 : instance.maxHealth;
        instance.currentHealth = Math.min(maxAllowedHealth, instance.currentHealth + finalHealing);
        const healthAfter = instance.currentHealth;
        const actualHealing = healthAfter - healthBefore;
        const result = {
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
    setHealth(instance, newHealth, enforceMax = true) {
        const maxHealth = enforceMax ? instance.maxHealth : Number.MAX_SAFE_INTEGER;
        instance.currentHealth = Math.max(0, Math.min(maxHealth, newHealth));
    }
    /**
     * Restore to full health
     */
    restoreFullHealth(instance) {
        const healingNeeded = instance.maxHealth - instance.currentHealth;
        return this.applyHealing(instance, healingNeeded);
    }
    /**
     * Kill enemy instance instantly
     */
    kill(instance) {
        const lethalDamage = instance.currentHealth;
        return this.applyDamage(instance, lethalDamage);
    }
    /**
     * Revive enemy instance
     */
    revive(instance, healthPercentage = 25) {
        const targetHealth = Math.floor(instance.maxHealth * (healthPercentage / 100));
        const healingNeeded = targetHealth;
        instance.currentHealth = 0; // Ensure we start from dead
        return this.applyHealing(instance, healingNeeded);
    }
    /**
     * Get health history for instance
     */
    getHealthHistory(instanceId) {
        return [...(this.healthHistory.get(instanceId) || [])];
    }
    /**
     * Get damage history for instance
     */
    getDamageHistory(instanceId) {
        const history = this.healthHistory.get(instanceId) || [];
        return history.filter(entry => 'damageTaken' in entry);
    }
    /**
     * Get healing history for instance
     */
    getHealingHistory(instanceId) {
        const history = this.healthHistory.get(instanceId) || [];
        return history.filter(entry => 'healingApplied' in entry);
    }
    /**
     * Clear health history for instance
     */
    clearHealthHistory(instanceId) {
        this.healthHistory.delete(instanceId);
    }
    /**
     * Clear all health history
     */
    clearAllHealthHistory() {
        this.healthHistory.clear();
    }
    /**
     * Set maximum history entries per instance
     */
    setMaxHistoryPerInstance(maxEntries) {
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
    onHealthEvent(event, callback) {
        if (!this.healthCallbacks.has(event)) {
            this.healthCallbacks.set(event, []);
        }
        this.healthCallbacks.get(event).push(callback);
    }
    /**
     * Remove health event callback
     */
    removeHealthCallback(event, callback) {
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
    clearHealthCallbacks() {
        this.healthCallbacks.clear();
    }
    /**
     * Get health statistics for instance
     */
    getHealthStats(instanceId) {
        const history = this.healthHistory.get(instanceId) || [];
        const damageEntries = history.filter(entry => 'damageTaken' in entry);
        const healingEntries = history.filter(entry => 'healingApplied' in entry);
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
    getManagerStats() {
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
    validateHealthState(instance) {
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
    addToHistory(instanceId, entry) {
        if (!this.healthHistory.has(instanceId)) {
            this.healthHistory.set(instanceId, []);
        }
        const history = this.healthHistory.get(instanceId);
        history.push(entry);
        // Trim if necessary
        if (history.length > this.maxHistoryPerInstance) {
            history.shift();
        }
    }
    /**
     * Trim all histories to max size
     */
    trimAllHistories() {
        this.healthHistory.forEach(history => {
            while (history.length > this.maxHistoryPerInstance) {
                history.shift();
            }
        });
    }
    /**
     * Execute health event callbacks
     */
    executeCallbacks(event, result) {
        const callbacks = this.healthCallbacks.get(event);
        if (!callbacks) {
            return;
        }
        callbacks.forEach((callback, index) => {
            try {
                callback(result);
            }
            catch (error) {
                console.error(`Health ${event} callback ${index} failed:`, error);
            }
        });
    }
}
//# sourceMappingURL=EnemyHealthManager.js.map