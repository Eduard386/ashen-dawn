import { IPlayerCharacter, IPlayerSkills, IInventory } from '../../interfaces/IPlayer.js';

/**
 * Legacy Player Converter - Single Responsibility: Legacy format conversion
 * Converts between legacy JavaScript format and modern TypeScript interfaces
 */
export class LegacyPlayerConverter {

  /**
   * Convert legacy player data to modern TypeScript format
   */
  public convertFromLegacy(legacyData: any): IPlayerCharacter {
    const legacySkills = this.convertLegacySkills(legacyData.skills || {});
    
    const playerData: IPlayerCharacter = {
      id: crypto.randomUUID(),
      levelCount: legacyData.levelCount || 1,
      health: legacyData.health || 30,
      maxHealth: this.calculateMaxHealth(legacyData.levelCount || 1),
      experience: legacyData.experience || 0,
      // Flatten skills to match IPlayerCharacter
      ...legacySkills,
      currentWeapon: this.convertWeaponName(legacyData.current_weapon || 'baseball_bat'),
      currentArmor: this.convertArmorName(legacyData.current_armor || 'leather_jacket'),
      weapons: (legacyData.weapons || []).map((weapon: string) => this.convertWeaponName(weapon)),
      inventory: this.convertLegacyInventory(legacyData)
    };

    return playerData;
  }

  /**
   * Convert modern player data to legacy format
   */
  public convertToLegacy(playerData: IPlayerCharacter): any {
    return {
      levelCount: playerData.levelCount,
      health: playerData.health,
      experience: playerData.experience,
      skills: {
        small_guns: playerData.small_guns,
        big_guns: playerData.big_guns,
        energy_weapons: playerData.energy_weapons,
        melee_weapons: playerData.melee_weapons,
        pyrotechnics: playerData.pyrotechnics,
        lockpick: playerData.lockpick,
        science: playerData.science,
        repair: playerData.repair,
        medicine: playerData.medicine,
        barter: playerData.barter,
        speech: playerData.speech,
        surviving: playerData.surviving
      },
      current_weapon: this.convertWeaponNameToLegacy(playerData.currentWeapon),
      current_armor: this.convertArmorNameToLegacy(playerData.currentArmor),
      weapons: playerData.weapons.map(weapon => this.convertWeaponNameToLegacy(weapon)),
      med: playerData.inventory.med,
      ammo: playerData.inventory.ammo
    };
  }

  /**
   * Convert legacy skills format to modern interface
   */
  private convertLegacySkills(legacySkills: any): IPlayerSkills {
    return {
      small_guns: legacySkills.small_guns || 75,
      big_guns: legacySkills.big_guns || 75,
      energy_weapons: legacySkills.energy_weapons || 75,
      melee_weapons: legacySkills.melee_weapons || 75,
      pyrotechnics: legacySkills.pyrotechnics || 75,
      lockpick: legacySkills.lockpick || 75,
      science: legacySkills.science || 75,
      repair: legacySkills.repair || 75,
      medicine: legacySkills.medcine || legacySkills.medicine || 75, // Handle typo in legacy
      barter: legacySkills.barter || 75,
      speech: legacySkills.speech || 75,
      surviving: legacySkills.surviving || 75
    };
  }

  /**
   * Convert legacy inventory format to modern interface
   */
  private convertLegacyInventory(legacyData: any): IInventory {
    return {
      med: {
        first_aid_kit: legacyData.med?.first_aid_kit || 0,
        jet: legacyData.med?.jet || 0,
        buffout: legacyData.med?.buffout || 0,
        mentats: legacyData.med?.mentats || 0,
        psycho: legacyData.med?.psycho || 0
      },
      ammo: {
        mm_9: legacyData.ammo?.mm_9 || 0,
        magnum_44: legacyData.ammo?.magnum_44 || 0,
        mm_12: legacyData.ammo?.mm_12 || 0,
        mm_5_45: legacyData.ammo?.mm_5_45 || 0,
        energy_cell: legacyData.ammo?.energy_cell || 0,
        frag_grenade: legacyData.ammo?.frag_grenade || 0
      }
    };
  }

