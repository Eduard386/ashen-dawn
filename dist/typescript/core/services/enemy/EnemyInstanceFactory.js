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
    constructor() {
        this.healthVariationRange = { min: 0.8, max: 1.0 };
        this.levelVariationEnabled = true;
        this.instanceCounter = 0;
        // Empty constructor - configuration via setters
    }
    /**
     * Create enemy instance from template
     */
    createInstance(template, options) {
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
    createInstances(template, count, options) {
        const instances = [];
        for (let i = 0; i < count; i++) {
            const instance = this.createInstance(template, options);
            instances.push(instance);
        }
        return instances;
    }
    /**
     * Create instance with specific health
     */
    createInstanceWithHealth(template, currentHealth, maxHealth) {
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
    createEliteInstance(template) {
        const eliteLevel = Math.min(template.maxLevel + 2, 10); // Cap at level 10
        const eliteModifiers = {
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
    createWeakInstance(template) {
        const weakLevel = Math.max(template.maxLevel - 1, 1); // Min level 1
        const weakModifiers = {
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
    setHealthVariationRange(min, max) {
        if (min < 0 || max < 0 || min > max) {
            console.error('Invalid health variation range');
            return;
        }
        this.healthVariationRange = { min, max };
    }
    /**
     * Get current health variation range
     */
    getHealthVariationRange() {
        return { ...this.healthVariationRange };
    }
    /**
     * Enable/disable level variation
     */
    setLevelVariationEnabled(enabled) {
        this.levelVariationEnabled = enabled;
    }
    /**
     * Check if level variation is enabled
     */
    isLevelVariationEnabled() {
        return this.levelVariationEnabled;
    }
    /**
     * Get instance creation statistics
     */
    getCreationStats() {
        return {
            totalInstancesCreated: this.instanceCounter,
            healthVariationRange: this.getHealthVariationRange(),
            levelVariationEnabled: this.levelVariationEnabled
        };
    }
    /**
     * Reset creation counter
     */
    resetCreationCounter() {
        this.instanceCounter = 0;
    }
    /**
     * Clone existing instance
     */
    cloneInstance(instance) {
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
    validateInstance(instance) {
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
    generateInstanceId(templateName) {
        this.instanceCounter++;
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `${templateName}_${timestamp}_${random}_${this.instanceCounter}`;
    }
    /**
     * Generate random level
     */
    generateRandomLevel(maxLevel) {
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
    getLevelHealthMultiplier(level) {
        // Each level above 1 adds 10% health
        return 1 + (level - 1) * 0.1;
    }
    /**
     * Generate random number between min and max
     */
    randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }
}
//# sourceMappingURL=EnemyInstanceFactory.js.map