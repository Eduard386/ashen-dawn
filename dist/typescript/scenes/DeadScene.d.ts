/**
 * Modern TypeScript DeadScene - Game over screen
 * Handles player death, score display, and game restart
 * Now using pure TypeScript GameDataService instead of LegacyBridge
 */
export declare class DeadScene extends Phaser.Scene {
    private gameDataService;
    private deathMusic?;
    private background?;
    private gameOverText?;
    private statsText?;
    private restartText?;
    private spaceKey?;
    private enterKey?;
    constructor();
    preload(): void;
    create(data?: {
        cause?: string;
        finalStats?: any;
    }): void;
    update(): void;
    private createBackground;
    private playDeathMusic;
    private displayGameOverInfo;
    private displayFinalStats;
    private setupInput;
    private processGameOver;
    private restartGame;
    /**
     * Initialize death scene with specific death data
     */
    initializeDeathScene(deathData?: {
        cause: string;
        finalStats: any;
    }): void;
    /**
     * Display cause of death if provided
     */
    private displayCauseOfDeath;
}
