export class AmmoManager {
    /**
     * Check if player can use weapon (has required ammo)
     */
    canUseWeapon(player, weapon) {
        // Melee weapons always usable
        if (weapon.ammoType === 'melee') {
            return true;
        }
        // Check if player has required ammo
        const ammoType = weapon.ammoType;
        const requiredAmmo = weapon.shotsPerAttack || 1;
        return player.inventory.ammo[ammoType] >= requiredAmmo;
    }
    /**
     * Consume ammo for weapon attack
     */
    consumeAmmo(player, weapon) {
        if (weapon.ammoType === 'melee') {
            return true;
        }
        const ammoType = weapon.ammoType;
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
    getRemainingAmmo(player, weapon) {
        if (weapon.ammoType === 'melee') {
            return Infinity;
        }
        const ammoType = weapon.ammoType;
        return player.inventory.ammo[ammoType] || 0;
    }
    /**
     * Add ammo to player inventory
     */
    addAmmo(player, ammoType, amount) {
        const ammoKey = ammoType;
        if (player.inventory.ammo.hasOwnProperty(ammoKey)) {
            player.inventory.ammo[ammoKey] += amount;
        }
    }
    /**
     * Check if weapon needs reloading (for future implementation)
     */
    needsReload(weapon, currentClip) {
        return currentClip <= 0 && weapon.ammoType !== 'melee';
    }
    /**
     * Calculate shots possible with current ammo
     */
    calculatePossibleShots(player, weapon) {
        if (weapon.ammoType === 'melee') {
            return Infinity;
        }
        const ammoType = weapon.ammoType;
        const availableAmmo = player.inventory.ammo[ammoType] || 0;
        const requiredPerShot = weapon.shotsPerAttack || 1;
        return Math.floor(availableAmmo / requiredPerShot);
    }
}
//# sourceMappingURL=AmmoManager.js.map