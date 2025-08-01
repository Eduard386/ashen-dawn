/**
 * Segregated Combat Interfaces
 * Following Interface Segregation Principle (ISP)
 * Separated into damage calculation, hit calculation, critical calculation, and logging
 */

import { IWeapon } from './IWeapon';
import { ICombatant } from './IEnemySegregated';
import { CombatResult } from '../types/GameTypes';

// Core Combat Result Data
export interface ICombatResult {
  isHit: boolean;
  damage: number;
  isCritical: boolean;
  remainingHealth: number;
  message: string;
  timestamp?: number;
}

// Detailed Damage Calculation Breakdown
export interface IDamageCalculation {
  baseDamage: number;
  weaponModifier: number;
  skillModifier: number;
  criticalMultiplier: number;
  armorReduction: number;
  resistanceReduction: number;
  thresholdReduction: number;
  finalDamage: number;
  isCritical: boolean;
}

// Hit Chance Calculation Details
export interface IHitCalculation {
  baseHitChance: number;
  skillModifier: number;
  weaponAccuracy: number;
  distanceModifier: number;
  targetDefenseModifier: number;
  finalHitChance: number;
  isHit: boolean;
}

// Critical Hit Calculation
export interface ICriticalCalculation {
  baseCriticalChance: number;
  skillModifier: number;
  weaponCriticalChance: number;
  luckModifier: number;
  finalCriticalChance: number;
  isCritical: boolean;
  criticalMultiplier: number;
}

// Damage Calculator Interface
export interface IDamageCalculator {
  calculateBaseDamage(weapon: IWeapon): number;
  applySkillModifier(baseDamage: number, skill: number): number;
  applyCriticalMultiplier(damage: number, multiplier: number): number;
  calculateArmorReduction(damage: number, armorClass: number): number;
  calculateResistanceReduction(damage: number, resistance: number): number;
  calculateThresholdReduction(damage: number, threshold: number): number;
  calculateFinalDamage(calculation: Partial<IDamageCalculation>): IDamageCalculation;
}

// Hit Chance Calculator Interface
export interface IHitChanceCalculator {
  calculateBaseHitChance(weapon: IWeapon): number;
  applySkillModifier(baseChance: number, skill: number): number;
  applyWeaponAccuracy(baseChance: number, weapon: IWeapon): number;
  applyDistanceModifier(baseChance: number, distance: number): number;
  applyTargetDefense(baseChance: number, targetDefense: number): number;
  calculateFinalHitChance(calculation: Partial<IHitCalculation>): IHitCalculation;
  checkHit(hitChance: number): boolean;
}

// Critical Hit Calculator Interface
export interface ICriticalHitCalculator {
  calculateBaseCriticalChance(weapon: IWeapon): number;
  applySkillModifier(baseChance: number, skill: number): number;
  applyLuckModifier(baseChance: number, luck: number): number;
  calculateCriticalMultiplier(weapon: IWeapon, skill: number): number;
  calculateFinalCritical(calculation: Partial<ICriticalCalculation>): ICriticalCalculation;
  checkCritical(criticalChance: number): boolean;
}

// Combat Logger Interface
export interface ICombatLogger {
  logAttack(attacker: ICombatant, target: ICombatant, weapon: IWeapon): void;
  logHit(result: IHitCalculation): void;
  logDamage(result: IDamageCalculation): void;
  logCritical(result: ICriticalCalculation): void;
  logCombatResult(result: ICombatResult): void;
  generateCombatMessage(result: ICombatResult): string;
}

// Combat Effects Manager Interface
export interface ICombatEffectsManager {
  applyWeaponEffects(weapon: IWeapon, target: ICombatant): void;
  applyStatusEffects(target: ICombatant, effects: string[]): void;
  processOngoingEffects(combatant: ICombatant): void;
  removeExpiredEffects(combatant: ICombatant): void;
}

