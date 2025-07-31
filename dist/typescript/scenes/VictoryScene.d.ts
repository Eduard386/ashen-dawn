/**
 * Modern TypeScript VictoryScene - Post-battle loot and rewards
 * Handles experience gain, loot distribution, and armor upgrades
 */
export declare class VictoryScene extends Phaser.Scene {
    private bridge;
    private victoryMusic?;
    private background?;
    private lootText?;
    private experienceText?;
    private continueText?;
    private spaceKey?;
    private readonly lootActions;
    private readonly armors;
    private readonly medicalItems;
    constructor();
    preload(): void;
    create(): void;
    update(): void;
    private createBackground;
    private createFallbackBackground;
    private playVictoryMusic;
    private processLootAndRewards;
    private getBattleResults;
    private processExperienceGain;
    private processLoot;
    private processArmorUpgrade;
    private displayResults;
    private displayLootItems;
    private setupInput;
    private continueTraveling;
    private clearBattleData;
    /**
     * Process victory with specific battle data (called from BattleScene)
     */
    processVictory(battleResults: {
        experienceGained: number;
        enemyLoot: number[];
        armorLoot?: string;
    }): void;
}
