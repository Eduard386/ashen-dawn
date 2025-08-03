/**
 * Extended Combat Interfaces
 * Provides comprehensive interfaces for combat participants
 */
/**
 * Basic Combat Participant Implementation
 * Provides default implementations for combat interface methods
 */
export class BaseCombatant {
    constructor(id, name, health, maxHealth) {
        this.skills = new Map();
        this.statusEffects = new Set();
        this.inventory = new Map();
        this.id = id;
        this.name = name;
        this.health = health;
        this.maxHealth = maxHealth;
        this.currentAP = 10; // Default action points
        this.maxAP = 10;
        this.position = { x: 0, y: 0 };
    }
    // Base ICombatant implementation
    getId() {
        return this.id;
    }
    getHealth() {
        return this.health;
    }
    getMaxHealth() {
        return this.maxHealth;
    }
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
    getSkillValue(skill) {
        return this.skills.get(skill) || 0;
    }
    // Extended interface implementation
    getName() {
        return this.name;
    }
    getDisplayName() {
        return this.name;
    }
    getCurrentAP() {
        return this.currentAP;
    }
    getMaxAP() {
        return this.maxAP;
    }
    spendAP(amount) {
        if (this.currentAP >= amount) {
            this.currentAP -= amount;
            return true;
        }
        return false;
    }
    restoreAP(amount) {
        this.currentAP = Math.min(this.maxAP, this.currentAP + amount);
    }
    // Default weapon implementations (should be overridden)
    getWeaponSkill() {
        return this.getSkill('small_guns') || 50;
    }
    getWeaponRange() {
        return 10; // Default range
    }
    getWeaponDamage() {
        return 10; // Default damage
    }
    getDamageBonus() {
        return Math.floor(this.getSkill('strength') / 10);
    }
    getWeaponName() {
        return 'Fists';
    }
    getWeaponAmmoType() {
        return 'none';
    }
    hasAmmo(ammoType, amount) {
        if (ammoType === 'none')
            return true;
        return (this.inventory.get(ammoType) || 0) >= amount;
    }
    consumeAmmo(ammoType, amount) {
        if (ammoType === 'none')
            return true;
        const current = this.inventory.get(ammoType) || 0;
        if (current >= amount) {
            this.inventory.set(ammoType, current - amount);
            return true;
        }
        return false;
    }
    // Default defense implementations
    getDefenseValue() {
        return this.getArmorClass() + this.getSkill('dodge');
    }
    getArmorClass() {
        return this.defence?.armorClass || 0;
    }
    getDamageThreshold() {
        return this.defence?.damageThreshold || 0;
    }
    getDamageResistance() {
        return this.defence?.damageResistance || 0;
    }
    // Skills implementation
    getSkill(skillName) {
        return this.skills.get(skillName) || 0;
    }
    hasSkill(skillName) {
        return this.skills.has(skillName);
    }
    getSkillBonus(skillName) {
        return Math.floor(this.getSkill(skillName) / 10);
    }
    setSkill(skillName, value) {
        this.skills.set(skillName, value);
    }
    // Status implementations
    isAlive() {
        return this.health > 0;
    }
    isConscious() {
        return this.health > 0;
    }
    canAct() {
        return this.isAlive() && this.isConscious() && this.currentAP > 0;
    }
    hasStatusEffect(effectName) {
        return this.statusEffects.has(effectName);
    }
    addStatusEffect(effectName) {
        this.statusEffects.add(effectName);
    }
    removeStatusEffect(effectName) {
        this.statusEffects.delete(effectName);
    }
    // Position implementation
    getPosition() {
        return { ...this.position };
    }
    setPosition(x, y) {
        this.position = { x, y };
    }
    getDistanceTo(other) {
        const otherPos = other.getPosition();
        const dx = this.position.x - otherPos.x;
        const dy = this.position.y - otherPos.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    // Inventory implementation
    hasItem(itemId) {
        return (this.inventory.get(itemId) || 0) > 0;
    }
    getItemCount(itemId) {
        return this.inventory.get(itemId) || 0;
    }
    useItem(itemId) {
        const count = this.inventory.get(itemId) || 0;
        if (count > 0) {
            this.inventory.set(itemId, count - 1);
            return true;
        }
        return false;
    }
    addItem(itemId, quantity = 1) {
        const current = this.inventory.get(itemId) || 0;
        this.inventory.set(itemId, current + quantity);
    }
    // Experience implementation (default)
    getLevel() {
        return 1; // Override in derived classes
    }
    giveExperience(amount) {
        // Override in derived classes
    }
    // Healing
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}
//# sourceMappingURL=CombatParticipant.js.map