  /**
   * Convert legacy weapon names to modern format
   */
  private convertWeaponName(legacyName: string): string {
    const weaponMap: Record<string, string> = {
      'Baseball bat': 'baseball_bat',
      '9mm pistol': '9mm_pistol',
      '44 Magnum revolver': 'magnum_44',
      '44 Desert Eagle': 'desert_eagle_44',
      'Combat shotgun': 'combat_shotgun',
      'SMG': 'smg',
      'Laser pistol': 'laser_pistol',
      'Baseball Bat': 'baseball_bat' // Handle case variations
    };
    
    return weaponMap[legacyName] || legacyName.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Convert modern weapon names back to legacy format
   */
  private convertWeaponNameToLegacy(modernName: string): string {
    const weaponMap: Record<string, string> = {
      'baseball_bat': 'Baseball bat',
      '9mm_pistol': '9mm pistol',
      'magnum_44': '44 Magnum revolver',
      'desert_eagle_44': '44 Desert Eagle',
      'combat_shotgun': 'Combat shotgun',
      'smg': 'SMG',
      'laser_pistol': 'Laser pistol'
    };
    
    return weaponMap[modernName] || modernName.replace(/_/g, ' ');
  }

  /**
   * Convert legacy armor names to modern format
   */
  private convertArmorName(legacyName: string): string {
    const armorMap: Record<string, string> = {
      'Leather Jacket': 'leather_jacket',
      'Leather Armor': 'leather_armor',
      'Metal Armor': 'metal_armor',
      'Combat Armor': 'combat_armor',
      'Power Armor': 'power_armor'
    };
    
    return armorMap[legacyName] || legacyName.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Convert modern armor names back to legacy format
   */
  private convertArmorNameToLegacy(modernName: string): string {
    const armorMap: Record<string, string> = {
      'leather_jacket': 'Leather Jacket',
      'leather_armor': 'Leather Armor',
      'metal_armor': 'Metal Armor',
      'combat_armor': 'Combat Armor',
      'power_armor': 'Power Armor'
    };
    
    return armorMap[modernName] || modernName.replace(/_/g, ' ');
  }

  /**
   * Calculate max health based on level
   */
  private calculateMaxHealth(level: number): number {
    // Fallout-style: 15 base + 3 per level
    return 15 + (level * 3);
  }

  /**
   * Validate legacy data structure
   */
  public validateLegacyData(legacyData: any): boolean {
    if (!legacyData || typeof legacyData !== 'object') {
      return false;
    }

    // Check that we can extract minimum required data
    const hasHealth = typeof legacyData.health === 'number' || legacyData.health === undefined;
    const hasLevel = typeof legacyData.levelCount === 'number' || legacyData.levelCount === undefined;
    const hasExp = typeof legacyData.experience === 'number' || legacyData.experience === undefined;

    return hasHealth && hasLevel && hasExp;
  }

  /**
   * Get default legacy data structure
   */
  public getDefaultLegacyData(): any {
    return {
      levelCount: 1,
      health: 18, // Match max health for level 1: 15 + 3*1 = 18
      experience: 0,
      skills: {
        small_guns: 75,
        big_guns: 75,
        energy_weapons: 75,
        melee_weapons: 75,
        pyrotechnics: 75,
        lockpick: 75,
        science: 75,
        repair: 75,
        medicine: 75,
        barter: 75,
        speech: 75,
        surviving: 75
      },
      current_weapon: 'Baseball bat',
      current_armor: 'Leather Jacket',
      weapons: ['Baseball bat', '9mm pistol'],
      med: {
        first_aid_kit: 0,
        jet: 0,
        buffout: 0,
        mentats: 0,
        psycho: 0
      },
      ammo: {
        mm_9: 500,
        magnum_44: 12,
        mm_12: 0,
        mm_5_45: 0,
        energy_cell: 0,
        frag_grenade: 0
      }
    };
  }
}
