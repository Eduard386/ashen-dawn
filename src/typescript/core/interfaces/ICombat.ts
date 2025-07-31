import { IWeapon } from './IWeapon.js';
import { ICombatant } from './IEnemy.js';
import { CombatResult } from '../types/GameTypes';

export interface ICombatResult {
  isHit: boolean;
  damage: number;
  isCritical: boolean;
  remainingHealth: number;
  message: string;
}

export interface IDamageCalculation {
  baseDamage: number;
  finalDamage: number;
  isCritical: boolean;
  resistanceReduction: number;
  thresholdReduction: number;
}

export interface ICombatService {
  calculateDamage(attacker: ICombatant, target: ICombatant, weapon: IWeapon): CombatResult;
  applyDamage(target: ICombatant, damage: number): void;
  checkHit(attacker: ICombatant, target: ICombatant, weapon: IWeapon): boolean;
  calculateCritical(baseDamage: number, criticalChance: number): { damage: number; isCritical: boolean };
}
