/**
 * Modern TypeScript MainMenuScene - Game entry point
 * Handles game initialization, level display, and world map transition
 * Now using pure TypeScript GameDataService instead of LegacyBridge
 */
export declare class MainMenuScene extends Phaser.Scene {
    private gameDataService;
    private background?;
    private startButton?;
    private levelText?;
    private instructionText?;
    private healthText?;
    private experienceText?;
    private spaceKey?;
    private enterKey?;
    constructor();
    preload(): void;
    create(): void;
    private createBackground;
    private createUI;
    private createStatsDisplay;
    private setupInput;
    private updateUI;
    update(): void;
    private startGame;
}
