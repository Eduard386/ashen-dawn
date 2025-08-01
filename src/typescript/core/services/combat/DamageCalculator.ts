/**
 * Damage Calculator - Single responsibility for damage calculations
 * Handles base damage, critical hits, skill bonuses, armor mitigation
 */
import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IWeapon } from '../../interfaces/IWeapon.js';
import { IEnemy } from '../../interfaces/IEnemy.js';
import { IDamageCalculation } from '../../interfaces/ICombatSegregated.js';

export class DamageCalculator {
  /**
   * Calculate complete damage calculation
   */
  public calculateDamage(
    weapon: IWeapon,
    target: IEnemy,
    attacker?: IPlayerCharacter
  ): IDamageCalculation {
    // Roll base damage
    const baseDamage = this.rollDamage(weapon.damage.min, weapon.damage.max);
    
    // Check for critical hit
    const critChance = weapon.criticalChance || 0;
    const isCritical = Math.random() * 100 < critChance;
    const criticalMultiplier = isCritical ? 2 : 1;
    
    // Apply critical hit
    let damage = baseDamage * criticalMultiplier;
    
    // Apply skill bonus (higher skill = more damage)
    const skillModifier = this.calculateSkillModifier(weapon, attacker);
    damage += skillModifier;
    
    // Apply target's damage threshold
    const thresholdReduction = target.defence.damageThreshold || 0;
    damage = Math.max(0, damage - thresholdReduction);
    
    // Apply target's damage resistance
    const resistance = target.defence.damageResistance || 0;
    const resistanceReduction = damage * resistance;
    damage = Math.floor(damage * (1 - resistance));
    
    // Minimum 1 damage on successful hit
    const finalDamage = Math.max(1, damage);

    return {
      baseDamage,
      weaponModifier: 1.0, // Could be implemented for weapon quality
      skillModifier,
      criticalMultiplier,
      armorReduction: 0, // Handled by threshold and resistance
      resistanceReduction,
      thresholdReduction,
      finalDamage,
      isCritical
    };
  }

  /**
   * Calculate skill modifier for damage
   */
  private calculateSkillModifier(weapon: IWeapon, attacker?: IPlayerCharacter): number {
    if (!attacker) return 0;
    
    const skillLevel = attacker[weapon.skill];
    const skillBonus = Math.floor((skillLevel - 50) / 10); // +1 damage per 10 skill above 50
    return Math.max(0, skillBonus);
  }

  /**
   * Roll damage between min and max
   */
  private rollDamage(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Calculate critical hit damage
   */
  public calculateCritical(baseDamage: number, criticalChance: number): { damage: number; isCritical: boolean } {
    const isCritical = Math.random() * 100 < criticalChance;
    const damage = isCritical ? baseDamage * 2 : baseDamage;
    
    return { damage, isCritical };
  }

  /**
   * Apply armor mitigation
   */
  public applyArmorMitigation(damage: number, threshold: number, resistance: number): number {
    // Apply damage threshold first
    let mitigatedDamage = Math.max(0, damage - threshold);
    
    // Apply damage resistance
    mitigatedDamage = Math.floor(mitigatedDamage * (1 - resistance));
    
    // Minimum 1 damage
    return Math.max(1, mitigatedDamage);
  }
}
