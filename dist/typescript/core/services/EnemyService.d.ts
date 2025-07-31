import { IEnemy } from '../interfaces/IEnemy.js';
import { EnemyType } from '../types/GameTypes';
/**
 * Enemy Service - Manages enemy data and spawning logic
 * Converts legacy enemy data to TypeScript interfaces
 */
export declare class EnemyService {
    private static instance;
    private enemies;
    private constructor();
    static getInstance(): EnemyService;
    /**
     * Get enemy template by name
     */
    getEnemyTemplate(name: string): IEnemy | null;
    /**
     * Create enemy instance with random health variation
     */
    createEnemyInstance(templateName: string): IEnemy | null;
    /**
     * Spawn group of enemies based on template
     */
    spawnEnemyGroup(templateName: string): IEnemy[];
    /**
     * Get all enemy templates
     */
    getAllEnemyTemplates(): IEnemy[];
    /**
     * Get enemies by type
     */
    getEnemiesByType(type: EnemyType): IEnemy[];
    /**
     * Get random enemy template
     */
    getRandomEnemyTemplate(): IEnemy | null;
    /**
     * Convert legacy enemy data to IEnemy interface
     */
    convertLegacyEnemy(legacyEnemy: any): IEnemy;
    /**
     * Check if enemy is alive
     */
    isAlive(enemy: IEnemy): boolean;
    /**
     * Apply damage to enemy
     */
    applyDamage(enemy: IEnemy, damage: number): void;
    /**
     * Get enemy health percentage
     */
    getHealthPercentage(enemy: IEnemy): number;
    /**
     * Get random sprite for enemy
     */
    getRandomSprite(enemy: IEnemy): string;
    private randomBetween;
    /**
     * Initialize enemy database from legacy data structure
     */
    private initializeEnemies;
}
