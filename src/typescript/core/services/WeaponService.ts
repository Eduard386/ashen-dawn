import { IWeapon } from '../interfaces/IWeapon';
import { SkillType, AmmoType } from '../types/GameTypes';

/**
 * Weapon Service - Manages weapon data and operations
 * Provides centralized weapon definitions and utility functions
 */
export class WeaponService {
  private static instance: WeaponService;
  private weapons: Map<string, IWeapon> = new Map();

  private constructor() {
    this.initializeWeapons();
  }

  public static getInstance(): WeaponService {
    if (!WeaponService.instance) {
      WeaponService.instance = new WeaponService();
    }
    return WeaponService.instance;
  }

  /**
   * Get weapon by name
   */
  public getWeapon(name: string): IWeapon | null {
    return this.weapons.get(name) || null;
  }

  /**
   * Get all weapons
   */
  public getAllWeapons(): IWeapon[] {
    return Array.from(this.weapons.values());
  }

  /**
   * Get weapons by skill type
   */
  public getWeaponsBySkill(skill: SkillType): IWeapon[] {
    return this.getAllWeapons().filter(weapon => weapon.skill === skill);
  }

  /**
   * Get weapons by ammo type
   */
  public getWeaponsByAmmoType(ammoType: AmmoType): IWeapon[] {
    return this.getAllWeapons().filter(weapon => weapon.ammoType === ammoType);
  }

  /**
   * Check if weapon is ranged
   */
  public isRangedWeapon(weaponName: string): boolean {
    const weapon = this.getWeapon(weaponName);
    return weapon ? weapon.ammoType !== 'melee' : false;
  }

  /**
   * Check if weapon is melee
   */
  public isMeleeWeapon(weaponName: string): boolean {
    const weapon = this.getWeapon(weaponName);
    return weapon ? weapon.ammoType === 'melee' : false;
  }

  /**
   * Get weapon damage range as string
   */
  public getDamageRangeString(weaponName: string): string {
    const weapon = this.getWeapon(weaponName);
    if (!weapon) return 'Unknown';
    
    if (weapon.damage.min === weapon.damage.max) {
      return weapon.damage.min.toString();
    }
    return `${weapon.damage.min}-${weapon.damage.max}`;
  }

  /**
   * Calculate average damage for weapon
   */
  public getAverageDamage(weaponName: string): number {
    const weapon = this.getWeapon(weaponName);
    if (!weapon) return 0;
    
    return (weapon.damage.min + weapon.damage.max) / 2;
  }

  /**
   * Convert legacy weapon name to standardized format
   */
  public convertLegacyName(legacyName: string): string {
    const nameMap: Record<string, string> = {
      'Baseball bat': 'baseball_bat',
      '9mm pistol': '9mm_pistol',
      '44 Magnum revolver': 'magnum_44_revolver',
      '44 Desert Eagle': 'desert_eagle_44',
      'Laser pistol': 'laser_pistol',
      'SMG': 'smg_9mm',
      'Combat shotgun': 'combat_shotgun',
      'Laser rifle': 'laser_rifle',
      'Minigun': 'minigun',
      'Frag grenade': 'frag_grenade',
      'Knife': 'knife',
      'Spear': 'spear'
    };

    return nameMap[legacyName] || legacyName.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Initialize weapon database
   */
  private initializeWeapons(): void {
    const weaponData: IWeapon[] = [
      // Melee Weapons
      {
        name: 'baseball_bat',
        skill: 'melee_weapons',
        ammoType: 'melee',
        cooldown: 3000,
        damage: { min: 3, max: 10 },
        clipSize: 1000, // Unlimited for melee
        shotsPerAttack: 1,
        criticalChance: 5
      },
      {
        name: 'knife',
        skill: 'melee_weapons',
        ammoType: 'melee',
        cooldown: 2000,
        damage: { min: 1, max: 6 },
        clipSize: 1000,
        shotsPerAttack: 1,
        criticalChance: 10
      },
      {
        name: 'spear',
        skill: 'melee_weapons',
        ammoType: 'melee',
        cooldown: 3500,
        damage: { min: 3, max: 10 },
        clipSize: 1000,
        shotsPerAttack: 1,
        criticalChance: 8
      },

      // Small Guns
      {
        name: '9mm_pistol',
        skill: 'small_guns',
        ammoType: 'mm_9',
        cooldown: 2500,
        damage: { min: 10, max: 24 },
        clipSize: 12,
        shotsPerAttack: 1,
        criticalChance: 10
      },
      {
        name: 'smg_9mm',
        skill: 'small_guns',
        ammoType: 'mm_9',
        cooldown: 1500,
        damage: { min: 8, max: 18 },
        clipSize: 30,
        shotsPerAttack: 3,
        criticalChance: 8
      },

      // Big Guns
      {
        name: 'magnum_44_revolver',
        skill: 'big_guns',
        ammoType: 'magnum_44',
        cooldown: 4000,
        damage: { min: 20, max: 35 },
        clipSize: 6,
        shotsPerAttack: 1,
        criticalChance: 15
      },
      {
        name: 'desert_eagle_44',
        skill: 'big_guns',
        ammoType: 'magnum_44',
        cooldown: 3500,
        damage: { min: 18, max: 32 },
        clipSize: 8,
        shotsPerAttack: 1,
        criticalChance: 12
      },
      {
        name: 'combat_shotgun',
        skill: 'big_guns',
        ammoType: 'mm_12',
        cooldown: 5000,
        damage: { min: 25, max: 50 },
        clipSize: 8,
        shotsPerAttack: 1,
        criticalChance: 20
      },
      {
        name: 'minigun',
        skill: 'big_guns',
        ammoType: 'mm_5_45',
        cooldown: 1000,
        damage: { min: 15, max: 25 },
        clipSize: 100,
        shotsPerAttack: 5,
        criticalChance: 5
      },

      // Energy Weapons
      {
        name: 'laser_pistol',
        skill: 'energy_weapons',
        ammoType: 'energy_cell',
        cooldown: 3000,
        damage: { min: 12, max: 28 },
        clipSize: 20,
        shotsPerAttack: 1,
        criticalChance: 12
      },
      {
        name: 'laser_rifle',
        skill: 'energy_weapons',
        ammoType: 'energy_cell',
        cooldown: 4000,
        damage: { min: 22, max: 40 },
        clipSize: 15,
        shotsPerAttack: 1,
        criticalChance: 18
      },

      // Explosives
      {
        name: 'frag_grenade',
        skill: 'pyrotechnics',
        ammoType: 'frag_grenade',
        cooldown: 6000,
        damage: { min: 30, max: 60 },
        clipSize: 1,
        shotsPerAttack: 1,
        criticalChance: 25
      }
    ];

    // Populate the weapons map
    weaponData.forEach(weapon => {
      this.weapons.set(weapon.name, weapon);
    });
  }
}
