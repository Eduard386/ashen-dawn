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
export class ModernCombatService {
  private static instance: ModernCombatService;
  
  private hitChanceCalculator: HitChanceCalculator;
  private damageCalculator: DamageCalculator;
  private ammoManager: AmmoManager;
  private armorCalculator: ArmorCalculator;
  private experienceCalculator: ExperienceCalculator;
  private messageGenerator: CombatMessageGenerator;

  private constructor() {
    this.hitChanceCalculator = new HitChanceCalculator();
    this.damageCalculator = new DamageCalculator();
    this.ammoManager = new AmmoManager();
    this.armorCalculator = new ArmorCalculator();
    this.experienceCalculator = new ExperienceCalculator();
    this.messageGenerator = new CombatMessageGenerator();
  }

  public static getInstance(): ModernCombatService {
    if (!ModernCombatService.instance) {
      ModernCombatService.instance = new ModernCombatService();
    }
    return ModernCombatService.instance;
  }

  /**
   * Calculate complete player attack with all components
   */
  public calculatePlayerAttack(
    player: IPlayerCharacter,
    weapon: IWeapon,
    enemy: IEnemy
  ): ICombatResult {
    // Check hit calculation
    const hitCalc = this.hitChanceCalculator.calculateHitChance(player, weapon, enemy);
    
    if (!hitCalc.isHit) {
      return {
        isHit: false,
        damage: 0,
        isCritical: false,
        remainingHealth: enemy.currentHealth,
        message: this.messageGenerator.generateMissMessage(weapon.name)
      };
    }

    // Calculate damage
    const damageCalc = this.damageCalculator.calculateDamage(weapon, enemy, player);
    const newHealth = Math.max(0, enemy.currentHealth - damageCalc.finalDamage);

    return {
      isHit: true,
      damage: damageCalc.finalDamage,
      isCritical: damageCalc.isCritical,
      remainingHealth: newHealth,
      message: this.messageGenerator.generateAttackMessage(damageCalc, weapon.name)
    };
  }

  /**
   * Calculate enemy attack against player
   */
  public calculateEnemyAttack(
    enemy: IEnemy,
    player: IPlayerCharacter
  ): ICombatResult {
    const hitChance = enemy.attack.hitChance;
    const isHit = Math.random() * 100 < hitChance;

    if (!isHit) {
      return {
        isHit: false,
        damage: 0,
        isCritical: false,
        remainingHealth: player.health,
        message: this.messageGenerator.generateEnemyMissMessage(enemy)
      };
    }

    // Calculate base damage
    const baseDamage = Math.floor(Math.random() * (enemy.attack.damage.max - enemy.attack.damage.min + 1)) + enemy.attack.damage.min;
    
    // Apply player armor reduction
    const finalDamage = this.armorCalculator.calculatePlayerArmorReduction(player, baseDamage);
    const newHealth = Math.max(0, player.health - finalDamage);

    return {
      isHit: true,
      damage: finalDamage,
      isCritical: false, // Enemies don't crit for now
      remainingHealth: newHealth,
      message: this.messageGenerator.generateEnemyAttackMessage(enemy, finalDamage)
    };
  }

  // Delegation methods for direct access to specialized components

  /**
   * Get hit chance calculation details
   */
  public getHitCalculation(
    player: IPlayerCharacter,
    weapon: IWeapon,
    enemy: IEnemy
  ): IHitCalculation {
    return this.hitChanceCalculator.calculateHitChance(player, weapon, enemy);
  }

  /**
   * Get damage calculation details
   */
  public getDamageCalculation(
    weapon: IWeapon,
    target: IEnemy,
    attacker?: IPlayerCharacter
  ): IDamageCalculation {
    return this.damageCalculator.calculateDamage(weapon, target, attacker);
  }

  /**
   * Check if player can use weapon
   */
  public canUseWeapon(player: IPlayerCharacter, weapon: IWeapon): boolean {
    return this.ammoManager.canUseWeapon(player, weapon);
  }

  /**
   * Consume ammo for weapon use
   */
  public consumeAmmo(player: IPlayerCharacter, weapon: IWeapon): boolean {
    return this.ammoManager.consumeAmmo(player, weapon);
  }

  /**
   * Calculate experience gain from defeating enemy
   */
  public calculateExperienceGain(enemy: IEnemy, playerLevel: number): number {
    return this.experienceCalculator.getExperienceGain(enemy, playerLevel);
  }

  /**
   * Generate combat message
   */
  public generateCombatMessage(result: ICombatResult, weapon?: IWeapon, enemy?: IEnemy): string {
    return this.messageGenerator.generateCombatResultMessage(result, weapon, enemy);
  }

  // Legacy compatibility methods

  /**
   * Legacy hit chance calculation (for backward compatibility)
   */
  public calculateHitChance(
    player: IPlayerCharacter,
    weapon: IWeapon,
    enemy: IEnemy
  ): number {
    return this.hitChanceCalculator.getHitChance(player, weapon, enemy);
  }

  /**
   * Legacy damage calculation (for backward compatibility)
   */
  public calculateDamage(
    weapon: IWeapon,
    target: IEnemy,
    attacker?: IPlayerCharacter
  ): IDamageCalculation {
    return this.damageCalculator.calculateDamage(weapon, target, attacker);
  }

  // Access to specialized components (for advanced usage)

  /**
   * Get hit chance calculator component
   */
  public getHitChanceCalculator(): HitChanceCalculator {
    return this.hitChanceCalculator;
  }

  /**
   * Get damage calculator component
   */
  public getDamageCalculator(): DamageCalculator {
    return this.damageCalculator;
  }

  /**
   * Get ammo manager component
   */
  public getAmmoManager(): AmmoManager {
    return this.ammoManager;
  }

  /**
   * Get armor calculator component
   */
  public getArmorCalculator(): ArmorCalculator {
    return this.armorCalculator;
  }

  /**
   * Get experience calculator component
   */
  public getExperienceCalculator(): ExperienceCalculator {
    return this.experienceCalculator;
  }

  /**
   * Get message generator component
   */
  public getMessageGenerator(): CombatMessageGenerator {
    return this.messageGenerator;
  }
}
