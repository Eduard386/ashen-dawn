/**
 * Segregated Enemy Interfaces
 * Following Interface Segregation Principle (ISP)
 * Separated into stats, behavior, rendering, and AI concerns
 */
import { EnemyType, IDamageRange } from '../types/GameTypes';
export interface IEnemyStats {
    readonly id: string;
    readonly name: string;
    readonly type: EnemyType;
    maxLevel: number;
    currentHealth: number;
    maxHealth: number;
    readonly experienceReward: number;
}
export interface IEnemyDefense {
    armorClass: number;
    damageThreshold: number;
    damageResistance: number;
    healthRegeneration?: number;
}
export interface IEnemyAttack {
    hitChance: number;
    weapon?: string;
    damage: IDamageRange;
    shots: number;
    attackSpeed: number;
    criticalChance?: number;
}
export interface IEnemySpawning {
    minCount: number;
    maxCount: number;
    spawnWeight: number;
    levelRange: {
        min: number;
        max: number;
    };
    biome?: string[];
}
export interface IEnemyRendering {
    readonly sprites: string[];
    readonly animations?: string[];
    readonly scale?: number;
    readonly tint?: number;
}
export interface IEnemyBehavior {
    aggressiveness: number;
    intelligence: number;
    movePattern: 'static' | 'patrol' | 'aggressive' | 'defensive';
    specialAbilities?: string[];
}
export interface IEnemyLoot {
    weapons?: string[];
    armor?: string[];
    ammo?: Record<string, {
        min: number;
        max: number;
    }>;
    medical?: Record<string, {
        min: number;
        max: number;
    }>;
    dropChance: number;
}
export interface IEnemyHealthManager {
    getCurrentHealth(): number;
    getMaxHealth(): number;
    takeDamage(amount: number): void;
    heal(amount: number): void;
    isDead(): boolean;
    getHealthPercentage(): number;
}
export interface IEnemyCombatBehavior {
    canAttack(): boolean;
    calculateAttackDamage(): number;
    getHitChance(): number;
    performAttack(): {
        damage: number;
        isCritical: boolean;
    };
    onTakeDamage(amount: number): void;
    onDeath(): void;
}
export interface IEnemyMovement {
    canMove(): boolean;
    getPosition(): {
        x: number;
        y: number;
    };
    setPosition(x: number, y: number): void;
    getMovementSpeed(): number;
}
export interface IEnemyFactory {
    createEnemy(template: string, level?: number): IEnemy;
    createFromConfig(config: IEnemyConfig): IEnemy;
    generateRandomEnemy(type: EnemyType, level: number): IEnemy;
    parseRaiderEquipment(name: string): {
        weapon?: string;
        armor?: string;
    };
}
export interface IEnemyConfig {
    stats: IEnemyStats;
    defense: IEnemyDefense;
    attack: IEnemyAttack;
    spawning: IEnemySpawning;
    rendering: IEnemyRendering;
    behavior: IEnemyBehavior;
    loot: IEnemyLoot;
}
export interface IEnemy {
    readonly id: string;
    readonly name: string;
    readonly type: EnemyType;
    stats: IEnemyStats;
    defense: IEnemyDefense;
    attack: IEnemyAttack;
    rendering: IEnemyRendering;
    behavior?: IEnemyBehavior;
    loot?: IEnemyLoot;
}
export interface ICombatant {
    getId(): string;
    getHealth(): number;
    getMaxHealth(): number;
    takeDamage(amount: number): void;
    isDead(): boolean;
    getDefenseStats(): IEnemyDefense;
}
export interface IEnemyGroup {
    readonly id: string;
    enemies: IEnemy[];
    formation: 'line' | 'circle' | 'scattered';
    getAliveEnemies(): IEnemy[];
    getTotalHealth(): number;
    isDefeated(): boolean;
}
export interface IEnemySpawner {
    spawnEnemies(type: string, level: number, count?: number): IEnemy[];
    spawnGroup(groupConfig: IEnemyGroupConfig): IEnemyGroup;
    canSpawn(type: string, level: number): boolean;
}
export interface IEnemyGroupConfig {
    types: string[];
    level: number;
    minCount: number;
    maxCount: number;
    formation: 'line' | 'circle' | 'scattered';
}
export interface IDefenceStats extends IEnemyDefense {
    health: number;
}
export interface IAttackStats extends IEnemyAttack {
}
export interface ISpawnConfig {
    min: number;
    max: number;
}
export declare function isEnemyStats(obj: any): obj is IEnemyStats;
export declare function isEnemyDefense(obj: any): obj is IEnemyDefense;
export declare function isEnemyAttack(obj: any): obj is IEnemyAttack;
export interface IEnemyService {
    createEnemy(name: string, level?: number): IEnemy;
    generateEnemies(type: string, level: number): IEnemy[];
    parseRaiderEquipment(name: string): {
        weapon?: string;
        armor?: string;
    };
}
