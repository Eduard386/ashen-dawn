import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
import { IExperienceManager } from '../../interfaces/IPlayerSegregated.js';

/**
 * Experience Manager - Single Responsibility: Player experience and leveling
 * Manages experience points, level progression, and level-up logic
 */
export class ExperienceManager implements IExperienceManager {
  private playerData: IPlayerCharacter;

  constructor(playerData: IPlayerCharacter) {
    this.playerData = playerData;
  }

  /**
   * Get current experience
   */
  public getExperience(): number {
    return this.playerData.experience;
  }

  /**
   * Get current level
   */
  public getCurrentLevel(): number {
    return this.playerData.levelCount;
  }

  /**
   * Get current level (alias for compatibility)
   */
  public getLevel(): number {
    return this.getCurrentLevel();
  }

  /**
   * Add experience points
   */
  public addExperience(amount: number): boolean {
    if (amount <= 0) return false;

    this.playerData.experience += amount;
    return this.checkForLevelUp();
  }

  /**
   * Set experience to specific amount
   */
  public setExperience(amount: number): boolean {
    if (amount < 0) return false;

    this.playerData.experience = amount;
    return this.checkForLevelUp();
  }

  /**
   * Check if player should level up and handle it
   */
  public checkForLevelUp(): boolean {
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
  public getExperienceToNextLevel(): number {
    const requiredExp = this.getRequiredExperience(this.playerData.levelCount);
    return Math.max(0, requiredExp - this.playerData.experience);
  }

  /**
   * Get experience required for specific level
   */
  public getRequiredExperience(level: number): number {
    // Fallout-style progression: level * 1000
    return level * 1000;
  }

  /**
   * Get experience progress to next level (0-1)
   */
  public getExperienceProgress(): number {
    const currentLevelExp = this.getRequiredExperience(this.playerData.levelCount - 1);
    const nextLevelExp = this.getRequiredExperience(this.playerData.levelCount);
    const totalNeeded = nextLevelExp - currentLevelExp;
    const currentProgress = this.playerData.experience - currentLevelExp;
    
    return totalNeeded > 0 ? Math.min(1, Math.max(0, currentProgress / totalNeeded)) : 1;
  }

  /**
   * Check if player can level up
   */
  public canLevelUp(): boolean {
    const requiredExp = this.getRequiredExperience(this.playerData.levelCount);
    return this.playerData.experience >= requiredExp;
  }

  /**
   * Manually trigger level up (for testing or special cases)
   */
  public forceLevelUp(): void {
    this.levelUp();
  }

  /**
   * Get maximum achievable level
   */
  public getMaxLevel(): number {
    return 50; // Fallout-style level cap
  }

  /**
   * Check if player is at max level
   */
  public isMaxLevel(): boolean {
    return this.playerData.levelCount >= this.getMaxLevel();
  }

  /**
   * Get level-up benefits preview
   */
  public getLevelUpBenefits(): {
    newLevel: number;
    healthIncrease: number;
    skillPoints: number;
  } {
    const newLevel = this.playerData.levelCount + 1;
    return {
      newLevel,
      healthIncrease: 3, // Standard health increase per level
      skillPoints: 10   // Standard skill points per level
    };
  }

  /**
   * Private method to handle level up
   */
  private levelUp(): void {
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
