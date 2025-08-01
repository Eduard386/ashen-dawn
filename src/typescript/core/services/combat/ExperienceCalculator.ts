/**
 * Experience Calculator - Single responsibility for experience and rewards
 * Handles XP calculations, level scaling, combat rewards
 */
import { IEnemy } from '../../interfaces/IEnemy.js';
import { IPlayerCharacter } from '../../interfaces/IPlayer.js';

export interface IExperienceCalculation {
  baseExperience: number;
  levelModifier: number;
  difficultyModifier: number;
  finalExperience: number;
  levelDifference: number;
}

export class ExperienceCalculator {
  /**
   * Calculate experience gained from defeating enemy
   */
  public calculateExperienceGain(enemy: IEnemy, playerLevel: number): IExperienceCalculation {
    const baseExperience = enemy.experience || 0;
    const levelDifference = playerLevel - enemy.maxLevel;
    
    // Level modifier - reduce XP for fighting lower level enemies
    const levelModifier = Math.max(0, 1 - (levelDifference * 0.1)); // 10% reduction per level difference
    
    // Difficulty modifier (could be expanded for different difficulty settings)
    const difficultyModifier = 1.0;
    
    const finalExperience = Math.floor(baseExperience * levelModifier * difficultyModifier);

    return {
      baseExperience,
      levelModifier,
      difficultyModifier,
      finalExperience: Math.max(1, finalExperience), // Minimum 1 XP
      levelDifference
    };
  }

  /**
   * Calculate experience for simple victory (legacy compatibility)
   */
  public getExperienceGain(enemy: IEnemy, playerLevel: number): number {
    const calculation = this.calculateExperienceGain(enemy, playerLevel);
    return calculation.finalExperience;
  }

  /**
   * Calculate bonus experience for special achievements
   */
  public calculateBonusExperience(
    baseExperience: number,
    conditions: {
      criticalKill?: boolean;
      perfectAccuracy?: boolean;
      noHealthLost?: boolean;
      speedKill?: boolean;
    }
  ): number {
    let multiplier = 1.0;
    
    if (conditions.criticalKill) multiplier += 0.25; // +25% for critical finishing blow
    if (conditions.perfectAccuracy) multiplier += 0.15; // +15% for 100% hit rate
    if (conditions.noHealthLost) multiplier += 0.20; // +20% for taking no damage
    if (conditions.speedKill) multiplier += 0.10; // +10% for quick victory
    
    return Math.floor(baseExperience * multiplier);
  }

  /**
   * Calculate skill experience gain
   */
  public calculateSkillExperience(
    skillUsed: string,
    actionSuccess: boolean,
    difficulty: number = 1.0
  ): number {
    const baseSkillXP = actionSuccess ? 5 : 2; // More XP for successful actions
    const difficultyBonus = Math.floor(difficulty * 2); // Harder actions give more XP
    
    return baseSkillXP + difficultyBonus;
  }

  /**
   * Calculate experience required for next level
   */
  public getExperienceForLevel(level: number): number {
    // Fallout-style progression: level * 1000 
    return level * 1000;
  }

  /**
   * Check if player levels up after gaining experience
   */
  public checkLevelUp(currentExperience: number, currentLevel: number): {
    levelsGained: number;
    newLevel: number;
    experienceToNext: number;
  } {
    let newLevel = currentLevel;
    let levelsGained = 0;
    
    while (currentExperience >= this.getExperienceForLevel(newLevel + 1)) {
      newLevel++;
      levelsGained++;
    }
    
    const experienceToNext = this.getExperienceForLevel(newLevel + 1) - currentExperience;
    
    return {
      levelsGained,
      newLevel,
      experienceToNext
    };
  }

  /**
   * Get experience progress as percentage
   */
  public getExperienceProgress(currentExperience: number, currentLevel: number): number {
    const currentLevelXP = this.getExperienceForLevel(currentLevel);
    const nextLevelXP = this.getExperienceForLevel(currentLevel + 1);
    const progressXP = currentExperience - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    
    if (requiredXP <= 0) return 100;
    
    return Math.min(100, Math.max(0, (progressXP / requiredXP) * 100));
  }
}
