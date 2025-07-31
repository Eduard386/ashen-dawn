import { ICombatResult, IDamageCalculation } from '../interfaces/ICombat.js';
import { IPlayerCharacter } from '../interfaces/IPlayer.js';
import { IWeapon } from '../interfaces/IWeapon.js';
import { IEnemy } from '../interfaces/IEnemy.js';

/**
 * Combat Service - Handles all combat calculations and mechanics
 * Implements SOLID principles for battle system
 */
export class CombatService {
  private static instance: CombatService;

  private constructor() {}

  public static getInstance(): CombatService {
    if (!CombatService.instance) {
      CombatService.instance = new CombatService();
    }
    return CombatService.instance;
  }

  /**
   * Calculate player attack against enemy
   */
  public calculatePlayerAttack(
    player: IPlayerCharacter,
    weapon: IWeapon,
    enemy: IEnemy
  ): ICombatResult {
    const hitChance = this.calculateHitChance(player, weapon, enemy);
    const isHit = Math.random() * 100 < hitChance;

    if (!isHit) {
      return {
        isHit: false,
        damage: 0,
        isCritical: false,
        remainingHealth: enemy.currentHealth,
        message: 'You missed!'
      };
    }

    const damageCalc = this.calculateDamage(weapon, enemy, player);
    const newHealth = Math.max(0, enemy.currentHealth - damageCalc.finalDamage);

    return {
      isHit: true,
      damage: damageCalc.finalDamage,
      isCritical: damageCalc.isCritical,
      remainingHealth: newHealth,
      message: this.generateAttackMessage(damageCalc, weapon.name)
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
        message: `${enemy.name} missed!`
      };
    }

    // Calculate base damage
    const baseDamage = this.rollDamage(enemy.attack.damage.min, enemy.attack.damage.max);
    
    // Apply player armor reduction (simplified)
    const armorReduction = this.getPlayerArmorClass(player.currentArmor);
    const finalDamage = Math.max(1, baseDamage - armorReduction);

    const newHealth = Math.max(0, player.health - finalDamage);

    return {
      isHit: true,
      damage: finalDamage,
      isCritical: false, // Enemies don't crit for now
      remainingHealth: newHealth,
      message: `${enemy.name} deals ${finalDamage} damage!`
    };
  }

  /**
   * Calculate hit chance for player attack
   */
  public calculateHitChance(
    player: IPlayerCharacter,
    weapon: IWeapon,
    enemy: IEnemy
  ): number {
    const skillLevel = player.skills[weapon.skill];
    const baseChance = skillLevel; // Skill directly affects hit chance
    
    // Apply weapon accuracy modifier
    const weaponModifier = (weapon.criticalChance || 0) / 2; // Weapon quality affects accuracy
    
    // Apply enemy armor class (higher AC = harder to hit)
    const enemyAC = enemy.defence.armorClass;
    const acPenalty = Math.max(0, enemyAC - 5) * 2; // Each AC point above 5 reduces hit chance
    
    const finalChance = Math.max(5, Math.min(95, baseChance + weaponModifier - acPenalty));
    return finalChance;
  }

  /**
   * Calculate damage with armor and resistance
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
    const critMultiplier = isCritical ? 2 : 1;
    
    // Apply critical hit
    let damage = baseDamage * critMultiplier;
    
    // Apply skill bonus (higher skill = more damage)
    if (attacker) {
      const skillLevel = attacker.skills[weapon.skill];
      const skillBonus = Math.floor((skillLevel - 50) / 10); // +1 damage per 10 skill above 50
      damage += Math.max(0, skillBonus);
    }
    
    // Apply target's damage threshold
    damage = Math.max(0, damage - target.defence.damageThreshold);
    
    // Apply target's damage resistance
    const resistance = target.defence.damageResistance || 0;
    damage = Math.floor(damage * (1 - resistance));
    
    // Minimum 1 damage on successful hit
    const finalDamage = Math.max(1, damage);

    return {
      baseDamage,
      finalDamage,
      isCritical,
      resistanceReduction: baseDamage - damage,
      thresholdReduction: target.defence.damageThreshold
    };
  }

  /**
   * Check if player can use weapon (has ammo)
   */
  public canUseWeapon(player: IPlayerCharacter, weapon: IWeapon): boolean {
    // Melee weapons always usable
    if (weapon.ammoType === 'melee') {
      return true;
    }

    // Check if player has required ammo
    const ammoType = weapon.ammoType as keyof typeof player.inventory.ammo;
    const requiredAmmo = weapon.shotsPerAttack || 1;
    
    return player.inventory.ammo[ammoType] >= requiredAmmo;
  }

  /**
   * Use ammo for weapon attack
   */
  public consumeAmmo(player: IPlayerCharacter, weapon: IWeapon): boolean {
    if (weapon.ammoType === 'melee') {
      return true;
    }

    const ammoType = weapon.ammoType as keyof typeof player.inventory.ammo;
    const requiredAmmo = weapon.shotsPerAttack || 1;
    
    if (player.inventory.ammo[ammoType] >= requiredAmmo) {
      player.inventory.ammo[ammoType] -= requiredAmmo;
      return true;
    }
    
    return false;
  }

  /**
   * Calculate experience gained from defeating enemy
   */
  public calculateExperienceGain(enemy: IEnemy, playerLevel: number): number {
    const baseExp = enemy.experience;
    
    // Reduce XP for fighting lower level enemies
    const levelDifference = playerLevel - enemy.maxLevel;
    const reduction = Math.max(0, levelDifference * 0.1); // 10% reduction per level difference
    
    return Math.floor(baseExp * (1 - reduction));
  }

  // Private helper methods

  private rollDamage(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getPlayerArmorClass(armorType: string): number {
    // Simplified armor values
    const armorValues: Record<string, number> = {
      'leather_jacket': 1,
      'leather_armor': 2,
      'metal_armor': 4,
      'combat_armor': 6,
      'power_armor': 10
    };
    
    return armorValues[armorType] || 0;
  }

  private generateAttackMessage(damageCalc: IDamageCalculation, weaponName: string): string {
    if (damageCalc.isCritical) {
      return `Critical hit with ${weaponName}! ${damageCalc.finalDamage} damage!`;
    } else {
      return `Hit with ${weaponName} for ${damageCalc.finalDamage} damage.`;
    }
  }
}
