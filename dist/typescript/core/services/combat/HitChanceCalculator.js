export class HitChanceCalculator {
    /**
     * Calculate complete hit chance calculation
     */
    calculateHitChance(player, weapon, enemy) {
        const skillLevel = player[weapon.skill];
        const baseHitChance = skillLevel;
        // Weapon accuracy modifier
        const weaponAccuracy = (weapon.criticalChance || 0) / 2;
        // Distance modifier (placeholder for future implementation)
        const distanceModifier = 0;
        // Enemy defense modifier
        const enemyAC = enemy.defence.armorClass;
        const targetDefenseModifier = -Math.max(0, enemyAC - 5) * 2;
        // Calculate final hit chance
        const skillModifier = 0; // Could be implemented for other bonuses
        const finalHitChance = Math.max(5, Math.min(95, baseHitChance + skillModifier + weaponAccuracy + distanceModifier + targetDefenseModifier));
        // Roll for hit
        const isHit = Math.random() * 100 < finalHitChance;
        return {
            baseHitChance,
            skillModifier,
            weaponAccuracy,
            distanceModifier,
            targetDefenseModifier,
            finalHitChance,
            isHit
        };
    }
    /**
     * Simple hit chance calculation (legacy compatibility)
     */
    getHitChance(player, weapon, enemy) {
        const calculation = this.calculateHitChance(player, weapon, enemy);
        return calculation.finalHitChance;
    }
    /**
     * Check if attack hits (roll only)
     */
    checkHit(hitChance) {
        return Math.random() * 100 < hitChance;
    }
}
//# sourceMappingURL=HitChanceCalculator.js.map