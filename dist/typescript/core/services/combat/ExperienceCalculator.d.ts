/**
 * Experience Calculator - Single responsibility for experience and rewards
 * Handles XP calculations, level scaling, combat rewards
 */
import { IEnemy } from '../../interfaces/IEnemy.js';
export interface IExperienceCalculation {
    baseExperience: number;
    levelModifier: number;
    difficultyModifier: number;
    finalExperience: number;
    levelDifference: number;
}
export declare class ExperienceCalculator {
    /**
     * Calculate experience gained from defeating enemy
     */
    calculateExperienceGain(enemy: IEnemy, playerLevel: number): IExperienceCalculation;
    /**
     * Calculate experience for simple victory (legacy compatibility)
     */
    getExperienceGain(enemy: IEnemy, playerLevel: number): number;
    /**
     * Calculate bonus experience for special achievements
     */
    calculateBonusExperience(baseExperience: number, conditions: {
        criticalKill?: boolean;
        perfectAccuracy?: boolean;
        noHealthLost?: boolean;
        speedKill?: boolean;
    }): number;
    /**
     * Calculate skill experience gain
     */
    calculateSkillExperience(skillUsed: string, actionSuccess: boolean, difficulty?: number): number;
    /**
     * Calculate experience required for next level
     */
    getExperienceForLevel(level: number): number;
    /**
     * Check if player levels up after gaining experience
     */
    checkLevelUp(currentExperience: number, currentLevel: number): {
        levelsGained: number;
        newLevel: number;
        experienceToNext: number;
    };
    /**
     * Get experience progress as percentage
     */
    getExperienceProgress(currentExperience: number, currentLevel: number): number;
}
