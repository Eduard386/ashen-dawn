import { EnemyType, IDamageRange } from '../types/GameTypes';
// Import segregated interfaces
import {
  IEnemyStats,
  IEnemyDefense,
  IEnemyAttack,
  IEnemySpawning,
  IEnemy as ISegregatedEnemy,
  IEnemyService as ISegregatedEnemyService
} from './IEnemySegregated';

// Legacy compatibility interfaces - delegating to segregated interfaces
export interface IDefenceStats extends IEnemyDefense {
  health: number; // Add health for backward compatibility
}

export interface IAttackStats extends IEnemyAttack {
  // Ensure attackSpeed is included for backward compatibility
  attackSpeed: number;
}

export interface ISpawnConfig {
  min: number;
  max: number;
}

// Legacy enemy interface for backward compatibility
export interface IEnemy extends IEnemyStats {
  // Map legacy properties to segregated interface
  defence: IDefenceStats;
  attack: IAttackStats;
  spawning: ISpawnConfig;
  // Additional legacy properties for backward compatibility
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

// Service interface for enemy management
export interface IEnemyService extends ISegregatedEnemyService {
  // Legacy compatibility methods
}
