/**
 * Modern Combat Service - Orchestrates specialized combat components
 * Implements Single Responsibility Principle by composing focused services
 */
import { ICombatResult, IDamageCalculation, IHitCalculation } from '../../interfaces/ICombatSegregated.js';
import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IWeapon } from '../../interfaces/IWeapon.js';
import { IEnemy } from '../../interfaces/IEnemy.js';
import { HitChanceCalculator } from './HitChanceCalculator.js';
import { DamageCalculator } from './DamageCalculator.js';
import { AmmoManager } from './AmmoManager.js';
import { ArmorCalculator } from './ArmorCalculator.js';
import { ExperienceCalculator } from './ExperienceCalculator.js';
import { CombatMessageGenerator } from './CombatMessageGenerator.js';
/**
 * Modern Combat Service using composition and SRP
 * Each component has a single, focused responsibility
 */
export declare class ModernCombatService {
    private static instance;
    private hitChanceCalculator;
    private damageCalculator;
    private ammoManager;
    private armorCalculator;
    private experienceCalculator;
    private messageGenerator;
    private constructor();
    static getInstance(): ModernCombatService;
    /**
     * Calculate complete player attack with all components
     */
    calculatePlayerAttack(player: IPlayerCharacter, weapon: IWeapon, enemy: IEnemy): ICombatResult;
    /**
     * Calculate enemy attack against player
     */
    calculateEnemyAttack(enemy: IEnemy, player: IPlayerCharacter): ICombatResult;
    /**
     * Get hit chance calculation details
     */
    getHitCalculation(player: IPlayerCharacter, weapon: IWeapon, enemy: IEnemy): IHitCalculation;
    /**
     * Get damage calculation details
     */
    getDamageCalculation(weapon: IWeapon, target: IEnemy, attacker?: IPlayerCharacter): IDamageCalculation;
    /**
     * Check if player can use weapon
     */
    canUseWeapon(player: IPlayerCharacter, weapon: IWeapon): boolean;
    /**
     * Consume ammo for weapon use
     */
    consumeAmmo(player: IPlayerCharacter, weapon: IWeapon): boolean;
    /**
     * Calculate experience gain from defeating enemy
     */
    calculateExperienceGain(enemy: IEnemy, playerLevel: number): number;
    /**
     * Generate combat message
     */
    generateCombatMessage(result: ICombatResult, weapon?: IWeapon, enemy?: IEnemy): string;
    /**
     * Legacy hit chance calculation (for backward compatibility)
     */
    calculateHitChance(player: IPlayerCharacter, weapon: IWeapon, enemy: IEnemy): number;
    /**
     * Legacy damage calculation (for backward compatibility)
     */
    calculateDamage(weapon: IWeapon, target: IEnemy, attacker?: IPlayerCharacter): IDamageCalculation;
    /**
     * Get hit chance calculator component
     */
    getHitChanceCalculator(): HitChanceCalculator;
    /**
     * Get damage calculator component
     */
    getDamageCalculator(): DamageCalculator;
    /**
     * Get ammo manager component
     */
    getAmmoManager(): AmmoManager;
    /**
     * Get armor calculator component
     */
    getArmorCalculator(): ArmorCalculator;
    /**
     * Get experience calculator component
     */
    getExperienceCalculator(): ExperienceCalculator;
    /**
     * Get message generator component
     */
    getMessageGenerator(): CombatMessageGenerator;
}
