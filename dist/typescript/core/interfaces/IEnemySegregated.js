/**
 * Segregated Enemy Interfaces
 * Following Interface Segregation Principle (ISP)
 * Separated into stats, behavior, rendering, and AI concerns
 */
// Type guards for validation
export function isEnemyStats(obj) {
    if (!obj || obj === null || obj === undefined)
        return false;
    return typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.type === 'string' &&
        typeof obj.maxLevel === 'number' &&
        typeof obj.currentHealth === 'number' &&
        typeof obj.experienceReward === 'number';
}
export function isEnemyDefense(obj) {
    if (!obj || obj === null || obj === undefined)
        return false;
    return typeof obj.armorClass === 'number' &&
        typeof obj.damageThreshold === 'number' &&
        typeof obj.damageResistance === 'number';
}
export function isEnemyAttack(obj) {
    if (!obj || obj === null || obj === undefined)
        return false;
    return typeof obj.hitChance === 'number' &&
        obj.damage &&
        typeof obj.damage.min === 'number' &&
        typeof obj.damage.max === 'number' &&
        typeof obj.shots === 'number' &&
        typeof obj.attackSpeed === 'number';
}
//# sourceMappingURL=IEnemySegregated.js.map