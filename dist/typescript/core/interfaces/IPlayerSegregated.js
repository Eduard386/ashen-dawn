/**
 * Segregated Player Interfaces
 * Following Interface Segregation Principle (ISP)
 * Each interface has a single, focused responsibility
 */
// Type guards for interface validation
export function isCharacterStats(obj) {
    if (!obj || obj === null || obj === undefined)
        return false;
    return typeof obj.id === 'string' &&
        typeof obj.health === 'number' &&
        typeof obj.maxHealth === 'number' &&
        typeof obj.levelCount === 'number' &&
        typeof obj.experience === 'number';
}
export function isCharacterSkills(obj) {
    if (!obj || obj === null || obj === undefined)
        return false;
    const requiredSkills = [
        'small_guns', 'big_guns', 'energy_weapons', 'melee_weapons',
        'pyrotechnics', 'lockpick', 'science', 'repair', 'medicine',
        'barter', 'speech', 'surviving'
    ];
    return requiredSkills.every(skill => typeof obj[skill] === 'number' && obj[skill] >= 0);
}
export function isInventoryValid(obj) {
    if (!obj || obj === null || obj === undefined)
        return false;
    return obj.med && typeof obj.med === 'object' &&
        obj.ammo && typeof obj.ammo === 'object';
}
//# sourceMappingURL=IPlayerSegregated.js.map