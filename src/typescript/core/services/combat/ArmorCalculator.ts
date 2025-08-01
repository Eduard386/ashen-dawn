/**
 * Armor Calculator - Single responsibility for armor and defense calculations
 * Handles armor class, damage reduction, resistance calculations
 */
import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IEnemy } from '../../interfaces/IEnemy.js';

export interface IArmorInfo {
  armorClass: number;
  damageThreshold: number;
  damageResistance: number;
  name: string;
}

export class ArmorCalculator {
  private armorDatabase: Map<string, IArmorInfo> = new Map();

  constructor() {
    this.initializeArmorDatabase();
  }

  /**
   * Get player armor class for hit calculations
   */
  public getPlayerArmorClass(armorType: string): number {
    const armorInfo = this.armorDatabase.get(armorType.toLowerCase());
    return armorInfo?.armorClass || 0;
  }

  /**
   * Get complete armor information
   */
  public getArmorInfo(armorType: string): IArmorInfo | null {
    return this.armorDatabase.get(armorType.toLowerCase()) || null;
  }

  /**
   * Calculate damage reduction from player armor
   */
  public calculatePlayerArmorReduction(player: IPlayerCharacter, incomingDamage: number): number {
    const armorInfo = this.getArmorInfo(player.currentArmor);
    if (!armorInfo) return incomingDamage;

    // Apply damage threshold
    let damage = Math.max(0, incomingDamage - armorInfo.damageThreshold);
    
    // Apply damage resistance
    damage = Math.floor(damage * (1 - armorInfo.damageResistance));
    
    // Minimum 1 damage
    return Math.max(1, damage);
  }

  /**
   * Get enemy defense values
   */
  public getEnemyDefense(enemy: IEnemy): {
    armorClass: number;
    damageThreshold: number;
    damageResistance: number;
  } {
    return {
      armorClass: enemy.defence.armorClass,
      damageThreshold: enemy.defence.damageThreshold || 0,
      damageResistance: enemy.defence.damageResistance || 0
    };
  }

  /**
   * Compare armor effectiveness
   */
  public compareArmor(armor1: string, armor2: string): {
    better: string;
    acDifference: number;
    protection: 'better' | 'worse' | 'equal';
  } {
    const info1 = this.getArmorInfo(armor1);
    const info2 = this.getArmorInfo(armor2);
    
    if (!info1 || !info2) {
      return { better: 'unknown', acDifference: 0, protection: 'equal' };
    }

    const acDifference = info1.armorClass - info2.armorClass;
    
    let protection: 'better' | 'worse' | 'equal' = 'equal';
    let better = armor1;
    
    if (acDifference > 0) {
      protection = 'better';
      better = armor1;
    } else if (acDifference < 0) {
      protection = 'worse';
      better = armor2;
    }

    return { better, acDifference: Math.abs(acDifference), protection };
  }

  /**
   * Initialize armor database
   */
  private initializeArmorDatabase(): void {
    const armors: IArmorInfo[] = [
      {
        name: 'leather_jacket',
        armorClass: 1,
        damageThreshold: 0,
        damageResistance: 0.05
      },
      {
        name: 'leather_armor',
        armorClass: 2,
        damageThreshold: 1,
        damageResistance: 0.10
      },
      {
        name: 'metal_armor',
        armorClass: 4,
        damageThreshold: 2,
        damageResistance: 0.15
      },
      {
        name: 'combat_armor',
        armorClass: 6,
        damageThreshold: 3,
        damageResistance: 0.20
      },
      {
        name: 'power_armor',
        armorClass: 10,
        damageThreshold: 5,
        damageResistance: 0.40
      }
    ];

    armors.forEach(armor => {
      this.armorDatabase.set(armor.name, armor);
    });
  }
}
