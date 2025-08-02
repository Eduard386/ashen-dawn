/**
 * Combat Message Generator - Single responsibility for combat messaging
 * Handles attack messages, miss messages, critical hit messages
 */
import { IDamageCalculation } from '../../interfaces/ICombatSegregated.js';
import { ICombatResult } from '../../interfaces/ICombatSegregated.js';
import { IWeapon } from '../../interfaces/IWeapon.js';
import { IEnemy } from '../../interfaces/IEnemy.js';

export class CombatMessageGenerator {
  /**
   * Generate attack message based on damage calculation
   */
  public generateAttackMessage(damageCalc: IDamageCalculation, weaponName: string): string {
    if (damageCalc.isCritical) {
      return `💥 Critical hit with ${weaponName}! ${damageCalc.finalDamage} damage!`;
    } else {
      return `🎯 Hit with ${weaponName} for ${damageCalc.finalDamage} damage.`;
    }
  }

  /**
   * Generate miss message
   */
  public generateMissMessage(weaponName?: string): string {
    const missMessages = [
      '❌ You missed!',
      '❌ Your shot went wide!',
      '❌ You failed to connect!',
      '❌ The attack missed its mark!'
    ];
    
    if (weaponName) {
      const weaponMissMessages = [
        `❌ Your ${weaponName} missed!`,
        `❌ The ${weaponName} failed to hit!`,
        `❌ You couldn't land the ${weaponName} attack!`
      ];
      // When weapon name is provided, prefer weapon-specific messages
      return weaponMissMessages[Math.floor(Math.random() * weaponMissMessages.length)];
    }
    
    return missMessages[Math.floor(Math.random() * missMessages.length)];
  }

  /**
   * Generate enemy attack message
   */
  public generateEnemyAttackMessage(enemy: IEnemy, damage: number, isCritical: boolean = false): string {
    const weapon = enemy.attack.weapon || 'claws';
    
    if (isCritical) {
      return `💥 ${enemy.name} lands a critical hit with ${weapon}! ${damage} damage!`;
    } else {
      return `🗡️ ${enemy.name} attacks with ${weapon} for ${damage} damage!`;
    }
  }

  /**
   * Generate enemy miss message
   */
  public generateEnemyMissMessage(enemy: IEnemy): string {
    const weapon = enemy.attack.weapon || 'attack';
    const missMessages = [
      `❌ ${enemy.name} missed!`,
      `❌ ${enemy.name}'s ${weapon} misses you!`,
      `❌ You dodge ${enemy.name}'s attack!`,
      `❌ ${enemy.name} fails to connect!`
    ];
    
    return missMessages[Math.floor(Math.random() * missMessages.length)];
  }

  /**
   * Generate death message
   */
  public generateDeathMessage(enemy: IEnemy): string {
    const deathMessages = [
      `💀 ${enemy.name} has been defeated!`,
      `☠️ You killed the ${enemy.name}!`,
      `🏆 ${enemy.name} falls to your attack!`,
      `⚰️ The ${enemy.name} is dead!`
    ];
    
    return deathMessages[Math.floor(Math.random() * deathMessages.length)];
  }

  /**
   * Generate armor block message
   */
  public generateArmorBlockMessage(armorType: string, damageBlocked: number): string {
    return `🛡️ Your ${armorType} absorbs ${damageBlocked} damage!`;
  }

  /**
   * Generate ammo depletion message
   */
  public generateOutOfAmmoMessage(weaponName: string, ammoType: string): string {
    return `🔫 Out of ${ammoType} for ${weaponName}!`;
  }

  /**
   * Generate reload message
   */
  public generateReloadMessage(weaponName: string): string {
    return `🔄 Reloading ${weaponName}...`;
  }

  /**
   * Generate complete combat result message
   */
  public generateCombatResultMessage(result: ICombatResult, weapon?: IWeapon, enemy?: IEnemy): string {
    if (!result.isHit) {
      return this.generateMissMessage(weapon?.name);
    }

    if (result.isCritical) {
      return `💥 Critical hit! ${result.damage} damage! ${enemy?.name || 'Enemy'} health: ${result.remainingHealth}`;
    }

    return `🎯 Hit for ${result.damage} damage! ${enemy?.name || 'Enemy'} health: ${result.remainingHealth}`;
  }

  /**
   * Generate experience gain message
   */
  public generateExperienceMessage(experienceGained: number, enemy: IEnemy): string {
    return `⭐ Gained ${experienceGained} experience from defeating ${enemy.name}!`;
  }

  /**
   * Generate level up message
   */
  public generateLevelUpMessage(newLevel: number): string {
    return `🎉 Level up! You are now level ${newLevel}!`;
  }
}
