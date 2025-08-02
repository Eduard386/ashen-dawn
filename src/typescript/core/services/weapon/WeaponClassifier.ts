import { IWeapon } from '../../interfaces/IWeapon.js';
import { AmmoType } from '../../types/GameTypes';
import { WeaponRegistry } from './WeaponRegistry.js';

/**
 * Weapon Classifier - Single Responsibility: Weapon Type Classification
 * 
 * Responsible ONLY for:
 * - Classifying weapons by type (ranged/melee)
 * - Weapon characteristic analysis
 * - Type-based categorization
 * 
 * NOT responsible for:
 * - Weapon storage/retrieval
 * - Damage calculations
 * - Complex queries
 * - Data conversion
 */
export class WeaponClassifier {
  private classificationCache: Map<string, WeaponClassification> = new Map();
  private classificationHistory: Array<{
    weaponName: string;
    classification: WeaponClassification;
    timestamp: number;
  }> = [];

  constructor(private weaponRegistry: WeaponRegistry) {}

  /**
   * Check if weapon is ranged
   */
  public isRangedWeapon(weaponName: string): boolean {
    const classification = this.getWeaponClassification(weaponName);
    return classification.isRanged;
  }

  /**
   * Check if weapon is melee
   */
  public isMeleeWeapon(weaponName: string): boolean {
    const classification = this.getWeaponClassification(weaponName);
    return classification.isMelee;
  }

  /**
   * Check if weapon is automatic (multiple shots per attack)
   */
  public isAutomaticWeapon(weaponName: string): boolean {
    const weapon = this.weaponRegistry.getWeapon(weaponName);
    return weapon ? weapon.shotsPerAttack > 1 : false;
  }

  /**
   * Check if weapon is single-shot
   */
  public isSingleShotWeapon(weaponName: string): boolean {
    const weapon = this.weaponRegistry.getWeapon(weaponName);
    return weapon ? weapon.shotsPerAttack === 1 : false;
  }

  /**
   * Check if weapon is explosive
   */
  public isExplosiveWeapon(weaponName: string): boolean {
    const weapon = this.weaponRegistry.getWeapon(weaponName);
    return weapon ? weapon.skill === 'pyrotechnics' : false;
  }

  /**
   * Check if weapon is energy-based
   */
  public isEnergyWeapon(weaponName: string): boolean {
    const weapon = this.weaponRegistry.getWeapon(weaponName);
    return weapon ? weapon.skill === 'energy_weapons' : false;
  }

  /**
   * Get weapon fire rate category
   */
  public getFireRateCategory(weaponName: string): 'very_slow' | 'slow' | 'medium' | 'fast' | 'very_fast' | 'unknown' {
    const weapon = this.weaponRegistry.getWeapon(weaponName);
    if (!weapon) return 'unknown';

    if (weapon.cooldown >= 5000) return 'very_slow';
    if (weapon.cooldown >= 3500) return 'slow';
    if (weapon.cooldown >= 2000) return 'medium';
    if (weapon.cooldown >= 1000) return 'fast';
    return 'very_fast';
  }

  /**
   * Get weapon damage category
   */
  public getDamageCategory(weaponName: string): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'unknown' {
    const weapon = this.weaponRegistry.getWeapon(weaponName);
    if (!weapon) return 'unknown';

    const avgDamage = (weapon.damage.min + weapon.damage.max) / 2;
    
    if (avgDamage < 10) return 'very_low';
    if (avgDamage < 20) return 'low';
    if (avgDamage < 30) return 'medium';
    if (avgDamage < 45) return 'high';
    return 'very_high';
  }

  /**
   * Get weapon accuracy category based on critical chance
   */
  public getAccuracyCategory(weaponName: string): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'unknown' {
    const weapon = this.weaponRegistry.getWeapon(weaponName);
    if (!weapon) return 'unknown';

    const critChance = weapon.criticalChance || 0;
    
    if (critChance < 5) return 'very_low';
    if (critChance < 10) return 'low';
    if (critChance < 15) return 'medium';
    if (critChance < 20) return 'high';
    return 'very_high';
  }

