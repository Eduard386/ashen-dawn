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
  private templates: Map<string, IEnemyTemplate> = new Map();

  constructor() {
    // Empty constructor - templates added via registration
  }

  /**
   * Register enemy template
   */
  public registerTemplate(template: IEnemyTemplate): void {
    this.templates.set(template.name, template);
  }

  /**
   * Get enemy template by name
   */
  public getTemplate(name: string): IEnemyTemplate | null {
    return this.templates.get(name) || null;
  }

  /**
   * Check if template exists
   */
  public hasTemplate(name: string): boolean {
    return this.templates.has(name);
  }

  /**
   * Get all registered templates
   */
  public getAllTemplates(): IEnemyTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template names
   */
  public getTemplateNames(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Get templates by type
   */
  public getTemplatesByType(type: string): IEnemyTemplate[] {
    return this.getAllTemplates().filter(template => template.type === type);
  }

  /**
   * Get random template
   */
  public getRandomTemplate(): IEnemyTemplate | null {
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
  public getRandomTemplateByType(type: string): IEnemyTemplate | null {
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
  public removeTemplate(name: string): boolean {
    return this.templates.delete(name);
  }

  /**
   * Clear all templates
   */
  public clearTemplates(): void {
    this.templates.clear();
  }

  /**
   * Get template count
   */
  public getTemplateCount(): number {
    return this.templates.size;
  }

  /**
   * Get template statistics
   */
  public getTemplateStats(): {
    totalTemplates: number;
    typeBreakdown: Map<string, number>;
    maxLevelRange: { min: number; max: number };
    healthRange: { min: number; max: number };
  } {
    const templates = this.getAllTemplates();
    const typeBreakdown = new Map<string, number>();
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
  public findTemplates(criteria: {
    type?: string;
    minLevel?: number;
    maxLevel?: number;
    minHealth?: number;
    maxHealth?: number;
  }): IEnemyTemplate[] {
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
  public validateTemplate(template: IEnemyTemplate): boolean {
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

// Template interface for enemy data
export interface IEnemyTemplate {
  name: string;
  type: string;
  maxLevel: number;
  experienceReward: number;
  defence: {
    health: number;
    armorClass: number;
    damageThreshold: number;
    damageResistance: number;
  };
  attack: {
    hitChance: number;
    weapon?: string;
    damage: {
      min: number;
      max: number;
    };
    shots: number;
    attackSpeed: number;
    criticalChance: number;
  };
  spawning: {
    min: number;
    max: number;
  };
  sprites: string[];
}
