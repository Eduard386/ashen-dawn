/**
 * Modern TypeScript MainMenuScene - Game entry point
 * Handles game initialization, level display, and world map transition
 */
export declare class MainMenuScene extends Phaser.Scene {
    private bridge;
    private background?;
    private startButton?;
    private levelText?;
    private instructionText?;
    private spaceKey?;
    private enterKey?;
    constructor();
    preload(): void;
    create(): void;
    update(): void;
    private createBackground;
    private createUI;
    private createStatsDisplay;
    private createInventorySummary;
    private setupInput;
    private updateDisplay;
    private onButtonHover;
    private onButtonOut;
    private startGame;
    /**
     * Reset game to default state (for testing or new game)
     */
    resetGame(): void;
    /**
     * Load saved game state (for continue functionality)
     */
    loadGame(): void;
}
