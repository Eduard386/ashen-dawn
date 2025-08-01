/**
 * Equipment Manager - Single Responsibility: Player equipment management
 * Manages weapons, armor, and equipment switching
 */
export class EquipmentManager {
    constructor(playerData) {
        this.playerData = playerData;
    }
    /**
     * Get current weapon
     */
    getCurrentWeapon() {
        return this.playerData.currentWeapon;
    }
    /**
     * Get current armor
     */
    getCurrentArmor() {
        return this.playerData.currentArmor;
    }
    /**
     * Get all owned weapons
     */
    getWeapons() {
        return [...this.playerData.weapons];
    }
    /**
     * Switch to different weapon
     */
    switchWeapon(weaponName) {
        if (!this.hasWeapon(weaponName)) {
            return false;
        }
        this.playerData.currentWeapon = weaponName;
        return true;
    }
    /**
     * Equip different armor
     */
    equipArmor(armorName) {
        this.playerData.currentArmor = armorName;
    }
    /**
     * Add weapon to inventory
     */
    addWeapon(weaponName) {
        if (this.hasWeapon(weaponName)) {
            return; // Already have this weapon
        }
        this.playerData.weapons.push(weaponName);
    }
    /**
     * Remove weapon from inventory
     */
    removeWeapon(weaponName) {
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
    hasWeapon(weaponName) {
        return this.playerData.weapons.includes(weaponName);
    }
    /**
     * Get weapon count
     */
    getWeaponCount() {
        return this.playerData.weapons.length;
    }
    /**
     * Check if weapon is currently equipped
     */
    isWeaponEquipped(weaponName) {
        return this.playerData.currentWeapon === weaponName;
    }
    /**
     * Get next weapon in inventory (for cycling)
     */
    getNextWeapon() {
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
    getPreviousWeapon() {
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
    cycleToNextWeapon() {
        const nextWeapon = this.getNextWeapon();
        if (!nextWeapon) {
            return false;
        }
        return this.switchWeapon(nextWeapon);
    }
    /**
     * Cycle to previous weapon
     */
    cycleToPreviousWeapon() {
        const prevWeapon = this.getPreviousWeapon();
        if (!prevWeapon) {
            return false;
        }
        return this.switchWeapon(prevWeapon);
    }
    /**
     * Get equipment summary
     */
    getEquipmentSummary() {
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
    validateEquipment() {
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
    sortWeapons() {
        this.playerData.weapons.sort();
    }
    /**
     * Clear all equipment (for reset scenarios)
     */
    clearEquipment() {
        this.playerData.weapons = [];
        this.playerData.currentWeapon = 'unarmed';
        this.playerData.currentArmor = 'none';
    }
}
//# sourceMappingURL=EquipmentManager.js.map