/**
 * Modern TypeScript DeadScene - Game over screen with legacy assets
 * Handles player death, score display, and game restart
 * Uses EXACT legacy death background and music
 */
export declare class DeadScene extends Phaser.Scene {
    private gameDataService;
    private assetLoader;
    private deathMusic?;
    constructor();
    preload(): void;
    create(): void;
}
