import { IEnemy } from '../interfaces/IEnemy.js';
import { EnemyType } from '../types/GameTypes';

/**
 * Enemy Service - Manages enemy data and spawning logic
 * Converts legacy enemy data to TypeScript interfaces
 */
export class EnemyService {
  private static instance: EnemyService;
  private enemies: Map<string, IEnemy> = new Map();

  private constructor() {
    this.initializeEnemies();
  }

  public static getInstance(): EnemyService {
    if (!EnemyService.instance) {
      EnemyService.instance = new EnemyService();
    }
    return EnemyService.instance;
  }

  /**
   * Get enemy template by name
   */
  public getEnemyTemplate(name: string): IEnemy | null {
    return this.enemies.get(name) || null;
  }

  /**
   * Create enemy instance with random health variation
   */
  public createEnemyInstance(templateName: string): IEnemy | null {
    const template = this.getEnemyTemplate(templateName);
    if (!template) return null;

    // Create a copy with randomized current health (80-100% of max)
    const healthVariation = 0.8 + Math.random() * 0.2;
    const currentHealth = Math.floor(template.defence.health * healthVariation);

    return {
      ...template,
      id: crypto.randomUUID(),
      currentHealth: currentHealth
    };
  }

  /**
   * Spawn group of enemies based on template
   */
  public spawnEnemyGroup(templateName: string): IEnemy[] {
    const template = this.getEnemyTemplate(templateName);
    if (!template) return [];

    const groupSize = this.randomBetween(template.spawning.min, template.spawning.max);
    const enemies: IEnemy[] = [];

    for (let i = 0; i < groupSize; i++) {
      const enemy = this.createEnemyInstance(templateName);
      if (enemy) {
        enemies.push(enemy);
      }
    }

    return enemies;
  }

  /**
   * Get all enemy templates
   */
  public getAllEnemyTemplates(): IEnemy[] {
    return Array.from(this.enemies.values());
  }

  /**
   * Get enemies by type
   */
  public getEnemiesByType(type: EnemyType): IEnemy[] {
    return this.getAllEnemyTemplates().filter(enemy => enemy.type === type);
  }

  /**
   * Get random enemy template
   */
  public getRandomEnemyTemplate(): IEnemy | null {
    const templates = this.getAllEnemyTemplates();
    if (templates.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  /**
   * Convert legacy enemy data to IEnemy interface
   */
  public convertLegacyEnemy(legacyEnemy: any): IEnemy {
    return {
      id: crypto.randomUUID(),
      name: legacyEnemy.name,
      type: legacyEnemy.type as EnemyType,
      maxLevel: legacyEnemy.maxLevel,
      currentHealth: legacyEnemy.defence.health,
      maxHealth: legacyEnemy.defence.health, // Same as current health initially
      experienceReward: legacyEnemy.experience || 15, // Default experience reward
      defence: {
        health: legacyEnemy.defence.health,
        armorClass: legacyEnemy.defence.ac,
        damageThreshold: legacyEnemy.defence.threshold,
        damageResistance: legacyEnemy.defence.resistance
      },
      attack: {
        hitChance: legacyEnemy.attack.hit_chance,
        weapon: legacyEnemy.attack.weapon,
        damage: {
          min: legacyEnemy.attack.damage.min,
          max: legacyEnemy.attack.damage.max
        },
        shots: legacyEnemy.attack.shots,
        attackSpeed: 1.0, // Default attack speed
        criticalChance: 5 // Default critical chance
      },
      spawning: {
        min: legacyEnemy.amount.min,
        max: legacyEnemy.amount.max
      },
      experience: legacyEnemy.experience,
      sprites: legacyEnemy.title || []
    };
  }

  /**
   * Check if enemy is alive
   */
  public isAlive(enemy: IEnemy): boolean {
    return enemy.currentHealth > 0;
  }

  /**
   * Apply damage to enemy
   */
  public applyDamage(enemy: IEnemy, damage: number): void {
    enemy.currentHealth = Math.max(0, enemy.currentHealth - damage);
  }

  /**
   * Get enemy health percentage
   */
  public getHealthPercentage(enemy: IEnemy): number {
    return (enemy.currentHealth / enemy.defence.health) * 100;
  }

  /**
   * Get random sprite for enemy
   */
  public getRandomSprite(enemy: IEnemy): string {
    if (enemy.sprites.length === 0) return enemy.name;
    
    const randomIndex = Math.floor(Math.random() * enemy.sprites.length);
    return enemy.sprites[randomIndex];
  }

  // Private helper methods

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Initialize enemy database from legacy data structure
   */
  private initializeEnemies(): void {
    const enemyData: any[] = [
      {
        maxLevel: 1, name: 'Rat', type: 'creature',
        defence: { health: 6, ac: 6, threshold: 0, resistance: 0 },
        attack: { hit_chance: 40, damage: { min: 2, max: 2 }, shots: 1 },
        amount: { min: 6, max: 10 }, experience: 25, title: ['Rat']
      },
      {
        maxLevel: 1, name: 'Mantis', type: 'creature',
        defence: { health: 25, ac: 13, threshold: 0, resistance: 0.2 },
        attack: { hit_chance: 50, damage: { min: 5, max: 8 }, shots: 1 },
        amount: { min: 1, max: 4 }, experience: 50, title: ['Mantis']
      },
      {
        maxLevel: 1, name: 'Tribe', type: 'human',
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 60, weapon: 'spear', damage: { min: 3, max: 10 }, shots: 1 },
        amount: { min: 2, max: 4 }, experience: 50,
        title: ['Tribe man 1', 'Tribe man 2', 'Tribe man 3', 'Tribe man 4',
               'Tribe woman 1', 'Tribe woman 2']
      },
      {
        maxLevel: 1, name: 'Cannibals', type: 'human',
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 60, weapon: 'knife', damage: { min: 1, max: 6 }, shots: 1 },
        amount: { min: 2, max: 4 }, experience: 50,
        title: ['Cannibal man 1', 'Cannibal man 2', 'Cannibal man 3',
               'Cannibal woman 1', 'Cannibal woman 2']
      },
      {
        maxLevel: 1, name: 'Raiders', type: 'human',
        defence: { health: 30, ac: 5, threshold: 0, resistance: 0 },
        attack: { hit_chance: 60, weapon: '9mm_pistol', damage: { min: 10, max: 24 }, shots: 1 },
        amount: { min: 1, max: 4 }, experience: 75,
        title: [
          'Raider - Leather Jacket - Baseball bat',
          'Raider - Leather Jacket - 44 Magnum revolver',
          'Raider - Leather Jacket - 9mm pistol',
          'Raider - Leather Jacket - 44 Desert Eagle',
          'Raider - Leather Jacket - Laser pistol',
          'Raider - Leather Jacket - SMG',
          'Raider - Leather Jacket - Frag grenade',
          'Raider - Leather Jacket - Combat shotgun',
          'Raider - Leather Armor - Baseball bat',
          'Raider - Leather Armor - 44 Magnum revolver',
          'Raider - Leather Armor - 9mm pistol',
          'Raider - Leather Armor - 44 Desert Eagle',
          'Raider - Leather Armor - Laser pistol',
          'Raider - Leather Armor - SMG',
          'Raider - Leather Armor - Frag grenade',
          'Raider - Leather Armor - Combat shotgun'
        ]
      }
    ];

    // Convert and store enemies
    enemyData.forEach(legacyEnemy => {
      const enemy = this.convertLegacyEnemy(legacyEnemy);
      this.enemies.set(enemy.name, enemy);
    });
  }
}