  /**
   * Get comprehensive weapon classification
   */
  public getWeaponClassification(weaponName: string): WeaponClassification {
    // Check cache first
    if (this.classificationCache.has(weaponName)) {
      return this.classificationCache.get(weaponName)!;
    }

    const weapon = this.weaponRegistry.getWeapon(weaponName);
    if (!weapon) {
      return {
        weaponName,
        exists: false,
        isMelee: false,
        isRanged: false,
        isAutomatic: false,
        isExplosive: false,
        isEnergy: false,
        fireRateCategory: 'unknown',
        damageCategory: 'unknown',
        accuracyCategory: 'unknown',
        ammoType: null,
        skillType: null
      };
    }

    const classification: WeaponClassification = {
      weaponName,
      exists: true,
      isMelee: weapon.ammoType === 'melee',
      isRanged: weapon.ammoType !== 'melee',
      isAutomatic: weapon.shotsPerAttack > 1,
      isExplosive: weapon.skill === 'pyrotechnics',
      isEnergy: weapon.skill === 'energy_weapons',
      fireRateCategory: this.getFireRateCategory(weaponName),
      damageCategory: this.getDamageCategory(weaponName),
      accuracyCategory: this.getAccuracyCategory(weaponName),
      ammoType: weapon.ammoType,
      skillType: weapon.skill
    };

    // Cache the result
    this.classificationCache.set(weaponName, classification);
    
    // Record classification history
    this.classificationHistory.push({
      weaponName,
      classification,
      timestamp: Date.now()
    });

    return classification;
  }

  /**
   * Get all weapons of a specific classification
   */
  public getWeaponsByClassification(
    filter: Partial<WeaponClassification>
  ): IWeapon[] {
    const allWeapons = this.weaponRegistry.getAllWeapons();
    
    return allWeapons.filter(weapon => {
      const classification = this.getWeaponClassification(weapon.name);
      
      // Check each filter property
      for (const [key, value] of Object.entries(filter)) {
        if (value !== undefined && classification[key as keyof WeaponClassification] !== value) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Get classification statistics
   */
  public getClassificationStats(): {
    totalClassified: number;
    meleeCount: number;
    rangedCount: number;
    automaticCount: number;
    explosiveCount: number;
    energyCount: number;
    fireRateBreakdown: Map<string, number>;
    damageBreakdown: Map<string, number>;
    accuracyBreakdown: Map<string, number>;
    skillBreakdown: Map<string, number>;
    ammoTypeBreakdown: Map<string, number>;
  } {
    const allWeapons = this.weaponRegistry.getAllWeapons();
    const stats = {
      totalClassified: allWeapons.length,
      meleeCount: 0,
      rangedCount: 0,
      automaticCount: 0,
      explosiveCount: 0,
      energyCount: 0,
      fireRateBreakdown: new Map<string, number>(),
      damageBreakdown: new Map<string, number>(),
      accuracyBreakdown: new Map<string, number>(),
      skillBreakdown: new Map<string, number>(),
      ammoTypeBreakdown: new Map<string, number>()
    };

    allWeapons.forEach(weapon => {
      const classification = this.getWeaponClassification(weapon.name);
      
      if (classification.isMelee) stats.meleeCount++;
      if (classification.isRanged) stats.rangedCount++;
      if (classification.isAutomatic) stats.automaticCount++;
      if (classification.isExplosive) stats.explosiveCount++;
      if (classification.isEnergy) stats.energyCount++;
      
      // Fire rate breakdown
      const fireRate = classification.fireRateCategory;
      stats.fireRateBreakdown.set(fireRate, (stats.fireRateBreakdown.get(fireRate) || 0) + 1);
      
      // Damage breakdown
      const damage = classification.damageCategory;
      stats.damageBreakdown.set(damage, (stats.damageBreakdown.get(damage) || 0) + 1);
      
      // Accuracy breakdown
      const accuracy = classification.accuracyCategory;
      stats.accuracyBreakdown.set(accuracy, (stats.accuracyBreakdown.get(accuracy) || 0) + 1);
      
      // Skill breakdown
      if (classification.skillType) {
        const skill = classification.skillType;
        stats.skillBreakdown.set(skill, (stats.skillBreakdown.get(skill) || 0) + 1);
      }
      
      // Ammo type breakdown
      if (classification.ammoType) {
        const ammo = classification.ammoType;
        stats.ammoTypeBreakdown.set(ammo, (stats.ammoTypeBreakdown.get(ammo) || 0) + 1);
      }
    });

    return stats;
  }

  /**
   * Clear classification cache
   */
  public clearCache(): void {
    this.classificationCache.clear();
    this.classificationHistory = [];
  }

  /**
   * Get classification history
   */
  public getClassificationHistory(): Array<{
    weaponName: string;
    classification: WeaponClassification;
    timestamp: number;
  }> {
    return [...this.classificationHistory];
  }
}

/**
 * Weapon Classification Result Interface
 */
export interface WeaponClassification {
  weaponName: string;
  exists: boolean;
  isMelee: boolean;
  isRanged: boolean;
  isAutomatic: boolean;
  isExplosive: boolean;
  isEnergy: boolean;
  fireRateCategory: 'very_slow' | 'slow' | 'medium' | 'fast' | 'very_fast' | 'unknown';
  damageCategory: 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'unknown';
  accuracyCategory: 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'unknown';
  ammoType: AmmoType | null;
  skillType: string | null;
}
