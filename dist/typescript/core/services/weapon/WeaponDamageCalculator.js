/**
 * Damage Calculator - Single Responsibility: Weapon Damage Calculations
 *
 * Responsible ONLY for:
 * - Calculating weapon damage values
 * - Damage range analysis
 * - Damage statistics and comparisons
 *
 * NOT responsible for:
 * - Weapon storage/retrieval
 * - Weapon classification
 * - Complex queries
 * - Data conversion
 */
export class WeaponDamageCalculator {
    constructor(weaponRegistry) {
        this.weaponRegistry = weaponRegistry;
        this.calculationHistory = [];
    }
    /**
     * Get weapon damage range as string
     */
    getDamageRangeString(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 'Unknown';
        if (weapon.damage.min === weapon.damage.max) {
            return weapon.damage.min.toString();
        }
        return `${weapon.damage.min}-${weapon.damage.max}`;
    }
    /**
     * Calculate average damage for weapon
     */
    getAverageDamage(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 0;
        const avgDamage = (weapon.damage.min + weapon.damage.max) / 2;
        this.recordCalculation(weaponName, 'average', avgDamage);
        return avgDamage;
    }
    /**
     * Calculate minimum damage for weapon
     */
    getMinimumDamage(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 0;
        this.recordCalculation(weaponName, 'minimum', weapon.damage.min);
        return weapon.damage.min;
    }
    /**
     * Calculate maximum damage for weapon
     */
    getMaximumDamage(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 0;
        this.recordCalculation(weaponName, 'maximum', weapon.damage.max);
        return weapon.damage.max;
    }
    /**
     * Calculate damage per shot considering multiple shots
     */
    getDamagePerShot(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 0;
        const avgDamage = (weapon.damage.min + weapon.damage.max) / 2;
        const damagePerShot = avgDamage * weapon.shotsPerAttack;
        this.recordCalculation(weaponName, 'perShot', damagePerShot);
        return damagePerShot;
    }
    /**
     * Calculate damage per second (DPS)
     */
    getDamagePerSecond(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 0;
        const avgDamage = (weapon.damage.min + weapon.damage.max) / 2;
        const totalDamagePerAttack = avgDamage * weapon.shotsPerAttack;
        const cooldownInSeconds = weapon.cooldown / 1000;
        const dps = totalDamagePerAttack / cooldownInSeconds;
        this.recordCalculation(weaponName, 'dps', dps);
        return dps;
    }
    /**
     * Calculate expected damage with critical hits
     */
    getExpectedDamageWithCriticals(weaponName, criticalMultiplier = 2.0) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 0;
        const avgDamage = (weapon.damage.min + weapon.damage.max) / 2;
        const critChance = (weapon.criticalChance || 0) / 100;
        const normalDamage = avgDamage * (1 - critChance);
        const criticalDamage = (avgDamage * criticalMultiplier) * critChance;
        const expectedDamage = (normalDamage + criticalDamage) * weapon.shotsPerAttack;
        this.recordCalculation(weaponName, 'expectedWithCrits', expectedDamage);
        return expectedDamage;
    }
    /**
     * Calculate damage range (max - min)
     */
    getDamageVariance(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 0;
        const variance = weapon.damage.max - weapon.damage.min;
        this.recordCalculation(weaponName, 'variance', variance);
        return variance;
    }
    /**
     * Calculate damage efficiency (damage per cooldown ratio)
     */
    getDamageEfficiency(weaponName) {
        const weapon = this.weaponRegistry.getWeapon(weaponName);
        if (!weapon)
            return 0;
        const avgDamage = (weapon.damage.min + weapon.damage.max) / 2;
        const totalDamage = avgDamage * weapon.shotsPerAttack;
        const efficiency = totalDamage / weapon.cooldown;
        this.recordCalculation(weaponName, 'efficiency', efficiency);
        return efficiency;
    }
    /**
     * Compare damage between two weapons
     */
    compareDamage(weaponName1, weaponName2) {
        const weapon1 = this.weaponRegistry.getWeapon(weaponName1);
        const weapon2 = this.weaponRegistry.getWeapon(weaponName2);
        if (!weapon1 || !weapon2) {
            return {
                weapon1: weaponName1,
                weapon2: weaponName2,
                valid: false,
                avgDamage1: 0,
                avgDamage2: 0,
                dps1: 0,
                dps2: 0,
                winner: 'neither',
                damageDifference: 0,
                dpsDifference: 0
            };
        }
        const avgDamage1 = this.getAverageDamage(weaponName1);
        const avgDamage2 = this.getAverageDamage(weaponName2);
        const dps1 = this.getDamagePerSecond(weaponName1);
        const dps2 = this.getDamagePerSecond(weaponName2);
        return {
            weapon1: weaponName1,
            weapon2: weaponName2,
            valid: true,
            avgDamage1,
            avgDamage2,
            dps1,
            dps2,
            winner: dps1 > dps2 ? 'weapon1' : dps2 > dps1 ? 'weapon2' : 'tie',
            damageDifference: Math.abs(avgDamage1 - avgDamage2),
            dpsDifference: Math.abs(dps1 - dps2)
        };
    }
    /**
     * Get damage statistics for all weapons
     */
    getAllWeaponDamageStats() {
        const weapons = this.weaponRegistry.getAllWeapons();
        return weapons.map(weapon => ({
            weaponName: weapon.name,
            minDamage: weapon.damage.min,
            maxDamage: weapon.damage.max,
            avgDamage: this.getAverageDamage(weapon.name),
            damagePerShot: this.getDamagePerShot(weapon.name),
            dps: this.getDamagePerSecond(weapon.name),
            damageVariance: this.getDamageVariance(weapon.name),
            efficiency: this.getDamageEfficiency(weapon.name),
            expectedWithCrits: this.getExpectedDamageWithCriticals(weapon.name)
        }));
    }
    /**
     * Find weapons with highest damage in category
     */
    getHighestDamageWeapons(count = 5) {
        const allStats = this.getAllWeaponDamageStats();
        return allStats
            .sort((a, b) => b.avgDamage - a.avgDamage)
            .slice(0, count);
    }
    /**
     * Find weapons with highest DPS
     */
    getHighestDPSWeapons(count = 5) {
        const allStats = this.getAllWeaponDamageStats();
        return allStats
            .sort((a, b) => b.dps - a.dps)
            .slice(0, count);
    }
    /**
     * Find most efficient weapons (best damage per cooldown)
     */
    getMostEfficientWeapons(count = 5) {
        const allStats = this.getAllWeaponDamageStats();
        return allStats
            .sort((a, b) => b.efficiency - a.efficiency)
            .slice(0, count);
    }
    /**
     * Get calculation statistics
     */
    getCalculationStats() {
        const typeBreakdown = new Map();
        const weaponCount = new Map();
        this.calculationHistory.forEach(calc => {
            typeBreakdown.set(calc.calculationType, (typeBreakdown.get(calc.calculationType) || 0) + 1);
            weaponCount.set(calc.weaponName, (weaponCount.get(calc.weaponName) || 0) + 1);
        });
        const uniqueWeapons = weaponCount.size;
        const mostCalculatedWeapon = uniqueWeapons > 0 ?
            Array.from(weaponCount.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0] : null;
        return {
            totalCalculations: this.calculationHistory.length,
            calculationTypeBreakdown: typeBreakdown,
            weaponCalculationCount: weaponCount,
            averageCalculationsPerWeapon: uniqueWeapons > 0 ? this.calculationHistory.length / uniqueWeapons : 0,
            mostCalculatedWeapon
        };
    }
    /**
     * Clear calculation history
     */
    clearCalculationHistory() {
        this.calculationHistory = [];
    }
    /**
     * Record calculation for statistics
     */
    recordCalculation(weaponName, calculationType, result) {
        this.calculationHistory.push({
            weaponName,
            calculationType,
            result,
            timestamp: Date.now()
        });
        // Keep only last 1000 calculations to prevent memory buildup
        if (this.calculationHistory.length > 1000) {
            this.calculationHistory = this.calculationHistory.slice(-1000);
        }
    }
}
//# sourceMappingURL=WeaponDamageCalculator.js.map