/**
 * Legacy Weapon Converter - Single Responsibility: Legacy Data Conversion
 *
 * Responsible ONLY for:
 * - Converting legacy weapon names to modern format
 * - Handling legacy weapon data structures
 * - Legacy compatibility and migration
 *
 * NOT responsible for:
 * - Weapon storage/retrieval
 * - Damage calculations
 * - Weapon classification
 * - Complex queries
 */
export class LegacyWeaponConverter {
    constructor() {
        this.conversionHistory = [];
        this.legacyNameMap = {
            'Baseball Bat': 'baseball_bat',
            '9mm pistol': '9mm_pistol',
            '44 Magnum revolver': 'magnum_44_revolver',
            '44 Desert Eagle': 'desert_eagle_44',
            'Laser pistol': 'laser_pistol',
            'SMG': 'smg_9mm',
            'Combat shotgun': 'combat_shotgun',
            'Laser rifle': 'laser_rifle',
            'Minigun': 'minigun',
            'Plasma rifle': 'plasma_rifle',
            'Rocket launcher': 'rocket_launcher',
            'Flamethrower': 'flamethrower',
            'Knife': 'knife',
            'Spear': 'spear',
            'Frag grenade': 'frag_grenade',
            'Plasma grenade': 'plasma_grenade',
            'Energy cell': 'energy_cell',
            'Fusion cell': 'fusion_cell'
        };
    }
    /**
     * Convert legacy weapon name to standardized format
     */
    convertLegacyName(legacyName) {
        // Check direct mapping first
        if (this.legacyNameMap[legacyName]) {
            const converted = this.legacyNameMap[legacyName];
            this.recordConversion(legacyName, converted, 'name');
            return converted;
        }
        // Fallback to automatic conversion
        const converted = this.automaticNameConversion(legacyName);
        this.recordConversion(legacyName, converted, 'name');
        return converted;
    }
    /**
     * Convert multiple legacy names at once
     */
    convertLegacyNames(legacyNames) {
        const conversions = new Map();
        legacyNames.forEach(name => {
            conversions.set(name, this.convertLegacyName(name));
        });
        return conversions;
    }
    /**
     * Check if a name appears to be in legacy format
     */
    isLegacyFormat(weaponName) {
        // Legacy names typically have:
        // - Spaces in the name
        // - Capital letters
        // - Direct mapping exists
        return !!(this.legacyNameMap[weaponName] ||
            weaponName.includes(' ') ||
            /[A-Z]/.test(weaponName));
    }
    /**
     * Convert legacy weapon data structure to modern format
     */
    convertLegacyWeaponData(legacyData) {
        try {
            // Validate basic structure
            if (!legacyData || typeof legacyData !== 'object') {
                return null;
            }
            // Validate required fields for legacy weapons
            if (!legacyData.name && !legacyData.title) {
                return null;
            }
            // Check if this is actually legacy weapon data (not random object)
            const hasRequiredWeaponFields = legacyData.damage ||
                legacyData.cooldown ||
                legacyData.skill ||
                legacyData.ammoType;
            if (!hasRequiredWeaponFields) {
                return null;
            }
            // Convert legacy weapon structure
            const modernWeapon = {
                name: this.convertLegacyName(legacyData.name || legacyData.title || 'unknown'),
                skill: this.convertLegacySkill(legacyData.skill || legacyData.type),
                ammoType: this.convertLegacyAmmoType(legacyData.ammoType || legacyData.ammo),
                cooldown: this.convertLegacyCooldown(legacyData.cooldown || legacyData.speed),
                damage: this.convertLegacyDamage(legacyData.damage),
                clipSize: this.convertLegacyClipSize(legacyData.clipSize || legacyData.magazine || legacyData.shots),
                shotsPerAttack: legacyData.shotsPerAttack || legacyData.burst || 1,
                criticalChance: legacyData.criticalChance || legacyData.critical || 0
            };
            // Validate the converted weapon
            if (this.validateConvertedWeapon(modernWeapon)) {
                this.recordConversion(legacyData.name || 'unknown', modernWeapon.name, 'data');
                return modernWeapon;
            }
            return null;
        }
        catch (error) {
            console.warn('Failed to convert legacy weapon data:', error);
            return null;
        }
    }
    /**
     * Convert multiple legacy weapon data structures
     */
    convertLegacyWeaponArray(legacyArray) {
        const converted = [];
        const errors = [];
        let failed = 0;
        legacyArray.forEach((legacyData, index) => {
            const result = this.convertLegacyWeaponData(legacyData);
            if (result) {
                converted.push(result);
            }
            else {
                failed++;
                errors.push(`Failed to convert weapon at index ${index}: ${legacyData?.name || 'unknown'}`);
            }
        });
        return { converted, failed, errors };
    }
    /**
     * Get reverse mapping (modern to legacy)
     */
    getModernToLegacyName(modernName) {
        const reversedMap = Object.fromEntries(Object.entries(this.legacyNameMap).map(([legacy, modern]) => [modern, legacy]));
        return reversedMap[modernName] || null;
    }
    /**
     * Add custom legacy mapping
     */
    addLegacyMapping(legacyName, modernName) {
        this.legacyNameMap[legacyName] = modernName;
    }
    /**
     * Remove legacy mapping
     */
    removeLegacyMapping(legacyName) {
        if (this.legacyNameMap[legacyName]) {
            delete this.legacyNameMap[legacyName];
            return true;
        }
        return false;
    }
    /**
     * Get all legacy mappings
     */
    getAllLegacyMappings() {
        return { ...this.legacyNameMap };
    }
    /**
     * Get conversion statistics
     */
    getConversionStats() {
        const nameConversions = this.conversionHistory.filter(c => c.conversionType === 'name').length;
        const dataConversions = this.conversionHistory.filter(c => c.conversionType === 'data').length;
        // Count conversions by weapon
        const weaponCounts = new Map();
        this.conversionHistory.forEach(conversion => {
            const name = conversion.originalName;
            weaponCounts.set(name, (weaponCounts.get(name) || 0) + 1);
        });
        const mostConvertedWeapons = Array.from(weaponCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            totalConversions: this.conversionHistory.length,
            nameConversions,
            dataConversions,
            conversionHistory: [...this.conversionHistory],
            mostConvertedWeapons
        };
    }
    /**
     * Clear conversion history
     */
    clearConversionHistory() {
        this.conversionHistory = [];
    }
    /**
     * Automatic name conversion fallback
     */
    automaticNameConversion(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }
    /**
     * Convert legacy skill names
     */
    convertLegacySkill(legacySkill) {
        if (typeof legacySkill !== 'string')
            return 'small_guns';
        const skillMap = {
            'small guns': 'small_guns',
            'big guns': 'big_guns',
            'energy weapons': 'energy_weapons',
            'melee weapons': 'melee_weapons',
            'explosives': 'pyrotechnics',
            'unarmed': 'melee_weapons'
        };
        return skillMap[legacySkill.toLowerCase()] || 'small_guns';
    }
    /**
     * Convert legacy ammo types
     */
    convertLegacyAmmoType(legacyAmmo) {
        if (typeof legacyAmmo !== 'string')
            return 'mm_9';
        const ammoMap = {
            '9mm': 'mm_9',
            '.44 magnum': 'magnum_44',
            '12 gauge': 'mm_12',
            '5.45mm': 'mm_5_45',
            'energy': 'energy_cell',
            'grenade': 'frag_grenade',
            'none': 'melee'
        };
        return ammoMap[legacyAmmo.toLowerCase()] || 'mm_9';
    }
    /**
     * Convert legacy cooldown values
     */
    convertLegacyCooldown(legacyCooldown) {
        if (typeof legacyCooldown === 'number')
            return legacyCooldown;
        if (typeof legacyCooldown === 'string') {
            const parsed = parseInt(legacyCooldown, 10);
            return isNaN(parsed) ? 3000 : parsed;
        }
        return 3000; // Default cooldown
    }
    /**
     * Convert legacy damage structures
     */
    convertLegacyDamage(legacyDamage) {
        if (legacyDamage && typeof legacyDamage === 'object') {
            if (typeof legacyDamage.min === 'number' && typeof legacyDamage.max === 'number') {
                return { min: legacyDamage.min, max: legacyDamage.max };
            }
        }
        if (typeof legacyDamage === 'number') {
            return { min: legacyDamage, max: legacyDamage };
        }
        return { min: 1, max: 6 }; // Default damage
    }
    /**
     * Convert legacy clip size values
     */
    convertLegacyClipSize(legacyClipSize) {
        if (typeof legacyClipSize === 'number')
            return legacyClipSize;
        if (typeof legacyClipSize === 'string') {
            const parsed = parseInt(legacyClipSize, 10);
            return isNaN(parsed) ? 1 : parsed;
        }
        return 1; // Default clip size
    }
    /**
     * Validate converted weapon structure
     */
    validateConvertedWeapon(weapon) {
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
            weapon.clipSize > 0);
    }
    /**
     * Record conversion for statistics
     */
    recordConversion(originalName, convertedName, conversionType) {
        this.conversionHistory.push({
            originalName,
            convertedName,
            conversionType,
            timestamp: Date.now()
        });
        // Keep only last 1000 conversions to prevent memory buildup
        if (this.conversionHistory.length > 1000) {
            this.conversionHistory = this.conversionHistory.slice(-1000);
        }
    }
}
//# sourceMappingURL=LegacyWeaponConverter.js.map