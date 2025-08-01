/**
 * Segregated Combat Interfaces
 * Following Interface Segregation Principle (ISP)
 * Separated into damage calculation, hit calculation, critical calculation, and logging
 */
import { IWeapon } from './IWeapon';
import { ICombatant } from './IEnemySegregated';
export interface ICombatResult {
    isHit: boolean;
    damage: number;
    isCritical: boolean;
    remainingHealth: number;
    message: string;
    timestamp?: number;
}
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
export interface IHitCalculation {
    baseHitChance: number;
    skillModifier: number;
    weaponAccuracy: number;
    distanceModifier: number;
    targetDefenseModifier: number;
    finalHitChance: number;
    isHit: boolean;
}
export interface ICriticalCalculation {
    baseCriticalChance: number;
    skillModifier: number;
    weaponCriticalChance: number;
    luckModifier: number;
    finalCriticalChance: number;
    isCritical: boolean;
    criticalMultiplier: number;
}
export interface IDamageCalculator {
    calculateBaseDamage(weapon: IWeapon): number;
    applySkillModifier(baseDamage: number, skill: number): number;
    applyCriticalMultiplier(damage: number, multiplier: number): number;
    calculateArmorReduction(damage: number, armorClass: number): number;
    calculateResistanceReduction(damage: number, resistance: number): number;
    calculateThresholdReduction(damage: number, threshold: number): number;
    calculateFinalDamage(calculation: Partial<IDamageCalculation>): IDamageCalculation;
}
export interface IHitChanceCalculator {
    calculateBaseHitChance(weapon: IWeapon): number;
    applySkillModifier(baseChance: number, skill: number): number;
    applyWeaponAccuracy(baseChance: number, weapon: IWeapon): number;
    applyDistanceModifier(baseChance: number, distance: number): number;
    applyTargetDefense(baseChance: number, targetDefense: number): number;
    calculateFinalHitChance(calculation: Partial<IHitCalculation>): IHitCalculation;
    checkHit(hitChance: number): boolean;
}
export interface ICriticalHitCalculator {
    calculateBaseCriticalChance(weapon: IWeapon): number;
    applySkillModifier(baseChance: number, skill: number): number;
    applyLuckModifier(baseChance: number, luck: number): number;
    calculateCriticalMultiplier(weapon: IWeapon, skill: number): number;
    calculateFinalCritical(calculation: Partial<ICriticalCalculation>): ICriticalCalculation;
    checkCritical(criticalChance: number): boolean;
}
export interface ICombatLogger {
    logAttack(attacker: ICombatant, target: ICombatant, weapon: IWeapon): void;
    logHit(result: IHitCalculation): void;
    logDamage(result: IDamageCalculation): void;
    logCritical(result: ICriticalCalculation): void;
    logCombatResult(result: ICombatResult): void;
    generateCombatMessage(result: ICombatResult): string;
}
export interface ICombatEffectsManager {
    applyWeaponEffects(weapon: IWeapon, target: ICombatant): void;
    applyStatusEffects(target: ICombatant, effects: string[]): void;
    processOngoingEffects(combatant: ICombatant): void;
    removeExpiredEffects(combatant: ICombatant): void;
}
export interface ICombatValidator {
    canAttack(attacker: ICombatant, weapon: IWeapon): boolean;
    hasAmmo(attacker: ICombatant, weapon: IWeapon): boolean;
    isValidTarget(target: ICombatant): boolean;
    isInRange(attacker: ICombatant, target: ICombatant, weapon: IWeapon): boolean;
}
export interface ICombatStateManager {
    startCombat(participants: ICombatant[]): void;
    endCombat(): void;
    isInCombat(): boolean;
    getCurrentTurn(): ICombatant | null;
    getNextTurn(): ICombatant | null;
    skipTurn(combatant: ICombatant): void;
}
export interface IWeaponUsageManager {
    canUseWeapon(combatant: ICombatant, weapon: IWeapon): boolean;
    consumeAmmo(combatant: ICombatant, weapon: IWeapon): boolean;
    applyWeaponCooldown(weapon: IWeapon): void;
    isWeaponReady(weapon: IWeapon): boolean;
}
export interface ICombatService {
    damageCalculator: IDamageCalculator;
    hitChanceCalculator: IHitChanceCalculator;
    criticalHitCalculator: ICriticalHitCalculator;
    combatLogger: ICombatLogger;
    combatValidator: ICombatValidator;
    executeAttack(attacker: ICombatant, target: ICombatant, weapon: IWeapon): ICombatResult;
    calculateDamage(attacker: ICombatant, target: ICombatant, weapon: IWeapon): IDamageCalculation;
    checkHit(attacker: ICombatant, target: ICombatant, weapon: IWeapon): IHitCalculation;
    checkCritical(attacker: ICombatant, weapon: IWeapon): ICriticalCalculation;
}
export interface ICombatSimulator {
    simulateAttack(attacker: ICombatant, target: ICombatant, weapon: IWeapon): ICombatResult;
    simulateCombat(team1: ICombatant[], team2: ICombatant[]): ICombatResult[];
    calculateWinProbability(team1: ICombatant[], team2: ICombatant[]): number;
}
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
export interface ICombatFactory {
    createCombatService(): ICombatService;
    createDamageCalculator(): IDamageCalculator;
    createHitCalculator(): IHitChanceCalculator;
    createCriticalCalculator(): ICriticalHitCalculator;
    createCombatLogger(): ICombatLogger;
}
export interface ICombatResultLegacy extends ICombatResult {
}
export declare function isCombatResult(obj: any): obj is ICombatResult;
export declare function isDamageCalculation(obj: any): obj is IDamageCalculation;
export declare function isHitCalculation(obj: any): obj is IHitCalculation;
