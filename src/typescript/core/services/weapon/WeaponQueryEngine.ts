import { IWeapon } from '../../interfaces/IWeapon.js';
import { SkillType, AmmoType } from '../../types/GameTypes';
import { WeaponRegistry } from './WeaponRegistry.js';

/**
 * Query Engine - Single Responsibility: Weapon Filtering and Search Operations
 * 
 * Responsible ONLY for:
 * - Filtering weapons by various criteria
 * - Complex query operations
 * - Search functionality
 * 
 * NOT responsible for:
 * - Weapon storage/retrieval
 * - Damage calculations
 * - Weapon classification logic
 * - Data conversion
 */
export class WeaponQueryEngine {
  private queryHistory: Array<{
    queryType: string;
    parameters: any;
    resultCount: number;
    timestamp: number;
  }> = [];

  constructor(private weaponRegistry: WeaponRegistry) {}

  /**
   * Get weapons by skill type
   */
  public getWeaponsBySkill(skill: SkillType): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    const results = weapons.filter(weapon => weapon.skill === skill);
    
    this.recordQuery('skill', { skill }, results.length);
    return results;
  }

  /**
   * Get weapons by ammo type
   */
  public getWeaponsByAmmoType(ammoType: AmmoType): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    const results = weapons.filter(weapon => weapon.ammoType === ammoType);
    
    this.recordQuery('ammoType', { ammoType }, results.length);
    return results;
  }

  /**
   * Get weapons by damage range
   */
  public getWeaponsByDamageRange(minDamage: number, maxDamage: number): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    const results = weapons.filter(weapon => {
      const avgDamage = (weapon.damage.min + weapon.damage.max) / 2;
      return avgDamage >= minDamage && avgDamage <= maxDamage;
    });
    
    this.recordQuery('damageRange', { minDamage, maxDamage }, results.length);
    return results;
  }

  /**
   * Get weapons by cooldown range
   */
  public getWeaponsByCooldownRange(minCooldown: number, maxCooldown: number): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    const results = weapons.filter(weapon => 
      weapon.cooldown >= minCooldown && weapon.cooldown <= maxCooldown
    );
    
    this.recordQuery('cooldownRange', { minCooldown, maxCooldown }, results.length);
    return results;
  }

  /**
   * Get weapons by critical chance range
   */
  public getWeaponsByCriticalChance(minCritical: number, maxCritical?: number): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    const results = weapons.filter(weapon => {
      const critChance = weapon.criticalChance || 0;
      return maxCritical ? 
        (critChance >= minCritical && critChance <= maxCritical) :
        critChance >= minCritical;
    });
    
    this.recordQuery('criticalChance', { minCritical, maxCritical }, results.length);
    return results;
  }

  /**
   * Get weapons by clip size range
   */
  public getWeaponsByClipSize(minClipSize: number, maxClipSize?: number): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    const results = weapons.filter(weapon => {
      return maxClipSize ? 
        (weapon.clipSize >= minClipSize && weapon.clipSize <= maxClipSize) :
        weapon.clipSize >= minClipSize;
    });
    
    this.recordQuery('clipSize', { minClipSize, maxClipSize }, results.length);
    return results;
  }

  /**
   * Search weapons by name pattern
   */
  public searchWeaponsByName(pattern: string, caseSensitive: boolean = false): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();
    
    const results = weapons.filter(weapon => {
      const weaponName = caseSensitive ? weapon.name : weapon.name.toLowerCase();
      return weaponName.includes(searchPattern);
    });
    
    this.recordQuery('nameSearch', { pattern, caseSensitive }, results.length);
    return results;
  }

  /**
   * Get weapons matching multiple criteria
   */
  public getWeaponsMatchingCriteria(criteria: {
    skills?: SkillType[];
    ammoTypes?: AmmoType[];
    minDamage?: number;
    maxDamage?: number;
    minCooldown?: number;
    maxCooldown?: number;
    minCritical?: number;
    maxCritical?: number;
  }): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    
    const results = weapons.filter(weapon => {
      // Check skill criteria
      if (criteria.skills && !criteria.skills.includes(weapon.skill)) {
        return false;
      }
      
      // Check ammo type criteria
      if (criteria.ammoTypes && !criteria.ammoTypes.includes(weapon.ammoType)) {
        return false;
      }
      
      // Check damage criteria
      if (criteria.minDamage !== undefined && weapon.damage.min < criteria.minDamage) {
        return false;
      }
      if (criteria.maxDamage !== undefined && weapon.damage.max > criteria.maxDamage) {
        return false;
      }
      
      // Check cooldown criteria
      if (criteria.minCooldown !== undefined && weapon.cooldown < criteria.minCooldown) {
        return false;
      }
      if (criteria.maxCooldown !== undefined && weapon.cooldown > criteria.maxCooldown) {
        return false;
      }
      
      // Check critical chance criteria
      const critChance = weapon.criticalChance || 0;
      if (criteria.minCritical !== undefined && critChance < criteria.minCritical) {
        return false;
      }
      if (criteria.maxCritical !== undefined && critChance > criteria.maxCritical) {
        return false;
      }
      
      return true;
    });
    
    this.recordQuery('multiCriteria', criteria, results.length);
    return results;
  }

  /**
   * Get weapons sorted by damage (average)
   */
  public getWeaponsSortedByDamage(ascending: boolean = false): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    
    const results = weapons.sort((a, b) => {
      const avgA = (a.damage.min + a.damage.max) / 2;
      const avgB = (b.damage.min + b.damage.max) / 2;
      return ascending ? avgA - avgB : avgB - avgA;
    });
    
    this.recordQuery('sortByDamage', { ascending }, results.length);
    return results;
  }

  /**
   * Get weapons sorted by cooldown
   */
  public getWeaponsSortedByCooldown(ascending: boolean = true): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    
    const results = weapons.sort((a, b) => {
      return ascending ? a.cooldown - b.cooldown : b.cooldown - a.cooldown;
    });
    
    this.recordQuery('sortByCooldown', { ascending }, results.length);
    return results;
  }

  /**
   * Get top N weapons by criteria
   */
  public getTopWeapons(count: number, sortBy: 'damage' | 'critical' | 'speed' = 'damage'): IWeapon[] {
    const weapons = this.weaponRegistry.getAllWeapons();
    
    let sorted: IWeapon[];
    switch (sortBy) {
      case 'damage':
        sorted = weapons.sort((a, b) => {
          const avgA = (a.damage.min + a.damage.max) / 2;
          const avgB = (b.damage.min + b.damage.max) / 2;
          return avgB - avgA;
        });
        break;
      case 'critical':
        sorted = weapons.sort((a, b) => {
          const critA = a.criticalChance || 0;
          const critB = b.criticalChance || 0;
          return critB - critA;
        });
        break;
      case 'speed':
        sorted = weapons.sort((a, b) => a.cooldown - b.cooldown);
        break;
      default:
        sorted = weapons;
    }
    
    const results = sorted.slice(0, count);
    this.recordQuery('topWeapons', { count, sortBy }, results.length);
    return results;
  }

  /**
   * Get query statistics
   */
  public getQueryStats(): {
    totalQueries: number;
    queryTypeBreakdown: Map<string, number>;
    averageResultCount: number;
    mostRecentQuery: any;
    queryHistory: Array<{ queryType: string, parameters: any, resultCount: number, timestamp: number }>;
  } {
    const typeBreakdown = new Map<string, number>();
    let totalResults = 0;
    
    this.queryHistory.forEach(query => {
      typeBreakdown.set(query.queryType, (typeBreakdown.get(query.queryType) || 0) + 1);
      totalResults += query.resultCount;
    });
    
    return {
      totalQueries: this.queryHistory.length,
      queryTypeBreakdown: typeBreakdown,
      averageResultCount: this.queryHistory.length > 0 ? totalResults / this.queryHistory.length : 0,
      mostRecentQuery: this.queryHistory[this.queryHistory.length - 1] || null,
      queryHistory: [...this.queryHistory]
    };
  }

  /**
   * Clear query history
   */
  public clearQueryHistory(): void {
    this.queryHistory = [];
  }

  /**
   * Record query execution for statistics
   */
  private recordQuery(queryType: string, parameters: any, resultCount: number): void {
    this.queryHistory.push({
      queryType,
      parameters: { ...parameters },
      resultCount,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 queries to prevent memory buildup
    if (this.queryHistory.length > 1000) {
      this.queryHistory = this.queryHistory.slice(-1000);
    }
  }
}
