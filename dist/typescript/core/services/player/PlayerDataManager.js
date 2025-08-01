/**
 * Player Data Manager - Single Responsibility: Core player data management
 * Manages the central player data object and provides access to it
 */
export class PlayerDataManager {
    constructor() {
        this.playerData = null;
    }
    /**
     * Initialize player data
     */
    initializePlayer(playerData) {
        this.playerData = playerData;
    }
    /**
     * Get current player data
     */
    getPlayerData() {
        return this.playerData;
    }
    /**
     * Check if player is initialized
     */
    isInitialized() {
        return this.playerData !== null;
    }
    /**
     * Update player data
     */
    updatePlayerData(updates) {
        if (!this.playerData) {
            throw new Error('Player data not initialized');
        }
        Object.assign(this.playerData, updates);
    }
    /**
     * Get player ID
     */
    getPlayerId() {
        return this.playerData?.id || null;
    }
    /**
     * Get player level
     */
    getPlayerLevel() {
        return this.playerData?.levelCount || 1;
    }
    /**
     * Get player health
     */
    getPlayerHealth() {
        return this.playerData?.health || 0;
    }
    /**
     * Get player experience
     */
    getPlayerExperience() {
        return this.playerData?.experience || 0;
    }
    /**
     * Create a deep copy of player data (for saves/backups)
     */
    clonePlayerData() {
        if (!this.playerData) {
            return null;
        }
        return JSON.parse(JSON.stringify(this.playerData));
    }
    /**
     * Reset player data
     */
    resetPlayerData() {
        this.playerData = null;
    }
    /**
     * Validate player data structure
     */
    validatePlayerData() {
        if (!this.playerData) {
            return false;
        }
        // Check required fields
        const requiredFields = ['id', 'levelCount', 'health', 'maxHealth', 'experience'];
        for (const field of requiredFields) {
            if (!(field in this.playerData)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        // Check data types
        if (typeof this.playerData.id !== 'string')
            return false;
        if (typeof this.playerData.levelCount !== 'number')
            return false;
        if (typeof this.playerData.health !== 'number')
            return false;
        if (typeof this.playerData.maxHealth !== 'number')
            return false;
        if (typeof this.playerData.experience !== 'number')
            return false;
        // Check valid ranges
        if (this.playerData.health < 0)
            return false;
        if (this.playerData.maxHealth <= 0)
            return false;
        if (this.playerData.levelCount < 1)
            return false;
        if (this.playerData.experience < 0)
            return false;
        return true;
    }
    /**
     * Get player statistics summary
     */
    getPlayerSummary() {
        if (!this.playerData) {
            return null;
        }
        return {
            id: this.playerData.id,
            level: this.playerData.levelCount,
            health: this.playerData.health,
            maxHealth: this.playerData.maxHealth,
            experience: this.playerData.experience,
            currentWeapon: this.playerData.currentWeapon,
            currentArmor: this.playerData.currentArmor
        };
    }
}
//# sourceMappingURL=PlayerDataManager.js.map