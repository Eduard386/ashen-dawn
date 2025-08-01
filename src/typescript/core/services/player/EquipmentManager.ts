import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IEquipmentManager } from '../../interfaces/IPlayerSegregated.js';

/**
 * Equipment Manager - Single Responsibility: Player equipment management
 * Manages weapons, armor, and equipment switching
 */
export class EquipmentManager implements IEquipmentManager {
  private playerData: IPlayerCharacter;

  constructor(playerData: IPlayerCharacter) {
    this.playerData = playerData;
  }

  /**
   * Get current weapon
   */
  public getCurrentWeapon(): string {
    return this.playerData.currentWeapon;
  }

  /**
   * Get current armor
   */
  public getCurrentArmor(): string {
    return this.playerData.currentArmor;
  }

  /**
   * Get all owned weapons
   */
  public getWeapons(): string[] {
    return [...this.playerData.weapons];
  }

  /**
   * Switch to different weapon
   */
  public switchWeapon(weaponName: string): boolean {
    if (!this.hasWeapon(weaponName)) {
      return false;
    }

    this.playerData.currentWeapon = weaponName;
    return true;
  }

  /**
   * Equip different armor
   */
  public equipArmor(armorName: string): void {
    this.playerData.currentArmor = armorName;
  }

  /**
   * Add weapon to inventory
   */
  public addWeapon(weaponName: string): void {
    if (this.hasWeapon(weaponName)) {
      return; // Already have this weapon
    }

    this.playerData.weapons.push(weaponName);
  }

  /**
   * Remove weapon from inventory
   */
  public removeWeapon(weaponName: string): boolean {
    const index = this.playerData.weapons.indexOf(weaponName);
    if (index === -1) {
      return false;
    }

    this.playerData.weapons.splice(index, 1);
    
    // If removing current weapon, switch to first available
    if (this.playerData.currentWeapon === weaponName) {
      this.playerData.currentWeapon = this.playerData.weapons[0] || 'unarmed';
    }

    return true;
  }

  /**
   * Check if player has specific weapon
   */
  public hasWeapon(weaponName: string): boolean {
    return this.playerData.weapons.includes(weaponName);
  }

  /**
   * Get weapon count
   */
  public getWeaponCount(): number {
    return this.playerData.weapons.length;
  }

  /**
   * Check if weapon is currently equipped
   */
  public isWeaponEquipped(weaponName: string): boolean {
    return this.playerData.currentWeapon === weaponName;
  }

  /**
   * Get next weapon in inventory (for cycling)
   */
  public getNextWeapon(): string | null {
    if (this.playerData.weapons.length <= 1) {
      return null;
    }

    const currentIndex = this.playerData.weapons.indexOf(this.playerData.currentWeapon);
    const nextIndex = (currentIndex + 1) % this.playerData.weapons.length;
    return this.playerData.weapons[nextIndex];
  }

  /**
   * Get previous weapon in inventory (for cycling)
   */
  public getPreviousWeapon(): string | null {
    if (this.playerData.weapons.length <= 1) {
      return null;
    }

    const currentIndex = this.playerData.weapons.indexOf(this.playerData.currentWeapon);
    const prevIndex = currentIndex === 0 ? this.playerData.weapons.length - 1 : currentIndex - 1;
    return this.playerData.weapons[prevIndex];
  }

  /**
   * Cycle to next weapon
   */
  public cycleToNextWeapon(): boolean {
    const nextWeapon = this.getNextWeapon();
    if (!nextWeapon) {
      return false;
    }

    return this.switchWeapon(nextWeapon);
  }

  /**
   * Cycle to previous weapon
   */
  public cycleToPreviousWeapon(): boolean {
    const prevWeapon = this.getPreviousWeapon();
    if (!prevWeapon) {
      return false;
    }

    return this.switchWeapon(prevWeapon);
  }

  /**
   * Get equipment summary
   */
  public getEquipmentSummary(): {
    currentWeapon: string;
    currentArmor: string;
    weaponCount: number;
    weapons: string[];
  } {
    return {
      currentWeapon: this.playerData.currentWeapon,
      currentArmor: this.playerData.currentArmor,
      weaponCount: this.playerData.weapons.length,
      weapons: [...this.playerData.weapons]
    };
  }

  /**
   * Validate equipment state
   */
  public validateEquipment(): boolean {
    // Ensure current weapon is in weapons array
    if (!this.hasWeapon(this.playerData.currentWeapon) && this.playerData.currentWeapon !== 'unarmed') {
      // Add current weapon to inventory if not present
      this.playerData.weapons.push(this.playerData.currentWeapon);
    }

    return true;
  }

  /**
   * Sort weapons by name
   */
  public sortWeapons(): void {
    this.playerData.weapons.sort();
  }

  /**
   * Clear all equipment (for reset scenarios)
   */
  public clearEquipment(): void {
    this.playerData.weapons = [];
    this.playerData.currentWeapon = 'unarmed';
    this.playerData.currentArmor = 'none';
  }
}
