import { IEnemyStats, IEnemyDefense, IEnemyAttack, IEnemyService as ISegregatedEnemyService } from './IEnemySegregated';
export interface IDefenceStats extends IEnemyDefense {
    health: number;
}
export interface IAttackStats extends IEnemyAttack {
    attackSpeed: number;
}
export interface ISpawnConfig {
    min: number;
    max: number;
}
export interface IEnemy extends IEnemyStats {
    defence: IDefenceStats;
    attack: IAttackStats;
    spawning: ISpawnConfig;
    readonly sprites: string[];
    currentHealth: number;
    readonly experience: number;
}
export interface ICombatant {
    getId(): string;
    getHealth(): number;
    getMaxHealth(): number;
    takeDamage(amount: number): void;
    getSkillValue(skill: string): number;
    defence: IDefenceStats;
}
export interface IEnemyService extends ISegregatedEnemyService {
}
