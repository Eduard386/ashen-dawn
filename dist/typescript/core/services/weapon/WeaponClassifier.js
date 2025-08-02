/**
 * Weapon Classifier - Single Responsibility: Weapon Type Classification
 *
 * Responsible ONLY for:
 * - Classifying weapons by type (ranged/melee)
 * - Weapon characteristic analysis
 * - Type-based categorization
 *
 * NOT responsible for:
 * - Weapon storage/retrieval
 * - Damage calculations
 * - Complex queries
 * - Data conversion
 */
export class WeaponClassifier {
    constructor(weaponRegistry) {
        this.weaponRegistry = weaponRegistry;
        this.classificationCache = new Map();
        this.classificationHistory = [];
    }
    /**
     * Check if weapon is ranged
     */
    isRangedWeapon(weaponName) {
        const classification = this.getWeaponClassification(weaponName);
        return classification.isRanged;
    }
    /**
     * Check if weapon is melee
     */
    isMeleeWeapon(weaponName) {
        const classification = this.getWeaponClassification(weaponName);
        return classification.isMelee;
    }
    /**
     * Check if weapon is automatic (multiple shots per attack)
     */
    isAutomaticWeapon(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        return weapon ? weapon.shotsPerAttack > 1 : false;
    }
    /**
     * Check if weapon is single-shot
     */
    isSingleShotWeapon(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        return weapon ? weapon.shotsPerAttack === 1 : false;
    }
    /**
     * Check if weapon is explosive
     */
    isExplosiveWeapon(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        return weapon ? weapon.skill === 'pyrotechnics' : false;
    }
    /**
     * Check if weapon is energy-based
     */
    isEnergyWeapon(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        return weapon ? weapon.skill === 'energy_weapons' : false;
    }
    /**
     * Get weapon fire rate category
     */
    getFireRateCategory(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 'unknown';
        if (weapon.cooldown >= 5000)
            return 'very_slow';
        if (weapon.cooldown >= 3500)
            return 'slow';
        if (weapon.cooldown >= 2000)
            return 'medium';
        if (weapon.cooldown >= 1000)
            return 'fast';
        return 'very_fast';
    }
    /**
     * Get weapon damage category
     */
    getDamageCategory(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 'unknown';
        const avgDamage = (weapon.damage.min + weapon.damage.max) / 2;
        if (avgDamage < 10)
            return 'very_low';
        if (avgDamage < 20)
            return 'low';
        if (avgDamage < 30)
            return 'medium';
        if (avgDamage < 45)
            return 'high';
        return 'very_high';
    }
    /**
     * Get weapon accuracy category based on critical chance
     */
    getAccuracyCategory(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 'unknown';
        const critChance = weapon.criticalChance || 0;
        if (critChance < 5)
            return 'very_low';
        if (critChance < 10)
            return 'low';
        if (critChance < 15)
            return 'medium';
        if (critChance < 20)
            return 'high';
        return 'very_high';
    }
    /**
     * Get comprehensive weapon classification
     */
    getWeaponClassification(weaponName) {
        // Check cache first
        if (this.classificationCache.has(weaponName)) {
            return this.classificationCache.get(weaponName);
        }
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon) {
            return {
                weaponName,
                exists: false,
                isMelee: false,
                isRanged: false,
                isAutomatic: false,
                isExplosive: false,
                isEnergy: false,
                fireRateCategory: 'unknown',
                damageCategory: 'unknown',
                accuracyCategory: 'unknown',
                ammoType: null,
                skillType: null
            };
        }
        const classification = {
            weaponName,
            exists: true,
            isMelee: weapon.ammoType === 'melee',
            isRanged: weapon.ammoType !== 'melee',
            isAutomatic: weapon.shotsPerAttack > 1,
            isExplosive: weapon.skill === 'pyrotechnics',
            isEnergy: weapon.skill === 'energy_weapons',
            fireRateCategory: this.getFireRateCategory(weaponName),
            damageCategory: this.getDamageCategory(weaponName),
            accuracyCategory: this.getAccuracyCategory(weaponName),
            ammoType: weapon.ammoType,
            skillType: weapon.skill
        };
        // Cache the result
        this.classificationCache.set(weaponName, classification);
        // Record classification history
        this.classificationHistory.push({
            weaponName,
            classification,
            timestamp: Date.now()
        });
        return classification;
    }
    /**
     * Get all weapons of a specific classification
     */
    getWeaponsByClassification(filter) {
        const allWeapons = this.weaponRegistry.getAllWeapons();
        return allWeapons.filter(weapon => {
            const classification = this.getWeaponClassification(weapon.name);
            // Check each filter property
            for (const [key, value] of Object.entries(filter)) {
                if (value !== undefined && classification[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * Get classification statistics
     */
    getClassificationStats() {
        const allWeapons = this.weaponRegistry.getAllWeapons();
        const stats = {
            totalClassified: allWeapons.length,
            meleeCount: 0,
            rangedCount: 0,
            automaticCount: 0,
            explosiveCount: 0,
            energyCount: 0,
            fireRateBreakdown: new Map(),
            damageBreakdown: new Map(),
            accuracyBreakdown: new Map(),
            skillBreakdown: new Map(),
            ammoTypeBreakdown: new Map()
        };
        allWeapons.forEach(weapon => {
            const classification = this.getWeaponClassification(weapon.name);
            if (classification.isMelee)
                stats.meleeCount++;
            if (classification.isRanged)
                stats.rangedCount++;
            if (classification.isAutomatic)
                stats.automaticCount++;
            if (classification.isExplosive)
                stats.explosiveCount++;
            if (classification.isEnergy)
                stats.energyCount++;
            // Fire rate breakdown
            const fireRate = classification.fireRateCategory;
            stats.fireRateBreakdown.set(fireRate, (stats.fireRateBreakdown.get(fireRate) || 0) + 1);
            // Damage breakdown
            const damage = classification.damageCategory;
            stats.damageBreakdown.set(damage, (stats.damageBreakdown.get(damage) || 0) + 1);
            // Accuracy breakdown
            const accuracy = classification.accuracyCategory;
            stats.accuracyBreakdown.set(accuracy, (stats.accuracyBreakdown.get(accuracy) || 0) + 1);
            // Skill breakdown
            if (classification.skillType) {
                const skill = classification.skillType;
                stats.skillBreakdown.set(skill, (stats.skillBreakdown.get(skill) || 0) + 1);
            }
            // Ammo type breakdown
            if (classification.ammoType) {
                const ammo = classification.ammoType;
                stats.ammoTypeBreakdown.set(ammo, (stats.ammoTypeBreakdown.get(ammo) || 0) + 1);
            }
        });
        return stats;
    }
    /**
     * Clear classification cache
     */
    clearCache() {
        this.classificationCache.clear();
        this.classificationHistory = [];
    }
    /**
     * Get classification history
     */
    getClassificationHistory() {
        return [...this.classificationHistory];
    }
}
//# sourceMappingURL=WeaponClassifier.js.map