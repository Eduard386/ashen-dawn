/**
 * Health Manager - Single Responsibility: Player health and medical items
 * Manages player health, healing, and medical item consumption
 */
export class HealthManager {
    constructor(playerData) {
        this.playerData = playerData;
    }
    /**
     * Get current health
     */
    getHealth() {
        return this.playerData.health;
    }
    /**
     * Get maximum health
     */
    getMaxHealth() {
        return this.playerData.maxHealth;
    }
    /**
     * Update health to specific value
     */
    updateHealth(newHealth) {
        this.playerData.health = Math.max(0, Math.min(newHealth, this.playerData.maxHealth));
    }
    /**
     * Heal player by amount
     */
    heal(amount) {
        const oldHealth = this.playerData.health;
        this.updateHealth(this.playerData.health + amount);
        return this.playerData.health - oldHealth; // Return actual healing amount
    }
    /**
     * Deal damage to player
     */
    takeDamage(damage) {
        const oldHealth = this.playerData.health;
        this.updateHealth(this.playerData.health - damage);
        return oldHealth - this.playerData.health; // Return actual damage taken
    }
    /**
     * Check if player is dead
     */
    isDead() {
        return this.playerData.health <= 0;
    }
    /**
     * Get health percentage (0-100)
     */
    getHealthPercentage() {
        return this.playerData.maxHealth > 0 ? (this.playerData.health / this.playerData.maxHealth) * 100 : 0;
    }
    /**
     * Use medical item and apply healing
     */
    useMedicalItem(itemType) {
        if (this.playerData.inventory.med[itemType] <= 0) {
            return false;
        }
        // Consume the item
        this.playerData.inventory.med[itemType]--;
        // Apply healing effects based on item type
        const healingAmount = this.getMedicalItemHealingAmount(itemType);
        this.heal(healingAmount);
        return true;
    }
    /**
     * Check if medical item is available
     */
    hasMedicalItem(itemType) {
        return this.playerData.inventory.med[itemType] > 0;
    }
    /**
     * Get medical item count
     */
    getMedicalItemCount(itemType) {
        return this.playerData.inventory.med[itemType];
    }
    /**
     * Get all medical items
     */
    getAllMedicalItems() {
        return { ...this.playerData.inventory.med };
    }
    /**
     * Calculate healing amount for medical item
     */
    getMedicalItemHealingAmount(itemType) {
        const healingValues = {
            first_aid_kit: 20,
            jet: 0, // Temporary boost, no healing
            buffout: 0, // Temporary strength boost, no healing
            mentats: 0, // Temporary intelligence boost, no healing
            psycho: 0 // Temporary damage boost, no healing
        };
        return healingValues[itemType] || 0;
    }
    /**
     * Calculate max health based on level and endurance
     * Formula: 15 + (2 * endurance) + (3 * level)
     */
    static calculateMaxHealth(level, endurance = 5) {
        return 15 + (2 * endurance) + (3 * level);
    }
    /**
     * Update max health when level changes
     */
    updateMaxHealth(newLevel) {
        // Assume endurance of 5 if not available (legacy compatibility)
        const endurance = 5; // Could be extracted from player stats if available
        this.playerData.maxHealth = HealthManager.calculateMaxHealth(newLevel, endurance);
        // Ensure current health doesn't exceed new max
        if (this.playerData.health > this.playerData.maxHealth) {
            this.playerData.health = this.playerData.maxHealth;
        }
    }
}
//# sourceMappingURL=HealthManager.js.map