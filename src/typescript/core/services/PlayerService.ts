import { IPlayerCharacter, IPlayerSkills, IInventory } from '../interfaces/IPlayer';

/**
 * Player Service - Manages player character data and operations
 * Bridges between legacy JavaScript GameData and new TypeScript interfaces
 */
export class PlayerService {
  private static instance: PlayerService;
  private playerData: IPlayerCharacter | null = null;

  private constructor() {}

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  /**
   * Initialize player from legacy GameData format
   */
  public initializeFromLegacy(legacyData: any): IPlayerCharacter {
    // Convert legacy format to TypeScript interface
    const playerData: IPlayerCharacter = {
      id: crypto.randomUUID(),
      levelCount: legacyData.levelCount || 1,
      health: legacyData.health || 30,
      maxHealth: this.calculateMaxHealth(legacyData.levelCount || 1),
      experience: legacyData.experience || 0,
      skills: this.convertLegacySkills(legacyData.skills || {}),
      currentWeapon: this.convertWeaponName(legacyData.current_weapon || 'baseball_bat'),
      currentArmor: this.convertArmorName(legacyData.current_armor || 'leather_jacket'),
      weapons: (legacyData.weapons || []).map((weapon: string) => this.convertWeaponName(weapon)),
      inventory: this.convertLegacyInventory(legacyData)
    };

    this.playerData = playerData;
    return playerData;
  }

  /**
   * Get current player data
   */
  public getPlayer(): IPlayerCharacter | null {
    return this.playerData;
  }

  /**
   * Update player health
   */
  public updateHealth(newHealth: number): void {
    if (this.playerData) {
      this.playerData.health = Math.max(0, Math.min(newHealth, this.playerData.maxHealth));
    }
  }

  /**
   * Add experience and handle level up
   */
  public addExperience(experience: number): boolean {
    if (!this.playerData) return false;

    this.playerData.experience += experience;
    const requiredExp = this.getRequiredExperience(this.playerData.levelCount);
    
    if (this.playerData.experience >= requiredExp) {
      this.levelUp();
      return true; // Level up occurred
    }
    return false;
  }

  /**
   * Use medical item
   */
  public useMedicalItem(itemType: keyof IInventory['med']): boolean {
    if (!this.playerData || this.playerData.inventory.med[itemType] <= 0) {
      return false;
    }

    this.playerData.inventory.med[itemType]--;
    
    // Apply healing effects
    switch (itemType) {
      case 'first_aid_kit':
        this.updateHealth(this.playerData.health + 20);
        break;
      case 'jet':
        // Temporary boost (would need effect system)
        break;
      case 'buffout':
        // Temporary strength boost
        break;
      case 'mentats':
        // Temporary intelligence boost
        break;
      case 'psycho':
        // Temporary damage boost
        break;
    }
    
    return true;
  }

  /**
   * Add weapon to inventory
   */
  public addWeapon(weaponName: string): void {
    if (this.playerData && !this.playerData.weapons.includes(weaponName)) {
      this.playerData.weapons.push(weaponName);
    }
  }

  /**
   * Switch current weapon
   */
  public switchWeapon(weaponName: string): boolean {
    if (this.playerData && this.playerData.weapons.includes(weaponName)) {
      this.playerData.currentWeapon = weaponName;
      return true;
    }
    return false;
  }

  /**
   * Add ammo to inventory
   */
  public addAmmo(ammoType: keyof IInventory['ammo'], amount: number): void {
    if (this.playerData) {
      this.playerData.inventory.ammo[ammoType] += amount;
    }
  }

  /**
   * Use ammo from inventory
   */
  public useAmmo(ammoType: keyof IInventory['ammo'], amount: number): boolean {
    if (this.playerData && this.playerData.inventory.ammo[ammoType] >= amount) {
      this.playerData.inventory.ammo[ammoType] -= amount;
      return true;
    }
    return false;
  }

  /**
   * Convert legacy GameData back to legacy format for saving
   */
  public toLegacyFormat(): any {
    if (!this.playerData) return null;

    return {
      levelCount: this.playerData.levelCount,
      health: this.playerData.health,
      experience: this.playerData.experience,
      skills: this.playerData.skills,
      current_weapon: this.playerData.currentWeapon.replace('_', ' '),
      current_armor: this.playerData.currentArmor.replace('_', ' '),
      weapons: this.playerData.weapons.map(w => w.replace('_', ' ')),
      med: this.playerData.inventory.med,
      ammo: this.playerData.inventory.ammo
    };
  }

  // Private helper methods

  private calculateMaxHealth(level: number): number {
    return 30 + (level - 1) * 5; // Base 30 + 5 per level
  }

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

  private convertWeaponName(legacyName: string): string {
    return legacyName.toLowerCase().replace(/\s+/g, '_');
  }

  private convertArmorName(legacyName: string): string {
    return legacyName.toLowerCase().replace(/\s+/g, '_');
  }

  private getRequiredExperience(level: number): number {
    return level * 100; // Simple progression: 100 XP per level
  }

  private levelUp(): void {
    if (!this.playerData) return;

    this.playerData.levelCount++;
    this.playerData.maxHealth = this.calculateMaxHealth(this.playerData.levelCount);
    this.playerData.health = this.playerData.maxHealth; // Full heal on level up
    
    // Reset experience for next level
    const requiredExp = this.getRequiredExperience(this.playerData.levelCount - 1);
    this.playerData.experience -= requiredExp;
  }
}
