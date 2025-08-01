/**
 * Experience Manager - Single Responsibility: Player experience and leveling
 * Manages experience points, level progression, and level-up logic
 */
export class ExperienceManager {
    constructor(playerData) {
        this.playerData = playerData;
    }
    /**
     * Get current experience
     */
    getExperience() {
        return this.playerData.experience;
    }
    /**
     * Get current level
     */
    getCurrentLevel() {
        return this.playerData.levelCount;
    }
    /**
     * Get current level (alias for compatibility)
     */
    getLevel() {
        return this.getCurrentLevel();
    }
    /**
     * Add experience points
     */
    addExperience(amount) {
        if (amount <= 0)
            return false;
        this.playerData.experience += amount;
        return this.checkForLevelUp();
    }
    /**
     * Set experience to specific amount
     */
    setExperience(amount) {
        if (amount < 0)
            return false;
        this.playerData.experience = amount;
        return this.checkForLevelUp();
    }
    /**
     * Check if player should level up and handle it
     */
    checkForLevelUp() {
        const requiredExp = this.getRequiredExperience(this.playerData.levelCount);
        if (this.playerData.experience >= requiredExp) {
            this.levelUp();
            return true;
        }
        return false;
    }
    /**
     * Get experience required for next level
     */
    getExperienceToNextLevel() {
        const requiredExp = this.getRequiredExperience(this.playerData.levelCount);
        return Math.max(0, requiredExp - this.playerData.experience);
    }
    /**
     * Get experience required for specific level
     */
    getRequiredExperience(level) {
        // Fallout-style progression: level * 1000
        return level * 1000;
    }
    /**
     * Get experience progress to next level (0-1)
     */
    getExperienceProgress() {
        const currentLevelExp = this.getRequiredExperience(this.playerData.levelCount - 1);
        const nextLevelExp = this.getRequiredExperience(this.playerData.levelCount);
        const totalNeeded = nextLevelExp - currentLevelExp;
        const currentProgress = this.playerData.experience - currentLevelExp;
        return totalNeeded > 0 ? Math.min(1, Math.max(0, currentProgress / totalNeeded)) : 1;
    }
    /**
     * Check if player can level up
     */
    canLevelUp() {
        const requiredExp = this.getRequiredExperience(this.playerData.levelCount);
        return this.playerData.experience >= requiredExp;
    }
    /**
     * Manually trigger level up (for testing or special cases)
     */
    forceLevelUp() {
        this.levelUp();
    }
    /**
     * Get maximum achievable level
     */
    getMaxLevel() {
        return 50; // Fallout-style level cap
    }
    /**
     * Check if player is at max level
     */
    isMaxLevel() {
        return this.playerData.levelCount >= this.getMaxLevel();
    }
    /**
     * Get level-up benefits preview
     */
    getLevelUpBenefits() {
        const newLevel = this.playerData.levelCount + 1;
        return {
            newLevel,
            healthIncrease: 3, // Standard health increase per level
            skillPoints: 10 // Standard skill points per level
        };
    }
    /**
     * Private method to handle level up
     */
    levelUp() {
        if (this.isMaxLevel()) {
            console.log('Player is already at maximum level');
            return;
        }
        const oldLevel = this.playerData.levelCount;
        this.playerData.levelCount++;
        // Apply level-up benefits
        const benefits = this.getLevelUpBenefits();
        // Health increase is handled by HealthManager when it's notified
        // Skill points would be handled by a SkillManager
        console.log(`Level up! ${oldLevel} -> ${this.playerData.levelCount}`);
        // Check for additional level ups (in case of massive experience gain)
        if (this.canLevelUp()) {
            this.levelUp();
        }
    }
}
//# sourceMappingURL=ExperienceManager.js.map