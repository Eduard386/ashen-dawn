/**
 * Ammo Manager - Single responsibility for ammunition management
 * Handles ammo consumption, availability checks, reloading
 */
import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IWeapon } from '../../interfaces/IWeapon.js';

export class AmmoManager {
  /**
   * Check if player can use weapon (has required ammo)
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
   * Consume ammo for weapon attack
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
   * Get remaining ammo for weapon
   */
  public getRemainingAmmo(player: IPlayerCharacter, weapon: IWeapon): number {
    if (weapon.ammoType === 'melee') {
      return Infinity;
    }

    const ammoType = weapon.ammoType as keyof typeof player.inventory.ammo;
    return player.inventory.ammo[ammoType] || 0;
  }

  /**
   * Add ammo to player inventory
   */
  public addAmmo(player: IPlayerCharacter, ammoType: string, amount: number): void {
    const ammoKey = ammoType as keyof typeof player.inventory.ammo;
    if (player.inventory.ammo.hasOwnProperty(ammoKey)) {
      player.inventory.ammo[ammoKey] += amount;
    }
  }

  /**
   * Check if weapon needs reloading (for future implementation)
   */
  public needsReload(weapon: IWeapon, currentClip: number): boolean {
    return currentClip <= 0 && weapon.ammoType !== 'melee';
  }

  /**
   * Calculate shots possible with current ammo
   */
  public calculatePossibleShots(player: IPlayerCharacter, weapon: IWeapon): number {
    if (weapon.ammoType === 'melee') {
      return Infinity;
    }

    const ammoType = weapon.ammoType as keyof typeof player.inventory.ammo;
    const availableAmmo = player.inventory.ammo[ammoType] || 0;
    const requiredPerShot = weapon.shotsPerAttack || 1;
    
    return Math.floor(availableAmmo / requiredPerShot);
  }
}
