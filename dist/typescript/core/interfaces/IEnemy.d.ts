import { EnemyType, IDamageRange } from '../types/GameTypes';
export interface IDefenceStats {
    health: number;
    armorClass: number;
    damageThreshold: number;
    damageResistance: number;
}
export interface IAttackStats {
    hitChance: number;
    weapon?: string;
    damage: IDamageRange;
    shots: number;
}
export interface ISpawnConfig {
    min: number;
    max: number;
}
export interface IEnemy {
    readonly id: string;
    readonly name: string;
    readonly type: EnemyType;
    maxLevel: number;
    currentHealth: number;
    defence: IDefenceStats;
    attack: IAttackStats;
    spawning: ISpawnConfig;
    readonly experience: number;
    readonly sprites: string[];
}
export interface ICombatant {
    getId(): string;
    getHealth(): number;
    getMaxHealth(): number;
    takeDamage(amount: number): void;
    getSkillValue(skill: string): number;
    defence: IDefenceStats;
}
export interface IEnemyService {
    createEnemy(name: string, level?: number): IEnemy;
    generateEnemies(type: string, level: number): IEnemy[];
    parseRaiderEquipment(name: string): {
        weapon?: string;
        armor?: string;
    };
}
