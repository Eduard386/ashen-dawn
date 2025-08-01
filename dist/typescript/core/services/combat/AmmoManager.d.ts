/**
 * Ammo Manager - Single responsibility for ammunition management
 * Handles ammo consumption, availability checks, reloading
 */
import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IWeapon } from '../../interfaces/IWeapon.js';
export declare class AmmoManager {
    /**
     * Check if player can use weapon (has required ammo)
     */
    canUseWeapon(player: IPlayerCharacter, weapon: IWeapon): boolean;
    /**
     * Consume ammo for weapon attack
     */
    consumeAmmo(player: IPlayerCharacter, weapon: IWeapon): boolean;
    /**
     * Get remaining ammo for weapon
     */
    getRemainingAmmo(player: IPlayerCharacter, weapon: IWeapon): number;
    /**
     * Add ammo to player inventory
     */
    addAmmo(player: IPlayerCharacter, ammoType: string, amount: number): void;
    /**
     * Check if weapon needs reloading (for future implementation)
     */
    needsReload(weapon: IWeapon, currentClip: number): boolean;
    /**
     * Calculate shots possible with current ammo
     */
    calculatePossibleShots(player: IPlayerCharacter, weapon: IWeapon): number;
}