// Combat Validation Interface
export interface ICombatValidator {
  canAttack(attacker: ICombatant, weapon: IWeapon): boolean;
  hasAmmo(attacker: ICombatant, weapon: IWeapon): boolean;
  isValidTarget(target: ICombatant): boolean;
  isInRange(attacker: ICombatant, target: ICombatant, weapon: IWeapon): boolean;
}

// Combat State Manager Interface
export interface ICombatStateManager {
  startCombat(participants: ICombatant[]): void;
  endCombat(): void;
  isInCombat(): boolean;
  getCurrentTurn(): ICombatant | null;
  getNextTurn(): ICombatant | null;
  skipTurn(combatant: ICombatant): void;
}

// Weapon Usage Manager Interface
export interface IWeaponUsageManager {
  canUseWeapon(combatant: ICombatant, weapon: IWeapon): boolean;
  consumeAmmo(combatant: ICombatant, weapon: IWeapon): boolean;
  applyWeaponCooldown(weapon: IWeapon): void;
  isWeaponReady(weapon: IWeapon): boolean;
}

// Main Combat Service Interface (Composition of specialized interfaces)
export interface ICombatService {
  damageCalculator: IDamageCalculator;
  hitChanceCalculator: IHitChanceCalculator;
  criticalHitCalculator: ICriticalHitCalculator;
  combatLogger: ICombatLogger;
  combatValidator: ICombatValidator;
  
  // High-level combat operations
  executeAttack(attacker: ICombatant, target: ICombatant, weapon: IWeapon): ICombatResult;
  calculateDamage(attacker: ICombatant, target: ICombatant, weapon: IWeapon): IDamageCalculation;
  checkHit(attacker: ICombatant, target: ICombatant, weapon: IWeapon): IHitCalculation;
  checkCritical(attacker: ICombatant, weapon: IWeapon): ICriticalCalculation;
}

// Combat Simulator Interface
export interface ICombatSimulator {
  simulateAttack(attacker: ICombatant, target: ICombatant, weapon: IWeapon): ICombatResult;
  simulateCombat(team1: ICombatant[], team2: ICombatant[]): ICombatResult[];
  calculateWinProbability(team1: ICombatant[], team2: ICombatant[]): number;
}

// Combat Analytics Interface
export interface ICombatAnalytics {
  trackDamageDealt(combatant: ICombatant, damage: number): void;
  trackDamageTaken(combatant: ICombatant, damage: number): void;
  trackHits(combatant: ICombatant, hits: number, attempts: number): void;
  trackCriticals(combatant: ICombatant, criticals: number): void;
  getCombatStats(combatant: ICombatant): ICombatStats;
}

export interface ICombatStats {
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHits: number;
  totalAttempts: number;
  totalCriticals: number;
  accuracy: number;
  criticalRate: number;
}

// Combat Factory Interface
export interface ICombatFactory {
  createCombatService(): ICombatService;
  createDamageCalculator(): IDamageCalculator;
  createHitCalculator(): IHitChanceCalculator;
  createCriticalCalculator(): ICriticalHitCalculator;
  createCombatLogger(): ICombatLogger;
}

// Legacy compatibility
export interface ICombatResultLegacy extends ICombatResult {
  // Maintains backward compatibility
}

// Type guards for validation
export function isCombatResult(obj: any): obj is ICombatResult {
  if (!obj || obj === null || obj === undefined) return false;
  return typeof obj.isHit === 'boolean' &&
    typeof obj.damage === 'number' &&
    typeof obj.isCritical === 'boolean' &&
    typeof obj.remainingHealth === 'number' &&
    typeof obj.message === 'string';
}

export function isDamageCalculation(obj: any): obj is IDamageCalculation {
  if (!obj || obj === null || obj === undefined) return false;
  return typeof obj.baseDamage === 'number' &&
    typeof obj.finalDamage === 'number' &&
    typeof obj.isCritical === 'boolean';
}

export function isHitCalculation(obj: any): obj is IHitCalculation {
  if (!obj || obj === null || obj === undefined) return false;
  return typeof obj.baseHitChance === 'number' &&
    typeof obj.finalHitChance === 'number' &&
    typeof obj.isHit === 'boolean';
}
