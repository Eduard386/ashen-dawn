/**
 * Segregated Combat Interfaces
 * Following Interface Segregation Principle (ISP)
 * Separated into damage calculation, hit calculation, critical calculation, and logging
 */
// Type guards for validation
export function isCombatResult(obj) {
    if (!obj || obj === null || obj === undefined)
        return false;
    return typeof obj.isHit === 'boolean' &&
        typeof obj.damage === 'number' &&
        typeof obj.isCritical === 'boolean' &&
        typeof obj.remainingHealth === 'number' &&
        typeof obj.message === 'string';
}
export function isDamageCalculation(obj) {
    if (!obj || obj === null || obj === undefined)
        return false;
    return typeof obj.baseDamage === 'number' &&
        typeof obj.finalDamage === 'number' &&
        typeof obj.isCritical === 'boolean';
}
export function isHitCalculation(obj) {
    if (!obj || obj === null || obj === undefined)
        return false;
    return typeof obj.baseHitChance === 'number' &&
        typeof obj.finalHitChance === 'number' &&
        typeof obj.isHit === 'boolean';
}
//# sourceMappingURL=ICombatSegregated.js.map