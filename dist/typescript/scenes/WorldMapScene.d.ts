/**
 * TypeScript WorldMapScene - EXACT legacy visual style
 * Matches the original JavaScript WorldMapScene precisely
 */
export declare class WorldMapScene extends Phaser.Scene {
    private bridge;
    private gameData;
    private popupActive;
    private selectedButton;
    private soundtrack?;
    private cursors;
    private spaceKey;
    private popupBackground;
    private popupText;
    private yesButton;
    private noButton;
    private chosenEnemy;
    private readonly enemies_all;
    private readonly soundtrackNames;
    constructor();
    preload(): void;
    create(): void;
    update(): void;
    private playRandomSoundtrack;
    private startRandomEncounterTimer;
    private createPopup;
    private showPopup;
    private hidePopup;
    private handlePopupInput;
    private getLevelConfig;
}
