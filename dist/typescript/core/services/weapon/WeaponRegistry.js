/**
 * Weapon Registry - Single Responsibility: Weapon Storage and Retrieval
 *
 * Responsible ONLY for:
 * - Storing weapon definitions
 * - Retrieving weapons by name
 * - Managing weapon database state
 *
 * NOT responsible for:
 * - Weapon classification logic
 * - Damage calculations
 * - Legacy data conversion
 * - Complex querying/filtering
 */
export class WeaponRegistry {
    constructor() {
        this.weapons = new Map();
        this.registrationHistory = [];
    }
    /**
     * Register a weapon in the registry
     */
    registerWeapon(weapon) {
        this.weapons.set(weapon.name, { ...weapon }); // Deep copy to prevent external mutations
        this.registrationHistory.push({
            name: weapon.name,
            timestamp: Date.now()
        });
    }
    /**
     * Register multiple weapons at once
     */
    registerWeapons(weapons) {
        weapons.forEach(weapon => this.registerWeapon(weapon));
    }
    /**
     * Get weapon by name
     */
    getWeapon(name) {
        const weapon = this.weapons.get(name);
        return weapon ? { ...weapon } : null; // Return copy to prevent mutation
    }
    /**
     * Check if weapon exists in registry
     */
    hasWeapon(name) {
        return this.weapons.has(name);
    }
    /**
     * Get all weapon names
     */
    getWeaponNames() {
        return Array.from(this.weapons.keys());
    }
    /**
     * Get all weapons (as copies)
     */
    getAllWeapons() {
        return Array.from(this.weapons.values()).map(weapon => ({ ...weapon }));
    }
    /**
     * Remove weapon from registry
     */
    removeWeapon(name) {
        return this.weapons.delete(name);
    }
    /**
     * Clear all weapons
     */
    clearWeapons() {
        this.weapons.clear();
        this.registrationHistory = [];
    }
    /**
     * Get weapon count
     */
    getWeaponCount() {
        return this.weapons.size;
    }
    /**
     * Validate weapon data structure
     */
    validateWeapon(weapon) {
        return !!(weapon.name &&
            typeof weapon.name === 'string' &&
            weapon.skill &&
            weapon.ammoType &&
            weapon.damage &&
            typeof weapon.damage.min === 'number' &&
            typeof weapon.damage.max === 'number' &&
            weapon.damage.min <= weapon.damage.max &&
            typeof weapon.cooldown === 'number' &&
            weapon.cooldown >= 0 &&
            typeof weapon.clipSize === 'number' &&
            weapon.clipSize > 0 &&
            typeof weapon.shotsPerAttack === 'number' &&
            weapon.shotsPerAttack > 0);
    }
    /**
     * Get registration statistics
     */
    getRegistrationStats() {
        const timestamps = this.registrationHistory.map(entry => entry.timestamp);
        return {
            totalWeapons: this.weapons.size,
            registrationHistory: [...this.registrationHistory],
            oldestRegistration: timestamps.length > 0 ? Math.min(...timestamps) : null,
            newestRegistration: timestamps.length > 0 ? Math.max(...timestamps) : null
        };
    }
    /**
     * Export weapons for backup/serialization
     */
    exportWeapons() {
        const exported = {};
        this.weapons.forEach((weapon, name) => {
            exported[name] = { ...weapon };
        });
        return exported;
    }
    /**
     * Import weapons from backup/serialization
     */
    importWeapons(weaponData) {
        let imported = 0;
        let failed = 0;
        const errors = [];
        Object.values(weaponData).forEach(weapon => {
            if (this.validateWeapon(weapon)) {
                this.registerWeapon(weapon);
                imported++;
            }
            else {
                failed++;
                errors.push(`Invalid weapon data for: ${weapon.name || 'unknown'}`);
            }
        });
        return { imported, failed, errors };
    }
}
//# sourceMappingURL=WeaponRegistry.js.map