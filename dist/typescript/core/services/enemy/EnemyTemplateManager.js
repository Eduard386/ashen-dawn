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
export class EnemyTemplateManager {
    constructor() {
        this.templates = new Map();
        // Empty constructor - templates added via registration
    }
    /**
     * Register enemy template
     */
    registerTemplate(template) {
        this.templates.set(template.name, template);
    }
    /**
     * Get enemy template by name
     */
    getTemplate(name) {
        return this.templates.get(name) || null;
    }
    /**
     * Check if template exists
     */
    hasTemplate(name) {
        return this.templates.has(name);
    }
    /**
     * Get all registered templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * Get template names
     */
    getTemplateNames() {
        return Array.from(this.templates.keys());
    }
    /**
     * Get templates by type
     */
    getTemplatesByType(type) {
        return this.getAllTemplates().filter(template => template.type === type);
    }
    /**
     * Get random template
     */
    getRandomTemplate() {
        const templates = this.getAllTemplates();
        if (templates.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * templates.length);
        return templates[randomIndex];
    }
    /**
     * Get random template by type
     */
    getRandomTemplateByType(type) {
        const typeTemplates = this.getTemplatesByType(type);
        if (typeTemplates.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * typeTemplates.length);
        return typeTemplates[randomIndex];
    }
    /**
     * Remove template
     */
    removeTemplate(name) {
        return this.templates.delete(name);
    }
    /**
     * Clear all templates
     */
    clearTemplates() {
        this.templates.clear();
    }
    /**
     * Get template count
     */
    getTemplateCount() {
        return this.templates.size;
    }
    /**
     * Get template statistics
     */
    getTemplateStats() {
        const templates = this.getAllTemplates();
        const typeBreakdown = new Map();
        let minLevel = Infinity;
        let maxLevel = -Infinity;
        let minHealth = Infinity;
        let maxHealth = -Infinity;
        templates.forEach(template => {
            // Type breakdown
            const currentCount = typeBreakdown.get(template.type) || 0;
            typeBreakdown.set(template.type, currentCount + 1);
            // Level range
            minLevel = Math.min(minLevel, template.maxLevel);
            maxLevel = Math.max(maxLevel, template.maxLevel);
            // Health range
            minHealth = Math.min(minHealth, template.defence.health);
            maxHealth = Math.max(maxHealth, template.defence.health);
        });
        return {
            totalTemplates: templates.length,
            typeBreakdown,
            maxLevelRange: {
                min: minLevel === Infinity ? 0 : minLevel,
                max: maxLevel === -Infinity ? 0 : maxLevel
            },
            healthRange: {
                min: minHealth === Infinity ? 0 : minHealth,
                max: maxHealth === -Infinity ? 0 : maxHealth
            }
        };
    }
    /**
     * Find templates by criteria
     */
    findTemplates(criteria) {
        return this.getAllTemplates().filter(template => {
            if (criteria.type && template.type !== criteria.type) {
                return false;
            }
            if (criteria.minLevel !== undefined && template.maxLevel < criteria.minLevel) {
                return false;
            }
            if (criteria.maxLevel !== undefined && template.maxLevel > criteria.maxLevel) {
                return false;
            }
            if (criteria.minHealth !== undefined && template.defence.health < criteria.minHealth) {
                return false;
            }
            if (criteria.maxHealth !== undefined && template.defence.health > criteria.maxHealth) {
                return false;
            }
            return true;
        });
    }
    /**
     * Validate template data
     */
    validateTemplate(template) {
        if (!template || typeof template !== 'object') {
            return false;
        }
        // Required fields
        if (!template.name || typeof template.name !== 'string' || template.name.trim() === '') {
            return false;
        }
        if (!template.type || typeof template.type !== 'string') {
            return false;
        }
        if (typeof template.maxLevel !== 'number' || template.maxLevel < 1) {
            return false;
        }
        // Defence validation
        if (!template.defence || typeof template.defence !== 'object') {
            return false;
        }
        if (typeof template.defence.health !== 'number' || template.defence.health <= 0) {
            return false;
        }
        // Attack validation
        if (!template.attack || typeof template.attack !== 'object') {
            return false;
        }
        if (typeof template.attack.hitChance !== 'number' || template.attack.hitChance < 0) {
            return false;
        }
        // Spawning validation
        if (!template.spawning || typeof template.spawning !== 'object') {
            return false;
        }
        if (typeof template.spawning.min !== 'number' || typeof template.spawning.max !== 'number') {
            return false;
        }
        if (template.spawning.min > template.spawning.max || template.spawning.min < 1) {
            return false;
        }
        return true;
    }
}
//# sourceMappingURL=EnemyTemplateManager.js.map