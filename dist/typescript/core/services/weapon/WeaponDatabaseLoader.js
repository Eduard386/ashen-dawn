/**
 * Weapon Database Loader - Single Responsibility: Weapon Data Initialization
 *
 * Responsible ONLY for:
 * - Loading default weapon definitions
 * - Initializing weapon database
 * - Managing weapon data sources
 *
 * NOT responsible for:
 * - Weapon storage/retrieval (handled by registry)
 * - Damage calculations
 * - Weapon classification
 * - Complex queries
 */
export class WeaponDatabaseLoader {
    constructor(weaponRegistry) {
        this.weaponRegistry = weaponRegistry;
        this.loadingHistory = [];
    }
    /**
     * Load default weapon database
     */
    loadDefaultWeapons() {
        const weaponData = this.getDefaultWeaponData();
        return this.loadWeaponArray(weaponData, 'default');
    }
    /**
     * Load weapons from array
     */
    loadWeaponArray(weapons, source = 'array') {
        let loaded = 0;
        let failed = 0;
        const errors = [];
        weapons.forEach(weapon => {
            try {
                if (this.weaponRegistry.validateWeapon(weapon)) {
                    this.weaponRegistry.registerWeapon(weapon);
                    loaded++;
                }
                else {
                    failed++;
                    errors.push(`Invalid weapon data: ${weapon.name || 'unknown'}`);
                }
            }
            catch (error) {
                failed++;
                errors.push(`Failed to load weapon ${weapon.name || 'unknown'}: ${error}`);
            }
        });
        this.recordLoading('array', loaded, source);
        return { loaded, failed, errors };
    }
    /**
     * Load weapons from JSON data
     */
    loadWeaponsFromJSON(jsonData, source = 'json') {
        try {
            const parsedData = JSON.parse(jsonData);
            if (Array.isArray(parsedData)) {
                return this.loadWeaponArray(parsedData, source);
            }
            else if (parsedData.weapons && Array.isArray(parsedData.weapons)) {
                return this.loadWeaponArray(parsedData.weapons, source);
            }
            else {
                return {
                    loaded: 0,
                    failed: 1,
                    errors: ['JSON data is not in expected format (array or object with weapons property)']
                };
            }
        }
        catch (error) {
            return {
                loaded: 0,
                failed: 1,
                errors: [`Failed to parse JSON: ${error}`]
            };
        }
    }
    /**
     * Load weapons from object map
     */
    loadWeaponsFromMap(weaponMap, source = 'map') {
        const weaponArray = Object.values(weaponMap);
        return this.loadWeaponArray(weaponArray, source);
    }
    /**
     * Reload default weapons (clear and reload)
     */
    reloadDefaultWeapons() {
        this.weaponRegistry.clearWeapons();
        return this.loadDefaultWeapons();
    }
    /**
     * Get loading statistics
     */
    getLoadingStats() {
        const totalWeapons = this.loadingHistory.reduce((sum, load) => sum + load.weaponCount, 0);
        const sourceBreakdown = new Map();
        this.loadingHistory.forEach(load => {
            sourceBreakdown.set(load.source, (sourceBreakdown.get(load.source) || 0) + load.weaponCount);
        });
        return {
            totalLoadOperations: this.loadingHistory.length,
            totalWeaponsLoaded: totalWeapons,
            loadingHistory: [...this.loadingHistory],
            sourceBreakdown,
            averageWeaponsPerLoad: this.loadingHistory.length > 0 ? totalWeapons / this.loadingHistory.length : 0,
            lastLoadOperation: this.loadingHistory[this.loadingHistory.length - 1] || null
        };
    }
    /**
     * Clear loading history
     */
    clearLoadingHistory() {
        this.loadingHistory = [];
    }
    /**
     * Get default weapon data definitions
     */
    getDefaultWeaponData() {
        return [
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
                cooldown: 800,
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
    }
    /**
     * Record loading operation for statistics
     */
    recordLoading(loadType, weaponCount, source) {
        this.loadingHistory.push({
            loadType,
            weaponCount,
            timestamp: Date.now(),
            source
        });
        // Keep only last 100 load operations to prevent memory buildup
        if (this.loadingHistory.length > 100) {
            this.loadingHistory = this.loadingHistory.slice(-100);
        }
    }
}
//# sourceMappingURL=WeaponDatabaseLoader.js.map